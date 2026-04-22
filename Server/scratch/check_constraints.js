const pool = require('../db');
async function check() {
  const res = await pool.query(`
    SELECT
        conname AS constraint_name,
        contype AS constraint_type,
        pg_get_constraintdef(c.oid) AS constraint_definition
    FROM
        pg_constraint c
    JOIN
        pg_namespace n ON n.oid = c.connamespace
    WHERE
        conrelid = '"public"."tasks"'::regclass;
  `);
  console.log('Task Constraints:', res.rows);
  pool.end();
}
check();
