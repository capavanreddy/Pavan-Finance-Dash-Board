import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const taskTypes = [
  "Accounts Receivable",
  "Accounts Payable",
  "MIS",
  "Inventory",
  "Banking & Treasury",
  "Customer Reconciliations",
  "Vendor Reconciliation",
  "Reporting",
  "Financial Audit",
  "Tax Audit",
  "Other Audits",
  "Assements & Notices",
  "Month Closure",
  "Corporate Taxation",
  "GST",
  "Employee Laws",
  "Due Diligence",
  "Presentations & Trainings",
  "Other Reconciallitions",
  "MCA Filings",
  "Miscellaneous Activities",
  "Month End Billing",
  "Credit Cards & Debt",
  "Customizations / Automations"
].join(",");

async function updateTaskTypes() {
  try {
    const existing = await sql`SELECT id FROM "SystemSettings" LIMIT 1`;

    if (existing.length === 0) {
      await sql`INSERT INTO "SystemSettings" ("masterTaskTypes") VALUES (${taskTypes})`;
      console.log("Inserted new SystemSettings with task types.");
    } else {
      await sql`UPDATE "SystemSettings" SET "masterTaskTypes" = ${taskTypes}`;
      console.log("Updated masterTaskTypes successfully.");
    }

    const verify = await sql`SELECT "masterTaskTypes" FROM "SystemSettings" LIMIT 1`;
    console.log("Updated list:", verify[0].masterTaskTypes);
  } catch (err) {
    console.error("Error updating task types:", err.message);
  }
}

updateTaskTypes();
