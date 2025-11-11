# OAuth Testing Guide - Troubleshooting Login Visibility

**Date:** November 10, 2025
**Issue:** User not seeing login state in header after OAuth

---

## 🔍 Step-by-Step Testing Instructions

### Step 1: Start Development Server

```bash
pnpm dev
```

**Expected:** Server runs on http://localhost:3000

---

### Step 2: Clear All Browser Data

**Why:** Old cookies/sessions might be interfering

**How:**
1. Open DevTools (F12 or Cmd+Option+I)
2. Go to "Application" tab
3. Under "Storage" → Click "Clear site data"
4. Close and reopen the browser

---

### Step 3: Test OAuth Login Flow

**3a. Go to Login Page**
```
http://localhost:3000/login
```

**Expected to see:**
- "Sign In to GAILP" heading
- "Sign in with GitHub" button (black button with GitHub logo)

**3b. Click "Sign in with GitHub"**

**Flow should be:**
1. Redirects to GitHub OAuth page
2. GitHub asks for permission
3. You approve
4. Redirects back to `http://localhost:3000/auth/callback?code=...`
5. Then redirects to `/admin`

**Check browser console (F12) for:**
- `🔄 OAuth callback received` log
- `🔧 Creating Supabase client...` log
- `🔐 Code exchange result:` log
- `✅ Redirecting to:` log

---

### Step 4: Check Auth Debug Page

**Go to:**
```
http://localhost:3000/auth/debug
```

**You should see:**
- ✅ Has Session: Yes
- ✅ User ID: (your user ID)
- ✅ Email: malsicario@malsicario.com
- ✅ Provider: github

**Also check:**
- Total Cookies: (should be 3-5)
- Supabase Auth Cookies listed

**If you see "❌ No session":**
- OAuth callback failed
- Check browser console for errors
- Check Supabase dashboard logs

---

### Step 5: Check Header Display

**Go to home page:**
```
http://localhost:3000
```

**Open browser console (F12)**

**Look for:**
```
🔍 Header render - user: {...} loading: false
```

**If you see `user: null`:**
- AuthContext isn't getting the session
- Problem with client-side session retrieval

**If you see `loading: true` forever:**
- AuthContext is stuck loading
- Problem with Supabase client initialization

---

### Step 6: Check Header UI

**In the top-right corner, you should see:**

**When logged OUT:**
- "Sign In" button (blue/gray button)
- "Subscribe" button

**When logged IN:**
- "Studio" link
- User menu button showing your email prefix (e.g., "malsicario")
- Click it to see: email, role, "Sign Out" button

**If you still see "Sign In" button when logged in:**
- Header isn't receiving user state from AuthContext
- Check console for errors

---

## 🐛 Common Issues & Fixes

### Issue 1: "Sign In" button won't disappear

**Symptoms:**
- Auth debug page shows session exists
- Header still shows "Sign In" button

**Diagnosis:**
```javascript
// Check console for:
🔍 Header render - user: null loading: false
```

**Possible causes:**
1. **AuthContext not fetching profile:** Check for error in console
2. **RLS policy blocking:** User profile can't be read
3. **Table doesn't exist:** Migration 004 not run

**Fix:**
```bash
# Check Supabase logs for errors
# Verify user_profiles table exists
# Check RLS policies allow user to read own profile
```

---

### Issue 2: Infinite loading state

**Symptoms:**
- Header shows "Loading..." forever
- Console shows `loading: true` repeatedly

**Diagnosis:**
```javascript
// AuthContext is stuck in useEffect
```

**Possible causes:**
1. **Supabase env vars missing:** Check .env.local
2. **Network error:** Check browser network tab
3. **Supabase down:** Check status.supabase.com

**Fix:**
```bash
# Verify env vars:
grep NEXT_PUBLIC_SUPABASE .env.local

# Should show:
NEXT_PUBLIC_SUPABASE_URL="https://ksidbebbiljckrxlunxi.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
```

---

### Issue 3: Session exists but user profile is null

**Symptoms:**
- Auth debug shows session exists
- Console shows: `❌ No profile found for user`

**Diagnosis:**
```javascript
// AuthContext fetched session but user_profiles query failed
```

**Possible causes:**
1. **user_profiles table doesn't exist:** Migration not run
2. **RLS policy too restrictive:** User can't read own row
3. **Profile wasn't created:** Trigger didn't fire on signup

**Fix:**
```sql
-- Check if profile exists in Supabase Dashboard:
SELECT * FROM user_profiles WHERE email = 'malsicario@malsicario.com';

-- If empty, manually create:
INSERT INTO user_profiles (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'malsicario@malsicario.com';
```

---

### Issue 4: Admin area redirects to login

**Symptoms:**
- Logged in successfully
- Going to `/admin` redirects to `/login`

**Diagnosis:**
```javascript
// Admin layout server-side check failing
```

**Possible causes:**
1. **Session not in cookies:** Client has session, server doesn't
2. **Profile has wrong role:** Role is 'reader' instead of 'admin'
3. **user_profiles table issue:** Query failing on server

**Fix:**
```bash
# Check auth debug page for:
# - Session exists
# - Role is 'admin'

# If role is wrong:
# Update in Supabase Dashboard
UPDATE user_profiles SET role = 'admin' WHERE email = 'malsicario@malsicario.com';
```

---

## 🧪 Debug Checklist

Use this checklist to debug systematically:

### Environment
- [ ] .env.local has NEXT_PUBLIC_SUPABASE_URL
- [ ] .env.local has NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] Dev server is running (`pnpm dev`)
- [ ] No build errors in terminal

### OAuth Flow
- [ ] /login page loads
- [ ] GitHub button appears
- [ ] Clicking button redirects to GitHub
- [ ] Approving redirects back to callback
- [ ] Callback logs appear in console
- [ ] No red errors in console during callback

### Session State
- [ ] /auth/debug shows "Has Session: ✅ Yes"
- [ ] Email is malsicario@malsicario.com
- [ ] User ID is shown
- [ ] Cookies section shows auth cookies

### Client State (AuthContext)
- [ ] Console shows: `🔍 Header render - user: {...} loading: false`
- [ ] User object in console has email and role
- [ ] No errors about "user_profiles" query

### Header UI
- [ ] "Sign In" button disappears when logged in
- [ ] "Studio" link appears
- [ ] User menu button shows email prefix
- [ ] Clicking user menu shows dropdown
- [ ] Dropdown shows: email, role, sign out

### Admin Access
- [ ] /admin doesn't redirect to /login
- [ ] Can access /admin/studio
- [ ] Can access /admin/media
- [ ] Can access /admin/articles/new

---

## 📋 What to Report

If issues persist, please provide:

1. **Screenshot of /auth/debug page**
2. **Browser console output** (full text)
3. **What you see in top-right corner** (describe or screenshot)
4. **Which step fails** (from Step 1-6 above)
5. **Any red errors** in console

---

## 🎯 Expected Final State

When everything works correctly:

**Header (logged out):**
```
[Home] [Policy Updates] ... [About]          [Sign In] [Subscribe]
```

**Header (logged in as admin):**
```
[Home] [Policy Updates] ... [About]   [Studio] [malsicario ▾]
                                                 │ Email: malsicario@malsicario.com
                                                 │ Role: admin
                                                 └─ Sign Out
```

**Console (logged in):**
```
🔐 Auth check - session exists: true
👤 User ID: abc123...
📧 Email: malsicario@malsicario.com
👤 Profile fetch result: { profile: {...}, error: null }
✅ User profile loaded: malsicario@malsicario.com Role: admin
🔍 Header render - user: {id: '...', email: '...', role: 'admin'} loading: false
```

---

## 🚀 Next Steps After Login Works

Once you can see the user menu in the header:

1. Click "Studio" → Should go to /admin/studio
2. Try accessing /admin → Should work (not redirect)
3. Try accessing /admin/media → Should work
4. Try creating an article at /admin/articles/new → Should work

---

**Need Help?**
Check the console output and compare against the expected outputs above.
Most issues are one of: env vars missing, migrations not run, or RLS policies blocking access.
