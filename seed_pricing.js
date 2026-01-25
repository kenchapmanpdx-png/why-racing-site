const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedPricing() {
    console.log('Seeding pricing data...');

    // 1. Get White River Race
    const { data: races } = await supabase.from('races').select('*').ilike('name', '%White River%');
    const whiteRiver = races[0];

    if (whiteRiver) {
        console.log('Found:', whiteRiver.name);
        // Get distances
        const { data: dists } = await supabase.from('race_distances').select('*').eq('race_id', whiteRiver.id);

        if (dists && dists.length > 0) {
            const dist = dists[0];
            console.log('Using Distance:', dist.name);

            // Add Early Bird
            const today = new Date();
            const nextWeek = new Date(today);
            nextWeek.setDate(today.getDate() + 5); // 5 days from now

            const nextMonth = new Date(today);
            nextMonth.setDate(today.getDate() + 45);

            const { error } = await supabase.from('pricing_tiers').insert([
                {
                    race_id: whiteRiver.id,
                    distance_id: dist.id,
                    tier_name: 'Super Early Bird',
                    price: 35.00,
                    start_date: today.toISOString(),
                    end_date: nextWeek.toISOString()
                },
                {
                    race_id: whiteRiver.id,
                    distance_id: dist.id,
                    tier_name: 'Standard',
                    price: 55.00,
                    start_date: nextWeek.toISOString(),
                    end_date: nextMonth.toISOString() // Future
                }
            ]);

            if (error) console.error('Insert Error:', error);
            else console.log('Added pricing tiers to White River!');
        }
    }

    console.log('Done!');
}

seedPricing();
