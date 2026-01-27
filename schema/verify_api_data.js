require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function verifyApiEndpoint() {
    // Pick a sample race (Couve Clover Run)
    const raceId = 'e0558e0f-bbfb-422e-a8c9-74207a9f54c3';

    console.log('🔍 Verifying API data for Couve Clover Run...');
    console.log('='.repeat(60));

    const { data: race, error } = await supabase
        .from('races')
        .select(`
            *,
            race_distances (*),
            packet_pickup_locations (*)
        `)
        .eq('id', raceId)
        .single();

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log('Race Name:', race.name);
    console.log('Date:', race.race_date, race.race_time);
    console.log('Location:', race.venue, '-', race.city + ',', race.state);
    console.log('');
    console.log('Hero Image:', race.hero_image_url ? '✓' : '✗');
    console.log('Logo:', race.logo_url ? '✓' : '✗');
    console.log('YouTube:', race.youtube_url ? '✓' : '✗');
    console.log('');
    console.log('Terrain:', race.terrain);
    console.log('Elevation:', race.elevation);
    console.log('Parking:', race.parking ? race.parking.substring(0, 50) + '...' : '✗');
    console.log('Aid Stations:', race.aid_stations ? race.aid_stations.substring(0, 50) + '...' : '✗');
    console.log('');
    console.log('Includes:', JSON.stringify(race.includes));
    console.log('');
    console.log('Distances:', race.race_distances.length);
    race.race_distances.forEach(d => {
        console.log(`  - ${d.name}: $${d.base_price} (start: ${d.start_time || 'TBD'})`);
    });
    console.log('');
    console.log('Packet Pickups:', race.packet_pickup_locations.length);
    race.packet_pickup_locations.forEach(p => {
        console.log(`  - ${p.location_name}: ${p.start_time}-${p.end_time} ${p.is_race_day ? '(Race Day)' : ''}`);
    });
}

verifyApiEndpoint();
