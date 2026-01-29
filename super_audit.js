require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const fs = require('fs');

async function performSuperAudit() {
    console.log('🚀 UNLEASHING THE SUPER AUDIT - FINE-TOOTH COMB MODE');
    console.log('='.repeat(100));

    const { data: races, error: fetchError } = await supabase
        .from('races')
        .select(`
            id, name, race_date, status, is_visible,
            hero_image_url, description, terrain, elevation,
            parking, aid_stations, includes, registration_url,
            race_distances (id, name, base_price, start_time),
            packet_pickup_locations (id, location_name),
            race_faqs (id),
            race_policies (id),
            race_sponsors (id, organization_name, logo_url),
            race_beneficiaries (id, organization_name),
            award_categories (id),
            spectator_locations (id),
            race_accommodations (id),
            multisport_details (id),
            event_start_times (id),
            race_content (id)
        `)
        .eq('is_visible', true)
        .eq('status', 'active')
        .order('race_date', { ascending: true });

    if (fetchError) {
        console.error('CRITICAL ERROR fetching races:', fetchError.message);
        return;
    }

    const report = [];
    let totalIssues = 0;

    for (const race of races) {
        const issues = [];
        const warnings = [];

        // 1. Basic Fields
        if (!race.hero_image_url) issues.push('Missing Hero Image');
        if (!race.description || race.description.length < 50) issues.push('Description missing or too short');
        if (!race.terrain) issues.push('Missing Terrain info');
        if (!race.elevation) issues.push('Missing Elevation info');
        if (!race.parking) warnings.push('No Parking instructions');
        if (!race.aid_stations) warnings.push('No Aid Station info');
        if (!race.includes || race.includes.length === 0) issues.push('Missing "What\'s Included" list');
        if (!race.registration_url) warnings.push('No Registration URL');

        // 2. Distances & Pricing
        const distances = race.race_distances || [];
        if (distances.length === 0) {
            issues.push('NO DISTANCES DEFINED');
        } else {
            const zeroPrices = distances.filter(d => !d.base_price || d.base_price === 0);
            if (zeroPrices.length > 0) issues.push(`${zeroPrices.length} distances have $0 price`);

            const noStartTime = distances.filter(d => !d.start_time);
            if (noStartTime.length > 0) warnings.push(`${noStartTime.length} distances missing specific start times`);
        }

        // 3. Logistics & Content
        if (!race.packet_pickup_locations || race.packet_pickup_locations.length === 0) issues.push('MISSING PACKET PICKUP INFO');
        if (!race.race_faqs || race.race_faqs.length === 0) warnings.push('No FAQs defined');
        if (!race.race_policies || race.race_policies.length === 0) warnings.push('No Policies defined');
        if (!race.race_beneficiaries || race.race_beneficiaries.length === 0) warnings.push('No Beneficiaries listed');

        // 4. Sponsors (Quality Check)
        const sponsors = race.race_sponsors || [];
        if (sponsors.length === 0) {
            warnings.push('No sponsors listed');
        } else {
            const missingLogos = sponsors.filter(s => !s.logo_url);
            if (missingLogos.length > 0) warnings.push(`${missingLogos.length} sponsors missing logos`);
        }

        // 5. Advanced Sections (Triatlon etc)
        const isTri = race.name.toLowerCase().includes('triathlon') || race.name.toLowerCase().includes('duathlon');
        if (isTri && !race.multisport_details) {
            issues.push('Triathlon/Duathlon missing multisport_details (water temp, transition, etc)');
        }

        // 6. Content Table
        if (!race.race_content) warnings.push('Missing detailed content table entry');

        const raceStatus = issues.length === 0 ? (warnings.length === 0 ? '✅' : '⚠️') : '❌';
        totalIssues += issues.length;

        report.push({
            name: race.name,
            date: race.race_date,
            status: raceStatus,
            issues,
            warnings
        });

        // Console output for immediate feedback
        console.log(`\n${raceStatus} ${race.name} (${race.race_date})`);
        if (issues.length > 0) {
            issues.forEach(i => console.log(`   ❌ ISSUE: ${i}`));
        }
        if (warnings.length > 0) {
            warnings.forEach(w => console.log(`   ⚠️ WARNING: ${w}`));
        }
    }

    console.log('\n' + '='.repeat(100));
    console.log(`AUDIT COMPLETE: ${races.length} races checked.`);
    console.log(`Found ${totalIssues} critical issues across ${report.filter(r => r.issues.length > 0).length} races.`);

    fs.writeFileSync('super_audit_report.json', JSON.stringify(report, null, 2));
    console.log('Detailed report saved to super_audit_report.json');
}

performSuperAudit();
