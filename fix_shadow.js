const fs = require('fs');
const file = 'src/components/DashboardClient.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\(t, idx\) => \{/g, '(timeStr, idx) => {');
content = content.replace(/convertTo12h\(t\.trim\(\)\)/g, 'convertTo12h(timeStr.trim())');

fs.writeFileSync(file, content);
console.log("Done");
