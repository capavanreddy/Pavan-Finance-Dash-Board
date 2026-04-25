import { NextResponse, NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { getServerSession } from "@/lib/session";


export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getDb();
    const { id } = await params;
    const body = await req.json();
    const { comment } = body;

    const session = await getServerSession();
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get user email before deleting
    const users = await sql`SELECT email, name FROM "User" WHERE id = ${id}`;
    if (users.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    const targetUser = users[0];

    // Send Rejection Email
    try {
      const { sendEmail } = await import("@/lib/email");
      await sendEmail({
        to: targetUser.email,
        subject: "Access Request Rejected - Task Manager",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background: #ef4444; color: white; padding: 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">Access Rejected</h1>
            </div>
            <div style="padding: 24px; color: #1e293b; line-height: 1.6;">
              <p>Hello <strong>${targetUser.name || 'User'}</strong>,</p>
              <p>Your request for access to the <strong>Intellicar Finance Task Manager</strong> has been rejected by the administrator.</p>
              <div style="background: #f8fafc; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-weight: 600; color: #ef4444;">Reason for Rejection:</p>
                <p style="margin: 8px 0 0 0; color: #475569;">${comment || "No specific reason provided."}</p>
              </div>
              <p>If you believe this is a mistake, please contact the administrator directly.</p>
              <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
              <p style="font-size: 12px; color: #64748b; text-align: center;">This is an automated notification. Please do not reply to this email.</p>
            </div>
          </div>
        `
      });
    } catch (mailErr) {
      console.error("FAILED TO SEND REJECTION MAIL:", mailErr);
      // We continue with deletion even if mail fails, but log it
    }

    await sql`DELETE FROM "User" WHERE id = ${id}`;

    return NextResponse.json({ message: "Request rejected and user removed" });
  } catch (error: any) {
    console.error("REJECT ERROR:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
