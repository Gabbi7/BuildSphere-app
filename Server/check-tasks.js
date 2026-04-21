const pool = require('./db');

async function checkTasksSchema() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'tasks'
    `);
    console.log('--- TASKS TABLE SCHEMA ---');
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

checkTasksSchema();
