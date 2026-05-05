const { neon } = require("@neondatabase/serverless");
require("dotenv").config();

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }
  const sql = neon(databaseUrl);
  console.log("Running manual migration...");
  try {
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
