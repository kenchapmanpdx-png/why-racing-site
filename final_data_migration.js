const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Map of standard included items for PNW races
const PNW_INCLUDES = ['shirt', 'medal', 'timing', 'food', 'photos'];

const races = [
    {
        name: 'White River Snowshoe',
        date: '2026-02-07',
        time: '09:00:00',
        type: 'trail',
        venue: 'White River Sno-Park',
        city: 'Mt. Hood',
        state: 'OR',
        hero: 'images/heroes/resolution-run.png',
        tagline: 'A Winter Wonderland Adventure',
        description: 'Experience the magic of winter running at the White River Snowshoe! This unique event takes you through the stunning snow-covered trails of Mt. Hood National Forest. Quality snowshoes are included with your registration!',
        terrain: 'snow',
        elevation: '450ft',
        packet_pickup: 'Packet pickup is available the day before (February 6) from 3pm-7pm at White River Sno-Park. Race morning pickup opens at 7:30 AM.',
        aid_stations: 'Aid stations located at every 2.5 miles with water and electrolyte drinks.',
        youtube: 'https://www.youtube.com/watch?v=O2kaANlOJes',
        includes: ['shirt', 'medal', 'timing', 'food', 'photos'],
        distances: [
            { name: '5K', value: '3.1 miles', price: 55, start: '09:00:00' },
            { name: '10K', value: '6.2 miles', price: 65, start: '09:00:00' }
        ]
    },
    {
        name: 'Silver Falls Trail Challenge',
        date: '2026-03-14',
        time: '08:00:00',
        type: 'trail',
        venue: 'Silver Falls State Park',
        city: 'Silverton',
        state: 'OR',
        hero: 'images/action/spring-classic-1.jpg',
        tagline: 'Run the Ten Falls',
        description: 'Venture into the "Crown Jewel" of the Oregon State Parks system. Run past magnificent waterfalls on some of the most beautiful trails in the world. The course is technical, challenging, and absolutely breathtaking.',
        terrain: 'trail',
        elevation: '1,200ft+',
        packet_pickup: 'Available race morning starting at 7:00 AM at the South Falls Lodge.',
        aid_stations: 'Full aid stations every 4-5 miles.',
        includes: ['shirt', 'medal', 'timing', 'food', 'photos'],
        distances: [
            { name: '10K', value: '6.2 miles', price: 55, start: '09:00:00' },
            { name: 'Half Marathon', value: '13.1 miles', price: 85, start: '08:30:00' },
            { name: '25K', value: '15.5 miles', price: 95, start: '08:00:00' }
        ]
    },
    {
        name: 'Couve Clover Run',
        date: '2026-03-14',
        time: '09:00:00',
        type: 'run',
        venue: 'Officers Row',
        city: 'Vancouver',
        state: 'WA',
        hero: 'images/heroes/santa-hustle.png',
        tagline: 'Get Your Lucky Run On',
        description: 'Celebrate St. Patrick\'s Day with a run through historic Vancouver! Follow the green line through Fort Vancouver and officers row. Post-race party includes green beer, Irish food, and live music.',
        terrain: 'road',
        elevation: 'Mostly Flat',
        packet_pickup: 'Friday before the race at Foot Traffic Vancouver from 11am-6pm.',
        includes: ['shirt', 'medal', 'timing', 'food', 'beer', 'photos'],
        distances: [
            { name: '5K', value: '3.1 miles', price: 45, start: '09:15:00' },
            { name: '10K', value: '6.2 miles', price: 55, start: '09:00:00' },
            { name: '15K', value: '9.3 miles', price: 65, start: '09:00:00' }
        ]
    },
    {
        name: 'Spring Classic',
        date: '2026-04-25',
        time: '08:00:00',
        type: 'run',
        venue: 'Vancouver Waterfront',
        city: 'Vancouver',
        state: 'WA',
        hero: 'images/heroes/spring-classic.png',
        tagline: 'The Original PNW Season Opener',
        description: 'Shake off the winter rust at the beautiful Vancouver Waterfront! This historic race features a fast, flat course along the Columbia River. A perfect PR course for your spring goals.',
        terrain: 'road',
        elevation: 'Flat',
        includes: ['shirt', 'medal', 'timing', 'food', 'photos'],
        distances: [
            { name: '5K', value: '3.1 miles', price: 45, start: '08:15:00' },
            { name: '10K', value: '6.2 miles', price: 55, start: '08:00:00' },
            { name: 'Half Marathon', value: '13.1 miles', price: 75, start: '08:00:00' }
        ]
    },
    {
        name: 'PDX Triathlon Festival',
        date: '2026-06-06',
        time: '07:30:00',
        type: 'triathlon',
        venue: 'Blue Lake Park',
        city: 'Portland',
        state: 'OR',
        hero: 'images/heroes/pdx-triathlon.jpg',
        tagline: 'Rose City Racing',
        description: 'Portland\'s premier triathlon event! Blue Lake Park provides a perfect setting for a morning of multi-sport. Calm waters, flat roads, and a beautiful park finish.',
        terrain: 'mixed',
        elevation: 'Flat',
        packet_pickup: 'Mandatory packet pickup and bike drop-off on Friday.',
        includes: ['shirt', 'medal', 'timing', 'food', 'photos'],
        distances: [
            { name: 'Sprint Triathlon', value: 'Swim/Bike/Run', price: 115, start: '08:00:00' },
            { name: 'Olympic Triathlon', value: 'Swim/Bike/Run', price: 145, start: '07:30:00' }
        ]
    },
    {
        name: 'Appletree Marathon',
        date: '2026-08-29',
        time: '07:00:00',
        type: 'run',
        venue: 'Officer\'s Row',
        city: 'Vancouver',
        state: 'WA',
        hero: 'images/action/pro-action-1.jpg',
        tagline: 'History in the Making',
        description: 'Run through history! The Appletree Marathon takes you through the most scenic and historic parts of Vancouver, including Fort Vancouver and the Columbia River Waterfront. Known for its spectator support and premium medals.',
        terrain: 'road',
        elevation: 'Moderate',
        includes: ['shirt', 'medal', 'timing', 'food', 'beer', 'photos'],
        distances: [
            { name: '5K', value: '3.1 miles', price: 45, start: '08:15:00' },
            { name: '10K', value: '6.2 miles', price: 55, start: '08:00:00' },
            { name: 'Half Marathon', value: '13.1 miles', price: 85, start: '07:00:00' },
            { name: 'Marathon', value: '26.2 miles', price: 115, start: '07:00:00' }
        ]
    },
    {
        name: 'Scary Run',
        date: '2026-10-24',
        time: '09:00:00',
        type: 'run',
        venue: 'Reflection Plaza',
        city: 'Washougal',
        state: 'WA',
        hero: 'images/heroes/scary-run.jpg',
        tagline: 'The Ultimate Halloween Tradition',
        description: 'The Scary Run is more than just a race—it\'s a massive Halloween block party! Costumes are highly encouraged. Run through the spooky trails of Washougal and finish at a massive after-party with food, drinks, and a costume contest.',
        terrain: 'road/trail mix',
        elevation: 'Low',
        youtube: 'https://www.youtube.com/watch?v=scary-run-promo',
        includes: ['shirt', 'medal', 'timing', 'food', 'beer', 'photos'],
        distances: [
            { name: '5K', value: '3.1 miles', price: 45, start: '09:30:00' },
            { name: '10K', value: '6.2 miles', price: 55, start: '09:00:00' },
            { name: '15K', value: '9.3 miles', price: 65, start: '09:00:00' }
        ]
    }
];

async function updateRaces() {
    console.log('--- ENHANCED DATA UPDATE ---');
    console.log(`Processing ${races.length} primary events...`);

    for (const r of races) {
        // Find existing race ID
        const { data: existing } = await supabase
            .from('races')
            .select('id')
            .eq('name', r.name)
            .eq('race_date', r.date)
            .single();

        let raceId;

        if (existing) {
            console.log(`Updating existing race: ${r.name}`);
            raceId = existing.id;
            await supabase.from('races').update({
                race_time: r.time,
                venue: r.venue,
                tagline: r.tagline,
                description: r.description,
                terrain: r.terrain,
                elevation: r.elevation,
                packet_pickup: r.packet_pickup,
                aid_stations: r.aid_stations,
                youtube_url: r.youtube,
                hero_image_url: r.hero,
                includes: r.includes || PNW_INCLUDES,
                is_visible: true,
                status: 'active'
            }).eq('id', raceId);
        } else {
            console.log(`Inserting new race: ${r.name}`);
            const { data: inserted, error } = await supabase.from('races').insert({
                name: r.name,
                race_date: r.date,
                race_time: r.time,
                race_type: r.type,
                venue: r.venue,
                city: r.city,
                state: r.state,
                tagline: r.tagline,
                description: r.description,
                terrain: r.terrain,
                elevation: r.elevation,
                packet_pickup: r.packet_pickup,
                aid_stations: r.aid_stations,
                youtube_url: r.youtube,
                hero_image_url: r.hero,
                includes: r.includes || PNW_INCLUDES,
                status: 'active',
                is_visible: true,
                registration_open: false
            }).select().single();

            if (error) {
                console.error(`Error with ${r.name}:`, error.message);
                continue;
            }
            raceId = inserted.id;
        }

        // Handle Distances
        if (r.distances && r.distances.length > 0) {
            // Clear old distances
            await supabase.from('race_distances').delete().eq('race_id', raceId);

            const distanceInserts = r.distances.map(d => ({
                race_id: raceId,
                name: d.name,
                distance_value: d.value,
                base_price: d.price,
                start_time: d.start
            }));

            const { error: dError } = await supabase.from('race_distances').insert(distanceInserts);
            if (dError) console.error(`Distances error for ${r.name}:`, dError.message);
        }
    }

    console.log('--- UPDATE COMPLETE ---');
}

updateRaces();
