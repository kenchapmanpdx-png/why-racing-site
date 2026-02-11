const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findMoreRaces() {
    const { data, error } = await supabase
        .from('races')
        .select('id, name, logo_url')
        .or('name.ilike.%McCubbins%,name.ilike.%Ho ho%');

    if (error) {
        console.error('Error fetching races:', error);
        return;
    }

    console.log('Found races:', JSON.stringify(data, null, 2));
}

findMoreRaces();
