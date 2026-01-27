// Code Display Verification Script
// This checks that every field in the database has corresponding display code in race-detail.html

const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'pages', 'events', 'race-detail.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

const fields = [
    { dbField: 'race_date', searchTerms: ['race_date', 'raceDate', 'formatDate'], label: 'Race Date' },
    { dbField: 'race_time', searchTerms: ['race_time', 'raceTime', 'formatTime'], label: 'Race Time' },
    { dbField: 'city', searchTerms: ['race.city', 'city'], label: 'City' },
    { dbField: 'state', searchTerms: ['race.state', 'state'], label: 'State' },
    { dbField: 'venue', searchTerms: ['race.venue', 'raceVenue'], label: 'Venue' },
    { dbField: 'hero_image_url', searchTerms: ['hero_image_url', 'heroBackground'], label: 'Hero Image' },
    { dbField: 'description', searchTerms: ['race.description', 'raceDescription'], label: 'Description' },
    { dbField: 'terrain', searchTerms: ['race.terrain', 'Terrain'], label: 'Terrain' },
    { dbField: 'elevation', searchTerms: ['race.elevation', 'Elevation'], label: 'Elevation' },
    { dbField: 'parking', searchTerms: ['race.parking', 'parkingInfo'], label: 'Parking' },
    { dbField: 'aid_stations', searchTerms: ['race.aid_stations', 'aidInfo'], label: 'Aid Stations' },
    { dbField: 'includes', searchTerms: ['race.includes', 'includedList'], label: 'Includes/Swag' },
    { dbField: 'registration_url', searchTerms: ['registration_url', 'registerBtn'], label: 'Registration URL' },
    { dbField: 'race_distances', searchTerms: ['race_distances', 'distancesList'], label: 'Distances' },
    { dbField: 'youtube_url', searchTerms: ['youtube_url', 'youtubeEmbed'], label: 'YouTube Video' },
    { dbField: 'logo_url', searchTerms: ['logo_url', 'raceLogo'], label: 'Logo' },
    { dbField: 'gallery_images', searchTerms: ['gallery_images', 'galleryGrid'], label: 'Gallery' },
    { dbField: 'charity_name', searchTerms: ['charity_name', 'charityName'], label: 'Charity' },
    { dbField: 'packet_pickup', searchTerms: ['packet_pickup', 'packetInfo', 'pickupAccordion'], label: 'Packet Pickup' }
];

console.log('='.repeat(80));
console.log('CODE DISPLAY VERIFICATION');
console.log('Checking that race-detail.html has display code for each database field');
console.log('='.repeat(80));
console.log('');

let allFound = true;

fields.forEach(field => {
    const found = field.searchTerms.some(term => htmlContent.includes(term));
    const status = found ? '✅' : '❌';
    console.log(`${status} ${field.label} (${field.dbField})`);

    if (found) {
        // Show which search term was found
        const foundTerm = field.searchTerms.find(term => htmlContent.includes(term));
        console.log(`   Found: "${foundTerm}"`);
    } else {
        console.log(`   NOT FOUND - needs display code`);
        allFound = false;
    }
});

console.log('');
console.log('='.repeat(80));
if (allFound) {
    console.log('✅ All fields have corresponding display code in race-detail.html');
} else {
    console.log('⚠️ Some fields are missing display code - see above');
}
console.log('='.repeat(80));
