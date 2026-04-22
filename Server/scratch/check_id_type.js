const pool = require('../db');
async function check() {
  const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'id'");
  console.log('ID Column Type:', res.rows[0]);
  pool.end();
}
check();
