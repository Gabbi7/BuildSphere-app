const pool = require('../db');
async function check() {
  const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'tasks'");
  console.log('Task Table Columns:', res.rows.map(r => r.column_name).join(', '));
  pool.end();
}
check();
