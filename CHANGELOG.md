# Changelog

All notable changes to World Papers will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.2.0] - 2024-10-31

### Added - Part A & B: Foundation Setup

#### Part A: Component Gallery
- **Component Gallery Page** (`/components`) - Visual showcase of all UI components
  - Button variants (primary, secondary, ghost) in all sizes
  - Card components with hover effects and examples
  - Avatar components with multiple styles
  - Status indicators for policy statuses
  - Color palette reference with hex codes
  - Typography scale reference
- **Navigation Enhancement** - Added "Components" link to main navigation (desktop & mobile)

#### Part B: Database & Backend Infrastructure
- **Database Schema** (`lib/database/schema.sql`)
  - 11 production-ready PostgreSQL tables
  - Authors, categories, tags for organization
  - Policies with full metadata and status tracking
  - Articles with WordPress migration support (`wordpress_id`, `wordpress_url`)
  - Videos with provider integration
  - Thoughts for Policy Pulse feature
  - RSS feeds and items for FreshRSS integration
  - Comments system (polymorphic - works on articles, policies, videos)
  - Newsletter subscribers with verification workflow
  - Full-text search indexes
  - Row Level Security (RLS) policies
  - Automatic timestamp triggers
  - Performance-optimized indexes

- **Supabase Client** (`lib/supabase.ts`)
  - Configured Supabase JavaScript client
  - Complete TypeScript interfaces for all database tables
  - Safe environment variable handling with fallback
  - `isSupabaseConfigured()` helper function

- **API Layer** (`lib/api.ts`)
  - Unified API functions with automatic mock data fallback
  - Policy functions: `getPolicies()`, `getPolicyBySlug()`
  - Article functions: `getArticles()`, `getArticleBySlug()`
  - Video functions: `getVideos()`, `getVideoBySlug()`
  - Thoughts: `getThoughts()`
  - RSS: `getRSSItems()`, `getRSSFeeds()`
  - Authors: `getAuthors()`, `getAuthorById()`
  - Newsletter: `subscribeToNewsletter()`
  - Search: `searchContent()` with full-text search
  - View tracking: `incrementViewCount()`
  - All functions include JSDoc comments with examples

- **FreshRSS Integration** (`lib/freshrss.ts`)
  - Complete FreshRSS Google Reader API client
  - Authentication with FreshRSS instances
  - Fetch reading list items
  - Get unread counts
  - List subscriptions
  - Mark items as read
  - Star/unstar functionality
  - Transform FreshRSS items to World Papers format
  - `getFreshRSSClient()` factory function

- **Environment Configuration**
  - Updated `.env.example` with Supabase variables
  - Added FreshRSS configuration variables
  - Safe fallback when variables not set

- **Documentation**
  - `docs/DATABASE-SETUP.md` - Step-by-step Supabase setup guide
  - `docs/SETUP-COMPLETE.md` - Comprehensive Part B summary
  - JSDoc comments throughout codebase
  - Type definitions for all database entities

### Changed
- **Navigation**: Updated from buttons to links with proper hrefs
- **Mock Data**: Now serves as intelligent fallback instead of hardcoded source
- **Environment**: Expanded `.env.example` with new configuration options

### Technical Details
- **Dependencies Added**:
  - `@supabase/supabase-js` v2.78.0
  - `tailwindcss-animate` v1.0.7
  - `@tailwindcss/typography` v0.5.19

- **New Routes**:
  - `/components` - Component gallery page

- **New Modules**:
  - `lib/supabase.ts` - Database client
  - `lib/api.ts` - API functions layer
  - `lib/freshrss.ts` - RSS integration
  - `lib/database/schema.sql` - Database schema

### Developer Experience
- ✅ Full TypeScript support with autocomplete
- ✅ Works immediately with mock data (no setup required)
- ✅ Seamless transition when database configured
- ✅ Comprehensive error handling
- ✅ JSDoc comments for all public APIs
- ✅ Step-by-step setup guides

---

## [0.1.0] - 2024-10-30

### Initial Release
- **Homepage** with three-column layout
  - Policy Intelligence Feed
  - Expert Analysis
  - Policy Pulse (community thoughts)
- **Navy Blue Theme** - Professional color scheme
- **Responsive Design** - Mobile, tablet, desktop support
- **Mock Data** - Sample policies, articles, videos, thoughts
- **Component Library**:
  - Button component (3 variants, 3 sizes)
  - Card component with hover effects
  - Avatar component
  - StatusDot component for policy statuses
- **Next.js 14 App Router** setup
- **Tailwind CSS** styling system
- **TypeScript** configuration
- **Development Environment** - Hot reload, Fast Refresh

---

## Future Releases

### [0.3.0] - Planned (Part C)
- WordPress content migration tools
- FreshRSS sync automation
- Homepage customization
- Admin pages for content management
- Seed scripts for sample data

### [0.4.0] - Planned (Content & Media)
- Image optimization
- Full SEO implementation
- Sitemap generation
- Meta tags and structured data

### [0.5.0] - Planned (Features)
- Newsletter integration
- Analytics setup
- Performance optimization
- Testing suite

### [1.0.0] - Planned (Production Launch)
- Security hardening
- Production deployment
- Monitoring and logging
- Custom domain setup
- Launch! 🚀

---

## Version Naming

- **Major version (X.0.0)**: Breaking changes or major milestones
- **Minor version (0.X.0)**: New features (Parts A, B, C, etc.)
- **Patch version (0.0.X)**: Bug fixes and minor improvements
