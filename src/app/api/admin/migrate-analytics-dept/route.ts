import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const sql = getDb();
        
        // Add department_name to manual analytics table
        await sql`ALTER TABLE "payments_analytics_manual" ADD COLUMN IF NOT EXISTS "department_name" TEXT DEFAULT 'N/A'`;
        
        // Also ensure system settings has departments
        await sql`ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "masterDepartments" TEXT DEFAULT 'Finance,HR,Operations,Sales,IT,Legal'`;

        return NextResponse.json({ message: "Analytics Department migration successful" });
    } catch (error: any) {
        console.error("Migration error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
