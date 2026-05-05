const { neon } = require('@neondatabase/serverless');
const DATABASE_URL = "postgresql://neondb_owner:npg_tLglxokS0zd1@ep-ancient-fire-an72s4f8-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function setupMatrix() {
  const sql = neon(DATABASE_URL);
  const matrix = {
    "Finance": ["pavanreddy@intellicar.in"],
    "Operations": ["pavanreddy@intellicar.in"]
  };
  
  await sql`
    UPDATE "SystemSettings" 
    SET "departmentHeadMatrix" = ${JSON.stringify(matrix)}
  `;
  
  console.log("Matrix updated successfully.");
  process.exit(0);
}

setupMatrix().catch(err => {
  console.error(err);
  process.exit(1);
});
