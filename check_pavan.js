const { getDb } = require('./src/lib/db');

async function checkUser() {
  const sql = getDb();
  const users = await sql`SELECT email, role FROM "User" WHERE email = 'pavanreddy@intellicar.in'`;
  console.log(JSON.stringify(users, null, 2));
  process.exit(0);
}

checkUser().catch(err => {
  console.error(err);
  process.exit(1);
});
