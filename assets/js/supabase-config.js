// Shared Supabase Configuration for Client-Side Use
// This file provides direct Supabase access for homepages and admin panels

const SUPABASE_CONFIG = {
    url: 'https://cqoynntpggqvuuglbhbk.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxb3lubnRwZ2dxdnV1Z2xiaGJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyNTE2NjgsImV4cCI6MjA1MjgyNzY2OH0.2mP_T8BxckxYH7Xw0MHfr4GfXOKZmhpdsCpYYlJqsVY'
};

// Initialize Supabase client (requires supabase-js to be loaded first)
function getSupabaseClient() {
    if (typeof window.supabase === 'undefined') {
        console.error('Supabase JS library not loaded. Make sure to include the CDN script.');
        return null;
    }
    return window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
}

// Load all visible, active races
async function loadRacesFromDB() {
    const client = getSupabaseClient();
    if (!client) return [];

    try {
        const { data: races, error } = await client
            .from('races')
            .select(`
                id,
                name,
                slug,
                race_date,
                race_time,
                race_type,
                city,
                state,
                venue_name,
                address,
                tagline,
                description,
                registration_url,
                registration_open,
                hero_image_url,
                thumbnail_url,
                is_visible,
                status,
                youtube_url,
                theme_colors,
                race_distances (
                    id,
                    name,
                    distance_value,
                    distance_unit,
                    capacity,
                    base_price,
                    start_time
                )
            `)
            .order('race_date', { ascending: true });

        if (error) {
            console.error('Error loading races:', error);
            return [];
        }
        return races || [];
    } catch (err) {
        console.error('Failed to load races:', err);
        return [];
    }
}

// Load all races (for admin - includes draft and inactive)
async function loadAllRacesFromDB() {
    const client = getSupabaseClient();
    if (!client) return [];

    try {
        const { data: races, error } = await client
            .from('races')
            .select(`
                id,
                name,
                slug,
                race_date,
                race_time,
                race_type,
                city,
                state,
                venue_name,
                address,
                tagline,
                description,
                registration_url,
                registration_open,
                hero_image_url,
                thumbnail_url,
                is_visible,
                status,
                youtube_url,
                theme_colors,
                race_distances (
                    id,
                    name,
                    distance_value,
                    distance_unit,
                    capacity,
                    base_price,
                    start_time
                )
            `)
            .order('race_date', { ascending: true });

        if (error) {
            console.error('Error loading races:', error);
            return [];
        }
        return races || [];
    } catch (err) {
        console.error('Failed to load races:', err);
        return [];
    }
}
