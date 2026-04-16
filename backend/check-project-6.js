const pool = require('./db');
async function run() {
  try {
    const projectId = 6;
    const projectName = 'Test Project 1';

    console.log(`\n🔍 AUDITING DATA FOR: [${projectName}] (ID: ${projectId})`);

    // 1. Check Inventory
    const inv = await pool.query("SELECT item_name, current_stock, category FROM project_inventory_items WHERE project_id = $1", [projectId]);
    console.log('\n📦 INVENTORY:');
    if (inv.rows.length === 0) console.log('   (Empty)');
    else console.table(inv.rows);
    
    // 2. Check Tasks
    const tasks = await pool.query("SELECT title, status, priority, due_date FROM tasks WHERE project_id = $1", [projectId]);
    console.log('\n📝 TASKS:');
    if (tasks.rows.length === 0) console.log('   (Empty)');
    else console.table(tasks.rows);

    // 3. Check Site Progress (Uses project_name string in this schema)
    const progress = await pool.query("SELECT milestone, glass_count, notes, created_at FROM site_progress WHERE project_name = $1", [projectName]);
    console.log('\n🏗️ SITE PROGRESS (Glass Audits):');
    if (progress.rows.length === 0) console.log('   (Empty)');
    else console.table(progress.rows);

  } catch (err) {
    console.error('❌ ERROR:', err.message);
  } finally {
    pool.end();
  }
}
run();
