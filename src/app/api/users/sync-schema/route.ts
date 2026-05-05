import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getServerSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const sql = getDb();
    const session = await getServerSession();
    const userRole = (session?.user as any)?.role;
    
    // Only Admin can sync schema
    if (userRole !== "ADMIN" && session?.user?.email !== "pavanreddy@intellicar.in") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Perform migrations
    console.log("Starting manual schema sync...");
    
    // User Table enhancements
    await sql`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isSuspended" BOOLEAN DEFAULT FALSE`;
    await sql`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "employeeId" TEXT`;
    await sql`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isAllocator" BOOLEAN DEFAULT FALSE`;
    
    // Ensure existing users have a default if needed (optional)
    // await sql`UPDATE "User" SET "isSuspended" = FALSE WHERE "isSuspended" IS NULL`;

    console.log("Schema sync completed successfully.");

    return NextResponse.json({ 
      message: "Database schema synced successfully! All newly added fields are now available." 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Schema sync error:", error);
    return NextResponse.json({ 
      message: "Sync failed. " + (error.message || "Please check the server logs."),
      error: error.message 
    }, { status: 500 });
  }
}
