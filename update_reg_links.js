const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const registrationLinks = [
    { name: 'Resolution Run', url: 'https://runsignup.com/Race/WA/LaCenter/WREResolutionRun' },
    { name: 'Silver Falls Trail Challenge', url: 'https://ultrasignup.com/register.aspx?did=131693' },
    { name: 'Couve Clover Run', url: 'https://runsignup.com/Race/WA/Vancouver/CouveCloverRun' },
    { name: 'Spring Classic', url: 'https://runsignup.com/Race/WA/Vancouver/SpringClassicDuathlonHalf10k5k' },
    { name: 'Reflection Run', url: 'https://runsignup.com/Race/WA/Washougal/reflectionrunwa' },
    { name: 'PDX Triathlon Festival', url: 'https://runsignup.com/Race/OR/Fairview/PDXTriathlonFestival' },
    { name: 'Pacific Crest Endurance', url: 'https://runsignup.com/Race/OR/Bend/PacificCrestEnduranceSportsFestival' },
    { name: 'Hagg Lake Triathlon', url: 'https://runsignup.com/Race/OR/Gaston/HAGGLakeTriathlonMultiSportsFestival' },
    { name: 'Bigfoot 5K & 10K', url: 'https://runsignup.com/Race/WA/Yacolt/BigfootFunRun' },
    { name: 'Hellz Bellz Ultra', url: 'https://ultrasignup.com/register.aspx?did=133015' },
    { name: 'Columbia River Tri', url: 'https://runsignup.com/Race/WA/Vancouver/ColumbiaRiverTriathalon' },
    { name: 'Girlfriends Triathlon', url: 'https://runsignup.com/Race/WA/Vancouver/GirlfriendsTriathlonFitnessFestival' },
    { name: 'Appletree Marathon', url: 'https://runsignup.com/Race/WA/Vancouver/PeacehealthAppletreeMarathon' },
    { name: 'Pacific Coast Festival', url: 'https://runsignup.com/Race/WA/LongBeach/PacificCoastRunningFestival' },
    { name: 'Girlfriends Half Marathon', url: 'https://runsignup.com/Race/WA/Vancouver/GirlfriendsRun' },
    { name: 'Scary Run', url: 'https://runsignup.com/Race/WA/Washougal/ScaryRun' },
    { name: 'Santa\'s Holiday Hustle', url: 'https://runsignup.com/Race/WA/Camas/SantasPosse5KRunWalk' }
];

async function updateRegistrationLinks() {
    console.log('--- UPDATING REGISTRATION LINKS ---');

    for (const link of registrationLinks) {
        // Try to match by name (using ILIKE for flexibility)
        const { data: matches, error: fetchError } = await supabase
            .from('races')
            .select('id, name')
            .ilike('name', `%${link.name}%`);

        if (fetchError) {
            console.error(`Error searching for ${link.name}:`, fetchError.message);
            continue;
        }

        if (matches && matches.length > 0) {
            // Update all matches (usually just one)
            for (const race of matches) {
                const { error: updateError } = await supabase
                    .from('races')
                    .update({
                        registration_url: link.url,
                        registration_open: true
                    })
                    .eq('id', race.id);

                if (updateError) {
                    console.error(`Error updating ${race.name}:`, updateError.message);
                } else {
                    console.log(`✅ Linked: ${race.name} -> ${link.url}`);
                }
            }
        } else {
            console.log(`⚠️ No match found for: ${link.name}`);
        }
    }

    console.log('--- LINK UPDATE COMPLETE ---');
}

updateRegistrationLinks();
