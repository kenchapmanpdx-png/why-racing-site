const fs = require('fs');
const path = require('path');

const directory = '.';

const walkSync = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            if (file !== '.git' && file !== 'node_modules' && file !== 'images' && file !== 'attached_assets' && file !== '.antigravity') {
                filelist = walkSync(filePath, filelist);
            }
        } else {
            if (filePath.endsWith('.html') || filePath.endsWith('.js')) {
                filelist.push(filePath);
            }
        }
    });
    return filelist;
};

const files = walkSync(directory);
let updatedTextCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // matches "WHY RACING EVENTS", "WHY RACING EVENTS", "WHY RACING EVENTS", "WHY RACING EVENTS", "WHY RACING EVENTS", etc.
    const regex = /\b[Ww][Hh][Yy]\s+[Rr]acing(?:'s)?(?:\s+[Ee]vents?)?\b/g;
    content = content.replace(regex, 'WHY RACING EVENTS');

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        updatedTextCount++;
    }
});

console.log(`Updated 'WHY RACING EVENTS' text in ${updatedTextCount} files.`);
