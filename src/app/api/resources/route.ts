import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getServerSession } from "@/lib/session";
import { del } from '@vercel/blob';

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const sql = getDb();
  try {
    const resources = await sql`SELECT * FROM "LearningResource" ORDER BY "createdAt" DESC`;
    return NextResponse.json(resources);
  } catch (error) {
    console.error("Failed to fetch resources", error);
    return NextResponse.json({ message: "Failed to fetch resources" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const userRole = (session?.user as any)?.role;
  if (userRole === "VIEWER") {
    return NextResponse.json({ message: "Forbidden: Viewers cannot create resources" }, { status: 403 });
  }

  const sql = getDb();
  try {
    const { name, type, url, data, category, department } = await req.json();
    const uploadedBy = session.user.name || session.user.email;
    
    // Self-healing migration for category and department fields
    try {
      await sql`ALTER TABLE "LearningResource" ADD COLUMN IF NOT EXISTS "category" TEXT DEFAULT 'Miscellaneous'`;
      await sql`ALTER TABLE "LearningResource" ADD COLUMN IF NOT EXISTS "department" TEXT DEFAULT 'General'`;
    } catch (e) {
      console.log("Resource migration failed/skipped", e);
    }

    const resource = await sql`
      INSERT INTO "LearningResource" ("name", "type", "url", "data", "category", "department", "uploadedBy", "createdAt")
      VALUES (${name}, ${type}, ${url}, ${data}, ${category || 'Miscellaneous'}, ${department || 'General'}, ${uploadedBy}, NOW())
      RETURNING *
    `;
    return NextResponse.json(resource[0]);
  } catch (error: any) {
    console.error("Failed to create resource", error);
    return NextResponse.json({ message: "Failed to create resource", error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession();
  const userRole = (session?.user as any)?.role;
  const isAdmin = session?.user?.email === "pavanreddy@intellicar.in" || userRole === "ADMIN";
  
  if (userRole === "VIEWER") {
    return NextResponse.json({ message: "Forbidden: Viewers cannot delete resources" }, { status: 403 });
  }
  
  if (!isAdmin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const sql = getDb();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ message: "ID is required" }, { status: 400 });

  try {
    // Get the resource first to find the URL
    const resources = await sql`SELECT * FROM "LearningResource" WHERE "id" = ${id}`;
    if (resources.length > 0) {
      const resource = resources[0];
      // If it's a file and has a Vercel Blob URL, delete it
      if (resource.type === 'FILE' && resource.data && resource.data.includes('blob.vercel-storage.com')) {
        try {
          await del(resource.data);
        } catch (blobError) {
          console.error("Failed to delete from Vercel Blob", blobError);
          // Continue even if blob deletion fails
        }
      }
    }

    await sql`DELETE FROM "LearningResource" WHERE "id" = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete resource", error);
    return NextResponse.json({ message: "Failed to delete resource" }, { status: 500 });
  }
}
