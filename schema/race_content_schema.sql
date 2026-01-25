-- =============================================
-- Why Racing Events - Extended Race Content Schema
-- Run this SQL in your Supabase SQL Editor
-- =============================================

-- 1. Race Content Table (Core Identity & Details)
CREATE TABLE IF NOT EXISTS race_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    
    -- Core Identity
    edition_number INTEGER,                    -- "11th Annual", "43rd Annual"
    tagline TEXT,                              -- "RUN, GIVE BACK & PARTY!"
    about_description TEXT,                    -- Main marketing copy
    theme_type VARCHAR(50) DEFAULT 'standard', -- 'standard', 'memorial', 'holiday', 'festival'
    
    -- Timing Details
    arrival_time TIME,                         -- "Please arrive by 8:30 AM"
    pre_race_instructions_url TEXT,            -- Link to PDF/Google Doc
    
    -- Location Details  
    venue_name VARCHAR(255),
    venue_address TEXT,
    venue_city VARCHAR(100),
    venue_state VARCHAR(50),
    venue_zip VARCHAR(20),
    venue_notes TEXT,                          -- "Post-event festivities at Vancouver Lake"
    parking_instructions TEXT,
    
    -- Special Messaging
    new_location_alert BOOLEAN DEFAULT false,  -- Show "NEW LOCATION" banner
    covid_protocols TEXT,
    special_announcements TEXT,
    
    -- Travel Info
    nearest_airport VARCHAR(100),
    airport_distance TEXT,                     -- "20 minutes from PDX"
    tourism_video_url TEXT,
    tourism_website_url TEXT,
    restaurants_external_url TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(race_id)
);

-- 2. Event Start Times (Wave Schedule)
CREATE TABLE IF NOT EXISTS event_start_times (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    distance_id UUID REFERENCES race_distances(id) ON DELETE CASCADE,
    
    division_name VARCHAR(100) NOT NULL,       -- "Males 44 and under", "All Relays"
    start_time TIME NOT NULL,
    wave_number INTEGER,
    notes TEXT,                                -- "Must start at end after all others"
    sort_order INTEGER DEFAULT 0
);

-- 3. Packet Pickup Locations
CREATE TABLE IF NOT EXISTS packet_pickup_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    
    location_name VARCHAR(255) NOT NULL,       -- "Foot Traffic Vancouver"
    address TEXT NOT NULL,
    city VARCHAR(100),
    state VARCHAR(50),
    zip VARCHAR(20),
    
    pickup_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    is_race_day BOOLEAN DEFAULT false,
    notes TEXT,                                -- "Email registration@ to have bag ready"
    sort_order INTEGER DEFAULT 0
);

-- 4. Course Records
CREATE TABLE IF NOT EXISTS course_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    distance_id UUID REFERENCES race_distances(id) ON DELETE CASCADE,
    
    gender VARCHAR(20) NOT NULL,               -- 'male', 'female', 'non-binary'
    record_holder_name VARCHAR(255) NOT NULL,
    finish_time INTERVAL NOT NULL,
    record_year INTEGER NOT NULL
);

-- 5. Age Groups & Award Categories
CREATE TABLE IF NOT EXISTS award_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    
    category_type VARCHAR(50) NOT NULL,        -- 'age_group', 'clydesdale', 'athena', 'relay', 'masters'
    category_name VARCHAR(100) NOT NULL,       -- "40-44", "Clydesdale (220+ lbs)"
    min_age INTEGER,
    max_age INTEGER,
    weight_requirement TEXT,                   -- "220+ pounds", "165+ pounds"
    gender_restriction VARCHAR(20),            -- 'male', 'female', 'mixed', NULL
    awards_depth INTEGER DEFAULT 3,            -- Top 3, Top 1, etc.
    notes TEXT,                                -- "Not eligible for age group awards"
    sort_order INTEGER DEFAULT 0
);

-- 6. Beneficiaries
CREATE TABLE IF NOT EXISTS race_beneficiaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    
    organization_name VARCHAR(255) NOT NULL,
    description TEXT,
    website_url TEXT,
    logo_url TEXT,
    is_primary BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0
);

-- 7. Partners & Sponsors (Tiered)
CREATE TABLE IF NOT EXISTS race_sponsors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    
    sponsor_type VARCHAR(50) NOT NULL,         -- 'exclusive_partner', 'partner', 'sponsor'
    partner_category VARCHAR(100),             -- "Health & Wellness", "Vehicle", "Running Store"
    organization_name VARCHAR(255) NOT NULL,
    description TEXT,                          -- Only for exclusive partners
    website_url TEXT,
    logo_url TEXT,
    sort_order INTEGER DEFAULT 0
);

-- 8. FAQs
CREATE TABLE IF NOT EXISTS race_faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),                     -- 'registration', 'course', 'logistics', 'rules'
    applies_to_event_type VARCHAR(50),         -- 'triathlon', 'duathlon', 'run', NULL (all)
    sort_order INTEGER DEFAULT 0
);

-- 9. Spectator Viewing Spots
CREATE TABLE IF NOT EXISTS spectator_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    
    location_name VARCHAR(255) NOT NULL,       -- "Beaches Restaurant"
    description TEXT,                          -- "See runners at miles 3 and 7"
    applies_to_distances TEXT[],               -- ['7 Mile', '10 Mile']
    has_parking BOOLEAN DEFAULT false,
    parking_notes TEXT,
    sort_order INTEGER DEFAULT 0
);

-- 10. Restaurants (Carb Loading)
CREATE TABLE IF NOT EXISTS race_restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    
    restaurant_name VARCHAR(255) NOT NULL,
    description TEXT,
    website_url TEXT,
    is_sponsor BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0
);

-- 11. Hotels & Accommodations
CREATE TABLE IF NOT EXISTS race_accommodations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    
    hotel_name VARCHAR(255) NOT NULL,
    website_url TEXT,
    discount_code VARCHAR(100),
    discount_description TEXT,                 -- "15% off when you mention Why Racing"
    distance_from_venue TEXT,                  -- "5 minutes from Start/Finish"
    sort_order INTEGER DEFAULT 0
);

-- 12. Race Policies & Rules
CREATE TABLE IF NOT EXISTS race_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    
    policy_type VARCHAR(100) NOT NULL,
    policy_text TEXT NOT NULL,
    
    UNIQUE(race_id, policy_type)
);

-- 13. Special Participant Categories
CREATE TABLE IF NOT EXISTS special_participant_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    
    category_name VARCHAR(100) NOT NULL,       -- 'veterans', 'kids', 'relay_teams'
    pricing_rule VARCHAR(50) NOT NULL,         -- 'free', 'discounted', 'special_rate'
    discount_amount DECIMAL(10,2),
    discount_percentage INTEGER,
    eligibility_description TEXT,              -- "Veterans and active military"
    registration_instructions TEXT,            -- "Email registration@ with service details"
    age_limit INTEGER,                         -- 12 for "Kids 12 and under"
    requires_adult BOOLEAN DEFAULT false,      -- Kids need adult registration
    sort_order INTEGER DEFAULT 0
);

-- 14. Multi-Sport Specific Content
CREATE TABLE IF NOT EXISTS multisport_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    
    -- Swim
    water_temperature_typical TEXT,            -- "Mid 60s"
    wetsuit_policy TEXT,
    practice_swim_rules TEXT,
    practice_swim_violation_penalty TEXT,
    
    -- Bike
    bike_requirements TEXT,
    drafting_allowed BOOLEAN DEFAULT false,
    bike_mechanic_onsite BOOLEAN DEFAULT false,
    
    -- Transition
    transition_area_notes TEXT,
    body_marking_info TEXT,
    
    -- Relay
    relay_rules TEXT,
    relay_timing_warning TEXT,
    
    -- USAT
    usat_sanctioned BOOLEAN DEFAULT false,
    usat_rules_url TEXT,
    usat_age_up_rule TEXT,
    
    -- Paddle/Alternative
    has_paddle_option BOOLEAN DEFAULT false,
    paddle_option_description TEXT,
    
    UNIQUE(race_id)
);

-- 15. Themed Event Content
CREATE TABLE IF NOT EXISTS themed_event_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    
    theme_name VARCHAR(100),
    theme_description TEXT,
    costume_contest BOOLEAN DEFAULT false,
    costume_prize_description TEXT,
    
    -- Memorial/Military specific
    is_memorial_event BOOLEAN DEFAULT false,
    hero_posters_description TEXT,
    memorial_day_messaging TEXT,
    
    -- Ruck Challenge
    has_ruck_option BOOLEAN DEFAULT false,
    ruck_weight_requirement TEXT,
    ruck_weigh_in_info TEXT,
    
    UNIQUE(race_id)
);

-- 16. What to Bring Checklist
CREATE TABLE IF NOT EXISTS what_to_bring_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    
    item_name VARCHAR(255) NOT NULL,
    item_description TEXT,
    category VARCHAR(100),                     -- 'required', 'recommended', 'weather', 'spectator'
    applies_to_event_type VARCHAR(50),
    sort_order INTEGER DEFAULT 0
);

-- 17. Course Amenities
CREATE TABLE IF NOT EXISTS course_amenities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    distance_id UUID REFERENCES race_distances(id) ON DELETE CASCADE,
    
    amenity_type VARCHAR(100) NOT NULL,        -- 'aid_station', 'porta_potty', 'water', 'gatorade'
    location_description TEXT,                 -- "Mile 3 and Mile 7"
    frequency TEXT,                            -- "Every 2 miles"
    notes TEXT
);

-- 18. Race Photos (Gallery)
CREATE TABLE IF NOT EXISTS race_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    
    photo_url TEXT NOT NULL,
    thumbnail_url TEXT,
    alt_text TEXT,
    caption TEXT,
    year INTEGER,
    photo_type VARCHAR(50),                    -- 'hero', 'gallery', 'course', 'finish_line'
    sort_order INTEGER DEFAULT 0
);

-- =============================================
-- Enable Row Level Security on all new tables
-- =============================================

ALTER TABLE race_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_start_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE packet_pickup_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE award_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE spectator_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_participant_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE multisport_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE themed_event_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE what_to_bring_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_photos ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies - Service role full access
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

-- =============================================
-- Public Read Policies (linked to visible races)
-- =============================================

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
-- DONE! Your extended schema is ready.
-- =============================================
