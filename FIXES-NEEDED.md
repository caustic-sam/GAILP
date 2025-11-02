# Critical Fixes Needed

## IMMEDIATE ACTION REQUIRED - Media Library Setup

**ERROR: "Bucket not found"**

You MUST create the Supabase storage bucket manually:

1. Go to: https://app.supabase.com/project/ksidbebbiljckrxlunxi/storage/buckets
2. Click "New Bucket"
3. Name: `media`
4. Set as **Public** ✓
5. Click "Create"

6. Then go to SQL Editor: https://app.supabase.com/project/ksidbebbiljckrxlunxi/sql/new
7. Copy/paste contents of `/scripts/setup-media-library.sql`
8. Click "Run"

**DO THIS FIRST** - Nothing else will work without it!

---

## Issue Summary

| # | Issue | Status | Priority |
|---|-------|--------|----------|
| 1 | Media bucket not found | ⚠️ BLOCKED | CRITICAL |
| 2 | Published articles don't show on front page | 🔧 Ready to fix | HIGH |
| 3 | No admin link under Expert Blogs | 🔧 Ready to fix | MEDIUM |
| 4 | Font sizes need swapping (home page titles) | 🔧 Ready to fix | MEDIUM |
| 5 | Multi-file upload already works! | ✅ WORKING | - |
| 6 | Grid/list view not working | 🔧 Ready to fix | LOW |
| 7 | Columns not sortable | 🔧 Ready to fix | MEDIUM |
| 8 | Tags not persisting | 🔧 Ready to fix | HIGH |
| 9 | No featured image upload UI | 🔧 Ready to fix | MEDIUM |
| 10 | Auto image resize in editor | 🔧 Ready to fix | LOW |

---

## Detailed Fixes

### 1. Media Bucket ⚠️ BLOCKED
**Status:** You must do this manually in Supabase
**See instructions above**

### 2. Published Articles on Front Page
**Issue:** Published articles use mock data, not real Supabase data
**Fix:** Update `app/page.tsx` to fetch from Supabase instead of `mockArticles`
**Impact:** HIGH - This is core functionality

### 3. Admin Link
**Issue:** No quick link to admin area
**Fix:** Add admin link to navigation menu
**Impact:** LOW - Quality of life

### 4. Font Sizes
**Issue:** Article titles smaller than update titles
**Current:**
- Home page article titles: `text-xl` (20px)
- Update titles: `text-2xl` (24px)
**Fix:** Swap these
**Impact:** LOW - Visual polish

### 5. Multi-File Upload ✅
**Status:** ALREADY WORKING!
**Note:** The media library already supports multiple file selection
**How:** Click "Upload Files" → Select multiple files → They all upload

### 6. Grid/List View
**Issue:** Buttons don't toggle view
**Fix:** The state changes but view doesn't update (bug in conditional rendering)
**Impact:** LOW - Feature exists but broken

### 7. Sortable Columns
**Issue:** Column headers not clickable
**Fix:** Add onClick handlers and sort state
**Impact:** MEDIUM - Nice to have

### 8. Tags Not Persisting 🔥
**Issue:** Tags don't save when updating article
**Root Cause:** Tags array not included in update payload
**Fix:** Add `tags: article.tags` to the update query in edit page
**Impact:** HIGH - Data loss

### 9. Featured Image Upload
**Issue:** Only text input for URL, no file picker
**Fix:** Add "Upload" button that opens media library in modal
**Impact:** MEDIUM - Important for workflow

### 10. Auto Image Resize
**Issue:** Images not formatted/resized automatically in editor
**Fix:** Configure Quill image handler with max-width CSS
**Impact:** LOW - Nice to have

---

## Quick Wins (Can fix immediately)

1. **Tags persistence** - 1 line fix
2. **Admin link** - 2 line fix
3. **Font sizes** - 2 line fix
4. **Grid/list view** - Fix conditional rendering

## Medium Effort

5. **Sortable columns** - Add sort state and handlers
6. **Published articles** - Replace mock data with Supabase query
7. **Featured image upload** - Add upload button + media picker modal

## Requires Design

8. **Auto image resize** - CSS + Quill configuration
9. **Media library** - BLOCKED until bucket created

---

## What I'll Fix Now

Since the media bucket is blocking, I'll fix everything else:

1. ✅ Fix tags persistence
2. ✅ Add admin link
3. ✅ Fix font sizes
4. ✅ Fix grid/list view
5. ✅ Add sortable columns
6. ✅ Show published articles on front page
7. ✅ Add featured image upload UI

After you create the media bucket, the rest will work!
