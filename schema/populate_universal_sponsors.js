require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const universalSponsors = [
    { name: 'PeaceHealth', logo_url: '/images/sponsors/peacehealth.png', website_url: 'https://www.peacehealth.org' },
    { name: 'Foot Traffic', logo_url: '/images/sponsors/foot-traffic.jpg', website_url: 'https://foottraffic.us' },
    { name: 'Pepsi', logo_url: '/images/sponsors/pepsi.png', website_url: 'https://www.pepsi.com' },
    { name: 'NW Personal Training', logo_url: '/images/sponsors/nw-personal-training.png', website_url: 'https://nwpersonaltraining.com' },
    { name: 'McCord\'s Vancouver Toyota', logo_url: '/images/sponsors/mccords-toyota.png', website_url: 'https://www.vancouvertoyota.com' }
];

async function run() {
    console.log('🚀 Populating Universal Sponsors for all races...');
    const { data: races } = await supabase.from('races').select('id, name');

    for (const race of races) {
        // Clear existing sponsors to avoid dupes for this run
        await supabase.from('race_sponsors').delete().eq('race_id', race.id);

        const rows = universalSponsors.map(s => ({
            race_id: race.id,
            organization_name: s.name,
            logo_url: s.logo_url,
            website_url: s.website_url,
            sponsor_type: 'partner'
        }));

        await supabase.from('race_sponsors').insert(rows);
        console.log(`Added sponsors for ${race.name}`);
    }
    console.log('✅ Universal Sponsors populated.');
}

run();
