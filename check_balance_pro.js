const fs = require('fs');
const code = fs.readFileSync('src/components/DashboardClient.tsx', 'utf8');

let braces = 0;
let parens = 0;
let inString = null; // ' " or `
let inComment = null; // // or /*
let escaped = false;

for (let i = 0; i < code.length; i++) {
  const char = code[i];
  const next = code[i+1];

  if (escaped) {
    escaped = false;
    continue;
  }

  if (inComment === '//') {
    if (char === '\n') inComment = null;
    continue;
  }
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
    // Handle template literal interpolation
    if (inString === '`' && char === '$' && next === '{') {
      // This is tricky because we enter a JS context inside a string
      // For now let's just count it as a brace
      braces++;
      i++;
    }
    continue;
  }

  if (char === '/' && next === '/') {
    inComment = '//';
    i++;
    continue;
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

console.log(`Final Balance: { braces: ${braces}, parens: ${parens} }`);
