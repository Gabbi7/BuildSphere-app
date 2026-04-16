const pool = require('./db');
async function run() {
  try {
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'projects'");
    console.log('--- PROJECTS SCHEMA ---');
    res.rows.forEach(row => console.log(`${row.column_name}: ${row.data_type}`));
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
