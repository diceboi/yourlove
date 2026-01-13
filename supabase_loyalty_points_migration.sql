-- Loyalty Points System Migration
-- Adds points tracking to user profiles and transaction history
-- Run this in Supabase SQL Editor

-- 1. Add points column to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

-- 2. Create index for points queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_points 
ON user_profiles(points);

-- 3. Create loyalty_points_transactions table
CREATE TABLE IF NOT EXISTS loyalty_points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  points_earned INTEGER DEFAULT 0,
  points_spent INTEGER DEFAULT 0,
  balance_after INTEGER NOT NULL,
  transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('purchase', 'admin_adjustment', 'redemption', 'expiry')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_user 
ON loyalty_points_transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_order 
ON loyalty_points_transactions(order_id);

CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_created 
ON loyalty_points_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_type 
ON loyalty_points_transactions(transaction_type);

-- 5. Create points_settings table
CREATE TABLE IF NOT EXISTS points_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  points_per_currency INTEGER DEFAULT 100 CHECK (points_per_currency > 0),
  minimum_order_value INTEGER DEFAULT 0,
  points_expiry_days INTEGER,
  redemption_rate INTEGER DEFAULT 1 CHECK (redemption_rate > 0),
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Insert default settings
INSERT INTO points_settings (points_per_currency, minimum_order_value, redemption_rate, is_active)
VALUES (100, 0, 1, true)
ON CONFLICT (id) DO NOTHING;

-- 7. Add comments for documentation
COMMENT ON COLUMN user_profiles.points IS 'Current loyalty points balance';
COMMENT ON TABLE loyalty_points_transactions IS 'Transaction history for loyalty points';
COMMENT ON TABLE points_settings IS 'Global settings for loyalty points system';

-- 8. Create RLS policies for loyalty_points_transactions
ALTER TABLE loyalty_points_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "users_view_own_transactions"
ON loyalty_points_transactions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins can view all transactions
CREATE POLICY "admins_view_all_transactions"
ON loyalty_points_transactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'superadmin')
  )
);

-- Only system can insert (via backend)
CREATE POLICY "system_insert_transactions"
ON loyalty_points_transactions
FOR INSERT
TO authenticated
WITH CHECK (false); -- Will be handled by backend actions only

-- 9. Create RLS policies for points_settings
ALTER TABLE points_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings
CREATE POLICY "anyone_read_settings"
ON points_settings
FOR SELECT
TO authenticated
USING (true);

-- Only admins can update settings
CREATE POLICY "admins_update_settings"
ON points_settings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'superadmin')
  )
);

-- Verification query - check if migration was successful
SELECT 
  'user_profiles points column' as check_item,
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'points'
  ) as exists;

SELECT 
  'loyalty_points_transactions table' as check_item,
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'loyalty_points_transactions'
  ) as exists;

SELECT 
  'points_settings table' as check_item,
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'points_settings'
  ) as exists;

-- Show current settings
SELECT * FROM points_settings LIMIT 1;
