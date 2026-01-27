require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const fixes = [
    {
        name: 'Bigfoot 5K/10K',
        description: 'Join us for a scenic run through the heart of Sasquatch country! The Bigfoot 5K/10K takes you through the beautiful Skamania County trails with stunning views of the Columbia River Gorge. Perfect for all skill levels.'
    },
    {
        name: 'Girlfriends Triathlon',
        description: 'An all-women\'s multi-sport celebration at Frenchman\'s Bar Park! Experience the camaraderie, support, and fun of the Girlfriends Triathlon with a flat, fast course and a festive post-race party.'
    },
    {
        name: 'Girlfriends Half Marathon',
        description: 'The Girlfriends Half Marathon is the ultimate women\'s running event in the Pacific Northwest. Run through scenic Vancouver, from the waterfront to historic Officer\'s Row, with amazing crowd support and mimosas at the finish!'
    }
];

const priceFixes = [
    {
        raceName: 'PDX Triathlon Festival',
        distanceName: 'Kids',
        price: 25
    },
    {
        raceName: 'Columbia River Triathlon',
        distanceName: 'Girlfriends Sprint Tri',
        price: 140
    }
];

async function applyFixes() {
    console.log('🔧 Applying fixes to races with issues...');

    // Fix missing descriptions
    for (const fix of fixes) {
        const { error } = await supabase
            .from('races')
            .update({ description: fix.description })
            .ilike('name', `%${fix.name}%`);

        if (error) {
            console.error(`Error updating ${fix.name}:`, error.message);
        } else {
            console.log(`✅ Added description to ${fix.name}`);
        }
    }

    // Fix $0 prices
    for (const priceFix of priceFixes) {
        // Find race
        const { data: races } = await supabase
            .from('races')
            .select('id')
            .ilike('name', `%${priceFix.raceName}%`);

        if (races && races.length > 0) {
            const raceId = races[0].id;
            const { error } = await supabase
                .from('race_distances')
                .update({ base_price: priceFix.price })
                .eq('race_id', raceId)
                .ilike('name', `%${priceFix.distanceName}%`);

            if (error) {
                console.error(`Error fixing price for ${priceFix.distanceName}:`, error.message);
            } else {
                console.log(`✅ Set ${priceFix.distanceName} to $${priceFix.price}`);
            }
        }
    }

    console.log('🏁 Fixes applied.');
}

applyFixes();
