const pool = require('../db');
async function check() {
  try {
    const res = await pool.query("SELECT view_definition FROM information_schema.views WHERE table_name = 'site_progress'");
    if (res.rows.length > 0) {
      console.log('SITE_PROGRESS IS A VIEW:', res.rows[0].view_definition);
    } else {
      console.log('SITE_PROGRESS IS A TABLE');
    }
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
check();
