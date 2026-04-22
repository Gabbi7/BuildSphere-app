const pool = require('../db');
async function check() {
  try {
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'site_progress'");
    console.log('SITE_PROGRESS:', res.rows.map(r => r.column_name).join(', '));
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
check();
