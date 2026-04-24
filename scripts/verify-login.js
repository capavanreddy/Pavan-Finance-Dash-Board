import { neon } from "@neondatabase/serverless";
import bcrypt from "bcrypt";

const sql = neon(process.env.DATABASE_URL);

async function verifyLogin() {
  try {
    console.log("Testing login with email: pavanreddy@intellicar.in");

    // Query the user using template tag
    const rows = await sql`
      SELECT id, email, password, name, role
      FROM "User"
      WHERE email = 'pavanreddy@intellicar.in'
    `;

    console.log("\nUser query result:", rows.length, "rows found");

    if (rows.length === 0) {
      console.log("ERROR: User not found in database");
      return;
    }

    const user = rows[0];
    console.log("\nUser found:");
    console.log("  Email:", user.email);
    console.log("  Name:", user.name);
    console.log("  Role:", user.role);
    console.log("  Password hash exists:", !!user.password);
    console.log("  Password hash:", user.password ? user.password.substring(0, 20) + "..." : "NONE");

    // Test password verification
    const testPassword = "Sro@0446872";
    console.log("\nTesting password verification with:", testPassword);
    
    const isPasswordValid = await bcrypt.compare(testPassword, user.password);
    console.log("Password matches:", isPasswordValid);

    if (isPasswordValid) {
      console.log("\n✅ LOGIN SHOULD WORK - User and password are correct!");
    } else {
      console.log("\n❌ PASSWORD MISMATCH - The password hash doesn't match the provided password");
    }
  } catch (error) {
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
  }
}

verifyLogin();
