-- Migration: Add role column to profiles table
-- Run this if you want admin functionality for API key management

-- Add role column to profiles table
ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user';

-- Add constraint to ensure valid roles
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('user', 'admin', 'manager'));

-- Update existing users to have 'user' role (if any exist)
UPDATE profiles SET role = 'user' WHERE role IS NULL;

-- Make role column NOT NULL after setting defaults
ALTER TABLE profiles ALTER COLUMN role SET NOT NULL;

-- Create index for role-based queries
CREATE INDEX idx_profiles_role ON profiles(role);

-- Now you can uncomment the admin policies in api_keys_schema.sql
-- and run them to enable admin access to all API keys

-- Example: Set a user as admin (replace with actual user ID)
-- UPDATE profiles SET role = 'admin' WHERE id = 'your-user-id-here'; 