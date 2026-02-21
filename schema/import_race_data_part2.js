/**
 * Import Race Data Part 2
 * Imports all remaining race data: pricing, terrain, elevation, includes, parking, packet pickup, aid stations
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Complete race data from research
const raceData = {
    "Girlfriends All-Women's Triathlon & Fitness Festival": {
        terrain: "road",
        elevation: "Flat (down-current swim, flat bike/run)",
        includes: ["tech_shirt", "medal", "timing", "food", "beer", "parking", "body_marking", "transition_area"],
        parking: "Parking included in registration fee at Frenchman's Bar Regional Park",
        aid_stations: "Water/electrolyte stations on course; triathlon has full transition area support",
        pricing: { "Sprint Triathlon": 142, "Sprint Duathlon": 142, "Sprint Aquabike": 142, "Sprint Paddle Tri": 142, "Relay": 142, "5K": 52, "5K Run": 52 }
    },
    "PeaceHealth AppleTree Marathon": {
        terrain: "road",
        elevation: "Flat and fast (Boston Qualifier course)",
        includes: ["tech_shirt", "medal", "timing", "food", "beer", "photos"],
        parking: "Free parking at Fort Vancouver/Officers Row area",
        aid_stations: "Water stations approximately every mile for Marathon/Half Marathon; porta-potties at each water station",
        pricing: { "Marathon": 129, "Half Marathon": 103, "5K": 54, "Sunset 5K": 54 }
    },
    "Pacific Crest Endurance Sports Festival": {
        terrain: "mixed (road running, river swim, mountain bike course)",
        elevation: "Beastman Bike: 2,000 ft ascent over 14 miles up Mt Bachelor; Running courses mostly flat",
        includes: ["tech_shirt", "medal", "timing", "food", "beer", "parking", "body_marking", "transition_area"],
        parking: "Included in registration at Riverbend Park",
        aid_stations: "Multiple aid stations on all courses; full support at transition areas; water temp ~60°F",
        pricing: { "Beastman": 292, "Olympic Triathlon": 137, "Sprint Triathlon": 127, "Marathon": 123, "Half Marathon": 93, "10K": 69, "5K": 57, "Kids": 25 }
    },
    "Resolution Run": {
        terrain: "mixed (road/trail)",
        elevation: "Rolling with some hills - challenging course",
        includes: ["tech_shirt", "medal", "timing", "food"],
        parking: "Free parking at La Center High School",
        aid_stations: "Water stations on course; post-race pancake breakfast ($10 donation)",
        pricing: { "5K": 61, "5K Run/Walk": 61, "10K": 78, "10K Run/Walk": 78, "Virtual": 40 }
    },
    "White River Snowshoe Race": {
        terrain: "snow",
        elevation: "Gradual uphill first mile, then rolling/downhill through forest",
        includes: ["medal", "timing", "food"],
        parking: "Sno-Park permit required ($5-10)",
        aid_stations: "Start/finish area support; warm snacks and beverages post-race",
        pricing: { "4K": 45, "4K Snowshoe": 45, "8K": 55, "8K Snowshoe": 55 }
    },
    "Crown Stub 100": {
        terrain: "mixed (10% single track trail, 50% paved, 40% gravel)",
        elevation: "7,000+ ft total gain",
        includes: ["medal", "timing", "food"],
        parking: "$5 Oregon State Park day-use fee at Stub Stewart",
        aid_stations: "13 total aid station stops; 4 full-service with hot food; Skratch Labs hydration",
        pricing: { "100 Mile": 257, "Crown Stub 100": 257, "Ultra Relay": 357 }
    },
    "Stub Stewart Trail Challenge": {
        terrain: "trail",
        elevation: "Rolling hills to challenging climbs - varied terrain",
        includes: ["medal", "timing", "food", "beer"],
        parking: "$5 Oregon State Park permit (cash, check, or card)",
        aid_stations: "2 aid stations on course - CUPLESS EVENT (bring your own drinking vessel)",
        pricing: { "Quarter Marathon": 85, "1/4 Marathon": 85, "Half Marathon": 85, "1/2 Marathon": 85, "3/4 Marathon": 85, "Marathon": 85 }
    },
    "Spring Classic": {
        terrain: "road",
        elevation: "Flat (Vancouver Lake area)",
        includes: ["tech_shirt", "medal", "timing", "food"],
        parking: "Free at Vancouver Lake",
        aid_stations: "Water stations on course"
    },
    "Reflection Run": {
        terrain: "road",
        elevation: "Flat along Columbia River",
        includes: ["tech_shirt", "medal", "timing", "food"],
        parking: "Free parking at Washougal Waterfront Park",
        aid_stations: "Water stations along course with views of Mt. Hood and the Columbia River Gorge"
    },
    "PDX Triathlon Festival": {
        terrain: "road",
        elevation: "Flat",
        includes: ["tech_shirt", "medal", "timing", "food", "body_marking", "transition_area"],
        parking: "Blue Lake Regional Park parking",
        aid_stations: "Full triathlon support with transition area"
    },
    "Hagg Lake Triathlon": {
        terrain: "mixed (trail/off-road for multisport; rolling hills)",
        elevation: "Rolling hills on bike and run; technical trail sections",
        includes: ["tech_shirt", "medal", "timing", "food", "beer", "parking", "body_marking", "transition_area"],
        parking: "Included in registration (display parking pass); $5 day-use for additional vehicles",
        aid_stations: "Multiple aid stations; full transition support; USAT Cross Triathlon Nationals"
    },
    "Hellz Bellz Ultra": {
        terrain: "trail",
        elevation: "~6,000 ft gain; intense single track climbs",
        includes: ["medal", "timing", "food"],
        parking: "Free at Yacolt Recreation Park",
        aid_stations: "4 total aid stations: Yacolt Burn AS (mile 10 & 14), Grouse Vista AS (mile 17), Tarbell AS (mile 27)",
        pricing: { "50 Mile": 127, "Hellz Bellz Ultra": 127, "Purgatory Trail Marathon": 97, "Marathon": 97 }
    },
    "Bigfoot 5K/10K": {
        terrain: "road/trail",
        elevation: "Rolling",
        includes: ["tech_shirt", "medal", "timing", "food"],
        parking: "Free at Yacolt Recreation Park",
        aid_stations: "Water stations on course"
    },
    "Bigfoot Fun Run": {
        terrain: "road/trail",
        elevation: "Rolling",
        includes: ["tech_shirt", "medal", "timing", "food"],
        parking: "Free at Yacolt Recreation Park",
        aid_stations: "Water stations on course"
    },
    "Columbia River Triathlon": {
        terrain: "road",
        elevation: "Flat (Columbia River area)",
        includes: ["tech_shirt", "medal", "timing", "food", "beer", "parking", "body_marking", "transition_area"],
        parking: "Included in registration at Frenchman's Bar Park",
        aid_stations: "Water/electrolyte stations; Olympic has 5 water station access points"
    },
    "Girlfriends Half Marathon": {
        terrain: "road",
        elevation: "Flat along waterfront",
        includes: ["tech_shirt", "medal", "timing", "food"],
        parking: "Waterfront Park area",
        aid_stations: "Water stations on course"
    },
    "Girlfriends Triathlon": {
        terrain: "road",
        elevation: "Flat",
        includes: ["tech_shirt", "medal", "timing", "food", "body_marking", "transition_area"],
        parking: "Frenchman's Bar Park",
        aid_stations: "Full triathlon support",
        pricing: { "Sprint Triathlon": 142, "Super Sprint": 125, "Relay": 222 }
    },
    "Pacific Coast Running Festival": {
        terrain: "sand/road",
        elevation: "Flat (beach)",
        includes: ["tech_shirt", "medal", "timing", "food"],
        parking: "Beach parking available",
        aid_stations: "Water stations on course"
    },
    "Girlfriends Run": {
        terrain: "road",
        elevation: "Flat",
        includes: ["tech_shirt", "medal", "timing", "food"],
        parking: "Waterfront Park area",
        aid_stations: "Water stations on course"
    },
    "Scary Run": {
        terrain: "road/trail",
        elevation: "Flat (single-loop course in Captain William Clark Park)",
        includes: ["tech_shirt", "medal", "timing", "food", "beer"],
        parking: "Captain William Clark Park area",
        aid_stations: "Water stations; Spooky Forest on every lap; cheer zone at Addy Street"
    },
    "Santa's Holiday Hustle": {
        terrain: "road (5K), trail (10K)",
        elevation: "Flat to rolling",
        includes: ["tech_shirt", "medal", "timing", "food"],
        parking: "Camas area",
        aid_stations: "Water stations on course"
    },
    "Battle to the Pacific": {
        terrain: "trail (paved hiking/biking trails)",
        elevation: "Flat",
        includes: ["medal", "timing", "food", "beer"],
        parking: "$5 Oregon State Park daily permit (cash/check)",
        aid_stations: "Aid stations on course - CUPLESS EVENT (bring your own vessel)"
    },
    "Silver Falls Trail Challenge": {
        terrain: "trail",
        elevation: "Rolling with significant climbs/descents through Trail of 10 Falls",
        includes: ["medal", "timing", "food"],
        parking: "$5 Oregon State Park permit",
        aid_stations: "Aid stations on course - CUPLESS EVENT"
    },
    "Appletree Marathon": {
        terrain: "road",
        elevation: "Flat and fast",
        includes: ["tech_shirt", "medal", "timing", "food", "beer"],
        parking: "Free at Fort Vancouver",
        aid_stations: "Water stations every mile"
    }
};

// Packet pickup locations
const packetPickups = [
    {
        race_pattern: "Girlfriends All-Women", pickups: [
            { location: "Foot Traffic Vancouver", address: "305 SE Chkalov Dr, Vancouver, WA 98683", date: "Thursday before race", hours: "10:00 AM - 5:00 PM" },
            { location: "Frenchman's Bar Regional Park", address: "9612 NW Lower River Rd, Vancouver, WA 98660", date: "Race Day", hours: "7:00 AM - 2:00 PM" }
        ]
    },
    {
        race_pattern: "PeaceHealth AppleTree", pickups: [
            { location: "Foot Traffic Vancouver", address: "305 SE Chkalov Dr, Vancouver, WA 98683", date: "Friday before race", hours: "10:00 AM - 6:00 PM" },
            { location: "Fort Vancouver - Officers Row", address: "1101 Officers Row, Vancouver, WA 98661", date: "Race Day", hours: "Check pre-race instructions" }
        ]
    },
    {
        race_pattern: "Pacific Crest Endurance", pickups: [
            { location: "Crux Fermentation Project Brewery", address: "50 SW Division St, Bend, OR 97702", date: "Thursday", hours: "12:00 PM - 6:00 PM" },
            { location: "Riverbend Park", address: "799 SW Columbia St, Bend, OR 97702", date: "Friday", hours: "12:00 PM - 6:00 PM" },
            { location: "Riverbend Park", address: "799 SW Columbia St, Bend, OR 97702", date: "Race Day", hours: "5:30 AM - 8:00 AM" }
        ]
    },
    {
        race_pattern: "Resolution Run", pickups: [
            { location: "La Center High School", address: "725 NE Highland Rd, La Center, WA 98629", date: "Day before race", hours: "4:00 PM - 7:00 PM" },
            { location: "La Center High School", address: "725 NE Highland Rd, La Center, WA 98629", date: "Race Day", hours: "7:30 AM - 8:45 AM" }
        ]
    },
    {
        race_pattern: "White River Snowshoe", pickups: [
            { location: "White River West Sno-Park", address: "Near Hwy 26/35 junction, Government Camp, OR", date: "Race Day", hours: "8:30 AM" }
        ]
    },
    {
        race_pattern: "Crown Stub 100", pickups: [
            { location: "Hilltop Day-Use Area, L.L. Stub Stewart State Park", address: "Buxton, OR", date: "Race Day", hours: "Before 12:00 PM start" }
        ]
    },
    {
        race_pattern: "Stub Stewart Trail Challenge", pickups: [
            { location: "Hilltop Day-Use Area Shelter, L.L. Stub Stewart State Park", address: "Buxton, OR", date: "Race Day", hours: "8:00 AM" }
        ]
    },
    {
        race_pattern: "Spring Classic", pickups: [
            { location: "Foot Traffic Vancouver", address: "305 SE Chkalov Dr, Vancouver, WA 98683", date: "Friday before race", hours: "10:00 AM - 6:00 PM" },
            { location: "Vancouver Lake", address: "Vancouver, WA", date: "Race Day", hours: "6:30 AM - 7:30 AM" }
        ]
    },
    {
        race_pattern: "Reflection Run", pickups: [
            { location: "Washougal Waterfront Park", address: "Washougal, WA", date: "Race Day", hours: "7:00 AM - 8:30 AM" }
        ]
    },
    {
        race_pattern: "Hellz Bellz", pickups: [
            { location: "Yacolt Recreation Park", address: "26612 E Hoag St, Yacolt, WA 98675", date: "Day before race", hours: "2:00 PM onwards" },
            { location: "Yacolt Recreation Park", address: "Yacolt, WA", date: "Race Day", hours: "5:30 AM check-in" }
        ]
    },
    {
        race_pattern: "Bigfoot", pickups: [
            { location: "Yacolt Recreation Park", address: "26612 E Hoag St, Yacolt, WA 98675", date: "Race Day", hours: "7:30 AM - 8:45 AM" }
        ]
    },
    {
        race_pattern: "Columbia River Triathlon", pickups: [
            { location: "Foot Traffic Vancouver", address: "305 SE Chkalov Dr, Vancouver, WA 98683", date: "Thursday", hours: "10:00 AM - 5:00 PM" },
            { location: "Frenchman's Bar", address: "9612 NW Lower River Road, Vancouver, WA 98660", date: "Friday", hours: "2:00 PM - 7:00 PM" },
            { location: "Frenchman's Bar", address: "9612 NW Lower River Road, Vancouver, WA 98660", date: "Saturday", hours: "7:00 AM - 2:00 PM" }
        ]
    },
    {
        race_pattern: "Hagg Lake", pickups: [
            { location: "Henry Hagg Lake - Bobcat Cove", address: "Henry Hagg Lake State Park, Gaston, OR", date: "Friday", hours: "Check event schedule" },
            { location: "Henry Hagg Lake - Registration Area", address: "Bobcat Cove, Hagg Lake", date: "Race Day", hours: "6:00 AM - 7:30 AM" }
        ]
    },
    {
        race_pattern: "Girlfriends Run", pickups: [
            { location: "Foot Traffic Vancouver", address: "305 SE Chkalov Dr, Vancouver, WA 98683", date: "Friday before race", hours: "10:00 AM - 6:00 PM" }
        ]
    },
    {
        race_pattern: "Girlfriends Half", pickups: [
            { location: "Foot Traffic Vancouver", address: "305 SE Chkalov Dr, Vancouver, WA 98683", date: "Friday before race", hours: "10:00 AM - 6:00 PM" }
        ]
    },
    {
        race_pattern: "Scary Run", pickups: [
            { location: "Bi-Mart Parking Lot", address: "3003 Addy St, Washougal, WA", date: "Sunday before race", hours: "7:00 AM - 9:00 AM" }
        ]
    },
    {
        race_pattern: "Battle to the Pacific", pickups: [
            { location: "N. Coffenbury Lake Day-Use Area, Fort Stevens State Park", address: "Hammond, OR", date: "Race Day", hours: "Before 9:00 AM start" }
        ]
    },
    {
        race_pattern: "Silver Falls", pickups: [
            { location: "South Falls Day Use Area", address: "Silver Falls State Park, Sublimity, OR", date: "Race Day", hours: "Check event schedule" }
        ]
    }
];

// Standard policies
const standardPolicies = [
    { policy_type: 'headphone_policy', policy_text: 'One ear-bud only, keep volume low so you can hear course marshal instructions.' },
    { policy_type: 'dog_policy', policy_text: 'Only Service Dogs allowed on course, must start at end of race.' },
    { policy_type: 'stroller_policy', policy_text: 'Allowed but must start at end of race after all other participants.' },
    { policy_type: 'bag_check', policy_text: 'Yes, label bag with name and bib number.' },
    { policy_type: 'refund_policy', policy_text: 'No refunds issued (no exceptions).' },
    { policy_type: 'deferral_policy', policy_text: '$20 fee, can defer up to 10 days before event to next year or another WHY RACING EVENTS.' },
    { policy_type: 'transfer_policy', policy_text: '$20 fee, can transfer to another participant up to 10 days before event.' }
];

async function findRace(name, matchPartial = true) {
    let query = supabase.from('races').select('id, name');
    if (matchPartial) {
        query = query.ilike('name', `%${name}%`);
    } else {
        query = query.eq('name', name);
    }
    const { data } = await query.limit(1).single();
    return data;
}

async function updateRaceDetails() {
    console.log('\n========================================');
    console.log('UPDATING RACE DETAILS');
    console.log('========================================\n');

    for (const [raceName, data] of Object.entries(raceData)) {
        const race = await findRace(raceName);
        if (!race) {
            console.log(`⚠ ${raceName}: Not found`);
            continue;
        }

        const updates = {};
        if (data.terrain) updates.terrain = data.terrain;
        if (data.elevation) updates.elevation = data.elevation;
        if (data.includes) updates.includes = data.includes;
        if (data.parking) updates.parking = data.parking;
        if (data.aid_stations) updates.aid_stations = data.aid_stations;

        if (Object.keys(updates).length > 0) {
            const { error } = await supabase.from('races').update(updates).eq('id', race.id);
            console.log(`${error ? '❌' : '✓'} ${race.name}: ${error ? error.message : 'Updated details'}`);
        }

        // Update pricing if provided
        if (data.pricing) {
            const { data: distances } = await supabase
                .from('race_distances')
                .select('id, name, base_price')
                .eq('race_id', race.id);

            if (distances) {
                let priceUpdates = 0;
                for (const dist of distances) {
                    for (const [priceName, price] of Object.entries(data.pricing)) {
                        if (dist.name.toLowerCase().includes(priceName.toLowerCase()) ||
                            priceName.toLowerCase().includes(dist.name.toLowerCase())) {
                            if (dist.base_price !== price) {
                                await supabase.from('race_distances').update({ base_price: price }).eq('id', dist.id);
                                priceUpdates++;
                            }
                            break;
                        }
                    }
                }
                if (priceUpdates > 0) console.log(`  → Updated ${priceUpdates} distance prices`);
            }
        }
    }
}

async function addPacketPickups() {
    console.log('\n========================================');
    console.log('ADDING PACKET PICKUP LOCATIONS');
    console.log('========================================\n');

    for (const pickupData of packetPickups) {
        const race = await findRace(pickupData.race_pattern);
        if (!race) {
            console.log(`⚠ ${pickupData.race_pattern}: Not found`);
            continue;
        }

        // Check if pickups already exist
        const { data: existing } = await supabase
            .from('packet_pickup_locations')
            .select('id')
            .eq('race_id', race.id);

        if (existing && existing.length > 0) {
            console.log(`ℹ ${race.name}: Already has ${existing.length} pickup locations`);
            continue;
        }

        // Add pickups
        const pickups = pickupData.pickups.map((p, i) => ({
            race_id: race.id,
            location_name: p.location,
            address: p.address,
            pickup_date: p.date,
            pickup_hours: p.hours,
            sort_order: i + 1
        }));

        const { error } = await supabase.from('packet_pickup_locations').insert(pickups);
        console.log(`${error ? '❌' : '✓'} ${race.name}: ${error ? error.message : `Added ${pickups.length} pickup locations`}`);
    }
}

async function addMissingPolicies() {
    console.log('\n========================================');
    console.log('ADDING MISSING POLICIES');
    console.log('========================================\n');

    const racesNeedingPolicies = ['Stub Stewart Trail Challenge', 'Battle to the Pacific'];

    for (const raceName of racesNeedingPolicies) {
        const race = await findRace(raceName);
        if (!race) {
            console.log(`⚠ ${raceName}: Not found`);
            continue;
        }

        // Check if policies exist
        const { data: existing } = await supabase
            .from('race_policies')
            .select('id')
            .eq('race_id', race.id);

        if (existing && existing.length > 0) {
            console.log(`ℹ ${race.name}: Already has ${existing.length} policies`);
            continue;
        }

        const policies = standardPolicies.map(p => ({
            race_id: race.id,
            ...p
        }));

        const { error } = await supabase.from('race_policies').insert(policies);
        console.log(`${error ? '❌' : '✓'} ${race.name}: ${error ? error.message : `Added ${policies.length} policies`}`);
    }
}

async function verifySummary() {
    console.log('\n========================================');
    console.log('FINAL VERIFICATION');
    console.log('========================================\n');

    const { data: races } = await supabase
        .from('races')
        .select('name, terrain, elevation, includes, parking, aid_stations');

    let hasTerrain = 0, hasElevation = 0, hasIncludes = 0, hasParking = 0, hasAidStations = 0;

    for (const race of races) {
        if (race.terrain) hasTerrain++;
        if (race.elevation) hasElevation++;
        if (race.includes && race.includes.length > 0) hasIncludes++;
        if (race.parking) hasParking++;
        if (race.aid_stations) hasAidStations++;
    }

    console.log(`Terrain: ${hasTerrain}/${races.length}`);
    console.log(`Elevation: ${hasElevation}/${races.length}`);
    console.log(`Includes: ${hasIncludes}/${races.length}`);
    console.log(`Parking: ${hasParking}/${races.length}`);
    console.log(`Aid Stations: ${hasAidStations}/${races.length}`);

    // Check pricing
    const { data: distances } = await supabase.from('race_distances').select('base_price');
    const withPrice = distances?.filter(d => d.base_price > 0).length || 0;
    console.log(`\nPricing: ${withPrice}/${distances?.length || 0} distances have prices`);

    // Check packet pickups
    const { count: pickupCount } = await supabase.from('packet_pickup_locations').select('*', { count: 'exact', head: true });
    console.log(`Packet Pickup Locations: ${pickupCount}`);
}

async function main() {
    console.log('Starting Race Data Import (Part 2)...');

    await updateRaceDetails();
    await addPacketPickups();
    await addMissingPolicies();
    await verifySummary();

    console.log('\n✅ Import Complete!');
}

main().catch(console.error);
