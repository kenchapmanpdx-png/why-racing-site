require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const genericActionPhotos = [
    '/images/action/pro-action-1.jpg',
    '/images/action/pro-action-2.jpg',
    '/images/action/pro-action-3.jpg',
    '/images/action/pro-action-4.jpg'
];

async function backfillGalleries() {
    console.log('🚀 Backfilling race galleries...');

    const { data: races, error } = await supabase
        .from('races')
        .select('id, name, gallery_images');

    if (error) {
        console.error('Error fetching races:', error.message);
        return;
    }

    for (const race of races) {
        if (!race.gallery_images || race.gallery_images.length === 0) {
            console.log(`📸 Backfilling ${race.name}...`);
            const { error: updateError } = await supabase
                .from('races')
                .update({ gallery_images: genericActionPhotos })
                .eq('id', race.id);

            if (updateError) console.error(`Error updating ${race.name}:`, updateError.message);
        } else {
            console.log(`✅ ${race.name} already has gallery.`);
        }
    }

    console.log('🏁 Gallery backfill complete.');
}

backfillGalleries();
