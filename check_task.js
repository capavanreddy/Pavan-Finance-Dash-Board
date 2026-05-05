const { neon } = require('@neondatabase/serverless');
const DATABASE_URL = "postgresql://neondb_owner:npg_tLglxokS0zd1@ep-ancient-fire-an72s4f8-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function run() {
  const sql = neon(DATABASE_URL);
  try {
    console.log("Adding isApproved column...");
    await sql`ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "isApproved" BOOLEAN DEFAULT TRUE`;
    console.log("Column added.");
  } catch (err) {
    console.error(err);
  }
}

run();
