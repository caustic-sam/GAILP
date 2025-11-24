# Nomenclature & Taxonomy Guide

**Project**: World Papers (GAILP - Global AI & Identity Policy)
**Last Updated**: 2025-01-23
**Purpose**: Standardized naming conventions across the entire application

---

## Table of Contents

1. [Section Naming](#section-naming)
2. [Route Structure](#route-structure)
3. [Feature Flag IDs](#feature-flag-ids)
4. [Database Tables](#database-tables)
5. [Component Naming](#component-naming)
6. [File Naming Conventions](#file-naming-conventions)

---

## Section Naming

### Official Section Names (User-Facing)

| Section ID | Display Name | Description | Route |
|-----------|--------------|-------------|-------|
| `policy-updates` | **Policy Updates** | Latest policy announcements and changes | `/policy-updates` |
| `blog` | **Think Tank** | Expert analysis and commentary | `/blog` |
| `videos` | **Global Service Announcement** | Video content and announcements | `/videos` |
| `policy-pulse` | **Policy Pulse** | Live policy monitoring dashboard | `/policy-pulse` |
| `policies` | **Policies** | Policy documentation and resources | `/policies` |
| `articles` | **Articles** | Article archive (internal) | `/articles` |
| `about` | **About** | About the organization | `/about` |

### Historical Names (Deprecated)

| Old Name | New Name | Date Changed |
|----------|----------|--------------|
| "Expert Blog" | "Think Tank" | 2025-01-23 |
| "Live Hub" | "Global Service Announcement" | 2025-01-23 |
| "GSA" (abbreviation) | "Global Service Announcement" (full) | 2025-01-23 |
| "Research" | "Policies" | 2025-01-23 |

---

## Route Structure

### Public Routes

```
/                      → Homepage
/policy-updates        → Policy feed
/blog                  → Think Tank (articles)
/videos                → Global Service Announcement
/policy-pulse          → Live monitoring
/policies              → Policy documentation
/about                 → About page
/contact               → Contact page
/glossary              → Term glossary
/quick-posts           → Quick posts feed
```

### Article Routes

```
/articles              → Article list (all articles)
/articles/[slug]       → Individual article view
/blog                  → Blog/Think Tank (same as articles)
```

### Admin Routes

```
/admin                 → Publishing Desk (dashboard)
/admin/articles/new    → New article editor
/admin/articles/[id]/edit → Edit existing article
/admin/media           → Media Vault
/admin/studio          → Studio (workspace)
/admin/settings        → Feature flags & settings
/admin/quick-posts     → Quick posts management
```

### API Routes

```
/api/articles          → Article CRUD
/api/admin/articles    → Admin article management
/api/stats             → Site statistics
/api/videos            → Video feed
/api/feeds             → RSS feeds
/api/health            → Health check
```

---

## Feature Flag IDs

### Navigation Flags

| Flag ID | Display Name | Controls |
|---------|--------------|----------|
| `showPolicyPulse` | Policy Pulse | Policy Pulse nav link |
| `showVideos` | Videos | Videos nav link |
| `showArticles` | Articles | Articles nav link |
| `showPolicies` | Policies | Policies nav link |
| `showBlog` | Think Tank | Think Tank nav link |

### Homepage Section Flags

| Flag ID | Display Name | Controls |
|---------|--------------|----------|
| `showHeroSection` | Hero Section | Main banner with tagline |
| `showDataBoxes` | Data Boxes | Rotating statistics (247, 89, 156) |
| `showPolicyFeed` | Policy Intelligence Feed | Left column policy updates |
| `showFeaturedArticle` | Featured Article | Center column highlighted article |
| `showVideoInsights` | Video Insights | Right column video feed |
| `showNewsletter` | Newsletter Signup | Bottom newsletter form |
| `showResourceLibrary` | Resource Library | Bottom resource cards |

---

## Database Tables

### Core Tables

| Table Name | Purpose | Primary Key |
|-----------|---------|-------------|
| `articles` | Article content | `id` (UUID) |
| `authors` | Article authors | `id` (UUID) |
| `user_profiles` | User accounts | `id` (UUID) |
| `categories` | Content categories | `id` (UUID) |
| `tags` | Content tags | `id` (UUID) |
| `rss_feeds` | External RSS feeds | `id` (UUID) |

### Article Schema

```sql
-- Key columns
id                 UUID PRIMARY KEY
title              TEXT NOT NULL
slug               TEXT NOT NULL UNIQUE
content            TEXT NOT NULL
summary            TEXT NOT NULL
excerpt            TEXT
author_id          UUID → authors(id)
category_id        UUID → categories(id)
status             TEXT ('draft'|'published'|'archived'|'scheduled')
published_at       TIMESTAMPTZ
scheduled_for      TIMESTAMPTZ
is_featured        BOOLEAN DEFAULT FALSE
view_count         INTEGER DEFAULT 0
revision_count     INTEGER DEFAULT 0
```

---

## Component Naming

### UI Components (Reusable)

```
components/ui/
  Button.tsx           → <Button variant="primary|secondary|accent|coming-soon" />
  Card.tsx             → <Card hover={boolean} />
  Skeleton.tsx         → <Skeleton className="..." />
  ComingSoonModal.tsx  → <ComingSoonModal />
```

### Widget Components (Feature-Specific)

```
components/widgets/
  DataBoxes.tsx        → Homepage rotating stats
  TermOfDay.tsx        → Term of the day widget
  WorldClocks.tsx      → Multiple timezone clocks
  AnimatedGlobe.tsx    → 3D globe animation
```

### Layout Components

```
components/
  Header.tsx           → Top navigation
  Footer.tsx           → Site footer
  RightSidebar.tsx     → Admin navigation sidebar
  Navigation.tsx       → Shared nav component
```

---

## File Naming Conventions

### Pages (App Router)

```
app/
  page.tsx             → Homepage
  layout.tsx           → Root layout
  [dynamic]/page.tsx   → Dynamic route
  admin/
    page.tsx           → /admin (Publishing Desk)
    articles/
      new/page.tsx     → /admin/articles/new
      [id]/edit/page.tsx → /admin/articles/:id/edit
```

### API Routes

```
app/api/
  articles/route.ts    → GET/POST /api/articles
  articles/[slug]/route.ts → GET /api/articles/:slug
  admin/
    articles/route.ts  → GET/POST /api/admin/articles
    articles/[id]/route.ts → PUT/DELETE /api/admin/articles/:id
```

### Library Files

```
lib/
  supabase.ts          → Supabase client setup
  feature-flags.ts     → Feature flag management
  auth/
    types.ts           → Auth TypeScript types
  database/
    schema.sql         → Database schema
```

### Documentation Files

```
docs/
  DEPLOYMENT-GUIDE.md          → Deployment instructions
  POST-DEPLOYMENT-CHECKLIST.md → Testing checklist
  DRAFTS-AUTH-IMPLEMENTATION.md → Security docs
  NOMENCLATURE-TAXONOMY.md     → This file
```

---

## Constant Values

### Section IDs (Feature Flags)

```typescript
// lib/feature-flags.ts
const SECTION_IDS = {
  // Navigation
  POLICY_PULSE: 'showPolicyPulse',
  VIDEOS: 'showVideos',
  ARTICLES: 'showArticles',
  POLICIES: 'showPolicies',
  BLOG: 'showBlog',

  // Homepage
  HERO_SECTION: 'showHeroSection',
  DATA_BOXES: 'showDataBoxes',
  POLICY_FEED: 'showPolicyFeed',
  FEATURED_ARTICLE: 'showFeaturedArticle',
  VIDEO_INSIGHTS: 'showVideoInsights',
  NEWSLETTER: 'showNewsletter',
  RESOURCE_LIBRARY: 'showResourceLibrary',
} as const;
```

### Article Status Values

```typescript
type ArticleStatus = 'draft' | 'scheduled' | 'published' | 'archived';
```

### User Roles

```typescript
type UserRole = 'admin' | 'publisher' | 'contributor' | 'reader';
```

---

## Naming Best Practices

### ✅ DO:

1. **Use kebab-case for routes**: `/policy-updates`, `/think-tank`
2. **Use PascalCase for components**: `DataBoxes.tsx`, `AnimatedGlobe.tsx`
3. **Use camelCase for variables**: `showPolicyFeed`, `featuredArticle`
4. **Use SCREAMING_SNAKE_CASE for constants**: `DEFAULT_FLAGS`, `STORAGE_KEY`
5. **Be descriptive**: `showFeaturedArticle` not `showFA`
6. **Match display names to routes**: "Policy Updates" → `/policy-updates`

### ❌ DON'T:

1. **Mix naming conventions**: `show-policy-feed` (wrong case)
2. **Use abbreviations**: `GSA` instead of full name
3. **Rename without updating all references**
4. **Use ambiguous names**: `item`, `data`, `temp`

---

## Migration Checklist

When renaming a section:

- [ ] Update display name in `components/Header.tsx`
- [ ] Update route in `app/` directory
- [ ] Update feature flag in `lib/feature-flags.ts`
- [ ] Update settings page `app/admin/settings/page.tsx`
- [ ] Update navigation in `components/RightSidebar.tsx`
- [ ] Update all internal references
- [ ] Add to deprecation table in this document
- [ ] Test all affected routes
- [ ] Update deployment documentation

---

## Reference Files

| File Path | Purpose |
|-----------|---------|
| `components/Header.tsx:11-18` | Main navigation items |
| `components/RightSidebar.tsx` | Sidebar navigation |
| `lib/feature-flags.ts` | Feature flag definitions |
| `app/admin/settings/page.tsx:38-54` | Settings UI |
| `lib/database/schema.sql:94-140` | Database schema |

---

## Questions & Clarifications

**Q: Why "Think Tank" instead of "Blog"?**
A: User preference. "Think Tank" conveys expert analysis better than generic "Blog".

**Q: Why is the route `/blog` but display name "Think Tank"?**
A: SEO and URL consistency. The route `/blog` is standard, but display name is user-facing branding.

**Q: What's the difference between `/articles` and `/blog`?**
A: They're the same content. `/articles` is technical internal route, `/blog` is public-facing.

**Q: Why "Global Service Announcement" instead of "GSA"?**
A: Full name is clearer for users. Abbreviations should only be used when space-constrained.

---

**Maintained By**: Development Team
**Last Review**: 2025-01-23
**Next Review**: Before each major deployment
