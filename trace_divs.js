const fs = require('fs');
const code = fs.readFileSync('src/components/DashboardClient.tsx', 'utf8');
const lines = code.split('\n');

let balance = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const opens = (line.match(/<div/g) || []).length;
  const closes = (line.match(/<\/div>/g) || []).length;
  balance += opens;
  balance -= closes;
  console.log(`${i + 1}: ${balance}`);
}
