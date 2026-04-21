const pool = require('./db');
async function run() {
  try {
    const res = await pool.query("SELECT id, email, first_name, role FROM users");
    console.log('--- USERS ---');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
