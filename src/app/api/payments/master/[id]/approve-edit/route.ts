import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";

// POST /api/payments/master/[id]/approve-edit
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const sql = getDb();
  try {
    const { id: paramId } = await params;
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(paramId);
    
    await sql`
      UPDATE "PaymentTemplate"
      SET 
        "editRequested" = FALSE,
        "editApproved" = TRUE,
        "updatedAt" = NOW()
      WHERE id = ${id}
    `;

    return NextResponse.json({ message: "Edit request approved." });
  } catch (error: any) {
    console.error("Approve edit error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
