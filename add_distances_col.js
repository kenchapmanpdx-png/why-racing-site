const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function addDistancesColumn() {
    // Use RPC if available, or just directly query through Postgres
    console.log("Adding distances column via SQL...");

    // Since we can't run raw SQL on the client directly through JS easily without an RPC, 
    // Let's use the REST API postgrest query capability by creating a migration or a direct call if allowed.

    // Better yet, since we have the service role key, let's see if we can do this via Postgres HTTP API if exposed,
    // or via a small trick like checking if we can update a row with the column

    try {
        const { data, error } = await supabase.rpc('execute_sql', {
            query: 'ALTER TABLE races Add COLUMN IF NOT NULL distances text;'
        });

        if (error) {
            console.error("RPC failed, trying raw query...", error);
        } else {
            console.log("Success:", data);
        }
    } catch (err) {
        console.error("Error:", err);
    }
}

addDistancesColumn();
