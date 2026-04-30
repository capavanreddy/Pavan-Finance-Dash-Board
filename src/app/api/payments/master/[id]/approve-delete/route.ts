import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";

// POST /api/payments/master/[id]/approve-delete
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const sql = getDb();
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(params.id);
    
    // Deleting template will delete occurrences due to ON DELETE CASCADE
    await sql`DELETE FROM "PaymentTemplate" WHERE id = ${id}`;

    return NextResponse.json({ message: "Deletion request approved. Master record removed." });
  } catch (error: any) {
    console.error("Approve delete error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
