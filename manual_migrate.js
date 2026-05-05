const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = "postgresql://neondb_owner:npg_tLglxokS0zd1@ep-ancient-fire-an72s4f8-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function migrate() {
  const sql = neon(DATABASE_URL);
  console.log("Running migrations...");
  
  await sql`
    CREATE TABLE IF NOT EXISTS "PaymentRequest" (
      id SERIAL PRIMARY KEY,
      "requesterId" TEXT NOT NULL,
      "requesterName" TEXT NOT NULL,
      "requesterEmail" TEXT NOT NULL,
      department TEXT NOT NULL,
      "entityName" TEXT NOT NULL,
      "vendorName" TEXT NOT NULL,
      description TEXT NOT NULL,
      "paymentType" TEXT NOT NULL,
      frequency TEXT NOT NULL,
      amount NUMERIC(12, 2) NOT NULL,
      "dueDate" DATE NOT NULL,
      "isNewVendor" BOOLEAN DEFAULT FALSE,
      "kycDocuments" JSONB,
      status TEXT DEFAULT 'PENDING_DEPT',
      "approvedBy" TEXT,
      "approvedByEmail" TEXT,
      "processedBy" TEXT,
      "processedByEmail" TEXT,
      "deptHeadComments" TEXT,
      "financeComments" TEXT,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
  
  await sql`ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "departmentHeadMatrix" TEXT DEFAULT '{}'`;
  
  console.log("Migration complete.");
  process.exit(0);
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
