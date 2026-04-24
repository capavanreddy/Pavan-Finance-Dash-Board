import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

const sql = neon(process.env.DATABASE_URL);

async function createTables() {
  try {
    console.log("Connecting to Neon database...");

    // Read the SQL script
    const sqlScript = fs.readFileSync(
      path.join(import.meta.dirname, "create-tables.sql"),
      "utf-8"
    );

    // Split by semicolon and filter empty statements
    const statements = sqlScript
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    console.log(`Executing ${statements.length} SQL statements...`);

    // Execute each statement using sql.query()
    for (const statement of statements) {
      console.log(`\nExecuting:\n${statement.substring(0, 100)}...`);
      await sql.query(statement);
      console.log("✓ Success");
    }

    console.log("\n✅ All tables created successfully!");
  } catch (error) {
    console.error("Error creating tables:", error);
    process.exit(1);
  }
}

createTables();
