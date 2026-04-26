import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";

// PATCH /api/recurring-templates/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sql = getDb();
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const allowedFields = [
      "taskNamePattern", "entityName", "taskType", "departmentName",
      "frequency", "dayOffset", "monthOffset", "defaultOwner", "defaultReviewer", "isActive"
    ];

    const updates: any = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined) updates[key] = data[key];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const setClause = Object.keys(updates)
      .map((key) => `"${key}" = ${key === 'dayOffset' || key === 'monthOffset' ? Number(updates[key]) : `'${updates[key]}'`}`)
      .join(", ");
    
    // Using raw string for SET because dynamic keys in postgres.js are tricky with template strings
    // but better to use a loop with sql interpolation for security.
    
    // Refactored for security:
    const result = await sql`
      UPDATE "RecurringTemplate"
      SET 
        "taskNamePattern" = ${updates.taskNamePattern !== undefined ? updates.taskNamePattern : sql`"taskNamePattern"`},
        "entityName" = ${updates.entityName !== undefined ? updates.entityName : sql`"entityName"`},
        "taskType" = ${updates.taskType !== undefined ? updates.taskType : sql`"taskType"`},
        "departmentName" = ${updates.departmentName !== undefined ? updates.departmentName : sql`"departmentName"`},
        "frequency" = ${updates.frequency !== undefined ? updates.frequency : sql`"frequency"`},
        "dayOffset" = ${updates.dayOffset !== undefined ? Number(updates.dayOffset) : sql`"dayOffset"`},
        "monthOffset" = ${updates.monthOffset !== undefined ? Number(updates.monthOffset) : sql`"monthOffset"`},
        "defaultOwner" = ${updates.defaultOwner !== undefined ? updates.defaultOwner : sql`"defaultOwner"`},
        "defaultReviewer" = ${updates.defaultReviewer !== undefined ? updates.defaultReviewer : sql`"defaultReviewer"`},
        "isActive" = ${updates.isActive !== undefined ? updates.isActive : sql`"isActive"`},
        "updatedAt" = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error("Update recurring template error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/recurring-templates/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sql = getDb();
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await sql`DELETE FROM "RecurringTemplate" WHERE id = ${id}`;
    return NextResponse.json({ message: "Template deleted" });
  } catch (error: any) {
    console.error("Delete recurring template error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
