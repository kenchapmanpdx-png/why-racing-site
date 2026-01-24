-- =============================================
-- Why Racing Events - Logistic Updates
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Add Start Time to individual race distances
ALTER TABLE race_distances ADD COLUMN IF NOT EXISTS start_time TIME;

-- 2. Add PDF URL to races for instructions
ALTER TABLE races ADD COLUMN IF NOT EXISTS instructions_pdf_url TEXT;

-- 3. Ensure race_distances is visible to public policy
-- (This should already be true if you ran the main schema, but adding here for safety)
DROP POLICY IF EXISTS "Allow public read access" ON race_distances;
CREATE POLICY "Allow public read access" ON race_distances 
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM races WHERE races.id = race_distances.race_id AND is_visible = true AND status = 'active')
    );
