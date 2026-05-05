import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getServerSession } from "@/lib/session";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const sql = getDb();
    const session = await getServerSession();
    const userRole = (session?.user as any)?.role;
    
    if (userRole !== "ADMIN" && session?.user?.email !== "pavanreddy@intellicar.in") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { employees } = await req.json();

    if (!employees || !Array.isArray(employees)) {
      return NextResponse.json({ message: "Invalid format" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash("Intellicar@123", 10);
    
    let successCount = 0;
    let failCount = 0;

    for (const emp of employees) {
      const { employeeId, name, email, department, role } = emp;
      
      try {
        // Check if exists
        const exists = await sql`SELECT id FROM "User" WHERE LOWER(email) = LOWER(${email}) LIMIT 1`;
        
        if (exists.length > 0) {
          // Update existing
          await sql`
            UPDATE "User" 
            SET "employeeId" = ${employeeId}, 
                name = ${name}, 
                department = ${department}, 
                role = ${role},
                "updatedAt" = NOW()
            WHERE LOWER(email) = LOWER(${email})
          `;
        } else {
          // Insert new
          const userId = crypto.randomUUID();
          await sql`
            INSERT INTO "User" (id, name, email, password, department, "employeeId", "isApproved", role, "createdAt", "updatedAt")
            VALUES (${userId}, ${name}, ${email}, ${hashedPassword}, ${department}, ${employeeId}, true, ${role}, NOW(), NOW())
          `;
        }
        successCount++;
      } catch (err) {
        console.error("Failed to import employee", email, err);
        failCount++;
      }
    }

    return NextResponse.json({ 
      message: `Imported ${successCount} employees successfully. ${failCount} failed.`,
      successCount,
      failCount
    });
  } catch (error: any) {
    console.error("Bulk import users error", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
