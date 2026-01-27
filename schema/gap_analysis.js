/**
 * Comprehensive Race Data Gap Analysis
 * Identifies missing data that would be valuable for race pages
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeGaps() {
    const report = [];

    report.push('========================================');
    report.push('RACE DATA GAP ANALYSIS');
    report.push('========================================\n');

    // Get all races with their content
    const { data: races } = await supabase
        .from('races')
        .select(`
      id, name, race_date, race_time, venue, city, state, 
      hero_image_url, thumbnail_url, logo_url, 
      registration_url, youtube_url,
      terrain, elevation, aid_stations, parking,
      includes, description
    `)
        .order('race_date');

    // Critical fields that should be present for all races
    const criticalFields = {
        registration_url: 'Registration URL (how users sign up)',
        race_time: 'Race Start Time',
        venue: 'Venue Name'
    };

    // Important fields for a good race page
    const importantFields = {
        logo_url: 'Race Logo',
        thumbnail_url: 'Card/Thumbnail Image',
        youtube_url: 'Promo Video',
        terrain: 'Terrain Type (road, trail, mixed)',
        elevation: 'Elevation Profile',
        includes: 'What\'s Included (shirt, medal, etc.)',
        aid_stations: 'Aid Station Info',
        parking: 'Parking Instructions'
    };

    // Check each race
    const criticalMissing = {};
    const importantMissing = {};

    for (const race of races) {
        // Check critical fields
        for (const [field, label] of Object.entries(criticalFields)) {
            if (!race[field]) {
                if (!criticalMissing[field]) criticalMissing[field] = [];
                criticalMissing[field].push(race.name);
            }
        }

        // Check important fields
        for (const [field, label] of Object.entries(importantFields)) {
            if (!race[field] || (Array.isArray(race[field]) && race[field].length === 0)) {
                if (!importantMissing[field]) importantMissing[field] = [];
                importantMissing[field].push(race.name);
            }
        }
    }

    // Report critical missing
    report.push('🚨 CRITICAL MISSING DATA (Needed for functionality):');
    report.push('----------------------------------------');
    for (const [field, label] of Object.entries(criticalFields)) {
        const missing = criticalMissing[field] || [];
        if (missing.length > 0) {
            report.push(`\n${label}: ${missing.length} races missing`);
            missing.forEach(name => report.push(`  - ${name}`));
        } else {
            report.push(`\n${label}: ✓ All races have this`);
        }
    }

    // Report important missing
    report.push('\n\n⚠️ IMPORTANT MISSING DATA (Enhances race pages):');
    report.push('----------------------------------------');
    for (const [field, label] of Object.entries(importantFields)) {
        const missing = importantMissing[field] || [];
        if (missing.length > 0) {
            report.push(`\n${label}: ${missing.length}/${races.length} races missing`);
            if (missing.length <= 5) {
                missing.forEach(name => report.push(`  - ${name}`));
            } else {
                missing.slice(0, 3).forEach(name => report.push(`  - ${name}`));
                report.push(`  ... and ${missing.length - 3} more`);
            }
        }
    }

    // Check related tables
    report.push('\n\n📊 RELATED DATA COVERAGE:');
    report.push('----------------------------------------');

    for (const race of races) {
        const checks = [];

        // Check distances
        const { data: distances } = await supabase
            .from('race_distances')
            .select('id, base_price')
            .eq('race_id', race.id);

        if (!distances || distances.length === 0) {
            checks.push('No distances');
        } else if (distances.every(d => d.base_price === 0)) {
            checks.push('No pricing set');
        }

        // Check policies
        const { data: policies } = await supabase
            .from('race_policies')
            .select('id')
            .eq('race_id', race.id);

        if (!policies || policies.length === 0) {
            checks.push('No policies');
        }

        // Check packet pickup
        const { data: pickup } = await supabase
            .from('packet_pickup_locations')
            .select('id')
            .eq('race_id', race.id);

        if (!pickup || pickup.length === 0) {
            checks.push('No packet pickup info');
        }

        // Check course records (optional but nice)
        const { data: records } = await supabase
            .from('course_records')
            .select('id')
            .eq('race_id', race.id);

        if (checks.length > 0) {
            report.push(`\n${race.name}:`);
            checks.forEach(c => report.push(`  ⚠ ${c}`));
        }
    }

    // Summary recommendations
    report.push('\n\n💡 RECOMMENDATIONS:');
    report.push('----------------------------------------');
    report.push('');

    const recList = [];

    if (criticalMissing.registration_url && criticalMissing.registration_url.length > 0) {
        recList.push(`1. Add registration URLs for ${criticalMissing.registration_url.length} races - users can't sign up without this!`);
    }

    if (importantMissing.logo_url && importantMissing.logo_url.length > 0) {
        recList.push(`2. Add race logos (${importantMissing.logo_url.length} missing) - improves branding`);
    }

    if (importantMissing.thumbnail_url && importantMissing.thumbnail_url.length > 0) {
        recList.push(`3. Add thumbnail/card images (${importantMissing.thumbnail_url.length} missing) - for event listings`);
    }

    if (importantMissing.includes && importantMissing.includes.length > 0) {
        recList.push(`4. Add "What's Included" lists (${importantMissing.includes.length} missing) - tells runners what they get`);
    }

    if (importantMissing.youtube_url) {
        recList.push(`5. Add promo videos where available - increases engagement`);
    }

    // Check for pricing
    let noPricing = 0;
    for (const race of races) {
        const { data: distances } = await supabase
            .from('race_distances')
            .select('base_price')
            .eq('race_id', race.id);
        if (distances && distances.every(d => d.base_price === 0)) {
            noPricing++;
        }
    }
    if (noPricing > 0) {
        recList.push(`6. Set pricing for ${noPricing} races - all distances currently show $0`);
    }

    recList.forEach(r => report.push(r));

    // Write report
    const fs = require('fs');
    fs.writeFileSync('schema/gap_analysis.txt', report.join('\n'));
    console.log(report.join('\n'));
}

analyzeGaps().catch(console.error);
