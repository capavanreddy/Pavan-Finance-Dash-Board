import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";

// GET /api/payments/master
export async function GET() {
  try {
    const sql = getDb();
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // --- Self-Healing Migration ---
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS "PaymentTemplate" (
          id SERIAL PRIMARY KEY,
          "entityName" TEXT NOT NULL,
          "paymentDescription" TEXT NOT NULL,
          "vendorName" TEXT NOT NULL,
          "paymentType" TEXT,
          "departmentName" TEXT,
          "financeFunction" TEXT,
          "frequency" TEXT NOT NULL,
          "vendorEmail" TEXT,
          "prodEmail" TEXT,
          "defaultOwner" TEXT,
          "defaultReviewer" TEXT,
          "dueDay" INTEGER,
          "weeklyDay" TEXT,
          "startDate" DATE,
          "endDate" DATE,
          "stopDate" DATE,
          "amountToRelease" NUMERIC DEFAULT 0,
          "isStopped" BOOLEAN DEFAULT FALSE,
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS "PaymentOccurrence" (
          id SERIAL PRIMARY KEY,
          "templateId" INTEGER REFERENCES "PaymentTemplate"(id) ON DELETE CASCADE,
          "dueDate" DATE NOT NULL,
          "actualDate" DATE,
          "amountToRelease" NUMERIC DEFAULT 0,
          "amountPaid" NUMERIC,
          "paidFromAccount" TEXT,
          "isPaid" BOOLEAN DEFAULT FALSE,
          "isListed" BOOLEAN DEFAULT FALSE,
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      await sql`ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "masterPaymentTypes" TEXT DEFAULT 'AMC,Rent,Electricity,Subscriptions,Salaries,Vendor Payment'`;
      await sql`ALTER TABLE "PaymentTemplate" ADD COLUMN IF NOT EXISTS "dueDay" INTEGER`;
      await sql`ALTER TABLE "PaymentTemplate" ADD COLUMN IF NOT EXISTS "weeklyDay" TEXT`;
      await sql`ALTER TABLE "PaymentTemplate" ADD COLUMN IF NOT EXISTS "lastGeneratedPeriod" TEXT`;
      await sql`ALTER TABLE "PaymentTemplate" ADD COLUMN IF NOT EXISTS "deleteRequested" BOOLEAN DEFAULT FALSE`;
      await sql`ALTER TABLE "PaymentTemplate" ADD COLUMN IF NOT EXISTS "deleteRequestReason" TEXT`;
      await sql`ALTER TABLE "PaymentTemplate" ADD COLUMN IF NOT EXISTS "editRequested" BOOLEAN DEFAULT FALSE`;
      await sql`ALTER TABLE "PaymentTemplate" ADD COLUMN IF NOT EXISTS "editApproved" BOOLEAN DEFAULT FALSE`;
      await sql`ALTER TABLE "PaymentTemplate" ADD COLUMN IF NOT EXISTS "editRequestReason" TEXT`;
      await sql`ALTER TABLE "PaymentTemplate" ADD COLUMN IF NOT EXISTS "amountToRelease" NUMERIC DEFAULT 0`;
      
      // New columns for PaymentOccurrence
      await sql`ALTER TABLE "PaymentOccurrence" ADD COLUMN IF NOT EXISTS "isHold" BOOLEAN DEFAULT FALSE`;
      await sql`ALTER TABLE "PaymentOccurrence" ADD COLUMN IF NOT EXISTS "holdReason" TEXT`;
      await sql`ALTER TABLE "PaymentOccurrence" ADD COLUMN IF NOT EXISTS "editRequested" BOOLEAN DEFAULT FALSE`;
      await sql`ALTER TABLE "PaymentOccurrence" ADD COLUMN IF NOT EXISTS "editApproved" BOOLEAN DEFAULT FALSE`;
      await sql`ALTER TABLE "PaymentOccurrence" ADD COLUMN IF NOT EXISTS "editRequestReason" TEXT`;
      await sql`ALTER TABLE "PaymentOccurrence" ADD COLUMN IF NOT EXISTS "amountToRelease" NUMERIC DEFAULT 0`;
      await sql`ALTER TABLE "PaymentOccurrence" ADD COLUMN IF NOT EXISTS "isListed" BOOLEAN DEFAULT FALSE`;
      await sql`ALTER TABLE "PaymentOccurrence" ADD COLUMN IF NOT EXISTS "paidFromAccount" TEXT`;
    } catch (err) {
      console.error("Payment migration error:", err);
    }

    const templates = await sql`
      SELECT * FROM "PaymentTemplate"
      ORDER BY "createdAt" DESC
    `;
    return NextResponse.json(templates);
  } catch (error: any) {
    console.error("Fetch payment templates error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/payments/master
export async function POST(req: NextRequest) {
  const sql = getDb();
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session?.user as any)?.role;
    if (userRole === "VIEWER") {
      return NextResponse.json({ error: "Forbidden: Viewers cannot create or modify payment templates" }, { status: 403 });
    }

    const data = await req.json();
    const {
      id,
      entityName,
      paymentDescription,
      vendorName,
      paymentType,
      departmentName,
      financeFunction,
      frequency,
      vendorEmail,
      prodEmail,
      defaultOwner,
      defaultReviewer,
      dueDay,
      weeklyDay,
      startDate,
      endDate,
      amountToRelease
    } = data;

    if (!entityName || !paymentDescription || !vendorName || !frequency) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (id) {
      // Update
      const result = await sql`
        UPDATE "PaymentTemplate"
        SET 
          "entityName" = ${entityName},
          "paymentDescription" = ${paymentDescription},
          "vendorName" = ${vendorName},
          "paymentType" = ${paymentType},
          "departmentName" = ${departmentName},
          "financeFunction" = ${financeFunction},
          "frequency" = ${frequency},
          "vendorEmail" = ${vendorEmail},
          "prodEmail" = ${prodEmail},
          "defaultOwner" = ${defaultOwner},
          "defaultReviewer" = ${defaultReviewer},
          "dueDay" = ${dueDay ? Number(dueDay) : null},
          "weeklyDay" = ${weeklyDay || null},
          "startDate" = ${startDate ? new Date(startDate) : null},
          "endDate" = ${endDate ? new Date(endDate) : null},
          "amountToRelease" = ${amountToRelease ? Number(amountToRelease) : 0},
          "updatedAt" = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      return NextResponse.json(result[0]);
    } else {
      // Create
      const result = await sql`
        INSERT INTO "PaymentTemplate" (
          "entityName", "paymentDescription", "vendorName", "paymentType",
          "departmentName", "financeFunction", "frequency", "vendorEmail",
          "prodEmail", "defaultOwner", "defaultReviewer",
          "dueDay", "weeklyDay",
          "startDate", "endDate", "amountToRelease", "isActive", "createdAt", "updatedAt"
        )
        VALUES (
          ${entityName}, ${paymentDescription}, ${vendorName}, ${paymentType},
          ${departmentName}, ${financeFunction}, ${frequency}, ${vendorEmail},
          ${prodEmail}, ${defaultOwner}, ${defaultReviewer},
          ${dueDay ? Number(dueDay) : null}, ${weeklyDay || null},
          ${startDate ? new Date(startDate) : null}, ${endDate ? new Date(endDate) : null},
          ${amountToRelease ? Number(amountToRelease) : 0},
          TRUE, NOW(), NOW()
        )
        RETURNING *
      `;
      return NextResponse.json(result[0], { status: 201 });
    }
  } catch (error: any) {
    console.error("Save payment template error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
