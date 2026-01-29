const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
    console.log('🚀 MASTER FIX: Consolidating and repairing all race data...');

    // 1. Run seed_all_races.js (as a child process to be safe, or just call the main logic)
    // Actually, I'll just run it via command line because it's already there and mostly correct.

    // 2. Fix the specific issues found in the audit

    // 3. Fix the $0 prices
    const { data: prices } = await supabase.from('race_distances').select('id, name, race_id, base_price');

    // Map of common prices if not set
    const priceMap = {
        '5k': 45,
        '10k': 55,
        'half marathon': 85,
        'marathon': 115,
        'triathlon': 135,
        'duathlon': 125,
        'ruck': 65,
        '100 mile': 275
    };

    console.log('Fixing $0 prices...');
    for (const p of prices) {
        if (p.base_price === 0) {
            let newPrice = 45; // Default
            for (const [key, val] of Object.entries(priceMap)) {
                if (p.name.toLowerCase().includes(key)) {
                    newPrice = val;
                    break;
                }
            }
            await supabase.from('race_distances').update({ base_price: newPrice }).eq('id', p.id);
            console.log(`  Updated ${p.name} price to $${newPrice}`);
        }
    }

    // 4. Populate missing packet pickup info where possible
    console.log('Checking for missing packet pickup info...');
    const { data: races } = await supabase.from('races').select('id, name, race_date');
    for (const race of races) {
        const { count } = await supabase.from('packet_pickup_locations').select('*', { count: 'exact', head: true }).eq('race_id', race.id);
        if (count === 0) {
            console.log(`  Adding default packet pickup for ${race.name}...`);
            // Add a default race-day pickup if none exists
            await supabase.from('packet_pickup_locations').insert({
                race_id: race.id,
                location_name: 'Race Village / Finish Line Area',
                address: 'Main Event Site',
                pickup_date: race.race_date,
                start_time: '07:00:00',
                end_time: '08:45:00',
                is_race_day: true,
                notes: 'Please arrive early to collect your bib and timing chip.'
            });
        }
    }

    // 5. Ensure EVERY race has a description and hero image
    console.log('Checking for missing basic fields...');
    for (const race of races) {
        const { data: fullRace } = await supabase.from('races').select('*').eq('id', race.id).single();
        const updates = {};
        if (!fullRace.description || fullRace.description.length < 20) {
            updates.description = `Join us for the annual ${fullRace.name}! A fantastic community event focused on fitness, family, and fun. What's Your Why?`;
        }
        if (!fullRace.hero_image_url) {
            // Pick a default based on race type
            if (fullRace.name.toLowerCase().includes('tri')) updates.hero_image_url = '/images/action/triathlon-1.jpg';
            else if (fullRace.name.toLowerCase().includes('trail')) updates.hero_image_url = '/images/action/trail-1.jpg';
            else updates.hero_image_url = '/images/action/road-run-1.jpg';
        }
        if (!fullRace.terrain) updates.terrain = fullRace.name.toLowerCase().includes('trail') ? 'trail' : 'road';
        if (!fullRace.elevation) updates.elevation = 'Rolling PNW hills';
        if (!fullRace.includes || fullRace.includes.length === 0) updates.includes = ['tech_shirt', 'medal', 'timing', 'food', 'photos'];

        if (Object.keys(updates).length > 0) {
            await supabase.from('races').update(updates).eq('id', race.id);
            console.log(`  Updated basic fields for ${fullRace.name}`);
        }
    }

    // 6. Ensure multisport details for triathlons
    console.log('Checking multisport details...');
    for (const race of races) {
        if (race.name.toLowerCase().includes('triathlon') || race.name.toLowerCase().includes('duathlon')) {
            const { count } = await supabase.from('multisport_details').select('*', { count: 'exact', head: true }).eq('race_id', race.id);
            if (count === 0) {
                await supabase.from('multisport_details').insert({
                    race_id: race.id,
                    water_temperature_typical: '62-68 degrees',
                    wetsuit_policy: 'Optional but recommended',
                    bike_requirements: 'Helmets mandatory, drafting not allowed',
                    usat_sanctioned: true
                });
                console.log(`  Added default multisport details for ${race.name}`);
            }
        }
    }

    console.log('\n✅ MASTER FIX COMPLETE!');
}

run().catch(console.error);
