-- =============================================
-- WHY RACING EVENTS - Extended Schema
-- Run this SQL in your Supabase SQL Editor
-- Adds columns for course details, what's included, etc.
-- =============================================

-- Add What's Included (as JSON array)
ALTER TABLE races ADD COLUMN IF NOT EXISTS includes JSONB DEFAULT '[]'::jsonb;

-- Add Course Details
ALTER TABLE races ADD COLUMN IF NOT EXISTS terrain VARCHAR(50);
ALTER TABLE races ADD COLUMN IF NOT EXISTS elevation VARCHAR(100);
ALTER TABLE races ADD COLUMN IF NOT EXISTS aid_stations TEXT;
ALTER TABLE races ADD COLUMN IF NOT EXISTS parking TEXT;
ALTER TABLE races ADD COLUMN IF NOT EXISTS packet_pickup TEXT;

-- Add Media Columns
ALTER TABLE races ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE races ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Standardize Thumbnail Column Name
-- (Tries to add thumbnail_url if it doesn't exist, or renames thumbnail_image_url if present)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'races' AND COLUMN_NAME = 'thumbnail_url') THEN
        IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'races' AND COLUMN_NAME = 'thumbnail_image_url') THEN
            ALTER TABLE races RENAME COLUMN thumbnail_image_url TO thumbnail_url;
        ELSE
            ALTER TABLE races ADD COLUMN thumbnail_url TEXT;
        END IF;
    END IF;
END $$;

-- Add Charity Info
ALTER TABLE races ADD COLUMN IF NOT EXISTS charity_name VARCHAR(255);
ALTER TABLE races ADD COLUMN IF NOT EXISTS charity_description TEXT;
ALTER TABLE races ADD COLUMN IF NOT EXISTS charity_percent DECIMAL(5,2);

-- Add T-Shirt Sizes (as JSON array)
ALTER TABLE races ADD COLUMN IF NOT EXISTS shirt_sizes JSONB DEFAULT '[]'::jsonb;

-- Confirm the youtube_url column exists (should already exist from original schema)
ALTER TABLE races ADD COLUMN IF NOT EXISTS youtube_url TEXT;

-- =============================================
-- DONE! Extended columns have been added.
-- =============================================
