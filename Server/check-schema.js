const pool = require('./db');
async function check() {
  const tasks = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'tasks'");
  console.log('TASKS:', tasks.rows.map(r => r.column_name).join(', '));
  const logs = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'task_progress_logs'");
  console.log('LOGS:', logs.rows.map(r => r.column_name).join(', '));
  pool.end();
}
check();
