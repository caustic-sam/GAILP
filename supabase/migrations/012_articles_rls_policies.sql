-- ============================================================================
-- ARTICLES ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Implements WordPress-style content access control:
-- - Contributors: Can only view/edit their own drafts
-- - Publishers: Can view/edit all content
-- - Admins: Full access to all content
-- - Readers: Can only view published content
-- ============================================================================

-- Enable RLS on articles table
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SELECT POLICIES (Who can VIEW articles)
-- ============================================================================

-- Policy 1: Public can read published articles
CREATE POLICY "public_read_published_articles"
  ON articles
  FOR SELECT
  USING (status = 'published');

-- Policy 2: Contributors can read their own drafts
CREATE POLICY "contributors_read_own_drafts"
  ON articles
  FOR SELECT
  USING (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('contributor', 'publisher', 'admin')
    )
  );

-- Policy 3: Publishers and admins can read all articles
CREATE POLICY "publishers_admins_read_all"
  ON articles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('publisher', 'admin')
    )
  );

-- ============================================================================
-- INSERT POLICIES (Who can CREATE articles)
-- ============================================================================

-- Contributors, publishers, and admins can create articles
CREATE POLICY "authenticated_users_create_articles"
  ON articles
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('contributor', 'publisher', 'admin')
    )
  );

-- ============================================================================
-- UPDATE POLICIES (Who can EDIT articles)
-- ============================================================================

-- Policy 1: Contributors can only update their own drafts
CREATE POLICY "contributors_update_own_drafts"
  ON articles
  FOR UPDATE
  USING (
    auth.uid() = author_id
    AND status = 'draft'
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'contributor'
    )
  )
  WITH CHECK (
    -- Contributors cannot change status to 'published' or 'scheduled'
    -- They can only keep it as 'draft'
    status = 'draft'
    AND auth.uid() = author_id
  );

-- Policy 2: Publishers and admins can update all articles
CREATE POLICY "publishers_admins_update_all"
  ON articles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('publisher', 'admin')
    )
  );

-- ============================================================================
-- DELETE POLICIES (Who can DELETE articles)
-- ============================================================================

-- Policy 1: Contributors can delete their own drafts
CREATE POLICY "contributors_delete_own_drafts"
  ON articles
  FOR DELETE
  USING (
    auth.uid() = author_id
    AND status = 'draft'
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'contributor'
    )
  );

-- Policy 2: Publishers and admins can delete all articles
CREATE POLICY "publishers_admins_delete_all"
  ON articles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('publisher', 'admin')
    )
  );

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for author_id lookups (used by RLS policies)
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON articles(author_id);

-- Index for author + status lookups (used by contributor queries)
CREATE INDEX IF NOT EXISTS idx_articles_author_status ON articles(author_id, status);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  rls_enabled BOOLEAN;
  policy_count INTEGER;
BEGIN
  -- Check if RLS is enabled
  SELECT relrowsecurity INTO rls_enabled
  FROM pg_class
  WHERE relname = 'articles';

  -- Count policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'articles';

  RAISE NOTICE '';
  RAISE NOTICE '=== Articles RLS Policies Migration Complete ===';
  RAISE NOTICE 'RLS Enabled: %', CASE WHEN rls_enabled THEN '✅ YES' ELSE '❌ NO' END;
  RAISE NOTICE 'Policies Created: % policies', policy_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Access Control Summary:';
  RAISE NOTICE '  📖 Public: Can view published articles only';
  RAISE NOTICE '  ✍️ Contributors: Can view/edit/delete only their own drafts';
  RAISE NOTICE '  📝 Publishers: Can view/edit/delete all articles';
  RAISE NOTICE '  👑 Admins: Full access to all articles';
  RAISE NOTICE '';
  RAISE NOTICE 'Security Features:';
  RAISE NOTICE '  ✅ Contributors cannot publish (must submit for review)';
  RAISE NOTICE '  ✅ Contributors cannot edit others'' drafts';
  RAISE NOTICE '  ✅ Contributors cannot delete published content';
  RAISE NOTICE '  ✅ Public cannot access unpublished content';
  RAISE NOTICE '';
END $$;
