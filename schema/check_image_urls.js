require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkImageUrls() {
    console.log('='.repeat(80));
    console.log('🔴 HIGH PRIORITY CHECK #3: Image URLs (Hero & Gallery)');
    console.log('='.repeat(80));

    const { data: races, error } = await supabase
        .from('races')
        .select('name, hero_image_url, thumbnail_url, gallery_images')
        .eq('is_visible', true)
        .eq('status', 'active')
        .order('race_date');

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log('\n📸 HERO IMAGES:');
    let heroMissing = [];
    let heroValid = 0;
    races.forEach(race => {
        if (!race.hero_image_url) {
            heroMissing.push(race.name);
        } else {
            heroValid++;
        }
    });
    console.log(`   ✅ ${heroValid}/${races.length} races have hero images`);
    if (heroMissing.length > 0) {
        console.log('   Missing:');
        heroMissing.forEach(n => console.log(`      - ${n}`));
    }

    console.log('\n🔲 THUMBNAILS:');
    let thumbMissing = [];
    let thumbValid = 0;
    races.forEach(race => {
        if (!race.thumbnail_url) {
            thumbMissing.push(race.name);
        } else {
            thumbValid++;
        }
    });
    console.log(`   ✅ ${thumbValid}/${races.length} races have thumbnails`);
    if (thumbMissing.length > 0) {
        console.log('   Missing:');
        thumbMissing.forEach(n => console.log(`      - ${n}`));
    }

    console.log('\n📷 GALLERY IMAGES:');
    let galleryStats = { none: [], some: [], many: [] };
    races.forEach(race => {
        const count = (race.gallery_images || []).length;
        if (count === 0) galleryStats.none.push(race.name);
        else if (count < 4) galleryStats.some.push({ name: race.name, count });
        else galleryStats.many.push({ name: race.name, count });
    });

    console.log(`   📊 ${galleryStats.many.length} races have 4+ gallery images`);
    console.log(`   ⚠️ ${galleryStats.some.length} races have 1-3 gallery images`);
    console.log(`   ❌ ${galleryStats.none.length} races have no gallery images`);

    if (galleryStats.none.length > 0) {
        console.log('\n   Races without galleries:');
        galleryStats.none.forEach(n => console.log(`      - ${n}`));
    }

    console.log('\n' + '='.repeat(80));

    // Check for broken URL patterns
    console.log('\n🔗 URL VALIDATION:');
    let brokenPatterns = [];
    races.forEach(race => {
        if (race.hero_image_url && !race.hero_image_url.startsWith('http') && !race.hero_image_url.startsWith('/')) {
            brokenPatterns.push({ race: race.name, field: 'hero', url: race.hero_image_url });
        }
        (race.gallery_images || []).forEach((url, i) => {
            if (!url.startsWith('http') && !url.startsWith('/')) {
                brokenPatterns.push({ race: race.name, field: `gallery[${i}]`, url });
            }
        });
    });

    if (brokenPatterns.length === 0) {
        console.log('   ✅ All image URLs have valid format (http:// or / relative)');
    } else {
        console.log(`   ❌ ${brokenPatterns.length} broken URL patterns found:`);
        brokenPatterns.forEach(b => console.log(`      - ${b.race} (${b.field}): ${b.url.substring(0, 50)}...`));
    }

    console.log('='.repeat(80));
}

checkImageUrls();
