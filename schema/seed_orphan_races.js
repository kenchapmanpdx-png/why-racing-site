/**
 * Seed Missing Race Content
 * Adds content for orphan races that were created via admin but don't have seeded data
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Orphan races that need content
const orphanRaces = [
    {
        id: '3cdf3334-fb89-4018-a1dd-91ab1e5ce01f', // Appletree Marathon
        needsContent: true,
        needsDistances: false, // Already has distances
        content: {
            tagline: 'A Boston Qualifier through the scenic streets of Vancouver!',
            overview_description: 'The PeaceHealth AppleTree Marathon is a Boston Qualifying marathon featuring a flat, fast course through the beautiful streets of Vancouver, Washington. This premier running event offers multiple distances for runners of all abilities.',
            course_description: 'The course takes runners through downtown Vancouver along the Columbia River waterfront, featuring stunning views and enthusiastic crowd support.',
            venue_name: 'Esther Short Park',
            venue_city: 'Vancouver',
            venue_state: 'WA'
        },
        beneficiaries: [
            { organization_name: 'PeaceHealth Foundation', description: 'Supporting community health initiatives', is_primary: true, sort_order: 1 }
        ]
    },
    {
        id: '91bfa9fc-918e-4702-b43e-348eb2ec7fba', // Bigfoot 5K/10K
        needsContent: true,
        needsDistances: true,
        content: {
            tagline: 'Run with the legend in the heart of Bigfoot Country!',
            overview_description: 'Join us for the Bigfoot 5K/10K in Skamania, Washington - the heart of Bigfoot Country! This fun run celebrates the mystery and legend of Bigfoot while offering a scenic course through the beautiful Columbia River Gorge region.',
            course_description: 'The course winds through the picturesque town of Skamania with views of the Columbia River Gorge and surrounding forested hills.',
            venue_name: 'Skamania County Fairgrounds',
            venue_city: 'Skamania',
            venue_state: 'WA'
        },
        distances: [
            { name: '5K', distance_value: 5, distance_unit: 'km', sort_order: 1 },
            { name: '10K', distance_value: 10, distance_unit: 'km', sort_order: 2 }
        ]
    },
    {
        id: '02a98ee5-b813-4ac1-90c5-8d617d8cb724', // Girlfriends Half Marathon
        needsContent: true,
        needsDistances: true,
        content: {
            tagline: 'Celebrate friendship and fitness together!',
            overview_description: 'The Girlfriends Half Marathon is a celebration of women\'s fitness and friendship. This all-women\'s event encourages participants to run with their girlfriends, sisters, mothers, and daughters in a supportive and empowering environment.',
            course_description: 'A scenic half marathon course through the beautiful streets and parks of Vancouver, Washington.',
            venue_name: 'Clark County Amphitheater',
            venue_city: 'Vancouver',
            venue_state: 'WA'
        },
        distances: [
            { name: 'Half Marathon', distance_value: 13.1, distance_unit: 'miles', sort_order: 1 },
            { name: '10K', distance_value: 10, distance_unit: 'km', sort_order: 2 },
            { name: '5K', distance_value: 5, distance_unit: 'km', sort_order: 3 }
        ],
        specialCategories: [
            { category_name: 'All-Women\'s Event', description: 'Open to all women and girls', requirements: 'Female participants only', sort_order: 1 }
        ]
    },
    {
        id: '3d6778f2-2b8f-4636-b407-c32a320a8ef8', // Girlfriends Triathlon
        needsContent: true,
        needsDistances: true,
        content: {
            tagline: 'Swim, bike, and run with your best friends!',
            overview_description: 'The Girlfriends Triathlon is an all-women\'s triathlon designed to be welcoming to first-time triathletes and experienced athletes alike. Bring your girlfriends and experience the thrill of multisport racing in a supportive environment.',
            course_description: 'Sprint distance triathlon featuring a calm lake swim, scenic bike course, and flat run through beautiful Vancouver, Washington.',
            venue_name: 'Vancouver Lake Regional Park',
            venue_city: 'Vancouver',
            venue_state: 'WA'
        },
        distances: [
            { name: 'Sprint Triathlon', distance_value: 20, distance_unit: 'km', description: '750m swim, 20K bike, 5K run', sort_order: 1 },
            { name: 'Super Sprint Triathlon', distance_value: 10, distance_unit: 'km', description: '400m swim, 10K bike, 2.5K run', sort_order: 2 },
            { name: 'Relay Teams', distance_value: 20, distance_unit: 'km', description: '2-3 person teams share the distances', sort_order: 3 }
        ],
        specialCategories: [
            { category_name: 'All-Women\'s Event', description: 'Open to all women and girls', requirements: 'Female participants only', sort_order: 1 },
            { category_name: 'First-Timer Friendly', description: 'Perfect for first-time triathletes', requirements: 'Beginner-friendly course and support', sort_order: 2 }
        ],
        multisportDetails: {
            swim_distance: 750,
            swim_distance_unit: 'meters',
            swim_type: 'Open Water - Lake',
            bike_distance: 20,
            bike_distance_unit: 'km',
            bike_type: 'Road',
            run_distance: 5,
            run_distance_unit: 'km',
            run_type: 'Paved'
        }
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

// Standard age groups
const standardAgeGroups = ['9 and under', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39', '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70-74', '75-79', '80+'];

async function seedOrphanRaces() {
    console.log('Seeding content for orphan races...\n');

    for (const race of orphanRaces) {
        console.log(`\n========================================`);
        console.log(`Processing: ${race.content.venue_city} race (${race.id.slice(0, 8)}...)`);
        console.log(`========================================`);

        // Get race name for logging
        const { data: raceData } = await supabase
            .from('races')
            .select('name')
            .eq('id', race.id)
            .single();

        console.log(`Race: ${raceData?.name}`);

        // Add content
        if (race.needsContent) {
            // Check if content already exists
            const { data: existingContent } = await supabase
                .from('race_content')
                .select('id')
                .eq('race_id', race.id)
                .single();

            if (existingContent) {
                console.log('  ℹ Content already exists, updating...');
                const { error } = await supabase
                    .from('race_content')
                    .update(race.content)
                    .eq('race_id', race.id);

                if (error) console.log(`  ❌ Error updating content: ${error.message}`);
                else console.log('  ✓ Content updated');
            } else {
                const { error } = await supabase
                    .from('race_content')
                    .insert({ race_id: race.id, ...race.content });

                if (error) console.log(`  ❌ Error inserting content: ${error.message}`);
                else console.log('  ✓ Content added');
            }
        }

        // Add distances
        if (race.needsDistances && race.distances) {
            const distances = race.distances.map(d => ({
                race_id: race.id,
                ...d,
                base_price: d.base_price || 0
            }));

            const { error } = await supabase
                .from('race_distances')
                .insert(distances);

            if (error) console.log(`  ❌ Error inserting distances: ${error.message}`);
            else console.log(`  ✓ ${distances.length} distances added`);
        }

        // Add policies
        const policies = standardPolicies.map(p => ({
            race_id: race.id,
            ...p
        }));

        // Check if policies exist
        const { data: existingPolicies } = await supabase
            .from('race_policies')
            .select('id')
            .eq('race_id', race.id);

        if (!existingPolicies || existingPolicies.length === 0) {
            const { error } = await supabase
                .from('race_policies')
                .insert(policies);

            if (error) console.log(`  ❌ Error inserting policies: ${error.message}`);
            else console.log(`  ✓ ${policies.length} policies added`);
        } else {
            console.log('  ℹ Policies already exist');
        }

        // Add beneficiaries if specified
        if (race.beneficiaries) {
            const beneficiaries = race.beneficiaries.map(b => ({
                race_id: race.id,
                ...b
            }));

            const { error } = await supabase
                .from('race_beneficiaries')
                .insert(beneficiaries);

            if (error && !error.message.includes('duplicate')) {
                console.log(`  ❌ Error inserting beneficiaries: ${error.message}`);
            } else {
                console.log(`  ✓ ${beneficiaries.length} beneficiaries added`);
            }
        }

        // Add special categories if specified
        if (race.specialCategories) {
            const categories = race.specialCategories.map(c => ({
                race_id: race.id,
                ...c
            }));

            const { error } = await supabase
                .from('special_participant_categories')
                .insert(categories);

            if (error && !error.message.includes('duplicate')) {
                console.log(`  ❌ Error inserting special categories: ${error.message}`);
            } else {
                console.log(`  ✓ ${categories.length} special categories added`);
            }
        }

        // Add multisport details if specified
        if (race.multisportDetails) {
            const { error } = await supabase
                .from('multisport_details')
                .insert({ race_id: race.id, ...race.multisportDetails });

            if (error && !error.message.includes('duplicate')) {
                console.log(`  ❌ Error inserting multisport details: ${error.message}`);
            } else {
                console.log('  ✓ Multisport details added');
            }
        }

        // Add standard age group award categories
        // Check for existing
        const { data: existingAwards } = await supabase
            .from('award_categories')
            .select('id')
            .eq('race_id', race.id);

        if (!existingAwards || existingAwards.length === 0) {
            const awards = [];
            let sortOrder = 1;

            // Overall awards
            awards.push({ race_id: race.id, category_type: 'overall', category_name: 'Top 3 Overall Male', awards_depth: 3, sort_order: sortOrder++ });
            awards.push({ race_id: race.id, category_type: 'overall', category_name: 'Top 3 Overall Female', awards_depth: 3, sort_order: sortOrder++ });

            // Age group awards
            for (const ageGroup of standardAgeGroups) {
                awards.push({ race_id: race.id, category_type: 'age_group', category_name: `Male ${ageGroup}`, awards_depth: 3, sort_order: sortOrder++ });
                awards.push({ race_id: race.id, category_type: 'age_group', category_name: `Female ${ageGroup}`, awards_depth: 3, sort_order: sortOrder++ });
            }

            const { error } = await supabase
                .from('award_categories')
                .insert(awards);

            if (error) console.log(`  ❌ Error inserting awards: ${error.message}`);
            else console.log(`  ✓ ${awards.length} award categories added`);
        } else {
            console.log('  ℹ Award categories already exist');
        }
    }

    console.log('\n\n✅ Orphan race seeding complete!');
}

seedOrphanRaces().catch(console.error);
