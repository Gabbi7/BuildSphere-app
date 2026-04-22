const pool = require('../db');
async function check() {
  const res = await pool.query("SELECT DISTINCT status FROM tasks");
  console.log('Current Task Statuses in DB:', res.rows.map(r => r.status));
  pool.end();
}
check();
