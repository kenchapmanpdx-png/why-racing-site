require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const logoMapping = [
    { name: 'Bigfoot 5K/10K', logo: '/images/heroes/bigfoot.png' },
    { name: 'Columbia River Triathlon', logo: '/images/heroes/columbia-river-tri.jpg' },
    { name: 'Couve Clover Run', logo: '/images/heroes/couve-clover.jpg' },
    { name: 'Girlfriends Half Marathon', logo: '/images/heroes/girlfriends-half.jpg' },
    { name: 'Girlfriends Triathlon', logo: '/images/heroes/girlfriends-tri.png' },
    { name: 'Hagg Lake Triathlon', logo: '/images/heroes/hagg-lake.jpg' },
    { name: 'Pacific Coast Running', logo: '/images/heroes/pacific-coast.jpg' },
    { name: 'Pacific Crest Endurance', logo: '/images/heroes/pacific-crest.jpg' },
    { name: 'PDX Triathlon Festival', logo: '/images/heroes/pdx-triathlon.jpg' },
    { name: 'Reflection Run', logo: '/images/heroes/reflection-run.png' },
    { name: 'Resolution Run', logo: '/images/heroes/resolution-run.png' },
    { name: 'Santa\'s Holiday Hustle', logo: '/images/heroes/santa-hustle.png' },
    { name: 'Scary Run', logo: '/images/heroes/scary-run.jpg' },
    { name: 'Spring Classic', logo: '/images/heroes/spring-classic.png' }
];

async function applyLogos() {
    console.log('🚀 Applying Official Race Logos...');
    for (const item of logoMapping) {
        const { data, error } = await supabase
            .from('races')
            .update({ logo_url: item.logo })
            .ilike('name', `%${item.name}%`);

        if (error) {
            console.error(`Error updating ${item.name}:`, error.message);
        } else {
            console.log(`✅ Applied logo for ${item.name}`);
        }
    }
    console.log('🏁 Logo mapping complete.');
}

applyLogos();
