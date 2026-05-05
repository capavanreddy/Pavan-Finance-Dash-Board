const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = "postgresql://neondb_owner:npg_tLglxokS0zd1@ep-ancient-fire-an72s4f8-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function verify() {
  const sql = neon(DATABASE_URL);
  console.log("Verifying PaymentRequest...");
  const requests = await sql`SELECT * FROM "PaymentRequest" ORDER BY "createdAt" DESC LIMIT 1`;
  console.log("Latest Request:", JSON.stringify(requests[0], null, 2));

  console.log("\nVerifying PaymentOccurrence...");
  const occurrences = await sql`
    SELECT o.*, t."paymentDescription" 
    FROM "PaymentOccurrence" o
    JOIN "PaymentTemplate" t ON o."templateId" = t.id
    ORDER BY o.id DESC LIMIT 1
  `;
  console.log("Latest Occurrence:", JSON.stringify(occurrences[0], null, 2));
  
  process.exit(0);
}

verify().catch(err => {
  console.error(err);
  process.exit(1);
});
