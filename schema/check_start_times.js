require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkStartTimes() {
    console.log('='.repeat(80));
    console.log('🔴 HIGH PRIORITY CHECK #1: Distance Start Times');
    console.log('='.repeat(80));

    const { data: races, error } = await supabase
        .from('races')
        .select(`
            name, race_time,
            race_distances (name, start_time, sort_order)
        `)
        .eq('is_visible', true)
        .eq('status', 'active')
        .order('race_date');

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    let issueCount = 0;

    races.forEach(race => {
        const distances = race.race_distances || [];
        const missingStartTime = distances.filter(d => !d.start_time);

        if (missingStartTime.length > 0 && distances.length > 1) {
            // Only flag if race has multiple distances but some are missing start times
            console.log(`\n⚠️ ${race.name}`);
            console.log(`   Race starts at: ${race.race_time || 'not set'}`);
            console.log(`   Missing start times for:`);
            missingStartTime.forEach(d => console.log(`   - ${d.name}`));
            issueCount++;
        } else if (distances.length === 1 && !distances[0].start_time && race.race_time) {
            // Single distance - can inherit from race_time, OK
        } else if (distances.every(d => d.start_time)) {
            // All good
        }
    });

    console.log('\n' + '-'.repeat(80));

    // Summary
    console.log('\n📊 START TIME SUMMARY:');
    races.forEach(race => {
        const distances = race.race_distances || [];
        const withTime = distances.filter(d => d.start_time).length;
        const status = withTime === distances.length ? '✅' :
            withTime > 0 ? '⚠️' : '❌';
        console.log(`${status} ${race.name}: ${withTime}/${distances.length} distances have start times`);
    });

    console.log('\n' + '='.repeat(80));
    if (issueCount === 0) {
        console.log('✅ All multi-distance races have start times defined');
    } else {
        console.log(`⚠️ ${issueCount} races may need distance-specific start times`);
    }
}

checkStartTimes();
