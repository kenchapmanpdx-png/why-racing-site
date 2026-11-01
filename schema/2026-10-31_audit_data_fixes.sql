-- Why Racing: data fixes from the 2026-10-31 site audit
--
-- HOW TO RUN: Supabase dashboard > project qotqzsbpokvjsgueewdi > SQL Editor >
-- New query > paste this whole file > Run. Safe to re-run: every statement only
-- touches rows still in their old state.
--
-- Sources:
--   Resolution Run   RunSignUp WREResolutionRun shows Saturday January 9, 2027
--   Spring Classic   RunSignUp SpringClassicDuathlonHalf10k5k shows Saturday May 1, 2027
--   Hellz Bellz      UltraSignup did=133015 is the July 5, 2026 race; eid=13665 always
--                    opens the latest edition
--   Girlfriends 6K   RunSignUp GirlfriendsRun lists 6K Run / 6K Walk
--   Hero images      all 9 /images/Scrapedimages/... hero paths return 404 on the live site
--   Coaches          excel-tri.com and rcendurance.com no longer exist (no DNS)

begin;

-- 1. Race dates (match RunSignUp)
update races set race_date = '2027-01-09'
 where id = '5bc6592a-8f9f-42ab-ac3c-133b29d1883e' and race_date = '2027-01-10';  -- Resolution Run
update races set race_date = '2027-05-01'
 where id = '4121f0da-7d0d-40b0-aa72-8bfe84bde8f3' and race_date = '2027-05-02';  -- Spring Classic

-- 2. McCubbins Gulch 2027 draft: 2nd Sunday of July like 2026 (was Monday Jul 12)
update races set race_date = '2027-07-11'
 where id = '4a647c24-23fe-4bad-9134-3922f6b3468b' and race_date = '2027-07-12';

-- 3. Hellz Bellz register link: event-level link that always opens the latest edition
update races set registration_url = 'https://ultrasignup.com/register.aspx?eid=13665'
 where id = '5fc93199-4102-45ec-b813-2bce475424b0'
   and registration_url = 'https://ultrasignup.com/register.aspx?did=133015';

-- 4. Stale pre-race instructions on 2027 races (cards now open registration instead)
--    Resolution Run: "PRE RACE INSTRUCTIONS - Resolution Run 2026" Google Doc
--    Couve Clover:   "PRE RACE INSTRUCTIONS - Couve Clover 2025" PDF
update races set instructions_pdf_url = null
 where id = '5bc6592a-8f9f-42ab-ac3c-133b29d1883e'
   and instructions_pdf_url = 'https://docs.google.com/document/d/1rxxXAqWi-XvVoxuJTGrQ5AWW2Em04f2H/edit';
update races set instructions_pdf_url = null
 where id = 'e0558e0f-bbfb-422e-a8c9-74207a9f54c3'
   and instructions_pdf_url = 'https://drive.google.com/file/d/1wcYOO2HilPownIRetXOVBS2Et4Zzb3-r/view';

-- 5. Hero image paths that point at files never deployed (all 404). Pages already
--    fall back to the uploaded thumbnail; upload a wide hero in the Staff Portal.
update races set hero_image_url = null
 where deleted_at is null and hero_image_url like '/images/Scrapedimages/%';

-- 6. Girlfriends Run: add the missing 6K distance
update race_distances set sort_order = sort_order + 1
 where race_id = 'b16eb893-9edf-4a1f-82e9-683a82ceb6ad'
   and not exists (select 1 from race_distances
                    where race_id = 'b16eb893-9edf-4a1f-82e9-683a82ceb6ad' and name = '6K');
insert into race_distances (race_id, name, distance_value, distance_unit, distance_type, sort_order, base_price)
select 'b16eb893-9edf-4a1f-82e9-683a82ceb6ad', '6K', '3.7 miles', 'km', '6K', 0, 0
 where not exists (select 1 from race_distances
                    where race_id = 'b16eb893-9edf-4a1f-82e9-683a82ceb6ad' and name = '6K');

-- 7. Half marathons stored as a bare "13.1" got the default unit km
update race_distances set distance_unit = 'miles'
 where distance_value = '13.1' and distance_unit = 'km'
   and (name ilike '%marathon%' or distance_type ilike '%marathon%');

-- 8. Coaches whose websites are gone: hidden (not deleted)
update training_clubs set is_active = false
 where id in ('e31644b1-4b78-4cd9-8722-39ac2206a2d4',   -- ExceL-Tri Performance
              'ea62896e-2bbd-4b62-afc9-2593bc898484');  -- RC Endurance

commit;

-- Check (should show the new values)
select name, race_date, registration_url, instructions_pdf_url, hero_image_url
  from races
 where id in ('5bc6592a-8f9f-42ab-ac3c-133b29d1883e', '4121f0da-7d0d-40b0-aa72-8bfe84bde8f3',
              '4a647c24-23fe-4bad-9134-3922f6b3468b', '5fc93199-4102-45ec-b813-2bce475424b0',
              'e0558e0f-bbfb-422e-a8c9-74207a9f54c3');

-- UNDO (only if needed): old values, run individually
-- update races set race_date = '2027-01-10' where id = '5bc6592a-8f9f-42ab-ac3c-133b29d1883e';
-- update races set race_date = '2027-05-02' where id = '4121f0da-7d0d-40b0-aa72-8bfe84bde8f3';
-- update races set race_date = '2027-07-12' where id = '4a647c24-23fe-4bad-9134-3922f6b3468b';
-- update races set registration_url = 'https://ultrasignup.com/register.aspx?did=133015' where id = '5fc93199-4102-45ec-b813-2bce475424b0';
-- update races set instructions_pdf_url = 'https://docs.google.com/document/d/1rxxXAqWi-XvVoxuJTGrQ5AWW2Em04f2H/edit' where id = '5bc6592a-8f9f-42ab-ac3c-133b29d1883e';
-- update races set instructions_pdf_url = 'https://drive.google.com/file/d/1wcYOO2HilPownIRetXOVBS2Et4Zzb3-r/view' where id = 'e0558e0f-bbfb-422e-a8c9-74207a9f54c3';
-- update races set hero_image_url = '/images/Scrapedimages/Hagg-Lake-Why-Home.jpg' where id = '78374509-9962-480b-b483-fae0a36c1258';
-- update races set hero_image_url = '/images/Scrapedimages/Screenshot-2022-04-14-173337.png' where id = '5fc93199-4102-45ec-b813-2bce475424b0';
-- update races set hero_image_url = '/images/Scrapedimages/Photo-for-Home-Page-Website-RFS-pdf.jpg' where id = '67609924-8391-47a9-88d2-14a277a4e782';
-- update races set hero_image_url = '/images/Scrapedimages/pdx-tri-banner.jpg' where id = 'f8694da0-6cb6-45c0-9a12-0792d58c1586';
-- update races set hero_image_url = '/images/Scrapedimages/reflectionruncover-1200-x-500-px.png' where id = '6f70d5bc-de4b-43b0-8d2c-b29cb47bfe04';
-- update races set hero_image_url = '/images/Scrapedimages/Resolution-Run-Website-Home-Page-Tile-Photo.png' where id = '5bc6592a-8f9f-42ab-ac3c-133b29d1883e';
-- update races set hero_image_url = '/images/Scrapedimages/santa-cover-1200-x-500-px.png' where id = 'd74d60f1-40ac-47b6-964b-1ff132ac2fab';
-- update races set hero_image_url = '/images/Scrapedimages/scary-run-banner.jpg' where id = 'aa9f9d6c-c230-49d9-a09b-446d9400cb3e';
-- update races set hero_image_url = '/images/Scrapedimages/spring-classic-photo-2.png' where id = '4121f0da-7d0d-40b0-aa72-8bfe84bde8f3';
-- delete from race_distances where race_id = 'b16eb893-9edf-4a1f-82e9-683a82ceb6ad' and name = '6K';
-- update training_clubs set is_active = true where id in ('e31644b1-4b78-4cd9-8722-39ac2206a2d4', 'ea62896e-2bbd-4b62-afc9-2593bc898484');
