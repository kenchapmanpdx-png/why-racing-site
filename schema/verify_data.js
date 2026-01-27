require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyData() {
    const report = [];

    // 1. Get all races
    const { data: races, error: racesError } = await supabase
        .from('races')
        .select('*')
        .order('name');

    if (racesError) {
        report.push(`ERROR fetching races: ${JSON.stringify(racesError)}`);
        return;
    }

    report.push(`\n========================================`);
    report.push(`RACE DATA VERIFICATION REPORT`);
    report.push(`========================================\n`);
    report.push(`Total Races in Database: ${races.length}\n`);

    // Show race table columns
    if (races.length > 0) {
        report.push(`RACES TABLE COLUMNS: ${Object.keys(races[0]).join(', ')}\n`);
    }

    // 2. Get counts from related tables
    const tables = [
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

    report.push(`\n--- RELATED TABLE COUNTS ---`);
    for (const table of tables) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (error) {
            report.push(`${table}: ERROR - ${error.message}`);
        } else {
            report.push(`${table}: ${count} records`);
        }
    }

    // 3. Check each race for completeness
    report.push(`\n\n--- INDIVIDUAL RACE VERIFICATION ---\n`);

    for (const race of races) {
        report.push(`\n----------------------------------------`);
        report.push(`RACE: ${race.name}`);
        report.push(`  ID: ${race.id}`);
        report.push(`  Slug: ${race.slug}`);
        report.push(`  Race Date: ${race.race_date || 'MISSING'}`);
        report.push(`  Location: ${race.city && race.state ? `${race.city}, ${race.state}` : 'MISSING'}`);
        report.push(`  Status: ${race.status || 'MISSING'}`);
        report.push(`  Hero Image: ${race.hero_image_url ? 'SET' : 'MISSING'}`);
        report.push(`  Card Image: ${race.card_image_url ? 'SET' : 'MISSING'}`);
        report.push(`  Logo: ${race.logo_url ? 'SET' : 'MISSING'}`);

        // Check race_content
        const { data: content } = await supabase
            .from('race_content')
            .select('*')
            .eq('race_id', race.id)
            .single();

        if (content) {
            report.push(`  Content: YES`);
            report.push(`    - Tagline: ${content.tagline ? 'SET' : 'MISSING'}`);
            report.push(`    - Overview: ${content.about_description ? 'SET' : 'MISSING'}`);
            report.push(`    - Course Description: ${content.course_description ? 'SET' : 'MISSING'}`);
        } else {
            report.push(`  Content: MISSING`);
        }

        // Check distances
        const { data: distances } = await supabase
            .from('race_distances')
            .select('name, distance_value, base_price')
            .eq('race_id', race.id);

        if (distances && distances.length > 0) {
            report.push(`  Distances: ${distances.length}`);
            distances.forEach(d => {
                report.push(`    - ${d.name}: ${d.distance_value} (price: $${d.base_price || 0})`);
            });
        } else {
            report.push(`  Distances: MISSING`);
        }

        // Check beneficiaries
        const { data: beneficiaries } = await supabase
            .from('race_beneficiaries')
            .select('organization_name')
            .eq('race_id', race.id);

        report.push(`  Beneficiaries: ${beneficiaries?.length || 0}`);

        // Check policies
        const { data: policies } = await supabase
            .from('race_policies')
            .select('policy_type')
            .eq('race_id', race.id);

        report.push(`  Policies: ${policies?.length || 0}`);

        // Check course records
        const { data: records } = await supabase
            .from('course_records')
            .select('*')
            .eq('race_id', race.id);

        report.push(`  Course Records: ${records?.length || 0}`);
    }

    // Write report to file
    fs.writeFileSync('schema/verification_report.txt', report.join('\n'));
    console.log('Report written to schema/verification_report.txt');
    console.log('\n' + report.join('\n'));
}

verifyData().catch(console.error);
