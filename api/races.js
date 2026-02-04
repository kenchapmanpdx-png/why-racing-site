// Vercel Serverless Function for /api/races
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase credentials');
        return res.status(500).json({
            error: 'Server configuration error',
            debug: {
                hasUrl: !!supabaseUrl,
                hasKey: !!supabaseKey
            }
        });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        const { data: races, error } = await supabase
            .from('races')
            .select(`
        id,
        name,
        slug,
        race_date,
        race_type,
        city,
        state,
        venue,
        registration_url,
        registration_open,
        hero_image_url,
        thumbnail_url,
        is_visible,
        status,
        race_distances (
          id,
          name,
          distance_value,
          distance_unit
        )
      `)
            .eq('is_visible', true)
            .eq('status', 'active')
            .order('race_date', { ascending: true });

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Database error', details: error.message });
        }

        return res.status(200).json(races || []);
    } catch (err) {
        console.error('API error:', err);
        return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};
