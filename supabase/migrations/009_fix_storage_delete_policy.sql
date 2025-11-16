-- ============================================================================
-- FIX STORAGE DELETE POLICY
-- ============================================================================
-- Add policy to allow authenticated users to delete from media bucket
-- ============================================================================

-- Drop existing delete policy if it exists
DO $$
BEGIN
  DROP POLICY IF EXISTS "Authenticated can delete" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
  RAISE NOTICE 'Dropped existing delete policies (if any)';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error dropping policies: %', SQLERRM;
END $$;

-- Create delete policy for authenticated users
DO $$
BEGIN
  CREATE POLICY "Allow authenticated deletes"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'media');

  RAISE NOTICE '✅ Created DELETE policy for authenticated users';
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'Policy already exists: Allow authenticated deletes';
  WHEN insufficient_privilege THEN
    RAISE NOTICE '❌ Cannot create policy - insufficient privileges';
    RAISE NOTICE '   Go to Dashboard -> Storage -> media -> Policies';
    RAISE NOTICE '   Create policy: DELETE for authenticated where bucket_id = ''media''';
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Error creating DELETE policy: %', SQLERRM;
END $$;

-- Verify policies
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND cmd = 'DELETE';

  RAISE NOTICE '';
  RAISE NOTICE 'DELETE policies on storage.objects: %', policy_count;

  IF policy_count = 0 THEN
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  No DELETE policies found!';
    RAISE NOTICE 'You may need to create the policy manually via Dashboard';
  END IF;
END $$;
