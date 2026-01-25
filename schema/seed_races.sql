-- =============================================
-- Why Racing Events - Race Data Seed
-- Run this in Supabase SQL Editor
-- Generated: 2026-01-25
-- =============================================

-- =============================================
-- 1. RESOLUTION RUN
-- =============================================
INSERT INTO races (
    name, race_date, race_time, city, state, venue, description,
    race_type, registration_url, registration_open, is_visible,
    instructions_pdf_url, hero_image_url
) VALUES (
    'Resolution Run',
    '2026-01-03',
    '09:00:00',
    'La Center',
    'WA',
    'La Center High School',
    'Welcome to the 4th Annual Resolution Run in La Center, Washington as it continues to be a fundraiser for the La Center High School Volleyball program and the Track & Field program. We brought together all of our favorite things, a challenging course to kick up your New Year training program, trails and pathways along a very scenic course, and a good old-fashioned breakfast.',
    'run',
    'https://runsignup.com/Race/WA/LaCenter/WREResolutionRun',
    true,
    true,
    'https://docs.google.com/document/d/1rxxXAqWi-XvVoxuJTGrQ5AWW2Em04f2H/edit',
    NULL
) RETURNING id INTO resolution_run_id;

-- Resolution Run Content
INSERT INTO race_content (race_id, edition_number, tagline, theme_type, venue_name, venue_address, venue_city, venue_state, venue_zip)
SELECT id, 4, 'Kickstart your New Year with purpose!', 'new-year', 'La Center High School', '725 NE Highland Rd', 'La Center', 'WA', '98629'
FROM races WHERE name = 'Resolution Run' LIMIT 1;

-- Resolution Run Distances
INSERT INTO race_distances (race_id, name, distance_value, distance_unit, sort_order)
SELECT id, '5K Run/Walk', 5, 'km', 1 FROM races WHERE name = 'Resolution Run' LIMIT 1;
INSERT INTO race_distances (race_id, name, distance_value, distance_unit, sort_order)
SELECT id, '10K Run/Walk', 10, 'km', 2 FROM races WHERE name = 'Resolution Run' LIMIT 1;
INSERT INTO race_distances (race_id, name, distance_value, distance_unit, sort_order)
SELECT id, 'Virtual 5K Run/Walk', 5, 'km', 3 FROM races WHERE name = 'Resolution Run' LIMIT 1;

-- Resolution Run Beneficiaries
INSERT INTO race_beneficiaries (race_id, organization_name, description, is_primary, sort_order)
SELECT id, 'La Center High School Volleyball Program', 'Student athletics support', true, 1 FROM races WHERE name = 'Resolution Run' LIMIT 1;
INSERT INTO race_beneficiaries (race_id, organization_name, description, is_primary, sort_order)
SELECT id, 'La Center High School Track & Field Program', 'Student athletics support', false, 2 FROM races WHERE name = 'Resolution Run' LIMIT 1;

-- Resolution Run Policies
INSERT INTO race_policies (race_id, policy_type, policy_text)
SELECT id, 'refund_policy', 'No refunds issued (no exceptions)' FROM races WHERE name = 'Resolution Run' LIMIT 1;
INSERT INTO race_policies (race_id, policy_type, policy_text)
SELECT id, 'deferral_policy', 'Can defer to next year''s event or another Why Racing Event within the year. $20 deferral fee. Must request up to 10 days before the event.' FROM races WHERE name = 'Resolution Run' LIMIT 1;
INSERT INTO race_policies (race_id, policy_type, policy_text)
SELECT id, 'transfer_policy', 'Can transfer registration to another participant up to 10 days before the event.' FROM races WHERE name = 'Resolution Run' LIMIT 1;

-- =============================================
-- 2. WHITE RIVER SNOWSHOE RACE
-- =============================================
INSERT INTO races (
    name, race_date, race_time, city, state, venue, description,
    race_type, registration_url, registration_open, is_visible
) VALUES (
    'White River Snowshoe Race',
    '2026-02-07',
    '10:00:00',
    'Government Camp',
    'OR',
    'White River West Sno-Park',
    'The White River 4K and 8K are great events for the casual snowshoe enthusiast to the endorphin junkie racer. Both events begin and end at the White River Sno-Park between Government Camp and Mt Hood Meadows on Hwy 35. The snowshoe events are designed for everyone - if you can walk 5-miles you will finish. The course is a scenic tour through the White River Canyon on Mt. Hood.',
    'trail',
    'https://www.adventuresignup.com/Race/OR/GovernmentCamp/WhiteRiverSnowShoe8k4k',
    true,
    true
);

-- Snowshoe Content
INSERT INTO race_content (race_id, tagline, theme_type, venue_name, venue_address, venue_city, venue_state, venue_notes)
SELECT id, 'A true winter adventure on Mt. Hood!', 'winter-adventure', 'White River West Sno-Park', 'Near Hwy 26/Hwy 35 junction', 'Government Camp', 'OR', 'A few miles northeast of Government Camp between Government Camp and Mt Hood Meadows. Organized by X-Dog Adventures.'
FROM races WHERE name = 'White River Snowshoe Race' LIMIT 1;

-- Snowshoe Distances
INSERT INTO race_distances (race_id, name, distance_value, distance_unit, description, sort_order)
SELECT id, '4K Snowshoe', 4, 'km', 'Single loop through upper White River canyon', 1 FROM races WHERE name = 'White River Snowshoe Race' LIMIT 1;
INSERT INTO race_distances (race_id, name, distance_value, distance_unit, description, sort_order)
SELECT id, '8K Snowshoe', 8, 'km', '2 loops on the same course', 2 FROM races WHERE name = 'White River Snowshoe Race' LIMIT 1;

-- =============================================
-- 3. SILVER FALLS TRAIL CHALLENGE
-- =============================================
INSERT INTO races (
    name, race_date, race_time, city, state, venue, description,
    race_type, registration_url, registration_open, is_visible
) VALUES (
    'Silver Falls Trail Challenge',
    '2026-02-28',
    '09:00:00',
    'Sublimity',
    'OR',
    'Silver Falls State Park - South Falls Day-Use Area',
    'If you have never been to Silver Falls State Park, you are in for a treat. There just ARE NOT ENOUGH ADJECTIVES to describe the PNW brand of beauty and mystique that is personified by Silver Falls State Park. Starting in the South Falls day use area, you''ll have the option of 1 loop around the Trail of 10 Falls for a quarter marathon or add an additional loop to complete the half-marathon. The chance to run behind and pass these picturesque falls is something you won''t soon forget. Silver Falls is truly one of the most epic places in the PNW and will stay with you long after race day.',
    'trail',
    'https://ultrasignup.com/register.aspx?did=131693',
    true,
    true
);

-- Silver Falls Content
INSERT INTO race_content (race_id, tagline, theme_type, venue_name, venue_address, venue_city, venue_state, venue_zip, parking_instructions)
SELECT id, 'Run through Oregon''s most epic waterfalls!', 'trail', 'Silver Falls State Park - Orchards Shelter', '20024 Silver Falls Hwy SE', 'Sublimity', 'OR', '97385', '$10 per car parking fee - cash or card accepted'
FROM races WHERE name = 'Silver Falls Trail Challenge' LIMIT 1;

-- Silver Falls Distances
INSERT INTO race_distances (race_id, name, distance_value, distance_unit, start_time, description, sort_order)
SELECT id, '1/4 Marathon', 6.55, 'miles', '09:30:00', 'One clockwise loop around the Trail of Ten Falls', 1 FROM races WHERE name = 'Silver Falls Trail Challenge' LIMIT 1;
INSERT INTO race_distances (race_id, name, distance_value, distance_unit, start_time, description, sort_order)
SELECT id, '1/2 Marathon', 13.1, 'miles', '09:00:00', 'Double loop on the Trail of Ten Falls', 2 FROM races WHERE name = 'Silver Falls Trail Challenge' LIMIT 1;
INSERT INTO race_distances (race_id, name, distance_value, distance_unit, start_time, description, sort_order)
SELECT id, '12 Mile Ruck Challenge', 12, 'miles', '09:00:00', 'Same route as Half Marathon with Winter Trail modification. 35lb minimum for packs, 40lb minimum for vests.', 3 FROM races WHERE name = 'Silver Falls Trail Challenge' LIMIT 1;

-- Silver Falls Packet Pickup
INSERT INTO packet_pickup_locations (race_id, location_name, address, city, state, pickup_date, start_time, end_time, is_race_day, sort_order)
SELECT id, 'Orchards Shelter - Early Pickup', '20024 Silver Falls Hwy SE', 'Sublimity', 'OR', '2026-02-27', '15:00:00', '17:00:00', false, 1 FROM races WHERE name = 'Silver Falls Trail Challenge' LIMIT 1;
INSERT INTO packet_pickup_locations (race_id, location_name, address, city, state, pickup_date, start_time, end_time, is_race_day, sort_order)
SELECT id, 'Orchards Shelter - Race Day', '20024 Silver Falls Hwy SE', 'Sublimity', 'OR', '2026-02-28', '07:00:00', '08:30:00', true, 2 FROM races WHERE name = 'Silver Falls Trail Challenge' LIMIT 1;

-- Silver Falls Policies
INSERT INTO race_policies (race_id, policy_type, policy_text)
SELECT id, 'refund_policy', 'No refunds' FROM races WHERE name = 'Silver Falls Trail Challenge' LIMIT 1;
INSERT INTO race_policies (race_id, policy_type, policy_text)
SELECT id, 'deferral_policy', 'If contacted before the week of the race, can push entry to any other Bivouac Racing event of equal value within 12 months' FROM races WHERE name = 'Silver Falls Trail Challenge' LIMIT 1;

-- Silver Falls Themed Content (Ruck Challenge)
INSERT INTO themed_event_content (race_id, has_ruck_option, ruck_weight_requirement, ruck_weigh_in_info)
SELECT id, true, '35lb minimum for packs, 40lb minimum for vests', 'Weight check at packet pickup'
FROM races WHERE name = 'Silver Falls Trail Challenge' LIMIT 1;

-- =============================================
-- 4. BIGFOOT FUN RUN
-- =============================================
INSERT INTO races (
    name, race_date, race_time, city, state, venue, description,
    race_type, registration_url, registration_open, is_visible
) VALUES (
    'Bigfoot Fun Run',
    '2026-07-04',
    '09:00:00',
    'Yacolt',
    'WA',
    'Yacolt Recreation Park',
    'Join us for this annual tradition! The Town of Yacolt proudly hosts the Bigfoot Fun Run as part of an entire weekend of racing. The Bigfoot Fun Run features a 5K & 10K Run or Walk. The race weekend also includes the Hellz Bellz Ultra.',
    'run',
    'https://runsignup.com/Race/WA/Yacolt/BigfootFunRun',
    true,
    true
);

-- Bigfoot Content
INSERT INTO race_content (race_id, tagline, theme_type, venue_name, venue_address, venue_city, venue_state, venue_zip)
SELECT id, 'An annual Fourth of July tradition in Yacolt!', 'holiday', 'Yacolt Recreation Park', '105 E Yacolt Rd', 'Yacolt', 'WA', '98675'
FROM races WHERE name = 'Bigfoot Fun Run' LIMIT 1;

-- Bigfoot Distances
INSERT INTO race_distances (race_id, name, distance_value, distance_unit, sort_order)
SELECT id, '5K Run/Walk', 5, 'km', 1 FROM races WHERE name = 'Bigfoot Fun Run' LIMIT 1;
INSERT INTO race_distances (race_id, name, distance_value, distance_unit, sort_order)
SELECT id, '10K Run/Walk', 10, 'km', 2 FROM races WHERE name = 'Bigfoot Fun Run' LIMIT 1;

-- Bigfoot Packet Pickup
INSERT INTO packet_pickup_locations (race_id, location_name, address, city, state, pickup_date, start_time, end_time, is_race_day, notes, sort_order)
SELECT id, 'Registration booth near library', '105 E Yacolt Rd', 'Yacolt', 'WA', '2026-07-04', '07:00:00', '09:00:00', true, 'Day of race only. Day-of registration available 7:00-8:30 AM.', 1 FROM races WHERE name = 'Bigfoot Fun Run' LIMIT 1;

-- Bigfoot Special Categories
INSERT INTO special_participant_categories (race_id, category_name, pricing_rule, eligibility_description, age_limit, sort_order)
SELECT id, 'Kids 1-12', 'free', 'FREE entry for 5K', 12, 1 FROM races WHERE name = 'Bigfoot Fun Run' LIMIT 1;
INSERT INTO special_participant_categories (race_id, category_name, pricing_rule, discount_amount, eligibility_description, age_limit, sort_order)
SELECT id, 'Youth 13-17', 'discounted', 17.50, '$17.50 for 5K entry', 17, 2 FROM races WHERE name = 'Bigfoot Fun Run' LIMIT 1;

-- Bigfoot Themed Content
INSERT INTO themed_event_content (race_id, theme_name, theme_description, is_memorial_event)
SELECT id, 'Fourth of July', 'Part of Yacolt Rendezvous Days Festival - a whole weekend of racing and community celebration!', false
FROM races WHERE name = 'Bigfoot Fun Run' LIMIT 1;

-- =============================================
-- 5. HELLZ BELLZ ULTRA
-- =============================================
INSERT INTO races (
    name, race_date, race_time, city, state, venue, description,
    race_type, registration_url, registration_open, is_visible
) VALUES (
    'Hellz Bellz Ultra',
    '2026-07-05',
    '06:00:00',
    'Yacolt',
    'WA',
    'Yacolt Recreation Park (Start) / Moulton Falls (Finish)',
    'The Gateway Drug into the Ultramarathon World! Starting at Yacolt Recreation Park, the course takes you along the Bells Mountain trail. After passing through multiple clear cuts, stream crossings and stunning views of Mt St Helens, around the ten plus mile mark you''ll come to the Yacolt Burn Aid Station. Upon leaving the Yacolt Burn Aid Station you will embark on a counter clockwise loop on the Tarbell Trail. It will be twenty two plus miles of technical climbs, amazing waterfalls and breath taking views. Ring the bell after conquering the Bells!',
    'ultra',
    'https://ultrasignup.com/register.aspx?did=133015',
    true,
    true
);

-- Hellz Bellz Content
INSERT INTO race_content (race_id, edition_number, tagline, theme_type, venue_name, venue_address, venue_city, venue_state, venue_zip, venue_notes)
SELECT id, 4, 'Ring the bell after conquering the Bells!', 'ultra', 'Yacolt Recreation Park', '26612 E Hoag St', 'Yacolt', 'WA', '98675', 'Start at Yacolt Recreation Park, finish at Moulton Falls Arch Bridge by ringing the bell! Organized by Bivouac Racing. Part of Yacolt Rendezvous Days Festival.'
FROM races WHERE name = 'Hellz Bellz Ultra' LIMIT 1;

-- Hellz Bellz Distances
INSERT INTO race_distances (race_id, name, distance_value, distance_unit, description, sort_order)
SELECT id, 'Hellz Bellz Ultra - 50 Miles', 50, 'miles', 'Intense and grueling single track climb up Bells Mountain trail with stunning views of Mt St Helens', 1 FROM races WHERE name = 'Hellz Bellz Ultra' LIMIT 1;
INSERT INTO race_distances (race_id, name, distance_value, distance_unit, description, sort_order)
SELECT id, 'Purgatory Trail Marathon', 26.2, 'miles', 'Out & back utilizing the Bells Mtn Trail with roughly 6,000'' of ascent', 2 FROM races WHERE name = 'Hellz Bellz Ultra' LIMIT 1;

-- Hellz Bellz Beneficiaries
INSERT INTO race_beneficiaries (race_id, organization_name, description, is_primary, sort_order)
SELECT id, 'Washington Trail Association', '$5 from each registration donated', true, 1 FROM races WHERE name = 'Hellz Bellz Ultra' LIMIT 1;

-- Hellz Bellz Course Amenities (Aid Stations)
INSERT INTO course_amenities (race_id, amenity_type, location_description, notes)
SELECT id, 'aid_station', 'Yacolt Burn Aid Station - Mile 10-14', 'Major aid station with drop bag access' FROM races WHERE name = 'Hellz Bellz Ultra' LIMIT 1;
INSERT INTO course_amenities (race_id, amenity_type, location_description, notes)
SELECT id, 'aid_station', 'Grouse Vista Aid Station - Mile 17', NULL FROM races WHERE name = 'Hellz Bellz Ultra' LIMIT 1;
INSERT INTO course_amenities (race_id, amenity_type, location_description, notes)
SELECT id, 'aid_station', 'Tarbell Aid Station - Mile 27', NULL FROM races WHERE name = 'Hellz Bellz Ultra' LIMIT 1;

-- Hellz Bellz Policies
INSERT INTO race_policies (race_id, policy_type, policy_text)
SELECT id, 'cutoff_times', 'Must be leaving AS4 by 4:00 PM' FROM races WHERE name = 'Hellz Bellz Ultra' LIMIT 1;
INSERT INTO race_policies (race_id, policy_type, policy_text)
SELECT id, 'pacer_policy', 'Pacers allowed from Yacolt Burn - AS4 for descent to finish. Pacers not allowed to mule, but encouraged to inspire and motivate. Must check in with AS4 prior to descent.' FROM races WHERE name = 'Hellz Bellz Ultra' LIMIT 1;
INSERT INTO race_policies (race_id, policy_type, policy_text)
SELECT id, 'drop_bag', 'One SMALL drop bag allowed at Yacolt Burn Aid Station' FROM races WHERE name = 'Hellz Bellz Ultra' LIMIT 1;
INSERT INTO race_policies (race_id, policy_type, policy_text)
SELECT id, 'camping', 'Tent space camping available at Yacolt Recreation Park. Opens 2:00 PM Saturday, July 4th. Included in registration.' FROM races WHERE name = 'Hellz Bellz Ultra' LIMIT 1;

-- =============================================
-- 6. SANTA'S HOLIDAY HUSTLE
-- =============================================
INSERT INTO races (
    name, race_date, race_time, city, state, venue, description,
    race_type, registration_url, registration_open, is_visible
) VALUES (
    'Santa''s Holiday Hustle 5K & Dirty Santa Trail Run 10K',
    '2026-12-12',
    '09:00:00',
    'Camas',
    'WA',
    '625 NE 4th Ave',
    'Join us to celebrate the holidays in an active and festive way! Race starts at 9 am followed by cookies, cocoa and Santa! Choose between T-Shirt, Santa Costume (full suit), or Hat & Gloves in registration.',
    'run',
    'https://runsignup.com/Race/WA/Camas/SantasPosse5KRunWalk',
    true,
    true
);

-- Santa's Content
INSERT INTO race_content (race_id, edition_number, tagline, theme_type, venue_address, venue_city, venue_state, venue_zip)
SELECT id, 6, 'Racing into the Holiday Spirit!', 'holiday', '625 NE 4th Ave', 'Camas', 'WA', '98607'
FROM races WHERE name LIKE 'Santa''s Holiday Hustle%' LIMIT 1;

-- Santa's Distances
INSERT INTO race_distances (race_id, name, distance_value, distance_unit, sort_order)
SELECT id, '5K Run/Walk', 5, 'km', 1 FROM races WHERE name LIKE 'Santa''s Holiday Hustle%' LIMIT 1;
INSERT INTO race_distances (race_id, name, distance_value, distance_unit, sort_order)
SELECT id, 'Virtual 5K', 5, 'km', 2 FROM races WHERE name LIKE 'Santa''s Holiday Hustle%' LIMIT 1;
INSERT INTO race_distances (race_id, name, distance_value, distance_unit, sort_order)
SELECT id, 'Dirty Santa 10K Trail Run', 10, 'km', 3 FROM races WHERE name LIKE 'Santa''s Holiday Hustle%' LIMIT 1;

-- Santa's Special Categories
INSERT INTO special_participant_categories (race_id, category_name, pricing_rule, eligibility_description, age_limit, sort_order)
SELECT id, 'Kids 12 and Under', 'free', 'FREE entry', 12, 1 FROM races WHERE name LIKE 'Santa''s Holiday Hustle%' LIMIT 1;
INSERT INTO special_participant_categories (race_id, category_name, pricing_rule, discount_percentage, eligibility_description, age_limit, sort_order)
SELECT id, 'Youth 13-17', 'discounted', 50, '50% discount', 17, 2 FROM races WHERE name LIKE 'Santa''s Holiday Hustle%' LIMIT 1;

-- Santa's Themed Content
INSERT INTO themed_event_content (race_id, theme_name, theme_description, costume_contest, costume_prize_description)
SELECT id, 'Christmas', 'Choose between T-Shirt, Santa Costume (full suit), or Hat & Gloves in registration!', true, 'Santa costume included with registration - full suit available!'
FROM races WHERE name LIKE 'Santa''s Holiday Hustle%' LIMIT 1;

-- =============================================
-- DONE! Race data seeded successfully.
-- =============================================
