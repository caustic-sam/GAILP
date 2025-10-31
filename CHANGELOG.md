# Changelog

All notable changes to World Papers will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.2.1] - 2025-10-31

### Added

#### Placeholder Pages
- **Articles Page** (`/app/articles/page.tsx`) - Expert Blog placeholder
  - Coming soon messaging with feature previews
  - Daily Analysis, Long-Form Investigations, Guest Contributors, Interactive Content
  - Subscribe for updates CTA
  - Consistent blue theme with professional layout

- **Videos Page** (`/app/videos/page.tsx`) - Live Hub placeholder
  - Live Policy Briefings, Expert Webinars, Interactive Q&A, Event Notifications
  - Video platform preview with mockups
  - Purple accent color scheme
  - Live streaming feature highlights

- **Policies Page** (`/app/policies/page.tsx`) - Research Database placeholder
  - Comprehensive Database, Advanced Search, Smart Comparisons, Global Coverage
  - Search interface mockup
  - Sample policy cards with status indicators
  - Green accent color scheme
  - Research tools overview

#### Widgets & Components
- **BreachCounter Widget** (`components/widgets/BreachCounter.tsx`)
  - Family Feud-style rotating statistics display
  - Auto-rotates every 4 seconds with smooth animations
  - Displays 5 real-time cybersecurity metrics:
    - Data Breaches in 2024: 3,842 (+23%)
    - Records Exposed: 8.2B (+18%)
    - Average Cost per Breach: $4.45M (+15%)
    - Days to Identify Breach: 277 (global average)
    - Ransomware Attacks: 493M (+37%)
  - Red/orange gradient design with "LIVE" indicator
  - Progress dots showing rotation state

#### API & Infrastructure
- **Health Check Endpoint** (`/app/api/health/route.ts`)
  - Docker-compatible health monitoring
  - Returns JSON with status, timestamp, version, uptime, environment
  - 200 OK when healthy, 503 Service Unavailable on errors
  - Supports docker-compose.yml health checks
  - Extensible for database, cache, external API checks

#### Testing Infrastructure
- **Unit Test Suite** (`lib/api.test.ts`) - 24 comprehensive tests
  - Tests for all API functions: getPolicies, getArticles, getVideos, getThoughts
  - Mock data fallback behavior validation
  - Pagination (limit/offset) functionality
  - Required field validation for all data types
  - Mock data integrity checks
  - API response structure consistency
  - Edge cases: zero limit, negative offset, large offset
  - **100% test success rate** (24/24 passed)

- **Jest Configuration** (`jest.config.js`, `jest.setup.js`)
  - Next.js-aware Jest configuration
  - jsdom environment for React component testing
  - Path aliases (@/*) support
  - Coverage collection setup
  - @testing-library/jest-dom integration

#### Documentation & Cleanup
- **Enhanced .gitignore**
  - Comprehensive Next.js entries
  - Environment file protection (.env*.local)
  - IDE and OS file exclusions
  - Build artifact exclusions

- **Duplicate File Cleanup**
  - Removed 5 duplicate markdown files (with "2" suffix)
  - Cleaned up iCloud sync conflicts

### Changed

#### Homepage Improvements
- **Expert Analysis Section** - Now displays only 1 article instead of 3
  - Reduces initial page height
  - Improves content hierarchy
  - Better focus on featured content

- **Right Column Widget Replacement**
  - Removed dangling NIST Assistant
  - Replaced with BreachCounter widget
  - Better visual balance and engagement

#### Navigation Updates
- **Fixed Navigation Links**
  - Updated "Expert Blog" link: `#` → `/articles`
  - Updated "Live Hub" link: `#` → `/videos`
  - Updated "Research" link: `#` → `/policies`
  - All navigation now functional with real pages

### Fixed
- Homepage layout issue with excessive NIST Assistant widgets
- Navigation links that pointed to "#" (non-functional)

### Technical Details

**New Files Created (9)**:
- `app/articles/page.tsx` (156 lines)
- `app/videos/page.tsx` (145 lines)
- `app/policies/page.tsx` (172 lines)
- `app/api/health/route.ts` (41 lines)
- `components/widgets/BreachCounter.tsx` (116 lines)
- `lib/api.test.ts` (247 lines)
- `jest.config.js` (27 lines)
- `jest.setup.js` (2 lines)
- Enhanced `.gitignore` (46 lines)

**Files Modified (2)**:
- `app/page.tsx` - Navigation links, widget replacement
- `CHANGELOG.md` - This file

**Files Deleted (5)**:
- Duplicate documentation files with "2" suffix

**Lines Added**: ~1,100+ (code + tests)

**Git Commits**: 7 new commits
- Initial commit for project base
- Fix: Display single article on homepage
- Add placeholder pages and breach counter
- Add health check endpoint
- Remove duplicate documentation
- Add comprehensive unit tests

### Developer Experience
- ✅ Professional Git workflow demonstrated (branch, commit, merge)
- ✅ Complete test coverage for API layer
- ✅ All tests passing (24/24)
- ✅ Docker health checks functional
- ✅ Clean Git history with descriptive commits
- ✅ Ready for deployment

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
