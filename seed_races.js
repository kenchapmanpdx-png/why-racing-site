const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const races = [
    { name: 'White River Snowshoe', date: '2026-02-07', type: 'trail', city: 'Mt. Hood', state: 'OR', hero: 'images/heroes/resolution-run.png' },
    { name: 'Silver Falls Trail Challenge', date: '2026-03-14', type: 'trail', city: 'Silverton', state: 'OR', hero: 'images/action/spring-classic-1.jpg' },
    { name: 'Couve Clover Run', date: '2026-03-14', type: 'run', city: 'Vancouver', state: 'WA', hero: 'images/heroes/santa-hustle.png' },
    { name: 'Crown Stub 100', date: '2026-04-04', type: 'ultra', city: 'Stub Stewart', state: 'OR', hero: 'images/action/pro-action-3.jpg' },
    { name: 'Stub Stewart Challenge', date: '2026-04-18', type: 'trail', city: 'Stub Stewart', state: 'OR', hero: 'images/action/spring-classic-2.jpg' },
    { name: 'Spring Classic', date: '2026-04-25', type: 'run', city: 'Vancouver', state: 'WA', hero: 'images/heroes/spring-classic.png' },
    { name: 'Reflection Run', date: '2026-05-23', type: 'run', city: 'Vancouver', state: 'WA', hero: 'images/heroes/reflection-run.png' },
    { name: 'PDX Triathlon Festival', date: '2026-06-06', type: 'triathlon', city: 'Portland', state: 'OR', hero: 'images/heroes/pdx-triathlon.jpg' },
    { name: 'Hagg Lake Triathlon', date: '2026-06-20', type: 'triathlon', city: 'Gaston', state: 'OR', hero: 'images/heroes/hagg-lake.jpg' },
    { name: 'Bigfoot 5K/10K', date: '2026-07-11', type: 'trail', city: 'Skamania', state: 'WA', hero: 'images/heroes/bigfoot.png' },
    { name: 'Hellz Bellz Ultra', date: '2026-07-25', type: 'ultra', city: 'Washougal', state: 'WA', hero: 'images/action/pro-action-4.jpg' },
    { name: 'Columbia River Tri', date: '2026-08-07', type: 'triathlon', city: 'Vancouver', state: 'WA', hero: 'images/heroes/columbia-river-tri.jpg' },
    { name: 'Girlfriends Triathlon', date: '2026-08-15', type: 'triathlon', city: 'Vancouver', state: 'WA', hero: 'images/heroes/girlfriends-half.jpg' },
    { name: 'Appletree Marathon', date: '2026-08-29', type: 'run', city: 'Vancouver', state: 'WA', hero: 'images/action/pro-action-1.jpg' },
    { name: 'Pacific Coast Festival', date: '2026-09-12', type: 'run', city: 'Long Beach', state: 'WA', hero: 'images/heroes/pacific-coast.jpg' },
    { name: 'Girlfriends Half Marathon', date: '2026-09-26', type: 'run', city: 'Vancouver', state: 'WA', hero: 'images/heroes/girlfriends-tri.png' },
    { name: 'Scary Run', date: '2026-10-24', type: 'run', city: 'Washougal', state: 'WA', hero: 'images/heroes/scary-run.jpg' },
    { name: 'Battle to the Pacific', date: '2026-11-07', type: 'ultra', city: 'Portland to Coast', state: 'OR', hero: 'images/action/pro-action-2.jpg' },
    { name: 'Santa\'s Holiday Hustle', date: '2026-12-05', type: 'run', city: 'Vancouver', state: 'WA', hero: 'images/heroes/santa-hustle.png' },
    { name: 'Pacific Crest Endurance', date: '2026-12-12', type: 'ultra', city: 'Cascade Locks', state: 'OR', hero: 'images/heroes/pacific-crest.jpg' },
    { name: 'Resolution Run 2027', date: '2027-01-01', type: 'run', city: 'Vancouver', state: 'WA', hero: 'images/heroes/resolution-run.png' }
];

async function seedRaces() {
    console.log('Starting seed...');
    for (const race of races) {
        // Check if exists
        const { data: existing } = await supabase.from('races').select('id').eq('name', race.name).eq('race_date', race.date).single();
        if (existing) {
            console.log(`Skipping ${race.name} - already exists.`);
            continue;
        }

        const { data: newRace, error } = await supabase.from('races').insert({
            name: race.name,
            race_date: race.date,
            race_type: race.type,
            city: race.city,
            state: race.state,
            hero_image_url: race.hero,
            status: 'active',
            is_visible: true,
            registration_open: false
        }).select().single();

        if (error) {
            console.error(`Error inserting ${race.name}:`, error.message);
        } else {
            console.log(`Created ${race.name}`);
        }
    }
    console.log('Seed finished!');
}

seedRaces();
