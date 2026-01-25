-- =============================================
-- FIX PRICING TABLE - FORCE RECREATE
-- Run this SQL in your Supabase SQL Editor
-- =============================================

DROP TABLE IF EXISTS pricing_tiers CASCADE;

CREATE TABLE pricing_tiers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    race_id UUID REFERENCES races(id) ON DELETE CASCADE,
    distance_id UUID REFERENCES race_distances(id) ON DELETE CASCADE,
    tier_name VARCHAR(100) NOT NULL,
    start_date DATE,
    end_date DATE,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON pricing_tiers 
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM races WHERE races.id = pricing_tiers.race_id AND is_visible = true AND status = 'active')
    );

-- Allow service role full access (for edits)
CREATE POLICY "Allow service role full access" ON pricing_tiers FOR ALL USING (true);
