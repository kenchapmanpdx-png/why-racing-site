require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fieldByFieldCheck() {
    const { data: races, error } = await supabase
        .from('races')
        .select(`
            id, name, race_date, race_time, city, state, venue,
            hero_image_url, thumbnail_url, logo_url, youtube_url,
            description, tagline, terrain, elevation,
            parking, aid_stations, includes, registration_url,
            race_distances (id, name, base_price)
        `)
        .eq('is_visible', true)
        .eq('status', 'active')
        .order('race_date');

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    const fields = [
        { key: 'race_date', label: '📅 Race Date' },
        { key: 'race_time', label: '⏰ Race Time' },
        { key: 'city', label: '🏙️ City' },
        { key: 'state', label: '🗺️ State' },
        { key: 'venue', label: '📍 Venue' },
        { key: 'hero_image_url', label: '🖼️ Hero Image' },
        { key: 'thumbnail_url', label: '🔲 Thumbnail' },
        { key: 'description', label: '📝 Description' },
        { key: 'terrain', label: '🛤️ Terrain' },
        { key: 'elevation', label: '📈 Elevation' },
        { key: 'parking', label: '🅿️ Parking' },
        { key: 'aid_stations', label: '🥤 Aid Stations' },
        { key: 'includes', label: '🎁 Includes/Swag', isArray: true },
        { key: 'registration_url', label: '🔗 Registration URL' },
        { key: 'race_distances', label: '🏃 Distances', isArray: true }
    ];

    console.log('='.repeat(80));
    console.log('FIELD-BY-FIELD RACE DATA CHECK');
    console.log('='.repeat(80));
    console.log(`Checking ${races.length} active races\n`);

    for (const field of fields) {
        const missing = [];

        races.forEach(race => {
            const val = race[field.key];
            let hasMissing = false;

            if (field.isArray) {
                if (!val || val.length === 0) hasMissing = true;
            } else {
                if (!val) hasMissing = true;
            }

            if (hasMissing) {
                missing.push(race.name);
            }
        });

        if (missing.length === 0) {
            console.log(`${field.label}: ✅ All ${races.length} races have this`);
        } else {
            console.log(`${field.label}: ⚠️ Missing in ${missing.length} races:`);
            missing.forEach(name => console.log(`   - ${name}`));
        }
        console.log('');
    }

    // Check for $0 prices
    console.log('💰 Distance Pricing Check:');
    let zeroPriceIssues = [];
    races.forEach(race => {
        const dists = race.race_distances || [];
        const zeroPrice = dists.filter(d => !d.base_price || d.base_price === 0);
        if (zeroPrice.length > 0) {
            zeroPriceIssues.push(`${race.name}: ${zeroPrice.map(d => d.name).join(', ')}`);
        }
    });

    if (zeroPriceIssues.length === 0) {
        console.log('   ✅ All distances have valid pricing');
    } else {
        console.log(`   ⚠️ ${zeroPriceIssues.length} races have $0 prices:`);
        zeroPriceIssues.forEach(issue => console.log(`   - ${issue}`));
    }

    console.log('\n' + '='.repeat(80));
}

fieldByFieldCheck();
