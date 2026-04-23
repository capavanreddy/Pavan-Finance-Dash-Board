import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // This will update all users who don't have isApproved set
    const result = await prisma.user.updateMany({
      where: {
        isApproved: { not: false }
      },
      data: {
        isApproved: true
      }
    });

    return NextResponse.json({ 
      message: "Database cleanup successful", 
      updatedCount: result.count 
    });
  } catch (error: any) {
    return NextResponse.json({ message: "Cleanup failed", error: error.message }, { status: 500 });
  }
}
