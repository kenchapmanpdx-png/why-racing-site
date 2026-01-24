-- =============================================
-- Create Storage Bucket for Race Images
-- Run this in Supabase SQL Editor
-- =============================================

-- Create the storage bucket for race images
INSERT INTO storage.buckets (id, name, public)
VALUES ('race-images', 'race-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to race images
CREATE POLICY "Public read access for race images"
ON storage.objects FOR SELECT
USING (bucket_id = 'race-images');

-- Allow authenticated uploads (via service role)
CREATE POLICY "Service role upload for race images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'race-images');

-- Allow authenticated updates
CREATE POLICY "Service role update for race images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'race-images');

-- Allow authenticated deletes
CREATE POLICY "Service role delete for race images"
ON storage.objects FOR DELETE
USING (bucket_id = 'race-images');
