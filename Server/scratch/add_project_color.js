const pool = require('../db');
async function run() {
  try {
    await pool.query('ALTER TABLE "public"."projects" ADD COLUMN IF NOT EXISTS "color" TEXT DEFAULT \'#7370FF\'');
    console.log('✅ Column color added to projects table');
  } catch (err) {
    console.error('Error adding column:', err);
  } finally {
    pool.end();
  }
}
run();
