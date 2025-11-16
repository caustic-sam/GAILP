-- ============================================================================
-- FIX ARTICLES TABLE SCHEMA - Add missing columns
-- ============================================================================
-- This migration adds the 'summary' column and other missing fields
-- to align with the base schema requirements
-- ============================================================================

-- Add summary column if it doesn't exist (required by base schema)
-- This is a critical fix for the draft save functionality
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'summary'
  ) THEN
    -- Add summary column, copy data from excerpt if it exists
    ALTER TABLE articles ADD COLUMN summary TEXT;

    -- Copy existing excerpt data to summary
    UPDATE articles SET summary = COALESCE(excerpt, SUBSTRING(content, 1, 200) || '...');

    -- Make it NOT NULL after copying data
    ALTER TABLE articles ALTER COLUMN summary SET NOT NULL;

    RAISE NOTICE 'Added summary column to articles table';
  ELSE
    RAISE NOTICE 'summary column already exists';
  END IF;
END $$;

-- Ensure excerpt column exists (for enhanced schema compatibility)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'excerpt'
  ) THEN
    ALTER TABLE articles ADD COLUMN excerpt TEXT;

    -- Copy summary to excerpt if summary exists
    UPDATE articles SET excerpt = summary WHERE summary IS NOT NULL;

    RAISE NOTICE 'Added excerpt column to articles table';
  ELSE
    RAISE NOTICE 'excerpt column already exists';
  END IF;
END $$;

-- Add other missing columns from base schema
DO $$
BEGIN
  -- featured_image_alt
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'featured_image_alt'
  ) THEN
    ALTER TABLE articles ADD COLUMN featured_image_alt TEXT;
    RAISE NOTICE 'Added featured_image_alt column';
  END IF;

  -- category_id (for relational category support)
  -- Only add if categories table exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'category_id'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'categories'
  ) THEN
    ALTER TABLE articles ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added category_id column';
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'categories'
  ) THEN
    RAISE NOTICE 'Skipping category_id - categories table does not exist';
  END IF;

  -- read_time_minutes (base schema name)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'read_time_minutes'
  ) THEN
    ALTER TABLE articles ADD COLUMN read_time_minutes INTEGER;

    -- Copy from read_time if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'articles' AND column_name = 'read_time'
    ) THEN
      EXECUTE 'UPDATE articles SET read_time_minutes = read_time WHERE read_time IS NOT NULL';
    END IF;

    RAISE NOTICE 'Added read_time_minutes column';
  END IF;

  -- word_count
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'word_count'
  ) THEN
    ALTER TABLE articles ADD COLUMN word_count INTEGER;
    RAISE NOTICE 'Added word_count column';
  END IF;

  -- Engagement metrics
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'likes_count'
  ) THEN
    ALTER TABLE articles ADD COLUMN likes_count INTEGER DEFAULT 0;
    RAISE NOTICE 'Added likes_count column';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'comments_count'
  ) THEN
    ALTER TABLE articles ADD COLUMN comments_count INTEGER DEFAULT 0;
    RAISE NOTICE 'Added comments_count column';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'shares_count'
  ) THEN
    ALTER TABLE articles ADD COLUMN shares_count INTEGER DEFAULT 0;
    RAISE NOTICE 'Added shares_count column';
  END IF;

  -- SEO fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'meta_description'
  ) THEN
    ALTER TABLE articles ADD COLUMN meta_description TEXT;
    RAISE NOTICE 'Added meta_description column';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'meta_keywords'
  ) THEN
    ALTER TABLE articles ADD COLUMN meta_keywords TEXT[];
    RAISE NOTICE 'Added meta_keywords column';
  END IF;

  -- Publishing flags
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE articles ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added is_featured column';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'is_pinned'
  ) THEN
    ALTER TABLE articles ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added is_pinned column';
  END IF;
END $$;

-- Create indexes for new columns
DO $$
BEGIN
  -- Only create category_id index if the column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'category_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_articles_category_id ON articles(category_id);
    RAISE NOTICE 'Created index on category_id';
  END IF;

  -- Create indexes for boolean flags
  CREATE INDEX IF NOT EXISTS idx_articles_is_featured ON articles(is_featured) WHERE is_featured = TRUE;
  CREATE INDEX IF NOT EXISTS idx_articles_is_pinned ON articles(is_pinned) WHERE is_pinned = TRUE;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  missing_cols TEXT[];
  col_name TEXT;
BEGIN
  -- Check for critical columns
  SELECT ARRAY_AGG(c.column_name) INTO missing_cols
  FROM (
    VALUES
      ('summary'),
      ('excerpt'),
      ('read_time_minutes'),
      ('word_count'),
      ('meta_description'),
      ('is_featured')
  ) AS required(column_name)
  LEFT JOIN information_schema.columns c
    ON c.table_name = 'articles'
    AND c.column_name = required.column_name
  WHERE c.column_name IS NULL;

  IF missing_cols IS NOT NULL THEN
    RAISE WARNING 'Still missing columns: %', missing_cols;
  ELSE
    RAISE NOTICE '✅ All critical columns present in articles table';
  END IF;

  -- Show column list
  RAISE NOTICE '';
  RAISE NOTICE 'Articles table columns:';
  FOR col_name IN
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'articles'
    ORDER BY ordinal_position
  LOOP
    RAISE NOTICE '  - %', col_name;
  END LOOP;
END $$;

-- ============================================================================
-- SUMMARY
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Migration 005 complete!';
  RAISE NOTICE '';
  RAISE NOTICE 'Changes:';
  RAISE NOTICE '  - Added summary column (required for API)';
  RAISE NOTICE '  - Added excerpt column (for enhanced schema)';
  RAISE NOTICE '  - Added engagement metrics (likes, comments, shares)';
  RAISE NOTICE '  - Added SEO fields (meta_description, meta_keywords)';
  RAISE NOTICE '  - Added publishing flags (is_featured, is_pinned)';
  RAISE NOTICE '  - Added category_id for relational categories';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Test draft saving in Studio';
  RAISE NOTICE '  2. Verify all columns are accessible';
  RAISE NOTICE '  3. Check media upload functionality';
END $$;
