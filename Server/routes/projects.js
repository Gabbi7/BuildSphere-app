const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /projects
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.*,
        COALESCE(
          (SELECT 
            CASE 
              WHEN COUNT(*) = 0 THEN 0 
              ELSE ROUND((COUNT(*) FILTER (WHERE 
                (pm.has_quantity = true AND pm.current_quantity >= pm.target_quantity) OR
                (pm.has_quantity = false AND EXISTS (SELECT 1 FROM tasks t WHERE t.milestone_id = pm.id AND t.status = 'completed'))
              )::numeric / COUNT(*)) * 100) 
            END
           FROM project_milestones pm 
           WHERE pm.project_id = p.id),
          0
        ) as progress
      FROM projects p
      ORDER BY p.created_at DESC
    `);
    
    // Map DB fields to frontend expected fields
    const mapped = result.rows.map(row => ({
      ...row,
      name: row.name || row.project_name || 'Unnamed Project',
      location: row.location || row.address || 'Unknown Location',
      color: row.color || '#7370FF',
      progress: parseInt(row.progress) || 0
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
    const projectResult = await pool.query('SELECT * FROM projects WHERE id=$1', [req.params.id]);
    if (projectResult.rows.length === 0) return res.status(404).json({ error: 'Project not found.' });
    
    const project = projectResult.rows[0];

    // Calculate Progress dynamically from Milestones (matching web logic)
    const milestoneStats = await pool.query(
      `SELECT 
        COUNT(*) as total, 
        COUNT(*) FILTER (WHERE 
          (has_quantity = true AND current_quantity >= target_quantity) OR
          (has_quantity = false AND EXISTS (SELECT 1 FROM tasks t WHERE t.milestone_id = project_milestones.id AND t.status = 'completed'))
        ) as completed 
       FROM project_milestones 
       WHERE project_id = $1`,
      [req.params.id]
    );

    const totalMilestones = parseInt(milestoneStats.rows[0].total) || 0;
    const completedMilestones = parseInt(milestoneStats.rows[0].completed) || 0;
    const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;


    res.json({
      ...project,
      name: project.name || project.project_name,
      location: project.location || project.address,
      progress: progress 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch project.' });
  }
});


// UPDATE /projects/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { project_name, address, status, start_date, end_date, budget_for_materials, description } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE projects 
       SET project_name = $1, address = $2, status = $3, start_date = $4, end_date = $5, 
           budget_for_materials = $6, description = $7, updated_at = NOW()
       WHERE id = $8 RETURNING *`,
      [project_name, address, status, start_date, end_date, budget_for_materials, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update project.' });
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
