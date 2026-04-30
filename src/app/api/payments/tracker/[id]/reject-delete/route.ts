import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sql = getDb();
    const session = await getSession();

    if (!session || (session.user.role !== 'ADMIN' && session.user.email !== 'pavanreddy@intellicar.in')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await sql`
      UPDATE "PaymentOccurrence"
      SET 
        "deleteRequested" = FALSE,
        "deleteRequestReason" = NULL,
        "deleteRequestedBy" = NULL,
        "updatedAt" = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error("Reject delete error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
