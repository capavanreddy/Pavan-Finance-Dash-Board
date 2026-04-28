const fs = require('fs');
const file = 'src/components/DashboardClient.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/thStyle/g, 'getThStyle(t)');
content = content.replace(/tdStyle/g, 'getTdStyle(t)');
content = content.replace(/inputStyle/g, 'getInputStyle(t)');

content = content.replace(/getgetThStyle\(t\)\(t\)/g, 'getThStyle(t)');
content = content.replace(/getgetTdStyle\(t\)\(t\)/g, 'getTdStyle(t)');
content = content.replace(/getgetInputStyle\(t\)\(t\)/g, 'getInputStyle(t)');

content = content.replace(/const getThStyle\(t\) =/g, 'const getThStyle =');
content = content.replace(/const getTdStyle\(t\) =/g, 'const getTdStyle =');
content = content.replace(/const getInputStyle\(t\) =/g, 'const getInputStyle =');

fs.writeFileSync(file, content);
console.log("Done");
