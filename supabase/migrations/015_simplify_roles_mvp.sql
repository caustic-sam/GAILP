-- Migration: Simplify user roles for MVP launch
-- Date: 2025-12-26
-- Purpose: Remove 'publisher' and 'contributor' roles, keeping only 'admin' and 'reader'
--
-- V1.0 MVP Launch - Simplified Roles:
--   - admin: Full access to admin dashboard, content management, settings
--   - reader: Public read-only access
--
-- V1.1 may re-introduce:
--   - publisher: Can publish content but not access settings
--   - contributor: Can create drafts but not publish

-- Update existing publisher and contributor users to admin
-- (Assuming you want to preserve their elevated access for MVP)
UPDATE user_profiles
SET role = 'admin'
WHERE role IN ('publisher', 'contributor');

-- Add comment to document the change
COMMENT ON COLUMN user_profiles.role IS 'User role: admin (full access) or reader (public access). V1.1 may add publisher/contributor.';

-- Update role check constraint to only allow admin and reader
ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_role_check;

ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_role_check CHECK (role IN ('admin', 'reader'));

-- Log the migration
DO $$
BEGIN
  RAISE NOTICE 'Migration 015: User roles simplified to admin and reader for MVP launch';
  RAISE NOTICE 'Existing publisher/contributor users have been promoted to admin';
END $$;
