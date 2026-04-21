/* global __dirname */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const pool = require('../db');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);


const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });


// POST /site-progress  — upload photo + form data
router.post('/', upload.single('photo'), async (req, res) => {
  // photoUrl can come from body (Supabase) or req.file (local)
  const { projectId, taskId, quantityInstalled, notes, userId, glassCount, shift, workDate } = req.body;
  let photoUrl = req.body.photoUrl; // Direct URL from Supabase (if sent from mobile via other means)

  try {
    if (!photoUrl && req.file) {
      const filename = `progress_${Date.now()}${path.extname(req.file.originalname)}`;
      
      // 1. Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('site-progress')
        .upload(filename, req.file.buffer, {
          contentType: req.file.mimetype,
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: publicUrlData } = supabase.storage
        .from('site-progress')
        .getPublicUrl(filename);
      
      photoUrl = publicUrlData.publicUrl;
    }

    // 1. Fetch milestone_id from the task
    const taskRes = await pool.query('SELECT milestone_id FROM tasks WHERE id = $1', [taskId]);
    const milestoneId = taskRes.rows.length > 0 ? taskRes.rows[0].milestone_id : null;

    // 2. Insert into task_progress_logs
    const result = await pool.query(
      `INSERT INTO task_progress_logs (task_id, milestone_id, created_by, quantity_accomplished, evidence_image_path, remarks, shift, work_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        parseInt(taskId),
        milestoneId,
        parseInt(userId),
        parseInt(quantityInstalled) || parseInt(glassCount) || 0,
        photoUrl,
        notes,
        shift || 'Morning',
        workDate || new Date(),
      ]
    );
    const progress = result.rows[0];



    // Notification handling (Simplified for now)
    await pool.query(
      'INSERT INTO notifications (type, title, message, user_id) VALUES ($1, $2, $3, $4)',
      [
        'success',
        'Task Progress Recorded',
        `Progress of ${quantityInstalled || glassCount} units recorded for task #${taskId}.`,
        userId,
      ]
    );

    res.json(progress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save task progress.' });
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
