# Technical Debt & Known Issues

This document tracks technical debt, known issues, and items requiring future attention for the GAILP platform.

**Last Updated:** 2025-11-12

---

## 🔴 **Critical Issues**

### 1. Supabase Schema Cache Error
**Issue:** `read_time_minutes` column error when saving/publishing articles
```
❌ Error: Could not find the 'read_time_minutes' column of 'articles' in the schema cache
PGRST204
```

**Impact:**
- **BLOCKS:** Article publishing functionality
- **BLOCKS:** Draft saving in Studio
- **SEVERITY:** Critical - Studio is completely broken

**Root Cause:**
- Column exists in schema (`lib/database/schema.sql:115`)
- Supabase PostgREST schema cache is stale/not refreshed
- Production database may not have the column

**Fix Required:**
1. Check if column exists in production: `SELECT column_name FROM information_schema.columns WHERE table_name = 'articles';`
2. If missing, run migration: `ALTER TABLE articles ADD COLUMN read_time_minutes INTEGER;`
3. Reload Supabase PostgREST schema cache via Dashboard → API Settings → "Reload schema cache"

**Estimated Time:** 10-15 minutes
**Owner:** Database admin / DevOps

---

### 2. Article Scheduling Non-Functional
**Issue:** Cannot manipulate scheduler, scheduled articles don't auto-publish

**Impact:**
- Users can't schedule future article releases
- Manual publishing required for all content

**Root Cause:**
- No cron job or background process to check `scheduled_publish_date`
- Frontend scheduler UI may have bugs

**Fix Required:**
1. Implement Supabase pg_cron extension
2. Create scheduled function to auto-publish articles
3. Test scheduler UI in Studio

**Estimated Time:** 2-3 hours
**Priority:** High
**See:** FUTURE-FEATURES.md Section 4

---

## 🟡 **High Priority Tech Debt**

### 3. Mock Data Usage Throughout Site
**Issue:** Homepage and Policy Updates use hardcoded mock data instead of real database content

**Affected Components:**
- `lib/mockData.ts` - Mock policies, articles, social posts, videos
- `app/page.tsx:35-37` - Policy cards use mockPolicies
- `app/page.tsx:270` - Featured article uses mockArticles[0]
- Policy Pulse section uses mockSocialPosts

**Impact:**
- Content never changes unless manually updated in code
- No admin control over featured content
- Git commits required to update homepage

**Fix Required:**
1. Replace mockPolicies with real-time feed aggregation
2. Add `featured` flag to articles table
3. Create admin UI to mark articles as featured
4. Pull social posts from database or Twitter API

**Estimated Time:** 6-8 hours
**Priority:** High
**Related:** FUTURE-FEATURES.md Section 3

---

### 4. Placeholder/Non-Functional Buttons
**Issue:** Multiple buttons show "Coming Soon" modal instead of working

**Affected Elements:**
- Homepage: "Join Community" button
- Homepage: "Share a quick policy insight" (Policy Pulse section)
- Footer: "Policy Database", "Research Library", "API Access" links
- Newsletter subscription buttons

**Impact:**
- User confusion when clicking CTAs
- Reduced engagement due to non-functional features

**Fix Options:**
1. **Short-term:** Add tooltips explaining "Coming Soon"
2. **Medium-term:** Implement actual functionality (see FUTURE-FEATURES.md)
3. **Alternative:** Remove buttons until features are ready

**Estimated Time:** 1-2 hours for tooltips, 20+ hours for full implementation
**Priority:** Medium

---

### 5. Video Insights Section Empty
**Issue:** "Video Insights" section shows placeholder content, no real videos

**Impact:**
- Empty content section reduces site credibility
- Missed opportunity for video content engagement

**Fix Required:**
- Integrate YouTube RSS feeds for policy channels
- Or create video curation admin interface
- Display thumbnails, titles, metadata

**Estimated Time:** 2-3 hours
**Priority:** Medium
**See:** FUTURE-FEATURES.md Section 5

---

## 🟢 **Medium Priority Tech Debt**

### 6. Homepage Featured Article Static
**Issue:** "Dr. Sarah Chen" article hardcoded, never changes

**Current State:**
```typescript
{mockArticles.slice(0, 1).map((article, idx) => (
  // Always shows first mock article
))}
```

**Impact:**
- Stale homepage content
- No way to promote new articles

**Fix Required:**
- Query latest `featured=true` article from database
- Fallback to most recent published article
- Add featured toggle in Studio

**Estimated Time:** 1-2 hours
**Priority:** Medium
**See:** FUTURE-FEATURES.md Section 3

---

### 7. No Image Upload for Feed Items
**Issue:** FreshRSS items without images show placeholders, no way to assign custom images

**Impact:**
- Visual inconsistency on homepage
- Less engaging feed presentations

**Fix Required:**
- Create `feed_image_overrides` table
- Admin UI to browse and assign images to feed items
- Fallback hierarchy: custom → feed image → placeholder

**Estimated Time:** 3-4 hours
**Priority:** Medium
**See:** FUTURE-FEATURES.md Section 2

---

### 8. Glossary Management Hard-Coded
**Issue:** No admin interface to add/update glossary terms

**Current State:**
- Terms defined in component code
- Requires code changes to update glossary

**Impact:**
- Can't easily expand glossary
- Non-technical users can't contribute definitions

**Fix Required:**
- Create `glossary_terms` database table
- Admin CRUD interface at `/admin/glossary`
- Category management

**Estimated Time:** 4-5 hours
**Priority:** Low
**See:** FUTURE-FEATURES.md Section 9

---

## 📊 **Data Quality & Accuracy**

### 9. Policy Sources Static Timestamps
**Issue:** Policy source cards show timestamps like "3 hours ago" but never update

**Current State:**
- Timestamps hardcoded in mockData.ts
- No real-time fetching from policy sources

**Impact:**
- Misleading users about content freshness
- Reduced trust in platform accuracy

**Fix Required:**
- Implement RSS feed aggregation for policy sources
- Auto-update timestamps from feed publish dates
- Track last_fetched timestamp

**Estimated Time:** 4-6 hours (Phase 1 from POLICY-SOURCES-STATUS.md)
**Priority:** High

---

### 10. Data Tab Accuracy Unknown
**Issue:** Need to verify accuracy of statistics and ensure ongoing accuracy

**Questions:**
- Where does "247 Policy Updates" come from?
- How often do statistics update?
- Are "Countries Monitored" accurate?

**Fix Required:**
- Audit all data sources
- Document update frequency
- Create monitoring dashboard
- Implement data freshness alerts

**Estimated Time:** 3-4 hours
**Priority:** Medium
**See:** FUTURE-FEATURES.md Section 10

---

## 🔧 **Code Quality Issues**

### 11. Missing Button Type Attributes
**Issue:** ESLint warnings for buttons without `type` attribute

**Affected Files:**
- `app/page.tsx` - 9 buttons missing `type="button"`

**Impact:**
- Potential form submission bugs
- Failed accessibility checks

**Fix:** Add `type="button"` to all non-submit buttons

**Estimated Time:** 15 minutes
**Priority:** Low

---

### 12. Deprecated Lucide React Icons
**Issue:** Using deprecated `Twitter` and `Linkedin` icons

**Affected Files:**
- `app/page.tsx:8` - Import statements
- `app/page.tsx:522,525` - Icon usage

**Fix:** Update to `X` (formerly Twitter) and `LinkedinIcon`

**Estimated Time:** 5 minutes
**Priority:** Low

---

### 13. ARIA Attribute Validation Error
**Issue:** Invalid ARIA attribute in Policy tab navigation

**Location:** `app/page.tsx:134`
```typescript
aria-pressed="{expression}" // Should be boolean
```

**Fix:** Use proper boolean expression `aria-pressed={activeTab === tab}`

**Estimated Time:** 2 minutes
**Priority:** Low

---

### 14. Links Without Discernible Text
**Issue:** Social media links in footer lack accessible text

**Location:** `app/page.tsx:521,524,527`

**Fix:** Add `aria-label` or `title` attributes to icon-only links

**Estimated Time:** 5 minutes
**Priority:** Low (but impacts accessibility score)

---

## 🏗️ **Infrastructure & DevOps**

### 15. No Automated Testing
**Issue:** Zero test coverage - no unit tests, integration tests, or E2E tests

**Impact:**
- High risk of regressions
- Difficult to refactor with confidence
- Manual testing required for every change

**Fix Required:**
1. Set up Jest + React Testing Library
2. Add Playwright for E2E tests
3. Target 70%+ code coverage
4. CI/CD pipeline integration

**Estimated Time:** 12-20 hours initial setup
**Priority:** High (but not blocking)

---

### 16. Environment Variable Documentation Incomplete
**Issue:** Missing documentation for all required env vars

**Current State:**
- `.env.example` exists but may be incomplete
- FreshRSS config exists but not documented in main README

**Fix Required:**
- Audit all `process.env.*` usage
- Update `.env.example` with all vars
- Add setup instructions to README

**Estimated Time:** 1 hour
**Priority:** Medium

---

### 17. No Error Monitoring/Logging
**Issue:** No Sentry, LogRocket, or similar error tracking

**Impact:**
- Production errors go unnoticed
- Difficult to debug user-reported issues
- No visibility into error frequency

**Fix Required:**
- Integrate Sentry or similar service
- Add error boundaries
- Track key user journeys

**Estimated Time:** 3-4 hours
**Priority:** Medium

---

## 📱 **Mobile & Performance**

### 18. Mobile Navigation Experience
**Issue:** Mobile menu functional but could be improved

**Potential Improvements:**
- Add swipe-to-close gesture
- Animate menu transitions
- Improve touch target sizes

**Estimated Time:** 2-3 hours
**Priority:** Low

---

### 19. Image Optimization
**Issue:** No next/image usage for optimized loading

**Current State:**
- Using standard `<img>` tags
- No lazy loading
- No responsive image srcsets

**Fix Required:**
- Migrate to Next.js `<Image>` component
- Implement blur placeholders
- Set up image CDN (Cloudinary/Vercel)

**Estimated Time:** 4-6 hours
**Priority:** Medium

---

### 20. Bundle Size Not Optimized
**Issue:** Haven't audited bundle size or implemented code splitting

**Fix Required:**
- Run `next build` analysis
- Implement dynamic imports for large components
- Remove unused dependencies

**Estimated Time:** 2-3 hours
**Priority:** Low

---

## 🔐 **Security**

### 21. No Rate Limiting
**Issue:** API routes lack rate limiting

**Impact:**
- Vulnerable to DoS attacks
- Potential API abuse
- Increased costs from excessive requests

**Fix Required:**
- Implement Upstash Redis rate limiting
- Add per-user and per-IP limits
- Return 429 status codes

**Estimated Time:** 2-3 hours
**Priority:** Medium

---

### 22. CSRF Protection
**Issue:** No explicit CSRF token implementation

**Current State:**
- Next.js provides some default protections
- Should verify for all state-changing operations

**Fix Required:**
- Audit all POST/PUT/DELETE routes
- Implement CSRF tokens for sensitive operations
- Add documentation

**Estimated Time:** 3-4 hours
**Priority:** Medium

---

## 📈 **Analytics & Monitoring**

### 23. No Analytics Integration
**Issue:** No Google Analytics, Plausible, or similar tracking

**Impact:**
- Can't measure user engagement
- Unknown which features are used
- No conversion tracking

**Fix Required:**
- Integrate privacy-friendly analytics (Plausible recommended)
- Set up event tracking
- Create dashboard for key metrics

**Estimated Time:** 2-3 hours
**Priority:** Medium

---

### 24. No Performance Monitoring
**Issue:** No Core Web Vitals tracking, Lighthouse CI, or similar

**Fix Required:**
- Integrate Vercel Analytics or SpeedCurve
- Set up Lighthouse CI
- Monitor LCP, FID, CLS metrics

**Estimated Time:** 2-3 hours
**Priority:** Low

---

## 🔄 **Refactoring Opportunities**

### 25. Component Organization
**Issue:** Some components are large and could be split

**Examples:**
- `app/page.tsx` is 550+ lines
- Could extract PolicyUpdatesSection, FeaturedArticle, etc.

**Benefits:**
- Better code organization
- Easier testing
- Improved maintainability

**Estimated Time:** 3-4 hours
**Priority:** Low

---

### 26. Duplicate Styles
**Issue:** Some Tailwind class combinations repeated frequently

**Fix Required:**
- Create reusable component variants
- Extract common patterns to design system
- Use @apply for repeated combinations

**Estimated Time:** 2-3 hours
**Priority:** Low

---

## 📝 **Documentation**

### 27. API Documentation Missing
**Issue:** No OpenAPI/Swagger docs for API routes

**Fix Required:**
- Document all API endpoints
- Add request/response schemas
- Include authentication requirements
- Generate with tools like tRPC or Swagger

**Estimated Time:** 4-6 hours
**Priority:** Low

---

### 28. Component Documentation
**Issue:** No Storybook or component library documentation

**Fix Required:**
- Set up Storybook
- Document all reusable components
- Add usage examples

**Estimated Time:** 8-12 hours
**Priority:** Low

---

## 🎯 **Priority Matrix**

| Issue | Severity | Effort | Priority | Blocks Production? |
|-------|----------|--------|-----------|--------------------|
| #1 - read_time_minutes error | Critical | 15m | P0 | YES |
| #2 - Article scheduling | High | 2-3h | P1 | Partial |
| #3 - Mock data usage | High | 6-8h | P1 | No |
| #9 - Policy timestamps | High | 4-6h | P1 | No |
| #4 - Placeholder buttons | Medium | 1-2h | P2 | No |
| #5 - Video section | Medium | 2-3h | P2 | No |
| #15 - No testing | High | 12-20h | P2 | No |
| #17 - Error monitoring | Medium | 3-4h | P2 | No |
| #21 - Rate limiting | Medium | 2-3h | P2 | No |
| All others | Low-Medium | Varies | P3 | No |

---

## 🚀 **Recommended Action Plan**

### **Week 1: Critical & Blocking Issues**
1. Fix Supabase schema cache (15 mins)
2. Implement article scheduling (2-3 hrs)
3. Replace mock data with real feeds (6-8 hrs)

### **Week 2: High-Value Quick Wins**
1. Video insights integration (2-3 hrs)
2. Featured article dynamic loading (1-2 hrs)
3. Feed image assignment system (3-4 hrs)

### **Month 1: Foundation & Quality**
1. Add automated testing (12-20 hrs)
2. Integrate error monitoring (3-4 hrs)
3. Implement rate limiting (2-3 hrs)
4. Add analytics (2-3 hrs)

### **Month 2-3: Polish & Enhancement**
1. Code quality improvements (ESLint issues)
2. Performance optimizations
3. Documentation improvements
4. Refactoring opportunities

---

## 📊 **Metrics to Track**

- **Code Coverage:** Target 70%+
- **Lighthouse Score:** Target 90+ across all metrics
- **Bundle Size:** Target <200KB initial JS
- **Error Rate:** Target <0.1% of requests
- **Page Load Time:** Target <2s (p95)

---

**Next Review:** 2025-11-19
**Owner:** Development Team
