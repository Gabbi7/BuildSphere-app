const pool = require('../db');
async function run() {
  try {
    await pool.query('ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "push_token" TEXT');
    console.log('✅ Column push_token added to users table');
  } catch (err) {
    console.error('Error adding column:', err);
  } finally {
    pool.end();
  }
}
run();
