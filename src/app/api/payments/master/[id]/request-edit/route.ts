import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";

// POST /api/payments/master/[id]/request-edit
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const sql = getDb();
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(params.id);
    const { reason } = await req.json();

    if (!reason) {
      return NextResponse.json({ error: "Reason is required" }, { status: 400 });
    }

    await sql`
      UPDATE "PaymentTemplate"
      SET 
        "editRequested" = TRUE,
        "editRequestReason" = ${reason},
        "updatedAt" = NOW()
      WHERE id = ${id}
    `;

    return NextResponse.json({ message: "Edit request sent successfully." });
  } catch (error: any) {
    console.error("Request edit error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
