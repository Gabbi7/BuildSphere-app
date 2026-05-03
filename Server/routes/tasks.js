const express = require('express');
const router = express.Router();
const pool = require('../db');
const { sendPushNotificationToUser } = require('../services/pushNotificationService');

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
    created_by,
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
    const projectName = (await pool.query('SELECT project_name FROM projects WHERE id = $1', [project_id])).rows[0]?.project_name || 'this project';

    // Phase 2: Use sendPushNotificationToUser which handles both Push and DB persistence
    // This avoids duplicate entries and ensures reference_url is set.
    await sendPushNotificationToUser(
      user_id,
      'New Task Assigned',
      `You have been assigned a new task: '${title}' for ${projectName}.`,
      {
        type: 'INFO',
        screen: 'TaskDetails',
        task_id: String(task.id),
        project_id: String(project_id),
      }
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
    const currentTaskResult = await pool.query(
      'SELECT id, title, status, assigned_to, project_id, updated_by FROM "public"."tasks" WHERE id = $1',
      [id]
    );
    const currentTask = currentTaskResult.rows[0];

    const result = await pool.query(
      `UPDATE "public"."tasks" SET ${setClause}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING *`,
      [...values, id]
    );
    
    if (result.rows.length === 0) {
      console.log(`TASK ${id} NOT FOUND`);
      return res.status(404).json({ error: 'Task not found.' });
    }
    
    console.log(`TASK ${id} UPDATED SUCCESSFULLY`);

    const updatedTask = result.rows[0];
    const actorId = updates.updated_by || currentTask?.updated_by;

    if (
      currentTask &&
      updates.status &&
      String(updates.status).toLowerCase() !== String(currentTask.status || '').toLowerCase() &&
      currentTask.assigned_to &&
      String(actorId || '') !== String(currentTask.assigned_to)
    ) {
      await sendPushNotificationToUser(
        currentTask.assigned_to,
        'Task Status Updated',
        `Task "${currentTask.title}" is now ${updates.status}.`,
        {
          type: 'task_status_updated',
          screen: 'TaskDetails',
          task_id: String(updatedTask.id),
          project_id: String(updatedTask.project_id || currentTask.project_id || ''),
          status: updates.status,
        }
      );
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('DATABASE UPDATE ERROR:', err.message);
    res.status(500).json({ error: 'Failed to update task: ' + err.message });
  }
});

module.exports = router;

