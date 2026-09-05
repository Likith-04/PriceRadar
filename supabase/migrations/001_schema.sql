-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Fetching product...',
  current_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'USD',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Price history table
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint for upsert functionality (per user, per url)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_user_url_unique'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_user_url_unique UNIQUE (user_id, url);
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if necessary to allow idempotent runs
DROP POLICY IF EXISTS "Users can view their own products" ON products;
DROP POLICY IF EXISTS "Users can insert their own products" ON products;
DROP POLICY IF EXISTS "Users can update their own products" ON products;
DROP POLICY IF EXISTS "Users can delete their own products" ON products;

-- Policies for products
CREATE POLICY "Users can view their own products"
  ON products FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products"
  ON products FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products"
  ON products FOR DELETE
  USING (auth.uid() = user_id);

-- Drop existing price_history policies
DROP POLICY IF EXISTS "Users can view price history for their products" ON price_history;
DROP POLICY IF EXISTS "Users can insert price history for their products" ON price_history;
DROP POLICY IF EXISTS "Users can delete price history for their products" ON price_history;

-- Policies for price_history (Fixed: includes INSERT and DELETE)
CREATE POLICY "Users can view price history for their products"
  ON price_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = price_history.product_id
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert price history for their products"
  ON price_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = price_history.product_id
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete price history for their products"
  ON price_history FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = price_history.product_id
      AND products.user_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS products_user_id_idx ON products(user_id);
CREATE INDEX IF NOT EXISTS price_history_product_id_idx ON price_history(product_id);
CREATE INDEX IF NOT EXISTS price_history_checked_at_idx ON price_history(checked_at DESC);
