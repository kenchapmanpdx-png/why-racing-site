require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const standardFaqs = [
    {
        question: "What is the refund policy?",
        answer: "We have a no-refund policy. However, we do allow transfers to other events or deferrals to the following year if requested at least 14 days before the event."
    },
    {
        question: "Can I run with a stroller or dog?",
        answer: "Strollers are welcome in our road races (please start towards the back). Dogs are generally allowed on short-leash for road races, but restricted for trail races and triathlons for safety. Please check specific event policies for details."
    },
    {
        question: "Is there a gear check?",
        answer: "Yes! We provide a secure gear check area near the start/finish line for all participants. Please use the bag provided at packet pickup or clearly label your own bag."
    },
    {
        question: "What happens if it rains?",
        answer: "WHY RACING EVENTS are rain or shine! We only delay or cancel for extreme safety hazards like lightning, high winds, or dangerous air quality."
    },
    {
        question: "Can I swap my t-shirt size?",
        answer: "If your shirt doesn't fit, you can visit the 'Shirt Swap' area after the race. We swap sizes if we have remaining inventory after all participants have started."
    }
];

async function run() {
    console.log('🚀 Injecting Standard FAQs into all races...');
    const { data: races } = await supabase.from('races').select('id, name');

    for (const race of races) {
        // Check if race already has FAQs
        const { count } = await supabase.from('race_faqs').select('*', { count: 'exact', head: true }).eq('race_id', race.id);

        if (count === 0) {
            console.log(`Adding FAQs to ${race.name}...`);
            const rows = standardFaqs.map(faq => ({
                race_id: race.id,
                question: faq.question,
                answer: faq.answer
            }));
            const { error } = await supabase.from('race_faqs').insert(rows);
            if (error) console.error(`Error for ${race.name}:`, error);
        } else {
            console.log(`${race.name} already has FAQs. Skipping.`);
        }
    }
    console.log('✅ Standard FAQs populated.');
}

run();
