const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRaces() {
    const { data, error } = await supabase.from('races').select('id, name, status, is_visible, race_date');
    if (error) {
        console.error('Error:', error);
        return;
    }
    console.log('--- Races in Database ---');
    if (data.length === 0) {
        console.log('No races found.');
    } else {
        data.forEach(r => {
            console.log(`- [${r.id}] ${r.name} (${r.race_date}) | Status: ${r.status} | Visible: ${r.is_visible}`);
        });
    }
    console.log('-------------------------');
}

checkRaces();
