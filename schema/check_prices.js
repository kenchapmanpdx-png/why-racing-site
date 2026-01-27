require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkPrices() {
    const { data: races, error: raceError } = await supabase
        .from('races')
        .select('id, name')
        .or('name.ilike.%Girlfriend%,name.ilike.%Apple%,name.ilike.%Pacific%');

    if (raceError) {
        console.error('Error fetching races:', raceError.message);
        return;
    }

    for (const race of races) {
        const { data: dists, error: distError } = await supabase
            .from('race_distances')
            .select('name, base_price')
            .eq('race_id', race.id);

        console.log(`\nRace: ${race.name} (${race.id})`);
        if (distError) {
            console.error(`  Error fetching distances: ${distError.message}`);
        } else if (dists.length === 0) {
            console.log('  No distances found.');
        } else {
            dists.forEach(d => {
                console.log(`  - ${d.name}: $${d.base_price}`);
            });
        }
    }
}

checkPrices();
