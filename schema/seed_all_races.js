/**
 * Complete Race Data Seed - All 21 Races
 * Run with: node schema/seed_all_races.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Standard policies for all WHY Racing events
const standardPolicies = [
    { policy_type: 'headphone_policy', policy_text: 'One ear-bud only, keep volume low so you can hear course marshal instructions.' },
    { policy_type: 'dog_policy', policy_text: 'Only Service Dogs allowed on course, must start at end of race.' },
    { policy_type: 'stroller_policy', policy_text: 'Allowed but must start at end of race after all other participants.' },
    { policy_type: 'bag_check', policy_text: 'Yes, label bag with name and bib number.' },
    { policy_type: 'refund_policy', policy_text: 'No refunds issued (no exceptions).' },
    { policy_type: 'deferral_policy', policy_text: '$20 fee, can defer up to 10 days before event to next year or another Why Racing Event.' },
    { policy_type: 'transfer_policy', policy_text: '$20 fee, can transfer to another participant up to 10 days before event.' }
];

// Standard age groups
const standardAgeGroups = ['9 and under', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39', '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70-74', '75-79', '80+'];

const races = [
    // =============================================
    // PREVIOUSLY MISSING RACES (6 of them)
    // =============================================

    // Resolution Run
    {
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
            venue_zip: '98629',
            course_description: 'You will start and finish at La Center High School - one loop for the 5K and a slightly different course for the 10K to really kick up the resolution challenge a notch.'
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
            { policy_type: 'post_race_meal', policy_text: 'All-you-can-eat pancake and sausage breakfast - $10 donation benefits La Center High School Volleyball program' }
        ],
        award_categories: [
            { category_type: 'overall', category_name: 'Top 3 Overall Male', awards_depth: 3, sort_order: 1 },
            { category_type: 'overall', category_name: 'Top 3 Overall Female', awards_depth: 3, sort_order: 2 }
        ],
        include_standard_policies: true,
        include_age_groups: true
    },

    // White River Snowshoe Race
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
            venue_notes: 'Between Government Camp and Mt Hood Meadows on Hwy 35. Organized by X-Dog Adventures.',
            course_description: 'The course is a scenic tour through the White River Canyon on Mt. Hood. The route will leave the sno-park and travel to the end of the canyon and return.'
        },
        distances: [
            { name: '4K Snowshoe', distance_value: 4, distance_unit: 'km', description: 'Single loop through upper White River canyon', sort_order: 1 },
            { name: '8K Snowshoe', distance_value: 8, distance_unit: 'km', description: '2 loops on the same course', sort_order: 2 }
        ],
        policies: [
            { policy_type: 'gear_requirements', policy_text: 'Snowshoes REQUIRED - Rentals available at REI, Otto\'s Ski Shop (Sandy), Mountain Shop, Next Adventure' },
            { policy_type: 'sno_park_pass', policy_text: 'Sno-Park pass required ($4) - Can be purchased at various locations including rental shops' }
        ]
    },

    // Silver Falls Trail Challenge
    {
        race: {
            name: 'Silver Falls Trail Challenge',
            race_date: '2026-02-28',
            race_time: '09:00:00',
            city: 'Sublimity',
            state: 'OR',
            venue: 'Silver Falls State Park - South Falls Day-Use Area',
            description: 'If you have never been to Silver Falls State Park, you are in for a treat. There just ARE NOT ENOUGH ADJECTIVES to describe the PNW brand of beauty and mystique that is personified by Silver Falls State Park. The chance to run behind and pass these picturesque falls is something you won\'t soon forget. Silver Falls is truly one of the most epic places in the PNW.',
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
            venue_notes: 'Race 1 of PNW State Park Trail Series. Organized by Bivouac Racing.',
            parking_instructions: '$10 per car parking fee - cash or card accepted'
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

    // Bigfoot Fun Run
    {
        race: {
            name: 'Bigfoot Fun Run',
            race_date: '2026-07-04',
            race_time: '09:00:00',
            city: 'Yacolt',
            state: 'WA',
            venue: 'Yacolt Recreation Park',
            description: 'Join us for this annual tradition! The Town of Yacolt proudly hosts the Bigfoot Fun Run as part of an entire weekend of racing and Yacolt\'s Rendezvous Days. The Bigfoot Fun Run features a 5K & 10K Run or Walk. The race weekend also includes the Hellz Bellz Ultra.',
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
            venue_zip: '98675',
            venue_notes: 'Part of Yacolt Rendezvous Days Festival'
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
            theme_description: 'Part of Yacolt Rendezvous Days Festival - a whole weekend of racing and community celebration!'
        },
        include_standard_policies: true,
        include_age_groups: true
    },

    // Hellz Bellz Ultra
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
            is_visible: true,
            logo_url: 'images/logos/Hellz Bellz.png'
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
            { policy_type: 'camping', policy_text: 'Tent space camping available at Yacolt Recreation Park. Opens 2:00 PM Saturday, July 4th. Included in registration.' },
            { policy_type: 'meals', policy_text: 'Sunday morning: Coffee/Hydration/Fruit/Quick Grab Breakfast. Post-event: BBQ (vegan option available)' }
        ]
    },

    // Santa's Holiday Hustle
    {
        race: {
            name: 'Santa\'s Holiday Hustle 5K & Dirty Santa Trail Run 10K',
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
        },
        policies: [
            { policy_type: 'swag_options', policy_text: 'Choose between T-Shirt, Santa Costume (full suit), or Hat & Gloves in registration' },
            { policy_type: 'post_race', policy_text: 'Cookies, cocoa, visit with Santa, and post-event happy hour included!' }
        ],
        include_standard_policies: true,
        include_age_groups: true
    },

    // =============================================
    // ORIGINAL 15 RACES CONTINUE BELOW
    // =============================================

    // 1. Couve Clover Run
    {
        race: {
            name: 'Couve Clover Run',
            race_date: '2026-03-22',
            race_time: '09:00:00',
            city: 'Vancouver',
            state: 'WA',
            venue: 'Vancouver Waterfront Park',
            description: 'Join us for the 11th Annual Couve Clover Run and celebrate in your festive green while running or walking 3, 7 or 10 miles along an extremely fast and scenic course to support local charities! We believe this is one of the prettiest courses in the Northwest!',
            race_type: 'run',
            registration_url: 'https://runsignup.com/Race/WA/Vancouver/CouveCloverRun',
            registration_open: true,
            is_visible: true,
            instructions_pdf_url: 'https://drive.google.com/file/d/1wcYOO2HilPownIRetXOVBS2Et4Zzb3-r/view'
        },
        content: {
            edition_number: 11,
            tagline: 'RUN, GIVE BACK & PARTY on Vancouver\'s Waterfront!',
            theme_type: 'holiday',
            venue_name: 'Vancouver Waterfront Park',
            venue_address: '695 Waterfront Way',
            venue_city: 'Vancouver',
            venue_state: 'WA',
            venue_zip: '98660'
        },
        distances: [
            { name: 'Lucky Leap 1 Mile', distance_value: 1, distance_unit: 'miles', sort_order: 1 },
            { name: '3 Mile', distance_value: 3, distance_unit: 'miles', sort_order: 2 },
            { name: 'Lucky 7 Mile', distance_value: 7, distance_unit: 'miles', sort_order: 3 },
            { name: '10 Mile', distance_value: 10, distance_unit: 'miles', sort_order: 4 }
        ],
        course_records: [
            { distance_name: '3 Mile', gender: 'male', record_holder_name: 'Robert McLauchlan', finish_time: '15:22', record_year: 2017 },
            { distance_name: '3 Mile', gender: 'female', record_holder_name: 'Francine Neilampa', finish_time: '18:25', record_year: 2016 },
            { distance_name: '7 Mile', gender: 'male', record_holder_name: 'Cooper Dollens', finish_time: '40:29', record_year: 2024 },
            { distance_name: '7 Mile', gender: 'female', record_holder_name: 'Allison Wrightson', finish_time: '46:33', record_year: 2017 },
            { distance_name: '10 Mile', gender: 'male', record_holder_name: 'Jason Griffiths', finish_time: '55:20', record_year: 2017 },
            { distance_name: '10 Mile', gender: 'female', record_holder_name: 'Alyssa Barrette', finish_time: '59:43', record_year: 2023 }
        ],
        packet_pickup: [
            { location_name: 'Foot Traffic Vancouver', address: '305 SE Chkalov Dr.', city: 'Vancouver', state: 'WA', zip: '98683', pickup_date: '2026-03-21', start_time: '10:00:00', end_time: '17:00:00', is_race_day: false, sort_order: 1 },
            { location_name: 'Expo area', address: '550 Waterfront Way', city: 'Vancouver', state: 'WA', zip: '98660', pickup_date: '2026-03-22', start_time: '07:00:00', end_time: '09:00:00', is_race_day: true, sort_order: 2 }
        ],
        beneficiaries: [
            { organization_name: 'Foundation for Vancouver Public Schools', description: 'Established in 1988 to support Vancouver Public Schools', is_primary: true, sort_order: 1 },
            { organization_name: 'Evergreen School District Foundation', description: 'Partners with community to bridge the basic needs gap', is_primary: false, sort_order: 2 },
            { organization_name: 'WHY COMMUNITY', description: 'Provides at-risk populations opportunity to cross the finish line', is_primary: false, sort_order: 3 }
        ],
        themed_content: {
            theme_name: 'St. Patrick\'s Day',
            costume_contest: true,
            costume_prize_description: 'Prize for Most Festive Costume so think GREEN!'
        },
        special_categories: [
            { category_name: 'Kids 12 and Under', pricing_rule: 'free', eligibility_description: '5K & 1-Miler are FREE', age_limit: 12, sort_order: 1 }
        ],
        award_categories: [
            { category_type: 'special', category_name: 'Clydesdale (220+ lbs)', sort_order: 100 },
            { category_type: 'special', category_name: 'Athena (165+ lbs)', sort_order: 101 }
        ],
        include_standard_policies: true,
        include_age_groups: true
    },
    // 2. Crown Stub 100
    {
        race: {
            name: 'Crown Stub 100',
            race_date: '2026-04-04',
            race_time: '14:00:00',
            city: 'Buxton',
            state: 'OR',
            venue: 'L.L. Stub Stewart State Park - Hilltop Day-Use Area',
            description: 'Welcome to Stub Stewart State Park - a gem of the Oregon State Park system! The race has over 10,000ft of gain as it traverses a combination of the Banks Vernonia State Trail, the Crown Zellerbach Trail, and roughly 10% on dirt trails within the park itself.',
            race_type: 'ultra',
            registration_url: 'https://ultrasignup.com/register.aspx?did=131747',
            registration_open: true,
            is_visible: true
        },
        content: {
            tagline: 'Premier 100-mile ultramarathon in the Pacific Northwest!',
            theme_type: 'ultra',
            venue_name: 'L.L. Stub Stewart State Park',
            venue_notes: '32-hour cutoff. Must finish by 10:00 PM Sunday. Organized by Bivouac Racing.'
        },
        distances: [
            { name: 'Crown Stub 100', distance_value: 100, distance_unit: 'miles', description: 'Double out-and-back traversing Banks Vernonia Trail, Crown Zellerbach Trail, and park dirt trails. 10,000+ ft elevation gain.', sort_order: 1 },
            { name: 'Royal Ultra Relay', distance_value: 100, distance_unit: 'miles', description: 'NEW in 2026 - Team relay option', sort_order: 2 }
        ],
        policies: [
            { policy_type: 'cutoff_times', policy_text: 'Stewarts Gate AS8: 1:00 PM Sunday. Finish line: 10:00 PM Sunday (8:00 PM finish line closes).' }
        ],
        amenities: [
            { amenity_type: 'aid_station', location_description: 'Stewarts Gate - Full Service', notes: 'Burgers, Grilled Cheese, Quesadilla. Skratch Labs hydration.' },
            { amenity_type: 'aid_station', location_description: 'Vernonia - Full Service', notes: 'Full food service available' }
        ]
    },
    // 3. Stub Stewart Trail Challenge
    {
        race: {
            name: 'Stub Stewart Trail Challenge',
            race_date: '2026-04-05',
            race_time: '09:00:00',
            city: 'Buxton',
            state: 'OR',
            venue: 'L.L. Stub Stewart State Park - Hilltop Day-Use Area',
            description: 'The race course is a challenging but fun 6.5 mile loop blending Banks-Vernonia Trail pavement with unpaved roads, offering rolling hills and occasional climbs.',
            race_type: 'trail',
            registration_url: 'https://ultrasignup.com/register.aspx?did=131748',
            registration_open: true,
            is_visible: true,
            logo_url: 'images/logos/Stub Stewart Challenge.png'
        },
        content: {
            tagline: 'Fast and fun loops through Oregon\'s state park gem!',
            theme_type: 'trail',
            venue_name: 'L.L. Stub Stewart State Park',
            venue_notes: 'Race 2 of PNW State Park Trail Series. Organized by Bivouac Racing.'
        },
        distances: [
            { name: '1/4 Marathon', distance_value: 6.55, distance_unit: 'miles', description: '1 loop', sort_order: 1 },
            { name: '1/2 Marathon', distance_value: 13.1, distance_unit: 'miles', description: '2 loops', sort_order: 2 },
            { name: '3/4 Marathon', distance_value: 19.65, distance_unit: 'miles', description: '3 loops', sort_order: 3 },
            { name: 'Marathon', distance_value: 26.2, distance_unit: 'miles', description: '4 loops', sort_order: 4 }
        ]
    },
    // 4. Spring Classic Duathlon
    {
        race: {
            name: 'Spring Classic Duathlon, Half Marathon, 10K & 5K',
            race_date: '2026-04-26',
            race_time: '07:45:00',
            city: 'Vancouver',
            state: 'WA',
            venue: 'Vancouver Lake Regional Park',
            description: 'Dust off the cob-webs and start the multi-sport racing season with the 41st Annual Spring Classic! It\'s time to see who stayed in shape all winter! Flat & fast course perfect for those new to the sport.',
            race_type: 'triathlon',
            registration_url: 'https://www.trisignup.com/Race/WA/Vancouver/SpringClassicDuathlon',
            registration_open: true,
            is_visible: true
        },
        content: {
            edition_number: 41,
            tagline: 'RUN, WALK & WHEN ONE SPORT IS NOT ENOUGH, JUST DU IT!',
            theme_type: 'multi-sport',
            venue_name: 'Vancouver Lake Regional Park',
            venue_address: '6801 NW Lower River Rd',
            venue_city: 'Vancouver',
            venue_state: 'WA',
            venue_zip: '98660'
        },
        distances: [
            { name: '5K', distance_value: 5, distance_unit: 'km', sort_order: 1 },
            { name: '10K', distance_value: 10, distance_unit: 'km', sort_order: 2 },
            { name: 'Half Marathon', distance_value: 13.1, distance_unit: 'miles', start_time: '07:45:00', sort_order: 3 },
            { name: 'Sprint Duathlon', distance_value: 23, distance_unit: 'km', description: '5K Run - 13 Mile Bike - 5K Run', start_time: '11:00:00', sort_order: 4 }
        ],
        course_records: [
            { distance_name: '5K', gender: 'male', record_holder_name: 'Dylan Irey', finish_time: '16:48', record_year: 2023 },
            { distance_name: '5K', gender: 'female', record_holder_name: 'Mary Stevens', finish_time: '19:40', record_year: 2021 },
            { distance_name: 'Half Marathon', gender: 'male', record_holder_name: 'Tanner Barlow', finish_time: '1:19:16', record_year: 2018 },
            { distance_name: 'Half Marathon', gender: 'female', record_holder_name: 'Heather Holt', finish_time: '1:23:10', record_year: 2024 },
            { distance_name: 'Sprint Duathlon', gender: 'male', record_holder_name: 'Evan Price', finish_time: '1:06:36', record_year: 2022 },
            { distance_name: 'Sprint Duathlon', gender: 'female', record_holder_name: 'Camila Rutford', finish_time: '1:19:20', record_year: 2024 }
        ],
        packet_pickup: [
            { location_name: 'Foot Traffic Vancouver', address: '305 SE Chkalov Dr #122', city: 'Vancouver', state: 'WA', zip: '98683', pickup_date: '2026-04-25', start_time: '10:00:00', end_time: '15:00:00', is_race_day: false, sort_order: 1 },
            { location_name: 'Vancouver Lake Regional Park', city: 'Vancouver', state: 'WA', pickup_date: '2026-04-26', start_time: '06:30:00', end_time: '10:45:00', is_race_day: true, sort_order: 2 }
        ],
        beneficiaries: [
            { organization_name: 'Ainsley\'s Angels of America', description: 'Ensures everyone can experience endurance events and builds awareness about America\'s special needs community', is_primary: true, sort_order: 1 }
        ],
        multisport_details: {
            usat_sanctioned: true,
            drafting_allowed: false,
            bike_mechanic_onsite: true
        },
        include_standard_policies: true,
        include_age_groups: true
    },
    // 5. Reflection Run
    {
        race: {
            name: 'Reflection Run',
            race_date: '2026-05-17',
            race_time: '09:00:00',
            city: 'Washougal',
            state: 'WA',
            venue: 'Bi-Mart Parking Lot',
            description: 'The 11th Annual Reflection Run will honor the brave men and women who have or are currently serving in our Armed Forces. Veterans and those actively serving race Reflection Run for FREE.',
            race_type: 'run',
            registration_url: 'https://runsignup.com/Race/WA/Washougal/ReflectionRun',
            registration_open: true,
            is_visible: true
        },
        content: {
            edition_number: 11,
            tagline: 'Honor the brave men and women who have served',
            theme_type: 'memorial',
            venue_name: 'Bi-Mart Parking Lot',
            venue_address: '3003 Addy St.',
            venue_city: 'Washougal',
            venue_state: 'WA'
        },
        distances: [
            { name: '5K', distance_value: 5, distance_unit: 'km', start_time: '09:00:00', sort_order: 1 },
            { name: '10K', distance_value: 10, distance_unit: 'km', start_time: '09:00:00', sort_order: 2 },
            { name: 'Half Marathon', distance_value: 13.1, distance_unit: 'miles', start_time: '08:45:00', sort_order: 3 },
            { name: '12 Mile Ruck Challenge', distance_value: 12, distance_unit: 'miles', start_time: '08:45:00', description: '35 lb pack or 40 lb vest required', sort_order: 4 }
        ],
        course_records: [
            { distance_name: '5K', gender: 'male', record_holder_name: 'Sam Soto', finish_time: '17:14', record_year: 2021 },
            { distance_name: '5K', gender: 'female', record_holder_name: 'Lara Rix', finish_time: '18:00', record_year: 2016 },
            { distance_name: 'Half Marathon', gender: 'male', record_holder_name: 'Kyle Kenny', finish_time: '1:17:00', record_year: 2021 },
            { distance_name: 'Half Marathon', gender: 'female', record_holder_name: 'Haley Fisher', finish_time: '1:30:20', record_year: 2021 }
        ],
        beneficiaries: [
            { organization_name: 'Northwest Battle Buddies', description: 'Empowering combat veterans with PTSD by partnering them with professionally trained service dogs at no charge', is_primary: true, sort_order: 1 }
        ],
        special_categories: [
            { category_name: 'Veterans/Active Military', pricing_rule: 'free', eligibility_description: 'Email registration@whyracingevents.com with Military service details for comp code', sort_order: 1 },
            { category_name: 'Kids 12 and Under', pricing_rule: 'free', eligibility_description: '5K FREE with adult registration', age_limit: 12, sort_order: 2 }
        ],
        themed_content: {
            theme_name: 'Military/Memorial Day',
            is_memorial_event: true,
            theme_description: 'Routes lined with local Hero Posters of those who have given the ultimate sacrifice. Always scheduled Sunday before Memorial Day weekend.'
        },
        include_standard_policies: true,
        include_age_groups: true
    },
    // 6. PDX Triathlon Festival
    {
        race: {
            name: 'PDX Triathlon Festival',
            race_date: '2026-05-31',
            race_time: '07:00:00',
            city: 'Fairview',
            state: 'OR',
            venue: 'Blue Lake Regional Park',
            description: 'Join us for the 43rd Annual PDX Triathlon Festival at Blue Lake Regional Park! Recognized by NW triathletes as the \'must do\' event to open the triathlon season. Bike courses are flat and fast on Marine Dr closed to traffic.',
            race_type: 'triathlon',
            registration_url: 'https://www.trisignup.com/Race/OR/Fairview/PDXTriathlonFestival',
            registration_open: true,
            is_visible: true
        },
        content: {
            edition_number: 43,
            tagline: 'The must do event to open the triathlon season',
            theme_type: 'festival',
            venue_name: 'Blue Lake Regional Park',
            venue_address: '21224 NE Blue Lake Rd',
            venue_city: 'Fairview',
            venue_state: 'OR',
            venue_zip: '97024',
            venue_notes: 'NO PETS ALLOWED IN THE PARK - Metro park rule'
        },
        distances: [
            { name: '5K', distance_value: 5, distance_unit: 'km', sort_order: 1 },
            { name: 'Super Sprint Triathlon', distance_value: 10, distance_unit: 'km', sort_order: 2 },
            { name: 'Sprint Triathlon', distance_value: 20, distance_unit: 'km', sort_order: 3 },
            { name: 'Olympic Triathlon', distance_value: 51.5, distance_unit: 'km', sort_order: 4 },
            { name: 'Sprint Duathlon', distance_value: 20, distance_unit: 'km', sort_order: 5 },
            { name: 'Olympic Duathlon', distance_value: 51.5, distance_unit: 'km', sort_order: 6 },
            { name: 'Paddle Triathlon', distance_value: 20, distance_unit: 'km', description: 'Kayak/paddleboard instead of swim', sort_order: 7 }
        ],
        packet_pickup: [
            { location_name: 'Blue Lake Regional Park', city: 'Fairview', state: 'OR', pickup_date: '2026-05-30', start_time: '11:00:00', end_time: '17:00:00', is_race_day: false, sort_order: 1 },
            { location_name: 'Blue Lake Regional Park', city: 'Fairview', state: 'OR', pickup_date: '2026-05-31', start_time: '06:00:00', end_time: '09:00:00', is_race_day: true, sort_order: 2 }
        ],
        multisport_details: {
            usat_sanctioned: true,
            water_temperature_typical: 'Mid 60s',
            wetsuit_policy: 'Optional',
            has_paddle_option: true
        },
        include_standard_policies: true,
        include_age_groups: true
    },
    // 7. Hagg Lake Triathlon & Trail Festival
    {
        race: {
            name: 'Hagg Lake Triathlon & Trail Festival',
            race_date: '2026-06-20',
            race_time: '08:00:00',
            city: 'Gaston',
            state: 'OR',
            venue: 'Henry Hagg Lake / Scoggins Valley Park',
            description: 'Come race at the 45th Annual Hagg Lake Triathlon & Trail Festival! Now offering Off-Road Triathlon (USAT Cross Triathlon Nationals), Paddle Triathlon, Trail Half Marathon, and Trail 5K. One of the most scenic venues in the country with rolling hills on both bike and run.',
            race_type: 'triathlon',
            registration_url: 'https://www.trisignup.com/Race/OR/Gaston/HAGGLakeTriathlonMultiSportsFestival',
            registration_open: true,
            is_visible: true,
            logo_url: 'images/logos/Hagg Lake.png'
        },
        content: {
            edition_number: 45,
            tagline: 'One of the oldest and most gorgeous triathlon courses in the nation!',
            theme_type: 'festival',
            venue_name: 'Henry Hagg Lake / Scoggins Valley Park',
            venue_address: '50250 SW Scoggins Valley Road',
            venue_city: 'Gaston',
            venue_state: 'OR',
            parking_instructions: '$7 parking fee (included in registration). Annual pass holders don\'t need to purchase.'
        },
        distances: [
            { name: 'Sprint Triathlon', distance_value: 27.75, distance_unit: 'km', description: '750m Swim, 22 Mile Bike, 5K Run', sort_order: 1 },
            { name: 'Olympic Triathlon', distance_value: 51.5, distance_unit: 'km', description: '1500m Swim, 32 Mile Bike, 10K Run', sort_order: 2 },
            { name: 'Off-Road Triathlon', distance_value: 22.5, distance_unit: 'km', description: '750m Swim, 14 Mile Bike, 5K Run - USAT Cross Triathlon Nationals', sort_order: 3 },
            { name: 'Sprint Duathlon', distance_value: 27.75, distance_unit: 'km', sort_order: 4 },
            { name: 'Olympic Duathlon', distance_value: 51.5, distance_unit: 'km', sort_order: 5 },
            { name: 'Sprint Aquabike', distance_value: 27.75, distance_unit: 'km', sort_order: 6 },
            { name: 'Olympic Aquabike', distance_value: 51.5, distance_unit: 'km', sort_order: 7 },
            { name: 'Paddle Triathlon', distance_value: 22.5, distance_unit: 'km', sort_order: 8 },
            { name: 'Trail Half Marathon', distance_value: 13.1, distance_unit: 'miles', sort_order: 9 },
            { name: 'Trail 5K', distance_value: 5, distance_unit: 'km', sort_order: 10 }
        ],
        multisport_details: {
            usat_sanctioned: true,
            has_paddle_option: true,
            relay_rules: 'Relay teams available for triathlon events'
        },
        policies: [
            { policy_type: 'camping', policy_text: 'Tent camping only (NO vehicle camping). Friday/Saturday nights. $15 one night, $25 two nights.' },
            { policy_type: 'beast_medal', policy_text: 'Race on Saturday AND Sunday to earn the coveted WHY Racing BEAST MEDAL' }
        ],
        include_standard_policies: true,
        include_age_groups: true
    },
    // 8. Columbia River Triathlon
    {
        race: {
            name: 'Columbia River Triathlon & Endurance Sports Festival',
            race_date: '2026-08-07',
            race_time: '08:00:00',
            city: 'Vancouver',
            state: 'WA',
            venue: 'Frenchman\'s Bar Park',
            description: 'This summer weekend festival at a beautiful venue along the Columbia River offers something for everyone! One of the most scenic areas with views of Columbia River, Mt. Hood, Mt. St. Helens and Vancouver Lake.',
            race_type: 'triathlon',
            registration_url: 'https://www.trisignup.com/Race/WA/Vancouver/ColumbiaRiverTriathlon',
            registration_open: true,
            is_visible: true
        },
        content: {
            edition_number: 18,
            tagline: 'YES, YOU CAN CROSS THE FINISH LINE!',
            theme_type: 'festival',
            venue_name: 'Frenchman\'s Bar Park',
            venue_address: '9612 NW Lower River Road',
            venue_city: 'Vancouver',
            venue_state: 'WA',
            venue_zip: '98660'
        },
        distances: [
            { name: 'Kids Triathlon', distance_value: 1, distance_unit: 'miles', description: 'Friday 5:00 PM', sort_order: 1 },
            { name: 'Sunset 5K', distance_value: 5, distance_unit: 'km', description: 'Friday 7:00 PM', sort_order: 2 },
            { name: 'Sunset 10K', distance_value: 10, distance_unit: 'km', description: 'Friday 7:00 PM', sort_order: 3 },
            { name: 'Sprint Triathlon', distance_value: 20, distance_unit: 'km', description: '1/2 mile Swim, 12 mile Bike, 5K Run', sort_order: 4 },
            { name: 'Olympic Triathlon', distance_value: 51.5, distance_unit: 'km', description: '1500m Swim, 22.8 mile Bike, 10K Run', sort_order: 5 },
            { name: 'Girlfriends Sprint Tri', distance_value: 20, distance_unit: 'km', description: 'Sunday - Women Only', sort_order: 6 }
        ],
        course_records: [
            { distance_name: 'Sprint Triathlon', gender: 'male', record_holder_name: 'Benjamin Snodgrass', finish_time: '54:27', record_year: 2019 },
            { distance_name: 'Sprint Triathlon', gender: 'female', record_holder_name: 'Jessie Rubin', finish_time: '1:05:19', record_year: 2017 },
            { distance_name: 'Olympic Triathlon', gender: 'male', record_holder_name: 'Scott Ludford', finish_time: '1:53:34', record_year: 2024 }
        ],
        policies: [
            { policy_type: 'kids_tri', policy_text: 'Ages 6 and under, 7-10, 11-15. MANDATORY swim assistance - parent/guardian must walk along shore. Training wheels allowed.' },
            { policy_type: 'beast_medal', policy_text: 'Complete 2 events over weekend for special BEAST Medal. Gals who complete Friday, Saturday & Sunday earn 3-Headed BEAST Medal.' }
        ],
        include_standard_policies: true,
        include_age_groups: true
    },
    // 9. Girlfriends Triathlon
    {
        race: {
            name: 'Girlfriends All-Women\'s Triathlon & Fitness Festival',
            race_date: '2026-08-09',
            race_time: '09:00:00',
            city: 'Vancouver',
            state: 'WA',
            venue: 'Frenchman\'s Bar Park',
            description: 'The 30th Annual Girlfriends All-Women\'s Triathlon & Fitness Festival offers something for everyone - Sprint Triathlon, Duathlon & AquaBike, Relay teams and 5km run. Cross the finish line with your BFFs!',
            race_type: 'triathlon',
            registration_url: 'https://www.trisignup.com/Race/WA/Vancouver/GirlfriendsTri',
            registration_open: true,
            is_visible: true
        },
        content: {
            edition_number: 30,
            tagline: 'Rally your girlfriends for a fun, active girls-day-out!',
            theme_type: 'women-only',
            venue_name: 'Frenchman\'s Bar Park',
            venue_address: '9612 NW Lower River Road',
            venue_city: 'Vancouver',
            venue_state: 'WA',
            venue_notes: 'Part of Columbia River Triathlon Weekend'
        },
        distances: [
            { name: 'Sprint Triathlon', distance_value: 20, distance_unit: 'km', sort_order: 1 },
            { name: 'Sprint Duathlon', distance_value: 20, distance_unit: 'km', sort_order: 2 },
            { name: 'Sprint Aquabike', distance_value: 15, distance_unit: 'km', sort_order: 3 },
            { name: '5K Run', distance_value: 5, distance_unit: 'km', sort_order: 4 },
            { name: 'Relay Teams', distance_value: 20, distance_unit: 'km', sort_order: 5 }
        ],
        include_standard_policies: true,
        include_age_groups: true
    },
    // 10. AppleTree Marathon
    {
        race: {
            name: 'PeaceHealth AppleTree Marathon, Half Marathon & 5K',
            race_date: '2026-08-30',
            race_time: '06:00:00',
            city: 'Vancouver',
            state: 'WA',
            venue: 'Officers Row',
            description: 'This \'Run Through History\' will take you on a flat, fast and scenic Boston-Qualifying course through Fort Vancouver and many historical vantage points. The miles will fly by!',
            race_type: 'run',
            registration_url: 'https://runsignup.com/Race/WA/Vancouver/PeacehealthAppletreeMarathon',
            registration_open: true,
            is_visible: true
        },
        content: {
            edition_number: 9,
            tagline: 'A Run Through History!',
            theme_type: 'historic',
            venue_name: 'Officers Row',
            venue_address: '1101 Officers Row',
            venue_city: 'Vancouver',
            venue_state: 'WA',
            venue_zip: '98661',
            course_description: 'Fort Vancouver, Officer\'s Row, Army Barracks, Pearson Airport (oldest operating airport in USA), Historical Old Apple Tree, Columbia River'
        },
        distances: [
            { name: 'Boston-Qualifying Marathon', distance_value: 26.2, distance_unit: 'miles', start_time: '06:00:00', description: 'Boston Qualifying certified course', sort_order: 1 },
            { name: 'First Responder\'s Relay Marathon', distance_value: 26.2, distance_unit: 'miles', start_time: '06:00:00', description: '2-9 person teams', sort_order: 2 },
            { name: 'Half Marathon', distance_value: 13.1, distance_unit: 'miles', start_time: '06:00:00', sort_order: 3 },
            { name: 'Sunset 5K', distance_value: 5, distance_unit: 'km', start_time: '18:00:00', description: 'Saturday evening', sort_order: 4 }
        ],
        packet_pickup: [
            { location_name: 'Foot Traffic Vancouver', address: '305 SE Chkalov Dr.', city: 'Vancouver', state: 'WA', zip: '98683', pickup_date: '2026-08-28', start_time: '10:00:00', end_time: '17:00:00', is_race_day: false, sort_order: 1 },
            { location_name: 'Officers Row', address: '1101 Officers Row', city: 'Vancouver', state: 'WA', pickup_date: '2026-08-29', start_time: '14:00:00', end_time: '19:00:00', is_race_day: false, sort_order: 2 },
            { location_name: 'Officers Row', address: '1101 Officers Row', city: 'Vancouver', state: 'WA', pickup_date: '2026-08-30', start_time: '06:00:00', end_time: '08:00:00', is_race_day: true, sort_order: 3 }
        ],
        beneficiaries: [
            { organization_name: 'Friends of Fort Vancouver National Historic Site', description: '$1 from each registration supports the national park', is_primary: true, sort_order: 1 }
        ],
        policies: [
            { policy_type: 'beast_medal', policy_text: 'Race both Saturday and Sunday for BEAST medal' }
        ],
        include_standard_policies: true,
        include_age_groups: true
    },
    // 11. Pacific Coast Running Festival
    {
        race: {
            name: 'Pacific Coast Running Festival',
            race_date: '2026-09-26',
            race_time: '07:00:00',
            city: 'Long Beach',
            state: 'WA',
            venue: 'Long Beach Arch',
            description: 'The Pacific Coast Running Festival has something for the whole family including Sand Marathon, Half Marathon, 5K, 10K, Kids Dashes, and Tour de Pacific Bike! THE ULTIMATE RACE-CATION!',
            race_type: 'run',
            registration_url: 'https://runsignup.com/Race/WA/LongBeach/PacificCoastRunningFestival',
            registration_open: true,
            is_visible: true
        },
        content: {
            edition_number: 6,
            tagline: 'THE ULTIMATE RACE-CATION!',
            theme_type: 'festival',
            venue_name: 'Long Beach Arch',
            venue_city: 'Long Beach',
            venue_state: 'WA',
            venue_notes: 'Long Beach Peninsula'
        },
        distances: [
            { name: 'Sand Marathon', distance_value: 26.2, distance_unit: 'miles', start_time: '08:00:00', description: 'Saturday - Beach running!', sort_order: 1 },
            { name: 'Sunset Sand 5K', distance_value: 5, distance_unit: 'km', start_time: '18:00:00', description: 'Saturday evening on beach', sort_order: 2 },
            { name: 'Half Marathon', distance_value: 13.1, distance_unit: 'miles', start_time: '07:00:00', description: 'Sunday', sort_order: 3 },
            { name: '10K', distance_value: 10, distance_unit: 'km', start_time: '08:30:00', description: 'Sunday', sort_order: 4 },
            { name: '5K', distance_value: 5, distance_unit: 'km', start_time: '08:30:00', description: 'Sunday', sort_order: 5 },
            { name: 'Tour de Pacific Bike', distance_value: 12.6, distance_unit: 'miles', description: 'Bike tour option', sort_order: 6 },
            { name: 'Kids 1 Mile Dash', distance_value: 1, distance_unit: 'miles', start_time: '08:00:00', description: 'Sunday', sort_order: 7 },
            { name: 'Kids 1/2 Mile Dash', distance_value: 0.5, distance_unit: 'miles', start_time: '08:00:00', description: 'Sunday', sort_order: 8 }
        ],
        course_records: [
            { distance_name: 'Half Marathon', gender: 'male', record_holder_name: 'Dawson Andrews', finish_time: '1:12:30', record_year: 2024 },
            { distance_name: 'Half Marathon', gender: 'female', record_holder_name: 'Sara Russell', finish_time: '1:33:37', record_year: 2022 },
            { distance_name: 'Sand Marathon', gender: 'male', record_holder_name: 'Isaac Lopez', finish_time: '3:34:01', record_year: 2024 }
        ],
        beneficiaries: [
            { organization_name: 'South Pacific County Humane Society', description: 'Promotes compassionate care, spay/neuter and placement of cats and dogs', is_primary: true, sort_order: 1 }
        ],
        policies: [
            { policy_type: 'beast_medal', policy_text: 'Do 2+ events over weekend for special BEAST medal' }
        ],
        include_standard_policies: true,
        include_age_groups: true
    },
    // 12. Girlfriends Run
    {
        race: {
            name: 'Girlfriends Run',
            race_date: '2026-10-18',
            race_time: '09:00:00',
            city: 'Vancouver',
            state: 'WA',
            venue: 'Vancouver Waterfront Park',
            description: 'The 20th Annual Girlfriends Run offers a Half Marathon, 10K & 6K designed specifically for women. About half run, half walk - it doesn\'t matter how you get to the finish line, as long as you get there!',
            race_type: 'run',
            registration_url: 'https://runsignup.com/Race/WA/Vancouver/GirlfriendsRun',
            registration_open: true,
            is_visible: true
        },
        content: {
            edition_number: 20,
            tagline: 'RUN, GIVE BACK & CELEBRATE THE AMAZING WOMEN IN YOUR LIFE!',
            theme_type: 'women-only',
            venue_name: 'Vancouver Waterfront Park',
            venue_city: 'Vancouver',
            venue_state: 'WA',
            venue_notes: 'Started to honor Joleen Skarberg, diagnosed with Breast Cancer. She runs every year wearing #1!'
        },
        distances: [
            { name: 'Half Marathon', distance_value: 13.1, distance_unit: 'miles', sort_order: 1 },
            { name: '10K', distance_value: 10, distance_unit: 'km', sort_order: 2 },
            { name: '6K', distance_value: 6, distance_unit: 'km', sort_order: 3 }
        ],
        beneficiaries: [
            { organization_name: 'Pink Lemonade Project', description: 'Brings essential services to those currently fighting breast cancer', is_primary: true, sort_order: 1 }
        ],
        themed_content: {
            theme_name: 'Breast Cancer Awareness',
            theme_description: 'Event perks: Mimosas, pastries, soup, Pampering Stations, Women\'s running shirt, Firemen waiting at finish line! Pink Brigade Guys: 50 guys who raise $500+ get complimentary registration. Glam Gals: 50 gals who raise $500+ for Pink Lemonade Project.'
        },
        award_categories: [
            { category_type: 'special', category_name: 'Athena (165+ lbs)', sort_order: 100 }
        ],
        include_standard_policies: true,
        include_age_groups: true
    },
    // 13. Scary Run
    {
        race: {
            name: 'Scary Run',
            race_date: '2026-10-25',
            race_time: '09:00:00',
            city: 'Washougal',
            state: 'WA',
            venue: 'Bi-Mart Parking Lot',
            description: 'Join us for the 10th Annual Scary Run - a wickedly fun Halloween tradition in Washougal! Put on your favorite costume and get ready to be spooked through the Spooky Forest on every lap!',
            race_type: 'run',
            registration_url: 'https://runsignup.com/Race/WA/Washougal/ScaryRun',
            registration_open: true,
            is_visible: true
        },
        content: {
            edition_number: 10,
            tagline: 'RUN FOR YOUR LIFE... AND LAUGHS!',
            theme_type: 'holiday',
            venue_name: 'Bi-Mart Parking Lot',
            venue_address: '3003 Addy St.',
            venue_city: 'Washougal',
            venue_state: 'WA',
            course_description: 'Single-loop 5K course in Captain William Clark Park. Run once for 5K, twice for 10K, three times for 15K.'
        },
        distances: [
            { name: '5K', distance_value: 5, distance_unit: 'km', start_time: '09:00:00', description: '1 loop', sort_order: 1 },
            { name: '10K', distance_value: 10, distance_unit: 'km', start_time: '09:00:00', description: '2 loops', sort_order: 2 },
            { name: '15K', distance_value: 15, distance_unit: 'km', start_time: '08:45:00', description: '3 loops', sort_order: 3 }
        ],
        course_records: [
            { distance_name: '5K', gender: 'male', record_holder_name: 'Kael Steiner Bailey', finish_time: '17:46', record_year: 2019 },
            { distance_name: '15K', gender: 'female', record_holder_name: 'Sheli Morrell', finish_time: '1:03:52', record_year: 2024 }
        ],
        themed_content: {
            theme_name: 'Halloween',
            costume_contest: true,
            theme_description: 'Spooky Forest on every lap with monsters, zombies, and costumed creepers!'
        },
        special_categories: [
            { category_name: 'Kids 12 and Under', pricing_rule: 'free', age_limit: 12, sort_order: 1 },
            { category_name: 'Kids 13-17', pricing_rule: 'discounted', discount_percentage: 50, age_limit: 17, sort_order: 2 }
        ],
        include_standard_policies: true,
        include_age_groups: true
    },
    // 14. Battle to the Pacific
    {
        race: {
            name: 'Battle to the Pacific',
            race_date: '2026-11-15',
            race_time: '09:00:00',
            city: 'Hammond',
            state: 'OR',
            venue: 'Fort Stevens State Park - N. Coffenbury Lake Day-Use Area',
            description: 'The 4th and final event in Bivouac Racing\'s Oregon State Parks Trail Series. Run through historic military grounds and scenic trails near the mouth of the Columbia River on the beautiful Oregon coast!',
            race_type: 'trail',
            registration_url: 'https://ultrasignup.com/register.aspx?did=128806',
            registration_open: true,
            is_visible: true
        },
        content: {
            tagline: 'Coastal trail running at Oregon\'s historic Fort Stevens!',
            theme_type: 'trail',
            venue_name: 'Fort Stevens State Park',
            venue_notes: 'Race 4 of PNW State Park Trail Series. Organized by Bivouac Racing. $5 daily park permit for parking. B.Y.O.D.V (Bring Your Own Drinking Vessel) - 2 aid stations on course.',
            course_description: 'Utilizes hiking and biking trails within Fort Stevens State Park. Mostly flat on asphalt paved trails, with last couple miles around Coffenbury Lake on gently rolling, light-technical trails. Passes historic Battery Russell.'
        },
        distances: [
            { name: '1/2 Marathon', distance_value: 13.1, distance_unit: 'miles', start_time: '09:15:00', description: '3 loops: outer, inner, and lake loop', sort_order: 1 },
            { name: '1/4 Marathon', distance_value: 6.55, distance_unit: 'miles', start_time: '09:15:00', sort_order: 2 },
            { name: '5K', distance_value: 5, distance_unit: 'km', start_time: '09:30:00', sort_order: 3 },
            { name: '12 Mile Ruck Challenge', distance_value: 12, distance_unit: 'miles', start_time: '09:00:00', sort_order: 4 }
        ]
    },
    // 15. Pacific Crest Endurance 
    {
        race: {
            name: 'Pacific Crest Endurance Sports Festival',
            race_date: '2027-06-15',
            race_time: '07:00:00',
            city: 'Bend',
            state: 'OR',
            venue: 'Riverbend Park',
            description: 'The 30th Annual Pacific Crest Endurance Sports Festival has something for everyone! Known as the jewel of multisport events in the Northwest, a traditional destination race for athletes from across the nation and globe.',
            race_type: 'triathlon',
            registration_url: null,
            registration_open: false,
            is_visible: true
        },
        content: {
            edition_number: 30,
            tagline: 'THE ULTIMATE RACE-CATION! Jewel of multisport events in the Northwest',
            theme_type: 'festival',
            venue_name: 'Riverbend Park',
            venue_address: '799 SW Columbia St',
            venue_city: 'Bend',
            venue_state: 'OR',
            venue_zip: '97702',
            nearest_airport: 'Portland (PDX) or Bend/Redmond Airport',
            airport_distance: 'PDX: 3 hours, Bend/Redmond: 15-20 minutes'
        },
        distances: [
            { name: 'Beastman Triathlon', distance_value: 113, distance_unit: 'km', description: '800m Swim, 58.70 Mile Bike, 13.1 Mile Run', sort_order: 1 },
            { name: 'Olympic Triathlon', distance_value: 51.5, distance_unit: 'km', sort_order: 2 },
            { name: 'Sprint Triathlon', distance_value: 25, distance_unit: 'km', sort_order: 3 },
            { name: 'Marathon', distance_value: 26.2, distance_unit: 'miles', sort_order: 4 },
            { name: 'Half Marathon', distance_value: 13.1, distance_unit: 'miles', sort_order: 5 },
            { name: '10K', distance_value: 10, distance_unit: 'km', sort_order: 6 },
            { name: '5K', distance_value: 5, distance_unit: 'km', sort_order: 7 },
            { name: 'Kids Splash Pedal n\' Dash', distance_value: 1, distance_unit: 'km', sort_order: 8 }
        ],
        policies: [
            { policy_type: 'prize_purse', policy_text: 'Beastman Triathlon: 1st place $1000, 2nd place $500, 3rd place $250' },
            { policy_type: 'beast_medal', policy_text: 'Complete events on both days for special BEAST Medal' }
        ]
    }
];

async function seedAllRaces() {
    console.log('🏃 Starting comprehensive race seed...\n');
    console.log(`Processing ${races.length} races...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const raceData of races) {
        console.log(`\n📍 Processing: ${raceData.race.name}`);

        try {
            // Check if race already exists
            const { data: existing } = await supabase
                .from('races')
                .select('id')
                .eq('name', raceData.race.name)
                .maybeSingle();

            let raceId;

            if (existing) {
                // Update existing race
                const { data: updated, error: updateError } = await supabase
                    .from('races')
                    .update(raceData.race)
                    .eq('id', existing.id)
                    .select()
                    .single();

                if (updateError) throw updateError;
                raceId = existing.id;
                console.log(`  ✅ Updated race: ${raceId}`);
            } else {
                // Insert new race
                const { data: race, error: raceError } = await supabase
                    .from('races')
                    .insert(raceData.race)
                    .select()
                    .single();

                if (raceError) throw raceError;
                raceId = race.id;
                console.log(`  ✅ Created race: ${raceId}`);
            }

            // Clear existing related data for this race
            await Promise.all([
                supabase.from('race_content').delete().eq('race_id', raceId),
                supabase.from('race_distances').delete().eq('race_id', raceId),
                supabase.from('race_beneficiaries').delete().eq('race_id', raceId),
                supabase.from('race_policies').delete().eq('race_id', raceId),
                supabase.from('packet_pickup_locations').delete().eq('race_id', raceId),
                supabase.from('course_records').delete().eq('race_id', raceId),
                supabase.from('award_categories').delete().eq('race_id', raceId),
                supabase.from('special_participant_categories').delete().eq('race_id', raceId),
                supabase.from('themed_event_content').delete().eq('race_id', raceId),
                supabase.from('multisport_details').delete().eq('race_id', raceId),
                supabase.from('course_amenities').delete().eq('race_id', raceId)
            ]);

            // Insert content
            if (raceData.content) {
                await supabase.from('race_content').insert({ ...raceData.content, race_id: raceId });
                console.log(`  ✅ Content added`);
            }

            // Insert distances
            if (raceData.distances?.length) {
                const distances = raceData.distances.map(d => ({ ...d, race_id: raceId, base_price: d.base_price || 0 }));
                const { error: distError } = await supabase.from('race_distances').insert(distances);
                if (distError) console.log(`  ❌ Distances error: ${distError.message}`);
                else console.log(`  ✅ ${distances.length} distances added`);
            }

            // Insert beneficiaries
            if (raceData.beneficiaries?.length) {
                const beneficiaries = raceData.beneficiaries.map(b => ({ ...b, race_id: raceId }));
                await supabase.from('race_beneficiaries').insert(beneficiaries);
                console.log(`  ✅ ${beneficiaries.length} beneficiaries added`);
            }

            // Insert policies
            let policiesToInsert = raceData.policies ? [...raceData.policies] : [];
            if (raceData.include_standard_policies) {
                policiesToInsert = [...policiesToInsert, ...standardPolicies];
            }
            if (policiesToInsert.length) {
                const policies = policiesToInsert.map(p => ({ ...p, race_id: raceId }));
                await supabase.from('race_policies').insert(policies);
                console.log(`  ✅ ${policies.length} policies added`);
            }

            // Insert packet pickup
            if (raceData.packet_pickup?.length) {
                const pickups = raceData.packet_pickup.map(p => ({ ...p, race_id: raceId }));
                await supabase.from('packet_pickup_locations').insert(pickups);
                console.log(`  ✅ ${pickups.length} packet pickup locations added`);
            }

            // Insert course records
            if (raceData.course_records?.length) {
                const records = raceData.course_records.map(r => ({ ...r, race_id: raceId }));
                await supabase.from('course_records').insert(records);
                console.log(`  ✅ ${records.length} course records added`);
            }

            // Insert award categories (age groups)
            let awardsToInsert = raceData.award_categories ? [...raceData.award_categories] : [];
            if (raceData.include_age_groups) {
                const ageGroupAwards = standardAgeGroups.map((name, i) => ({
                    category_type: 'age_group',
                    category_name: name,
                    awards_depth: 3,
                    sort_order: i + 1
                }));
                awardsToInsert = [...awardsToInsert, ...ageGroupAwards];
            }
            if (awardsToInsert.length) {
                const awards = awardsToInsert.map(a => ({ ...a, race_id: raceId }));
                await supabase.from('award_categories').insert(awards);
                console.log(`  ✅ ${awards.length} award categories added`);
            }

            // Insert special categories
            if (raceData.special_categories?.length) {
                const categories = raceData.special_categories.map(c => ({ ...c, race_id: raceId }));
                await supabase.from('special_participant_categories').insert(categories);
                console.log(`  ✅ ${categories.length} special categories added`);
            }

            // Insert themed content
            if (raceData.themed_content) {
                await supabase.from('themed_event_content').insert({ ...raceData.themed_content, race_id: raceId });
                console.log(`  ✅ Themed content added`);
            }

            // Insert multisport details
            if (raceData.multisport_details) {
                await supabase.from('multisport_details').insert({ ...raceData.multisport_details, race_id: raceId });
                console.log(`  ✅ Multisport details added`);
            }

            // Insert amenities
            if (raceData.amenities?.length) {
                const amenities = raceData.amenities.map(a => ({ ...a, race_id: raceId }));
                await supabase.from('course_amenities').insert(amenities);
                console.log(`  ✅ ${amenities.length} course amenities added`);
            }

            successCount++;

        } catch (err) {
            console.error(`  ❌ Error: ${err.message}`);
            errorCount++;
        }
    }

    console.log('\n\n========================================');
    console.log(`✅ Successfully processed: ${successCount} races`);
    console.log(`❌ Errors: ${errorCount} races`);
    console.log('========================================\n');
}

seedAllRaces();
