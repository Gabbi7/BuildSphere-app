const pool = require('./db');
async function run() {
  try {
    const res = await pool.query("SELECT * FROM tasks LIMIT 1");
    if (res.rows.length > 0) {
      console.log('COLUMNS:', Object.keys(res.rows[0]));
    } else {
      console.log('No rows in tasks table to inspect.');
      // Fallback to information_schema but print better
      const columns = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'tasks'");
      console.log('COLUMNS:', columns.rows.map(c => c.column_name));
    }
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
