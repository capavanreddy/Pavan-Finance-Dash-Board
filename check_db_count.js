const { getDb } = require('./src/lib/db');
const sql = getDb();
async function check() {
  const count = await sql`SELECT COUNT(*) FROM "Task"`;
  console.log("Total Tasks in DB:", count[0].count);
  const tasks = await sql`SELECT id, "taskName", "createdAt" FROM "Task" ORDER BY "createdAt" DESC LIMIT 5`;
  console.log("Recent Tasks:", tasks);
}
check();
