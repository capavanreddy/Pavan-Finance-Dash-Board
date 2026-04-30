import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";

// DELETE /api/payments/master/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const sql = getDb();
  try {
    const { id: paramId } = await params;
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(paramId);
    
    // Deleting template will delete occurrences due to ON DELETE CASCADE
    await sql`DELETE FROM "PaymentTemplate" WHERE id = ${id}`;

    return NextResponse.json({ message: "Payment master and associated transactions deleted." });
  } catch (error: any) {
    console.error("Delete master error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/payments/master/[id] (For Admin approvals or general updates)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const sql = getDb();
  try {
    const { id: paramId } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(paramId);
    const data = await req.json();
    
    // Build update query dynamically or just support specific fields
    const { deleteRequested, deleteRequestReason, editRequested, editRequestReason, isActive } = data;
    
    const result = await sql`
      UPDATE "PaymentTemplate"
      SET 
        "deleteRequested" = ${deleteRequested !== undefined ? deleteRequested : sql`"deleteRequested"`},
        "deleteRequestReason" = ${deleteRequestReason !== undefined ? deleteRequestReason : sql`"deleteRequestReason"`},
        "editRequested" = ${editRequested !== undefined ? editRequested : sql`"editRequested"`},
        "editRequestReason" = ${editRequestReason !== undefined ? editRequestReason : sql`"editRequestReason"`},
        "isActive" = ${isActive !== undefined ? isActive : sql`"isActive"`},
        "updatedAt" = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error("Update master error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
