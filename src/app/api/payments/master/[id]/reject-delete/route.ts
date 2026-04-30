import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";

// POST /api/payments/master/[id]/reject-delete
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const sql = getDb();
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(params.id);
    
    await sql`
      UPDATE "PaymentTemplate"
      SET 
        "deleteRequested" = FALSE,
        "deleteRequestReason" = NULL,
        "updatedAt" = NOW()
      WHERE id = ${id}
    `;

    return NextResponse.json({ message: "Deletion request rejected." });
  } catch (error: any) {
    console.error("Reject delete error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
