import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reason } = await req.json();
    if (!reason) {
      return NextResponse.json({ error: "Reason is required" }, { status: 400 });
    }

    const sql = getDb();
    
    // Get details for email
    const details = await sql`
      SELECT o.*, t."vendorName", t."paymentDescription", t."entityName"
      FROM "PaymentOccurrence" o
      JOIN "PaymentTemplate" t ON o."templateId" = t.id
      WHERE o.id = ${id}
    `;

    if (details.length === 0) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    const record = details[0];

    const result = await sql`
      UPDATE "PaymentOccurrence"
      SET 
        "deleteRequested" = TRUE,
        "deleteRequestReason" = ${reason},
        "deleteRequestedBy" = ${session.name || session.email},
        "updatedAt" = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    // Notify Admin
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || "pavanreddy@intellicar.in",
        subject: `🚨 Payment Deletion Request: ${record.vendorName}`,
        html: `
          <h3>Payment Deletion Request</h3>
          <p><strong>User:</strong> ${session.name} (${session.email})</p>
          <p><strong>Entity:</strong> ${record.entityName}</p>
          <p><strong>Vendor:</strong> ${record.vendorName}</p>
          <p><strong>Description:</strong> ${record.paymentDescription}</p>
          <p><strong>Due Date:</strong> ${new Date(record.dueDate).toLocaleDateString()}</p>
          <p><strong>Reason for Deletion:</strong> ${reason}</p>
          <br/>
          <p>Please review this request in the Control Center under Edit Requests -> Delete Payment.</p>
        `
      });
    } catch (emailErr) {
      console.error("Failed to send admin notification email:", emailErr);
    }

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error("Request payment delete error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
