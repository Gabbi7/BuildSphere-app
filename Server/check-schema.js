const pool = require('./db');

async function checkSchema() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'notifications'
      ORDER BY column_name
    `);
    console.log('Columns in notifications table:');
    res.rows.forEach(row => console.log(`- ${row.column_name} (${row.data_type})`));
  } catch (err) {
    console.error('Error checking schema:', err.message);
  } finally {
    pool.end();
  }
}

checkSchema();
