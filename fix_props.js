const fs = require('fs');
const file = 'src/components/DashboardClient.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/<MetricCard /g, '<MetricCard t={t} ');
content = content.replace(/<StatusPill /g, '<StatusPill t={t} ');

fs.writeFileSync(file, content);
console.log("Done");
