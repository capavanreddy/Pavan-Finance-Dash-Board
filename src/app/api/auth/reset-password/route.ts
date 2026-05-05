import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const sql = getDb();
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const users = await sql`
      SELECT id FROM "User" 
      WHERE "resetToken" = ${token} 
      AND "resetExpires" > NOW() 
      LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 });
    }

    const userId = users[0].id;
    const hashedPassword = await bcrypt.hash(password, 10);

    await sql`
      UPDATE "User" 
      SET password = ${hashedPassword}, 
          "resetToken" = NULL, 
          "resetExpires" = NULL,
          "updatedAt" = NOW()
      WHERE id = ${userId}
    `;

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error: any) {
    console.error("Auth reset password error", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
