import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";

// POST /api/payments/master/[id]/reject-edit
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const sql = getDb();
  try {
    const { id: paramId } = await params;
    const session = await getSession();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(paramId);
    
    await sql`
      UPDATE "PaymentTemplate"
      SET 
        "editRequested" = FALSE,
        "editRequestReason" = NULL,
        "updatedAt" = NOW()
      WHERE id = ${id}
    `;

    return NextResponse.json({ message: "Edit request rejected." });
  } catch (error: any) {
    console.error("Reject edit error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
