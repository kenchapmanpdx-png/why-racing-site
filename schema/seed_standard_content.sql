-- =============================================
-- Why Racing Events - Standard FAQ Templates
-- Run AFTER race_content_schema.sql
-- =============================================

-- Universal FAQs (Apply to ALL events)
INSERT INTO race_faqs (race_id, question, answer, category, sort_order)
SELECT r.id, 
    'Can I register on Race Day?',
    'Race day registration may be available if the event is not sold out. Check the registration page for availability. Prices are typically higher for race day registration.',
    'registration',
    1
FROM races r WHERE r.is_visible = true;

INSERT INTO race_faqs (race_id, question, answer, category, sort_order)
SELECT r.id,
    'Can my friend pick up my packet?',
    'Yes, but they must bring a signed Authorization Form and a copy of your photo ID. Download the form from the registration page.',
    'registration',
    2
FROM races r WHERE r.is_visible = true;

INSERT INTO race_faqs (race_id, question, answer, category, sort_order)
SELECT r.id,
    'Can I get a refund?',
    'Please see our Registration Policies page for our refund, transfer, and deferral policies.',
    'registration',
    3
FROM races r WHERE r.is_visible = true;

INSERT INTO race_faqs (race_id, question, answer, category, sort_order)
SELECT r.id,
    'Can I transfer my registration to another person?',
    'Transfers are allowed up to 14 days before the event for a $10 fee. Contact registration@whyracingevents.com.',
    'registration',
    4
FROM races r WHERE r.is_visible = true;

INSERT INTO race_faqs (race_id, question, answer, category, sort_order)
SELECT r.id,
    'Are headphones/earbuds allowed?',
    'We prefer athletes NOT use music devices for safety. If you choose to use one, keep only ONE earbud in and volume low so you can hear course marshal instructions.',
    'rules',
    5
FROM races r WHERE r.is_visible = true;

INSERT INTO race_faqs (race_id, question, answer, category, sort_order)
SELECT r.id,
    'Are dogs allowed on course?',
    'Due to insurance requirements, only Service Dogs are allowed on course and must start at the end of the race after all other participants.',
    'rules',
    6
FROM races r WHERE r.is_visible = true;

INSERT INTO race_faqs (race_id, question, answer, category, sort_order)
SELECT r.id,
    'Are strollers allowed?',
    'Yes, but due to insurance requirements, strollers must start at the end of the race after all other participants. Please be careful navigating around other athletes.',
    'rules',
    7
FROM races r WHERE r.is_visible = true;

INSERT INTO race_faqs (race_id, question, answer, category, sort_order)
SELECT r.id,
    'Will you offer bag check?',
    'Yes! Leave items at the designated Bag Check area. Label your bag with your name and bib number. Show your bib to retrieve. We cannot be responsible for valuables.',
    'logistics',
    8
FROM races r WHERE r.is_visible = true;

INSERT INTO race_faqs (race_id, question, answer, category, sort_order)
SELECT r.id,
    'What if my shirt doesn''t fit?',
    'We''ll have a Shirt Swap area after the race. We cannot guarantee availability but will do our best to accommodate exchanges.',
    'logistics',
    9
FROM races r WHERE r.is_visible = true;

INSERT INTO race_faqs (race_id, question, answer, category, sort_order)
SELECT r.id,
    'How many porta-potties will there be?',
    'We order plenty for the start/finish area. Expect lines 15-20 minutes before race start. Additional facilities are available on course approximately every 2 miles.',
    'logistics',
    10
FROM races r WHERE r.is_visible = true;

INSERT INTO race_faqs (race_id, question, answer, category, sort_order)
SELECT r.id,
    'Will there be awards for walkers?',
    'We cannot provide walker-specific awards due to the inability to verify walking-only adherence during the event.',
    'awards',
    11
FROM races r WHERE r.is_visible = true;

-- =============================================
-- Standard Policies for ALL Events
-- =============================================

INSERT INTO race_policies (race_id, policy_type, policy_text)
SELECT r.id,
    'headphone_policy',
    'We prefer athletes NOT use music devices to maximize safety, ensure a fair competitive environment, and hear course marshal instructions. If you choose to use a personal music device: Use only ONE earbud - keep one ear open at all times. Keep volume to a minimum. Two earbuds = immediate disqualification. This policy is strictly enforced for athlete safety.'
FROM races r WHERE r.is_visible = true
ON CONFLICT (race_id, policy_type) DO NOTHING;

INSERT INTO race_policies (race_id, policy_type, policy_text)
SELECT r.id,
    'dog_policy',
    'Due to insurance requirements, only Service Dogs are allowed on course. Service dogs must start at the end of the race after all other participants have started.'
FROM races r WHERE r.is_visible = true
ON CONFLICT (race_id, policy_type) DO NOTHING;

INSERT INTO race_policies (race_id, policy_type, policy_text)
SELECT r.id,
    'stroller_policy',
    'Strollers are allowed but must start at the end of the race after all other participants for insurance and safety reasons. Note: Longer distances may be challenging with young children, especially in poor weather. Please be very careful navigating around other athletes on narrow sections. Your chip time won''t start until you cross the timing mat, so starting last won''t significantly affect your recorded time.'
FROM races r WHERE r.is_visible = true
ON CONFLICT (race_id, policy_type) DO NOTHING;

INSERT INTO race_policies (race_id, policy_type, policy_text)
SELECT r.id,
    'bag_check',
    'Free bag check is available at the start/finish area. Please label your bag with your name and bib number. Show your bib to retrieve your bag after the race. We cannot be responsible for lost or stolen items - please leave valuables in your car.'
FROM races r WHERE r.is_visible = true
ON CONFLICT (race_id, policy_type) DO NOTHING;

INSERT INTO race_policies (race_id, policy_type, policy_text)
SELECT r.id,
    'shirt_swap',
    'We will have a Shirt Swap area set up after the race. We cannot guarantee availability of all sizes but will do our best to accommodate exchanges. Please bring your original shirt to swap.'
FROM races r WHERE r.is_visible = true
ON CONFLICT (race_id, policy_type) DO NOTHING;

-- =============================================
-- Standard Age Groups for ALL Events
-- =============================================

INSERT INTO award_categories (race_id, category_type, category_name, min_age, max_age, awards_depth, sort_order)
SELECT r.id, 'age_group', '9 and under', 0, 9, 3, 1 FROM races r WHERE r.is_visible = true;

INSERT INTO award_categories (race_id, category_type, category_name, min_age, max_age, awards_depth, sort_order)
SELECT r.id, 'age_group', '10-14', 10, 14, 3, 2 FROM races r WHERE r.is_visible = true;

INSERT INTO award_categories (race_id, category_type, category_name, min_age, max_age, awards_depth, sort_order)
SELECT r.id, 'age_group', '15-19', 15, 19, 3, 3 FROM races r WHERE r.is_visible = true;

INSERT INTO award_categories (race_id, category_type, category_name, min_age, max_age, awards_depth, sort_order)
SELECT r.id, 'age_group', '20-24', 20, 24, 3, 4 FROM races r WHERE r.is_visible = true;

INSERT INTO award_categories (race_id, category_type, category_name, min_age, max_age, awards_depth, sort_order)
SELECT r.id, 'age_group', '25-29', 25, 29, 3, 5 FROM races r WHERE r.is_visible = true;

INSERT INTO award_categories (race_id, category_type, category_name, min_age, max_age, awards_depth, sort_order)
SELECT r.id, 'age_group', '30-34', 30, 34, 3, 6 FROM races r WHERE r.is_visible = true;

INSERT INTO award_categories (race_id, category_type, category_name, min_age, max_age, awards_depth, sort_order)
SELECT r.id, 'age_group', '35-39', 35, 39, 3, 7 FROM races r WHERE r.is_visible = true;

INSERT INTO award_categories (race_id, category_type, category_name, min_age, max_age, awards_depth, sort_order)
SELECT r.id, 'age_group', '40-44', 40, 44, 3, 8 FROM races r WHERE r.is_visible = true;

INSERT INTO award_categories (race_id, category_type, category_name, min_age, max_age, awards_depth, sort_order)
SELECT r.id, 'age_group', '45-49', 45, 49, 3, 9 FROM races r WHERE r.is_visible = true;

INSERT INTO award_categories (race_id, category_type, category_name, min_age, max_age, awards_depth, sort_order)
SELECT r.id, 'age_group', '50-54', 50, 54, 3, 10 FROM races r WHERE r.is_visible = true;

INSERT INTO award_categories (race_id, category_type, category_name, min_age, max_age, awards_depth, sort_order)
SELECT r.id, 'age_group', '55-59', 55, 59, 3, 11 FROM races r WHERE r.is_visible = true;

INSERT INTO award_categories (race_id, category_type, category_name, min_age, max_age, awards_depth, sort_order)
SELECT r.id, 'age_group', '60-64', 60, 64, 3, 12 FROM races r WHERE r.is_visible = true;

INSERT INTO award_categories (race_id, category_type, category_name, min_age, max_age, awards_depth, sort_order)
SELECT r.id, 'age_group', '65-69', 65, 69, 3, 13 FROM races r WHERE r.is_visible = true;

INSERT INTO award_categories (race_id, category_type, category_name, min_age, max_age, awards_depth, sort_order)
SELECT r.id, 'age_group', '70-74', 70, 74, 3, 14 FROM races r WHERE r.is_visible = true;

INSERT INTO award_categories (race_id, category_type, category_name, min_age, max_age, awards_depth, sort_order)
SELECT r.id, 'age_group', '75-79', 75, 79, 3, 15 FROM races r WHERE r.is_visible = true;

INSERT INTO award_categories (race_id, category_type, category_name, min_age, max_age, awards_depth, sort_order)
SELECT r.id, 'age_group', '80+', 80, 120, 3, 16 FROM races r WHERE r.is_visible = true;

-- =============================================
-- Clydesdale & Athena Categories
-- =============================================

INSERT INTO award_categories (race_id, category_type, category_name, weight_requirement, gender_restriction, awards_depth, notes, sort_order)
SELECT r.id, 'clydesdale', 'Clydesdale (220+ lbs)', '220+ pounds', 'male', 3, 'Not eligible for age group awards', 17 FROM races r WHERE r.is_visible = true;

INSERT INTO award_categories (race_id, category_type, category_name, weight_requirement, gender_restriction, awards_depth, notes, sort_order)
SELECT r.id, 'athena', 'Athena (165+ lbs)', '165+ pounds', 'female', 3, 'Not eligible for age group awards', 18 FROM races r WHERE r.is_visible = true;

-- =============================================
-- DONE! Standard FAQs, policies, and award categories seeded.
-- =============================================
