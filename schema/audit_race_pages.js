require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function auditRacePages() {
    console.log('🔍 RACE PAGE AUDIT REPORT');
    console.log('='.repeat(80));
    console.log('');

    const { data: races, error } = await supabase
        .from('races')
        .select(`
            id, name, race_date, race_time, city, state, venue,
            hero_image_url, thumbnail_url, logo_url, youtube_url,
            terrain, elevation, parking, aid_stations,
            includes, description, registration_url,
            race_distances (id, name, base_price, start_time)
        `)
        .eq('is_visible', true)
        .eq('status', 'active')
        .order('race_date', { ascending: true });

    if (error) {
        console.error('Error fetching races:', error.message);
        return;
    }

    let issues = [];

    for (const race of races) {
        console.log(`📌 ${race.name}`);
        console.log(`   Date: ${race.race_date} | Location: ${race.city}, ${race.state}`);

        let raceIssues = [];

        // Check critical fields
        if (!race.hero_image_url) raceIssues.push('Missing hero image');
        if (!race.description) raceIssues.push('Missing description');
        if (!race.terrain) raceIssues.push('Missing terrain');
        if (!race.elevation) raceIssues.push('Missing elevation');
        if (!race.parking) raceIssues.push('Missing parking');
        if (!race.aid_stations) raceIssues.push('Missing aid stations');
        if (!race.registration_url) raceIssues.push('Missing registration URL');
        if (!race.includes || race.includes.length === 0) raceIssues.push('Missing includes/swag');

        // Check distances
        if (!race.race_distances || race.race_distances.length === 0) {
            raceIssues.push('No distances defined');
        } else {
            const zeroPriceCount = race.race_distances.filter(d => !d.base_price || d.base_price === 0).length;
            if (zeroPriceCount > 0) {
                raceIssues.push(`${zeroPriceCount} distances with $0 price`);
            }
        }

        if (raceIssues.length > 0) {
            console.log(`   ❌ Issues: ${raceIssues.join(', ')}`);
            issues.push({ race: race.name, issues: raceIssues });
        } else {
            console.log('   ✅ All required fields present');
        }

        console.log('');
    }

    console.log('='.repeat(80));
    console.log('SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total races audited: ${races.length}`);
    console.log(`Races with issues: ${issues.length}`);

    if (issues.length > 0) {
        console.log('\nRaces needing attention:');
        issues.forEach((item, i) => {
            console.log(`  ${i + 1}. ${item.race}: ${item.issues.join(', ')}`);
        });
    } else {
        console.log('\n🎉 All race pages have complete data!');
    }
}

auditRacePages();
