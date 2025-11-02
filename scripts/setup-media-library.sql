-- ============================================================================
-- MEDIA LIBRARY SCHEMA
-- ============================================================================
-- Comprehensive media management for WordPress-style media library
-- Supports images, videos, audio, documents, and other assets
-- ============================================================================

-- ============================================================================
-- 1. CREATE MEDIA TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- File information
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Path in Supabase Storage
  file_url TEXT NOT NULL, -- Public URL
  file_size INTEGER NOT NULL, -- Size in bytes
  mime_type TEXT NOT NULL,
  file_extension TEXT NOT NULL,

  -- Media type categorization
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', 'audio', 'document', 'other')),

  -- Image-specific metadata
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  caption TEXT,

  -- Video/Audio-specific metadata
  duration INTEGER, -- Duration in seconds

  -- Organization
  title TEXT,
  description TEXT,
  tags TEXT[],
  folder TEXT, -- Optional folder organization

  -- Usage tracking
  used_in_articles INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  -- Upload metadata
  uploaded_by UUID, -- FK to authors if needed
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),

  -- WordPress migration support
  wordpress_attachment_id INTEGER UNIQUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_media_media_type ON media(media_type);
CREATE INDEX IF NOT EXISTS idx_media_mime_type ON media(mime_type);
CREATE INDEX IF NOT EXISTS idx_media_folder ON media(folder) WHERE folder IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_media_tags ON media USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_media_uploaded_at ON media(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_wordpress_id ON media(wordpress_attachment_id) WHERE wordpress_attachment_id IS NOT NULL;

-- Full-text search for media
CREATE INDEX IF NOT EXISTS idx_media_search ON media USING GIN(
  to_tsvector('english',
    COALESCE(title, '') || ' ' ||
    COALESCE(original_filename, '') || ' ' ||
    COALESCE(description, '') || ' ' ||
    COALESCE(alt_text, '')
  )
);

-- ============================================================================
-- 3. CREATE STORAGE BUCKETS (Run in Supabase Dashboard or via API)
-- ============================================================================

-- Note: These need to be created via Supabase Dashboard or API
-- Bucket name: 'media'
-- Public: true (for public media) or false (for private media)
-- File size limit: Configure as needed

-- Example folders structure in the bucket:
-- /images/
-- /videos/
-- /audio/
-- /documents/
-- /assets/ (site assets like buttons, icons, etc.)
-- /uploads/{year}/{month}/ (organized by date)

-- ============================================================================
-- 4. AUTO-UPDATE TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_media_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS media_updated_at ON media;
CREATE TRIGGER media_updated_at
  BEFORE UPDATE ON media
  FOR EACH ROW
  EXECUTE FUNCTION update_media_updated_at();

-- ============================================================================
-- 5. HELPER FUNCTIONS
-- ============================================================================

-- Function: Get media statistics
CREATE OR REPLACE FUNCTION get_media_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_files', COUNT(*),
    'total_size_mb', ROUND(SUM(file_size)::numeric / 1024 / 1024, 2),
    'by_type', (
      SELECT json_object_agg(media_type, count)
      FROM (
        SELECT media_type, COUNT(*) as count
        FROM media
        GROUP BY media_type
      ) t
    ),
    'images_count', (SELECT COUNT(*) FROM media WHERE media_type = 'image'),
    'videos_count', (SELECT COUNT(*) FROM media WHERE media_type = 'video'),
    'audio_count', (SELECT COUNT(*) FROM media WHERE media_type = 'audio'),
    'documents_count', (SELECT COUNT(*) FROM media WHERE media_type = 'document')
  )
  INTO result
  FROM media;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function: Clean up unused media (soft check)
CREATE OR REPLACE FUNCTION find_unused_media(days_old INTEGER DEFAULT 30)
RETURNS TABLE(
  id UUID,
  filename TEXT,
  file_size INTEGER,
  last_used_at TIMESTAMPTZ,
  uploaded_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.filename,
    m.file_size,
    m.last_used_at,
    m.uploaded_at
  FROM media m
  WHERE
    m.used_in_articles = 0
    AND m.uploaded_at < NOW() - (days_old || ' days')::INTERVAL
  ORDER BY m.uploaded_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT ON media TO anon, authenticated;
GRANT ALL ON media TO service_role;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Media library schema created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Table created:';
  RAISE NOTICE '  - media (with full-text search)';
  RAISE NOTICE '';
  RAISE NOTICE 'Supported media types:';
  RAISE NOTICE '  - Images (PNG, JPG, GIF, WebP, etc.)';
  RAISE NOTICE '  - Videos (MP4, WebM, etc.)';
  RAISE NOTICE '  - Audio (MP3, WAV, etc.)';
  RAISE NOTICE '  - Documents (PDF, DOC, etc.)';
  RAISE NOTICE '  - Other assets';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Create "media" storage bucket in Supabase Dashboard';
  RAISE NOTICE '  2. Set bucket to public or configure RLS policies';
  RAISE NOTICE '  3. Access media library at /admin/media';
END $$;
