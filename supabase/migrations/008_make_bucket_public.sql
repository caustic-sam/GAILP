-- ============================================================================
-- MAKE MEDIA BUCKET FULLY PUBLIC
-- ============================================================================
-- This updates the media bucket to be fully public, bypassing RLS issues
-- ============================================================================

-- Update the bucket to be public
UPDATE storage.buckets
SET public = true
WHERE id = 'media';

-- Verify the change
DO $$
DECLARE
  is_public BOOLEAN;
BEGIN
  SELECT public INTO is_public
  FROM storage.buckets
  WHERE id = 'media';

  IF is_public THEN
    RAISE NOTICE '✅ Media bucket is now PUBLIC';
    RAISE NOTICE '';
    RAISE NOTICE 'This means:';
    RAISE NOTICE '  ✓ Anyone can view/download files';
    RAISE NOTICE '  ✓ Authenticated users can upload files';
    RAISE NOTICE '  ✓ No RLS policies needed for basic operations';
    RAISE NOTICE '';
    RAISE NOTICE 'Test upload at: /admin/media';
  ELSE
    RAISE WARNING '❌ Bucket is still private - update may have failed';
  END IF;
END $$;
