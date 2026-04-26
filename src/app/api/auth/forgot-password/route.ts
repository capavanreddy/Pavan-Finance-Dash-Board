import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ message: "Email is required" }, { status: 400 });

    const sql = getDb();

    // --- Migration: Create VerificationToken table if it doesn't exist ---
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS "VerificationToken" (
          identifier TEXT NOT NULL,
          token TEXT NOT NULL,
          expires TIMESTAMP WITH TIME ZONE NOT NULL,
          PRIMARY KEY (identifier, token)
        )
      `;
    } catch (e) {
      console.log("Migration check done");
    }

    // Check if user exists
    const users = await sql`SELECT email FROM "User" WHERE LOWER(email) = LOWER(${email}) LIMIT 1`;
    if (users.length === 0) {
      // Don't reveal if user exists for security, but we'll return success to avoid enumeration
      return NextResponse.json({ message: "If your email is registered, you will receive an OTP." }, { status: 200 });
    }
    
    const dbEmail = users[0].email; // Use the actual email from DB for token storage

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // Clear old tokens and save new one
    await sql`DELETE FROM "VerificationToken" WHERE LOWER(identifier) = LOWER(${dbEmail})`;
    await sql`INSERT INTO "VerificationToken" (identifier, token, expires) VALUES (${dbEmail}, ${otp}, ${expires})`;

    // Send email
    await sendEmail({
      to: dbEmail,
      subject: "Your Password Reset OTP",
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Use the following 6-digit code to proceed:</p>
          <div style="font-size: 32px; font-weight: bold; color: #4f46e5; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({ message: "OTP sent successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Forgot password error", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
