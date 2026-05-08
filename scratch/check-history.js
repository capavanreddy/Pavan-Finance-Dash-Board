const { neon } = require('@neondatabase/serverless');
const sql = neon('postgresql://neondb_owner:npg_tLglxokS0zd1@ep-ancient-fire-an72s4f8-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
sql`SELECT * FROM "AssignmentHistory" WHERE "templateId" = 127 ORDER BY "effectiveFrom" ASC, "createdAt" ASC`.then(res => console.log(JSON.stringify(res, null, 2)));
