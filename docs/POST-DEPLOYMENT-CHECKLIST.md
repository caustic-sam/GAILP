# Post-Deployment Testing Checklist

**Deployment URL**: ___________________________
**Date**: ___________________________
**Tester**: ___________________________

---

## 🔴 CRITICAL TESTS (Must Pass)

### 1. Media Vault - File Display
- [ ] Navigate to `/admin/media`
- [ ] Login as admin
- [ ] Files display in grid
- [ ] If empty: Click "Refresh" button
- [ ] Verify file count matches uploaded files
- [ ] Test upload: New image appears immediately

**Console Check** (F12 → Console):
```
Expected:
✅ Files fetched: [number]
✅ Files state updated with [number] items
```

**Status**: ⬜ PASS / ⬜ FAIL
**Notes**: ___________________________________________

---

### 2. Article Image Preview
- [ ] Navigate to `/admin/articles/new`
- [ ] Click "Choose File" → Upload image
- [ ] Image appears in preview pane
- [ ] Alternative: Paste Supabase URL → Image loads

**Status**: ⬜ PASS / ⬜ FAIL
**Notes**: ___________________________________________

---

### 3. Homepage Data Boxes
- [ ] Navigate to `/` (homepage)
- [ ] Scroll to data boxes (3 rotating stats)
- [ ] Shows real counts OR mock data (247, 89, 156)
- [ ] Trend badges visible (green +X or red -X)
- [ ] Smooth rotation every 4 seconds

**Status**: ⬜ PASS / ⬜ FAIL
**Notes**: ___________________________________________

---

## 🟡 HIGH PRIORITY TESTS

### 4. Navigation Labels
Check top navigation bar:
- [ ] "Policy Updates"
- [ ] "Think Tank" (NOT "Expert Blog")
- [ ] "Global Service Announcement" (NOT "GSA" or "Live Hub")
- [ ] "Policy Pulse"
- [ ] "Policies" (NOT "Research")
- [ ] "About"

**Status**: ⬜ PASS / ⬜ FAIL
**Notes**: ___________________________________________

---

### 5. Admin Sidebar
- [ ] Login as admin
- [ ] Hover over right sidebar (expands)
- [ ] Admin section shows: Publishing Desk, New Article, Media Vault, Studio, Component Gallery, Settings
- [ ] Does NOT show duplicate "Quick Nav" section
- [ ] World Clocks visible at bottom

**Status**: ⬜ PASS / ⬜ FAIL
**Notes**: ___________________________________________

---

### 6. Cursor Pointers
Test mouse cursor on:
- [ ] All buttons → pointer cursor
- [ ] Policy update cards → pointer cursor
- [ ] All links → pointer cursor
- [ ] Disabled buttons → not-allowed cursor

**Status**: ⬜ PASS / ⬜ FAIL
**Notes**: ___________________________________________

---

### 7. Link Navigation
- [ ] Click any article → Scroll to bottom
- [ ] "← Back to articles" goes to `/blog`
- [ ] Footer "Digital Identity" link → "Coming Soon" modal
- [ ] Term of Day widget → "View Full Glossary" → Alert

**Status**: ⬜ PASS / ⬜ FAIL
**Notes**: ___________________________________________

---

## 🟢 MEDIUM PRIORITY TESTS

### 8. Authentication Flow
- [ ] Logout if logged in
- [ ] Homepage shows "Loading..." → Then "Sign In"
- [ ] Login via GitHub/Google
- [ ] Avatar appears top-right
- [ ] User menu opens on click
- [ ] Admin sidebar appears (if admin)

**Status**: ⬜ PASS / ⬜ FAIL
**Notes**: ___________________________________________

---

### 9. Article Creation End-to-End
- [ ] Navigate to `/admin/articles/new`
- [ ] Fill in: Title, Summary, Content
- [ ] Upload featured image
- [ ] Image preview shows
- [ ] Click "Publish Article"
- [ ] Redirects to `/admin`
- [ ] New article in list

**Status**: ⬜ PASS / ⬜ FAIL
**Notes**: ___________________________________________

---

### 10. Mobile Responsiveness
- [ ] Open DevTools → Device toolbar
- [ ] Test iPhone SE: Navigation works
- [ ] Test iPad: Layout proper
- [ ] Test Desktop: All features visible
- [ ] No horizontal scroll on any device

**Status**: ⬜ PASS / ⬜ FAIL
**Notes**: ___________________________________________

---

## 🔧 AUTOMATED TESTS

### Quick Smoke Test
```bash
npx tsx scripts/smoke-test.ts https://your-app.vercel.app
```
**Result**: ⬜ PASS / ⬜ FAIL

### Full Health Check
```bash
DEPLOYMENT_URL=https://your-app.vercel.app npx tsx scripts/test-deployment.ts
```
**Result**: ⬜ PASS / ⬜ FAIL

### Link Validator
```bash
npx tsx scripts/validate-links.ts
```
**Expected**: 0-4 issues (commented code only)
**Result**: ⬜ PASS / ⬜ FAIL

---

## 📊 SUMMARY

**Total Tests**: ___ / 13
**Critical Passed**: ___ / 3
**High Priority Passed**: ___ / 4
**Medium Priority Passed**: ___ / 3
**Automated Tests Passed**: ___ / 3

---

## 🎯 DEPLOYMENT STATUS

⬜ **READY FOR malsicario.com**
   All critical tests passed, high priority >80%

⬜ **READY WITH WARNINGS**
   Critical tests passed, some non-critical failed

⬜ **NOT READY**
   Critical tests failed - fix before launch

---

## 🐛 ISSUES FOUND

| # | Description | Priority | Status |
|---|-------------|----------|--------|
| 1 | | ⬜ High ⬜ Med ⬜ Low | ⬜ Fixed ⬜ Open |
| 2 | | ⬜ High ⬜ Med ⬜ Low | ⬜ Fixed ⬜ Open |
| 3 | | ⬜ High ⬜ Med ⬜ Low | ⬜ Fixed ⬜ Open |

---

## ✅ SIGN-OFF

**Tested By**: ___________________________
**Date**: ___________________________
**Approved**: ⬜ YES / ⬜ NO

**Notes**:
___________________________________________
___________________________________________
___________________________________________

---

**Next Steps**:
- [ ] All tests passed → Configure malsicario.com domain
- [ ] Issues found → Create fix list and redeploy
- [ ] Ready for beta users → Share URL
