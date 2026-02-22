require('dotenv').config({ path: '.env.local' });
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTableAndSeed() {
    console.log("Starting Global Sponsors Setup...");

    // 1. Create the table using Supabase REST API and Postgres function if needed.
    // However, the easiest way to run DDL dynamically in Supabase without a custom RPC
    // is using the pg module if the connection string is available, which it isn't.
    // We will use the REST API to execute SQL if pgcrypto/pg is enabled, 
    // or we'll just ask the user if all else fails. Wait, Supabase provides an RPC endpoint.

    // Instead of doing complicated REST SQL injection, let's just log instructions
    // if the table doesn't exist, as it's the safest and most standard way for Supabase.


    // Supabase RPC isn't always reliable for DDL so we'll just seed the data 
    // Usually table creation needs to happen via SQL Editor in Supabase, but let's try pushing the data. 
    // If it fails with "relation does not exist", we'll know we need to create it manually or via explicit SQL.

    const initialSponsors = [
        {
            name: "PeaceHealth",
            logo_url: "images/sponsors/peacehealth.png",
            website_url: "https://www.peacehealth.org/",
            is_active: true,
            sort_order: 10
        },
        {
            name: "Foot Traffic",
            logo_url: "images/sponsors/foot-traffic.jpg",
            website_url: "https://foottraffic.us/",
            is_active: true,
            sort_order: 20
        },
        {
            name: "PepsiCo",
            logo_url: "images/sponsors/pepsi.png",
            website_url: "https://www.pepsico.com/",
            is_active: true,
            sort_order: 30
        },
        {
            name: "McCord's Vancouver Toyota",
            logo_url: "images/sponsors/mccords-toyota.png",
            website_url: "https://www.vancouvertoyota.com/",
            is_active: true,
            sort_order: 40
        },
        {
            name: "NW Personal Training",
            logo_url: "images/sponsors/nw-personal-training.png",
            website_url: "https://nwpersonaltraining.com/",
            is_active: true,
            sort_order: 50
        },
        {
            name: "EM3 Concrete",
            logo_url: "images/sponsors/em3-concrete.jpg",
            website_url: "https://em3concrete.com/",
            is_active: true,
            sort_order: 60
        }
    ];

    console.log(`Seeding ${initialSponsors.length} sponsors...`);

    const { data, error } = await supabase
        .from('global_sponsors')
        .insert(initialSponsors)
        .select();

    if (error) {
        console.error("Error inserting sponsors! (Ensure table exists in Supabase Dashboard):", error.message);

        // Output explicit instructions if table doesn't exist
        if (error.code === '42P01') {
            console.error(`\n🚨 TABLE DOES NOT EXIST. RUN THIS IN SUPABASE SQL EDITOR FIRST:\n
create table public.global_sponsors (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  logo_url text,
  website_url text,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
             `);
        }
        process.exit(1);
    }

    console.log("Successfully seeded sponsors:", data.length);
    console.log("Setup complete!");
}

createTableAndSeed();
