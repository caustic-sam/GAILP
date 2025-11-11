-- Cleanup Migration: Remove duplicate profiles table
-- Version: 0.2.1
-- Date: 2025-11-10
-- Description: Drop the duplicate 'profiles' table created in migration 002
--              to ensure only 'user_profiles' table exists (as used in code)

-- ============================================================================
-- Drop duplicate profiles table and related objects
-- ============================================================================

-- Drop policies first
DROP POLICY IF EXISTS "profiles_self_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;

-- Drop the duplicate table
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ============================================================================
-- Verification
-- ============================================================================

-- Ensure user_profiles table exists and has correct structure
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    RAISE EXCEPTION 'user_profiles table does not exist - migration 001 and 003 must run first';
  END IF;
END $$;

-- Verify user_profiles has the WordPress-style roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'user_profiles'
    AND constraint_name = 'user_profiles_role_check'
  ) THEN
    RAISE NOTICE 'Role constraint not found - migration 003 may need to run';
  END IF;
END $$;
