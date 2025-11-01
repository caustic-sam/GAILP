-- ============================================================================
-- ENHANCED ARTICLES SCHEMA FOR WORDPRESS-LIKE CONTENT MANAGEMENT
-- ============================================================================
-- Features:
-- - Draft/Published status with scheduled publishing
-- - Revision history tracking
-- - LinkedIn post import support
-- - WordPress migration compatibility
-- ============================================================================

-- ============================================================================
-- 1. ARTICLES TABLE (Enhanced)
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
  scheduled_for TIMESTAMPTZ, -- When to auto-publish

  -- Metadata
  author_id UUID REFERENCES authors(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL DEFAULT 'Admin', -- Fallback for display
  category TEXT,
  tags TEXT[],
  featured_image_url TEXT,

  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  canonical_url TEXT,

  -- Analytics
  view_count INTEGER DEFAULT 0,
  read_time INTEGER, -- Calculated in minutes

  -- WordPress migration support
  wordpress_id INTEGER UNIQUE,
  wordpress_url TEXT,
  wordpress_guid TEXT,

  -- LinkedIn import support
  linkedin_post_id TEXT UNIQUE,
  linkedin_url TEXT,
  imported_from TEXT CHECK (imported_from IN ('wordpress', 'linkedin', 'manual')),

  -- Revision tracking
  current_revision_id UUID, -- Points to latest revision
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
-- 2. ARTICLE REVISIONS TABLE (Version History)
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
  change_summary TEXT, -- Optional description of what changed
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
-- 3. SCHEDULED PUBLISH QUEUE TABLE
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
-- 4. AUTO-UPDATE TRIGGERS
-- ============================================================================

-- Trigger: Update articles.updated_at on any change
CREATE OR REPLACE FUNCTION update_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

CREATE TRIGGER articles_create_revision
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION create_article_revision();

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_publishes ENABLE ROW LEVEL SECURITY;

-- Public can view published articles
CREATE POLICY "Published articles are viewable by everyone"
  ON articles FOR SELECT
  USING (status = 'published' AND published_at <= NOW());

-- Admins can view all articles (for preview/admin panel)
CREATE POLICY "Admins can view all articles"
  ON articles FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- Admins can manage articles
CREATE POLICY "Admins can insert articles"
  ON articles FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can update articles"
  ON articles FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can delete articles"
  ON articles FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Revision policies
CREATE POLICY "Admins can view revisions"
  ON article_revisions FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- Scheduled publish policies
CREATE POLICY "Admins can manage scheduled publishes"
  ON scheduled_publishes FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================================================
-- 6. HELPER FUNCTIONS
-- ============================================================================

-- Function: Auto-publish scheduled articles
CREATE OR REPLACE FUNCTION publish_scheduled_articles()
RETURNS TABLE(published_count INTEGER) AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  -- Update articles that are scheduled for publishing
  UPDATE articles
  SET
    status = 'published',
    published_at = NOW()
  WHERE
    status = 'scheduled'
    AND scheduled_for <= NOW()
    AND scheduled_for IS NOT NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  -- Update scheduled_publishes records
  UPDATE scheduled_publishes
  SET
    status = 'published',
    published_at = NOW(),
    attempted_at = NOW()
  WHERE
    status = 'pending'
    AND scheduled_for <= NOW()
    AND article_id IN (
      SELECT id FROM articles WHERE status = 'published'
    );

  RETURN QUERY SELECT v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get article with revision history
CREATE OR REPLACE FUNCTION get_article_with_revisions(article_slug TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'article', row_to_json(a.*),
    'revisions', (
      SELECT json_agg(row_to_json(r.*))
      FROM article_revisions r
      WHERE r.article_id = a.id
      ORDER BY r.revision_number DESC
    )
  )
  INTO result
  FROM articles a
  WHERE a.slug = article_slug;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function: Restore article to previous revision
CREATE OR REPLACE FUNCTION restore_article_revision(
  p_article_id UUID,
  p_revision_number INTEGER,
  p_restored_by UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_revision RECORD;
BEGIN
  -- Get the revision
  SELECT * INTO v_revision
  FROM article_revisions
  WHERE article_id = p_article_id
    AND revision_number = p_revision_number;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Restore content
  UPDATE articles
  SET
    title = v_revision.title,
    content = v_revision.content,
    excerpt = v_revision.excerpt,
    last_edited_at = NOW(),
    last_edited_by = p_restored_by
  WHERE id = p_article_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Insert sample author if not exists
INSERT INTO authors (id, name, email, bio, avatar_url)
VALUES (
  'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
  'Admin User',
  'admin@worldpapers.com',
  'Site administrator and content manager',
  NULL
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================

-- Grant necessary permissions (adjust as needed)
GRANT SELECT ON articles TO anon, authenticated;
GRANT ALL ON articles TO service_role;
GRANT ALL ON article_revisions TO service_role;
GRANT ALL ON scheduled_publishes TO service_role;

-- Summary
DO $$
BEGIN
  RAISE NOTICE '✅ Enhanced articles schema created successfully';
  RAISE NOTICE '📝 Features enabled:';
  RAISE NOTICE '   - Draft/Scheduled/Published workflow';
  RAISE NOTICE '   - Automatic revision history';
  RAISE NOTICE '   - WordPress import support';
  RAISE NOTICE '   - LinkedIn post import';
  RAISE NOTICE '   - Scheduled publishing';
  RAISE NOTICE '   - Full-text search';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Helper functions:';
  RAISE NOTICE '   - publish_scheduled_articles()';
  RAISE NOTICE '   - get_article_with_revisions(slug)';
  RAISE NOTICE '   - restore_article_revision(id, revision_number, user_id)';
END $$;
