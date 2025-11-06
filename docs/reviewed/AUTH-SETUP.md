# OAuth Authentication Setup Guide

**Version:** 0.2.0 - OAuth Migration
**Status:** ✅ Ready to Configure
**Providers:** GitHub, Apple Sign In
**Standards:** OAuth 2.0, OpenID Connect

---

## 🎯 Overview

This guide walks you through setting up OAuth authentication for GAILP using GitHub and Apple Sign In providers via Supabase.

### What You'll Configure

- **GitHub OAuth** (15 minutes)
- **Apple Sign In** (15 minutes)
- **Supabase Provider Settings** (5 minutes)
- **WordPress-Style Roles** (5 minutes)

**Total Time:** ~40 minutes

---

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ Supabase project created
- ✅ GitHub account (for GitHub OAuth)
- ✅ Apple Developer account ($99/year - for Apple Sign In)
- ✅ Access to project environment variables
- ✅ Code deployed to branch: `feature/oauth-migration`

---

## Part 1: GitHub OAuth Setup (15 min)

### Step 1: Create GitHub OAuth Application

1. **Navigate to GitHub Developer Settings:**
   - Go to: https://github.com/settings/developers
   - Click: **"OAuth Apps"** → **"New OAuth App"**

2. **Configure Development App:**
   ```
   Application name:       GAILP (Development)
   Homepage URL:           http://localhost:3000
   Authorization callback: http://localhost:3000/auth/callback
   Application description: GAILP policy intelligence platform
   ```

3. **Click "Register application"**

4. **Copy Credentials:**
   - **Client ID:** (Ov23li4jkaFi1CB9hs0C)

   - **Client Secret:** 8b4171e6ce559022752580e35b575ca585eb0ec7
- 

   ⚠️ **CRITICAL:** Save both values securely - the secret won't be shown again!

### Step 2: Create Production OAuth Application

Repeat Step 1 for production:

```
Application name:       GAILP (Production)
Homepage URL:           https://your-domain.vercel.app. Ov23liyY50M9V43lygpM

Authorization callback: https://your-domain.vercel.app/auth/callback

**Note:** You can update this later when you have your production domain.

### Step 3: Configure in Supabase

1. **Open Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard
   - Select your GAILP project

2. **Navigate to Authentication:**
   - Sidebar → **Authentication** → **Providers**

3. **Enable GitHub:**
   - Scroll to **GitHub** provider
   - Toggle **"Enable Sign in with GitHub"** → **ON**

4. **Enter Credentials:**
   ```
   Client ID (OAuth):     www-gailp-prd
   Client Secret (OAuth): koxwe6-keqmeS-jirdam
   ```

5. **Click "Save"**

### Step 4: Verify GitHub Configuration

✅ Checklist:
- [ x] GitHub OAuth app created
- [ x] Client ID and Secret copied
- [ x] Both values added to Supabase
- [ x] Callback URL matches exactly: `http://localhost:3000/auth/callback`

---

## Part 2: Apple Sign In Setup (15 min)

### Prerequisites

- Apple Developer Program membership ($99/year)
- Access to https://developer.apple.com/account

### Step 1: Create App ID

1. **Navigate to Apple Developer Console:**
   - Go to: https://developer.apple.com/account/resources/identifiers/list
   - Click: **"+"** → **"App IDs"** → **"Continue"**

2. **Register App ID:**
   ```
   Description:    GAILP Policy Platform
   Bundle ID:      com.gailp.webapp (or your domain: com.yourdomain.gailp)
   Capabilities:   ✅ Sign In with Apple (check this box)
   ```

3. **Click "Continue"** → **"Register"**

### Step 2: Create Services ID

1. **Create New Services ID:**
   - Click **"+"** → **"Services IDs"** → **"Continue"**

2. **Configure Services ID:**
   ```
   Description:    GAILP Web Authentication
   Identifier:     com.gailp.webapp.auth (must be different from App ID)
   ✅ Sign In with Apple (check this box)
   ```

3. **Click "Continue"** → **"Register"**

4. **Configure Sign In with Apple:**
   - Click on your newly created Services ID
   - Click **"Configure"** next to "Sign In with Apple"

   **Primary App ID:** Select the App ID from Step 1

   **Domains and Subdomains:**
   ```
   localhost
   your-domain.vercel.app
   ```

   **Return URLs:**
   ```
   http://localhost:3000/auth/callback
   https://your-domain.vercel.app/auth/callback
   ```

   ⚠️ **Note:** For local testing with Apple, you'll need to use **ngrok** or similar HTTPS tunnel since Apple requires HTTPS.

5. **Click "Save"** → **"Continue"** → **"Register"**

### Step 3: Generate Private Key

1. **Navigate to Keys:**
   - Go to: https://developer.apple.com/account/resources/authkeys/list
   - Click **"+"**

2. **Create Key:**
   ```
   Key Name:  GAILP Sign In Key
   ✅ Sign In with Apple (check this box)
   ```

3. **Click "Configure":**
   - **Primary App ID:** Select your App ID
   - Click **"Save"**

4. **Click "Continue"** → **"Register"**

5. **Download Key:**
   - Click **"Download"**
   - File will be named: `AuthKey_XXXXXXXXXX.p8`
   - **⚠️ CRITICAL:** You can only download this ONCE! Save it securely.
   - **Note the Key ID** shown on screen (e.g., `AB12CD34EF`)

### Step 4: Find Your Team ID

1. **Get Team ID:**
   - Go to: https://developer.apple.com/account
   - Look in the sidebar for **"Team ID"**
   - Example format: `A1B2C3D4E5`
   - Copy this value

### Step 5: Configure in Supabase

1. **Navigate to Supabase:**
   - Dashboard → **Authentication** → **Providers**
   - Find **Apple** → Click to expand

2. **Toggle "Enable Sign in with Apple"** → **ON**

3. **Enter Configuration:**
   ```
   Services ID:  com.gailp.webapp.auth (from Step 2)
   Team ID:      A1B2C3D4E5 (from Step 4)
   Key ID:       AB12CD34EF (from Step 3)
   ```

4. **Add Private Key:**
   - Open the `AuthKey_XXXXXXXXXX.p8` file in a text editor
   - Copy the **entire contents** including BEGIN/END lines:
   ```
   -----BEGIN PRIVATE KEY-----
   MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
   ...full key content...
   -----END PRIVATE KEY-----
   ```
   - Paste into the **"Private Key"** field in Supabase

5. **Click "Save"**

### Step 6: Verify Apple Configuration

✅ Checklist:
- [ ] App ID created
- [ ] Services ID created and configured
- [ ] Private key downloaded and saved
- [ ] Team ID and Key ID copied
- [ ] All values added to Supabase
- [ ] Return URLs include localhost AND production

⚠️ **Local Testing Note:** Apple requires HTTPS. For local testing, you'll need to use:
- **ngrok:** `ngrok http 3000` to get HTTPS tunnel
- Update Apple Services ID with ngrok URL temporarily
- Or test Apple Sign In on production deployment only

---

## Part 3: Supabase Configuration (5 min)

### Update Redirect URLs

1. **Navigate to URL Configuration:**
   - Dashboard → **Authentication** → **URL Configuration**

2. **Set Site URL:**
   ```
   Development:  http://localhost:3000
   Production:   https://your-domain.vercel.app
   ```

3. **Add Redirect URLs:**
   Click **"Add URL"** for each:
   ```
   http://localhost:3000/*
   http://localhost:3000/auth/callback
   https://your-domain.vercel.app/*
   https://your-domain.vercel.app/auth/callback
   ```

4. **Click "Save"**

### Disable Email Templates (Optional)

Since we're OAuth-only now:

1. **Navigate to:** Authentication → **Email Templates**
2. **Templates to disable:**
   - Magic Link (no longer used)
   - Confirm signup (optional - keep if you want email verification)

---

## Part 4: Database Setup (5 min)

### Run WordPress Roles Migration

1. **Open Supabase Dashboard:**
   - Go to: **SQL Editor**

2. **Create New Query:**
   - Click **"+ New Query"**

3. **Copy Migration:**
   - Open: `supabase/migrations/003_wordpress_roles.sql` in your project
   - Copy the entire contents

4. **Paste and Execute:**
   - Paste into SQL Editor
   - Click **"Run"** (or press Cmd/Ctrl + Enter)

5. **Verify Success:**
   ```sql
   -- Check that roles updated
   SELECT email, role FROM public.user_profiles;

   -- Should show your email as 'admin'
   SELECT * FROM public.user_profiles
   WHERE email = 'malsicario@malsicario.com';
   ```

### WordPress-Style Roles

Your system now has 4 roles:

```
┌─ ADMIN ─────────────────────────────────┐
│ Full system access                       │
│ User management, security, settings      │
│ All publishing capabilities              │
│ YOU (malsicario@malsicario.com)         │
└──────────────────────────────────────────┘

┌─ PUBLISHER ─────────────────────────────┐
│ Publish & manage all content             │
│ Access media library & analytics         │
│ Cannot manage users or system settings   │
└──────────────────────────────────────────┘

┌─ CONTRIBUTOR ───────────────────────────┐
│ Create & edit own content                │
│ Submit articles for review               │
│ Cannot publish                           │
└──────────────────────────────────────────┘

┌─ READER ────────────────────────────────┐
│ View published content only              │
│ No admin access                          │
│ Default role for new users               │
└──────────────────────────────────────────┘
```

---

## Part 5: Environment Variables

### No Changes Needed!

Your existing `.env.local` has everything needed:

```bash
# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Site URL (for OAuth redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

For production (Vercel Environment Variables):
```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

**That's it!** OAuth credentials are stored securely in Supabase, not in environment variables.

---

## Part 6: Testing

### Test GitHub OAuth (Local)

1. **Start Development Server:**
   ```bash
   pnpm dev
   ```

2. **Navigate to Login:**
   - Open: http://localhost:3000/login

3. **Click "Sign in with GitHub"**

4. **Expected Flow:**
   ```
   1. Redirects to GitHub
   2. Shows authorization screen
   3. Click "Authorize"
   4. Redirects back to http://localhost:3000/admin
   5. You're logged in! ✅
   ```

5. **Verify in Supabase:**
   - Dashboard → **Authentication** → **Users**
   - Your GitHub account should appear
   - Check `user_profiles` table for role assignment

### Test Apple Sign In (Production Recommended)

⚠️ **Apple requires HTTPS** - easiest to test on deployed site.

**Option A: Test on Production**
1. Deploy to Vercel
2. Visit: https://your-domain.vercel.app/login
3. Click "Sign in with Apple"
4. Should work immediately

**Option B: Local Testing with ngrok**
1. Install ngrok: `brew install ngrok`
2. Start tunnel: `ngrok http 3000`
3. Copy HTTPS URL: `https://abc123.ngrok.io`
4. Update Apple Services ID:
   - Add ngrok domain to "Domains and Subdomains"
   - Add `https://abc123.ngrok.io/auth/callback` to "Return URLs"
5. Visit: https://abc123.ngrok.io/login
6. Test Apple Sign In

---

## Part 7: Troubleshooting

### GitHub: "Redirect URI mismatch"

**Problem:** Callback URL doesn't match OAuth app configuration

**Fix:**
- Verify GitHub OAuth app callback: `http://localhost:3000/auth/callback`
- Must be exact (no trailing slash, correct protocol)
- Check for typos

### Apple: "invalid_client"

**Problem:** Credentials mismatch

**Fix:**
- Verify Services ID in Supabase matches Apple exactly
- Check Team ID is correct (10 characters, alphanumeric)
- Ensure Private Key includes BEGIN/END lines
- Key ID must match downloaded key

### Apple: "unauthorized_client"

**Problem:** Return URL not authorized

**Fix:**
- Add return URL in Apple Developer Console
- Format: `https://domain.com/auth/callback` (HTTPS required)
- Wait 5 minutes for Apple's CDN to update
- Try again

### Session Not Persisting

**Problem:** Login works but session doesn't stay

**Fix:**
- Check `NEXT_PUBLIC_SITE_URL` matches current domain
- Clear browser cookies
- Try incognito/private mode
- Verify Supabase redirect URLs are correct

### Check Supabase Logs

1. **View Auth Logs:**
   - Dashboard → **Logs** → **Auth Logs**
   - Look for errors during OAuth flow
   - Check for "provider not enabled" errors

2. **Common Log Messages:**
   ```
   ✅ "User signed in via github" - Success!
   ❌ "Provider not enabled" - Check provider toggle in Supabase
   ❌ "Invalid redirect URL" - Check URL configuration
   ```

---

## Part 8: Verification Checklist

Before moving to code implementation, verify:

### GitHub OAuth
- [ ] OAuth app created (dev + prod)
- [ ] Client ID and Secret in Supabase
- [ ] Provider enabled in Supabase
- [ ] Test login works locally
- [ ] User profile created with correct role

### Apple Sign In
- [ ] App ID created
- [ ] Services ID created
- [ ] Private key generated and saved
- [ ] Team ID and Key ID in Supabase
- [ ] Provider enabled in Supabase
- [ ] Return URLs configured
- [ ] Tested (production or ngrok)

### Database
- [ ] Migration ran successfully
- [ ] Your email shows as 'admin' role
- [ ] `user_capabilities` view works
- [ ] RLS policies enabled

### Ready for Code?
- [ ] Both providers work
- [ ] Roles assigned correctly
- [ ] No errors in Supabase logs
- [ ] Tell Claude "OAuth configured" to proceed!

---

## 🎯 What's Next

Once you've completed all steps above and verified everything works:

**Tell Claude: "OAuth configured"**

Then Claude will:
1. Create role-specific sidebar components
2. Update login page UI
3. Wire up OAuth buttons
4. Test complete authentication flow
5. Deploy to production

---

## 📞 Need Help?

### Resources

- **Supabase OAuth Docs:** https://supabase.com/docs/guides/auth/social-login
- **GitHub OAuth Docs:** https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app
- **Apple Sign In Docs:** https://developer.apple.com/sign-in-with-apple/get-started/

### Support

- **Supabase Discord:** https://discord.supabase.com
- **Stack Overflow:** Tag with `supabase` and `oauth`
- **Claude (me!):** Just ask if you hit any issues

---

## 📝 Quick Reference

### Callback URL
```
Development:  http://localhost:3000/auth/callback
Production:   https://your-domain.vercel.app/auth/callback
```

### Where to Configure

| Provider | Create App | Add to Supabase |
|----------|-----------|-----------------|
| GitHub   | https://github.com/settings/developers | Dashboard → Auth → Providers → GitHub |
| Apple    | https://developer.apple.com/account | Dashboard → Auth → Providers → Apple |

### Required Files

✅ Already in your project:
- `supabase/migrations/003_wordpress_roles.sql`
- `lib/auth/types.ts` (with new roles)
- `contexts/AuthContext.tsx` (OTP removed)
- `app/login/page.tsx` (OAuth-ready)

---

**Version:** 0.2.0
**Last Updated:** 2025-11-06
**Status:** Ready to Configure

**Start here! Follow steps 1-8 above, then come back to continue development.** 🚀
