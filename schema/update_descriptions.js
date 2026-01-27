/**
 * Complete Race Data Update Script
 * 
 * This script updates all race_content records with the about_description field
 * using the description from the races table, and ensures all data is complete.
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Mapping of race names to their full about descriptions
const raceDescriptions = {
    'Resolution Run': 'Welcome to the 4th Annual Resolution Run in La Center, Washington as it continues to be a fundraiser for the La Center High School Volleyball program and the Track & Field program. We brought together all of our favorite things, a challenging course to kick up your New Year training program, trails and pathways along a very scenic course, and a good old-fashioned breakfast.',

    'White River Snowshoe Race': 'The White River 4K and 8K are great events for the casual snowshoe enthusiast to the endorphin junkie racer. Both events begin and end at the White River Sno-Park between Government Camp and Mt Hood Meadows on Hwy 35. The snowshoe events are designed for everyone - if you can walk 5-miles you will finish.',

    'Silver Falls Trail Challenge': 'If you have never been to Silver Falls State Park, you are in for a treat. There just ARE NOT ENOUGH ADJECTIVES to describe the PNW brand of beauty and mystique that is personified by Silver Falls State Park. The chance to run behind and pass these picturesque falls is something you won\'t soon forget. Silver Falls is truly one of the most epic places in the PNW.',

    'Bigfoot Fun Run': 'The whole community gathers around at Union High School for a unique celebration built around the Legend of Bigfoot! Food, vendors, live music and a family friendly 5K and 10K run/walk. An amazingly beautiful course running through the town of Yacolt and into the surrounding forest.',

    'Hellz Bellz Ultra': 'The Gateway Drug into the Ultramarathon World! Starting at Yacolt Recreation Park, the course takes you along the Bells Mountain trail. After passing through multiple clear cuts, stream crossings and stunning views of Mt St Helens, around the ten plus mile mark you\'ll come to the Yacolt Burn Aid Station. Upon leaving the Yacolt Burn Aid Station you will embark on a counter clockwise loop on the Tarbell Trail.',

    'Santa\'s Holiday Hustle 5K & Dirty Santa Trail Run 10K': 'Join us to celebrate the holidays in an active and festive way! Race starts at 9 am followed by cookies, cocoa and Santa! Choose between T-Shirt, Santa Costume (full suit), or Hat & Gloves in registration.',

    'Couve Clover Run': 'For more than 40 years, the Couve Clover Run, presented by Holland Partners Group, brings together thousands of runners and walkers to run the Couve. The Couve Clover Run gives everyone from the serious road racer to the family running together an opportunity to celebrate the community on St. Patrick\'s Day weekend.',

    'Spring Classic Duathlon, Half Marathon, 10K & 5K': 'For more than 40 years, the Spring Classic has been a cornerstone of PNW running. Originally the first road race in the Pacific Northwest, this historic event now offers multiple distances including a duathlon option. Run through the beautiful streets of Vancouver along Officer\'s Row and the Columbia River.',

    'Hagg Lake Triathlon & Trail Festival': 'Why Racing Events and Henry Hagg Lake come together for an amazing triathlon and trail running festival. This is the perfect race for first-timers to Olympic distance veterans. The calm lake waters, scenic bike course through rolling farmland, and flat run make this an ideal early season race.',

    'Girlfriends All-Women\'s Triathlon & Fitness Festival': 'An all-female, beginner-friendly triathlon designed to empower women of all fitness levels. Whether you\'re a first-timer or an experienced athlete, this supportive environment celebrates friendship, fitness, and fun. Bring your girlfriends!',

    'Columbia River Triathlon & Endurance Sports Festival': 'Race along the beautiful Columbia River Gorge with stunning views and challenging courses. This festival includes multiple triathlon distances, running events, and a kids triathlon making it perfect for the whole family.',

    'Pacific Crest Endurance Sports Festival': 'The flagship multisport event featuring everything from sprint distance to the legendary Beastman Triathlon. Located at beautiful Cascade Locks with views of the Columbia River Gorge, this festival attracts athletes from across the nation.',

    'PDX Triathlon Festival': 'Portland\'s premier triathlon event at Blue Lake Park! This multi-day festival features swim-bike-run events for all ages and abilities, from super sprint to Olympic distance. Calm lake waters and flat courses make it perfect for beginners.',

    'Pacific Coast Running Festival': 'Experience the magic of running on the Washington coast! From the Sunset Sand Marathon to the Kids Dash, this festival offers something for everyone. Run on the beach, through the dunes, and finish with an incredible ocean sunset.',

    'PeaceHealth AppleTree Marathon, Half Marathon & 5K': 'The AppleTree Marathon is a Boston Qualifying race featuring a fast, flat course through the beautiful streets of Vancouver, Washington. This historic race has been a Pacific Northwest tradition for decades.',

    'Girlfriends Run': 'The ultimate all-women\'s running event celebrating sisterhood, strength, and solidarity. Whether you\'re running with your best friend, your mom, or making new friends, this event is about empowering women through running.',

    'Reflection Run': 'A meaningful event held on Memorial Day weekend to honor and remember those who have served. The scenic course through Washougal provides time for reflection while celebrating our freedoms. Features a 12-mile Ruck Challenge for those wanting an extra challenge.',

    'Stub Stewart Trail Challenge': 'Explore the pristine trails of L.L. Stub Stewart State Park! This challenging trail run takes you through old-growth forest, across streams, and over rolling hills. Multiple distances from quarter marathon to full marathon.',

    'Scary Run': 'The ultimate Halloween running event! Dress up in your best costume and run through the spooky trails of Washougal. Post-race celebration includes a costume contest, Halloween treats, and a monster bash party.',

    'Crown Stub 100': 'The ultimate ultra running challenge through Stub Stewart State Park. 100 miles of Pacific Northwest wilderness, stream crossings, and challenging terrain. Solo runners and relay teams welcome. Ring the bell when you finish!',

    'Battle to the Pacific': 'The final challenge of the year! Fight your way to the Pacific Ocean through the trails and roads of the Columbia River Gorge. This point-to-point race ends with your feet in the Pacific Ocean at Hammond, Oregon.',

    // Orphan races
    'Appletree Marathon': 'The PeaceHealth AppleTree Marathon is a Boston Qualifying marathon featuring a flat, fast course through the beautiful streets of Vancouver, Washington. This premier running event offers multiple distances for runners of all abilities.',

    'Bigfoot 5K/10K': 'Join us for the Bigfoot 5K/10K in Skamania, Washington - the heart of Bigfoot Country! This fun run celebrates the mystery and legend of Bigfoot while offering a scenic course through the beautiful Columbia River Gorge region.',

    'Girlfriends Half Marathon': 'The Girlfriends Half Marathon is a celebration of women\'s fitness and friendship. This all-women\'s event encourages participants to run with their girlfriends, sisters, mothers, and daughters in a supportive and empowering environment.',

    'Girlfriends Triathlon': 'The Girlfriends Triathlon is an all-women\'s triathlon designed to be welcoming to first-time triathletes and experienced athletes alike. Bring your girlfriends and experience the thrill of multisport racing in a supportive environment.'
};

async function updateAllRaceContent() {
    console.log('========================================');
    console.log('UPDATING ALL RACE CONTENT');
    console.log('========================================\n');

    // Get all races with their content
    const { data: races, error } = await supabase
        .from('races')
        .select('id, name, description')
        .order('name');

    if (error) {
        console.error('Error fetching races:', error);
        return;
    }

    console.log(`Found ${races.length} races to update\n`);

    let updated = 0;
    let created = 0;
    let failed = 0;

    for (const race of races) {
        // Get the description - prefer from our mapping, fall back to race.description
        const aboutDescription = raceDescriptions[race.name] || race.description;

        if (!aboutDescription) {
            console.log(`⚠ ${race.name}: No description available, skipping`);
            continue;
        }

        // Check if race_content exists
        const { data: existingContent } = await supabase
            .from('race_content')
            .select('id, about_description')
            .eq('race_id', race.id);

        if (existingContent && existingContent.length > 0) {
            // Update existing content
            if (!existingContent[0].about_description) {
                const { error: updateError } = await supabase
                    .from('race_content')
                    .update({ about_description: aboutDescription })
                    .eq('race_id', race.id);

                if (updateError) {
                    console.log(`❌ ${race.name}: Update failed - ${updateError.message}`);
                    failed++;
                } else {
                    console.log(`✓ ${race.name}: Updated about_description`);
                    updated++;
                }
            } else {
                console.log(`ℹ ${race.name}: Already has about_description`);
            }
        } else {
            // Create new content record
            const { error: insertError } = await supabase
                .from('race_content')
                .insert({
                    race_id: race.id,
                    tagline: `Experience ${race.name}!`,
                    about_description: aboutDescription
                });

            if (insertError) {
                console.log(`❌ ${race.name}: Insert failed - ${insertError.message}`);
                failed++;
            } else {
                console.log(`✓ ${race.name}: Created new content record`);
                created++;
            }
        }
    }

    console.log('\n========================================');
    console.log('SUMMARY');
    console.log('========================================');
    console.log(`Updated: ${updated}`);
    console.log(`Created: ${created}`);
    console.log(`Failed: ${failed}`);
    console.log(`Skipped: ${races.length - updated - created - failed}`);
}

async function verifyResults() {
    console.log('\n========================================');
    console.log('VERIFICATION');
    console.log('========================================\n');

    // Check race_content completeness
    const { data: content } = await supabase
        .from('race_content')
        .select('race_id, tagline, about_description, course_description');

    const withDescription = content?.filter(c => c.about_description) || [];
    const missingDescription = content?.filter(c => !c.about_description) || [];

    console.log(`Total race_content records: ${content?.length || 0}`);
    console.log(`With about_description: ${withDescription.length}`);
    console.log(`Missing about_description: ${missingDescription.length}`);

    // Get race names for missing
    if (missingDescription.length > 0) {
        console.log('\nRaces still missing about_description:');
        for (const c of missingDescription) {
            const { data: race } = await supabase
                .from('races')
                .select('name')
                .eq('id', c.race_id)
                .single();
            console.log(`  - ${race?.name || c.race_id}`);
        }
    }
}

async function main() {
    await updateAllRaceContent();
    await verifyResults();
    console.log('\n✅ Complete!');
}

main().catch(console.error);
