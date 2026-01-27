require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const standardIncludes = ['shirt', 'medal', 'bib', 'timing', 'food', 'photos'];

async function run() {
    console.log('🚀 Standardizing "What\'s Included" swag...');
    const { data: races } = await supabase.from('races').select('id, name, includes');

    for (const race of races) {
        if (!race.includes || race.includes.length === 0) {
            console.log(`Setting standard swag for ${race.name}...`);
            await supabase.from('races').update({ includes: standardIncludes }).eq('id', race.id);
        }
    }
    console.log('✅ Swag standardized.');
}

run();
