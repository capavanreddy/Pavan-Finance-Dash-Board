const { neon } = require("@neondatabase/serverless");

async function migrate() {
  const databaseUrl = "postgresql://postgres.jffxtzvqagjbovblzcme:Sro@0446872@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
  const sql = neon(databaseUrl);
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
