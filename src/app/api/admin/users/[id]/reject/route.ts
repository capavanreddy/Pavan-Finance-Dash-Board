import { NextResponse, NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { getServerSession } from "@/lib/session";


export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getDb();
    const { id } = await params;
    const session = await getServerSession();
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await sql`DELETE FROM "User" WHERE id = ${id}`;

    return NextResponse.json({ message: "Request rejected and user removed" });
  } catch (error: any) {
    console.error("REJECT ERROR:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
