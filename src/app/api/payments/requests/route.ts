import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";

// GET /api/payments/requests
export async function GET(req: NextRequest) {
  try {
    const sql = getDb();
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "MY", "TEAM", "INTER"
    const userEmail = (session.user as any)?.email;
    const userDept = (session.user as any)?.department;
    const userRole = (session.user as any)?.role;
    const isAdmin = userRole === "ADMIN";

    // --- Self-Healing Migration ---
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS "PaymentRequest" (
          id SERIAL PRIMARY KEY,
          "requesterId" TEXT NOT NULL,
          "requesterName" TEXT NOT NULL,
          "requesterEmail" TEXT NOT NULL,
          department TEXT NOT NULL,
          "entityName" TEXT NOT NULL,
          "vendorName" TEXT NOT NULL,
          description TEXT NOT NULL,
          "paymentType" TEXT NOT NULL,
          frequency TEXT NOT NULL,
          amount NUMERIC(12, 2) NOT NULL,
          "dueDate" DATE NOT NULL,
          "isNewVendor" BOOLEAN DEFAULT FALSE,
          "kycDocuments" JSONB,
          status TEXT DEFAULT 'PENDING_DEPT',
          "approvedBy" TEXT,
          "approvedByEmail" TEXT,
          "processedBy" TEXT,
          "processedByEmail" TEXT,
          "deptHeadComments" TEXT,
          "financeComments" TEXT,
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      
      // Add missing columns to SystemSettings if not exist (handled by schema.prisma usually, but for safety)
      await sql`ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "departmentHeadMatrix" TEXT DEFAULT '{}'`;
    } catch (err) {
      console.error("PaymentRequest migration error:", err);
    }

    const search = searchParams.get("search");
    const department = searchParams.get("department");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let requests;
    let baseQuery = sql`SELECT * FROM "PaymentRequest"`;
    let conditions = [];

    // Base Type filtering
    if (type === "MY") {
      conditions.push(sql`"requesterEmail" = ${userEmail}`);
    } else if (type === "TEAM") {
      const settings = await sql`SELECT "departmentHeadMatrix" FROM "SystemSettings" LIMIT 1`;
      const matrix = JSON.parse(settings[0]?.departmentHeadMatrix || "{}");
      const deptsAsHead = Object.keys(matrix).filter(dept => 
        matrix[dept] && matrix[dept].includes(userEmail)
      );

      if (deptsAsHead.length === 0 && !isAdmin) {
        return NextResponse.json([]);
      }
      if (!isAdmin) {
        conditions.push(sql`department = ANY(${deptsAsHead})`);
      }
    } else if (type === "INTER") {
      if (userDept !== "Finance" && !isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      conditions.push(sql`status IN ('PENDING_FINANCE', 'APPROVED', 'REJECTED')`);
    }

    // Additional Filters
    if (search) {
      const searchPattern = `%${search}%`;
      conditions.push(sql`("vendorName" ILIKE ${searchPattern} OR "entityName" ILIKE ${searchPattern} OR description ILIKE ${searchPattern})`);
    }
    if (department && department !== 'ALL') {
      conditions.push(sql`department = ${department}`);
    }
    if (status && status !== 'ALL') {
      conditions.push(sql`status = ${status}`);
    }
    if (startDate) {
      conditions.push(sql`"dueDate" >= ${startDate}`);
    }
    if (endDate) {
      conditions.push(sql`"dueDate" <= ${endDate}`);
    }

    if (conditions.length > 0) {
      const whereClause = conditions.reduce((acc, curr, idx) => 
        idx === 0 ? sql`WHERE ${curr}` : sql`${acc} AND ${curr}`
      );
      requests = await sql`${baseQuery} ${whereClause} ORDER BY "createdAt" DESC`;
    } else {
      requests = await sql`${baseQuery} ORDER BY "createdAt" DESC`;
    }

    return NextResponse.json(requests);
  } catch (error: any) {
    console.error("Fetch payment requests error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/payments/requests
export async function POST(req: NextRequest) {
  const sql = getDb();
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { 
      id, action, // "SUBMIT", "APPROVE", "REJECT", "PROCESS"
      entityName, vendorName, description, paymentType, frequency, amount, dueDate, isNewVendor, kycDocuments,
      comments
    } = data;

    const userEmail = (session.user as any)?.email;
    const userName = (session.user as any)?.name;
    const userDept = (session.user as any)?.department;

    if (id && action) {
      // Handle Transitions
      const current = await sql`SELECT * FROM "PaymentRequest" WHERE id = ${id}`;
      if (current.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

      if (action === "APPROVE" || (action === "REJECT" && userDept !== "Finance")) {
        // Authorization: Check if user is a Dept Head for this request's department
        const settings = await sql`SELECT "departmentHeadMatrix" FROM "SystemSettings" LIMIT 1`;
        const matrix = JSON.parse(settings[0]?.departmentHeadMatrix || "{}");
        const heads = matrix[current[0].department] || [];
        
        if (!heads.includes(userEmail) && (session.user as any)?.role !== "ADMIN") {
          return NextResponse.json({ error: "Forbidden: Not a Department Head" }, { status: 403 });
        }
      }

      if (action === "APPROVE") {
        // Dept Head Approval
        await sql`
          UPDATE "PaymentRequest"
          SET status = 'PENDING_FINANCE', "approvedBy" = ${userName}, "approvedByEmail" = ${userEmail}, "deptHeadComments" = ${comments}, "updatedAt" = NOW()
          WHERE id = ${id}
        `;
      } else if (action === "REJECT") {
        const isFinance = userDept === "Finance";
        await sql`
          UPDATE "PaymentRequest"
          SET status = 'REJECTED', 
              ${isFinance ? sql`"financeComments"` : sql`"deptHeadComments"`} = ${comments},
              "updatedAt" = NOW()
          WHERE id = ${id}
        `;
      } else if (action === "PROCESS") {
        // Finance Approval -> Create Payment Occurrence
        if (userDept !== "Finance" && (session.user as any)?.role !== "ADMIN") {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await sql`
          UPDATE "PaymentRequest"
          SET status = 'APPROVED', "processedBy" = ${userName}, "processedByEmail" = ${userEmail}, "financeComments" = ${comments}, "updatedAt" = NOW()
          WHERE id = ${id}
        `;

        // Create Payment Occurrence (Ad-hoc)
        // We'll create a dummy template or just insert into Occurrence with a special flag if needed
        // For now, we'll follow the user's request: "Once he approve, it will go to Payment list directly"
        // Since occurrences need a templateId, we might need a hidden "AD-HOC" template or allow null templateId
        // Looking at the schema, templateId is NOT NULL in raw SQL? Wait, let's check.
        // `templateId INTEGER REFERENCES "PaymentTemplate"(id) ON DELETE CASCADE`
        // So we NEED a template. I'll create a generic "AD-HOC REQUESTS" template if it doesn't exist.
        
        let adHocTemplate = await sql`SELECT id FROM "PaymentTemplate" WHERE "paymentDescription" = 'AD-HOC REQUESTS' LIMIT 1`;
        if (adHocTemplate.length === 0) {
          adHocTemplate = await sql`
            INSERT INTO "PaymentTemplate" ("entityName", "paymentDescription", "vendorName", "frequency", "isStopped", "isActive")
            VALUES ('SYSTEM', 'AD-HOC REQUESTS', 'VARIOUS', 'Ad-hoc', TRUE, TRUE)
            RETURNING id
          `;
        }

        await sql`
          INSERT INTO "PaymentOccurrence" (
            "templateId", "dueDate", "actualDate", "amountToRelease", "amountPaid", "isPaid", "isListed", "paidFromAccount"
          )
          VALUES (
            ${adHocTemplate[0].id}, ${new Date(current[0].dueDate)}, NOW(), ${current[0].amount}, ${current[0].amount}, TRUE, TRUE, 'AUTO-PROCESSED'
          )
        `;
      }
      return NextResponse.json({ success: true });
    } else {
      // Create New Request
      const result = await sql`
        INSERT INTO "PaymentRequest" (
          "requesterId", "requesterName", "requesterEmail", department, "entityName", "vendorName",
          description, "paymentType", frequency, amount, "dueDate", "isNewVendor", "kycDocuments", status
        )
        VALUES (
          ${(session.user as any)?.id || 'unknown'}, ${userName}, ${userEmail}, ${userDept}, ${entityName}, ${vendorName},
          ${description}, ${paymentType}, ${frequency}, ${amount}, ${new Date(dueDate)}, ${isNewVendor}, ${JSON.stringify(kycDocuments)}, 'PENDING_DEPT'
        )
        RETURNING *
      `;
      return NextResponse.json(result[0], { status: 201 });
    }
  } catch (error: any) {
    console.error("Save payment request error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
