const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const updates = [
    { nameStart: 'Resolution', distances: '5K, 10K', registration_url: null },
    { nameStart: 'White River Snow', distances: '4K, 8K', registration_url: 'https://www.xdogadventures.org/content', registration_open: true },
    { nameStart: 'Silver Falls Trail', distances: '¼ Marathon, ½ Marathon, 12-Mile Ruck', registration_url: null },
    { nameStart: 'Couve Clover', distances: '1 Mile, 3 Mile, 7 Mile, 10 Mile', registration_url: null },
    { nameStart: 'Crown Stub 100', distances: '100 Mile Ultra, Ultra Relay', registration_url: null },
    { nameStart: 'Stub Stewart Trail', distances: '¼ Marathon, ½ Marathon, ¾ Marathon, Marathon', registration_url: null },
    { nameStart: 'Spring Classic', distances: '5K, 10K, Half Marathon, Sprint Duathlon (5K/13mi bike/5K)', registration_url: null },
    { nameStart: 'Reflection Run', distances: '5K, 10K, Half Marathon, 12-Mile Ruck', registration_url: null },
    { nameStart: 'PDX Triathlon', distances: '5K, Super Sprint Tri/Du (swim/12mi bike/2mi run), Sprint Tri/Du/AquaBike/Paddle Tri (swim/12mi bike/5K run), Olympic Tri/Du/AquaBike (swim/21mi bike/10K run)', registration_url: null },
    { nameStart: 'Hagg Lake Tri', distances: 'Sprint Tri/Du/AquaBike/Paddle Tri (750m swim/1-loop bike/5K), Olympic Tri/Du/AquaBike/Paddle Tri (2-loop swim/2-loop bike/10K), Off-Road Sprint Tri/Du/AquaBike, Half Marathon Trail Run, 5K Trail Run', registration_url: null },
    { nameStart: 'Bigfoot', distances: '5K, 10K', registration_url: null },
    { nameStart: 'Hellz Bellz', distances: '50-Mile Ultra, 50K (Hellz Gate — new 2026), Trail Marathon (Purgatory)', registration_url: null },
    { nameStart: 'Columbia River', distances: 'Sunset 5K, Sunset 10K, Sprint Tri/Du/AquaBike (½mi swim/12mi bike/5K), Olympic Tri/Du/AquaBike (1500m swim/22.8mi bike/10K), Kids Tri', registration_url: null },
    { nameStart: 'Girlfriends Tri', distances: 'Sprint Tri (½mi swim/12mi bike/5K), Sprint Du (5K/12mi bike/5K), Sprint AquaBike, Paddle Tri, 5K Run (women only)', registration_url: null },
    { nameStart: 'Appletree', distances: 'Sunset 5K, Half Marathon, Marathon (BQ), First Responder Marathon Relay', registration_url: null },
    { nameStart: 'Pacific Coast Running', distances: 'Kids ½ Mile & 1 Mile Dashes, Sunset Sand 5K, 5K, 10K, Half Marathon, Sand Marathon, Tour de Pacific Bike (12.6mi, non-competitive)', registration_url: null },
    { nameStart: 'Girlfriends Run', distances: '6K, 10K, Half Marathon', registration_url: null },
    { nameStart: 'Scary Run', distances: '5K, 10K, 15K', registration_url: 'https://whyracingevents.com/scary-run/', registration_open: true },
    { nameStart: 'Battle to the Pacific', distances: '5K, ¼ Marathon, ½ Marathon, 12-Mile Ruck', registration_url: null },
    { nameStart: "Santa's Holiday Hustle", distances: '5K, Dirty Santa 10K Trail Run', registration_url: null },
    { nameStart: 'Pacific Crest Endurance', distances: 'Beastman Tri (800m swim/58.7mi bike/13.1mi run), Olympic Tri/Du/AquaBike, Sprint Tri/Du/AquaBike, Marathon, Half Marathon, 10K, 5K, Kids Splash Pedal & Dash', registration_url: null },
    // Additional from URLs list that might not be in the exact above list string format:
    { nameStart: 'Maupin Daze', distances: null, registration_url: 'https://www.xdogadventures.org/maupin-daze', registration_open: true },
    { nameStart: 'Mt Hood Scramble', distances: null, registration_url: 'https://www.xdogadventures.org/mt-hood-scramble', registration_open: true },
    { nameStart: 'McCubbins Gulch', distances: null, registration_url: 'https://www.xdogadventures.org/mccubbins-gulch', registration_open: true }
];

async function updateDB() {
    console.log("Fetching current races...");
    const { data: races, error } = await supabase.from('races').select('id, name');

    if (error) {
        console.error("Error fetching races", error);
        return;
    }

    console.log(`Found ${races.length} races. Processing updates...`);

    for (const update of updates) {
        const matchedRace = races.find(r => r.name.toLowerCase().includes(update.nameStart.toLowerCase()));

        if (matchedRace) {
            const payload = {};

            if (update.distances !== null) payload.distances = update.distances;
            if (update.registration_url !== null) {
                payload.registration_url = update.registration_url;
                payload.registration_open = true;
            }

            if (Object.keys(payload).length > 0) {
                const { error: updateError } = await supabase
                    .from('races')
                    .update(payload)
                    .eq('id', matchedRace.id);

                if (updateError) {
                    console.error(`Error updating ${matchedRace.name}:`, updateError);
                } else {
                    console.log(`Updated ${matchedRace.name}: ${JSON.stringify(payload)}`);
                }
            }
        } else {
            console.log(`⚠️ Could not find a race matching: ${update.nameStart}`);
        }
    }
}

updateDB();
