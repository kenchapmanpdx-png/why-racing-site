/**
 * Comprehensive Race Data Fix Script
 * 
 * This script:
 * 1. Removes duplicate and test races
 * 2. Merges hero images from duplicate races to seeded races
 * 3. Sets seeded races to 'active' status
 * 4. Adds placeholder hero images for races that need them
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Mapping of duplicate races to their seeded counterparts
// Format: { duplicateId: seededId }
const duplicateMapping = {
    'b0e11248-1cc5-452a-b631-b448b8939289': '48bf79e1-ddca-46dc-bad0-e8717d6eeb2b', // Columbia River Tri -> Columbia River Triathlon
    '29a8a355-ccdb-47f5-8121-2c9c2da5b19e': '78374509-9962-480b-b483-fae0a36c1258', // Hagg Lake Triathlon -> Hagg Lake Triathlon & Trail Festival
    'c1c6a53e-fbd4-4ef6-b760-357f3d1ff4ad': '67609924-8391-47a9-88d2-14a277a4e782', // Pacific Coast Festival -> Pacific Coast Running Festival
    '58ab5fa0-1073-4c37-ac82-35ef2f6fe0e9': '0349a679-67a5-49b8-b4b9-c45c5dc75c0b', // Pacific Crest Endurance -> Pacific Crest Endurance Sports Festival
    '14e8091a-9143-45c7-95c6-6fb79b000b2e': '5bc6592a-8f9f-42ab-ac3c-133b29d1883e', // Resolution Run 2027 -> Resolution Run
    'b49eed3c-e90b-4adb-ab20-916da715c431': 'd74d60f1-40ac-47b6-964b-1ff132ac2fab', // Santa's Holiday Hustle -> Santa's Holiday Hustle 5K
    'a3aa08d2-eafe-4c5d-97be-d0fddba7e39c': '4121f0da-7d0d-40b0-aa72-8bfe84bde8f3', // Spring Classic -> Spring Classic Duathlon
    '99173692-4b89-460c-8682-d9cde43b8e08': 'adf83ae4-311a-4026-a47d-6cdec218ba6b', // Stub Stewart Challenge -> Stub Stewart Trail Challenge
    '17de5017-bd2d-4504-8e69-0e6c9f578ed9': '59228c98-a4c9-43d4-99f1-74a725fc62d4', // White River Snowshoe -> White River Snowshoe Race
};

// Test race to remove
const testRaceId = '6df24388-d667-4a2e-b697-0e2f6d3b06a0';

// Default placeholder hero images by race type
const placeholderImages = {
    'run': 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200&h=600&fit=crop',
    'trail': 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&h=600&fit=crop',
    'triathlon': 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1200&h=600&fit=crop',
    'winter': 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=1200&h=600&fit=crop',
    'ultra': 'https://images.unsplash.com/photo-1544216428-c2dbe31ab58b?w=1200&h=600&fit=crop'
};

// Map seeded races to their placeholder image types
const racePlaceholderTypes = {
    '2809cdaf-c136-4f94-ba86-8e3165eed541': 'run', // Bigfoot Fun Run
    '48bf79e1-ddca-46dc-bad0-e8717d6eeb2b': 'triathlon', // Columbia River Triathlon
    '495cc242-dd40-4f1a-949a-bb6d9a741031': 'triathlon', // Girlfriends All-Women's Triathlon
    '04fe2e1e-2541-441d-b1e4-b36001db3149': 'run', // Girlfriends Run
    '78374509-9962-480b-b483-fae0a36c1258': 'triathlon', // Hagg Lake Triathlon & Trail Festival
    '67609924-8391-47a9-88d2-14a277a4e782': 'run', // Pacific Coast Running Festival
    '0349a679-67a5-49b8-b4b9-c45c5dc75c0b': 'triathlon', // Pacific Crest Endurance Sports Festival
    'fc980021-13d8-4ac2-b4be-cce4a679010c': 'run', // PeaceHealth AppleTree Marathon
    '5bc6592a-8f9f-42ab-ac3c-133b29d1883e': 'run', // Resolution Run
    'd74d60f1-40ac-47b6-964b-1ff132ac2fab': 'run', // Santa's Holiday Hustle 5K
    '4121f0da-7d0d-40b0-aa72-8bfe84bde8f3': 'run', // Spring Classic Duathlon
    'adf83ae4-311a-4026-a47d-6cdec218ba6b': 'trail', // Stub Stewart Trail Challenge
    '59228c98-a4c9-43d4-99f1-74a725fc62d4': 'winter', // White River Snowshoe Race
};

async function transferHeroImages() {
    console.log('\n========================================');
    console.log('STEP 1: Transfer Hero Images from Duplicates');
    console.log('========================================\n');

    for (const [duplicateId, seededId] of Object.entries(duplicateMapping)) {
        // Get the duplicate race's hero image
        const { data: duplicate } = await supabase
            .from('races')
            .select('name, hero_image_url')
            .eq('id', duplicateId)
            .single();

        if (duplicate?.hero_image_url) {
            // Get the seeded race
            const { data: seeded } = await supabase
                .from('races')
                .select('name, hero_image_url')
                .eq('id', seededId)
                .single();

            // Only transfer if seeded race doesn't have a hero image
            if (!seeded?.hero_image_url) {
                const { error } = await supabase
                    .from('races')
                    .update({ hero_image_url: duplicate.hero_image_url })
                    .eq('id', seededId);

                if (error) {
                    console.log(`❌ Failed to transfer hero from ${duplicate.name}: ${error.message}`);
                } else {
                    console.log(`✓ Transferred hero image from "${duplicate.name}" to "${seeded.name}"`);
                }
            } else {
                console.log(`ℹ ${seeded.name} already has a hero image`);
            }
        } else {
            console.log(`ℹ ${duplicate?.name || duplicateId} has no hero image to transfer`);
        }
    }
}

async function removeDuplicates() {
    console.log('\n========================================');
    console.log('STEP 2: Remove Duplicate Races');
    console.log('========================================\n');

    const allDuplicateIds = [...Object.keys(duplicateMapping), testRaceId];

    for (const raceId of allDuplicateIds) {
        // Get race name first
        const { data: race } = await supabase
            .from('races')
            .select('name')
            .eq('id', raceId)
            .single();

        const raceName = race?.name || raceId;

        // Delete related data first
        const relatedTables = [
            'race_content',
            'race_distances',
            'race_beneficiaries',
            'race_policies',
            'course_records',
            'packet_pickup_locations',
            'themed_event_content',
            'multisport_details',
            'special_participant_categories',
            'award_categories',
            'course_amenities'
        ];

        for (const table of relatedTables) {
            await supabase.from(table).delete().eq('race_id', raceId);
        }

        // Delete the race
        const { error } = await supabase.from('races').delete().eq('id', raceId);

        if (error) {
            console.log(`❌ Failed to delete "${raceName}": ${error.message}`);
        } else {
            console.log(`✓ Removed "${raceName}"`);
        }
    }
}

async function activateSeededRaces() {
    console.log('\n========================================');
    console.log('STEP 3: Activate Seeded Races');
    console.log('========================================\n');

    // Get all races with content (seeded races)
    const { data: races } = await supabase
        .from('races')
        .select('id, name, status')
        .eq('status', 'draft');

    for (const race of races || []) {
        // Check if this race has content
        const { data: content } = await supabase
            .from('race_content')
            .select('id')
            .eq('race_id', race.id)
            .single();

        if (content) {
            const { error } = await supabase
                .from('races')
                .update({ status: 'active', is_visible: true })
                .eq('id', race.id);

            if (error) {
                console.log(`❌ Failed to activate "${race.name}": ${error.message}`);
            } else {
                console.log(`✓ Activated "${race.name}"`);
            }
        }
    }
}

async function addPlaceholderImages() {
    console.log('\n========================================');
    console.log('STEP 4: Add Placeholder Hero Images');
    console.log('========================================\n');

    for (const [raceId, imageType] of Object.entries(racePlaceholderTypes)) {
        // Check if the race needs a hero image
        const { data: race } = await supabase
            .from('races')
            .select('name, hero_image_url')
            .eq('id', raceId)
            .single();

        if (race && !race.hero_image_url) {
            const placeholderUrl = placeholderImages[imageType];

            const { error } = await supabase
                .from('races')
                .update({ hero_image_url: placeholderUrl })
                .eq('id', raceId);

            if (error) {
                console.log(`❌ Failed to add placeholder for "${race.name}": ${error.message}`);
            } else {
                console.log(`✓ Added ${imageType} placeholder for "${race.name}"`);
            }
        } else if (race?.hero_image_url) {
            console.log(`ℹ "${race?.name}" already has a hero image`);
        }
    }
}

async function verifyFinalState() {
    console.log('\n========================================');
    console.log('FINAL VERIFICATION');
    console.log('========================================\n');

    const { data: races } = await supabase
        .from('races')
        .select('id, name, status, hero_image_url')
        .order('name');

    console.log(`Total races remaining: ${races?.length || 0}`);

    const active = races?.filter(r => r.status === 'active') || [];
    const withHero = races?.filter(r => r.hero_image_url) || [];

    console.log(`Active races: ${active.length}`);
    console.log(`Races with hero images: ${withHero.length}`);

    const missingHero = races?.filter(r => !r.hero_image_url) || [];
    if (missingHero.length > 0) {
        console.log(`\n⚠️ Races still missing hero images:`);
        missingHero.forEach(r => console.log(`  - ${r.name}`));
    }

    // Check for races with content
    let withContent = 0;
    for (const race of races || []) {
        const { data: content } = await supabase
            .from('race_content')
            .select('id')
            .eq('race_id', race.id)
            .single();
        if (content) withContent++;
    }
    console.log(`Races with content: ${withContent}`);
}

async function main() {
    console.log('Starting Comprehensive Race Data Fix...\n');
    console.log('This will:');
    console.log('1. Transfer hero images from duplicates to seeded races');
    console.log('2. Remove 10 duplicate/test races');
    console.log('3. Activate all seeded races');
    console.log('4. Add placeholder hero images where needed');

    const dryRun = !process.argv.includes('--execute');

    if (dryRun) {
        console.log('\n⚠️ DRY RUN MODE - No changes will be made');
        console.log('Run with --execute flag to apply changes\n');

        // Just show what would happen
        console.log('Duplicates to remove:');
        for (const [dupId, seedId] of Object.entries(duplicateMapping)) {
            const { data: dup } = await supabase.from('races').select('name').eq('id', dupId).single();
            const { data: seed } = await supabase.from('races').select('name').eq('id', seedId).single();
            console.log(`  - "${dup?.name}" -> keeping "${seed?.name}"`);
        }
        console.log(`  - Test Race 2026 (will be removed)`);

        console.log('\nRaces that will get placeholder images:');
        for (const [raceId, imageType] of Object.entries(racePlaceholderTypes)) {
            const { data: race } = await supabase.from('races').select('name, hero_image_url').eq('id', raceId).single();
            if (race && !race.hero_image_url) {
                console.log(`  - ${race.name} (${imageType})`);
            }
        }
    } else {
        await transferHeroImages();
        await removeDuplicates();
        await activateSeededRaces();
        await addPlaceholderImages();
        await verifyFinalState();

        console.log('\n✅ All fixes applied successfully!');
    }
}

main().catch(console.error);
