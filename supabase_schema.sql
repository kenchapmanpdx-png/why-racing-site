-- =============================================
-- Why Racing Events - Database Schema
-- Run this SQL in your Supabase SQL Editor
-- =============================================

-- 1. Create Races Table
CREATE TABLE IF NOT EXISTS races (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    race_date DATE NOT NULL,
    race_time TIME,
    race_type VARCHAR(50),
    venue VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50) DEFAULT 'WA',
    tagline TEXT,
    description TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    is_visible BOOLEAN DEFAULT false,
    registration_open BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    waitlist_enabled BOOLEAN DEFAULT false,
    hero_image_url TEXT,
    thumbnail_image_url TEXT,
    logo_url TEXT,
    youtube_url TEXT,
    gallery_images JSONB DEFAULT '[]'::jsonb,
    theme_config JSONB DEFAULT '{}'::jsonb,
    runsignup_url TEXT,
    registration_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Create Race Distances Table
CREATE TABLE IF NOT EXISTS race_distances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    race_id UUID REFERENCES races(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    distance_value VARCHAR(50),
    capacity INTEGER,
    base_price DECIMAL(10,2) DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Create Pricing Tiers Table
CREATE TABLE IF NOT EXISTS pricing_tiers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    race_id UUID REFERENCES races(id) ON DELETE CASCADE,
    distance_id UUID REFERENCES race_distances(id) ON DELETE CASCADE,
    tier_name VARCHAR(100) NOT NULL,
    start_date DATE,
    end_date DATE,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Enable Row Level Security
ALTER TABLE races ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_distances ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies (Allow service role full access)
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow service role full access" ON races;
DROP POLICY IF EXISTS "Allow service role full access" ON race_distances;
DROP POLICY IF EXISTS "Allow service role full access" ON pricing_tiers;
DROP POLICY IF EXISTS "Allow public read access" ON races;
DROP POLICY IF EXISTS "Allow public read access" ON race_distances;
DROP POLICY IF EXISTS "Allow public read access" ON pricing_tiers;

-- Service role can do everything
CREATE POLICY "Allow service role full access" ON races FOR ALL USING (true);
CREATE POLICY "Allow service role full access" ON race_distances FOR ALL USING (true);
CREATE POLICY "Allow service role full access" ON pricing_tiers FOR ALL USING (true);

-- Public can read visible races
CREATE POLICY "Allow public read access" ON races 
    FOR SELECT USING (is_visible = true AND status = 'active');

CREATE POLICY "Allow public read access" ON race_distances 
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM races WHERE races.id = race_distances.race_id AND is_visible = true AND status = 'active')
    );

CREATE POLICY "Allow public read access" ON pricing_tiers 
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM races WHERE races.id = pricing_tiers.race_id AND is_visible = true AND status = 'active')
    );

-- 6. Create Updated_at Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_races_updated_at ON races;
CREATE TRIGGER update_races_updated_at
    BEFORE UPDATE ON races
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- DONE! Your database is ready for Why Racing Events Admin Dashboard
-- =============================================
