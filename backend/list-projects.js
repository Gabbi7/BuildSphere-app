const pool = require('./db');
async function run() {
  try {
    const res = await pool.query("SELECT id, project_name FROM projects");
    console.log('--- PROJECTS ---');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
