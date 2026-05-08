import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { reason } = await req.json();
    const sql = getDb();
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await sql`
      UPDATE "PaymentOccurrence"
      SET 
        "deleteRequested" = TRUE,
        "deleteRequestReason" = ${reason},
        "deleteRequestedBy" = ${session.user.name || session.user.email},
        "updatedAt" = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Payment record not found in database" }, { status: 404 });
    }

    // Email Admin
    try {
      await sendEmail({
        to: "pavanreddy@intellicar.in",
        subject: `Payment Deletion Request: ${result[0].vendorName}`,
        html: `
          <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #ef4444;">Payment Deletion Request</h2>
            <p>A deletion request has been submitted for a payment record.</p>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
              <p><strong>Vendor:</strong> ${result[0].vendorName}</p>
              <p><strong>Description:</strong> ${result[0].paymentDescription}</p>
              <p><strong>Due Date:</strong> ${(() => {
                const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
                const d = new Date(result[0].dueDate);
                return `${String(d.getDate()).padStart(2, '0')}-${MONTHS[d.getMonth()]}-${d.getFullYear()}`;
              })()}</p>
              <p><strong>Requested By:</strong> ${session.user.name || session.user.email}</p>
              <p><strong>Reason:</strong> ${reason}</p>
            </div>
            <p>Please review this request in the Control Center under <strong>Edit Requests > Delete Payment</strong>.</p>
          </div>
        `
      });
    } catch (mailErr: any) {
      console.error("Failed to send deletion request email:", mailErr);
      // We don't fail the whole request just because email failed, 
      // but we log it.
    }

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error("Detailed request delete error:", error);
    return NextResponse.json({ 
      error: error.message,
      details: error.code === '42703' ? "Database schema mismatch. Please run migration." : "Internal Server Error"
    }, { status: 500 });
  }
}
