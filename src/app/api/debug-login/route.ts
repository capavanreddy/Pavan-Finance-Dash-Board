import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    console.log("[DEBUG] Login attempt:", email);

    // Get database connection
    const sql = getDb();
    console.log("[DEBUG] DB connection successful");

    // Query user
    const users = await sql`
      SELECT id, email, name, password, role, department
      FROM "User"
      WHERE LOWER(email) = LOWER(${email})
      LIMIT 1
    `;

    console.log("[DEBUG] User query result:", users.length > 0);

    if (!users || users.length === 0) {
      console.log("[DEBUG] User not found:", email);
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const user = users[0];
    console.log("[DEBUG] User found:", user.email);
    console.log("[DEBUG] Password exists:", !!user.password);

    if (!user.password) {
      console.log("[DEBUG] No password set");
      return NextResponse.json({ error: "No password set" }, { status: 401 });
    }

    // Compare passwords
    console.log("[DEBUG] Comparing password...");
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("[DEBUG] Password valid:", isPasswordValid);

    if (!isPasswordValid) {
      console.log("[DEBUG] Password mismatch");
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    console.log("[DEBUG] Authentication successful");
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("[DEBUG] Error:", error.message);
    console.error("[DEBUG] Full error:", error);
    return NextResponse.json(
      { error: error.message || "Authentication failed" },
      { status: 500 }
    );
  }
}
