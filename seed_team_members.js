require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables. Please check .env.local.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const teamMembers = [
    {
        name: 'Karissa & Rod Schoene',
        role: 'Owners & Race Directors',
        photo_url: '../images/Scrapedimages/m-2.jpg',
        my_why: 'To keep up with our kids; To teach our kids to be good humans; To enjoy all life has to offer...',
        bio: 'We approach each WHY RACING EVENT as a challenge to give our athletes an experience that they can’t wait to tell their friends and family about and they can’t wait to come back and do it again! With the amazing WHY RACING EVENTS team, it is my goal to make sure our athletes feel the WHY LOVE that we all provide.\\n\\nHaving grown up in the Northwest, we are entrenched in this community allowing me the ability to provide an experience that our athletes have come to expect from WHY RACING EVENTS. We love to be part of a team that strives to provide the best racing experience for our athletes.\\n\\nIt is a family affair. We can’t do this without our family around us. From our kids, to my family and friends who have volun-TOLDED, to our sponsors, vendors, volunteers and athletes, our “WHY” is because we love the people!',
        email: 'Karissa@whyracingevents.com',
        sort_order: 1,
        is_active: true
    },
    {
        name: 'Brock Schoene',
        role: 'Race Director',
        photo_url: '../images/team/brock-schoene.png',
        my_why: 'To better myself by taking care of my body and mind through running. The more opportunities I have to clear the air...',
        bio: 'I grew up at WHY RACING EVENTS and love the atmosphere of our event venues. I am so excited to be part of making the athlete experience as amazing as possible. WHY provides so many opportunities to connect with our community, supporting local beneficiaries at each event, I take pride in connecting our local volunteers to our athletes.\\n\\nMy goal is to assist our volunteers so they can be the best support crew ever and have so much fun that they want to volunteer at our events all the time.',
        email: 'Brock@whyracingevents.com',
        sort_order: 2,
        is_active: true
    },
    {
        name: 'Richard Jessup',
        role: 'Operations Director',
        photo_url: '../images/Scrapedimages/Richard-Photo-Pipeline-1a-rotated.jpg',
        my_why: 'To make my family proud by creating long lasting events that contribute to people’s happiness and wellness.',
        bio: 'I grew up in San Diego, CA where I learned to love the ocean and an active lifestyle. I started working triathlons and running races in the late 1980’s and immediately fell in love with the industry. I’ve worked for many race companies throughout my career and found a home with WHY RACING EVENTS in 2015.\\n\\nTwo of my five daughters (Sydney & Chloe) also work at WHY RACING EVENTS. When I’m not working events you can find me at home in Arizona by the pool, on a road trip to the beach or exploring life with my family.',
        email: 'Richard@whyracingevents.com',
        sort_order: 3,
        is_active: true
    },
    {
        name: 'Marla Stone',
        role: 'Volunteer Coordinator',
        photo_url: '../images/Scrapedimages/marla.jpg',
        my_why: 'To encourage others to test their limits and to enjoy what every day has to offer. To be an example...',
        bio: 'I began trail running in my 30’s and drifted to triathlons when I “grew up.” My love for being in the outdoors in a variety of conditions and sports culminated in beginning to work for WHY RACING EVENTS. My joy is to assist in creating the best event experience for athletes of all skill levels.\\n\\nIt is not always winning the race but completion or improving racing times from prior events. WHY RACING EVENTS strives to provide an amazing racing experience while simultaneously raising money and awareness for our beneficiaries’ causes. The WHY Family is a reality – we care about you, the athlete, and the community around you.',
        email: 'Marla@whyracingevents.com',
        sort_order: 4,
        is_active: true
    },
    {
        name: 'Jim Mitts',
        role: 'Swim Course Manager',
        photo_url: '../images/team/jim-mitts.jpg',
        my_why: 'To have fun while being involved in the running community.',
        bio: 'I have always been involved in running. It started in grade school when I participated in AAU Junior Olympics and continued through High school. I also participated in various indoor and outdoor sports throughout my adult life.\\n\\nI got more involved in road races and found WHY RACING EVENTS to be a great race experience and eventually started working with them in 2021. I truly love seeing race participants competing but especially in our multi sport events.',
        email: 'jlmitts55@gmail.com',
        sort_order: 5,
        is_active: true
    }
];

async function seedTeamMembers() {
    console.log('Seeding team members...');

    // Optional: You could wipe the table first if you want
    const { error: deleteError } = await supabase
        .from('team_members')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // delete all using inequality hack

    if (deleteError) {
        console.error('Error clearing old team members (might not be an issue if table is empty):', deleteError);
    }

    const { data, error } = await supabase
        .from('team_members')
        .insert(teamMembers)
        .select();

    if (error) {
        console.error('Error inserting team members:', error);
    } else {
        console.log(`Successfully seeded ${data.length} team members.`);
    }
}

seedTeamMembers();
