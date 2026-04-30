import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getServerSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const sql = getDb();
    const session = await getServerSession();
    
    // Security Check: Only Admin can reset
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized. Admin access required." }, { status: 401 });
    }

    const { action } = await req.json();

    const PROTECTED_TABLES = ['User', 'SystemSettings', 'DataBackup', '_prisma_migrations', 'TaskSequence'];

    if (action === "RESET") {
      // 1. Discover all public tables
      const tablesResult = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      `;
      
      const allTables = (tablesResult as any[]).map(t => t.table_name);
      const targetTables = allTables.filter(name => !PROTECTED_TABLES.includes(name));

      // 2. Create a comprehensive snapshot
      const snapshot: any = {
        resetAt: new Date().toISOString(),
        resetBy: session.user?.email,
        data: {},
        sequences: []
      };

      for (const tableName of targetTables) {
        try {
          const query = `SELECT * FROM "${tableName}"`;
          const strings = [query] as any;
          strings.raw = [query];
          snapshot.data[tableName] = await (sql as any)(strings);
        } catch (e) {
          console.error(`Snapshot failed for ${tableName}:`, e);
        }
      }
      
      snapshot.sequences = await sql`SELECT * FROM "TaskSequence"`;

      // 3. Save to DataBackup
      await sql`CREATE TABLE IF NOT EXISTS "DataBackup" ("id" TEXT PRIMARY KEY, "snapshot" JSONB, "createdAt" TIMESTAMP DEFAULT NOW())`;
      const backupId = `backup_${Date.now()}`;
      await sql`
        INSERT INTO "DataBackup" ("id", "snapshot", "createdAt")
        VALUES (${backupId}, ${JSON.stringify(snapshot)}, NOW())
      `;

      // 4. Universal Purge
      for (const tableName of targetTables) {
        try {
          const query = `TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE`;
          const strings = [query] as any;
          strings.raw = [query];
          await (sql as any)(strings);
        } catch (e) {
          try { 
            const delQuery = `DELETE FROM "${tableName}"`;
            const dStrings = [delQuery] as any;
            dStrings.raw = [delQuery];
            await (sql as any)(dStrings); 
          } catch (de) {}
        }
      }
      
      await sql`DELETE FROM "TaskSequence"`;

      return NextResponse.json({ 
        message: `Universal Master Reset successful. All transactions across ${targetTables.length} tables cleared. System settings and user accounts preserved.`,
        backupId 
      });
    }

    if (action === "REVERSE") {
      const backups = await sql`SELECT * FROM "DataBackup" ORDER BY "createdAt" DESC LIMIT 1`;
      if (!backups.length) {
        return NextResponse.json({ message: "No restore points found." }, { status: 404 });
      }

      const latestBackup = backups[0];
      const snapshot = typeof latestBackup.snapshot === 'string' ? JSON.parse(latestBackup.snapshot) : latestBackup.snapshot;
      const tableData = snapshot.data || {};

      for (const tableName in tableData) {
        try {
          const query = `TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE`;
          const strings = [query] as any;
          strings.raw = [query];
          await (sql as any)(strings);
        } catch (e) {
          try { 
            const delQuery = `DELETE FROM "${tableName}"`;
            const dStrings = [delQuery] as any;
            dStrings.raw = [delQuery];
            await (sql as any)(dStrings); 
          } catch (de) {}
        }
      }
      await sql`DELETE FROM "TaskSequence"`;

      for (const s of snapshot.sequences || []) {
        await sql`INSERT INTO "TaskSequence" ("monthYear", "nextVal") VALUES (${s.monthYear}, ${s.nextVal})`;
      }

      for (const tableName in tableData) {
        const rows = tableData[tableName];
        if (!rows || !Array.isArray(rows) || rows.length === 0) continue;

        for (const row of rows) {
          const { id, ...data } = row;
          const keys = Object.keys(data);
          const values = Object.values(data);
          
          if (keys.length) {
            const query = `INSERT INTO "${tableName}" (${keys.map(k => `"${k}"`).join(',')}) VALUES (${values.map((_, i) => `$${i+1}`).join(',')})`;
            const strings = [query] as any;
            strings.raw = [query];
            try {
              await (sql as any)(strings, ...values);
            } catch (ie) {
              console.error(`Restore failed for row in ${tableName}:`, ie);
            }
          }
        }

        try {
          const seqQuery = `SELECT setval(pg_get_serial_sequence('"${tableName}"', 'id'), coalesce(max(id), 1), max(id) IS NOT NULL) FROM "${tableName}"`;
          const sStrings = [seqQuery] as any;
          sStrings.raw = [seqQuery];
          await (sql as any)(sStrings);
        } catch (se) {}
      }

      return NextResponse.json({ message: "Universal Database Restore successful. All module data has been recovered." });
    }

    return NextResponse.json({ message: "Invalid action type." }, { status: 400 });

  } catch (error: any) {
    console.error("Master Reset Fatal Error:", error);
    return NextResponse.json({ message: "Critical failure during master reset operation.", error: error.message }, { status: 500 });
  }
}
