import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) return NextResponse.json({ message: "Email and OTP are required" }, { status: 400 });

    const sql = getDb();

    const tokens = await sql`
      SELECT * FROM "VerificationToken" 
      WHERE identifier = ${email} AND token = ${otp}
      LIMIT 1
    `;

    if (tokens.length === 0) {
      return NextResponse.json({ message: "Invalid or expired OTP" }, { status: 400 });
    }

    const token = tokens[0];
    if (new Date(token.expires) < new Date()) {
      return NextResponse.json({ message: "OTP has expired" }, { status: 400 });
    }

    return NextResponse.json({ message: "OTP verified successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Verify OTP error", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
