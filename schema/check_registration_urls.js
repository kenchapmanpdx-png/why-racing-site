require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkRegistrationUrls() {
    console.log('='.repeat(80));
    console.log('🔴 HIGH PRIORITY CHECK #2: Registration URLs');
    console.log('='.repeat(80));

    const { data: races, error } = await supabase
        .from('races')
        .select('name, registration_url')
        .eq('is_visible', true)
        .eq('status', 'active')
        .order('race_date');

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    let missing = [];
    let invalid = [];
    let valid = [];

    races.forEach(race => {
        if (!race.registration_url) {
            missing.push(race.name);
        } else if (!race.registration_url.startsWith('http')) {
            invalid.push({ name: race.name, url: race.registration_url });
        } else {
            valid.push({ name: race.name, url: race.registration_url });
        }
    });

    console.log('\n✅ VALID REGISTRATION URLS (' + valid.length + '):');
    valid.forEach(r => {
        const domain = new URL(r.url).hostname;
        console.log(`   ${r.name}`);
        console.log(`      → ${domain}`);
    });

    if (missing.length > 0) {
        console.log('\n❌ MISSING REGISTRATION URLS (' + missing.length + '):');
        missing.forEach(name => console.log(`   - ${name}`));
    }

    if (invalid.length > 0) {
        console.log('\n⚠️ INVALID URLS (' + invalid.length + '):');
        invalid.forEach(r => console.log(`   - ${r.name}: ${r.url}`));
    }

    console.log('\n' + '='.repeat(80));
    console.log(`SUMMARY: ${valid.length}/${races.length} races have valid registration URLs`);
    if (missing.length === 0 && invalid.length === 0) {
        console.log('✅ All races have valid registration URLs');
    }
    console.log('='.repeat(80));
}

checkRegistrationUrls();
