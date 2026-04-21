const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /notifications?userId=xxx
router.get('/', async (req, res) => {
  const { userId } = req.query;
  try {
    const result = await pool.query(
      'SELECT * FROM "public"."notifications" WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    // Map 'date' column to 'time' for frontend if needed
    const mapped = (result.rows || []).map(n => ({
      ...n,
      time: n.time || n.date || 'Just now'
    }));
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

// PATCH /notifications/:id/read
router.patch('/:id/read', async (req, res) => {
  try {
    await pool.query('UPDATE "public"."notifications" SET is_read = true WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to mark as read.' });
  }
});

module.exports = router;
