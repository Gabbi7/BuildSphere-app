const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /inventory?projectId=1
router.get('/', async (req, res) => {
  const { projectId } = req.query;
  try {
    const result = await pool.query(
      'SELECT * FROM inventory WHERE project_id = $1 ORDER BY created_at ASC',
      [projectId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inventory.' });
  }
});

// POST /inventory
router.post('/', async (req, res) => {
  const { projectId, itemName, category, quantity, criticalLevel, price, unit } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO inventory (project_id, item_name, category, quantity, critical_level, price, unit)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [projectId, itemName, category, quantity, criticalLevel, price, unit]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add item.' });
  }
});

// PATCH /inventory/:id
router.patch('/:id', async (req, res) => {
  const { itemName, quantity } = req.body;
  try {
    const result = await pool.query(
      'UPDATE inventory SET item_name=$1, quantity=$2 WHERE id=$3 RETURNING *',
      [itemName, quantity, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update item.' });
  }
});

// DELETE /inventory/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM inventory WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete item.' });
  }
});

module.exports = router;
