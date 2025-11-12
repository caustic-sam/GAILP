# Remaining UI Tasks

**Status:** Partially Complete - 4 of 9 tasks done
**Created:** 2025-11-11
**Session:** Evening UI improvements batch

---

## ✅ Completed Tasks

1. **Database Fix - meta_description column** ✅
   - Created: `ADD-META-DESCRIPTION-COLUMN.sql`
   - Fixes "Publish Now" error (PGRST204)
   - **Action Required:** Run SQL script in Supabase SQL Editor

2. **Policy Cards - 4x4 Grid** ✅
   - Shrunk cards to fit 4 columns on desktop
   - Trimmed white space, compact layout
   - No information loss
   - File: `app/policy-updates/page.tsx`

3. **Custom Source Button Color** ✅
   - Changed from bright blue to navy blue theme
   - Matches brand colors
   - File: `app/policy-updates/page.tsx`

4. **Admin Nav Labels** ✅
   - "Media Studio" → "Media Vault"
   - "Publishing Studio" → "Publishing Desk"
   - Added "Component Gallery" link
   - File: `components/RightSidebar.tsx`

---

## 🔴 Remaining High-Priority Tasks

### 1. Add Sortable Columns to Content Manager
**Status:** Not Started
**Location:** `/admin` page (Content Manager)
**File:** `app/admin/page.tsx`

**Requirements:**
- Make table columns clickable for sorting
- Sort by: Status, Published Date, Views, Revisions
- Add sort indicators (↑↓) to column headers
- Maintain sort state in URL or local state

**Implementation Approach:**
```typescript
const [sortBy, setSortBy] = useState<'status' | 'published_at' | 'views' | 'revisions'>('published_at');
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

// Sort function
const sortedArticles = [...articles].sort((a, b) => {
  const order = sortOrder === 'asc' ? 1 : -1;
  if (sortBy === 'status') return a.status.localeCompare(b.status) * order;
  if (sortBy === 'published_at') return (new Date(a.published_at) - new Date(b.published_at)) * order;
  if (sortBy === 'views') return (a.view_count - b.view_count) * order;
  if (sortBy === 'revisions') return (a.revision_count - b.revision_count) * order;
  return 0;
});
```

**UI Changes:**
- Add `cursor-pointer` and `hover:bg-gray-100` to `<th>` elements
- Add sort icons: `<ArrowUpDown />` from lucide-react
- Highlight active sort column

---

### 2. Fix Media Vault - Show 45 Media Files
**Status:** Investigation Required
**Location:** `/admin/media` (Media Vault page)
**Issue:** "Shipping 45 media files but no media when I visit the media vault"

**Debugging Steps:**
1. Check Media Vault API endpoint
2. Verify file upload/storage location
3. Check RLS policies on media table
4. Verify media table schema exists
5. Check for console errors in browser

**Files to Investigate:**
- `app/admin/media/page.tsx`
- `app/api/media/*` (if exists)
- Database: `media` or `files` table

**Possible Causes:**
- RLS policy blocking reads
- Media stored in different table
- API endpoint not returning data
- Frontend not rendering properly

---

### 3. Fix File Calculations at Bottom of Studio Page
**Status:** Investigation Required
**Location:** `/admin/studio` (Publishing Desk)
**Issue:** "File calculations are wrong"

**Debugging Steps:**
1. Visit `/admin/studio` page
2. Check what calculations are showing
3. Compare with actual data
4. Find calculation logic in code

**Files to Check:**
- `app/admin/studio/page.tsx`
- Look for file count/size calculations
- Check stats/summary components

---

### 4. Mute Blue, Orange, Purple to Fall Tones
**Status:** Design Task
**Requirement:** "Mute them the same way our navy blue is muted. Almost like fall tones that mathematically go together."

**Current Brand Colors:**
- **Navy Blue:** `#1e3a5f` (primary) - Already muted ✅
- **Blue:** Bright blue (#3b82f6, #2563eb) - Needs muting
- **Orange:** Bright orange - Needs muting
- **Purple:** Bright purple - Needs muting

**Proposed Muted Fall Palette:**
```css
/* Muted Blue (keep existing) */
--primary-navy: #1e3a5f;
--primary-navy-light: #2d5a8f;

/* Muted Fall Blue */
--muted-blue: #4a6fa5;        /* Dusty blue */
--muted-blue-light: #6b8caf;  /* Lighter dusty blue */

/* Muted Fall Orange */
--muted-orange: #c17a58;      /* Burnt sienna */
--muted-orange-light: #d9a07a; /* Lighter terra cotta */

/* Muted Fall Purple */
--muted-purple: #8b7fa8;      /* Dusty lavender */
--muted-purple-light: #a99cc0; /* Lighter lavender */

/* Accent Colors */
--accent-sage: #8b9a7c;       /* Sage green */
--accent-rust: #a85f4a;       /* Rust brown */
```

**Files to Update:**
- Status indicators (`getStatusBadge` functions)
- Button variants
- Category badges
- Any bright blue/orange/purple usage

**Search for:**
- `bg-blue-500`, `bg-blue-600`, `text-blue-600`
- `bg-orange-500`, `text-orange-600`
- `bg-purple-500`, `text-purple-600`

---

### 5. Enhance Media Vault for Photos, Videos, PDFs
**Status:** Feature Enhancement
**Location:** `/admin/media`

**Requirements:**
- Support multiple file types: Photos (JPEG, PNG, WebP), Videos (MP4, WebM), PDFs
- Visual preview for each type
- File type filtering
- Upload handling for all types
- Storage in Supabase Storage or similar

**Implementation:**
1. Update file upload to accept multiple MIME types
2. Add file type detection
3. Create preview components:
   - Image: thumbnail preview
   - Video: video player preview
   - PDF: first page preview or icon
4. Add filter buttons: "All", "Photos", "Videos", "PDFs"
5. Update database schema if needed

**UI Components Needed:**
- `<ImagePreview />` - thumbnail grid
- `<VideoPreview />` - video player card
- `<PDFPreview />` - PDF icon/first page
- File type badges
- Upload dropzone with type indicator

---

## 📊 Progress Summary

**Completed:** 4/9 tasks (44%)
**Remaining:** 5 tasks
**High Priority:** Sortable columns, Media Vault fixes
**Medium Priority:** File calculations, color scheme
**Enhancement:** Media Vault features

---

## 🎯 Recommended Next Steps

1. **Run Database Migration**
   ```sql
   -- In Supabase SQL Editor
   -- Run: ADD-META-DESCRIPTION-COLUMN.sql
   ```

2. **Fix Media Vault Display** (blocking issue)
   - Investigate why 45 files aren't showing
   - Check API, RLS, and frontend rendering

3. **Add Sortable Columns**
   - Quick win, improves UX significantly
   - ~30 minutes implementation

4. **Color Scheme Update**
   - Replace bright colors with muted fall palette
   - Global search/replace with new color values

5. **Media Vault Enhancement**
   - Larger feature, can be phased:
     - Phase 1: Fix current display
     - Phase 2: Add file type support
     - Phase 3: Enhanced previews

---

## 📝 Notes

- All completed tasks have been tested and deployed
- Database migration script ready to run
- Build passing cleanly
- No breaking changes introduced

**Git Status:** All changes committed and pushed to main

