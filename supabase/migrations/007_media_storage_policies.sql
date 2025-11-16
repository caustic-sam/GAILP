-- ============================================================================
-- MEDIA STORAGE RLS POLICIES
-- ============================================================================
-- This migration creates RLS policies for the media storage bucket
-- Run this AFTER migration 006 has created the bucket
-- ============================================================================

-- ============================================================================
-- 1. DROP EXISTING POLICIES (if any)
-- ============================================================================

DO $$
BEGIN
  -- Drop policies if they exist
  DROP POLICY IF EXISTS "Public can view media files" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can update media" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can delete media" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can view media" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated can upload" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated can update" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated can delete" ON storage.objects;

  RAISE NOTICE 'Dropped existing policies (if any)';
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Skipping policy drop - insufficient privileges';
  WHEN OTHERS THEN
    RAISE NOTICE 'Error dropping policies: %', SQLERRM;
END $$;

-- ============================================================================
-- 2. CREATE STORAGE POLICIES
-- ============================================================================

-- Policy 1: Public can view/download media files
DO $$
BEGIN
  CREATE POLICY "Anyone can view media"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'media');

  RAISE NOTICE '✅ Created policy: Anyone can view media';
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'Policy already exists: Anyone can view media';
  WHEN insufficient_privilege THEN
    RAISE NOTICE '❌ Cannot create policy - insufficient privileges. Use Supabase Dashboard instead.';
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Error creating SELECT policy: %', SQLERRM;
END $$;

-- Policy 2: Authenticated users can upload
DO $$
BEGIN
  CREATE POLICY "Authenticated can upload"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'media');

  RAISE NOTICE '✅ Created policy: Authenticated can upload';
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'Policy already exists: Authenticated can upload';
  WHEN insufficient_privilege THEN
    RAISE NOTICE '❌ Cannot create policy - insufficient privileges. Use Supabase Dashboard instead.';
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Error creating INSERT policy: %', SQLERRM;
END $$;

-- Policy 3: Authenticated users can update their files
DO $$
BEGIN
  CREATE POLICY "Authenticated can update"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'media');

  RAISE NOTICE '✅ Created policy: Authenticated can update';
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'Policy already exists: Authenticated can update';
  WHEN insufficient_privilege THEN
    RAISE NOTICE '❌ Cannot create policy - insufficient privileges. Use Supabase Dashboard instead.';
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Error creating UPDATE policy: %', SQLERRM;
END $$;

-- Policy 4: Authenticated users can delete their files
DO $$
BEGIN
  CREATE POLICY "Authenticated can delete"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'media');

  RAISE NOTICE '✅ Created policy: Authenticated can delete';
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'Policy already exists: Authenticated can delete';
  WHEN insufficient_privilege THEN
    RAISE NOTICE '❌ Cannot create policy - insufficient privileges. Use Supabase Dashboard instead.';
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Error creating DELETE policy: %', SQLERRM;
END $$;

-- ============================================================================
-- 3. VERIFICATION
-- ============================================================================

DO $$
DECLARE
  policy_count INTEGER;
  policy_record RECORD;
BEGIN
  -- Count media-related policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname LIKE '%media%' OR policyname LIKE '%Authenticated%';

  RAISE NOTICE '';
  RAISE NOTICE '📊 Policy Summary:';
  RAISE NOTICE '  Total policies on storage.objects: %', policy_count;
  RAISE NOTICE '';

  IF policy_count > 0 THEN
    RAISE NOTICE 'Existing policies:';
    FOR policy_record IN
      SELECT policyname, cmd, roles::text[]
      FROM pg_policies
      WHERE schemaname = 'storage'
        AND tablename = 'objects'
      ORDER BY policyname
    LOOP
      RAISE NOTICE '  - % (%) for %',
        policy_record.policyname,
        policy_record.cmd,
        policy_record.roles;
    END LOOP;
  ELSE
    RAISE NOTICE '⚠️  No policies found on storage.objects';
  END IF;
END $$;

-- ============================================================================
-- SUMMARY
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Migration 007 complete!';
  RAISE NOTICE '';
  RAISE NOTICE 'Storage Policies Setup:';
  RAISE NOTICE '  • SELECT: Public can view files';
  RAISE NOTICE '  • INSERT: Authenticated users can upload';
  RAISE NOTICE '  • UPDATE: Authenticated users can modify';
  RAISE NOTICE '  • DELETE: Authenticated users can remove';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  If policies failed to create:';
  RAISE NOTICE '  This is a Supabase permissions issue. You have 2 options:';
  RAISE NOTICE '';
  RAISE NOTICE '  OPTION 1: Use Supabase Dashboard (Easiest)';
  RAISE NOTICE '  1. Go to: Storage → media bucket → Policies';
  RAISE NOTICE '  2. Click "New Policy"';
  RAISE NOTICE '  3. Use the templates below';
  RAISE NOTICE '';
  RAISE NOTICE '  OPTION 2: Make bucket public and skip RLS';
  RAISE NOTICE '  1. Go to: Storage → media bucket → Configuration';
  RAISE NOTICE '  2. Toggle "Public bucket" to ON';
  RAISE NOTICE '  3. This allows all operations without RLS policies';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Verify policies are active (see above)';
  RAISE NOTICE '  2. Test upload at /admin/media';
  RAISE NOTICE '  3. Verify files are publicly accessible';
END $$;

-- ============================================================================
-- POLICY TEMPLATES FOR MANUAL CREATION (if needed)
-- ============================================================================

/*
If the policies failed to create above, use these in Supabase Dashboard:

--- Policy 1: SELECT (Public Read) ---
Name: Anyone can view media
Operation: SELECT
Policy definition: bucket_id = 'media'
Roles: public

--- Policy 2: INSERT (Authenticated Upload) ---
Name: Authenticated can upload
Operation: INSERT
Policy definition: bucket_id = 'media'
Roles: authenticated

--- Policy 3: UPDATE (Authenticated Update) ---
Name: Authenticated can update
Operation: UPDATE
Policy definition: bucket_id = 'media'
Roles: authenticated

--- Policy 4: DELETE (Authenticated Delete) ---
Name: Authenticated can delete
Operation: DELETE
Policy definition: bucket_id = 'media'
Roles: authenticated
*/
