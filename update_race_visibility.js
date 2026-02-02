// Script to update all races to be visible and active
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    console.log('SUPABASE_URL:', supabaseUrl ? 'SET' : 'NOT SET');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'SET' : 'NOT SET');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateRaces() {
    console.log('Fetching all races...');

    // First, get all races
    const { data: races, error: fetchError } = await supabase
        .from('races')
        .select('id, name, race_date, is_visible, status');

    if (fetchError) {
        console.error('Error fetching races:', fetchError);
        return;
    }

    console.log(`Found ${races.length} races:`);
    races.forEach(r => {
        console.log(`  - ${r.name} (${r.race_date}) - visible: ${r.is_visible}, status: ${r.status}`);
    });

    // Update all races to be visible and active
    console.log('\nUpdating all races to is_visible=true, status=active...');

    const { data, error: updateError } = await supabase
        .from('races')
        .update({ is_visible: true, status: 'active' })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Match all rows

    if (updateError) {
        console.error('Error updating races:', updateError);
        return;
    }

    console.log('Successfully updated all races!');

    // Verify the update
    const { data: updated, error: verifyError } = await supabase
        .from('races')
        .select('id, name, race_date, is_visible, status')
        .order('race_date');

    if (verifyError) {
        console.error('Error verifying:', verifyError);
        return;
    }

    console.log('\nUpdated races:');
    updated.forEach(r => {
        console.log(`  - ${r.name} (${r.race_date}) - visible: ${r.is_visible}, status: ${r.status}`);
    });
}

updateRaces();
