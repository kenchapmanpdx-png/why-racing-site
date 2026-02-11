const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const LOGO_PATH = 'images/logos/x-dog-logo.png';

async function updateMoreRaces() {
    const namesToUpdate = ["McCubbin's Gulch", "Ho Ho 5K"];

    console.log('Updating logos for:', namesToUpdate);

    for (const name of namesToUpdate) {
        // Use exact match or simple ilike
        const { data, error } = await supabase
            .from('races')
            .update({ logo_url: LOGO_PATH })
            .ilike('name', `%${name}%`);

        if (error) {
            console.error(`Error updating ${name}:`, error);
        } else {
            console.log(`Successfully updated logo for races matching: ${name}`);
        }
    }

    // Verification
    const { data: finalData } = await supabase
        .from('races')
        .select('name, logo_url')
        .or('name.ilike.%McCubbins%,name.ilike.%Ho ho%');

    console.log('\nFinal state for new races in DB:');
    console.log(JSON.stringify(finalData, null, 2));
}

updateMoreRaces();
