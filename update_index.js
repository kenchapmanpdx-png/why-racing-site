const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'index.html');
let content = fs.readFileSync(targetFile, 'utf8');

const targetStr = `            const card = document.createElement('div');
            card.className = 'event-card dynamic-db-card loading';
            card.dataset.distance = filterKeywords;
            card.dataset.dateSort = race.race_date;
            // Set staggered delay
            card.style.transitionDelay = \\\`\\${index * 0.05}s\\\`;

            card.innerHTML = \\\`
                <div class="card-img-container skeleton" onclick="showRaceDetails('\\${infoUrl}')" style="cursor: pointer;">
                    <img src="\\${cardImage}" alt="\\${race.name}" loading="lazy" class="loading" onload="this.classList.remove('loading'); this.parentElement.classList.remove('skeleton')" style="\\${race.name.includes('Bigfoot') ? 'object-position: center 25%' : ''}">
                </div>
                <div class="card-body">
                    <div onclick="showRaceDetails('\\${infoUrl}')" style="cursor: pointer;">
                        <span class="card-date">\\${dateStr}</span>
                        <h3 class="card-title">\\${race.name || 'New Race'}</h3>
                    </div>`;

const replacementStr = `            const distancesHtml = race.distances ? \\\`<div class="card-distance" style="font-size: 13px; font-weight: 500; color: #555; margin-top: 4px; line-height: 1.4;">\\${race.distances}</div>\\\` : '';

            const card = document.createElement('div');
            card.className = 'event-card dynamic-db-card loading';
            card.dataset.distance = filterKeywords;
            card.dataset.dateSort = race.race_date;
            // Set staggered delay
            card.style.transitionDelay = \\\`\\${index * 0.05}s\\\`;

            card.innerHTML = \\\`
                <div class="card-img-container skeleton" onclick="showRaceDetails('\\${infoUrl}')" style="cursor: pointer;">
                    <img src="\\${cardImage}" alt="\\${race.name}" loading="lazy" class="loading" onload="this.classList.remove('loading'); this.parentElement.classList.remove('skeleton')" style="\\${race.name.includes('Bigfoot') ? 'object-position: center 25%' : ''}">
                </div>
                <div class="card-body">
                    <div onclick="showRaceDetails('\\${infoUrl}')" style="cursor: pointer;">
                        <span class="card-date">\\${dateStr}</span>
                        <h3 class="card-title">\\${race.name || 'New Race'}</h3>
                        \\${distancesHtml}
                    </div>`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replacementStr);
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('Successfully updated index.html.');
} else {
    console.log('Could not find target string in index.html to replace.');
}
