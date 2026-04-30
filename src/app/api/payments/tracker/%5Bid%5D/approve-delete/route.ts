import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sql = getDb();

    // Get details for email before deletion
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

    // Delete the record
    await sql`
      DELETE FROM "PaymentOccurrence"
      WHERE id = ${id}
    `;

    // Notify User (if we had their email, but we usually notify the requester)
    // For now, we'll assume the requester is the one we should notify if possible
    // But since we don't store requester email in the record directly (just the name),
    // we'll skip for now or send to a general list if configured.

    return NextResponse.json({ success: true, message: "Payment transaction deleted successfully" });
  } catch (error: any) {
    console.error("Approve payment delete error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
