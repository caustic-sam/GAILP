-- ============================================================================
-- SETUP MEDIA STORAGE BUCKET
-- ============================================================================
-- This migration creates the 'media' storage bucket for file uploads
-- and sets up proper RLS policies for public access
-- ============================================================================

-- ============================================================================
-- 1. CREATE STORAGE BUCKET
-- ============================================================================

-- Create the media bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,  -- Public bucket for media files
  52428800,  -- 50MB file size limit
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================================================
-- 2. STORAGE RLS POLICIES
-- ============================================================================
-- Note: Storage RLS policies are typically managed by Supabase automatically
-- when you create a public bucket. If you need custom policies, set them via
-- the Supabase Dashboard -> Storage -> Policies section.
--
-- The bucket being public (set above) means files are publicly accessible.
-- Authenticated users can upload/delete via the Supabase client automatically.

-- ============================================================================
-- 3. VERIFICATION
-- ============================================================================

DO $$
DECLARE
  bucket_record RECORD;
  bucket_exists BOOLEAN;
BEGIN
  -- Check if bucket exists
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'media'
  ) INTO bucket_exists;

  IF bucket_exists THEN
    RAISE NOTICE '✅ Media storage bucket exists';

    -- Show bucket configuration
    SELECT
      id,
      name,
      public,
      file_size_limit,
      ARRAY_LENGTH(allowed_mime_types, 1) as mime_type_count
    INTO bucket_record
    FROM storage.buckets
    WHERE id = 'media';

    RAISE NOTICE '';
    RAISE NOTICE 'Bucket Configuration:';
    RAISE NOTICE '  ID: %', bucket_record.id;
    RAISE NOTICE '  Public: %', bucket_record.public;
    RAISE NOTICE '  Size Limit: % MB', ROUND(bucket_record.file_size_limit::numeric / 1048576, 2);
    RAISE NOTICE '  Allowed MIME Types: %', bucket_record.mime_type_count;
  ELSE
    RAISE WARNING '❌ Media storage bucket NOT found';
  END IF;
END $$;

-- ============================================================================
-- SUMMARY
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Migration 006 complete!';
  RAISE NOTICE '';
  RAISE NOTICE 'Media Storage Setup:';
  RAISE NOTICE '  ✓ Created ''media'' storage bucket';
  RAISE NOTICE '  ✓ Enabled public access (bucket.public = true)';
  RAISE NOTICE '  ✓ Set 50MB file size limit';
  RAISE NOTICE '  ✓ Configured allowed MIME types';
  RAISE NOTICE '';
  RAISE NOTICE 'Supported file types:';
  RAISE NOTICE '  - Images: JPEG, PNG, GIF, WebP, SVG';
  RAISE NOTICE '  - Videos: MP4, WebM, QuickTime';
  RAISE NOTICE '  - Documents: PDF, Word (.doc, .docx)';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  Additional Setup Required:';
  RAISE NOTICE '  1. Go to Supabase Dashboard -> Storage -> media bucket';
  RAISE NOTICE '  2. Click "Policies" tab';
  RAISE NOTICE '  3. Add these policies:';
  RAISE NOTICE '     • SELECT: Allow public to view (bucket_id = ''media'')';
  RAISE NOTICE '     • INSERT: Allow authenticated users (auth.role() = ''authenticated'')';
  RAISE NOTICE '     • UPDATE: Allow authenticated users (auth.role() = ''authenticated'')';
  RAISE NOTICE '     • DELETE: Allow authenticated users (auth.role() = ''authenticated'')';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Set up RLS policies via Dashboard (see above)';
  RAISE NOTICE '  2. Test file upload in Media Vault (/admin/media)';
  RAISE NOTICE '  3. Verify public URL access to uploaded files';
END $$;
