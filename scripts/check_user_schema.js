const { neon } = require("@neondatabase/serverless");

async function checkUserSchema() {
  const databaseUrl = process.argv[2];
  const sql = neon(databaseUrl);
  try {
    const res = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'User'`;
    console.log("User Table Columns:");
    console.table(res);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

checkUserSchema(process.argv[2]);
