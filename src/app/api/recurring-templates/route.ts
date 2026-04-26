import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";

// GET /api/recurring-templates
export async function GET() {
  try {
    const sql = getDb();
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const templates = await sql`
      SELECT * FROM "RecurringTemplate"
      ORDER BY "createdAt" DESC
    `;
    return NextResponse.json(templates);
  } catch (error: any) {
    console.error("Fetch recurring templates error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/recurring-templates
export async function POST(req: NextRequest) {
  try {
    const sql = getDb();
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role check - only Admin or those allowed in matrix
    // For now, allow all logged in, we will refine in UI
    const data = await req.json();
    const {
      taskNamePattern,
      entityName,
      taskType,
      departmentName,
      frequency,
      dayOffset,
      monthOffset,
      defaultOwner,
      defaultReviewer
    } = data;

    if (!taskNamePattern || !entityName || !taskType || !frequency) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO "RecurringTemplate" (
        "taskNamePattern", "entityName", "taskType", "departmentName",
        "frequency", "dayOffset", "monthOffset", "defaultOwner", "defaultReviewer",
        "isActive", "createdAt", "updatedAt"
      )
      VALUES (
        ${taskNamePattern}, ${entityName}, ${taskType}, ${departmentName || "Finance"},
        ${frequency}, ${Number(dayOffset) || 0}, ${Number(monthOffset) || 0},
        ${defaultOwner || null}, ${defaultReviewer || null},
        TRUE, NOW(), NOW()
      )
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error: any) {
    console.error("Create recurring template error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
