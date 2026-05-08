import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";

// GET /api/recurring-templates/[id]/assignments
export async function GET(
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

    const history = await sql`
      SELECT * FROM "AssignmentHistory"
      WHERE "templateId" = ${parseInt(id)}
      ORDER BY "createdAt" DESC
    `;

    return NextResponse.json(history);
  } catch (error: any) {
    console.error("Fetch assignment history error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/recurring-templates/[id]/assignments
export async function POST(
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

    const { ownerName, reviewerName, effectiveFrom } = await req.json();

    if (!ownerName || !reviewerName || !effectiveFrom) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const templateId = parseInt(id);
    const effectiveDate = new Date(effectiveFrom);

    // 1. Record in AssignmentHistory
    await sql`
      INSERT INTO "AssignmentHistory" ("templateId", "ownerName", "reviewerName", "effectiveFrom", "createdAt")
      VALUES (${templateId}, ${ownerName}, ${reviewerName}, ${effectiveDate}, NOW())
    `;

    // 2. Update RecurringTemplate defaults
    await sql`
      UPDATE "RecurringTemplate"
      SET "defaultOwner" = ${ownerName}, "defaultReviewer" = ${reviewerName}, "updatedAt" = NOW()
      WHERE id = ${templateId}
    `;

    // 3. Update existing tasks that are scheduled after effective date and not completed
    // We update Task table records that match this template and have a due date >= effective date
    // AND taskStatus is not in 'Completed', 'Processed', etc. (if applicable)
    // For safety, we focus on tasks that are still 'Pending' or 'In Progress'
    
    await sql`
      UPDATE "Task"
      SET "ownerName" = ${ownerName}, "reviewerName" = ${reviewerName}, "updatedAt" = NOW()
      WHERE "templateId" = ${templateId}
      AND "dueDate" >= ${effectiveDate}
      AND "taskStatus" NOT IN ('Completed', 'Processed', 'Review Completed')
    `;

    return NextResponse.json({ message: "Assignment updated and posted successfully" });
  } catch (error: any) {
    console.error("Post assignment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
