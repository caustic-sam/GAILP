-- ============================================================================
-- ADD ARTICLE METRICS AND SCHEDULING
-- ============================================================================
-- Adds view_count, revision_count, and scheduled_for columns to articles table
-- ============================================================================

-- Add view_count column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE articles ADD COLUMN view_count INTEGER DEFAULT 0 NOT NULL;
    RAISE NOTICE '✅ Added view_count column';
  ELSE
    RAISE NOTICE 'view_count column already exists';
  END IF;
END $$;

-- Add revision_count column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'revision_count'
  ) THEN
    ALTER TABLE articles ADD COLUMN revision_count INTEGER DEFAULT 0 NOT NULL;
    RAISE NOTICE '✅ Added revision_count column';
  ELSE
    RAISE NOTICE 'revision_count column already exists';
  END IF;
END $$;

-- Add scheduled_for column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'scheduled_for'
  ) THEN
    ALTER TABLE articles ADD COLUMN scheduled_for TIMESTAMPTZ;
    RAISE NOTICE '✅ Added scheduled_for column';
  ELSE
    RAISE NOTICE 'scheduled_for column already exists';
  END IF;
END $$;

-- Create index for scheduled articles
CREATE INDEX IF NOT EXISTS idx_articles_scheduled
  ON articles(scheduled_for)
  WHERE status = 'scheduled' AND scheduled_for IS NOT NULL;

-- Create index for view count (for sorting/analytics)
CREATE INDEX IF NOT EXISTS idx_articles_view_count
  ON articles(view_count DESC);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  view_count_exists BOOLEAN;
  revision_count_exists BOOLEAN;
  scheduled_for_exists BOOLEAN;
BEGIN
  -- Check columns exist
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'view_count'
  ) INTO view_count_exists;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'revision_count'
  ) INTO revision_count_exists;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'scheduled_for'
  ) INTO scheduled_for_exists;

  RAISE NOTICE '';
  RAISE NOTICE '=== Article Metrics Migration Complete ===';
  RAISE NOTICE 'view_count: %', CASE WHEN view_count_exists THEN '✅' ELSE '❌' END;
  RAISE NOTICE 'revision_count: %', CASE WHEN revision_count_exists THEN '✅' ELSE '❌' END;
  RAISE NOTICE 'scheduled_for: %', CASE WHEN scheduled_for_exists THEN '✅' ELSE '❌' END;
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Dashboard stats will now show accurate counts';
  RAISE NOTICE '  2. Scheduled posts will display correctly';
  RAISE NOTICE '  3. View counts can be tracked per article';
END $$;
