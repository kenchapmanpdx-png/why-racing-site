const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const raceLinks = [
    { name: "Resolution Run", url: "https://runsignup.com/Race/WA/LaCenter/WREResolutionRun" },
    { name: "Silver Falls", url: "https://ultrasignup.com/register.aspx?did=131693" },
    { name: "Couve Clover", url: "https://runsignup.com/Race/WA/Vancouver/CouveCloverRun" },
    { name: "Spring Classic", url: "https://runsignup.com/Race/WA/Vancouver/SpringClassicDuathlonHalf10k5k" },
    { name: "Reflection Run", url: "https://runsignup.com/Race/WA/Washougal/reflectionrunwa" },
    { name: "PDX Triathlon", url: "https://runsignup.com/Race/OR/Fairview/PDXTriathlonFestival" },
    { name: "Pacific Crest", url: "https://runsignup.com/Race/OR/Bend/PacificCrestEnduranceSportsFestival" },
    { name: "Hagg Lake", url: "https://runsignup.com/Race/OR/Gaston/HAGGLakeTriathlonMultiSportsFestival" },
    { name: "Bigfoot", url: "https://runsignup.com/Race/WA/Yacolt/BigfootFunRun" },
    { name: "Hellz Bellz", url: "https://ultrasignup.com/register.aspx?did=133015" },
    { name: "Columbia River", url: "https://runsignup.com/Race/WA/Vancouver/ColumbiaRiverTriathalon" },
    { name: "Girlfriends Triathlon", url: "https://runsignup.com/Race/WA/Vancouver/GirlfriendsTriathlonFitnessFestival" },
    { name: "Appletree", url: "https://runsignup.com/Race/WA/Vancouver/PeacehealthAppletreeMarathon" },
    { name: "Pacific Coast", url: "https://runsignup.com/Race/WA/LongBeach/PacificCoastRunningFestival" },
    { name: "Girlfriends Run", url: "https://runsignup.com/Race/WA/Vancouver/GirlfriendsRun" },
    { name: "Scary Run", url: "https://runsignup.com/Race/WA/Washougal/ScaryRun" },
    { name: "Santa", url: "https://runsignup.com/Race/WA/Camas/SantasPosse5KRunWalk" }
];

async function updateUrls() {
    console.log('Updating Registration URLs...');
    let updatedCount = 0;

    for (const link of raceLinks) {
        // Find the race by partial name match
        const { data: races, error: findError } = await supabase
            .from('races')
            .select('id, name')
            .ilike('name', `%${link.name}%`);

        if (findError) {
            console.error(`Error finding ${link.name}:`, findError.message);
            continue;
        }

        if (!races || races.length === 0) {
            console.warn(`⚠️ Race not found: ${link.name}`);
            continue;
        }

        // Update all matches (usually just one, but handles potential duplicates)
        for (const race of races) {
            const { error: updateError } = await supabase
                .from('races')
                .update({
                    registration_url: link.url,
                    runsignup_url: link.url
                })
                .eq('id', race.id);

            if (updateError) {
                console.error(`Failed to update ${race.name}:`, updateError.message);
            } else {
                console.log(`✅ Updated: ${race.name} -> ${link.url}`);
                updatedCount++;
            }
        }
    }

    console.log(`\n🎉 Process Complete! Updated ${updatedCount} races.`);
}

updateUrls();
