const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Update distanceText to use custom distances string first
content = content.replace(
    /const distances = race\.race_distances \|\| \[\];\s*const distanceText = distances\.map\(d => d\.name \|\| d\.distance_value\)\.join\(' \/ '\) \|\| 'Details TBA';/,
    "const distances = race.race_distances || [];\n            const distanceText = race.distances || distances.map(d => d.name || d.distance_value).join(' / ') || 'Details TBA';"
);

// 2. Remove distancesHtml declaration
content = content.replace(
    /const distancesHtml = race\.distances \? `<div class="card-distance"[^>]*>\$\{race\.distances\}<\/div>` : '';/,
    ""
);

// 3. Remove distancesHtml from the UI template
content = content.replace(
    /<h3 class="card-title">\$\{race\.name \|\| 'New Race'\}<\/h3>\s*\$\{distancesHtml\}\s*<\/div>/,
    "<h3 class=\"card-title\">${race.name || 'New Race'}</h3>\n                    </div>"
);

fs.writeFileSync('index.html', content);
console.log("Updated index.html");
