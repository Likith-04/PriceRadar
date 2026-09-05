-- Migration 004: Multi-Retailer Support (Amazon India, Flipkart, Reliance Digital, Croma)

-- 1. Add retailer column to products if not exists
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS retailer TEXT;

-- 2. Safely backfill existing records based on URL pattern (safe fallback: 'amazon')
UPDATE products 
SET retailer = CASE
  WHEN url ILIKE '%flipkart.com%' OR url ILIKE '%fkrt.it%' THEN 'flipkart'
  WHEN url ILIKE '%reliancedigital.in%' THEN 'reliance_digital'
  WHEN url ILIKE '%croma.com%' THEN 'croma'
  ELSE 'amazon'
END
WHERE retailer IS NULL;

-- 3. Set default to 'amazon' and mark as NOT NULL
ALTER TABLE products 
  ALTER COLUMN retailer SET NOT NULL,
  ALTER COLUMN retailer SET DEFAULT 'amazon';

-- 4. Add check constraint for allowed retailers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_retailer_check'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_retailer_check 
      CHECK (retailer IN ('amazon', 'flipkart', 'reliance_digital', 'croma'));
  END IF;
END $$;

-- 5. Create index on retailer for fast dashboard filtering
CREATE INDEX IF NOT EXISTS products_retailer_idx ON products(retailer);
