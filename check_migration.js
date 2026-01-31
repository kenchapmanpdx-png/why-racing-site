require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
    console.log('Running migration: Adding hero_carousel_images to races...');

    // Using rpc is not always enabled for direct SQL, depends on user setup.
    // However, I can try to use a simple update to check if the column exists or just run it via run_command if I had a psql-like tool.
    // Since I don't have psql here, I'll try to use Supabase client's ability if possible, or just assume the user will run the SQL.
    // Actually, I can use a simpler approach: try selecting it. If it fails, instructions to user.

    const { error } = await supabase.from('races').select('hero_carousel_images').limit(1);

    if (error && error.code === '42703') { // undefined_column
        console.log('Column "hero_carousel_images" does not exist. Please run the SQL in add_hero_carousel_images.sql in your Supabase SQL Editor.');
        console.log('SQL Content:');
        console.log("ALTER TABLE races ADD COLUMN IF NOT EXISTS hero_carousel_images JSONB DEFAULT '[]'::jsonb;");
        console.log("UPDATE races SET hero_carousel_images = '[]'::jsonb WHERE hero_carousel_images IS NULL;");
    } else if (error) {
        console.error('Error checking column:', error);
    } else {
        console.log('Column "hero_carousel_images" already exists.');
    }
}

runMigration();
