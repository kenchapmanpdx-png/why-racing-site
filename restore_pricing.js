const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function restorePricing() {
    console.log('🔄 restoring pricing for all races...');

    // 1. Get All Races with Distances
    const { data: races, error } = await supabase
        .from('races')
        .select(`
            id, 
            name, 
            race_date, 
            race_distances (
                id, 
                name, 
                base_price
            )
        `)
        .eq('status', 'active');

    if (error) {
        console.error('Error fetching races:', error.message);
        return;
    }

    console.log(`Found ${races.length} active races.`);

    let totalInserted = 0;

    for (const race of races) {
        if (!race.race_distances || race.race_distances.length === 0) continue;

        console.log(`Processing: ${race.name} (${race.race_distances.length} distances)`);

        // Check if tiers already exist
        const { count } = await supabase
            .from('pricing_tiers')
            .select('*', { count: 'exact', head: true })
            .eq('race_id', race.id);

        if (count > 0) {
            console.log(`  - Skipping (Has ${count} tiers already)`);
            continue;
        }

        const tiersToInsert = [];
        const today = new Date();
        const raceDate = new Date(race.race_date);

        // Logic: Set Early Bird to end 30 days from now (to show timer)
        // or 1 month before race, whichever is sooner.

        let ebEndDate = new Date();
        ebEndDate.setDate(today.getDate() + 30); // Default: Deal ends in 30 days

        // Ensure we don't go past the race date
        if (ebEndDate > raceDate) {
            ebEndDate = new Date(raceDate);
            ebEndDate.setDate(raceDate.getDate() - 7); // End 7 days before race
        }

        // Standard ends on race day
        const raceDayStr = raceDate.toISOString().split('T')[0];

        for (const dist of race.race_distances) {
            const basePrice = parseFloat(dist.base_price) || 0;
            if (basePrice === 0) continue;

            // Early Bird Price ($10 off, minimum $20)
            let ebPrice = basePrice - 10;
            if (ebPrice < 20) ebPrice = basePrice; // Don't discount cheap races too much

            // 1. Early Bird Tier
            tiersToInsert.push({
                race_id: race.id,
                distance_id: dist.id,
                tier_name: 'Early Bird',
                price: ebPrice,
                start_date: today.toISOString(), // valid from today
                end_date: ebEndDate.toISOString()
            });

            // 2. Standard Tier (Future Price)
            const standardStart = new Date(ebEndDate);
            standardStart.setDate(standardStart.getDate() + 1);

            tiersToInsert.push({
                race_id: race.id,
                distance_id: dist.id,
                tier_name: 'Standard',
                price: basePrice,
                start_date: standardStart.toISOString(),
                end_date: raceDayStr // valid until race day
            });
        }

        if (tiersToInsert.length > 0) {
            const { error: insErr } = await supabase.from('pricing_tiers').insert(tiersToInsert);
            if (insErr) {
                console.error(`  - Failed to insert tiers: ${insErr.message}`);
                // If table missing, we will know here
                if (insErr.message.includes('relation "pricing_tiers" does not exist')) {
                    console.error("  !!! CRITICAL: Table 'pricing_tiers' is missing. Run the SQL script !!!");
                    return;
                }
            } else {
                console.log(`  - Inserted ${tiersToInsert.length} pricing tiers.`);
                totalInserted += tiersToInsert.length;
            }
        }
    }

    console.log(`✅ Restore Complete. Updated ${totalInserted} tiers.`);
}

restorePricing();
