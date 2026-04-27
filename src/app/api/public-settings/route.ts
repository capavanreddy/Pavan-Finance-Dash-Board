import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const sql = getDb();
    const settings = await sql`SELECT "masterDepartments", "homeContent" FROM "SystemSettings" LIMIT 1`;
    return NextResponse.json(settings[0] || { masterDepartments: "", homeContent: "{}" });
  } catch (error) {
    console.error('Error fetching public settings:', error);
    return NextResponse.json({ masterDepartments: "", homeContent: "{}" }, { status: 500 });
  }
}
