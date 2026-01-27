require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const raceDetailedData = [
    {
        name: 'Couve Clover Run',
        terrain: 'Road (Officers Row & Waterfront)',
        elevation: 'Extremely Fast & Flat',
        pickups: [
            {
                location_name: 'Foot Traffic Vancouver',
                address: '305 SE Chkalov Dr',
                city: 'Vancouver',
                state: 'WA',
                start_time: '10:00:00',
                end_time: '17:00:00',
                notes: 'Saturday Pre-race Packet Pickup',
                is_race_day: false
            },
            {
                location_name: 'Expo Area',
                address: '550 Waterfront Way',
                city: 'Vancouver',
                state: 'WA',
                start_time: '07:00:00',
                end_time: '09:00:00',
                notes: 'Race Morning Packet Pickup',
                is_race_day: true
            }
        ],
        distances: [
            { name: '10 Mile', start_time: '09:00:00' },
            { name: 'Lucky 7 Mile', start_time: '09:00:00' },
            { name: '3 Mile', start_time: '09:00:00' }
        ]
    },
    {
        name: 'Spring Classic',
        terrain: 'Road & Path (Vancouver Lake)',
        elevation: 'Flat & Fast',
        pickups: [
            {
                location_name: 'Foot Traffic Vancouver',
                address: '305 SE Chkalov Dr',
                city: 'Vancouver',
                state: 'WA',
                start_time: '10:00:00',
                end_time: '15:00:00',
                notes: 'Saturday Pre-race Packet Pickup',
                is_race_day: false
            },
            {
                location_name: 'Vancouver Lake Regional Park',
                address: '6801 NW Lower River Rd',
                city: 'Vancouver',
                state: 'WA',
                start_time: '06:30:00',
                end_time: '10:45:00',
                notes: 'Race Morning Packet Pickup',
                is_race_day: true
            }
        ],
        distances: [
            { name: 'Half Marathon', start_time: '07:45:00' },
            { name: '10K', start_time: '08:00:00' },
            { name: '5K', start_time: '08:00:00' },
            { name: 'Sprint Duathlon', start_time: '11:00:00' }
        ]
    },
    {
        name: 'Columbia River Triathlon',
        terrain: 'Road & Park Trails',
        elevation: 'Flat',
        pickups: [
            {
                location_name: 'Foot Traffic Vancouver',
                address: '305 SE Chkalov Dr',
                city: 'Vancouver',
                state: 'WA',
                start_time: '10:00:00',
                end_time: '17:00:00',
                notes: 'Thursday Pre-race Packet Pickup',
                is_race_day: false
            },
            {
                location_name: 'Frenchman\'s Bar Park',
                address: '9612 NW Lower River Rd',
                city: 'Vancouver',
                state: 'WA',
                start_time: '14:00:00',
                end_time: '19:00:00',
                notes: 'Friday Pre-race Packet Pickup',
                is_race_day: false
            },
            {
                location_name: 'Frenchman\'s Bar Park',
                address: '9612 NW Lower River Rd',
                city: 'Vancouver',
                state: 'WA',
                start_time: '07:00:00',
                end_time: '14:00:00',
                notes: 'Saturday Packet Pickup',
                is_race_day: true
            },
            {
                location_name: 'Frenchman\'s Bar Park',
                address: '9612 NW Lower River Rd',
                city: 'Vancouver',
                state: 'WA',
                start_time: '07:00:00',
                end_time: '09:00:00',
                notes: 'Sunday Packet Pickup',
                is_race_day: true
            }
        ]
    }
];

async function populateDetails() {
    console.log('🚀 Starting detailed logistics population...');

    for (const raceData of raceDetailedData) {
        // Find race
        const { data: races, error: raceError } = await supabase
            .from('races')
            .select('id')
            .ilike('name', `%${raceData.name}%`);

        if (raceError || !races || races.length === 0) {
            console.log(`⚠️ Race not found: ${raceData.name}`);
            continue;
        }

        const raceId = races[0].id;
        console.log(`Processing ${raceData.name} (${raceId})...`);

        // Update race terrain/elevation
        await supabase
            .from('races')
            .update({
                terrain: raceData.terrain,
                elevation: raceData.elevation
            })
            .eq('id', raceId);

        // Insert Pickups
        if (raceData.pickups) {
            await supabase.from('packet_pickup_locations').delete().eq('race_id', raceId);
            const pickups = raceData.pickups.map(p => ({ ...p, race_id: raceId }));
            await supabase.from('packet_pickup_locations').insert(pickups);
        }

        // Update Distance Times
        if (raceData.distances) {
            for (const dist of raceData.distances) {
                await supabase
                    .from('race_distances')
                    .update({ start_time: dist.start_time })
                    .eq('race_id', raceId)
                    .ilike('name', `%${dist.name}%`);
            }
        }
    }

    console.log('🏁 Population complete.');
}

populateDetails();
