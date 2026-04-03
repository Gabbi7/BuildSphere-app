const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /inventory?projectId=1
router.get('/', async (req, res) => {
  const { projectId } = req.query;
  try {
    const result = await pool.query(
      'SELECT id, project_id, item_name, category, current_stock AS quantity, critical_level, price FROM project_inventory_items WHERE project_id = $1 ORDER BY created_at ASC',
      [projectId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch GET error:', err);
    res.status(500).json({ error: 'Failed to fetch inventory.' });
  }
});

// POST /inventory
router.post('/', async (req, res) => {
  const { projectId, itemName, category, quantity, criticalLevel, price } = req.body;
  
  // Parse numbers from strings (e.g. "P100 per bag" -> 100)
  const numQty = parseFloat(String(quantity).replace(/[^0-9.]/g, '')) || 0;
  const numCrit = parseFloat(String(criticalLevel).replace(/[^0-9.]/g, '')) || 0;
  const numPrice = parseFloat(String(price).replace(/[^0-9.]/g, '')) || 0;

  try {
    const result = await pool.query(
      `INSERT INTO project_inventory_items (project_id, item_name, category, current_stock, critical_level, price, created_by, updated_by)
       VALUES ($1,$2,$3,$4,$5,$6,1,1) RETURNING *, current_stock AS quantity`,
      [projectId, itemName, category, numQty, numCrit, numPrice]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Fetch POST error:', err);
    res.status(500).json({ error: 'Failed to add item.' });
  }
});

// PATCH /inventory/:id
router.patch('/:id', async (req, res) => {
  const { itemName, quantity } = req.body;
  const numQty = parseFloat(String(quantity).replace(/[^0-9.]/g, '')) || 0;
  try {
    const result = await pool.query(
      'UPDATE project_inventory_items SET item_name=$1, current_stock=$2, updated_at=NOW() WHERE id=$3 RETURNING *, current_stock AS quantity',
      [itemName, numQty, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Fetch PATCH error:', err);
    res.status(500).json({ error: 'Failed to update item.' });
  }
});

// DELETE /inventory/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM project_inventory_items WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Fetch DELETE error:', err);
    res.status(500).json({ error: 'Failed to delete item.' });
  }
});

module.exports = router;
