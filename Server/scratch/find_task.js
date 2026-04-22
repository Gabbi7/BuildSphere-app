const pool = require('../db');
async function check() {
  const res = await pool.query("SELECT id, title, status FROM tasks WHERE title ILIKE '%bed%'");
  console.log('Search Results:', res.rows);
  pool.end();
}
check();
