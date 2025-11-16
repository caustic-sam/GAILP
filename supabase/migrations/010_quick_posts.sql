-- ============================================================================
-- QUICK POSTS TABLE
-- ============================================================================
-- Micro-blogging system for quick thoughts posted via Drafts app or web
-- ============================================================================

-- Create quick_posts table
CREATE TABLE IF NOT EXISTS quick_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES user_profiles(id) NOT NULL,
  content TEXT NOT NULL,
  source TEXT DEFAULT 'drafts' CHECK (source IN ('drafts', 'web', 'sms')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  media_url TEXT,
  hashtags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_quick_posts_status_created
  ON quick_posts(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quick_posts_author
  ON quick_posts(author_id);

CREATE INDEX IF NOT EXISTS idx_quick_posts_published
  ON quick_posts(published_at DESC)
  WHERE status = 'published';

-- Add trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_quick_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quick_posts_updated_at
  BEFORE UPDATE ON quick_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_quick_posts_updated_at();

-- Add RLS policies
ALTER TABLE quick_posts ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to view all posts
CREATE POLICY "Allow authenticated to view all quick posts"
  ON quick_posts
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow public to view published posts
CREATE POLICY "Allow public to view published quick posts"
  ON quick_posts
  FOR SELECT
  TO anon
  USING (status = 'published');

-- Policy: Allow authors to insert their own posts
CREATE POLICY "Allow authors to insert own quick posts"
  ON quick_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Policy: Allow authors to update their own posts
CREATE POLICY "Allow authors to update own quick posts"
  ON quick_posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Policy: Allow authors to delete their own posts
CREATE POLICY "Allow authors to delete own quick posts"
  ON quick_posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  table_exists BOOLEAN;
  index_count INTEGER;
  policy_count INTEGER;
BEGIN
  -- Check if table exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'quick_posts'
  ) INTO table_exists;

  IF table_exists THEN
    RAISE NOTICE '✅ quick_posts table created successfully';

    -- Count indexes
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE tablename = 'quick_posts';
    RAISE NOTICE '✅ Created % indexes', index_count;

    -- Count policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'quick_posts';
    RAISE NOTICE '✅ Created % RLS policies', policy_count;

    RAISE NOTICE '';
    RAISE NOTICE 'Quick Posts Table Ready:';
    RAISE NOTICE '  - Table: quick_posts';
    RAISE NOTICE '  - Indexes: % (status, author, published)', index_count;
    RAISE NOTICE '  - RLS Policies: % (view, insert, update, delete)', policy_count;
    RAISE NOTICE '  - Trigger: auto-update updated_at';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '  1. Add QUICK_POST_SECRET to .env.local';
    RAISE NOTICE '  2. Create API endpoint: /api/webhooks/quick-post';
    RAISE NOTICE '  3. Create admin UI: /admin/quick-posts';
  ELSE
    RAISE WARNING '❌ Table creation may have failed';
  END IF;
END $$;
