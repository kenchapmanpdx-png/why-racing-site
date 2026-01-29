const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function populateStandardPrices() {
    console.log('Starting standard_price population...');

    // 1. Fetch all race distances
    const { data: distances, error } = await supabase
        .from('race_distances')
        .select('*');

    if (error) {
        console.error('Error fetching distances:', error.message);
        console.log('\nIMPORTANT: Make sure you have run "schema/add_standard_price.sql" in your Supabase SQL Editor first!');
        return;
    }

    console.log(`Found ${distances.length} distances.`);

    let updatedCount = 0;

    for (const dist of distances) {
        const currentPrice = parseFloat(dist.base_price);

        // meaningful criteria: base_price > 0 and no standard_price set
        if (currentPrice > 0 && !dist.standard_price) {

            // Logic: Default "Standard" price is current + $15
            // This is a reasonable default for showing "savings"
            const newStandardPrice = currentPrice + 15;

            console.log(`Updating ${dist.name || dist.distance_value}: $${currentPrice} -> Standard: $${newStandardPrice}`);

            const { error: updateError } = await supabase
                .from('race_distances')
                .update({ standard_price: newStandardPrice })
                .eq('id', dist.id);

            if (updateError) {
                console.error(`Failed to update distance ${dist.id}:`, updateError.message);
            } else {
                updatedCount++;
            }
        }
    }

    console.log(`\nOperation Complete. Updated ${updatedCount} distances.`);
}

populateStandardPrices();
