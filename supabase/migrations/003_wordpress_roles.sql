-- WordPress-Style Role System Migration
-- Version: 0.2.0
-- Date: 2025-11-06
-- Description: Replace editor role with WordPress-inspired publisher/contributor roles

-- ============================================================================
-- PART 1: Update Role Constraints
-- ============================================================================

-- Drop old constraint
ALTER TABLE IF EXISTS public.user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_role_check;

-- Add new constraint with 4 roles: admin, publisher, contributor, reader
ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_role_check
  CHECK (role IN ('admin', 'publisher', 'contributor', 'reader'));

-- ============================================================================
-- PART 2: Migrate Existing Data
-- ============================================================================

-- Migrate 'editor' → 'publisher' (if any exist)
UPDATE public.user_profiles
SET role = 'publisher'
WHERE role = 'editor';

-- Ensure malsicario@malsicario.com is admin
UPDATE public.user_profiles
SET role = 'admin'
WHERE email = 'malsicario@malsicario.com';

-- ============================================================================
-- PART 3: Update Auto-Assignment Trigger
-- ============================================================================

-- Drop old trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create new trigger function with updated role logic
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

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- PART 4: Update Row Level Security Policies
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "user_profiles_select_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_own" ON public.user_profiles;
DROP POLICY IF EXISTS "admin_all_access" ON public.user_profiles;

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

-- ============================================================================
-- PART 5: Create Role Capability View (for easy querying)
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

-- Grant access to authenticated users
GRANT SELECT ON public.user_capabilities TO authenticated;

-- ============================================================================
-- PART 6: Add Indexes for Performance
-- ============================================================================

-- Index on role for faster role-based queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

-- Index on email for faster user lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

-- ============================================================================
-- VERIFICATION QUERIES (run these after migration)
-- ============================================================================

-- View all roles
-- SELECT email, role FROM public.user_profiles ORDER BY role, email;

-- View capabilities for all users
-- SELECT * FROM public.user_capabilities ORDER BY role, email;

-- Verify admin user
-- SELECT * FROM public.user_profiles WHERE email = 'malsicario@malsicario.com';

-- Count users by role
-- SELECT role, COUNT(*) FROM public.user_profiles GROUP BY role;

-- ============================================================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================================================

-- To rollback this migration, run:
/*
-- Revert to old roles
ALTER TABLE public.user_profiles
  DROP CONSTRAINT user_profiles_role_check;

ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_role_check
  CHECK (role IN ('admin', 'editor', 'reader'));

UPDATE public.user_profiles
SET role = 'editor'
WHERE role IN ('publisher', 'contributor');

DROP VIEW IF EXISTS public.user_capabilities;
DROP INDEX IF EXISTS idx_user_profiles_role;
DROP INDEX IF EXISTS idx_user_profiles_email;
*/
