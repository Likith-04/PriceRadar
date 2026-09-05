-- Migration 003: Upgrade to Target Price Tracking, Asynchronous States, and Alert Logging

-- 1. Add target_price, status, error_message, last_alerted_price, last_alerted_at to products
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS target_price NUMERIC(10,2) CHECK (target_price IS NULL OR target_price > 0),
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('PENDING', 'PROCESSING', 'ACTIVE', 'FAILED')),
  ADD COLUMN IF NOT EXISTS error_message TEXT,
  ADD COLUMN IF NOT EXISTS last_alerted_price NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS last_alerted_at TIMESTAMP WITH TIME ZONE;

-- 2. Create index on status for faster worker and UI queries
CREATE INDEX IF NOT EXISTS products_status_idx ON products(status);

-- 3. Create price_alerts audit log table
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  old_price NUMERIC(10,2),
  new_price NUMERIC(10,2) NOT NULL,
  target_price NUMERIC(10,2),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'SENT'
);

-- Enable RLS on price_alerts
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own alerts" ON price_alerts;
DROP POLICY IF EXISTS "Users can insert their own alerts" ON price_alerts;

-- Policies for price_alerts
CREATE POLICY "Users can view their own alerts"
  ON price_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alerts"
  ON price_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes for price_alerts
CREATE INDEX IF NOT EXISTS price_alerts_user_id_idx ON price_alerts(user_id);
CREATE INDEX IF NOT EXISTS price_alerts_product_id_idx ON price_alerts(product_id);
CREATE INDEX IF NOT EXISTS price_alerts_sent_at_idx ON price_alerts(sent_at DESC);
