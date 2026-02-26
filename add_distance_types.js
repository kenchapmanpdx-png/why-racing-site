const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function backfillDistanceTypes() {
    console.log("Fetching all race distances...");
    const { data: distances, error } = await supabase.from('race_distances').select('id, name');

    if (error) {
        console.error("Error fetching distances:", error);
        return;
    }

    console.log(`Found ${distances.length} distance records to check.`);
    let count = 0;

    for (const dist of distances) {
        const name = (dist.name || '');
        const lowerName = name.toLowerCase();
        let type = name; // Default

        if (lowerName.includes('5k')) type = '5K';
        else if (lowerName.includes('10k')) type = '10K';
        else if (lowerName.includes('15k')) type = '15K';
        else if (lowerName.includes('half')) type = 'Half Marathon';
        else if (lowerName.includes('marathon')) type = 'Marathon';
        else if (lowerName.includes('ultra')) type = '50K Ultra';
        else if (lowerName.includes('100 mile')) type = '100 Mile';
        else if (lowerName.includes('1 mile')) type = '1 Mile';
        else if (lowerName.includes('kids')) type = 'Kids Run';
        else if (lowerName.includes('sprint') && lowerName.includes('triathlon')) type = 'Sprint Triathlon';
        else if (lowerName.includes('olympic')) type = 'Olympic Triathlon';
        else if (lowerName.includes('ironman') || lowerName.includes('70.3')) type = 'Half Ironman';
        else if (lowerName.includes('trail')) type = 'Trail Run';
        else if (lowerName.includes('virtual')) type = 'Virtual';

        const { error: updateError } = await supabase.from('race_distances').update({ distance_type: type }).eq('id', dist.id);

        if (updateError) {
            console.error(`Error updating record ${dist.id}:`, updateError);
        } else {
            count++;
        }
    }
    console.log(`Successfully updated ${count} distance types.`);
}

backfillDistanceTypes();
