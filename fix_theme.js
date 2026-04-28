const fs = require('fs');
const file = 'src/components/DashboardClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replacements
content = content.replace(/background:\s*"(?:white|#ffffff)"/gi, 'background: t.card');
content = content.replace(/background:\s*"#f8fafc"/gi, 'background: t.background');
content = content.replace(/background:\s*"#f1f5f9"/gi, 'background: t.background');
content = content.replace(/color:\s*"(?:#0f172a|#1e293b|#334155|#111827)"/gi, 'color: t.text');
content = content.replace(/color:\s*"(?:#475569|#64748b|#94a3b8|#6b7280|#666)"/gi, 'color: t.textMuted');
content = content.replace(/border:\s*"1px\s+solid\s+(?:#e2e8f0|#cbd5e1)"/gi, 'border: `1px solid ${t.border}`');
content = content.replace(/borderBottom:\s*"1px\s+solid\s+(?:#e2e8f0|#cbd5e1)"/gi, 'borderBottom: `1px solid ${t.border}`');
content = content.replace(/borderTop:\s*"1px\s+solid\s+(?:#e2e8f0|#cbd5e1)"/gi, 'borderTop: `1px solid ${t.border}`');
content = content.replace(/borderRight:\s*"1px\s+solid\s+(?:#e2e8f0|#cbd5e1)"/gi, 'borderRight: `1px solid ${t.border}`');
content = content.replace(/borderLeft:\s*"1px\s+solid\s+(?:#e2e8f0|#cbd5e1)"/gi, 'borderLeft: `1px solid ${t.border}`');
content = content.replace(/borderColor:\s*"(?:#e2e8f0|#cbd5e1)"/gi, 'borderColor: t.border');
content = content.replace(/background:\s*"#e2e8f0"/gi, 'background: t.border');
content = content.replace(/backgroundColor:\s*"(?:white|#ffffff)"/gi, 'backgroundColor: t.card');
content = content.replace(/backgroundColor:\s*"#f8fafc"/gi, 'backgroundColor: t.background');

// Also inject the useTheme hook if not already there
if (!content.includes('useTheme')) {
  // Add import
  content = content.replace('import { useSession } from "next-auth/react";', 'import { useSession } from "next-auth/react";\nimport { useTheme } from "@/context/ThemeContext";\nimport { theme } from "@/theme";');
  
  // Add hook inside DashboardClient component
  content = content.replace('export default function DashboardClient({', 'export default function DashboardClient({\n');
  content = content.replace('const { data: session, status } = useSession();', 'const { data: session, status } = useSession();\n  const { isDarkMode } = useTheme();\n  const t = isDarkMode ? theme.dark : theme.light;');
}

fs.writeFileSync(file, content);
console.log("Done");
