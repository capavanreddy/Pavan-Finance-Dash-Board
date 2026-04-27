import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";

// PATCH /api/payments/tracker/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    console.log(`PATCH /api/payments/tracker/${id} called`);
    const sql = getDb();
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { 
      isHold, holdReason, 
      editRequested, editRequestReason, 
      editApproved,
      actualDate, amountPaid 
    } = data;

    // Build the update query manually since Neon's sql tagged template doesn't support the sql(obj) helper
    const result = await sql`
      UPDATE "PaymentOccurrence"
      SET 
        "isHold" = CASE WHEN ${isHold !== undefined} THEN ${isHold}::BOOLEAN ELSE "isHold" END,
        "holdReason" = CASE WHEN ${holdReason !== undefined} THEN ${holdReason}::TEXT ELSE "holdReason" END,
        "editRequested" = CASE 
          WHEN ${editRequested !== undefined} THEN ${editRequested}::BOOLEAN 
          WHEN ${actualDate !== undefined || amountPaid !== undefined} THEN FALSE
          ELSE "editRequested" 
        END,
        "editRequestReason" = CASE WHEN ${editRequestReason !== undefined} THEN ${editRequestReason}::TEXT ELSE "editRequestReason" END,
        "editApproved" = CASE 
          WHEN ${editApproved !== undefined} THEN ${editApproved}::BOOLEAN 
          WHEN ${actualDate !== undefined || amountPaid !== undefined} THEN FALSE
          ELSE "editApproved" 
        END,
        "actualDate" = CASE WHEN ${actualDate !== undefined} THEN ${actualDate ? new Date(actualDate) : null}::DATE ELSE "actualDate" END,
        "amountPaid" = CASE WHEN ${amountPaid !== undefined} THEN ${amountPaid ? Number(amountPaid) : null}::NUMERIC ELSE "amountPaid" END,
        "isPaid" = CASE 
          WHEN ${actualDate !== undefined || amountPaid !== undefined} THEN (${(actualDate && amountPaid) ? true : false})::BOOLEAN
          ELSE "isPaid" 
        END,
        "updatedAt" = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error("Update payment occurrence error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
