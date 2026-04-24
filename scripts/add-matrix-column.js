const { neon } = require("@neondatabase/serverless");

async function addMatrixColumn() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    // Add matrixModuleAccess column if it doesn't exist
    await sql`
      ALTER TABLE "SystemSettings" 
      ADD COLUMN IF NOT EXISTS "matrixModuleAccess" TEXT DEFAULT ''
    `;
    console.log("Successfully added matrixModuleAccess column");
    
    // Also add matrixAllocationAccess column if needed
    await sql`
      ALTER TABLE "SystemSettings" 
      ADD COLUMN IF NOT EXISTS "matrixAllocationAccess" TEXT DEFAULT ''
    `;
    console.log("Successfully added matrixAllocationAccess column");
    
  } catch (error) {
    console.error("Error adding columns:", error);
  }
}

addMatrixColumn();
