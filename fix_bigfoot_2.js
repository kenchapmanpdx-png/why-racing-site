const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixBigfoot() {
    // Get ID
    const { data: races } = await supabase.from('races').select('id, name').ilike('name', '%Bigfoot%');
    console.log('Found:', races);

    if (races.length > 0) {
        const id = races[0].id;
        const url = "https://runsignup.com/Race/WA/Yacolt/BigfootFunRun";
        const { error } = await supabase.from('races').update({ registration_url: url }).eq('id', id);
        if (error) console.log('Error:', error);
        else console.log('Updated Bigfoot successfully.');
    }
}

fixBigfoot();
