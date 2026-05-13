import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getServerSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const sql = getDb();
  try {
    const subfolders = await sql`SELECT * FROM "KnowledgeSubfolder" ORDER BY "name" ASC`;
    return NextResponse.json(subfolders);
  } catch (error) {
    console.error("Failed to fetch subfolders", error);
    return NextResponse.json({ message: "Failed to fetch subfolders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const userRole = (session?.user as any)?.role;
  if (userRole === "VIEWER") {
    return NextResponse.json({ message: "Forbidden: Viewers cannot create folders" }, { status: 403 });
  }

  const sql = getDb();
  try {
    const { name, category } = await req.json();
    
    if (!name || !category) {
      return NextResponse.json({ message: "Name and Category are required" }, { status: 400 });
    }

    // Check if exists
    const existing = await sql`
      SELECT * FROM "KnowledgeSubfolder" 
      WHERE LOWER("name") = LOWER(${name}) AND "category" = ${category}
      LIMIT 1
    `;

    if (existing.length > 0) {
      return NextResponse.json(existing[0]);
    }

    const subfolder = await sql`
      INSERT INTO "KnowledgeSubfolder" ("name", "category", "createdAt")
      VALUES (${name}, ${category}, NOW())
      RETURNING *
    `;
    return NextResponse.json(subfolder[0]);
  } catch (error: any) {
    console.error("Failed to create subfolder", error);
    return NextResponse.json({ message: "Failed to create subfolder", error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession();
  const userRole = (session?.user as any)?.role;
  const isAdmin = session?.user?.email === "pavanreddy@intellicar.in" || userRole === "ADMIN";
  
  if (!isAdmin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const sql = getDb();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ message: "ID is required" }, { status: 400 });

  try {
    // Check if subfolder has resources
    const resources = await sql`SELECT id FROM "LearningResource" WHERE "subfolderId" = ${id} LIMIT 1`;
    if (resources.length > 0) {
      return NextResponse.json({ message: "Cannot delete folder that contains resources. Please move or delete resources first." }, { status: 400 });
    }

    await sql`DELETE FROM "KnowledgeSubfolder" WHERE "id" = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete subfolder", error);
    return NextResponse.json({ message: "Failed to delete subfolder" }, { status: 500 });
  }
}
