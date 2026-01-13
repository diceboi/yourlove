-- User Roles Migration
-- Adds role column to user_profiles table with role-based access control
-- Run this in Supabase SQL Editor

-- 1. Add role column with default value
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- 2. Add check constraint for valid roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_profiles_role_check'
  ) THEN
    ALTER TABLE user_profiles
    ADD CONSTRAINT user_profiles_role_check 
    CHECK (role IN ('user', 'admin', 'superadmin'));
  END IF;
END $$;

-- 3. Create index for role-based queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_role 
ON user_profiles(role);

-- 4. Set superadmin role for main admin user
UPDATE user_profiles
SET role = 'superadmin'
WHERE email = 'szasz.szabolcs1995@gmail.com';

-- 5. Ensure all existing users have 'user' role if not set
UPDATE user_profiles
SET role = 'user'
WHERE role IS NULL;

-- 6. Add comment for documentation
COMMENT ON COLUMN user_profiles.role IS 'User role: user (default), admin, or superadmin';

-- Verification query - check if migration was successful
SELECT email, role, created_at 
FROM user_profiles 
ORDER BY 
  CASE role 
    WHEN 'superadmin' THEN 1 
    WHEN 'admin' THEN 2 
    ELSE 3 
  END,
  created_at DESC
LIMIT 10;
