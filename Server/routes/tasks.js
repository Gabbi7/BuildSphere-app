const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /tasks?userId=xxx
router.get('/', async (req, res) => {
  const { userId } = req.query;
  try {
    // In the screenshot, tasks has 'project' (text) and 'user_id' directly.
    const result = await pool.query(
      `SELECT t.*, p.project_name as project 
       FROM "public"."tasks" t
       LEFT JOIN "public"."projects" p ON t.project_id = p.id
       WHERE t.assigned_to = $1 AND t.deleted_at IS NULL
       ORDER BY t.created_at DESC`,
      [userId]
    );

    // Normalize data for frontend (e.g., status mapping)
    const normalized = result.rows.map(row => {
      let status = (row.status || '').toLowerCase().replace('_', '-');
      // Normalize 'todo' to 'pending' to match mobile frontend mapping
      if (status === 'todo') status = 'pending';

      return {
        ...row,
        status,
        due_date: row.due_date ? new Date(row.due_date).toLocaleDateString() : row.due_date
      };
    });

    res.json(normalized);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
});

// GET /tasks/:taskId/progress
router.get('/:taskId/progress', async (req, res) => {
  const { taskId } = req.params;
  console.log(`FETCHING PROGRESS FOR TASK: ${taskId}`);
  try {
    const result = await pool.query(
      `SELECT 
        tpl.*, 
        u.first_name, 
        u.last_name, 
        u.role 
       FROM task_progress_logs tpl
       JOIN users u ON tpl.created_by = u.id
       WHERE tpl.task_id = $1
       ORDER BY tpl.created_at DESC`,
      [taskId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch task progress.' });
  }
});

// GET /tasks/project/:projectId

router.get('/project/:projectId', async (req, res) => {
  const { projectId } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, title FROM tasks WHERE project_id = $1 AND deleted_at IS NULL ORDER BY title ASC',
      [projectId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch project tasks.' });
  }
});



// POST /tasks
router.post('/', async (req, res) => {
  const {
    title,
    project_id,
    due_date,
    status,
    priority,
    user_id,
    description,
    phase,
    milestone,
    start_date,
  } = req.body;

  if (!title || !project_id || !due_date || !user_id) {
    return res.status(400).json({ error: 'Title, project ID, due date, and assigned user are required.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO tasks (title, project_id, due_date, status, priority, assigned_to, description, phase, milestone, start_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [
        title,
        project_id,
        due_date,
        status || 'pending',
        priority || 'medium',
        user_id, // Map frontend user_id to assigned_to
        description,
        phase,
        milestone,
        start_date,
      ]
    );
    const task = result.rows[0];
    const notifTitle = 'Task Assignment';
    const notifMessage = `New task assigned: '${title}' due ${due_date}.`;

    // Create database notification
    await pool.query(
      'INSERT INTO "public"."notifications" (type, title, message, user_id) VALUES ($1, $2, $3, $4)',
      ['update', notifTitle, notifMessage, user_id]
    );

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create task.' });
  }
});


// PATCH /tasks/:id
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  console.log(`UPDATING TASK ${id}:`, updates);

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No fields provided for update.' });
  }

  const keys = Object.keys(updates);
  const values = Object.values(updates);
  
  const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
  
  try {
    const result = await pool.query(
      `UPDATE "public"."tasks" SET ${setClause}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING *`,
      [...values, id]
    );
    
    if (result.rows.length === 0) {
      console.log(`TASK ${id} NOT FOUND`);
      return res.status(404).json({ error: 'Task not found.' });
    }
    
    console.log(`TASK ${id} UPDATED SUCCESSFULLY`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('DATABASE UPDATE ERROR:', err.message);
    res.status(500).json({ error: 'Failed to update task: ' + err.message });
  }
});

module.exports = router;

