const fs = require('fs');
const code = fs.readFileSync('src/components/DashboardClient.tsx', 'utf8');

let braces = 0;
let inString = false;
let quoteChar = '';
let inComment = false;
let inTemplate = false;

for (let i = 0; i < code.length; i++) {
  const char = code[i];
  const next = code[i+1];
  
  if (inComment) {
    if (char === '*' && next === '/') {
      inComment = false;
      i++;
    }
    continue;
  }
  
  if (inString) {
    if (char === '\\') { i++; continue; }
    if (char === quoteChar) inString = false;
    continue;
  }
  
  if (inTemplate) {
    if (char === '\\') { i++; continue; }
    if (char === '`') inTemplate = false;
    if (char === '$' && next === '{') {
      braces++;
      i++;
    }
    continue;
  }
  
  if (char === '/' && next === '*') { inComment = true; i++; continue; }
  if (char === '/' && next === '/') {
    // skip to end of line
    while (i < code.length && code[i] !== '\n') i++;
    continue;
  }
  
  if (char === '"' || char === "'") { inString = true; quoteChar = char; continue; }
  if (char === '`') { inTemplate = true; continue; }
  
  if (char === '{') braces++;
  if (char === '}') braces--;
}

console.log(`Final Brace Balance: ${braces}`);
