/**
 * Import Race Data from Research
 * Imports all the gathered race data into the Supabase database
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ===== CRITICAL RACE FIXES =====
const criticalFixes = [
    {
        name: 'Pacific Crest Endurance Sports Festival',
        updates: {
            venue: 'Riverbend Park',
            address: '799 SW Columbia St, Bend, OR 97702',
            registration_url: 'https://runsignup.com/Race/OR/Bend/PacificCrestEnduranceSportsFestival'
        }
    },
    {
        name: 'Bigfoot Fun Run',
        updates: {
            venue: 'Yacolt Recreation Park',
            address: '105 E Yacolt Rd, Yacolt, WA 98675',
            race_time: '09:00:00',
            registration_url: 'https://runsignup.com/Race/WA/Yacolt/BigfootFunRun'
        }
    },
    {
        name: 'Girlfriends All-Women\'s Triathlon & Fitness Festival',
        updates: {
            race_date: '2026-08-09',
            venue: 'Frenchman\'s Bar Regional Park',
            address: '9612 NW Lower River Rd, Vancouver, WA 98660',
            race_time: '09:00:00',
            registration_url: 'https://runsignup.com/Race/WA/Vancouver/GirlfriendsTriathlonFitnessFestival'
        }
    },
    {
        name: 'Girlfriends Run',
        updates: {
            race_date: '2026-10-18',
            venue: 'Vancouver Waterfront Park',
            address: '695 Waterfront Way, Vancouver, WA 98660',
            race_time: '09:00:00',
            registration_url: 'https://runsignup.com/Race/WA/Vancouver/GirlfriendsRun'
        }
    },
    // Also fix the orphan races
    {
        name: 'Bigfoot 5K/10K',
        updates: {
            venue: 'Skamania County Fairgrounds',
            race_time: '09:00:00',
            registration_url: 'https://runsignup.com/Race/WA/Skamania/Bigfoot5K10K'
        }
    },
    {
        name: 'Girlfriends Triathlon',
        matchPartial: true,
        updates: {
            venue: 'Frenchman\'s Bar Regional Park',
            race_time: '09:00:00',
            registration_url: 'https://runsignup.com/Race/WA/Vancouver/GirlfriendsTriathlonFitnessFestival'
        }
    },
    {
        name: 'Girlfriends Half Marathon',
        matchPartial: true,
        updates: {
            venue: 'Vancouver Waterfront Park',
            race_time: '09:00:00',
            registration_url: 'https://runsignup.com/Race/WA/Vancouver/GirlfriendsRun'
        }
    }
];

// ===== RACE DETAILS (terrain, elevation, includes) =====
const raceDetails = [
    {
        name: 'Couve Clover Run',
        updates: {
            terrain: 'road',
            elevation: 'Mostly flat with couple short hills',
            includes: ['tech_shirt', 'medal', 'timing', 'food', 'beer'],
            venue: 'Vancouver Waterfront Park',
            address: '695 Waterfront Way, Vancouver, WA 98660',
            race_time: '09:00:00',
            registration_url: 'https://runsignup.com/Race/WA/Vancouver/CouveCloverRun'
        }
    },
    {
        name: 'Spring Classic',
        matchPartial: true,
        updates: {
            terrain: 'road',
            elevation: 'Flat - pancake flats',
            includes: ['tech_shirt', 'medal', 'timing', 'parking'],
            venue: 'Vancouver Lake Regional Park',
            address: '6801 NW Lower River Rd, Vancouver, WA 98660',
            registration_url: 'https://www.trisignup.com/Race/WA/Vancouver/SpringClassicDuathlonHalf10k5k'
        }
    },
    {
        name: 'PDX Triathlon Festival',
        updates: {
            terrain: 'road',
            elevation: 'Flat and fast',
            includes: ['tech_shirt', 'medal', 'timing', 'parking'],
            venue: 'Blue Lake Regional Park',
            address: '21224 NE Blue Lake Dr, Fairview, OR 97024',
            race_time: '08:30:00',
            registration_url: 'https://www.trisignup.com/Race/OR/Fairview/PDXTriathlonFestival'
        }
    },
    {
        name: 'Scary Run',
        updates: {
            terrain: 'road/trail',
            elevation: 'Flat along Columbia River',
            includes: ['tech_shirt', 'medal', 'timing', 'food', 'beer'],
            venue: 'Reflection Plaza / Bi-Mart Washougal',
            address: '1703 Main St, Washougal, WA 98671',
            registration_url: 'https://runsignup.com/Race/WA/Washougal/ScaryRun'
        }
    },
    {
        name: 'Silver Falls Trail Challenge',
        updates: {
            terrain: 'trail',
            venue: 'Silver Falls State Park - South Falls Day Use Area',
            parking: '$5 state park day use fee',
            registration_url: 'https://ultrasignup.com/register.aspx?did=131693'
        }
    },
    {
        name: 'Crown Stub 100',
        updates: {
            terrain: 'trail',
            elevation: '10,000+ ft gain',
            venue: 'L.L. Stub Stewart State Park - Hilltop Day-Use Area',
            race_time: '14:00:00',
            registration_url: 'https://ultrasignup.com/register.aspx?did=131747'
        }
    },
    {
        name: 'Stub Stewart Trail Challenge',
        updates: {
            terrain: 'trail',
            venue: 'L.L. Stub Stewart State Park - Hilltop Day-Use Area',
            race_time: '09:00:00',
            registration_url: 'https://ultrasignup.com/register.aspx?did=131748'
        }
    },
    {
        name: 'Hellz Bellz Ultra',
        updates: {
            terrain: 'trail',
            venue: 'Yacolt Recreation Park',
            race_time: '06:00:00',
            registration_url: 'https://ultrasignup.com/register.aspx?did=131749'
        }
    },
    {
        name: 'Battle to the Pacific',
        updates: {
            terrain: 'trail',
            elevation: 'Mostly flat',
            venue: 'Fort Stevens State Park - N. Coffenbury Lake Day-Use Area',
            parking: '$5 daily park permit',
            registration_url: 'https://ultrasignup.com/register.aspx?did=128806'
        }
    },
    {
        name: 'Reflection Run',
        updates: {
            venue: 'Reflection Plaza / Bi-Mart Washougal',
            address: '1703 Main St, Washougal, WA 98671',
            registration_url: 'https://runsignup.com/Race/WA/Washougal/reflectionrunwa'
        }
    },
    {
        name: 'Columbia River Triathlon',
        matchPartial: true,
        updates: {
            venue: 'Frenchman\'s Bar Regional Park',
            address: '9612 NW Lower River Rd, Vancouver, WA 98660',
            registration_url: 'https://www.trisignup.com/Race/WA/Vancouver/ColumbiaRiverTriathlon'
        }
    },
    {
        name: 'PeaceHealth AppleTree Marathon',
        matchPartial: true,
        updates: {
            venue: 'Officers Row',
            address: '1101 Officers Row, Vancouver, WA 98661',
            registration_url: 'https://runsignup.com/Race/WA/Vancouver/PeacehealthAppletreeMarathon'
        }
    },
    {
        name: 'Pacific Coast Running Festival',
        updates: {
            terrain: 'sand/road',
            venue: 'Long Beach Peninsula',
            registration_url: 'https://runsignup.com/Race/WA/LongBeach/PacificCoastRunningFestival'
        }
    },
    {
        name: 'Santa\'s Holiday Hustle',
        matchPartial: true,
        updates: {
            venue: 'Lacamas Lake Lodge',
            registration_url: 'https://runsignup.com/Race/WA/Camas/SantasHolidayHustle'
        }
    },
    {
        name: 'Resolution Run',
        updates: {
            venue: 'La Center High School',
            address: '725 NE Highland Rd, La Center, WA 98629',
            registration_url: 'https://runsignup.com/Race/WA/LaCenter/WREResolutionRun'
        }
    }
];

// ===== PRICING DATA =====
const pricingData = [
    {
        race_name: 'Couve Clover Run',
        distances: [
            { name: 'Lucky Leap 1 Mile', price: 30 },
            { name: '3 Mile Run', price: 55 },
            { name: '3 Mile Walk', price: 55 },
            { name: 'Lucky 7 Mile', price: 75 },
            { name: '10 Mile', price: 80 },
            { name: 'Virtual 3 Mile', price: 50 },
            { name: 'Virtual 7 Mile', price: 50 },
            { name: 'Virtual 10 Mile', price: 50 }
        ]
    },
    {
        race_name: 'Spring Classic',
        matchPartial: true,
        distances: [
            { name: '5K', price: 61 },
            { name: '10K', price: 78 },
            { name: 'Half Marathon', price: 99 },
            { name: 'Individual Duathlon', price: 108 },
            { name: 'Duathlon 2-Person Relay', price: 198 },
            { name: 'Duathlon 3-Person Relay', price: 198 },
            { name: 'Sprint Duathlon', price: 108 },
            { name: 'Virtual 5K', price: 50 },
            { name: 'Virtual 10K', price: 50 },
            { name: 'Virtual Half Marathon', price: 50 }
        ]
    },
    {
        race_name: 'PDX Triathlon Festival',
        distances: [
            { name: '5K', price: 54 },
            { name: 'Super Sprint Triathlon', price: 125 },
            { name: 'Super Sprint Duathlon', price: 125 },
            { name: 'Sprint Triathlon', price: 137 },
            { name: 'Sprint Duathlon', price: 137 },
            { name: 'Sprint Aquabike', price: 137 },
            { name: 'Sprint Paddle Tri', price: 137 },
            { name: 'Olympic Triathlon', price: 157 },
            { name: 'Olympic Duathlon', price: 157 },
            { name: 'Olympic Aquabike', price: 157 },
            { name: 'Olympic Paddle Tri', price: 157 }
        ]
    },
    {
        race_name: 'Girlfriends Run',
        distances: [
            { name: '6K', price: 62 },
            { name: '6K Run', price: 62 },
            { name: '6K Walk', price: 62 },
            { name: '10K', price: 72 },
            { name: 'Half Marathon', price: 87 },
            { name: 'Virtual 6K', price: 50 },
            { name: 'Virtual 10K', price: 50 },
            { name: 'Virtual Half Marathon', price: 50 }
        ]
    },
    {
        race_name: 'Scary Run',
        distances: [
            { name: '5K', price: 50 },
            { name: '10K', price: 65 },
            { name: '15K', price: 85 },
            { name: 'Virtual 5K', price: 50 },
            { name: 'Virtual 10K', price: 50 },
            { name: 'Virtual 15K', price: 50 }
        ]
    },
    {
        race_name: 'Girlfriends',
        matchPartial: true,
        distances: [
            { name: 'Sprint Triathlon', price: 142 },
            { name: 'Sprint Duathlon', price: 142 },
            { name: 'Sprint Aquabike', price: 142 },
            { name: 'Sprint Paddle Tri', price: 142 },
            { name: '5K', price: 52 },
            { name: '5K Run', price: 52 }
        ]
    },
    {
        race_name: 'Silver Falls',
        matchPartial: true,
        distances: [
            { name: '1/4 Marathon', price: 86 },
            { name: '1/2 Marathon', price: 97 },
            { name: '12 Mile Ruck', price: 76 }
        ]
    },
    {
        race_name: 'Crown Stub 100',
        distances: [
            { name: '100 Mile', price: 275 },
            { name: 'Crown Stub 100', price: 275 },
            { name: 'Royal Ultra Relay', price: 350 }
        ]
    },
    {
        race_name: 'Stub Stewart',
        matchPartial: true,
        distances: [
            { name: '1/4 Marathon', price: 69 },
            { name: '1/2 Marathon', price: 69 },
            { name: '3/4 Marathon', price: 69 },
            { name: 'Marathon', price: 69 }
        ]
    },
    {
        race_name: 'Hellz Bellz',
        matchPartial: true,
        distances: [
            { name: '50 Mile', price: 150 },
            { name: 'Hellz Bellz Ultra', price: 150 },
            { name: 'Purgatory Trail Marathon', price: 100 },
            { name: 'Marathon', price: 100 }
        ]
    },
    {
        race_name: 'Battle to the Pacific',
        distances: [
            { name: '5K', price: 49 },
            { name: '1/4 Marathon', price: 69 },
            { name: '1/2 Marathon', price: 89 },
            { name: '12 Mile Ruck', price: 69 }
        ]
    },
    {
        race_name: 'Resolution Run',
        distances: [
            { name: '5K', price: 45 },
            { name: '5K Run/Walk', price: 45 },
            { name: '10K', price: 55 },
            { name: '10K Run/Walk', price: 55 },
            { name: 'Virtual 5K', price: 40 }
        ]
    },
    {
        race_name: 'Reflection Run',
        distances: [
            { name: '5K', price: 50 },
            { name: '10K', price: 60 },
            { name: 'Half Marathon', price: 80 },
            { name: '12 Mile Ruck', price: 65 }
        ]
    },
    {
        race_name: 'Columbia River Triathlon',
        matchPartial: true,
        distances: [
            { name: 'Kids Tri', price: 0 },
            { name: 'Sunset 5K', price: 52 },
            { name: '5K', price: 52 },
            { name: 'Sunset 10K', price: 62 },
            { name: '10K', price: 62 },
            { name: 'Sprint Tri', price: 140 },
            { name: 'Sprint Triathlon', price: 140 },
            { name: 'Olympic Tri', price: 160 },
            { name: 'Olympic Triathlon', price: 160 }
        ]
    },
    {
        race_name: 'AppleTree',
        matchPartial: true,
        distances: [
            { name: 'Sunset 5K', price: 50 },
            { name: '5K', price: 50 },
            { name: 'Half Marathon', price: 95 },
            { name: 'Marathon', price: 120 },
            { name: 'First Responder', price: 200 }
        ]
    },
    {
        race_name: 'Pacific Coast',
        matchPartial: true,
        distances: [
            { name: 'Sunset Sand 5K', price: 40 },
            { name: '5K', price: 50 },
            { name: '10K', price: 60 },
            { name: 'Half Marathon', price: 90 },
            { name: 'Sand Marathon', price: 130 },
            { name: 'Marathon', price: 130 },
            { name: 'Tour de Pacific', price: 60 },
            { name: 'Kids 1 Mile', price: 15 },
            { name: 'Kids 1/2 Mile', price: 15 }
        ]
    },
    {
        race_name: 'Santa',
        matchPartial: true,
        distances: [
            { name: '5K', price: 45 },
            { name: '5K Run/Walk', price: 45 },
            { name: 'Dirty Santa 10K', price: 55 },
            { name: '10K', price: 55 },
            { name: 'Virtual 5K', price: 40 }
        ]
    },
    {
        race_name: 'Bigfoot Fun Run',
        distances: [
            { name: '5K', price: 40 },
            { name: '5K Run/Walk', price: 40 },
            { name: '10K', price: 50 },
            { name: '10K Run/Walk', price: 50 }
        ]
    },
    {
        race_name: 'Bigfoot 5K/10K',
        distances: [
            { name: '5K', price: 40 },
            { name: '10K', price: 50 }
        ]
    },
    {
        race_name: 'White River Snowshoe',
        matchPartial: true,
        distances: [
            { name: '4K', price: 55 },
            { name: '4K Snowshoe', price: 55 },
            { name: '8K', price: 65 },
            { name: '8K Snowshoe', price: 65 }
        ]
    },
    {
        race_name: 'Hagg Lake',
        matchPartial: true,
        distances: [
            { name: 'Sprint Tri', price: 130 },
            { name: 'Sprint Triathlon', price: 130 },
            { name: 'Olympic Tri', price: 150 },
            { name: 'Olympic Triathlon', price: 150 },
            { name: 'Off-Road Tri', price: 130 },
            { name: 'Sprint Duathlon', price: 130 },
            { name: 'Olympic Duathlon', price: 150 },
            { name: 'Sprint Aquabike', price: 130 },
            { name: 'Olympic Aquabike', price: 150 },
            { name: 'Paddle Tri', price: 130 },
            { name: 'Trail Half Marathon', price: 85 },
            { name: 'Trail 5K', price: 50 },
            { name: '5K', price: 50 }
        ]
    }
];

// ===== IMPORT FUNCTIONS =====

async function findRace(name, matchPartial = false) {
    let query = supabase.from('races').select('id, name');

    if (matchPartial) {
        query = query.ilike('name', `%${name}%`);
    } else {
        query = query.eq('name', name);
    }

    const { data } = await query.limit(1).single();
    return data;
}

async function updateRaces() {
    console.log('\n========================================');
    console.log('UPDATING RACE DETAILS');
    console.log('========================================\n');

    // 1. Apply critical fixes
    console.log('--- Critical Fixes ---');
    for (const fix of criticalFixes) {
        const race = await findRace(fix.name, fix.matchPartial);
        if (race) {
            const { error } = await supabase.from('races').update(fix.updates).eq('id', race.id);
            console.log(`${error ? '❌' : '✓'} ${fix.name}: ${error ? error.message : 'Updated'}`);
        } else {
            console.log(`⚠ ${fix.name}: Not found`);
        }
    }

    // 2. Apply race details
    console.log('\n--- Race Details ---');
    for (const detail of raceDetails) {
        const race = await findRace(detail.name, detail.matchPartial);
        if (race) {
            const { error } = await supabase.from('races').update(detail.updates).eq('id', race.id);
            console.log(`${error ? '❌' : '✓'} ${race.name}: ${error ? error.message : 'Updated'}`);
        } else {
            console.log(`⚠ ${detail.name}: Not found`);
        }
    }
}

async function updatePricing() {
    console.log('\n========================================');
    console.log('UPDATING DISTANCE PRICING');
    console.log('========================================\n');

    for (const priceData of pricingData) {
        const race = await findRace(priceData.race_name, priceData.matchPartial);
        if (!race) {
            console.log(`⚠ ${priceData.race_name}: Race not found`);
            continue;
        }

        // Get existing distances
        const { data: distances } = await supabase
            .from('race_distances')
            .select('id, name, base_price')
            .eq('race_id', race.id);

        if (!distances || distances.length === 0) {
            console.log(`⚠ ${race.name}: No distances found`);
            continue;
        }

        let updated = 0;
        for (const dist of distances) {
            // Find matching price
            const priceInfo = priceData.distances.find(p =>
                dist.name.toLowerCase().includes(p.name.toLowerCase()) ||
                p.name.toLowerCase().includes(dist.name.toLowerCase())
            );

            if (priceInfo && dist.base_price !== priceInfo.price) {
                const { error } = await supabase
                    .from('race_distances')
                    .update({ base_price: priceInfo.price })
                    .eq('id', dist.id);

                if (!error) updated++;
            }
        }

        console.log(`✓ ${race.name}: Updated ${updated}/${distances.length} distances`);
    }
}

async function verifySummary() {
    console.log('\n========================================');
    console.log('VERIFICATION SUMMARY');
    console.log('========================================\n');

    // Check critical fields
    const { data: races } = await supabase
        .from('races')
        .select('name, venue, race_time, registration_url')
        .or('venue.is.null,race_time.is.null,registration_url.is.null');

    if (races && races.length > 0) {
        console.log('Races still missing critical data:');
        races.forEach(r => {
            const missing = [];
            if (!r.venue) missing.push('venue');
            if (!r.race_time) missing.push('time');
            if (!r.registration_url) missing.push('registration URL');
            if (missing.length > 0) {
                console.log(`  - ${r.name}: ${missing.join(', ')}`);
            }
        });
    } else {
        console.log('✓ All races have critical fields populated!');
    }

    // Check pricing
    const { data: distances } = await supabase
        .from('race_distances')
        .select('race_id, base_price');

    const withPrice = distances?.filter(d => d.base_price > 0).length || 0;
    const total = distances?.length || 0;
    console.log(`\nPricing: ${withPrice}/${total} distances have prices set`);
}

async function main() {
    console.log('Starting Race Data Import...\n');

    await updateRaces();
    await updatePricing();
    await verifySummary();

    console.log('\n✅ Import Complete!');
}

main().catch(console.error);
