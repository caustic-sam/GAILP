# Database Setup Guide

This guide walks you through setting up the Supabase database for World Papers.

---

## Step 1: Create Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub, Google, or email
4. Verify your email if required

---

## Step 2: Create New Project

1. Click "New Project"
2. Fill in project details:
   - **Name**: `world-papers` (or your preferred name)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Start with Free tier

3. Click "Create new project"
4. Wait 2-3 minutes for provisioning

---

## Step 3: Get API Credentials

1. In your Supabase project, go to **Settings** (gear icon)
2. Click **API** in the left sidebar
3. Copy these values:

   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (looks like: `eyJhbG...`)
   - **service_role key** (looks like: `eyJhbG...`)

---

## Step 4: Configure Environment Variables

1. Open your `.env.local` file (create from `.env.example` if needed):

```bash
cp .env.example .env.local
```

2. Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
```

---

## Step 5: Create Database Schema

1. In Supabase dashboard, go to **SQL Editor** (database icon)
2. Click "New query"
3. Open `lib/database/schema.sql` in your project
4. Copy ALL the SQL code
5. Paste into Supabase SQL Editor
6. Click "Run" (or press Cmd/Ctrl + Enter)

You should see: ✅ Success messages for all tables created

---

## Step 6: Verify Tables Created

1. Go to **Table Editor** in Supabase
2. You should see these tables:
   - authors
   - categories
   - tags
   - policies
   - articles
   - rss_feeds
   - rss_items
   - videos
   - thoughts
   - comments
   - newsletter_subscribers

---

## Step 7: Test Connection

1. Restart your dev server:

```bash
# Stop the server (Ctrl+C)
pnpm dev
```

2. Check the console - you should NOT see:
   - "⚠️ Supabase environment variables are not set"

3. If configured correctly, the app will try to fetch from database (but will be empty initially)

---

## Step 8: Seed Initial Data (Optional)

### Option A: Quick Test Data

You can keep using mock data while you migrate WordPress content.
The app automatically falls back to mock data if Supabase is empty.

### Option B: Add Sample Data via SQL

Run this in Supabase SQL Editor to add test data:

```sql
-- Add a sample author
INSERT INTO authors (name, email, avatar_url, title, bio)
VALUES (
  'Your Name',
  'you@example.com',
  'https://ui-avatars.com/api/?name=Your+Name',
  'Policy Analyst',
  'Expert in digital policy and data governance'
);

-- Add sample category
INSERT INTO categories (name, slug, description, color)
VALUES (
  'Digital Policy',
  'digital-policy',
  'Analysis of digital governance frameworks',
  'blue'
);

-- Add sample article
INSERT INTO articles (
  title,
  slug,
  summary,
  content,
  author_id,
  category_id,
  status,
  published_at,
  read_time_minutes
)
SELECT
  'Welcome to World Papers',
  'welcome-to-world-papers',
  'Your trusted source for digital policy analysis',
  '# Welcome\n\nThis is your first article on World Papers.',
  a.id,
  c.id,
  'published',
  NOW(),
  5
FROM authors a
CROSS JOIN categories c
LIMIT 1;
```

---

## Next Steps

Now you're ready to:

1. **Migrate WordPress Content** - See [WordPress Migration Guide](./WORDPRESS-MIGRATION.md)
2. **Set up FreshRSS Integration** - See [FreshRSS Integration Guide](./FRESHRSS-INTEGRATION.md)
3. **Update Homepage** - Connect real data to your pages

---

## Troubleshooting

### "Supabase environment variables are not set"

**Fix**: Check your `.env.local` file has correct values and restart dev server

### "Failed to create table X"

**Fix**: Make sure you're running the FULL schema.sql file, not just parts of it

### "Row Level Security" errors

**Fix**: The schema includes public read policies. For admin operations, you may need to temporarily disable RLS or add appropriate policies.

### Can't see data in app

**Check**:
1. Are environment variables set?
2. Did you seed data into Supabase?
3. Check browser console for errors
4. Check Supabase logs in dashboard

---

## Database Backup

**Important**: Always backup before major changes!

```sql
-- In Supabase SQL Editor, export tables:
-- Settings > Database > Backups > Download backup
```

Or use pg_dump:

```bash
pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres > backup.sql
```

---

## Schema Updates

When you need to modify the schema:

1. **Never drop tables in production!**
2. Use migrations:

```sql
-- Example: Add new column
ALTER TABLE articles ADD COLUMN views_today INTEGER DEFAULT 0;
```

3. Test in development first
4. Document all changes

---

## Support

- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **World Papers Issues**: Check project documentation

---

**You're all set!** Your database is ready for content. 🎉
