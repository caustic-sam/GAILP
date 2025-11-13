# Session Issues - 2025-11-12

**Reported By:** JdM
**Date:** 2025-11-12
**Status:** Needs Triage

---

## 🔴 Critical Issues (Blocking Core Functionality)

### 1. **Supabase Schema Cache Error - `summary` Column**
**Severity:** Critical
**Impact:** Cannot publish articles

```
❌ Error: Could not find the 'summary' column of 'articles' in the schema cache
Code: PGRST204
```

**Notes:**
- Same issue as `read_time_minutes` column
- Supabase PostgREST schema cache not refreshed
- **Action:** Need to reload schema cache in Supabase dashboard

---

### 2. **Cannot Upload Images for New Post**
**Severity:** Critical
**Impact:** Cannot add images to articles

**Notes:**
- Media upload functionality broken
- Blocks article creation workflow
- **Action:** Investigate upload endpoint and permissions

---

### 3. **Avatar Not Appearing (caustic-sam)**
**Severity:** High
**Impact:** GitHub avatar integration not working

**Notes:**
- Username shows correctly
- Avatar not displaying despite integration code
- **Action:** Debug avatar fetch and display logic

---

## 🟡 High Priority Issues

### 4. **Banner Card Numbers Not Updating**
**Severity:** High
**Impact:** Static data on homepage

**Notes:**
- Policy update counts still static
- Numbers don't reflect real-time data
- **Action:** Connect to live data sources

---

### 5. **Dr. Chen Article Still Static**
**Severity:** High
**Impact:** Featured article not dynamic despite code changes

**Notes:**
- Dynamic article fetching implemented but not working
- Falls back to mock data (Dr. Sarah Chen)
- **Action:** Debug API endpoint and article fetching

---

### 6. **Policy Links Returning 404**
**Severity:** High
**Impact:** Broken user experience

**Notes:**
- Some policy card links broken
- Need verification before displaying
- **Action:** Validate all external URLs, add error handling

---

## 🟢 Medium Priority Issues

### 7. **Orange Button Color Needs Refinement**
**Severity:** Medium
**Impact:** Design polish

**Request:**
> "The orange button looks good but let's choose the exact color. Maybe spend time pondering color swatches."

**Current:** `bg-orange-500 hover:bg-orange-600`
**Action:** Provide color swatch options for selection

---

### 8. **Policy Card Orange Outline**
**Severity:** Medium
**Impact:** Visual clarity

**Request:**
> "Remove orange outline. We had that for items which were non-functional."

**Current:** `border-2 border-orange-500`
**Action:** Remove outline now that cards are functional

---

### 9. **Mouse Cursor Not Changing on Policy Feed Categories**
**Severity:** Low
**Impact:** UX polish

**Notes:**
- Hovering over categories doesn't show pointer cursor
- **Action:** Add `cursor-pointer` class

---

## 🔵 Feature Requests

### 10. **Video Insights Curation System**
**Severity:** Medium
**Priority:** P2

**Request:**
> "Video Insights should have a way for us to showcase a video from YouTube or wherever. These should also be scheduled."

**Requirements:**
- Manual video curation interface
- YouTube URL input
- Scheduling capability
- Admin UI in Studio

**Estimated Time:** 2-3 hours

---

### 11. **System-Wide Scheduling System**
**Severity:** High
**Priority:** P1

**Question:**
> "DO WE NEED A SYSTEM SCHEDULING SYSTEM?"

**Use Cases:**
- Article publishing (already identified)
- Video showcasing
- Policy updates
- Content rotation

**Options:**
1. Supabase pg_cron (database-level)
2. Vercel Cron Jobs (API-level)
3. GitHub Actions (external scheduler)

**Recommendation:** Yes - implement Supabase pg_cron for unified scheduling

**Estimated Time:** 3-4 hours

---

### 12. **Simple Signup Screen + Backend User Creation**
**Severity:** Medium
**Priority:** P2

**Request:**
> "Let's build a simple signup screen and allow me to create users on the backend for testing. We will wire it up fully later. For now I just need a desired username and password to create test users and RBAC."

**Requirements:**
- Basic signup form (username + password)
- Admin interface to create test users
- RBAC role assignment
- No OAuth for now (manual testing only)

**Estimated Time:** 1-2 hours

---

### 13. **Media Vault Thumbnail Size**
**Severity:** Low
**Priority:** P3

**Request:**
> "Let's make the thumbnails smaller in the media vault. I want to see 8 images across."

**Current:** Likely 4 columns
**Target:** 8 columns (grid-cols-8)

**Estimated Time:** 15 minutes

---

### 14. **Media Metadata Editor**
**Severity:** Medium
**Priority:** P2

**Request:**
> "When I click on an image I want to be taken to a WordPress-like screen where I can add extra metadata. Right now I can only download the image. This may be a monitor feature."

**Requirements:**
- Click image → open metadata editor
- Fields: alt text, caption, description, tags
- WordPress-style interface
- Save to database

**Estimated Time:** 2-3 hours

---

## 🚨 Epic-Level Work Identified

### 15. **Article/Post Creation Module Overhaul**
**Severity:** Critical
**Priority:** P0

**Quote:**
> "Basically the whole new post/article (is it a module) experience needs major work. Probably its own epic."

**Known Issues:**
- Schema cache errors (`read_time_minutes`, `summary`)
- Image upload broken
- Publishing failures
- Scheduling non-functional

**Scope:**
- Fix all Supabase schema issues
- Rebuild image upload flow
- Implement proper error handling
- Add field validation
- Improve UX throughout

**Recommendation:** Create dedicated epic in Jira
**Estimated Time:** 8-12 hours (full overhaul)

---

## 📊 Priority Matrix

| Issue | Severity | Effort | Priority | Blocker? |
|-------|----------|--------|----------|----------|
| #1 - Schema cache (summary) | Critical | 10m | P0 | YES |
| #2 - Image upload broken | Critical | 1-2h | P0 | YES |
| #15 - Article creation epic | Critical | 8-12h | P0 | YES |
| #3 - Avatar not showing | High | 30m | P1 | No |
| #4 - Banner numbers static | High | 2-3h | P1 | No |
| #5 - Dr. Chen still static | High | 30m | P1 | No |
| #6 - Policy link 404s | High | 1h | P1 | No |
| #11 - Scheduling system | High | 3-4h | P1 | No |
| #7 - Button color | Medium | 30m | P2 | No |
| #8 - Orange outline | Medium | 5m | P2 | No |
| #10 - Video curation | Medium | 2-3h | P2 | No |
| #12 - Signup screen | Medium | 1-2h | P2 | No |
| #14 - Media metadata | Medium | 2-3h | P2 | No |
| #13 - Thumbnail size | Low | 15m | P3 | No |
| #9 - Cursor hover | Low | 5m | P3 | No |

---

## 🎯 Recommended Tonight's Work

### Option A: Fix Blockers (2-3 hours)
1. Fix Supabase schema cache (10 mins)
2. Debug and fix image upload (1-2 hours)
3. Fix avatar display (30 mins)
4. Quick wins: orange outline, cursor hover (10 mins)

### Option B: Quick Wins + Scheduling Foundation (3-4 hours)
1. Fix Supabase schema cache (10 mins)
2. Fix Dr. Chen dynamic article issue (30 mins)
3. Fix avatar display (30 mins)
4. Remove orange outline (5 mins)
5. Implement scheduling system foundation (2-3 hours)

### Option C: Focus on Article Creation Epic (3-4 hours)
1. Fix all schema cache issues (30 mins)
2. Rebuild image upload flow (1-2 hours)
3. Fix article publishing (1 hour)
4. Add proper error handling (30 mins)

---

## 🔧 Technical Notes

### Supabase Schema Cache Issues
This is recurring. Need to:
1. Check all columns exist in production database
2. Create migration script for missing columns
3. Add schema validation to CI/CD
4. Document reload process

### Image Upload Investigation Needed
Possible causes:
- Supabase Storage permissions
- Missing RLS policies
- Upload route misconfiguration
- File size limits

### Avatar Display Debug
Check:
1. Is `avatar_url` being saved to database?
2. Is avatar URL accessible (CORS)?
3. Is image component rendering correctly?
4. Console errors in browser?

---

**Next Steps:**
1. Prioritize fixes with user
2. Create Jira epic for article creation overhaul
3. Execute highest priority items
4. Document all fixes

---

**Created:** 2025-11-12
**Session:** Evening QA Follow-up
