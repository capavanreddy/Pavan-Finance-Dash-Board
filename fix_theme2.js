const fs = require('fs');
const file = 'src/components/DashboardClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replacements
content = content.replace(/background:\s*"(?:white|#ffffff)"/gi, 'background: t.card');
content = content.replace(/background:\s*"#f8fafc"/gi, 'background: t.bg');
content = content.replace(/background:\s*"#f1f5f9"/gi, 'background: t.bg');
content = content.replace(/color:\s*"(?:#0f172a|#1e293b|#334155|#111827)"/gi, 'color: t.text');
content = content.replace(/color:\s*"(?:#475569|#64748b|#94a3b8|#6b7280|#666|#666666)"/gi, 'color: t.textMuted');
content = content.replace(/border:\s*"1px\s+solid\s+(?:#e2e8f0|#cbd5e1)"/gi, 'border: `1px solid ${t.border}`');
content = content.replace(/borderBottom:\s*"1px\s+solid\s+(?:#e2e8f0|#cbd5e1)"/gi, 'borderBottom: `1px solid ${t.border}`');
content = content.replace(/borderTop:\s*"1px\s+solid\s+(?:#e2e8f0|#cbd5e1)"/gi, 'borderTop: `1px solid ${t.border}`');
content = content.replace(/borderRight:\s*"1px\s+solid\s+(?:#e2e8f0|#cbd5e1)"/gi, 'borderRight: `1px solid ${t.border}`');
content = content.replace(/borderLeft:\s*"1px\s+solid\s+(?:#e2e8f0|#cbd5e1)"/gi, 'borderLeft: `1px solid ${t.border}`');
content = content.replace(/borderColor:\s*"(?:#e2e8f0|#cbd5e1)"/gi, 'borderColor: t.border');
content = content.replace(/backgroundColor:\s*"(?:white|#ffffff)"/gi, 'backgroundColor: t.card');
content = content.replace(/backgroundColor:\s*"#f8fafc"/gi, 'backgroundColor: t.bg');

fs.writeFileSync(file, content);
console.log("Done");
