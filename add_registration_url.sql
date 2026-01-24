-- Add registration_url column to races table
-- Run this in your Supabase SQL Editor

ALTER TABLE races 
ADD COLUMN IF NOT EXISTS registration_url TEXT;

-- Verify it was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'races' AND column_name = 'registration_url';
