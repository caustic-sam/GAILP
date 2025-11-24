-- ============================================================================
-- FIX RLS - Add service role bypass for admin operations
-- ============================================================================
-- Problem: API routes using service role are being blocked by RLS
-- Solution: Add bypass policy for service role OR temporarily disable RLS
-- ============================================================================

-- OPTION A: Disable RLS temporarily for debugging
-- Uncomment this line to disable RLS entirely:
-- ALTER TABLE articles DISABLE ROW LEVEL SECURITY;

-- OPTION B: Add service role bypass (RECOMMENDED)
-- Service role should bypass RLS for admin operations

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "service_role_bypass" ON articles;

-- Add service role bypass policy
-- This allows the service role (used by API routes) to bypass RLS
CREATE POLICY "service_role_bypass"
  ON articles
  FOR ALL
  TO authenticated
  USING (
    -- Service role always has access
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    OR
    -- Or if using admin client (bypass RLS)
    current_user = 'postgres'
  )
  WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    OR
    current_user = 'postgres'
  );

-- OPTION C: Fix anonymous access for published articles
-- Re-create the public read policy with better permissions

DROP POLICY IF EXISTS "public_read_published_articles" ON articles;

CREATE POLICY "public_read_published_articles"
  ON articles
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  policy_count INTEGER;
  rls_status BOOLEAN;
BEGIN
  -- Check RLS status
  SELECT relrowsecurity INTO rls_status
  FROM pg_class
  WHERE relname = 'articles';

  -- Count active policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'articles';

  RAISE NOTICE '';
  RAISE NOTICE '=== RLS Fix Applied ===';
  RAISE NOTICE 'RLS Enabled: %', CASE WHEN rls_status THEN 'YES' ELSE 'NO' END;
  RAISE NOTICE 'Active Policies: %', policy_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Current Policies:';

  FOR rec IN
    SELECT policyname, cmd, roles
    FROM pg_policies
    WHERE tablename = 'articles'
    ORDER BY policyname
  LOOP
    RAISE NOTICE '  - % (%) for %', rec.policyname, rec.cmd, rec.roles;
  END LOOP;

  RAISE NOTICE '';
END $$;
