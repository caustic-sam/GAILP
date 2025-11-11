-- Production Database Setup Script
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/ksidbebbiljckrxlunxi/sql
-- Date: 2025-11-10

-- ============================================================================
-- STEP 1: Create user_profiles table (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'publisher', 'contributor', 'reader')),
  full_name TEXT,
  avatar_url TEXT,
  session_duration_hours INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_sign_in TIMESTAMPTZ
);

-- ============================================================================
-- STEP 2: Enable RLS
-- ============================================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 3: Drop old policies (if they exist)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_select_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_own" ON public.user_profiles;
DROP POLICY IF EXISTS "admin_select_all" ON public.user_profiles;
DROP POLICY IF EXISTS "admin_update_all" ON public.user_profiles;

-- ============================================================================
-- STEP 4: Create RLS Policies
-- ============================================================================

-- Policy 1: Users can view their own profile
CREATE POLICY "user_profiles_select_own"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy 2: Admins can view all profiles
CREATE POLICY "admin_select_all"
  ON public.user_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy 3: Users can update their own non-role fields
CREATE POLICY "user_profiles_update_own"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.user_profiles WHERE id = auth.uid())
  );

-- Policy 4: Admins can update any profile (including roles)
CREATE POLICY "admin_update_all"
  ON public.user_profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy 5: Allow INSERT for authenticated users (for trigger)
CREATE POLICY "allow_insert_for_new_users"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- STEP 5: Create trigger function for new users
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    CASE
      WHEN NEW.email = 'malsicario@malsicario.com' THEN 'admin'::text
      ELSE 'reader'::text
    END,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- ============================================================================
-- STEP 6: Create trigger
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- STEP 7: Create profile for existing users (IMPORTANT!)
-- ============================================================================

-- This will create profiles for any users that already exist in auth.users
-- but don't have a profile yet
INSERT INTO public.user_profiles (id, email, role, created_at, updated_at)
SELECT
  id,
  email,
  CASE
    WHEN email = 'malsicario@malsicario.com' THEN 'admin'::text
    ELSE 'reader'::text
  END,
  NOW(),
  NOW()
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.user_profiles)
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  role = CASE
    WHEN EXCLUDED.email = 'malsicario@malsicario.com' THEN 'admin'::text
    ELSE user_profiles.role -- Keep existing role if not admin email
  END,
  updated_at = NOW();

-- ============================================================================
-- STEP 8: Cleanup duplicate profiles table (if exists)
-- ============================================================================

DROP TABLE IF EXISTS public.profiles CASCADE;

-- ============================================================================
-- STEP 9: Create helpful view for capabilities
-- ============================================================================

CREATE OR REPLACE VIEW public.user_capabilities AS
SELECT
  id,
  email,
  role,
  CASE role
    WHEN 'admin' THEN true
    ELSE false
  END AS can_manage_users,
  CASE role
    WHEN 'admin' THEN true
    ELSE false
  END AS can_manage_settings,
  CASE role
    WHEN 'admin' THEN true
    WHEN 'publisher' THEN true
    ELSE false
  END AS can_publish,
  CASE role
    WHEN 'admin' THEN true
    WHEN 'publisher' THEN true
    ELSE false
  END AS can_edit_all_content,
  CASE role
    WHEN 'admin' THEN true
    WHEN 'publisher' THEN true
    WHEN 'contributor' THEN true
    ELSE false
  END AS can_access_media,
  CASE role
    WHEN 'admin' THEN true
    WHEN 'publisher' THEN true
    ELSE false
  END AS can_access_analytics,
  CASE role
    WHEN 'admin' THEN true
    ELSE false
  END AS can_access_security
FROM public.user_profiles;

GRANT SELECT ON public.user_capabilities TO authenticated;

-- ============================================================================
-- STEP 10: Verify setup
-- ============================================================================

-- Check if user_profiles table exists
SELECT 'user_profiles table exists' AS status, COUNT(*) AS user_count
FROM public.user_profiles;

-- Check your admin profile
SELECT 'Your admin profile:' AS status, *
FROM public.user_profiles
WHERE email = 'malsicario@malsicario.com';

-- ============================================================================
-- DONE!
-- ============================================================================

-- You should see:
-- 1. user_profiles table exists with at least 1 user
-- 2. Your profile with role = 'admin'
--
-- Now refresh your browser and the Header should show your user info!
