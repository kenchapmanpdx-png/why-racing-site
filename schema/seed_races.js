/**
 * Seed Race Data Script
 * Run with: node schema/seed_races.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const races = [
    {
        // Base race data
        race: {
            name: 'Resolution Run',
            race_date: '2026-01-03',
            race_time: '09:00:00',
            city: 'La Center',
            state: 'WA',
            venue: 'La Center High School',
            description: 'Welcome to the 4th Annual Resolution Run in La Center, Washington as it continues to be a fundraiser for the La Center High School Volleyball program and the Track & Field program. We brought together all of our favorite things, a challenging course to kick up your New Year training program, trails and pathways along a very scenic course, and a good old-fashioned breakfast.',
            race_type: 'run',
            registration_url: 'https://runsignup.com/Race/WA/LaCenter/WREResolutionRun',
            registration_open: true,
            is_visible: true,
            instructions_pdf_url: 'https://docs.google.com/document/d/1rxxXAqWi-XvVoxuJTGrQ5AWW2Em04f2H/edit'
        },
        content: {
            edition_number: 4,
            tagline: 'Kickstart your New Year with purpose!',
            theme_type: 'new-year',
            venue_name: 'La Center High School',
            venue_address: '725 NE Highland Rd',
            venue_city: 'La Center',
            venue_state: 'WA',
            venue_zip: '98629'
        },
        distances: [
            { name: '5K Run/Walk', distance_value: 5, distance_unit: 'km', sort_order: 1 },
            { name: '10K Run/Walk', distance_value: 10, distance_unit: 'km', sort_order: 2 },
            { name: 'Virtual 5K Run/Walk', distance_value: 5, distance_unit: 'km', sort_order: 3 }
        ],
        beneficiaries: [
            { organization_name: 'La Center High School Volleyball Program', description: 'Student athletics support', is_primary: true, sort_order: 1 },
            { organization_name: 'La Center High School Track & Field Program', description: 'Student athletics support', is_primary: false, sort_order: 2 }
        ],
        policies: [
            { policy_type: 'refund_policy', policy_text: 'No refunds issued (no exceptions)' },
            { policy_type: 'deferral_policy', policy_text: 'Can defer to next year\'s event or another WHY RACING EVENTS within the year. $20 deferral fee. Must request up to 10 days before the event.' },
            { policy_type: 'transfer_policy', policy_text: 'Can transfer registration to another participant up to 10 days before the event.' }
        ]
    },
    {
        race: {
            name: 'White River Snowshoe Race',
            race_date: '2026-02-07',
            race_time: '10:00:00',
            city: 'Government Camp',
            state: 'OR',
            venue: 'White River West Sno-Park',
            description: 'The White River 4K and 8K are great events for the casual snowshoe enthusiast to the endorphin junkie racer. Both events begin and end at the White River Sno-Park between Government Camp and Mt Hood Meadows on Hwy 35. The snowshoe events are designed for everyone - if you can walk 5-miles you will finish.',
            race_type: 'trail',
            registration_url: 'https://www.adventuresignup.com/Race/OR/GovernmentCamp/WhiteRiverSnowShoe8k4k',
            registration_open: true,
            is_visible: true
        },
        content: {
            tagline: 'A true winter adventure on Mt. Hood!',
            theme_type: 'winter-adventure',
            venue_name: 'White River West Sno-Park',
            venue_address: 'Near Hwy 26/Hwy 35 junction',
            venue_city: 'Government Camp',
            venue_state: 'OR',
            venue_notes: 'A few miles northeast of Government Camp between Government Camp and Mt Hood Meadows. Organized by X-Dog Adventures. Snowshoes required - rentals available at REI, Otto\'s Ski Shop (Sandy), Mountain Shop, Next Adventure. Sno-Park pass required ($4).'
        },
        distances: [
            { name: '4K Snowshoe', distance_value: 4, distance_unit: 'km', description: 'Single loop through upper White River canyon', sort_order: 1 },
            { name: '8K Snowshoe', distance_value: 8, distance_unit: 'km', description: '2 loops on the same course', sort_order: 2 }
        ]
    },
    {
        race: {
            name: 'Silver Falls Trail Challenge',
            race_date: '2026-02-28',
            race_time: '09:00:00',
            city: 'Sublimity',
            state: 'OR',
            venue: 'Silver Falls State Park - South Falls Day-Use Area',
            description: 'If you have never been to Silver Falls State Park, you are in for a treat. There just ARE NOT ENOUGH ADJECTIVES to describe the PNW brand of beauty and mystique that is personified by Silver Falls State Park. Starting in the South Falls day use area, you\'ll have the option of 1 loop around the Trail of 10 Falls for a quarter marathon or add an additional loop to complete the half-marathon. The chance to run behind and pass these picturesque falls is something you won\'t soon forget.',
            race_type: 'trail',
            registration_url: 'https://ultrasignup.com/register.aspx?did=131693',
            registration_open: true,
            is_visible: true
        },
        content: {
            tagline: 'Run through Oregon\'s most epic waterfalls!',
            theme_type: 'trail',
            venue_name: 'Silver Falls State Park - Orchards Shelter',
            venue_address: '20024 Silver Falls Hwy SE',
            venue_city: 'Sublimity',
            venue_state: 'OR',
            venue_zip: '97385',
            parking_instructions: '$10 per car parking fee - cash or card accepted (Silver Falls State Park fee)'
        },
        distances: [
            { name: '1/4 Marathon', distance_value: 6.55, distance_unit: 'miles', start_time: '09:30:00', description: 'One clockwise loop around the Trail of Ten Falls', sort_order: 1 },
            { name: '1/2 Marathon', distance_value: 13.1, distance_unit: 'miles', start_time: '09:00:00', description: 'Double loop on the Trail of Ten Falls', sort_order: 2 },
            { name: '12 Mile Ruck Challenge', distance_value: 12, distance_unit: 'miles', start_time: '09:00:00', description: 'Same route as Half Marathon with Winter Trail modification. 35lb minimum for packs, 40lb minimum for vests.', sort_order: 3 }
        ],
        packet_pickup: [
            { location_name: 'Orchards Shelter - Early Pickup', address: '20024 Silver Falls Hwy SE', city: 'Sublimity', state: 'OR', pickup_date: '2026-02-27', start_time: '15:00:00', end_time: '17:00:00', is_race_day: false, sort_order: 1 },
            { location_name: 'Orchards Shelter - Race Day', address: '20024 Silver Falls Hwy SE', city: 'Sublimity', state: 'OR', pickup_date: '2026-02-28', start_time: '07:00:00', end_time: '08:30:00', is_race_day: true, sort_order: 2 }
        ],
        policies: [
            { policy_type: 'refund_policy', policy_text: 'No refunds' },
            { policy_type: 'deferral_policy', policy_text: 'If contacted before the week of the race, can push entry to any other Bivouac Racing event of equal value within 12 months' }
        ],
        themed_content: {
            has_ruck_option: true,
            ruck_weight_requirement: '35lb minimum for packs, 40lb minimum for vests',
            ruck_weigh_in_info: 'Weight check at packet pickup'
        }
    },
    {
        race: {
            name: 'Bigfoot Fun Run',
            race_date: '2026-07-04',
            race_time: '09:00:00',
            city: 'Yacolt',
            state: 'WA',
            venue: 'Yacolt Recreation Park',
            description: 'Join us for this annual tradition! The Town of Yacolt proudly hosts the Bigfoot Fun Run as part of an entire weekend of racing. The Bigfoot Fun Run features a 5K & 10K Run or Walk. The race weekend also includes the Hellz Bellz Ultra.',
            race_type: 'run',
            registration_url: 'https://runsignup.com/Race/WA/Yacolt/BigfootFunRun',
            registration_open: true,
            is_visible: true
        },
        content: {
            tagline: 'An annual Fourth of July tradition in Yacolt!',
            theme_type: 'holiday',
            venue_name: 'Yacolt Recreation Park',
            venue_address: '105 E Yacolt Rd',
            venue_city: 'Yacolt',
            venue_state: 'WA',
            venue_zip: '98675'
        },
        distances: [
            { name: '5K Run/Walk', distance_value: 5, distance_unit: 'km', sort_order: 1 },
            { name: '10K Run/Walk', distance_value: 10, distance_unit: 'km', sort_order: 2 }
        ],
        packet_pickup: [
            { location_name: 'Registration booth near library', address: '105 E Yacolt Rd', city: 'Yacolt', state: 'WA', pickup_date: '2026-07-04', start_time: '07:00:00', end_time: '09:00:00', is_race_day: true, notes: 'Day of race only. Day-of registration available 7:00-8:30 AM.', sort_order: 1 }
        ],
        special_categories: [
            { category_name: 'Kids 1-12', pricing_rule: 'free', eligibility_description: 'FREE entry for 5K', age_limit: 12, sort_order: 1 },
            { category_name: 'Youth 13-17', pricing_rule: 'discounted', discount_amount: 17.50, eligibility_description: '$17.50 for 5K entry', age_limit: 17, sort_order: 2 }
        ],
        themed_content: {
            theme_name: 'Fourth of July',
            theme_description: 'Part of Yacolt Rendezvous Days Festival - a whole weekend of racing and community celebration!',
            is_memorial_event: false
        }
    },
    {
        race: {
            name: 'Hellz Bellz Ultra',
            race_date: '2026-07-05',
            race_time: '06:00:00',
            city: 'Yacolt',
            state: 'WA',
            venue: 'Yacolt Recreation Park (Start) / Moulton Falls (Finish)',
            description: 'The Gateway Drug into the Ultramarathon World! Starting at Yacolt Recreation Park, the course takes you along the Bells Mountain trail. After passing through multiple clear cuts, stream crossings and stunning views of Mt St Helens, around the ten plus mile mark you\'ll come to the Yacolt Burn Aid Station. Upon leaving the Yacolt Burn Aid Station you will embark on a counter clockwise loop on the Tarbell Trail. It will be twenty two plus miles of technical climbs, amazing waterfalls and breath taking views.',
            race_type: 'ultra',
            registration_url: 'https://ultrasignup.com/register.aspx?did=133015',
            registration_open: true,
            is_visible: true
        },
        content: {
            edition_number: 4,
            tagline: 'Ring the bell after conquering the Bells!',
            theme_type: 'ultra',
            venue_name: 'Yacolt Recreation Park',
            venue_address: '26612 E Hoag St',
            venue_city: 'Yacolt',
            venue_state: 'WA',
            venue_zip: '98675',
            venue_notes: 'Start at Yacolt Recreation Park, finish at Moulton Falls Arch Bridge by ringing the bell! Organized by Bivouac Racing. Part of Yacolt Rendezvous Days Festival.'
        },
        distances: [
            { name: 'Hellz Bellz Ultra - 50 Miles', distance_value: 50, distance_unit: 'miles', description: 'Intense and grueling single track climb up Bells Mountain trail with stunning views of Mt St Helens', sort_order: 1 },
            { name: 'Purgatory Trail Marathon', distance_value: 26.2, distance_unit: 'miles', description: 'Out & back utilizing the Bells Mtn Trail with roughly 6,000\' of ascent', sort_order: 2 }
        ],
        beneficiaries: [
            { organization_name: 'Washington Trail Association', description: '$5 from each registration donated', is_primary: true, sort_order: 1 }
        ],
        amenities: [
            { amenity_type: 'aid_station', location_description: 'Yacolt Burn Aid Station - Mile 10-14', notes: 'Major aid station with drop bag access' },
            { amenity_type: 'aid_station', location_description: 'Grouse Vista Aid Station - Mile 17', notes: null },
            { amenity_type: 'aid_station', location_description: 'Tarbell Aid Station - Mile 27', notes: null }
        ],
        policies: [
            { policy_type: 'cutoff_times', policy_text: 'Must be leaving AS4 by 4:00 PM' },
            { policy_type: 'pacer_policy', policy_text: 'Pacers allowed from Yacolt Burn - AS4 for descent to finish. Pacers not allowed to mule, but encouraged to inspire and motivate. Must check in with AS4 prior to descent.' },
            { policy_type: 'drop_bag', policy_text: 'One SMALL drop bag allowed at Yacolt Burn Aid Station' },
            { policy_type: 'camping', policy_text: 'Tent space camping available at Yacolt Recreation Park. Opens 2:00 PM Saturday, July 4th. Included in registration.' }
        ]
    },
    {
        race: {
            name: "Santa's Holiday Hustle 5K & Dirty Santa Trail Run 10K",
            race_date: '2026-12-12',
            race_time: '09:00:00',
            city: 'Camas',
            state: 'WA',
            venue: '625 NE 4th Ave',
            description: 'Join us to celebrate the holidays in an active and festive way! Race starts at 9 am followed by cookies, cocoa and Santa! Choose between T-Shirt, Santa Costume (full suit), or Hat & Gloves in registration.',
            race_type: 'run',
            registration_url: 'https://runsignup.com/Race/WA/Camas/SantasPosse5KRunWalk',
            registration_open: true,
            is_visible: true
        },
        content: {
            edition_number: 6,
            tagline: 'Racing into the Holiday Spirit!',
            theme_type: 'holiday',
            venue_address: '625 NE 4th Ave',
            venue_city: 'Camas',
            venue_state: 'WA',
            venue_zip: '98607'
        },
        distances: [
            { name: '5K Run/Walk', distance_value: 5, distance_unit: 'km', sort_order: 1 },
            { name: 'Virtual 5K', distance_value: 5, distance_unit: 'km', sort_order: 2 },
            { name: 'Dirty Santa 10K Trail Run', distance_value: 10, distance_unit: 'km', sort_order: 3 }
        ],
        special_categories: [
            { category_name: 'Kids 12 and Under', pricing_rule: 'free', eligibility_description: 'FREE entry', age_limit: 12, sort_order: 1 },
            { category_name: 'Youth 13-17', pricing_rule: 'discounted', discount_percentage: 50, eligibility_description: '50% discount', age_limit: 17, sort_order: 2 }
        ],
        themed_content: {
            theme_name: 'Christmas',
            theme_description: 'Choose between T-Shirt, Santa Costume (full suit), or Hat & Gloves in registration!',
            costume_contest: true,
            costume_prize_description: 'Santa costume included with registration - full suit available!'
        }
    }
];

async function seedRaces() {
    console.log('Starting race seed...\n');

    for (const raceData of races) {
        console.log(`\n📍 Processing: ${raceData.race.name}`);

        try {
            // 1. Insert race
            const { data: race, error: raceError } = await supabase
                .from('races')
                .insert(raceData.race)
                .select()
                .single();

            if (raceError) {
                console.error(`  ❌ Error inserting race:`, raceError.message);
                continue;
            }
            console.log(`  ✅ Race created: ${race.id}`);

            const raceId = race.id;

            // 2. Insert content
            if (raceData.content) {
                const { error } = await supabase
                    .from('race_content')
                    .insert({ ...raceData.content, race_id: raceId });
                if (error) console.error(`  ❌ Content error:`, error.message);
                else console.log(`  ✅ Content added`);
            }

            // 3. Insert distances
            if (raceData.distances?.length) {
                const distances = raceData.distances.map(d => ({ ...d, race_id: raceId }));
                const { error } = await supabase.from('race_distances').insert(distances);
                if (error) console.error(`  ❌ Distances error:`, error.message);
                else console.log(`  ✅ ${distances.length} distances added`);
            }

            // 4. Insert beneficiaries
            if (raceData.beneficiaries?.length) {
                const beneficiaries = raceData.beneficiaries.map(b => ({ ...b, race_id: raceId }));
                const { error } = await supabase.from('race_beneficiaries').insert(beneficiaries);
                if (error) console.error(`  ❌ Beneficiaries error:`, error.message);
                else console.log(`  ✅ ${beneficiaries.length} beneficiaries added`);
            }

            // 5. Insert policies
            if (raceData.policies?.length) {
                const policies = raceData.policies.map(p => ({ ...p, race_id: raceId }));
                const { error } = await supabase.from('race_policies').insert(policies);
                if (error) console.error(`  ❌ Policies error:`, error.message);
                else console.log(`  ✅ ${policies.length} policies added`);
            }

            // 6. Insert packet pickup
            if (raceData.packet_pickup?.length) {
                const pickups = raceData.packet_pickup.map(p => ({ ...p, race_id: raceId }));
                const { error } = await supabase.from('packet_pickup_locations').insert(pickups);
                if (error) console.error(`  ❌ Packet pickup error:`, error.message);
                else console.log(`  ✅ ${pickups.length} packet pickup locations added`);
            }

            // 7. Insert special categories
            if (raceData.special_categories?.length) {
                const categories = raceData.special_categories.map(c => ({ ...c, race_id: raceId }));
                const { error } = await supabase.from('special_participant_categories').insert(categories);
                if (error) console.error(`  ❌ Special categories error:`, error.message);
                else console.log(`  ✅ ${categories.length} special categories added`);
            }

            // 8. Insert themed content
            if (raceData.themed_content) {
                const { error } = await supabase
                    .from('themed_event_content')
                    .insert({ ...raceData.themed_content, race_id: raceId });
                if (error) console.error(`  ❌ Themed content error:`, error.message);
                else console.log(`  ✅ Themed content added`);
            }

            // 9. Insert amenities
            if (raceData.amenities?.length) {
                const amenities = raceData.amenities.map(a => ({ ...a, race_id: raceId }));
                const { error } = await supabase.from('course_amenities').insert(amenities);
                if (error) console.error(`  ❌ Amenities error:`, error.message);
                else console.log(`  ✅ ${amenities.length} course amenities added`);
            }

        } catch (err) {
            console.error(`  ❌ Exception:`, err.message);
        }
    }

    console.log('\n\n✅ Race seed complete!');
}

seedRaces();
