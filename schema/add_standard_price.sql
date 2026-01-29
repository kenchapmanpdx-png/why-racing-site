-- Add standard_price column to race_distances table
ALTER TABLE race_distances ADD COLUMN IF NOT EXISTS standard_price DECIMAL(10,2);

-- Optional: Initial population (can also be done via script)
-- UPDATE race_distances SET standard_price = base_price + 15 WHERE standard_price IS NULL;
