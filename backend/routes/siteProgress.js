/* global __dirname */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const pool = require('../db');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `site_${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// POST /site-progress  — upload photo + form data
router.post('/', upload.single('photo'), async (req, res) => {
  // photoUrl can come from body (Supabase) or req.file (local)
  const { projectName, partner, milestone, location, notes, userId, glassCount } = req.body;
  let photoUrl = req.body.photoUrl; // Direct URL from Supabase

  if (!photoUrl && req.file) {
    photoUrl = `/uploads/${req.file.filename}`;
  }

  try {
    const result = await pool.query(
      `INSERT INTO site_progress (project_name, partner, milestone, location, notes, photo_url, user_id, glass_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        projectName,
        partner,
        milestone,
        location,
        notes,
        photoUrl,
        userId,
        parseInt(glassCount) || 0,
      ]
    );
    const progress = result.rows[0];

    // Create notification
    await pool.query(
      'INSERT INTO notifications (type, title, message, time, user_id) VALUES ($1, $2, $3, $4, $5)',
      [
        'success',
        'Milestone Update',
        `${projectName} progress updated: ${milestone}.`,
        'Just now',
        userId,
      ]
    );

    res.json(progress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save site progress.' });
  }
});

// GET /site-progress
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM site_progress ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch site progress.' });
  }
});

// GET /site-progress/project/:name
router.get('/project/:name', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM site_progress WHERE project_name = $1 ORDER BY created_at DESC',
      [req.params.name]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch project progress.' });
  }
});

module.exports = router;
