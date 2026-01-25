-- =============================================
-- SEED PRICING DATA TO TEST DISPLAY LOGIC
-- =============================================

-- 1. Add Distances to "Resolution Run" if missing
DO $$
DECLARE
    res_race_id UUID;
    dist_5k_id UUID;
    dist_10k_id UUID;
BEGIN
    SELECT id INTO res_race_id FROM races WHERE name ILIKE '%Resolution%' LIMIT 1;

    IF res_race_id IS NOT NULL THEN
        -- Insert 5K
        INSERT INTO race_distances (race_id, name, distance_value, base_price, sort_order)
        VALUES (res_race_id, '5K', '3.1 miles', 45.00, 1)
        ON CONFLICT DO NOTHING
        RETURNING id INTO dist_5k_id;

        -- If didn't insert (conflict), get existing
        IF dist_5k_id IS NULL THEN
            SELECT id INTO dist_5k_id FROM race_distances WHERE race_id = res_race_id AND name = '5K';
        END IF;

        -- Seed Pricing for 5K
        -- Tier 1: Early Bird (Now until next month)
        INSERT INTO pricing_tiers (race_id, distance_id, tier_name, price, start_date, end_date)
        VALUES (res_race_id, dist_5k_id, 'Early Bird', 45.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '14 days');

        -- Tier 2: Standard (After that)
        INSERT INTO pricing_tiers (race_id, distance_id, tier_name, price, start_date, end_date)
        VALUES (res_race_id, dist_5k_id, 'Standard', 60.00, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '60 days');
    END IF;
END $$;


-- 2. Add Pricing to "White River Snowshoe" (which already has distances)
DO $$
DECLARE
    wr_race_id UUID;
    active_dist_id UUID;
BEGIN
    SELECT id INTO wr_race_id FROM races WHERE name ILIKE '%White River%' LIMIT 1;
    
    -- Get just one distance to price
    SELECT id INTO active_dist_id FROM race_distances WHERE race_id = wr_race_id LIMIT 1;

    IF wr_race_id IS NOT NULL AND active_dist_id IS NOT NULL THEN
        -- Current Price: $35 (expires in 5 days! - should trigger countdown)
        INSERT INTO pricing_tiers (race_id, distance_id, tier_name, price, start_date, end_date)
        VALUES (wr_race_id, active_dist_id, 'Super Early Bird', 35.00, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '5 days');

        -- Future Price: $55
        INSERT INTO pricing_tiers (race_id, distance_id, tier_name, price, start_date, end_date)
        VALUES (wr_race_id, active_dist_id, 'Standard', 55.00, CURRENT_DATE + INTERVAL '6 days', CURRENT_DATE + INTERVAL '90 days');
    END IF;
END $$;
