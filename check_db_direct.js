const postgres = require('postgres');
const sql = postgres("postgresql://neondb_owner:npg_tLglxokS0zd1@ep-summer-waterfall-anm80053-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");

async function check() {
  try {
    const count = await sql`SELECT COUNT(*) FROM "Task"`;
    console.log("Total Tasks in DB:", count[0].count);
    const tasks = await sql`SELECT id, "taskName", "createdAt" FROM "Task" ORDER BY "createdAt" DESC LIMIT 10`;
    console.log("Recent Tasks:", tasks);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
