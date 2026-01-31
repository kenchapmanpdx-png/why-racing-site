-- Add hero_carousel_images column to races table
ALTER TABLE races ADD COLUMN IF NOT EXISTS hero_carousel_images JSONB DEFAULT '[]'::jsonb;

-- Update existing records to have an empty array if null
UPDATE races SET hero_carousel_images = '[]'::jsonb WHERE hero_carousel_images IS NULL;
