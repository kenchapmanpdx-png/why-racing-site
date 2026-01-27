require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function listAllRaces() {
    const { data, error } = await supabase
        .from('races')
        .select('id, name, slug')
        .eq('is_visible', true)
        .eq('status', 'active')
        .order('race_date', { ascending: true });

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log('Active Visible Races:');
    console.log('='.repeat(80));
    data.forEach((r, i) => {
        console.log(`${i + 1}. ${r.name}`);
        console.log(`   ID: ${r.id}`);
        console.log(`   Slug: ${r.slug || 'N/A'}`);
        console.log('');
    });
    console.log(`Total: ${data.length} races`);
}

listAllRaces();
