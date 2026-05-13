
const { neon } = require('@neondatabase/serverless');

async function testDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set in environment");
    return;
  }

  try {
    const sql = neon(url);
    console.log("Attempting to connect to database...");
    const result = await sql`SELECT 1 as connected`;
    console.log("Database connection successful:", result);
    
    const userCount = await sql`SELECT COUNT(*) FROM "User"`;
    console.log("User count:", userCount[0].count);
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
}

testDb();
