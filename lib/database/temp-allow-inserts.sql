-- Temporary RLS policy to allow anonymous article creation for testing
-- IMPORTANT: Remove this policy in production!

-- This allows anyone to insert articles (for local dev testing only)
CREATE POLICY "Allow anonymous article creation for dev"
  ON articles
  FOR INSERT
  WITH CHECK (true);

-- To remove this policy later, run:
-- DROP POLICY "Allow anonymous article creation for dev" ON articles;
