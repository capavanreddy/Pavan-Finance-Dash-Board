const fs = require('fs');
const file = 'src/components/DashboardClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix borderTopcolor typo
content = content.replace(/borderTopcolor/gi, 'borderTopColor');

// Convert global styles to functions
content = content.replace(/const thStyle = \{/g, 'const getThStyle = (t: any) => ({');
content = content.replace(/const tdStyle = \{/g, 'const getTdStyle = (t: any) => ({');
content = content.replace(/const inputStyle = \{/g, 'const getInputStyle = (t: any) => ({');

// Make them return an object
content = content.replace(/borderBottom:\s*`1px solid \$\{t\.border\}`,\n\s*whiteSpace:\s*"nowrap" as const,\n\};/g, 'borderBottom: `1px solid ${t.border}`,\n  whiteSpace: "nowrap" as const,\n});');
content = content.replace(/verticalAlign:\s*"middle" as const,\n\};/g, 'verticalAlign: "middle" as const,\n});');
content = content.replace(/fontFamily:\s*"inherit"\n\};/g, 'fontFamily: "inherit"\n});');

// Update usages
content = content.replace(/style=\{thStyle\}/g, 'style={getThStyle(t)}');
content = content.replace(/style=\{tdStyle\}/g, 'style={getTdStyle(t)}');
content = content.replace(/style=\{inputStyle\}/g, 'style={getInputStyle(t)}');

fs.writeFileSync(file, content);
console.log("Done");
