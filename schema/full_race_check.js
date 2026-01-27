require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fullCheck() {
    console.log('🔍 COMPLETE RACE CHECK - All Active Races');
    console.log('='.repeat(80));

    const { data: races, error: fetchError } = await supabase
        .from('races')
        .select(`
            id, name, race_date, race_time, city, state, venue,
            hero_image_url, description, terrain, elevation,
            parking, aid_stations, includes, registration_url,
            race_distances (name, base_price, start_time)
        `)
        .eq('is_visible', true)
        .eq('status', 'active')
        .order('race_date', { ascending: true });

    if (fetchError) {
        console.error('Error:', fetchError.message);
        return;
    }

    let allGood = true;

    for (const race of races) {
        let issues = [];

        if (!race.hero_image_url) issues.push('hero_img');
        if (!race.description) issues.push('description');
        if (!race.terrain) issues.push('terrain');
        if (!race.elevation) issues.push('elevation');
        if (!race.parking) issues.push('parking');
        if (!race.aid_stations) issues.push('aid_stations');
        if (!race.includes || race.includes.length === 0) issues.push('includes');
        if (!race.registration_url) issues.push('reg_url');

        const distances = race.race_distances || [];
        if (distances.length === 0) issues.push('no_distances');
        const zeroPrices = distances.filter(d => !d.base_price || d.base_price === 0);
        if (zeroPrices.length > 0) issues.push(`${zeroPrices.length}_$0_prices`);

        const status = issues.length === 0 ? '✅' : '⚠️';
        if (issues.length > 0) allGood = false;

        console.log(`\n${status} ${race.name}`);
        console.log(`   📅 ${race.race_date} | 📍 ${race.city}, ${race.state}`);
        console.log(`   Terrain: ${race.terrain || 'MISSING'}`);
        console.log(`   Elevation: ${race.elevation || 'MISSING'}`);
        console.log(`   Includes: ${race.includes?.join(', ') || 'MISSING'}`);
        console.log(`   Distances: ${distances.length} (${distances.map(d => d.name + ':$' + d.base_price).join(', ')})`);

        if (issues.length > 0) {
            console.log(`   ❌ ISSUES: ${issues.join(', ')}`);
        }
    }

    console.log('\n' + '='.repeat(80));
    console.log(`TOTAL: ${races.length} races checked`);
    console.log(allGood ? '🎉 ALL RACES COMPLETE!' : '⚠️ Some races have issues - see above');
}

fullCheck();
