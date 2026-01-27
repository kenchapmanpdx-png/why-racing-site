require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const mapping = [
    { name: "Santa's Holiday Hustle", file: "santa-cover-1200-x-500-px.png" },
    { name: "Resolution Run", file: "Resolution-Run-Website-Home-Page-Tile-Photo.png" },
    { name: "White River Snowshoe", file: "snowshoe-run-guy.jpg" },
    { name: "Silver Falls Trail", file: "Screenshot-2022-04-14-173427.png" },
    { name: "Couve Clover Run", file: "couve-clover-run-banner.jpg" },
    { name: "Crown-Stub 100", file: "thumbnail_12143_Crown-Stub-WHY-Racing-2024-Marketing-Proof-01.png" },
    { name: "Stub Stewart Trail", file: "Screenshot-2022-04-14-173511.png" },
    { name: "Spring Classic", file: "spring-classic-photo-2.png" },
    { name: "Reflection Run", file: "reflectionruncover-1200-x-500-px.png" },
    { name: "PDX Triathlon Festival", file: "pdx-tri-banner.jpg" },
    { name: "Pacific Crest Endurance", file: "Pac-Crest-Pic.png" },
    { name: "Hagg Lake Triathlon", file: "Hagg-Lake-Why-Home.jpg" },
    { name: "Bigfoot 5K/10K", file: "bf-new-pic-2.png" },
    { name: "Hellz Bellz Ultra", file: "Screenshot-2022-04-14-173337.png" },
    { name: "Columbia River Triathlon", file: "columbia-river-tri-banner.jpg" },
    { name: "Girlfriends Triathlon", file: "girlfriend-tri-banner.jpg" },
    { name: "Appletree Marathon", file: "Untitled-1200-x-500-px.png" },
    { name: "Pacific Coast Running", file: "Photo-for-Home-Page-Website-RFS-pdf.jpg" },
    { name: "Girlfriends Run", file: "Girlfriends-Pic-2.png" },
    { name: "Scary Run", file: "scary-run-banner.jpg" },
    { name: "Battle to the Pacific", file: "Battle-to-the-Pacific-2.png" }
];

const dir = 'images/Scrapedimages';
const files = fs.readdirSync(dir);

async function run() {
    console.log('🚀 Applying official uniformity mapping for thumbnails...');
    const { data: races } = await supabase.from('races').select('id, name');

    for (const m of mapping) {
        const race = races.find(r => r.name.toLowerCase().includes(m.name.toLowerCase().split(' ')[0]));
        if (!race) { console.log(`Race not found: ${m.name}`); continue; }

        let targetFile = m.file;
        // Check if file exists, try case insensitive and common variants
        let found = files.find(f => f.toLowerCase() === targetFile.toLowerCase());

        if (!found) {
            // Try swapping png/jpg
            const base = targetFile.split('.')[0];
            found = files.find(f => f.toLowerCase().startsWith(base.toLowerCase()));
        }

        if (found) {
            console.log(`Updating ${race.name} with ${found}...`);
            await supabase.from('races').update({
                thumbnail_url: `/images/Scrapedimages/${found}`
            }).eq('id', race.id);
        } else {
            console.log(`❌ File NOT FOUND for ${m.name}: ${targetFile}`);
        }
    }
    console.log('✅ Uniformity mapping applied.');
}

run();
