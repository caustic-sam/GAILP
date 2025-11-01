-- TEMPORARY: Disable RLS on articles table for development
-- This allows all operations without authentication
-- IMPORTANT: Re-enable RLS before deploying to production!

-- First, drop any existing policies that might conflict
DROP POLICY IF EXISTS "Public can view published articles" ON articles;
DROP POLICY IF EXISTS "Admins can view all articles" ON articles;
DROP POLICY IF EXISTS "Admins can insert articles" ON articles;
DROP POLICY IF EXISTS "Admins can update articles" ON articles;
DROP POLICY IF EXISTS "Admins can delete articles" ON articles;
DROP POLICY IF EXISTS "temp_allow_inserts" ON articles;
DROP POLICY IF EXISTS "Allow anonymous article creation for dev" ON articles;

-- Disable RLS completely for development
ALTER TABLE articles DISABLE ROW LEVEL SECURITY;

-- Verify it's disabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'articles';

-- To re-enable RLS later, run:
-- ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
