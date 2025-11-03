# GAILP - Quick Start for Claude Sessions

**Project Name:** GAILP (Global AI & Digital Policy Hub)
**Previous Names:** World Papers
**Tech Stack:** Next.js 14, TypeScript, Supabase, TailwindCSS
**Current Status:** Core CMS functional, needs security hardening and feature expansion

---

## 🚀 Quick Orientation (Read First)

### What is this project?
A digital policy analysis platform with WordPress-style content management. Users can:
- Read published articles about AI policy, data governance, privacy, etc.
- Admins can create, edit, publish articles through a rich editor

### Current State
- ✅ Article CRUD is working (create, read, update)
- ✅ Admin dashboard shows all articles
- ✅ Global navigation with globe branding
- ✅ Article viewing pages for public
- ⚠️ RLS (Row Level Security) is **DISABLED** for development
- ⚠️ No authentication (admin pages are open)
- ⚠️ Homepage still uses mock data

### Critical Files to Read
1. **SESSION-SUMMARY.md** - Detailed history of last session
2. **BACKLOG.md** - Complete feature roadmap and priorities
3. **lib/supabase.ts** - Database client configuration
4. **app/api/admin/articles/route.ts** - Article CRUD API

---

## 📁 Project Structure

```
/app
  /admin                      # Admin dashboard
    /articles
      /new                    # Create article page
      /[id]/edit              # Edit article page
  /api
    /admin/articles           # Admin CRUD endpoints
      /[id]                   # GET/PUT single article
    /articles                 # Public article endpoints
      /[slug]                 # GET public article by slug
  /articles/[slug]            # Public article view page
  page.tsx                    # Homepage (NEEDS UPDATE)

/components
  Navigation.tsx              # Global nav with globe logo
  /ui                         # Reusable UI components

/lib
  supabase.ts                 # Database client + types
  mockData.ts                 # Mock data (used on homepage)
  /database
    schema.sql                # Base database schema
    articles-enhanced-schema.sql  # Enhanced schema (not applied)
    disable-rls-for-dev.sql   # RLS disable script (TEMPORARY)

/public/images/globes         # Globe logos for navigation
```

---

## 🗄️ Database Schema (Supabase)

### Main Tables
- **articles** - Blog posts/articles (ACTIVE)
- **authors** - Writer profiles (EXISTS, not used yet)
- **categories** - Article categories (EXISTS, hardcoded in UI)
- **tags** - Article tags (EXISTS, basic support)
- **policies** - Policy documents (EXISTS, not implemented)
- **comments** - Article comments (EXISTS, not implemented)
- **newsletter_subscribers** - Email list (EXISTS, not implemented)

### Key Article Fields
```typescript
{
  id: string (UUID)
  title: string
  slug: string (URL-friendly)
  content: string (markdown/html)
  summary: string (excerpt)
  status: 'draft' | 'published' | 'archived'
  published_at: timestamp
  read_time_minutes: number
  word_count: number
  featured_image_url: string
  meta_description: string
  created_at: timestamp
  updated_at: timestamp
}
```

**Important:** Base schema uses `summary` (not `excerpt`) and `read_time_minutes` (not `read_time`)

---

## ⚙️ Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...  # ⚠️ Currently incomplete/wrong
```

**Issue:** Service role key appears incomplete. Need to get full JWT from Supabase dashboard.

---

## 🔒 Security Status (IMPORTANT)

### RLS (Row Level Security)
**Current State:** DISABLED on `articles` table
**Why:** Service role key wasn't working, disabled for development
**Risk Level:** 🔴 Critical - Do not deploy to production

**To re-enable:**
```sql
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read published" ON articles
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admin full access" ON articles
  FOR ALL USING (true); -- Replace with proper auth check
```

### Authentication
**Current State:** None - all admin routes are open
**Risk Level:** 🔴 Critical - Anyone can access admin dashboard

---

## 🎯 Common Tasks

### 1. Start Development Server
```bash
npm run dev
# Runs on http://localhost:3000
```

### 2. View Database (Supabase Dashboard)
- Log into Supabase project
- Table Editor → articles
- SQL Editor for queries

### 3. Test Article Workflow
1. Go to <http://localhost:3000/admin>
2. Click "New Article"
3. Write content, click "Publish Now"
4. View at <http://localhost:3000/articles/[your-slug]>

### 4. Check Git Status
```bash
git status
git log --oneline -5  # Recent commits
```

Current branch: `feature/fix-article-editor` (3 commits ahead of main)

### 5. Common Debugging
**Issue:** Articles not saving
- Check browser console for errors
- Check Supabase errors (objects with `code`, `message`, `details`)
- Verify RLS is disabled or admin client is being used

**Issue:** Navigation not showing
- Check `app/layout.tsx` includes `<Navigation />`
- Verify globe images exist in `/public/images/globes/`

**Issue:** Article not displaying
- Check article is `status: 'published'`
- Check `published_at` is set
- Verify slug is correct

---

## 🐛 Known Issues

1. **Service Role Key Invalid**
   - Current key in `.env.local` is incomplete
   - Need to get full JWT from Supabase dashboard
   - Affects: Admin operations when RLS is enabled

2. **Homepage Uses Mock Data**
   - File: `app/page.tsx`
   - API exists at `/api/articles`
   - Just needs to be connected

3. **No Loading States**
   - Edit page fetches article but shows no spinner
   - Should add skeleton loaders

4. **Accessibility Warnings**
   - Buttons missing `type` attribute
   - Some form elements missing labels
   - Low priority but should fix

---

## 📋 Priority Next Steps

See **BACKLOG.md** for complete roadmap. Top priorities:

1. **Homepage Integration** (1-2 hours)
   - Update `app/page.tsx` to fetch real articles
   - Easy win, high user value

2. **Re-enable RLS** (2-3 hours)
   - Get correct service role key
   - Create proper policies
   - Critical for security

3. **Articles List Page** (2-4 hours)
   - Create `/articles` page
   - Show all published articles
   - Good UX improvement

---

## 🤖 Tips for Claude Sessions

### When User Says "Remember where we left off"
1. Read **SESSION-SUMMARY.md** first
2. Check **BACKLOG.md** for context
3. Run `git status` to see current state
4. Check if dev server is running (usually is in background)

### Before Making Changes
1. Read the files you're about to modify
2. Check current branch (`git branch`)
3. Verify changes won't break RLS-disabled setup
4. Consider impact on both admin and public routes

### Common Patterns in This Codebase
- **API Routes:** Always handle Supabase errors as objects (not Error instances)
- **Schema Mapping:** Use `summary` not `excerpt`, `read_time_minutes` not `read_time`
- **Admin Client:** Use `supabaseAdmin` for write operations in API routes
- **Server/Client:** Mark pages as `'use client'` if they use hooks/state

### Git Workflow
- Always work on feature branches
- User prefers descriptive commit messages
- Include Claude attribution in commits:
  ```
  🤖 Generated with [Claude Code](https://claude.com/claude-code)

  Co-Authored-By: Claude <noreply@anthropic.com>
  ```

---

## 📞 Project Context

### User's Goals
- Build a policy analysis platform (like WordPress but modern)
- Focus on AI policy, data governance, privacy topics
- Clean, minimalist design (globe theme)
- Eventually: Web3 features, IPFS publishing, ENS integration

### User's Working Style
- Prefers to test things themselves
- Likes to see progress quickly
- Values documentation and session summaries
- Comfortable with git and terminal commands
- Willing to continue work in new sessions

### Project Vision
Think "WordPress meets Substack meets Web3" for policy analysis. The user wants:
- Easy content creation (✅ Have this)
- Clean reading experience (✅ Have this)
- Professional admin tools (✅ Have this)
- Security and ownership (⚠️ Work in progress)
- Future: Decentralized publishing (🔮 Planned)

---

## 🎓 Learning from Previous Sessions

### What Went Well
- Systematic debugging of Supabase errors
- Creating comprehensive session summaries
- Using git branches for features
- Testing as we go

### What to Watch Out For
- Supabase errors are objects, not Error instances (caught us twice)
- Schema mismatches between code and DB (use base schema columns)
- RLS can block operations even with admin key if key is wrong
- Auto-generate features (slug, excerpt) can conflict with edit mode

### User Feedback Patterns
- "let's keep going" = wants to continue, has time
- "losing confidence" = frustrated, need to fix ASAP
- "alright. ready to get started" = fresh session, needs context
- "wrap up" = prepare session summary and documentation

---

**Last Updated:** November 1, 2025
**Next Recommended Task:** Homepage Integration (see BACKLOG.md #1)
