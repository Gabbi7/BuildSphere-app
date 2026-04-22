const pool = require('../db');
async function test() {
  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.project_name,
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
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
test();
