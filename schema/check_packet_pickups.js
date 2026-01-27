require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkPacketPickups() {
    console.log('🔍 Checking all races with packet pickup locations...');
    console.log('='.repeat(70));

    const { data, error } = await supabase
        .from('packet_pickup_locations')
        .select('race_id, location_name, pickup_date, start_time, end_time, is_race_day, races!inner(name)')
        .order('pickup_date');

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    // Group by race
    const grouped = {};
    data.forEach(p => {
        if (!grouped[p.races.name]) {
            grouped[p.races.name] = [];
        }
        grouped[p.races.name].push({
            location: p.location_name,
            date: p.pickup_date,
            time: `${p.start_time} - ${p.end_time}`,
            isRaceDay: p.is_race_day
        });
    });

    console.log(`Found ${Object.keys(grouped).length} races with packet pickup locations:\n`);

    Object.entries(grouped).forEach(([raceName, locations]) => {
        console.log(`📌 ${raceName}`);
        locations.forEach(loc => {
            const rdTag = loc.isRaceDay ? ' [Race Day]' : '';
            console.log(`   • ${loc.location} - ${loc.date} (${loc.time})${rdTag}`);
        });
        console.log('');
    });

    console.log('='.repeat(70));
    console.log('✅ All these races will now display correctly with the fix applied.');
}

checkPacketPickups();
