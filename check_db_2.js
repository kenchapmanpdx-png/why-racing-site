console.log('STARTING SCRIPT');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkData() {
    console.log('Checking database...');

    // 1. Get all Races
    const { data: races, error: rErr } = await supabase.from('races').select('id, name');
    if (rErr) console.log('Race Error:', rErr.message);
    else console.log(`Found ${races.length} races.`);

    // 2. Count Pricing Tiers
    const { count, error } = await supabase.from('pricing_tiers').select('*', { count: 'exact', head: true });
    if (error) console.log('Count Error:', error.message);
    else console.log(`Total Pricing Tiers: ${count}`);

    // 3. Check specific tiers
    if (count > 0) {
        const { data: tiers } = await supabase.from('pricing_tiers').select('*').limit(3);
        console.log('Sample Tiers:', JSON.stringify(tiers));
    } else {
        console.log('WARNING: No pricing tiers found!');
    }
}

checkData();
