const fs = require('fs');
const code = fs.readFileSync('src/components/DashboardClient.tsx', 'utf8');
const lines = code.split('\n');

let braces = 0;
let parens = 0;
let inString = null;
let inComment = null;
let escaped = false;

for (let l = 0; l < lines.length; l++) {
  const line = lines[l];
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i+1];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (inComment === '//') continue; // Handled at end of line loop
    
    if (inComment === '/*') {
      if (char === '*' && next === '/') {
        inComment = null;
        i++;
      }
      continue;
    }

    if (inString) {
      if (char === '\\') {
        escaped = true;
        continue;
      }
      if (char === inString) {
        inString = null;
      }
      if (inString === '`' && char === '$' && next === '{') {
        braces++;
        i++;
      }
      continue;
    }

    if (char === '/' && next === '/') {
      inComment = '//';
      break; 
    }
    if (char === '/' && next === '*') {
      inComment = '/*';
      i++;
      continue;
    }

    if (char === "'" || char === '"' || char === '`') {
      inString = char;
      continue;
    }

    if (char === '{') braces++;
    if (char === '}') braces--;
    if (char === '(') parens++;
    if (char === ')') parens--;
  }
  if (inComment === '//') inComment = null;
  console.log(`${l + 1}: ${braces}, ${parens}`);
}
