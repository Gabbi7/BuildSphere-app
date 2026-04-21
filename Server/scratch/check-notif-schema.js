const pool = require('../db');
async function check() {
  const table = 'notifications';
  const res = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${table}'`);
  console.log(`--- ${table.toUpperCase()} COLUMNS ---`);
  res.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));
  pool.end();
}
check();
