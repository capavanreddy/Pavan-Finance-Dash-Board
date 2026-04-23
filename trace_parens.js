const fs = require('fs');
const code = fs.readFileSync('src/components/DashboardClient.tsx', 'utf8');
const lines = code.split('\n');

let balance = 0;
for (let i = 1407; i < 1904; i++) {
  const line = lines[i];
  if (!line) continue;
  const opens = (line.match(/\(/g) || []).length;
  const closes = (line.match(/\)/g) || []).length;
  balance += opens;
  balance -= closes;
  console.log(`${i + 1}: ${balance}`);
}
