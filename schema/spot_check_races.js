require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const randomRaces = [
    { id: '5fc93199-4102-45ec-b813-2bce475424b0', name: 'Hellz Bellz Ultra' },
    { id: '02a98ee5-b813-4ac1-90c5-8d617d8cb724', name: 'Girlfriends Half Marathon' },
    { id: 'bf98e648-d3ab-4220-82c5-837f1430e9aa', name: 'Battle to the Pacific' },
    { id: '0349a679-67a5-49b8-b4b9-c45c5dc75c0b', name: 'Pacific Crest Endurance' }
];

async function spotCheck() {
    console.log('🎲 RANDOM SPOT CHECK - 4 Race Pages');
    console.log('='.repeat(70));

    for (const r of randomRaces) {
        const { data: race, error } = await supabase
            .from('races')
            .select(`
                name, race_date, race_time, city, state, venue,
                hero_image_url, description, terrain, elevation,
                parking, aid_stations, includes, registration_url,
                race_distances (name, base_price, start_time)
            `)
            .eq('id', r.id)
            .single();

        if (error) {
            console.log(`\n❌ ${r.name}: Error - ${error.message}`);
            continue;
        }

        console.log(`\n📌 ${race.name}`);
        console.log(`   📅 ${race.race_date} @ ${race.race_time || 'TBD'}`);
        console.log(`   📍 ${race.venue || race.city}, ${race.state}`);
        console.log('');
        console.log(`   Hero Image: ${race.hero_image_url ? '✅' : '❌'}`);
        console.log(`   Description: ${race.description ? '✅ (' + race.description.length + ' chars)' : '❌'}`);
        console.log(`   Terrain: ${race.terrain || '❌'}`);
        console.log(`   Elevation: ${race.elevation || '❌'}`);
        console.log(`   Parking: ${race.parking ? '✅' : '❌'}`);
        console.log(`   Aid Stations: ${race.aid_stations ? '✅' : '❌'}`);
        console.log(`   Includes: ${race.includes?.length > 0 ? race.includes.join(', ') : '❌'}`);
        console.log(`   Registration URL: ${race.registration_url ? '✅' : '❌'}`);
        console.log('');
        console.log(`   Distances (${race.race_distances.length}):`);
        race.race_distances.forEach(d => {
            console.log(`      • ${d.name}: $${d.base_price} ${d.start_time ? '@ ' + d.start_time : ''}`);
        });
    }

    console.log('\n' + '='.repeat(70));
    console.log('Spot check complete.');
}

spotCheck();
