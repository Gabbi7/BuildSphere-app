const express = require('express');
const router = express.Router();
const pool = require('../db');
let inventorySchemaReady = false;

async function ensureInventoryColumns() {
  if (inventorySchemaReady) return;
  await pool.query(`
    ALTER TABLE project_inventory_items
      ADD COLUMN IF NOT EXISTS unit VARCHAR(30) DEFAULT 'pcs'
  `);
  inventorySchemaReady = true;
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
        l.created_at,
        i.item_name,
        i.category,
        i.unit,
        p.id AS project_id,
        p.project_name,
        p.address AS location,
        u.id AS actor_user_id,
        TRIM(COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, '')) AS actor_name
      FROM project_inventory_logs l
      JOIN project_inventory_items i ON i.id = l.item_id
      LEFT JOIN projects p ON p.id = i.project_id
      LEFT JOIN users u ON u.id = l.created_by
      ${where}
      ORDER BY l.created_at DESC`,
      params
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Fetch logs error:', err);
    res.status(500).json({ error: 'Failed to fetch inventory logs.' });
  }
});

// POST /inventory/logs
router.post('/logs', async (req, res) => {
  const { itemId, actionType, quantity, notes, createdBy } = req.body;

  if (!itemId || !actionType || quantity === undefined || quantity === null || !createdBy) {
    return res.status(400).json({ error: 'itemId, actionType, quantity, and createdBy are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO project_inventory_logs (item_id, action_type, quantity, notes, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [itemId, actionType, quantity, notes || null, createdBy]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create log error:', err);
    res.status(500).json({ error: 'Failed to create inventory log.' });
  }
});

// POST /inventory
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

    await pool.query(
      `INSERT INTO project_inventory_logs (item_id, action_type, quantity, notes, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [item.id, 'add_item', numQty, 'Item added via mobile inventory.', createdBy || 1]
    );
    res.json(item);
  } catch (err) {
    console.error('Fetch POST error:', err);
    res.status(500).json({ error: 'Failed to add item.' });
  }
});

// PATCH /inventory/:id
router.patch('/:id', async (req, res) => {
  const { itemName, quantity, updatedBy, notes } = req.body;
  const numQty = parseFloat(String(quantity).replace(/[^0-9.]/g, '')) || 0;
  try {
    await ensureInventoryColumns();
    const result = await pool.query(
      'UPDATE project_inventory_items SET item_name=$1, current_stock=$2, updated_at=NOW() WHERE id=$3 RETURNING *, current_stock AS quantity',
      [itemName, numQty, req.params.id]
    );
    const item = result.rows[0];

    await pool.query(
      `INSERT INTO project_inventory_logs (item_id, action_type, quantity, notes, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [item.id, 'update_stock', numQty, notes || 'Stock updated via mobile inventory.', updatedBy || 1]
    );

    // Notification Trigger: Low Stock
    if (numQty <= item.critical_level) {
      // Find project PIC
      const projectRes = await pool.query('SELECT project_in_charge_id, name FROM projects WHERE id = $1', [item.project_id]);
      if (projectRes.rows.length > 0) {
        const proj = projectRes.rows[0];
        await pool.query(
          'INSERT INTO notifications (type, title, message, time, user_id) VALUES ($1, $2, $3, $4, $5)',
          [
            'alert',
            'Low Stock Alert',
            `Item '${item.item_name}' in ${proj.name || 'Project'} is low (${numQty} left).`,
            'Just now',
            proj.project_in_charge_id,
          ]
        );
      }
    }

    res.json(item);
  } catch (err) {
    console.error('Fetch PATCH error:', err);
    res.status(500).json({ error: 'Failed to update item.' });
  }
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
        [item.id, 'delete_item', item.current_stock || 0, 'Item deleted from inventory.', deletedBy || 1]
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
