const { neon } = require("@neondatabase/serverless");

async function checkData() {
  const databaseUrl = process.argv[2];
  if (!databaseUrl) {
    console.error("Usage: node scripts/audit_tasks.js <DATABASE_URL>");
    process.exit(1);
  }
  const sql = neon(databaseUrl);
  console.log("Fetching recent tasks for audit...");
  try {
    const tasks = await sql`SELECT id, "taskName", "ownerName", "taskStatus", "completionDate", "completedBy" FROM "Task" ORDER BY "createdAt" DESC LIMIT 10`;
    console.table(tasks);
  } catch (e) {
    console.error("Failed to fetch tasks:", e);
  } finally {
    process.exit(0);
  }
}

checkData();
