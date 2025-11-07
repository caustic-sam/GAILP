-- ============================================================================
-- DATABASE SETUP FOR WORDPRESS MIGRATION
-- ============================================================================
-- Run this in Supabase SQL Editor before migrating WordPress content
-- ============================================================================

-- ============================================================================
-- 1. CREATE AUTHORS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  website TEXT,
  social_links JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default malsicario author
INSERT INTO authors (id, name, email, bio)
VALUES (
  'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
  'malSicario',
  'malsicario@malsicario.com',
  'Digital policy analyst and technology commentator'
)
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name,
    bio = EXCLUDED.bio;

-- ============================================================================
-- 2. CREATE ARTICLES TABLE (Enhanced)
-- ============================================================================

CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,

  -- Publishing workflow
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,

  -- Metadata
  author_id UUID REFERENCES authors(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL DEFAULT 'Admin',
  category TEXT,
  tags TEXT[],
  featured_image_url TEXT,

  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  canonical_url TEXT,

  -- Analytics
  view_count INTEGER DEFAULT 0,
  read_time INTEGER,

  -- WordPress migration support
  wordpress_id INTEGER UNIQUE,
  wordpress_url TEXT,
  wordpress_guid TEXT,

  -- LinkedIn import support
  linkedin_post_id TEXT UNIQUE,
  linkedin_url TEXT,
  imported_from TEXT CHECK (imported_from IN ('wordpress', 'linkedin', 'manual')),

  -- Revision tracking
  current_revision_id UUID,
  revision_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_edited_at TIMESTAMPTZ DEFAULT NOW(),
  last_edited_by UUID REFERENCES authors(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_scheduled_for ON articles(scheduled_for) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_tags ON articles USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_articles_wordpress_id ON articles(wordpress_id) WHERE wordpress_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_articles_linkedin_post_id ON articles(linkedin_post_id) WHERE linkedin_post_id IS NOT NULL;

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_articles_search ON articles USING GIN(to_tsvector('english', title || ' ' || COALESCE(content, '') || ' ' || COALESCE(excerpt, '')));

-- ============================================================================
-- 3. CREATE ARTICLE REVISIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS article_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,

  -- Snapshot of content at this revision
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,

  -- Metadata at time of revision
  status TEXT NOT NULL,
  tags TEXT[],
  category TEXT,

  -- Revision metadata
  revision_number INTEGER NOT NULL,
  change_summary TEXT,
  changed_by UUID REFERENCES authors(id),
  changed_by_name TEXT NOT NULL DEFAULT 'Unknown',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(article_id, revision_number)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_revisions_article ON article_revisions(article_id, revision_number DESC);
CREATE INDEX IF NOT EXISTS idx_revisions_created ON article_revisions(created_at DESC);

-- ============================================================================
-- 4. CREATE SCHEDULED PUBLISHES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS scheduled_publishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,

  -- Schedule details
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'failed', 'cancelled')),

  -- Execution tracking
  attempted_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scheduled_publishes_pending ON scheduled_publishes(scheduled_for)
  WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_scheduled_publishes_article ON scheduled_publishes(article_id);

-- ============================================================================
-- 5. AUTO-UPDATE TRIGGERS
-- ============================================================================

-- Trigger: Update articles.updated_at on any change
CREATE OR REPLACE FUNCTION update_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS articles_updated_at ON articles;
CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_articles_updated_at();

-- Trigger: Create revision on content change
CREATE OR REPLACE FUNCTION create_article_revision()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create revision if content actually changed
  IF (OLD.title IS DISTINCT FROM NEW.title) OR
     (OLD.content IS DISTINCT FROM NEW.content) OR
     (OLD.excerpt IS DISTINCT FROM NEW.excerpt) THEN

    -- Increment revision count
    NEW.revision_count = OLD.revision_count + 1;

    -- Insert new revision
    INSERT INTO article_revisions (
      article_id,
      title,
      content,
      excerpt,
      status,
      tags,
      category,
      revision_number,
      changed_by,
      changed_by_name
    ) VALUES (
      OLD.id,
      OLD.title,
      OLD.content,
      OLD.excerpt,
      OLD.status,
      OLD.tags,
      OLD.category,
      OLD.revision_count,
      NEW.last_edited_by,
      NEW.author_name
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS articles_create_revision ON articles;
CREATE TRIGGER articles_create_revision
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION create_article_revision();

-- ============================================================================
-- 6. GRANT PERMISSIONS
-- ============================================================================

-- Grant necessary permissions
GRANT SELECT ON authors TO anon, authenticated;
GRANT SELECT ON articles TO anon, authenticated;
GRANT ALL ON authors TO service_role;
GRANT ALL ON articles TO service_role;
GRANT ALL ON article_revisions TO service_role;
GRANT ALL ON scheduled_publishes TO service_role;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Database setup complete!';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  - authors';
  RAISE NOTICE '  - articles';
  RAISE NOTICE '  - article_revisions';
  RAISE NOTICE '  - scheduled_publishes';
  RAISE NOTICE '';
  RAISE NOTICE 'Default author created:';
  RAISE NOTICE '  - malSicario (malsicario@malsicario.com)';
  RAISE NOTICE '';
  RAISE NOTICE 'Ready for WordPress migration!';
  RAISE NOTICE 'Run: pnpm tsx scripts/migrate-wordpress.ts';
END $$;
