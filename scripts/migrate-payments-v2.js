const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = "postgresql://neondb_owner:npg_tLglxokS0zd1@ep-ancient-fire-an72s4f8-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function migrate() {
  const sql = neon(DATABASE_URL);
  console.log("Running migration for Payments improvements...");

  try {
    // Add columns to PaymentOccurrence
    await sql`
      ALTER TABLE "PaymentOccurrence" 
      ADD COLUMN IF NOT EXISTS "isCancelled" BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS "cancelledReason" TEXT,
      ADD COLUMN IF NOT EXISTS "deleteRequested" BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS "deleteRequestReason" TEXT,
      ADD COLUMN IF NOT EXISTS "deleteRequestedBy" TEXT;
    `;
    console.log("Successfully added columns to PaymentOccurrence.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    process.exit();
  }
}

migrate();
