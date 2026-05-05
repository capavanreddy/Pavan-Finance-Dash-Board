const { neon } = require("@neondatabase/serverless");

async function migrate() {
  const databaseUrl = process.argv[2];
  if (!databaseUrl) {
    console.error("Usage: node scripts/migrate.js <DATABASE_URL>");
    process.exit(1);
  }
  const sql = neon(databaseUrl);
  console.log("Running manual migration...");
  try {
    // Run them individually to be safe
    await sql`ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "completedSubmissionAt" TIMESTAMP(3)`;
    await sql`ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "reviewedSubmissionAt" TIMESTAMP(3)`;
    await sql`ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "processedSubmissionAt" TIMESTAMP(3)`;
    await sql`ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "completedBy" TEXT`;
    await sql`ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "reviewedBy" TEXT`;
    await sql`ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "processedBy" TEXT`;
    console.log("Migration successful!");
  } catch (e) {
    console.error("Migration failed:", e);
  } finally {
    process.exit(0);
  }
}

migrate();
