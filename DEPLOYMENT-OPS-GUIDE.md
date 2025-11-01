# GAILP Deployment & Operations Guide

**Last Updated:** November 1, 2025
**Status:** ⚠️ NOT PRODUCTION READY - Security issues must be resolved first

---

## 🏗️ Architecture Overview

### Stack Components

```
┌─────────────────────────────────────────────────────────────┐
│                         USER BROWSER                         │
└────────────────────────────┬────────────────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │   Vercel Edge    │
                    │   (Next.js App)  │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
        ┌─────▼──────┐ ┌────▼────┐  ┌─────▼──────┐
        │  Static    │ │   API   │  │   Server   │
        │  Assets    │ │  Routes │  │ Components │
        └────────────┘ └────┬────┘  └─────┬──────┘
                            │              │
                       ┌────▼──────────────▼────┐
                       │   Supabase Cloud       │
                       │   - PostgreSQL DB      │
                       │   - Auth (future)      │
                       │   - Storage (future)   │
                       └────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14 (App Router) | React framework, SSR, routing |
| **Styling** | TailwindCSS | Utility-first CSS |
| **Language** | TypeScript | Type safety |
| **Database** | Supabase (PostgreSQL) | Primary data store |
| **Hosting** | Vercel | Deployment, CDN, edge functions |
| **Version Control** | Git | Source control |
| **Package Manager** | npm | Dependency management |

---

## 🔐 Environment Configuration

### Environment Variables

You need **3 different .env files** for different environments:

#### 1. Local Development (`.env.local`)
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Analytics, monitoring, etc.
# NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

**⚠️ NEVER commit `.env.local` to git** (already in .gitignore)

#### 2. Staging Environment (Vercel Dashboard)
Same variables as local, but pointing to staging Supabase project:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (staging anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (staging service role key)
```

#### 3. Production Environment (Vercel Dashboard)
Same variables as local, but pointing to production Supabase project:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (production anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (production service role key)
```

### Where to Get These Values

**Supabase Dashboard:**
1. Go to <https://supabase.com/dashboard>
2. Select your project
3. Go to **Settings** → **API**
4. Find:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key (click "Reveal") → `SUPABASE_SERVICE_ROLE_KEY`

**⚠️ IMPORTANT:** The service_role key has full database access. Keep it secret!

---

## 🗄️ Database Setup (Supabase)

### Initial Database Schema

**Location:** `lib/database/schema.sql`

This is your base schema. Run this in Supabase SQL Editor:

```sql
-- Copy entire contents of lib/database/schema.sql
-- Run in: Supabase Dashboard → SQL Editor → New Query
```

**Tables created:**
- `articles` (main content)
- `authors` (user profiles)
- `categories` (article categories)
- `tags` (article tags)
- `policies` (policy documents)
- `comments` (article comments)
- `newsletter_subscribers` (email list)
- `rss_feeds` (external feeds)
- `rss_items` (feed items)
- `videos` (video content)
- `thoughts` (short posts)

### Row Level Security (RLS)

**Current Status:** ⚠️ **DISABLED** (development only)

**Before deploying to production, you MUST:**

1. **Re-enable RLS:**
```sql
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
-- ... repeat for all tables
```

2. **Create Security Policies:**

```sql
-- PUBLIC: Read published articles
CREATE POLICY "public_read_published_articles" ON articles
  FOR SELECT
  USING (status = 'published' AND published_at IS NOT NULL);

-- AUTHENTICATED: Admin full access (update this when you add auth)
CREATE POLICY "admin_full_access" ON articles
  FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'admin'
    -- OR use auth.uid() = author_id for author-only access
  );

-- AUTHENTICATED: Authors can manage their own articles
CREATE POLICY "authors_manage_own" ON articles
  FOR ALL
  USING (auth.uid() = author_id);
```

3. **Test RLS policies thoroughly** before going live!

### Database Migrations

When you need to change the schema:

1. **Create migration file:**
   ```bash
   # In your project
   mkdir -p lib/database/migrations
   touch lib/database/migrations/$(date +%Y%m%d%H%M%S)_description.sql
   ```

2. **Write your changes:**
   ```sql
   -- Add new column
   ALTER TABLE articles ADD COLUMN reading_progress JSONB;

   -- Create new table
   CREATE TABLE article_views (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     article_id UUID REFERENCES articles(id),
     viewed_at TIMESTAMP DEFAULT NOW()
   );
   ```

3. **Run in Supabase SQL Editor**
4. **Document in migration file**
5. **Update TypeScript types in `lib/supabase.ts`**

### Backups

**Supabase automatically backs up your database daily.**

To create manual backup:
1. Supabase Dashboard → Database → Backups
2. Click "Create backup"
3. Name it (e.g., "pre-deployment-2025-11-01")

To restore:
1. Same location
2. Select backup
3. Click "Restore"

---

## 🚀 Vercel Deployment

### Keep Heavy Research Assets Out of the Build

The `NIST_LLM/` workspace is intentionally **not** part of this repository or the Vercel bundle. It contains several hundred megabytes of notebooks, models, and scratch data that will overwhelm Vercel’s 100 MB build cache and slow down every deployment.

- The directory now lives on the host outside git tracking (`.gitignore`) and is excluded from Vercel uploads (`.vercelignore`).
- If you still need it locally, keep a sibling clone (for example `~/Projects/NIST_LLM`) or fork it into its own repository.
- When you need assets from that workspace in the Next.js app, export the specific files (for example, into `public/nist-assets/`) instead of pointing to the entire folder.

**Before deploying**, confirm the project root does **not** contain a `NIST_LLM/` directory. If it reappears, deployments will fail; move it out and commit the updated repo before retrying.

### Initial Setup

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Link Project:**
   ```bash
   vercel link
   # Follow prompts to connect to existing project: WWW-GAILP-PRD
   ```

### Deployment Workflow

#### 1. Local Testing
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Test at http://localhost:3000

# Build locally to check for errors
npm run build

# Test production build
npm start
```

#### 2. Preview Deployment (Auto on PR)
```bash
# Push to any branch (not main)
git push origin feature/your-feature

# Vercel automatically creates preview deployment
# URL: https://gailp-git-feature-your-feature-username.vercel.app
```

Every git push to a non-main branch gets a unique preview URL.

#### 3. Production Deployment

```bash
# Method 1: Merge to main (recommended)
git checkout main
git merge feature/fix-article-editor
git push origin main
# Vercel auto-deploys to production

# Method 2: Manual deployment
vercel --prod
```

### Vercel Configuration

**File:** `vercel.json` (create if doesn't exist)

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
  },
  "build": {
    "env": {
      "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-role-key"
    }
  }
}
```

**Set environment variables in Vercel:**
1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable:
   - Variable name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://your-project.supabase.co`
   - Environment: Production, Preview, Development (select all)
3. Repeat for all environment variables

### Domain Configuration

**Current Status:** Default Vercel domain

**To add custom domain:**

1. **Purchase domain** (e.g., gailp.com from Namecheap, Google Domains, etc.)

2. **Add to Vercel:**
   - Vercel Dashboard → Project → Settings → Domains
   - Add domain: `gailp.com` and `www.gailp.com`

3. **Update DNS records** at your registrar:
   ```
   Type    Name    Value
   A       @       76.76.21.21 (Vercel IP)
   CNAME   www     cname.vercel-dns.com
   ```

4. **Wait for DNS propagation** (can take 24-48 hours)

5. **Enable HTTPS** (automatic with Vercel)

---

## 🔄 CI/CD Pipeline

### Current Setup (Vercel Auto-Deploy)

```
┌─────────────────┐
│   Git Push      │
│  (any branch)   │
└────────┬────────┘
         │
    ┌────▼─────┐
    │  GitHub  │
    │ Webhook  │
    └────┬─────┘
         │
    ┌────▼────────────────────────┐
    │  Vercel Build Process       │
    │  1. Install dependencies    │
    │  2. Run build               │
    │  3. Run tests (if any)      │
    │  4. Deploy to edge          │
    └────┬────────────────────────┘
         │
    ┌────▼────────────────────┐
    │  Deployment Complete    │
    │  - Preview URL created  │
    │  - Or production live   │
    └─────────────────────────┘
```

### GitHub Actions (Future Enhancement)

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test # when you add tests
      - run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 🔍 Monitoring & Observability

### Vercel Analytics (Built-in)

**Enable:**
1. Vercel Dashboard → Analytics tab
2. Click "Enable"
3. Free tier: 100k events/month

**Metrics tracked:**
- Page views
- Unique visitors
- Top pages
- Countries
- Devices

### Error Monitoring (Recommended: Sentry)

**Setup Sentry:**

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**Configuration:**
```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

**Add to `.env.local`:**
```bash
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

### Database Monitoring (Supabase)

**Built-in metrics:**
1. Supabase Dashboard → Project → Database → Activity
2. See:
   - Active connections
   - Query performance
   - Database size
   - Slow queries

### Uptime Monitoring (Recommended: UptimeRobot)

**Free service to monitor site availability:**

1. Sign up at <https://uptimerobot.com>
2. Add monitor:
   - Type: HTTP(s)
   - URL: `https://your-domain.com`
   - Interval: 5 minutes
3. Set up alerts (email, SMS, Slack)

---

## 📊 Performance Optimization

### Next.js Build Optimization

**Current configuration in `next.config.js`:**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization
  images: {
    domains: ['your-supabase-project.supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },

  // Production optimizations
  swcMinify: true,
  reactStrictMode: true,

  // Compression
  compress: true,

  // Optional: Generate standalone output
  output: 'standalone',
}

module.exports = nextConfig
```

### Caching Strategy

**Edge Caching (Vercel):**
```typescript
// app/articles/[slug]/page.tsx
export const revalidate = 3600; // Revalidate every hour

// Or use on-demand revalidation
import { revalidatePath } from 'next/cache';

// After publishing article:
revalidatePath(`/articles/${article.slug}`);
```

**Database Connection Pooling (Supabase):**
Already configured. Default settings work well for most cases.

### Bundle Size Analysis

```bash
# Install analyzer
npm install @next/bundle-analyzer

# Add to next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)

# Run analysis
ANALYZE=true npm run build
```

---

## 🛡️ Security Checklist

### Pre-Production Requirements

- [ ] **RLS enabled** on all Supabase tables
- [ ] **RLS policies tested** (can't access data you shouldn't)
- [ ] **Service role key** is valid and secure
- [ ] **Environment variables** set in Vercel (not in code)
- [ ] **No secrets in git** (check `.env.local` not committed)
- [ ] **HTTPS enabled** (automatic with Vercel)
- [ ] **Authentication implemented** (currently missing!)
- [ ] **Input validation** on all forms
- [ ] **SQL injection prevention** (use Supabase client, not raw SQL)
- [ ] **XSS prevention** (React escapes by default, but verify)
- [ ] **CORS configured** properly
- [ ] **Rate limiting** on API routes (future enhancement)
- [ ] **Error messages** don't leak sensitive info

### Security Headers (Recommended)

Add to `next.config.js`:

```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on'
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload'
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin'
        }
      ]
    }
  ]
}
```

---

## 🚨 Incident Response

### If Site Goes Down

1. **Check Vercel Status:**
   - <https://www.vercel-status.com>

2. **Check Vercel Logs:**
   ```bash
   vercel logs your-deployment-url
   ```

3. **Check Supabase Status:**
   - Supabase Dashboard → Project → Activity
   - <https://status.supabase.com>

4. **Rollback if needed:**
   ```bash
   # Vercel Dashboard → Deployments → Find last working version → Promote to Production
   # Or via CLI:
   vercel rollback
   ```

### If Database Issues

1. **Check connection:**
   ```sql
   SELECT 1; -- Run in SQL Editor
   ```

2. **Check RLS policies:**
   ```sql
   -- See all policies
   SELECT * FROM pg_policies WHERE tablename = 'articles';
   ```

3. **Restore from backup:**
   - Supabase Dashboard → Database → Backups → Restore

### If Build Fails

1. **Check build logs in Vercel**
2. **Common issues:**
   - Missing environment variables
   - TypeScript errors
   - Dependency issues
   - Out of memory (increase in Vercel settings)

3. **Test locally:**
   ```bash
   npm run build
   # Fix errors shown
   ```

---

## 📋 Deployment Checklist

### Pre-Deployment (REQUIRED)

- [ ] All code committed and pushed to git
- [ ] Branch merged to `main`
- [ ] Build succeeds locally (`npm run build`)
- [ ] All environment variables set in Vercel
- [ ] RLS enabled and policies tested
- [ ] Authentication implemented (currently MISSING)
- [ ] Test data removed from production database
- [ ] Database backup created
- [ ] Security headers configured
- [ ] Error monitoring set up (Sentry)
- [ ] Domain configured (if using custom domain)

### During Deployment

- [ ] Monitor build logs in Vercel
- [ ] Check deployment preview before promoting to production
- [ ] Test critical paths:
  - [ ] Homepage loads
  - [ ] Article pages load
  - [ ] Admin login works (when auth added)
  - [ ] Create article works
  - [ ] Edit article works
  - [ ] Publish article works

### Post-Deployment

- [ ] Verify production site is live
- [ ] Test all major features
- [ ] Check error monitoring dashboard
- [ ] Monitor performance metrics
- [ ] Check database connections
- [ ] Verify SSL certificate is active
- [ ] Test on multiple devices/browsers
- [ ] Update documentation with production URLs

---

## 🔧 Common Operations

### Adding New Environment Variable

1. **Add to `.env.local` locally:**
   ```bash
   echo "NEW_API_KEY=abc123" >> .env.local
   ```

2. **Add to Vercel:**
   - Dashboard → Settings → Environment Variables
   - Add variable for all environments

3. **Redeploy:**
   ```bash
   vercel --prod
   ```

### Database Schema Change

1. **Write migration SQL**
2. **Test in Supabase development project**
3. **Update TypeScript types in `lib/supabase.ts`**
4. **Apply to production Supabase**
5. **Deploy code changes to Vercel**

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update specific package
npm update next

# Update all (careful!)
npm update

# Test thoroughly
npm run build
npm run dev

# Commit and deploy
git add package*.json
git commit -m "Update dependencies"
git push
```

---

## 📞 Support & Resources

### Official Documentation
- **Next.js:** <https://nextjs.org/docs>
- **Vercel:** <https://vercel.com/docs>
- **Supabase:** <https://supabase.com/docs>
- **TailwindCSS:** <https://tailwindcss.com/docs>

### Project-Specific Docs
- **Quick Start:** `README-CLAUDE.md`
- **Feature Backlog:** `BACKLOG.md`
- **Session History:** `SESSION-SUMMARY.md`
- **Project Status:** `PROJECT-STATUS.md`

### Getting Help
1. Check documentation first
2. Search GitHub issues
3. Vercel Discord: <https://vercel.com/discord>
4. Supabase Discord: <https://discord.supabase.com>

---

## ⚠️ Current Blockers for Production

### CRITICAL - Must Fix

1. **Row Level Security Disabled**
   - Database is completely open
   - Anyone can read/write/delete data
   - **Fix:** See "Database Setup → Row Level Security" section

2. **No Authentication**
   - Admin pages accessible to everyone
   - No user accounts
   - No author attribution
   - **Fix:** Implement Supabase Auth (see BACKLOG.md)

3. **Invalid Service Role Key**
   - Current key in `.env.local` incomplete
   - May break when RLS re-enabled
   - **Fix:** Get full JWT from Supabase dashboard

### HIGH - Should Fix Soon

4. **Homepage Using Mock Data**
   - Not showing real articles
   - **Fix:** See BACKLOG.md #1

5. **No Error Monitoring**
   - Can't track production errors
   - **Fix:** Set up Sentry

### Recommended Timeline

**Week 1: Security**
- Day 1-2: Implement authentication
- Day 3-4: Re-enable RLS and create policies
- Day 5: Test security thoroughly

**Week 2: Production Prep**
- Day 1: Homepage integration
- Day 2: Error monitoring setup
- Day 3: Performance testing
- Day 4: Security audit
- Day 5: Soft launch (staging)

**Week 3: Launch**
- Day 1: Final testing
- Day 2: Deploy to production
- Day 3-5: Monitor and fix issues

---

**Last Updated:** November 1, 2025
**Status:** ⚠️ Development complete, security work required before production
**Next Steps:** Follow security checklist, then deploy to staging for testing
