const fs = require('fs');
const file = 'src/components/DashboardClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// Inject hook into MetricCard
content = content.replace(
  'function MetricCard({ title, value, icon, bg, isActive, onClick }: { title: string, value: number, icon: any, bg: string, isActive?: boolean, onClick?: () => void }) {\n',
  'function MetricCard({ title, value, icon, bg, isActive, onClick }: { title: string, value: number, icon: any, bg: string, isActive?: boolean, onClick?: () => void }) {\n  const { isDarkMode } = useTheme();\n  const t = isDarkMode ? theme.dark : theme.light;\n'
);

// Inject hook into StatusPill
content = content.replace(
  'function StatusPill({ status, type, taskId, onUpdate, disabled }: { status: string, type: "task" | "review", taskId: number, onUpdate: any, disabled?: boolean }) {\n',
  'function StatusPill({ status, type, taskId, onUpdate, disabled }: { status: string, type: "task" | "review", taskId: number, onUpdate: any, disabled?: boolean }) {\n  const { isDarkMode } = useTheme();\n  const t = isDarkMode ? theme.dark : theme.light;\n'
);

// Also remove `background: t.card` where it says `backgroundColor: t.card` because t.card is a hex value
content = content.replace(/background:\s*t\.card/gi, 'background: t.card');

fs.writeFileSync(file, content);
console.log("Done");
