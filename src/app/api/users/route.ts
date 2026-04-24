import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";

// GET all users
export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    const userRole = (session?.user as any)?.role;
    
    // Allow if ADMIN or if email matches superadmin
    if (userRole !== "ADMIN" && session?.user?.email !== "pavanreddy@intellicar.in") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        isApproved: true,
        isAllocator: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    console.error("Failed to fetch users", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// PUT (update user role)
export async function PUT(req: Request) {
  try {
    const session = await getServerSession();
    const userRole = (session?.user as any)?.role;
    
    if (userRole !== "ADMIN" && session?.user?.email !== "pavanreddy@intellicar.in") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, role, department, isAllocator, isApproved } = body;

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (role) updateData.role = role;
    if (department !== undefined) updateData.department = department;
    if (isAllocator !== undefined) updateData.isAllocator = isAllocator;
    if (isApproved !== undefined) updateData.isApproved = isApproved;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({ message: "User role updated successfully", user }, { status: 200 });
  } catch (error: any) {
    console.error("Failed to update user role", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
