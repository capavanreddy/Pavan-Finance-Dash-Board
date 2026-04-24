import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession();
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Don't allow deleting yourself
    if ((session.user as any).id === id) {
      return NextResponse.json({ message: "You cannot remove your own account" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ message: "User removed successfully" });
  } catch (error: any) {
    console.error("DELETE USER ERROR:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
