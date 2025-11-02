-- ============================================================================
-- SUPABASE STORAGE POLICIES FOR MEDIA BUCKET
-- ============================================================================
-- This sets up the necessary policies to allow file uploads to the media bucket
-- Run this in Supabase SQL Editor AFTER creating the 'media' bucket
-- ============================================================================

-- ============================================================================
-- 1. ENABLE RLS ON STORAGE OBJECTS
-- ============================================================================

-- Note: storage.objects should already have RLS enabled by default

-- ============================================================================
-- 2. CREATE POLICIES FOR PUBLIC ACCESS
-- ============================================================================

-- Policy: Allow anyone to upload files to the media bucket
CREATE POLICY "Allow public uploads to media bucket"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'media');

-- Policy: Allow anyone to read/view files from the media bucket
CREATE POLICY "Allow public access to media bucket"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'media');

-- Policy: Allow authenticated users to update their uploads
CREATE POLICY "Allow authenticated users to update media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'media')
WITH CHECK (bucket_id = 'media');

-- Policy: Allow authenticated users to delete their uploads
CREATE POLICY "Allow authenticated users to delete media"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'media');

-- ============================================================================
-- 3. VERIFY POLICIES
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Storage policies created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Policies created for bucket: media';
  RAISE NOTICE '  - Public can upload files';
  RAISE NOTICE '  - Public can view/download files';
  RAISE NOTICE '  - Authenticated users can update files';
  RAISE NOTICE '  - Authenticated users can delete files';
  RAISE NOTICE '';
  RAISE NOTICE 'The media bucket is now ready for uploads!';
END $$;
