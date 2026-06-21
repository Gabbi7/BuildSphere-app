const express = require('express');
const router = express.Router();
const pool = require('../db');
const { sendPushNotificationToUser } = require('../services/pushNotificationService');
const {
  isDatabaseConnectionError,
  requireSupabaseClient,
  runSupabaseQuery,
} = require('../services/supabaseDataService');

// ── Phase 2 Constants ───────────────────────────────────────────────────
const VALID_ACTION_TYPES = ['RECEIVING', 'CONSUMPTION', 'SPOILAGE', 'ADJUSTMENT'];

let inventorySchemaReady = false;

function parseNumeric(value, fallback = 0) {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed =
    typeof value === 'number'
      ? value
      : Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function mapInventoryItem(row) {
  if (!row) return row;
  return {
    ...row,
    id: Number(row.id),
    project_id: Number(row.project_id),
    quantity: parseNumeric(row.quantity ?? row.current_stock),
    current_stock: parseNumeric(row.current_stock ?? row.quantity),
    critical_level: parseNumeric(row.critical_level),
    price: parseNumeric(row.price),
  };
}

function mapInventoryLog(row) {
  if (!row) return row;
  return {
    ...row,
    id: Number(row.id),
    item_id: Number(row.item_id),
    project_id: row.project_id == null ? null : Number(row.project_id),
    quantity: parseNumeric(row.quantity),
    reference_task_id: row.reference_task_id == null ? null : Number(row.reference_task_id),
  };
}

async function ensureInventoryColumns() {
  if (inventorySchemaReady) return;
  await pool.query(`
    ALTER TABLE project_inventory_items
      ADD COLUMN IF NOT EXISTS unit VARCHAR(30) DEFAULT 'pcs'
  `);
  inventorySchemaReady = true;
}

async function fetchInventoryItemsFromSupabase(projectId) {
  const supabase = requireSupabaseClient();
  const rows = await runSupabaseQuery(
    supabase
      .from('project_inventory_items')
      .select('id, project_id, item_name, category, current_stock, critical_level, price, unit, created_at, updated_at')
      .eq('project_id', String(projectId))
      .order('created_at', { ascending: false })
  );
  return rows.map(mapInventoryItem);
}

async function fetchInventoryLogsFromSupabase({ projectId, search = '', actionType = 'all' }) {
  const supabase = requireSupabaseClient();
  const items = await runSupabaseQuery(
    supabase
      .from('project_inventory_items')
      .select('id, project_id, item_name, category, unit')
      .eq('project_id', String(projectId))
  );

  const itemIds = items.map((item) => item.id);
  if (!itemIds.length) return [];

  let query = supabase
    .from('project_inventory_logs')
    .select('id, item_id, action_type, quantity, notes, reference_task_id, created_at, created_by')
    .in('item_id', itemIds)
    .order('created_at', { ascending: false });

  if (actionType && actionType !== 'all') {
    query = query.eq('action_type', actionType);
  }

  const logs = await runSupabaseQuery(query);
  const itemById = new Map(items.map((item) => [String(item.id), item]));
  const normalizedSearch = String(search || '').trim().toLowerCase();

  return logs
    .map((log) => {
      const item = itemById.get(String(log.item_id)) || {};
      return mapInventoryLog({
        ...log,
        item_name: item.item_name,
        category: item.category,
        unit: item.unit,
        project_id: item.project_id,
      });
    })
    .filter((log) => !normalizedSearch || String(log.item_name || '').toLowerCase().includes(normalizedSearch));
}

// GET /inventory?projectId=1
router.get('/', async (req, res) => {
  const { projectId } = req.query;
  try {
    await ensureInventoryColumns();
    const result = await pool.query(
      `SELECT id, project_id, item_name, category, current_stock AS quantity, critical_level, price, unit, created_at, updated_at
       FROM project_inventory_items
       WHERE project_id = $1
       ORDER BY created_at DESC`,
      [projectId]
    );
    res.json(result.rows);
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      try {
        return res.json(await fetchInventoryItemsFromSupabase(projectId));
      } catch (fallbackError) {
        console.error('INVENTORY_SUPABASE_FALLBACK_FAILED:', fallbackError.message || fallbackError);
      }
    }
    console.error('Fetch GET error:', err);
    res.status(500).json({ error: 'Failed to fetch inventory.' });
  }
});

// GET /inventory/logs?projectId=1&search=&actionType=
router.get('/logs', async (req, res) => {
  const { projectId, search = '', actionType = 'all' } = req.query;
  try {
    await ensureInventoryColumns();
    const params = [projectId];
    let where = 'WHERE i.project_id = $1';

    if (search) {
      params.push(`%${String(search).trim()}%`);
      where += ` AND i.item_name ILIKE $${params.length}`;
    }

    if (actionType && actionType !== 'all') {
      params.push(actionType);
      where += ` AND l.action_type = $${params.length}`;
    }

    const result = await pool.query(
      `SELECT
        l.id,
        l.item_id,
        l.action_type,
        l.quantity,
        l.notes,
        l.reference_task_id,
        l.created_at,
        i.item_name,
        i.category,
        i.unit,
        p.id AS project_id,
        p.project_name,
        p.address AS location,
        u.id AS actor_user_id,
        TRIM(COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, '')) AS actor_name,
        t.title AS task_title
      FROM project_inventory_logs l
      JOIN project_inventory_items i ON i.id = l.item_id
      LEFT JOIN projects p ON p.id = i.project_id
      LEFT JOIN users u ON u.id = l.created_by
      LEFT JOIN tasks t ON t.id = l.reference_task_id
      ${where}
      ORDER BY l.created_at DESC`,
      params
    );

    res.json(result.rows);
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      try {
        return res.json(await fetchInventoryLogsFromSupabase({ projectId, search, actionType }));
      } catch (fallbackError) {
        console.error('INVENTORY_LOGS_SUPABASE_FALLBACK_FAILED:', fallbackError.message || fallbackError);
      }
    }
    console.error('Fetch logs error:', err);
    res.status(500).json({ error: 'Failed to fetch inventory logs.' });
  }
});

// ═════════════════════════════════════════════════════════════════════════
// POST /inventory/:itemId/transaction  — Phase 2 Ledger Transaction
// ═════════════════════════════════════════════════════════════════════════
// This is the ONLY way to modify stock levels.
// The DB trigger `trg_update_inventory_stock` handles current_stock updates.
// ═════════════════════════════════════════════════════════════════════════
router.post('/:itemId/transaction', async (req, res) => {
  const { itemId } = req.params;
  const { action_type, quantity, reference_task_id, notes, created_by } = req.body;

  // ── Validate action_type ──
  if (!action_type || !VALID_ACTION_TYPES.includes(action_type)) {
    return res.status(400).json({
      error: `Invalid action_type. Must be one of: ${VALID_ACTION_TYPES.join(', ')}`,
    });
  }

  // ── Validate quantity ──
  const numQty = Number(quantity);
  if (!numQty || numQty <= 0) {
    return res.status(400).json({ error: 'quantity must be a positive number.' });
  }

  // ── Enforce task-linking for CONSUMPTION ──
  if (action_type === 'CONSUMPTION' && !reference_task_id) {
    return res.status(400).json({
      error: 'reference_task_id is REQUIRED when action_type is CONSUMPTION.',
    });
  }

  try {
    // Verify item exists
    const itemCheck = await pool.query(
      'SELECT id, item_name, project_id, current_stock, critical_level FROM project_inventory_items WHERE id = $1',
      [itemId]
    );
    if (itemCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found.' });
    }
    const item = itemCheck.rows[0];

    // Insert the transaction log — the DB trigger handles stock update
    const logResult = await pool.query(
      `INSERT INTO project_inventory_logs (item_id, action_type, quantity, reference_task_id, notes, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [itemId, action_type, numQty, reference_task_id || null, notes || null, created_by || 1]
    );

    // Refetch updated item to get the new stock level (updated by trigger)
    const updatedItem = await pool.query(
      'SELECT id, item_name, current_stock AS quantity, critical_level, unit FROM project_inventory_items WHERE id = $1',
      [itemId]
    );
    const refreshedItem = updatedItem.rows[0];

    // ── Low Stock Alert ──
    if (refreshedItem && Number(refreshedItem.quantity) <= Number(refreshedItem.critical_level)) {
      const projectRes = await pool.query(
        'SELECT project_in_charge_id, project_name FROM projects WHERE id = $1',
        [item.project_id]
      );
      if (projectRes.rows.length > 0) {
        const proj = projectRes.rows[0];
        if (proj.project_in_charge_id) {
          // Phase 2: Use sendPushNotificationToUser (handles both Push and DB persistence)
          await sendPushNotificationToUser(
            proj.project_in_charge_id,
            'Low Stock Alert ⚠️',
            `Item '${item.item_name}' in ${proj.project_name || 'Project'} is at ${refreshedItem.quantity} ${refreshedItem.unit || 'pcs'} (critical: ${refreshedItem.critical_level}).`,
            {
              type: 'inventory_low_stock',
              reference_type: 'inventory',
              reference_id: String(itemId),
              screen: 'Inventory',
              project_id: String(item.project_id),
              inventory_item_id: String(itemId),
              item_id: String(itemId),
            }
          );
        }
      }
    }

    res.status(201).json({
      transaction: logResult.rows[0],
      item: refreshedItem,
    });
  } catch (err) {
    console.error('Transaction error:', err);
    res.status(500).json({ error: 'Failed to process inventory transaction.', detail: err.message });
  }
});

// POST /inventory  — Add new inventory item (unchanged, still allowed)
router.post('/', async (req, res) => {
  const { projectId, itemName, category, quantity, criticalLevel, price, unit, createdBy } = req.body;
  
  // Parse numbers from strings (e.g. "P100 per bag" -> 100)
  const numQty = parseFloat(String(quantity).replace(/[^0-9.]/g, '')) || 0;
  const numCrit = parseFloat(String(criticalLevel).replace(/[^0-9.]/g, '')) || 0;
  const numPrice = parseFloat(String(price).replace(/[^0-9.]/g, '')) || 0;

  try {
    await ensureInventoryColumns();
    const result = await pool.query(
      `INSERT INTO project_inventory_items (project_id, item_name, category, current_stock, critical_level, price, unit, created_by, updated_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$8) RETURNING *, current_stock AS quantity`,
      [projectId, itemName, category, numQty, numCrit, numPrice, unit || 'pcs', createdBy || 1]
    );
    const item = result.rows[0];

    // Log the initial stock as a RECEIVING transaction
    await pool.query(
      `INSERT INTO project_inventory_logs (item_id, action_type, quantity, notes, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [item.id, 'RECEIVING', numQty, 'Initial stock — item added via mobile inventory.', createdBy || 1]
    );
    res.json(item);
  } catch (err) {
    console.error('Fetch POST error:', err);
    res.status(500).json({ error: 'Failed to add item.' });
  }
});

// PATCH /inventory/:id  — Update item metadata ONLY (name, category, etc.)
// NOTE: Stock quantity updates are NO LONGER allowed here. Use POST /:itemId/transaction.
router.patch('/:id', async (req, res) => {
  res.status(405).json({
    error: 'Inventory items cannot be edited after saving. Add a new item or record an inventory log instead.',
  });
});

// DELETE /inventory/:id
router.delete('/:id', async (req, res) => {
  const { deletedBy } = req.body || {};
  try {
    const itemResult = await pool.query('SELECT id, current_stock FROM project_inventory_items WHERE id = $1', [req.params.id]);
    const item = itemResult.rows[0];

    if (item) {
      await pool.query(
        `INSERT INTO project_inventory_logs (item_id, action_type, quantity, notes, created_by, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [item.id, 'ADJUSTMENT', item.current_stock || 0, 'Item deleted from inventory.', deletedBy || 1]
      );
    }

    await pool.query('DELETE FROM project_inventory_items WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Fetch DELETE error:', err);
    res.status(500).json({ error: 'Failed to delete item.' });
  }
});

module.exports = router;
