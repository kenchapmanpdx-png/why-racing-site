const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const LOGO_PATH = 'images/logos/x-dog-logo.png';

async function updateRaces() {
    // Maupin Daze is likely the Moppin' Dayz mentioned
    const namesToUpdate = ["Coven's Gulch", "Mt Hood Scramble", "Maupin Daze"];

    console.log('Updating logos for:', namesToUpdate);

    for (const name of namesToUpdate) {
        const { data, error } = await supabase
            .from('races')
            .update({ logo_url: LOGO_PATH })
            .ilike('name', `%${name.split("'")[0]}%`); // Use partial match to be safe

        if (error) {
            console.error(`Error updating ${name}:`, error);
        } else {
            console.log(`Successfully updated logo for races matching: ${name}`);
        }
    }

    // Double check search to see what we actually updated
    const { data: finalData } = await supabase
        .from('races')
        .select('name, logo_url')
        .or('name.ilike.%Coven%,name.ilike.%Scramble%,name.ilike.%Maupin%,name.ilike.%Moppin%');

    console.log('\nFinal state in DB:');
    console.log(JSON.stringify(finalData, null, 2));
}

updateRaces();
