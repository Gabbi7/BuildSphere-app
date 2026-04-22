const pool = require('../db');
async function check() {
  try {
    const projects = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'projects'");
    console.log('PROJECTS:', projects.rows.map(r => r.column_name).join(', '));
    const milestones = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'project_milestones'");
    console.log('MILESTONES:', milestones.rows.map(r => r.column_name).join(', '));
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
check();
