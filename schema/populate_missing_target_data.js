require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const updates = [
    {
        names: ['Girlfriends Half Marathon', 'Girlfriends Run'],
        terrain: 'Fast & Flat Road / Waterfront Trail',
        elevation: 'Mostly flat with a couple of short hills',
        parking: 'Standard paid waterfront parking. Weekend free parking available in downtown Vancouver (a few blocks walk).',
        aid_stations: 'Water stations with electrolyte drinks approximately every 2-3 miles. Porta-potties at major water stops.',
        includes: ['technical_shirt', 'medal', 'timing', 'food', 'mimosas'],
        prices: {
            'Half Marathon': 83,
            '10K': 72,
            '6K': 62
        }
    },
    {
        names: ["Girlfriends All-Women's Triathlon & Fitness Festival", 'Girlfriends Triathlon'],
        terrain: 'Fast & Flat (Paved paths & roads)',
        elevation: 'Extremely flat course; fast down-current swim.',
        parking: 'Parking included at Frenchman\'s Bar Regional Park.',
        aid_stations: 'Water aid stations every 2 miles on the run course. Self-supported on bike (carry your own hydration).',
        includes: ['event_tank', 'medal', 'timing', 'food', 'parking'],
        prices: {
            'Sprint Triathlon': 144.56,
            'Sprint Triathlon Relay': 220.16,
            'Sprint AquaBike': 144.56,
            '5K': 52.76
        }
    },
    {
        names: ['PeaceHealth AppleTree Marathon, Half Marathon & 5K', 'Appletree Marathon'],
        terrain: 'Flat, fast, and scenic historic road course.',
        elevation: 'Certified Boston Qualifier - Very Flat.',
        parking: 'Parking available at Fort Vancouver historic site. Walking distance to the start/finish arch.',
        aid_stations: 'Full aid stations approximately every 2 miles with water and electrolyte drinks.',
        includes: ['technical_shirt', 'medal', 'timing', 'food', 'photos'],
        prices: {
            'Marathon': 119,
            'Half Marathon': 89,
            '5K': 44
        }
    },
    {
        names: ['Pacific Crest Endurance Sports Festival'],
        terrain: 'Mountain roads and paved trails in Central Oregon',
        elevation: 'Variable - Rolling hills on long courses.',
        parking: 'Parking at Riverbend Park and surrounding areas. Shuttles may be available during peak times.',
        aid_stations: 'High-frequency aid stations on the run. Bike support at designated points for Beastman.',
        includes: ['technical_shirt', 'medal', 'timing', 'food', 'beer'],
        prices: {
            'Beastman Triathlon': 272,
            'Olympic Triathlon': 137,
            'Sprint Triathlon': 127,
            'Marathon': 113,
            'Half Marathon': 83,
            '10K': 69,
            '5K': 57
        }
    }
];

async function applyUpdates() {
    console.log('🚀 Applying missing data for target races...');

    for (const update of updates) {
        // Find all matching races by name
        for (const name of update.names) {
            const { data: races, error: raceError } = await supabase
                .from('races')
                .select('id, name')
                .ilike('name', `%${name}%`);

            if (raceError || !races || races.length === 0) {
                console.log(`⚠️ Race not found or error: ${name}`);
                continue;
            }

            for (const race of races) {
                console.log(`Updating ${race.name} (${race.id})...`);

                // Update logistics
                const { error: logError } = await supabase
                    .from('races')
                    .update({
                        terrain: update.terrain,
                        elevation: update.elevation,
                        parking: update.parking,
                        aid_stations: update.aid_stations,
                        includes: update.includes
                    })
                    .eq('id', race.id);

                if (logError) console.error(`  Error updating logistics: ${logError.message}`);

                // Update prices
                if (update.prices) {
                    for (const [distName, price] of Object.entries(update.prices)) {
                        const { error: priceError } = await supabase
                            .from('race_distances')
                            .update({ base_price: price })
                            .eq('race_id', race.id)
                            .ilike('name', `%${distName}%`);

                        if (priceError) console.error(`  Error updating price for ${distName}: ${priceError.message}`);
                    }
                }
            }
        }
    }

    console.log('🏁 Data population complete.');
}

applyUpdates();
