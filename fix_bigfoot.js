const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixBigfoot() {
    const url = "https://runsignup.com/Race/WA/Yacolt/BigfootFunRun";

    const { error } = await supabase
        .from('races')
        .update({ registration_url: url, runsignup_url: url })
        .ilike('name', '%Bigfoot%');

    if (error) console.error(error);
    else console.log('Fixed Bigfoot URL');
}

fixBigfoot();
