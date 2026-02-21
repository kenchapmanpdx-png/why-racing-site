-- =============================================
-- WHY RACING EVENTS - Schema Update (Safe Re-run)
-- Run this SQL in your Supabase SQL Editor
-- Handles existing tables and policies gracefully
-- =============================================

-- 1. Add missing columns to course_records
ALTER TABLE course_records 
ADD COLUMN IF NOT EXISTS distance_name VARCHAR(255);

-- 2. Add missing columns to race_distances  
ALTER TABLE race_distances 
ADD COLUMN IF NOT EXISTS distance_unit VARCHAR(20) DEFAULT 'km',
ADD COLUMN IF NOT EXISTS description TEXT;

-- 3. Add missing column to race_content
ALTER TABLE race_content 
ADD COLUMN IF NOT EXISTS course_description TEXT;

-- =============================================
-- Drop existing policies (safe - only drops if exists)
-- =============================================

DROP POLICY IF EXISTS "service_full_access" ON race_content;
DROP POLICY IF EXISTS "service_full_access" ON event_start_times;
DROP POLICY IF EXISTS "service_full_access" ON packet_pickup_locations;
DROP POLICY IF EXISTS "service_full_access" ON course_records;
DROP POLICY IF EXISTS "service_full_access" ON award_categories;
DROP POLICY IF EXISTS "service_full_access" ON race_beneficiaries;
DROP POLICY IF EXISTS "service_full_access" ON race_sponsors;
DROP POLICY IF EXISTS "service_full_access" ON race_faqs;
DROP POLICY IF EXISTS "service_full_access" ON spectator_locations;
DROP POLICY IF EXISTS "service_full_access" ON race_restaurants;
DROP POLICY IF EXISTS "service_full_access" ON race_accommodations;
DROP POLICY IF EXISTS "service_full_access" ON race_policies;
DROP POLICY IF EXISTS "service_full_access" ON special_participant_categories;
DROP POLICY IF EXISTS "service_full_access" ON multisport_details;
DROP POLICY IF EXISTS "service_full_access" ON themed_event_content;
DROP POLICY IF EXISTS "service_full_access" ON what_to_bring_items;
DROP POLICY IF EXISTS "service_full_access" ON course_amenities;
DROP POLICY IF EXISTS "service_full_access" ON race_photos;

DROP POLICY IF EXISTS "public_read" ON race_content;
DROP POLICY IF EXISTS "public_read" ON event_start_times;
DROP POLICY IF EXISTS "public_read" ON packet_pickup_locations;
DROP POLICY IF EXISTS "public_read" ON course_records;
DROP POLICY IF EXISTS "public_read" ON award_categories;
DROP POLICY IF EXISTS "public_read" ON race_beneficiaries;
DROP POLICY IF EXISTS "public_read" ON race_sponsors;
DROP POLICY IF EXISTS "public_read" ON race_faqs;
DROP POLICY IF EXISTS "public_read" ON spectator_locations;
DROP POLICY IF EXISTS "public_read" ON race_restaurants;
DROP POLICY IF EXISTS "public_read" ON race_accommodations;
DROP POLICY IF EXISTS "public_read" ON race_policies;
DROP POLICY IF EXISTS "public_read" ON special_participant_categories;
DROP POLICY IF EXISTS "public_read" ON multisport_details;
DROP POLICY IF EXISTS "public_read" ON themed_event_content;
DROP POLICY IF EXISTS "public_read" ON what_to_bring_items;
DROP POLICY IF EXISTS "public_read" ON course_amenities;
DROP POLICY IF EXISTS "public_read" ON race_photos;

-- =============================================
-- Recreate policies
-- =============================================

CREATE POLICY "service_full_access" ON race_content FOR ALL USING (true);
CREATE POLICY "service_full_access" ON event_start_times FOR ALL USING (true);
CREATE POLICY "service_full_access" ON packet_pickup_locations FOR ALL USING (true);
CREATE POLICY "service_full_access" ON course_records FOR ALL USING (true);
CREATE POLICY "service_full_access" ON award_categories FOR ALL USING (true);
CREATE POLICY "service_full_access" ON race_beneficiaries FOR ALL USING (true);
CREATE POLICY "service_full_access" ON race_sponsors FOR ALL USING (true);
CREATE POLICY "service_full_access" ON race_faqs FOR ALL USING (true);
CREATE POLICY "service_full_access" ON spectator_locations FOR ALL USING (true);
CREATE POLICY "service_full_access" ON race_restaurants FOR ALL USING (true);
CREATE POLICY "service_full_access" ON race_accommodations FOR ALL USING (true);
CREATE POLICY "service_full_access" ON race_policies FOR ALL USING (true);
CREATE POLICY "service_full_access" ON special_participant_categories FOR ALL USING (true);
CREATE POLICY "service_full_access" ON multisport_details FOR ALL USING (true);
CREATE POLICY "service_full_access" ON themed_event_content FOR ALL USING (true);
CREATE POLICY "service_full_access" ON what_to_bring_items FOR ALL USING (true);
CREATE POLICY "service_full_access" ON course_amenities FOR ALL USING (true);
CREATE POLICY "service_full_access" ON race_photos FOR ALL USING (true);

CREATE POLICY "public_read" ON race_content FOR SELECT USING (
    EXISTS (SELECT 1 FROM races WHERE races.id = race_content.race_id AND is_visible = true)
);
CREATE POLICY "public_read" ON event_start_times FOR SELECT USING (
    EXISTS (SELECT 1 FROM races WHERE races.id = event_start_times.race_id AND is_visible = true)
);
CREATE POLICY "public_read" ON packet_pickup_locations FOR SELECT USING (
    EXISTS (SELECT 1 FROM races WHERE races.id = packet_pickup_locations.race_id AND is_visible = true)
);
CREATE POLICY "public_read" ON course_records FOR SELECT USING (
    EXISTS (SELECT 1 FROM races WHERE races.id = course_records.race_id AND is_visible = true)
);
CREATE POLICY "public_read" ON award_categories FOR SELECT USING (
    EXISTS (SELECT 1 FROM races WHERE races.id = award_categories.race_id AND is_visible = true)
);
CREATE POLICY "public_read" ON race_beneficiaries FOR SELECT USING (
    EXISTS (SELECT 1 FROM races WHERE races.id = race_beneficiaries.race_id AND is_visible = true)
);
CREATE POLICY "public_read" ON race_sponsors FOR SELECT USING (
    EXISTS (SELECT 1 FROM races WHERE races.id = race_sponsors.race_id AND is_visible = true)
);
CREATE POLICY "public_read" ON race_faqs FOR SELECT USING (
    EXISTS (SELECT 1 FROM races WHERE races.id = race_faqs.race_id AND is_visible = true)
);
CREATE POLICY "public_read" ON spectator_locations FOR SELECT USING (
    EXISTS (SELECT 1 FROM races WHERE races.id = spectator_locations.race_id AND is_visible = true)
);
CREATE POLICY "public_read" ON race_restaurants FOR SELECT USING (
    EXISTS (SELECT 1 FROM races WHERE races.id = race_restaurants.race_id AND is_visible = true)
);
CREATE POLICY "public_read" ON race_accommodations FOR SELECT USING (
    EXISTS (SELECT 1 FROM races WHERE races.id = race_accommodations.race_id AND is_visible = true)
);
CREATE POLICY "public_read" ON race_policies FOR SELECT USING (
    EXISTS (SELECT 1 FROM races WHERE races.id = race_policies.race_id AND is_visible = true)
);
CREATE POLICY "public_read" ON special_participant_categories FOR SELECT USING (
    EXISTS (SELECT 1 FROM races WHERE races.id = special_participant_categories.race_id AND is_visible = true)
);
CREATE POLICY "public_read" ON multisport_details FOR SELECT USING (
    EXISTS (SELECT 1 FROM races WHERE races.id = multisport_details.race_id AND is_visible = true)
);
CREATE POLICY "public_read" ON themed_event_content FOR SELECT USING (
    EXISTS (SELECT 1 FROM races WHERE races.id = themed_event_content.race_id AND is_visible = true)
);
CREATE POLICY "public_read" ON what_to_bring_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM races WHERE races.id = what_to_bring_items.race_id AND is_visible = true)
);
CREATE POLICY "public_read" ON course_amenities FOR SELECT USING (
    EXISTS (SELECT 1 FROM races WHERE races.id = course_amenities.race_id AND is_visible = true)
);
CREATE POLICY "public_read" ON race_photos FOR SELECT USING (
    EXISTS (SELECT 1 FROM races WHERE races.id = race_photos.race_id AND is_visible = true)
);

-- =============================================
-- DONE! Schema updated successfully.
-- =============================================
