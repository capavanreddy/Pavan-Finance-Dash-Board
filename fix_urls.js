const fs = require('fs');
const files = [
  'src/app/api/tasks/route.ts',
  'src/app/api/tasks/[id]/route.ts',
  'src/app/api/tasks/[id]/request-edit/route.ts',
  'src/app/api/tasks/[id]/request-delete/route.ts',
  'src/app/api/recurring-tasks/generate/route.ts',
  'src/app/api/lo/[id]/request-edit/route.ts',
  'src/app/api/cron/daily-summary/route.ts'
];

const oldUrl = 'https://intellicar-finance-team-task-manage-one.vercel.app/';
const newUrl = 'https://v0-finpulse.vercel.app/';

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes(oldUrl)) {
      content = content.split(oldUrl).join(newUrl);
      fs.writeFileSync(file, content);
      console.log(`Fixed: ${file}`);
    } else {
      console.log(`Skipped (not found): ${file}`);
    }
  } else {
    console.log(`File not found: ${file}`);
  }
});
