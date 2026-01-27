/**
 * Fix Race Data Script
 * Analyzes current data and fixes issues
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// The 21 official races from the seed script
const officialRaces = [
    'Resolution Run',
    'White River Snowshoe Race',
    'Silver Falls Trail Challenge',
    'Bigfoot Fun Run',
    'Hellz Bellz Ultra',
    'Santa\'s Holiday Hustle 5K & Dirty Santa Trail Run 10K',
    'Couve Clover Run',
    'Spring Classic Duathlon, Half Marathon, 10K & 5K',
    'Hagg Lake Triathlon & Trail Festival',
    'Girlfriends All-Women\'s Triathlon & Fitness Festival',
    'Columbia River Triathlon & Endurance Sports Festival',
    'Pacific Crest Endurance Sports Festival',
    'PDX Triathlon Festival',
    'Pacific Coast Running Festival',
    'PeaceHealth AppleTree Marathon, Half Marathon & 5K',
    'Girlfriends Run',
    'Reflection Run',
    'Stub Stewart Trail Challenge',
    'Scary Run',
    'Crown Stub 100',
    'Battle to the Pacific'
];

async function analyzeDuplicates() {
    console.log('\n========================================');
    console.log('ANALYZING DUPLICATE/ORPHAN RACES');
    console.log('========================================\n');

    const { data: races, error } = await supabase
        .from('races')
        .select('id, name, status, race_date, city, created_at')
        .order('name');

    if (error) {
        console.error('Error:', error);
        return;
    }

    const official = [];
    const orphans = [];
    const duplicates = [];

    for (const race of races) {
        const isOfficial = officialRaces.some(o =>
            race.name.toLowerCase() === o.toLowerCase() ||
            race.name.toLowerCase().includes(o.toLowerCase().split(' ')[0])
        );

        // Check if there's a seeded version (status: draft with content)
        const { data: content } = await supabase
            .from('race_content')
            .select('id')
            .eq('race_id', race.id)
            .single();

        if (content) {
            official.push({ ...race, hasContent: true });
        } else if (race.status === 'draft' && race.name.includes('Test')) {
            orphans.push(race);
        } else {
            // Check if there's a better version (seeded one)
            const matchingOfficial = races.find(r =>
                r.id !== race.id &&
                race.name.toLowerCase().includes(r.name.toLowerCase().split(' ')[0])
            );
            if (matchingOfficial) {
                duplicates.push({ race, mayBeDuplicateOf: matchingOfficial.name });
            } else {
                orphans.push(race);
            }
        }
    }

    console.log('Races WITH content (seeded):', official.length);
    official.forEach(r => console.log(`  ✓ ${r.name}`));

    console.log('\nOrphan races (no content, may need cleanup):');
    orphans.forEach(r => console.log(`  ⚠ ${r.name} (${r.status})`));

    console.log('\nPotential duplicates:');
    duplicates.forEach(d => console.log(`  ⚠ ${d.race.name} -> duplicate of ${d.mayBeDuplicateOf}?`));

    return { official, orphans, duplicates };
}

async function checkMissingFields() {
    console.log('\n========================================');
    console.log('CHECKING MISSING REQUIRED FIELDS');
    console.log('========================================\n');

    const { data: races } = await supabase
        .from('races')
        .select('id, name, race_date, city, state, venue, hero_image_url')
        .order('name');

    const issues = [];

    for (const race of races) {
        const raceIssues = [];

        if (!race.race_date) raceIssues.push('race_date');
        if (!race.city) raceIssues.push('city');
        if (!race.state) raceIssues.push('state');
        if (!race.venue) raceIssues.push('venue');
        if (!race.hero_image_url) raceIssues.push('hero_image_url');

        if (raceIssues.length > 0) {
            issues.push({ name: race.name, id: race.id, missing: raceIssues });
        }
    }

    console.log(`Races with missing fields: ${issues.length}`);
    issues.forEach(i => {
        console.log(`  ${i.name}: missing [${i.missing.join(', ')}]`);
    });

    return issues;
}

async function getDuplicatesToRemove() {
    // Get all races
    const { data: races } = await supabase
        .from('races')
        .select('id, name, status, created_at')
        .order('name');

    const toRemove = [];

    // Group by similar names
    const groups = {};
    for (const race of races) {
        // Normalize the name
        const normalized = race.name.toLowerCase()
            .replace(/&/g, 'and')
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();

        // Get base words for matching
        const words = normalized.split(' ').slice(0, 3).join(' ');

        if (!groups[words]) groups[words] = [];
        groups[words].push(race);
    }

    // Find duplicates (races with no content that have a seeded version)
    for (const [key, raceGroup] of Object.entries(groups)) {
        if (raceGroup.length > 1) {
            // Check which one has content
            for (const race of raceGroup) {
                const { data: content } = await supabase
                    .from('race_content')
                    .select('id')
                    .eq('race_id', race.id)
                    .single();

                race.hasContent = !!content;
            }

            // Keep the one with content, mark others for removal
            const withContent = raceGroup.filter(r => r.hasContent);
            const withoutContent = raceGroup.filter(r => !r.hasContent);

            if (withContent.length > 0 && withoutContent.length > 0) {
                toRemove.push(...withoutContent);
            }
        }
    }

    // Also remove test races
    const testRaces = races.filter(r =>
        r.name.toLowerCase().includes('test') ||
        r.name === 'Test Race 2026'
    );
    toRemove.push(...testRaces);

    return toRemove;
}

async function main() {
    console.log('Starting Race Data Analysis...\n');

    await analyzeDuplicates();
    await checkMissingFields();

    console.log('\n========================================');
    console.log('RACES TO CLEAN UP');
    console.log('========================================\n');

    const toRemove = await getDuplicatesToRemove();

    console.log('These races appear to be duplicates or test data:');
    toRemove.forEach(r => console.log(`  - ${r.name} (${r.id})`));

    console.log(`\nTotal races to potentially remove: ${toRemove.length}`);
    console.log('\nTo remove these, run with --cleanup flag');

    // If cleanup flag is passed
    if (process.argv.includes('--cleanup')) {
        console.log('\n⚠️ CLEANUP MODE - Removing duplicate/orphan races...\n');

        for (const race of toRemove) {
            console.log(`Removing: ${race.name}`);

            // Delete related data first
            await supabase.from('race_content').delete().eq('race_id', race.id);
            await supabase.from('race_distances').delete().eq('race_id', race.id);
            await supabase.from('race_beneficiaries').delete().eq('race_id', race.id);
            await supabase.from('race_policies').delete().eq('race_id', race.id);
            await supabase.from('course_records').delete().eq('race_id', race.id);
            await supabase.from('packet_pickup_locations').delete().eq('race_id', race.id);
            await supabase.from('themed_event_content').delete().eq('race_id', race.id);
            await supabase.from('multisport_details').delete().eq('race_id', race.id);
            await supabase.from('special_participant_categories').delete().eq('race_id', race.id);
            await supabase.from('award_categories').delete().eq('race_id', race.id);
            await supabase.from('course_amenities').delete().eq('race_id', race.id);

            // Delete the race itself
            const { error } = await supabase.from('races').delete().eq('id', race.id);
            if (error) {
                console.log(`  Error: ${error.message}`);
            } else {
                console.log(`  ✓ Removed`);
            }
        }

        console.log('\nCleanup complete!');
    }
}

main().catch(console.error);
