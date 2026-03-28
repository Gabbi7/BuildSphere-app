const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /projects
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
    
    // Map DB fields to frontend expected fields (Flexible for both schemas)
    const mapped = result.rows.map(row => ({
      ...row,
      name: row.name || row.project_name || 'Unnamed Project',
      location: row.location || row.address || 'Unknown Location',
      color: row.color || '#7370FF'
    }));
    
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch projects.' });
  }
});

// GET /projects/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects WHERE id=$1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch project.' });
  }
});

// DELETE /projects/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete project.' });
  }
});

module.exports = router;
