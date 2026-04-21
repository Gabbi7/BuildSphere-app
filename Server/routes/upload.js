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
    cb(null, `user_${req.params.id}_${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB max

// POST /upload/:id/photo
router.post('/:id/photo', upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
  try {
    const imageUrl = `/uploads/${req.file.filename}`;
    await pool.query('UPDATE users SET profile_picture_url = $1 WHERE id = $2', [
      imageUrl,
      req.params.id,
    ]);
    res.json({ imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save photo.' });
  }
});

module.exports = router;
