const { neon } = require("@neondatabase/serverless");

async function migrate() {
  const databaseUrl = process.argv[2];
  const sql = neon(databaseUrl);
  console.log("Adding employeeId to User table...");
  try {
    await sql`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "employeeId" TEXT`;
    console.log("Migration successful!");
  } catch (e) {
    console.error("Migration failed:", e);
  } finally {
    process.exit(0);
  }
}

migrate(process.argv[2]);
