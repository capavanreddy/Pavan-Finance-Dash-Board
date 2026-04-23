const fs = require('fs');
const code = fs.readFileSync('src/components/DashboardClient.tsx', 'utf8');
const lines = code.split('\n');
let parens = 0;
let braces = 0;
for (let i = 0; i < lines.length; i++) {
  for (let char of lines[i]) {
    if (char === '{') braces++;
    if (char === '}') braces--;
    if (char === '(') parens++;
    if (char === ')') parens--;
  }
}
console.log('Final:', {braces, parens});
