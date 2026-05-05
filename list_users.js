const { neon } = require('@neondatabase/serverless');
const DATABASE_URL = "postgresql://neondb_owner:npg_tLglxokS0zd1@ep-ancient-fire-an72s4f8-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function listUsers() {
  const sql = neon(DATABASE_URL);
  const users = await sql`SELECT id, name, email, role, department, "isApproved" FROM "User"`;
  console.log(JSON.stringify(users, null, 2));
  process.exit(0);
}

listUsers().catch(err => {
  console.error(err);
  process.exit(1);
});
