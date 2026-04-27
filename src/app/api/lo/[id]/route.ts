import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getServerSession } from "@/lib/session";


export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  const session = await getServerSession();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const isAdmin = session?.user?.email === "pavanreddy@intellicar.in" || (session?.user as any)?.role === "ADMIN";
  const loId = parseInt(id);

  try {
    const sql = getDb();
    const existingLOs = await sql`
      SELECT * FROM "LearningOpportunity" WHERE id = ${loId}
    `;
    const existingLO = existingLOs[0];

    if (!existingLO) return NextResponse.json({ message: "LO not found" }, { status: 404 });

    // Permissions: Admin can always edit. Owner can edit ONLY if approved.
    const isOwner = existingLO.createdByEmail === session.user?.email;
    if (!isAdmin && (!isOwner || !existingLO.editApproved)) {
      return NextResponse.json({ message: "You don't have permission to edit this LO" }, { status: 403 });
    }

    const data = await req.json();
    const editApproved = isAdmin ? existingLO.editApproved : false;
    
    const updatedLOs = await sql`
      UPDATE "LearningOpportunity"
      SET "entity" = ${data.entity || existingLO.entity},
          "dateOfIdentification" = ${data.dateOfIdentification ? new Date(data.dateOfIdentification).toISOString() : existingLO.dateOfIdentification},
          "learningOpportunity" = ${data.learningOpportunity || existingLO.learningOpportunity},
          "identifiedBy" = ${data.identifiedBy || existingLO.identifiedBy},
          "committedBy" = ${data.committedBy || existingLO.committedBy},
          "resolutionProvided" = ${data.resolutionProvided || existingLO.resolutionProvided},
          "modeOfCommunication" = ${data.modeOfCommunication || existingLO.modeOfCommunication},
          "emailSub" = ${data.emailSub !== undefined ? data.emailSub : existingLO.emailSub},
          "comments" = ${data.comments !== undefined ? data.comments : existingLO.comments},
          "editApproved" = ${editApproved},
          "editRequested" = ${isAdmin ? existingLO.editRequested : false},
          "updatedAt" = NOW()
      WHERE id = ${loId}
      RETURNING *
    `;

    return NextResponse.json(updatedLOs[0]);
  } catch (error: any) {
    console.error("LO update error:", error);
    return NextResponse.json({ message: "Failed to update LO", error: error.message }, { status: 500 });
  }
}
