require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function populateAidAndParking() {
    console.log('🚀 Populating Aid Stations & Parking Info...');

    const { data: races, error } = await supabase.from('races').select('id, name, race_type');
    if (error) {
        console.error('Error fetching races:', error.message);
        return;
    }

    for (const race of races) {
        let aidInfo = 'Aid stations approximately every 2 miles with water and basic supplies.';
        let parkingInfo = 'Free parking available on-site. Please arrive 45-60 minutes before your start time.';

        // Specific overrides
        if (race.name.includes('PDX Triathlon')) {
            parkingInfo = 'Parking at Blue Lake Regional Park. NO PETS ALLOWED in the park ($89 fine). Arrive 60 minutes early.';
        } else if (race.name.includes('Columbia River Triathlon')) {
            parkingInfo = 'Arrive 30 minutes before race start. No vehicles allowed on access roads once race begins.';
        } else if (race.name.includes('Resolution Run')) {
            parkingInfo = 'Free parking at La Center High School. Post-race pancake breakfast available for $10 donation.';
        } else if (race.name.includes('Appletree')) {
            parkingInfo = 'Parking available at Fort Vancouver historic site. Walking distance to the start/finish arch.';
        } else if (race.name.includes('Pacific Crest')) {
            parkingInfo = 'Parking at Riverbend Park and surrounding areas. Shuttles may be available during peak times.';
        }

        // Aid station overrides for long/multi-sport
        if (race.race_type === 'triathlon' || race.race_type === 'duathlon') {
            aidInfo = 'Water and hydration in transition and every 1.5-2 miles on the run course. Self-supported on the bike leg.';
        } else if (race.name.includes('Ultra') || race.name.includes('100')) {
            aidInfo = 'Full aid stations every 5-8 miles with water, electrolyte drinks, gels, and ultra-style snacks.';
        }

        const { error: updateError } = await supabase
            .from('races')
            .update({
                aid_stations: aidInfo,
                parking: parkingInfo
            })
            .eq('id', race.id);

        if (updateError) {
            console.error(`Error updating ${race.name}:`, updateError.message);
        } else {
            console.log(`✅ Updated ${race.name}`);
        }
    }

    console.log('🏁 Aid/Parking population complete.');
}

populateAidAndParking();
