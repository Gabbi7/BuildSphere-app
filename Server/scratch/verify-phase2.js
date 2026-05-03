const pool = require('../db');

async function verify() {
  try {
    // Check triggers
    const triggers = await pool.query(
      "SELECT tgname, tgrelid::regclass AS tbl FROM pg_trigger WHERE tgname IN ('trg_update_inventory_stock', 'trg_populate_notification_fields')"
    );
    console.log('✅ Triggers:');
    triggers.rows.forEach(t => console.log(`  - ${t.tgname} on ${t.tbl}`));

    // Check notification columns
    const notifCols = await pool.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'notifications' AND column_name IN ('date', 'time', 'reference_url') ORDER BY column_name"
    );
    console.log('✅ Notification columns:', notifCols.rows.map(r => r.column_name).join(', '));

    // Check inventory log columns
    const logCols = await pool.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'project_inventory_logs' AND column_name = 'reference_task_id'"
    );
    console.log('✅ reference_task_id column exists:', logCols.rows.length > 0);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    pool.end();
  }
}

verify();
