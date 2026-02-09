const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Map of race name search patterns -> registration URLs
const raceLinks = [
    { pattern: "Santa's Holiday Hustle", url: "https://runsignup.com/Race/WA/Camas/SantasPosse5KRunWalk" },
    { pattern: "Resolution Run", url: "https://runsignup.com/Race/WA/LaCenter/WREResolutionRun" },
    { pattern: "White River Snowshoe", url: "https://runsignup.com/Race/OR/GovernmentCamp/WhiteRiverSnowShoe8k4k" },
    { pattern: "Silver Falls", url: "https://www.bivouacracing.com/silverfalls" },
    { pattern: "Couve Clover", url: "https://whyracingevents.com/couve-clover-run/" },
    { pattern: "Crown Stub", url: "https://www.bivouacracing.com/karissawhyracingeventscom" },
    { pattern: "Stub Stewart", url: "https://www.bivouacracing.com/stub-stewart" },
    { pattern: "Spring Classic", url: "https://whyracingevents.com/springclassic/" },
    { pattern: "Reflection Run", url: "https://whyracingevents.com/reflection-run/" },
    { pattern: "PDX Triathlon", url: "https://whyracingevents.com/pdx-triathlon-at-blue-lake/" },
    { pattern: "Pacific Crest Endurance", url: "https://whyracingevents.com/pacific-crest-endurance/" },
    { pattern: "Hagg Lake", url: "https://whyracingevents.com/hagg-lake-triathlon/" },
    { pattern: "Bigfoot", url: "https://runsignup.com/Race/WA/Yacolt/BigfootFunRun/" },
    { pattern: "Hellz Bellz", url: "https://www.bivouacracing.com/hellz-bellz-ultra" },
    { pattern: "Columbia River Tri", url: "https://whyracingevents.com/columbia-river-triathlon/" },
    { pattern: "Girlfriends Triathlon", url: "https://whyracingevents.com/girlfriends-triathlon-fitness-festival/" },
    { pattern: "Appletree", url: "https://whyracingevents.com/appletree-marathon/" },
    { pattern: "Pacific Coast", url: "https://whyracingevents.com/pacific-coast-running-festival/" },
    { pattern: "Girlfriends Half", url: "https://whyracingevents.com/girlfriends-run/" },
    { pattern: "Scary Run", url: "https://whyracingevents.com/scary-run/" },
    { pattern: "Battle to the Pacific", url: "https://www.bivouacracing.com/fort-stevens" },
];

async function updateRegistrationUrls() {
    console.log('=== Updating Registration URLs for 21 Races ===\n');

    // Get all races
    const { data: races, error } = await supabase
        .from('races')
        .select('id, name, registration_url, registration_open')
        .order('race_date');

    if (error) {
        console.error('Error fetching races:', error);
        return;
    }

    console.log(`Found ${races.length} total races in database.\n`);

    let updated = 0;
    let skipped = 0;
    let notFound = [];

    for (const link of raceLinks) {
        // Find matching race (case-insensitive partial match)
        const match = races.find(r => r.name.toLowerCase().includes(link.pattern.toLowerCase()));

        if (!match) {
            notFound.push(link.pattern);
            continue;
        }

        const oldUrl = match.registration_url;
        const needsUpdate = oldUrl !== link.url || !match.registration_open;

        if (!needsUpdate) {
            console.log(`✓ ${match.name} — already correct`);
            skipped++;
            continue;
        }

        // Update registration_url AND set registration_open to true 
        const { error: updateError } = await supabase
            .from('races')
            .update({
                registration_url: link.url,
                registration_open: true
            })
            .eq('id', match.id);

        if (updateError) {
            console.error(`✗ ${match.name} — ERROR:`, updateError.message);
        } else {
            const changeType = oldUrl ? `changed from ${oldUrl}` : 'was null';
            console.log(`✓ ${match.name} — updated (${changeType})`);
            updated++;
        }
    }

    console.log(`\n=== Summary ===`);
    console.log(`Updated: ${updated}`);
    console.log(`Already correct: ${skipped}`);
    if (notFound.length > 0) {
        console.log(`Not found: ${notFound.join(', ')}`);
    }
    console.log('Done!');
}

updateRegistrationUrls();
