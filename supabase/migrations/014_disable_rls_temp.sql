-- ============================================================================
-- TEMPORARY: Disable RLS on articles table
-- ============================================================================
-- Why: API routes need refactoring to use authenticated Supabase client
-- The current implementation uses anonymous client which RLS blocks
--
-- TODO: Re-enable RLS after fixing API authentication
-- See: docs/DRAFTS-AUTH-IMPLEMENTATION.md for full implementation plan
-- ============================================================================

-- Disable RLS temporarily
ALTER TABLE articles DISABLE ROW LEVEL SECURITY;

-- Keep the policies for future use (they won't be enforced while RLS is disabled)
-- Do NOT drop the policies - we'll re-enable RLS later

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  rls_status BOOLEAN;
  policy_count INTEGER;
BEGIN
  SELECT relrowsecurity INTO rls_status
  FROM pg_class
  WHERE relname = 'articles';

  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'articles';

  RAISE NOTICE '';
  RAISE NOTICE '=== Articles RLS Temporarily Disabled ===';
  RAISE NOTICE 'RLS Enabled: %', CASE WHEN rls_status THEN '❌ YES (should be NO)' ELSE '✅ NO' END;
  RAISE NOTICE 'Policies Preserved: % policies (ready for re-enable)', policy_count;
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  SECURITY WARNING:';
  RAISE NOTICE '   RLS is currently DISABLED on articles table';
  RAISE NOTICE '   All users can read/write all articles';
  RAISE NOTICE '';
  RAISE NOTICE '📋 TODO Before Production:';
  RAISE NOTICE '   1. Update API routes to use server-side auth';
  RAISE NOTICE '   2. Pass user session to Supabase client';
  RAISE NOTICE '   3. Test with multiple user roles';
  RAISE NOTICE '   4. Re-enable RLS: ALTER TABLE articles ENABLE ROW LEVEL SECURITY;';
  RAISE NOTICE '';
END $$;
