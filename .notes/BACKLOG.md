# GAILP Project Backlog

**Last Updated:** November 1, 2025
**Current Branch:** `feature/fix-article-editor` (ready to merge)
**Project Status:** Core CMS features working, ready for content and enhancement

---

## High Priority (Next Sprint)

### 1. Homepage Integration
**Status:** Ready to implement
**Effort:** Small (1-2 hours)
**Description:** Update homepage to display real published articles from database instead of mock data

**Tasks:**
- [ ] Update `app/page.tsx` to fetch from `/api/articles`
- [ ] Replace mock data with real article cards
- [ ] Add loading states
- [ ] Test with published articles

**Files to modify:**
- `app/page.tsx`

---

### 2. Security: Re-enable RLS
**Status:** Critical for production
**Effort:** Medium (2-3 hours)
**Description:** Row Level Security is currently disabled for development. Must re-enable with proper policies.

**Tasks:**
- [ ] Get correct `SUPABASE_SERVICE_ROLE_KEY` from Supabase dashboard
- [ ] Update `.env.local` with full service role JWT
- [ ] Re-enable RLS: `ALTER TABLE articles ENABLE ROW LEVEL SECURITY;`
- [ ] Create proper RLS policies for:
  - Public read access to published articles
  - Admin write access to all articles
  - Author-specific access (future)
- [ ] Test article creation/editing with RLS enabled
- [ ] Remove temporary SQL files from `lib/database/`

**Files to modify:**
- `.env.local`
- Run SQL commands in Supabase
- Remove: `lib/database/disable-rls-for-dev.sql`, `lib/database/temp-allow-inserts.sql`

**Reference:**
- Current service role key appears incomplete (see SESSION-SUMMARY.md)
- Admin client is set up in `lib/supabase.ts` but needs valid key

---

### 3. Article List Page
**Status:** Not started
**Effort:** Medium (2-4 hours)
**Description:** Create `/articles` page to list all published articles

**Tasks:**
- [ ] Create `app/articles/page.tsx`
- [ ] Display grid/list of published articles
- [ ] Add pagination (limit 12 per page)
- [ ] Add filtering by category/tag (future)
- [ ] Add search functionality (future)

**API exists:** `/api/articles` already returns published articles

---

## Medium Priority

### 4. Category Management
**Status:** Schema exists, UI needed
**Effort:** Medium (3-5 hours)
**Description:** Currently categories are hardcoded in the editor. Need full category CRUD.

**Tasks:**
- [ ] Create `/admin/categories` page
- [ ] CRUD operations for categories
- [ ] Category slug generation
- [ ] Link categories to articles properly
- [ ] Update article editor to fetch categories from DB

**Database:** `categories` table exists in schema

---

### 5. Tag Management
**Status:** Schema exists, UI needed
**Effort:** Medium (3-5 hours)
**Description:** Tags are stored but not managed systematically.

**Tasks:**
- [ ] Create `/admin/tags` page
- [ ] Tag autocomplete in article editor
- [ ] Tag slug generation
- [ ] Tag cloud/list on frontend
- [ ] Popular tags widget

**Database:** `tags` table exists in schema

---

### 6. Image Upload
**Status:** Not started
**Effort:** Large (5-8 hours)
**Description:** Currently using URL input for images. Need proper upload functionality.

**Tasks:**
- [ ] Set up Supabase Storage bucket
- [ ] Create image upload API endpoint
- [ ] Add drag-and-drop upload UI
- [ ] Image optimization (resize, compress)
- [ ] Generate thumbnails
- [ ] Image library/media manager
- [ ] Integration with article editor

**Options:**
- Supabase Storage (recommended)
- Cloudinary
- AWS S3

---

### 7. User Authentication
**Status:** Not started
**Effort:** Large (6-10 hours)
**Description:** Currently no auth system. All admin pages are open.

**Tasks:**
- [ ] Set up Supabase Auth
- [ ] Login/logout pages
- [ ] Protected admin routes (middleware)
- [ ] User roles (admin, editor, author)
- [ ] Author attribution on articles
- [ ] Profile management

**Database:** `authors` table exists in schema

---

### 8. Article Revisions/History
**Status:** Schema ready, not implemented
**Effort:** Medium (4-6 hours)
**Description:** Track article changes over time (WordPress-style revisions)

**Tasks:**
- [ ] Apply enhanced schema with revision tracking
- [ ] Create revisions API
- [ ] Revision comparison UI
- [ ] Restore from revision
- [ ] Auto-save drafts

**Reference:** `lib/database/articles-enhanced-schema.sql`

---

## Lower Priority / Future Enhancements

### 9. SEO Enhancements
- [ ] Auto-generate meta descriptions from content
- [ ] Social media preview cards (Open Graph)
- [ ] XML sitemap generation
- [ ] Structured data (JSON-LD)
- [ ] Canonical URLs

### 10. Content Features
- [ ] Related articles
- [ ] Article series/collections
- [ ] Table of contents for long articles
- [ ] Reading progress indicator
- [ ] Print-friendly view
- [ ] Article bookmarking

### 11. RSS Feed
- [ ] Generate RSS feed from published articles
- [ ] Category-specific feeds
- [ ] Use existing `rss_feeds` table for aggregation

### 12. Newsletter Integration
- [ ] Newsletter signup form
- [ ] Send new articles via email
- [ ] Newsletter template design
- [ ] Subscriber management dashboard

**Database:** `newsletter_subscribers` table exists

### 13. Comments System
- [ ] Article comments
- [ ] Comment moderation
- [ ] Threaded replies
- [ ] Spam protection

**Database:** `comments` table exists

### 14. Analytics Dashboard
- [ ] Article view tracking
- [ ] Popular articles widget
- [ ] Traffic analytics
- [ ] User engagement metrics

### 15. Web3 Features (Long-term)
- [ ] IPFS publishing
- [ ] ENS integration
- [ ] NFT minting for articles
- [ ] Crypto payments/tips

**Note:** Web3 section exists in editor UI but disabled

---

## Technical Debt

### Code Quality
- [ ] Add TypeScript strict mode
- [ ] Fix accessibility warnings in edit page
- [ ] Add button `type` attributes
- [ ] Add loading skeletons for better UX
- [ ] Error boundary components
- [ ] Toast notifications instead of alerts

### Testing
- [ ] Unit tests for API routes
- [ ] Integration tests for article CRUD
- [ ] E2E tests for critical flows
- [ ] Test coverage reports

### Performance
- [ ] Implement proper caching strategies
- [ ] Optimize bundle size
- [ ] Lazy load editor components
- [ ] Image optimization
- [ ] Database query optimization

### Documentation
- [ ] API documentation
- [ ] Component documentation
- [ ] Deployment guide
- [ ] Contributing guide

---

## Recently Completed ✅

### Session 1 & 2 (Oct 31 - Nov 1, 2025)
- ✅ Fixed article editor (Supabase error handling)
- ✅ Fixed schema mapping (summary, read_time_minutes, word_count)
- ✅ Created admin client for RLS bypass
- ✅ Added global navigation with globe branding
- ✅ Created article viewing pages (`/articles/[slug]`)
- ✅ Implemented full article edit functionality
- ✅ Created GET and PUT endpoints for articles
- ✅ Pre-populate edit form with existing data

---

## Quick Reference

### Current Feature Status
| Feature | Status | Can Use? |
|---------|--------|----------|
| Create articles | ✅ Working | Yes |
| Edit articles | ✅ Working | Yes |
| Publish articles | ✅ Working | Yes |
| View articles | ✅ Working | Yes |
| Navigation | ✅ Working | Yes |
| Admin dashboard | ✅ Working | Yes |
| Homepage integration | ⚠️ Partial | Uses mock data |
| Categories | ⚠️ Partial | Hardcoded options |
| Tags | ⚠️ Partial | Basic support |
| Images | ⚠️ Partial | URL input only |
| Authentication | ❌ Missing | Open access |
| RLS Security | ⚠️ Disabled | Dev mode only |

### Test URLs
- Homepage: <http://localhost:3000>
- Admin Dashboard: <http://localhost:3000/admin>
- Create Article: <http://localhost:3000/admin/articles/new>
- Edit Article: Click "Edit" from dashboard
- View Article: <http://localhost:3000/articles/[slug]>

### Important Notes
- **RLS is DISABLED** - Do not deploy to production without re-enabling
- Service role key in `.env.local` is incomplete
- Currently no authentication - admin pages are open
- Mock data used on homepage only

---

**For next session:** Start with Homepage Integration (#1) or Security RLS (#2)
