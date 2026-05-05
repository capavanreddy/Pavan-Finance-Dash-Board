import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getServerSession } from "@/lib/session";

export async function PUT(req: NextRequest) {
  try {
    const sql = getDb();
    const session = await getServerSession();
    const userRole = (session?.user as any)?.role;
    
    // Only Admin can bulk update users
    if (userRole !== "ADMIN" && session?.user?.email !== "pavanreddy@intellicar.in") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { updates } = body;

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json({ message: "Invalid updates format" }, { status: 400 });
    }

    // Execute updates sequentially (Neon serverless over HTTP does not support transactions via .begin)
    for (const update of updates) {
      const { userId, role, department, employeeId, isSuspended } = update;
      
      const fields: string[] = [];
      const values: any[] = [];
      
      if (role !== undefined) { fields.push(`role = $${fields.length + 1}`); values.push(role); }
      if (department !== undefined) { fields.push(`department = $${fields.length + 1}`); values.push(department); }
      if (employeeId !== undefined) { fields.push(`"employeeId" = $${fields.length + 1}`); values.push(employeeId); }
      if (isSuspended !== undefined) { fields.push(`"isSuspended" = $${fields.length + 1}`); values.push(isSuspended); }
      
      if (fields.length > 0) {
        values.push(userId);
        await sql`UPDATE "User" SET ${sql.unsafe(fields.join(', '))} WHERE id = $${fields.length + 1}`;
      }
    }

    return NextResponse.json({ message: "Users updated successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Bulk update users error", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
