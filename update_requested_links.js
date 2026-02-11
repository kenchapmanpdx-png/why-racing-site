const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const requestedUpdates = [
    {
        name: "White River Snow Shoe",
        date: "2026-02-07",
        info_url: "https://www.xdogadventures.org/content",
        reg_url: "https://runsignup.com/Race/OR/GovernmentCamp/WhiteRiverSnowShoe8k4k",
        type: "trail",
        city: "Government Camp",
        state: "OR"
    },
    {
        name: "Maupin Daze",
        date: "2026-05-16",
        info_url: "https://www.xdogadventures.org/maupin-daze",
        reg_url: "https://www.xdogadventures.org/maupin-daze",
        type: "run",
        city: "Maupin",
        state: "OR"
    },
    {
        name: "Mt Hood Scramble",
        date: "2026-06-14",
        info_url: "https://www.xdogadventures.org/mt-hood-scramble",
        reg_url: "https://www.xdogadventures.org/mt-hood-scramble",
        type: "trail",
        city: "Mt. Hood",
        state: "OR"
    },
    {
        name: "McCubbins Gulch",
        date: "2026-07-12",
        info_url: "https://www.xdogadventures.org/mccubbins-gulch",
        reg_url: "https://www.xdogadventures.org/mccubbins-gulch",
        type: "trail",
        city: "Maupin",
        state: "OR"
    },
    {
        name: "Ho Ho 5K",
        date: "2025-12-07",
        info_url: "https://www.xdogadventures.org/hoho-run-1",
        reg_url: "https://www.xdogadventures.org/hoho-run-1",
        type: "run",
        city: "Vancouver",
        state: "WA"
    }
];

async function runUpdates() {
    console.log('🚀 Starting requested race link updates...');

    for (const raceData of requestedUpdates) {
        // Try to find the race by name (partial match)
        const { data: existingRaces } = await supabase
            .from('races')
            .select('id, name')
            .ilike('name', `%${raceData.name}%`);

        if (existingRaces && existingRaces.length > 0) {
            for (const race of existingRaces) {
                const { error } = await supabase
                    .from('races')
                    .update({
                        instructions_pdf_url: raceData.info_url,
                        registration_url: raceData.reg_url,
                        registration_open: true,
                        is_visible: true,
                        status: 'active',
                        race_date: raceData.date // Update date too if provided
                    })
                    .eq('id', race.id);

                if (error) {
                    console.error(`❌ Failed to update ${race.name}:`, error.message);
                } else {
                    console.log(`✅ Updated ${race.name}`);
                }
            }
        } else {
            // Insert if not found
            console.log(`➕ Race not found, creating ${raceData.name}...`);
            const { error } = await supabase
                .from('races')
                .insert({
                    name: raceData.name,
                    race_date: raceData.date,
                    race_type: raceData.type,
                    city: raceData.city,
                    state: raceData.state,
                    instructions_pdf_url: raceData.info_url,
                    registration_url: raceData.reg_url,
                    registration_open: true,
                    is_visible: true,
                    status: 'active'
                });

            if (error) {
                console.error(`❌ Failed to create ${raceData.name}:`, error);
            } else {
                console.log(`✅ Created ${raceData.name}`);
            }
        }
    }

    console.log('\n✨ All requested updates completed!');
}

runUpdates();
