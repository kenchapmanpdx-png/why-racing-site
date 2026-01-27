const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'pages', 'events', 'race-detail.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Extract all IDs from the HTML
const htmlIds = new Set();
const idRegex = /id="([^"]+)"/g;
let match;
while ((match = idRegex.exec(htmlContent)) !== null) {
    htmlIds.add(match[1]);
}

// Extract all IDs used in getElementById
const jsIds = new Set();
const jsRegex = /document\.getElementById\(['"]([^'"]+)['"]\)/g;
while ((match = jsRegex.exec(htmlContent)) !== null) {
    jsIds.add(match[1]);
}

console.log('='.repeat(70));
console.log('ID MISMATCH VERIFICATION');
console.log('='.repeat(70));

let issues = 0;
jsIds.forEach(id => {
    if (!htmlIds.has(id)) {
        console.log(`❌ JS mentions ID "${id}", but it is NOT in the HTML!`);
        issues++;
    }
});

if (issues === 0) {
    console.log('✅ All JS getElementById calls have matching HTML IDs');
}

console.log('='.repeat(70));
console.log(`Total JS IDs: ${jsIds.size}`);
console.log(`Total HTML IDs: ${htmlIds.size}`);
console.log('='.repeat(70));
