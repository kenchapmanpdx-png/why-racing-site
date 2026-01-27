require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkDetails() {
    const ids = ['02a98ee5-b813-4ac1-90c5-8d617d8cb724', '495cc242-dd40-4f1a-949a-bb6d9a741031'];
    const { data, error } = await supabase
        .from('races')
        .select('id, name, terrain, elevation, parking, aid_stations')
        .in('id', ids);

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    data.forEach(r => {
        console.log(`Race: ${r.name} (${r.id})`);
        console.log(`  Terrain: ${r.terrain}`);
        console.log(`  Elevation: ${r.elevation}`);
        console.log(`  Parking: ${r.parking}`);
        console.log(`  Aid Stations: ${r.aid_stations}`);
        console.log('---');
    });
}

checkDetails();
