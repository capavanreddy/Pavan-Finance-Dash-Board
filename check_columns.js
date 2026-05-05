const { getDb } = require('./src/lib/db');

async function checkColumns() {
  try {
    const sql = getDb();
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Task'
    `;
    console.log(JSON.stringify(columns, null, 2));
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

checkColumns();
