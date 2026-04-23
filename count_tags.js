const fs = require('fs');
const code = fs.readFileSync('src/components/DashboardClient.tsx', 'utf8');

const divOpen = (code.match(/<div/g) || []).length;
const divClose = (code.match(/<\/div>/g) || []).length;

const sectionOpen = (code.match(/<section/g) || []).length;
const sectionClose = (code.match(/<\/section>/g) || []).length;

const mainOpen = (code.match(/<main/g) || []).length;
const mainClose = (code.match(/<\/main>/g) || []).length;

console.log(`div: ${divOpen} / ${divClose}`);
console.log(`section: ${sectionOpen} / ${sectionClose}`);
console.log(`main: ${mainOpen} / ${mainClose}`);
