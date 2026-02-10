const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Map race name patterns to local logo file paths
const raceLogos = [
    { pattern: "Bigfoot", logo: "images/logos/Bigfoot logo (1).png" },
    { pattern: "Columbia River Tri", logo: "images/logos/Columbia-River-Tri.png" },
    { pattern: "Couve Clover", logo: "images/logos/Couve Clover.png" },
    { pattern: "Battle to the Pacific", logo: "images/logos/Final Battle to the Pacific Golden Trucker 2025.pn (1).png" },
    { pattern: "Girlfriends Half", logo: "images/logos/Girlfriends Half Marathon.png" },
    { pattern: "Girlfriends Triathlon", logo: "images/logos/Girlfriends Triathalon.png" },
    { pattern: "PDX Triathlon", logo: "images/logos/PDX Triathalon.png" },
    { pattern: "Pacific Coast", logo: "images/logos/Pacific Coast.png" },
    { pattern: "Pacific Crest", logo: "images/logos/Pacific Crest.png" },
    { pattern: "Reflection Run", logo: "images/logos/Reflectin Run.png" },
    { pattern: "Resolution Run", logo: "images/logos/Resolution Run .png" },
    { pattern: "Santa", logo: "images/logos/Santas Holiday Hustle 2.png" },
    { pattern: "Scary Run", logo: "images/logos/Scary Run.png" },
    { pattern: "Silver Falls", logo: "images/logos/Silver Falls.png" },
    { pattern: "Spring Classic", logo: "images/logos/Spring Classic.png" },
    { pattern: "White River", logo: "images/logos/White River Snowshoe.png" },
    { pattern: "Hagg Lake", logo: "images/logos/Hagg Lake.png" },
    { pattern: "Stub Stewart Trail Challenge", logo: "images/logos/Stub Stewart Challenge.png" },
    { pattern: "Hellz Bellz", logo: "images/logos/Hellz Bellz.png" },
];

async function updateLogos() {
    console.log('=== Updating Race Logos ===\n');

    const { data: races, error } = await supabase
        .from('races')
        .select('id, name, logo_url')
        .order('race_date');

    if (error) {
        console.error('Error fetching races:', error);
        return;
    }

    console.log(`Found ${races.length} total races.\n`);

    let updated = 0;
    let notFound = [];

    for (const entry of raceLogos) {
        const match = races.find(r => r.name.toLowerCase().includes(entry.pattern.toLowerCase()));

        if (!match) {
            notFound.push(entry.pattern);
            continue;
        }

        if (match.logo_url === entry.logo) {
            console.log(`✓ ${match.name} — already set`);
            continue;
        }

        const { error: updateError } = await supabase
            .from('races')
            .update({ logo_url: entry.logo })
            .eq('id', match.id);

        if (updateError) {
            console.error(`✗ ${match.name} — ERROR:`, updateError.message);
        } else {
            console.log(`✓ ${match.name} — logo set to: ${entry.logo}`);
            updated++;
        }
    }

    console.log(`\n=== Summary ===`);
    console.log(`Updated: ${updated}`);
    if (notFound.length > 0) {
        console.log(`Not found: ${notFound.join(', ')}`);
    }
    console.log('Done!');
}

updateLogos();
