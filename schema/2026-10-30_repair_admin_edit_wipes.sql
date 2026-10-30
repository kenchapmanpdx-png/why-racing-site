-- Repair: data wiped by the old admin edit form (2026-10-29 / 2026-10-30)
--
-- Cause: the edit form never loaded Race Type or Registration URL, so every save
-- set race_type='running' and registration_url=NULL. It also reset distance
-- prices to 0. Fixed in pages/admin/races.html (same commit).
--
-- Source of each restored value:
--   registration_url  the race's other edition (parent or next-year copy)
--   race_type         AUDIT-2026-05-28.md M-1: these 5 events are triathlons
--   base_price        Resolution Run 2027 copy (made 2026-05-29 from the original)
--
-- Every statement only touches a row still in its wrong state, so re-running is
-- harmless and nothing edited since is overwritten.

-- Registration URLs (9 races)
UPDATE public.races SET registration_url = 'https://runsignup.com/Race/OR/Gaston/HAGGLakeTriathlonMultiSportsFestival'
 WHERE slug = 'hagg-lake-triathlon-trail-festival-2027' AND registration_url IS NULL;
UPDATE public.races SET registration_url = 'https://www.xdogadventures.org/maupin-daze'
 WHERE slug = 'maupin-daze' AND registration_url IS NULL;
UPDATE public.races SET registration_url = 'https://www.xdogadventures.org/mccubbins-gulch'
 WHERE slug = 'mccubbins-gulch' AND registration_url IS NULL;
UPDATE public.races SET registration_url = 'https://www.xdogadventures.org/mt-hood-scramble'
 WHERE slug = 'mt-hood-scramble' AND registration_url IS NULL;
UPDATE public.races SET registration_url = 'https://whyracingevents.com/pacific-coast-running-festival/'
 WHERE slug = 'pacific-coast-running-festival' AND registration_url IS NULL;
UPDATE public.races SET registration_url = 'https://whyracingevents.com/pacific-crest-endurance/'
 WHERE slug = 'pacific-crest-endurance-sports-festival' AND registration_url IS NULL;
UPDATE public.races SET registration_url = 'https://whyracingevents.com/reflection-run/'
 WHERE slug = 'reflection-run' AND registration_url IS NULL;
UPDATE public.races SET registration_url = 'https://runsignup.com/Race/WA/Washougal/ScaryRun'
 WHERE slug = 'scary-run' AND registration_url IS NULL;
UPDATE public.races SET registration_url = 'https://www.bivouacracing.com/silverfalls'
 WHERE slug = 'silver-falls-trail-challenge' AND registration_url IS NULL;

-- Race type: the 5 triathlon events, every edition still marked 'running'
UPDATE public.races SET race_type = 'triathlon'
 WHERE race_type = 'running'
   AND slug IN (
     'pdx-triathlon-festival', 'pdx-triathlon-festival-2027',
     'pacific-crest-endurance-sports-festival', 'pacific-crest-endurance-sports-festival-2027',
     'hagg-lake-triathlon-trail-festival', 'hagg-lake-triathlon-trail-festival-2027',
     'columbia-river-triathlon-endurance-sports-festival', 'columbia-river-triathlon-endurance-sports-festival-2027',
     'girlfriends-all-women-s-triathlon-fitness-festival', 'girlfriends-all-women-s-triathlon-fitness-festival-2027'
   );

-- Resolution Run prices (5K $45, 10K $55)
UPDATE public.race_distances d SET base_price = 45
  FROM public.races r
 WHERE d.race_id = r.id AND r.slug = 'resolution-run' AND d.name = '5K Run/Walk' AND d.base_price = 0;
UPDATE public.race_distances d SET base_price = 55
  FROM public.races r
 WHERE d.race_id = r.id AND r.slug = 'resolution-run' AND d.name = '10K Run/Walk' AND d.base_price = 0;

-- Other data errors found during the review (drafts; not caused by the edit form)
-- Couve Clover Run 2027 draft pointed at the Santa's Posse sign-up page
UPDATE public.races SET registration_url = 'https://runsignup.com/Race/WA/Vancouver/CouveCloverRun'
 WHERE slug = 'couve-clover-run-2027' AND registration_url = 'https://runsignup.com/Race/WA/Camas/SantasPosse5KRunWalk';
-- Scary Run: the 15K distance was typed '5K'
UPDATE public.race_distances d SET distance_type = '15K'
  FROM public.races r
 WHERE d.race_id = r.id AND r.slug IN ('scary-run', 'scary-run-2027') AND d.name = '15K' AND d.distance_type = '5K';
-- Pacific Coast Running Festival (2026 draft): each distance was listed twice
DELETE FROM public.race_distances d
 USING (
   SELECT rd.id, row_number() OVER (PARTITION BY rd.race_id, rd.name, rd.distance_type, rd.distance_value ORDER BY rd.sort_order, rd.id) AS n
     FROM public.race_distances rd JOIN public.races r ON r.id = rd.race_id
    WHERE r.slug = 'pacific-coast-running-festival'
 ) dup
 WHERE d.id = dup.id AND dup.n > 1;

-- Check (should list nothing still wiped)
SELECT slug, race_type, registration_url FROM public.races
 WHERE registration_url IS NULL
    OR (race_type = 'running' AND slug LIKE ANY (ARRAY['pdx-triathlon%','pacific-crest%','hagg-lake%','columbia-river%','girlfriends-all-women%']));
