const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  await sql`ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'TDB'`;
  console.log('✅ source column added to Task table successfully.');
  process.exit(0);
}

main().catch(e => {
  console.error('❌ Failed:', e.message);
  process.exit(1);
});
