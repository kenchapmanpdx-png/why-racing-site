require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function audit() {
    console.log('🔍 Starting Race Data Audit...\n');
    const { data: races, error } = await supabase.from('races').select(`
        *,
        race_distances (*),
        packet_pickup_locations (*),
        race_faqs (*),
        race_sponsors (*),
        race_beneficiaries (*),
        award_categories (*),
        course_records (*),
        multisport_details (*),
        race_accommodations (*)
    `);

    if (error) return console.error(error);

    const report = races.map(r => {
        const issues = [];
        if (!r.hero_image_url) issues.push('Missing Hero Image');
        if (!r.thumbnail_url) issues.push('Missing Thumbnail');
        if (!r.logo_url) issues.push('Missing Logo');
        if (!r.description || r.description.length < 50) issues.push('Short/Missing Description');
        if (!r.registration_url) issues.push('Missing Reg URL');
        if (!r.venue) issues.push('Missing Venue');
        if (!r.city || !r.state) issues.push('Missing Location');

        const contentFlags = {
            distances: r.race_distances.length,
            pickup: r.packet_pickup_locations.length,
            faqs: r.race_faqs.length,
            sponsors: r.race_sponsors.length,
            gallery: (r.gallery_images || []).length,
            awards: r.award_categories.length,
            multisport: r.multisport_details ? 1 : 0
        };

        return {
            name: r.name,
            issues,
            contentFlags
        };
    });

    console.log('NAME'.padEnd(30) | 'DIST' | 'PICK' | 'FAQ' | 'SPON' | 'GAL' | 'LOGO' | 'ISSUES');
    console.log('-'.repeat(100));

    report.forEach(r => {
        const c = r.contentFlags;
        const logo = races.find(rc => rc.name === r.name).logo_url ? 'YES' : 'NO';
        console.log(
            `${r.name.substring(0, 28).padEnd(30)} | ` +
            `${String(c.distances).padEnd(4)} | ` +
            `${String(c.pickup).padEnd(4)} | ` +
            `${String(c.faqs).padEnd(3)} | ` +
            `${String(c.sponsors).padEnd(4)} | ` +
            `${String(c.gallery).padEnd(3)} | ` +
            `${logo.padEnd(4)} | ` +
            `${r.issues.join(', ')}`
        );
    });

    console.log('\n--- Summary ---');
    console.log(`Total Races: ${races.length}`);
    console.log(`Races with Gallery: ${report.filter(r => r.contentFlags.gallery > 0).length}`);
    console.log(`Races with FAQ: ${report.filter(r => r.contentFlags.faqs > 0).length}`);
    console.log(`Races with Logo: ${report.filter(r => races.find(rc => rc.name === r.name).logo_url).length}`);
}

audit();
