import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';


export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getDb();
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    const body = await request.json();
    
    // Build dynamic update
    const updates: string[] = [];
    const values: any[] = [];
    
    if (body.status !== undefined) {
      updates.push(`status = '${body.status}'`);
    }
    if (body.convertedTaskId !== undefined) {
      updates.push(`"convertedTaskId" = ${body.convertedTaskId}`);
    }
    if (body.rejectReason !== undefined) {
      updates.push(`"rejectReason" = '${body.rejectReason}'`);
    }
    
    if (updates.length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }
    
    const updatedRequests = await sql`
      UPDATE "ExternalRequest"
      SET ${sql.unsafe(updates.join(', '))}, "updatedAt" = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    
    return NextResponse.json(updatedRequests[0]);
  } catch (error) {
    console.error('Error updating external request:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getDb();
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    await sql`DELETE FROM "ExternalRequest" WHERE id = ${id}`;
    
    return NextResponse.json({ message: "Request deleted successfully" });
  } catch (error) {
    console.error('Error deleting external request:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
