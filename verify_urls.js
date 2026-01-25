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

async function verify() {
    console.log('Verifying...');
    const { data: races } = await supabase.from('races').select('name, registration_url');

    let allGood = true;
    for (const link of raceLinks) {
        const match = races.find(r => r.name.toLowerCase().includes(link.name.toLowerCase()));
        if (!match) {
            console.log(`❌ Race not found in DB: ${link.name}`);
            allGood = false;
        } else if (match.registration_url !== link.url) {
            console.log(`❌ Mismatch: ${match.name}`);
            console.log(`   Expected: ${link.url}`);
            console.log(`   Found:    ${match.registration_url}`);

            // Auto-fix
            await supabase.from('races').update({ registration_url: link.url }).ilike('name', `%${link.name}%`);
            console.log('   -> Auto-fixed.');
            allGood = false;
        } else {
            // console.log(`✅ ${match.name}`);
        }
    }

    if (allGood) console.log('All 17 races have correct URLs!');
}

verify();
