const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load .env manually
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.join('=').trim();
    }
});

const sql = neon(env.DATABASE_URL);

async function checkAndAddColumn() {
    try {
        console.log("Checking for 'category' column in 'LearningResource' table...");
        const columns = await sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'LearningResource' AND column_name = 'category'
        `;
        
        if (columns.length === 0) {
            console.log("Column 'category' not found. Adding it...");
            await sql`ALTER TABLE "LearningResource" ADD COLUMN "category" TEXT DEFAULT 'Miscellaneous'`;
            console.log("Column 'category' added successfully.");
        } else {
            console.log("Column 'category' already exists.");
        }

        console.log("Checking for 'SystemSettings' table 'masterResourceCategories' column...");
        const settingsColumns = await sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'SystemSettings' AND column_name = 'masterResourceCategories'
        `;

        if (settingsColumns.length === 0) {
            console.log("Column 'masterResourceCategories' not found in 'SystemSettings'. Adding it...");
            await sql`ALTER TABLE "SystemSettings" ADD COLUMN "masterResourceCategories" TEXT DEFAULT 'Goods & Service Tax,Income Tax,Audit,ROC,IND AS,Miscellaneous'`;
            console.log("Column 'masterResourceCategories' added successfully.");
        } else {
            console.log("Column 'masterResourceCategories' already exists.");
        }

    } catch (err) {
        console.error("Migration failed:", err);
    }
}

checkAndAddColumn();
