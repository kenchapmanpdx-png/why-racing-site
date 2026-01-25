const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugInsert() {
    console.log('Debugging...');

    // 1. Check Race
    const { data: race } = await supabase.from('races').select('id, name').ilike('name', '%White River%').single();
    if (!race) { console.log('Race not found'); return; }
    console.log('Race:', race.name, race.id);

    // 2. Check Distances
    const { data: dist } = await supabase.from('race_distances').select('id, name').eq('race_id', race.id).limit(1).single();
    if (!dist) { console.log('Distance not found'); return; }
    console.log('Distance:', dist.name, dist.id);

    // 3. Try Insert
    const today = new Date().toISOString();
    const { data, error } = await supabase.from('pricing_tiers').insert([
        {
            race_id: race.id,
            distance_id: dist.id,
            tier_name: 'Debug Tier',
            price: 10.00,
            start_date: today,
            end_date: today
        }
    ]).select();

    if (error) {
        console.error('INSERT ERROR:', error);
    } else {
        console.log('INSERT SUCCESS:', data);
    }
}

debugInsert();
