# OAuth Authentication Setup Guide (Production-Only)

**Version:** 0.3.0 - Production Deployment
**Status:** ✅ Ready to Configure
**Provider:** GitHub OAuth
**Production URL:** https://www-gailp-prd.vercel.app

---

## 🎯 Overview

Simplified production-only OAuth setup for GAILP. No localhost configuration needed - everything runs on Vercel.

### What You'll Configure

- **GitHub OAuth Application** (5 minutes)
- **Supabase Provider Settings** (3 minutes)
- **WordPress-Style Roles Migration** (2 minutes)

**Total Time:** ~10 minutes

---

## 📋 Prerequisites

- ✅ Supabase project created
- ✅ GitHub account
- ✅ Vercel deployment at: `www-gailp-prd.vercel.app`
- ✅ Code on branch: `feature/oauth-migration`

---

## Part 1: GitHub OAuth Setup (5 min)

### Step 1: Update Your Existing GitHub OAuth App

You already created a GitHub OAuth app. Now update it for production-only:

1. **Go to GitHub Developer Settings:**
   - https://github.com/settings/developers
   - Find your existing OAuth app (or create new one if needed)

2. **Update Application Settings:**
   ```
   Application name:       GAILP
   Homepage URL:           https://www-gailp-prd.vercel.app
   Authorization callback: https://ksidbebbiljckrxlunxi.supabase.co/auth/v1/callback
   Application description: GAILP policy intelligence platform
   ```

   ⚠️ **CRITICAL:** The callback URL must be your **Supabase callback URL**, not your app's callback URL!

3. **Note Your Credentials:**
   - **Client ID:** `Ov23li4jkaFi1CB9hs0C` (you already have this)
   - **Client Secret:** (use existing or regenerate if needed)

4. **Click "Update application"**

✅ **Done!** Your GitHub OAuth app is now production-ready.

---

## Part 2: Supabase Configuration (3 min)

### Step 1: Enable GitHub Provider

1. **Open Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard
   - Select your GAILP project: `ksidbebbiljckrxlunxi`

2. **Navigate to Authentication:**
   - Sidebar → **Authentication** → **Providers**

3. **Enable GitHub:**
   - Scroll to **GitHub** provider
   - Toggle **"Enable Sign in with GitHub"** → **ON**

4. **Enter Credentials:**
   ```
   Client ID (OAuth):     Ov23li4jkaFi1CB9hs0C
   Client Secret (OAuth): [your-github-client-secret]
   ```

   (Use the secret from your GitHub OAuth app)

5. **Click "Save"**

### Step 2: Configure Redirect URLs

1. **Navigate to URL Configuration:**
   - Authentication → **URL Configuration**

2. **Set Site URL:**
   ```
   https://www-gailp-prd.vercel.app
   ```

3. **Add Redirect URLs:**
   Click **"Add URL"** for each:
   ```
   https://www-gailp-prd.vercel.app/*
   https://www-gailp-prd.vercel.app/auth/callback
   ```

4. **Click "Save"**

✅ **Done!** Supabase is configured.

---

## Part 3: Database Migration (2 min)

### Run WordPress Roles Migration

1. **Open SQL Editor:**
   - Supabase Dashboard → **SQL Editor** → **New Query**

2. **Copy Migration SQL:**
   - Open your project file: `supabase/migrations/003_wordpress_roles.sql`
   - Copy the entire contents

3. **Run Migration:**
   - Paste into SQL Editor
   - Click **"Run"** (or Cmd/Ctrl + Enter)

4. **Verify Success:**
   ```sql
   -- Check your role
   SELECT email, role FROM public.user_profiles
   WHERE email = 'malsicario@malsicario.com';

   -- Should show: malsicario@malsicario.com | admin
   ```

✅ **Done!** Database is ready.

---

## Part 4: Vercel Environment Variables (Optional)

Your `.env.local` has been updated. To ensure Vercel has the correct variables:

1. **Go to Vercel Dashboard:**
   - https://vercel.com/caustic-sams-projects-2d85e2bb/www-gailp-prd/settings/environment-variables

2. **Verify/Add Variable:**
   ```
   NEXT_PUBLIC_SITE_URL = https://www-gailp-prd.vercel.app
   ```

3. **Redeploy if you made changes**

---

## 🧪 Testing OAuth Flow

### After Configuration:

1. **Push Code to GitHub:**
   ```bash
   git add .
   git commit -m "[GAILP-16] Configure production-only OAuth"
   git push origin feature/oauth-migration
   ```

2. **Merge to Main** (or deploy branch directly)

3. **Visit Login Page:**
   - https://www-gailp-prd.vercel.app/login

4. **Click "Sign in with GitHub"**

5. **Expected Flow:**
   ```
   1. Redirects to GitHub authorization
   2. Click "Authorize"
   3. Redirects back to homepage
   4. ✅ You're logged in!
   ```

6. **Verify in Supabase:**
   - Dashboard → **Authentication** → **Users**
   - Your GitHub account should appear
   - Check `user_profiles` table - role should be `admin`

---

## 🔧 Troubleshooting

### Error: "Redirect URI mismatch"

**Problem:** GitHub OAuth callback doesn't match

**Fix:**
- Verify GitHub OAuth app callback is: `https://ksidbebbiljckrxlunxi.supabase.co/auth/v1/callback`
- Check for typos, trailing slashes
- Must be **Supabase callback**, not your app's `/auth/callback`

### Error: "Provider not enabled"

**Problem:** GitHub provider not enabled in Supabase

**Fix:**
- Go to Supabase → Authentication → Providers
- Toggle GitHub **ON**
- Enter Client ID and Secret
- Click **Save**

### Error: "Session not persisting"

**Problem:** Redirect URLs don't match

**Fix:**
- Check Supabase URL Configuration
- Site URL: `https://www-gailp-prd.vercel.app`
- Redirect URLs include your production domain
- Redeploy after making changes

### Check Supabase Logs

1. **View Auth Logs:**
   - Dashboard → **Logs** → **Auth Logs**
   - Look for errors during OAuth flow

2. **Success message:**
   ```
   ✅ "User signed in via github"
   ```

3. **Error messages:**
   ```
   ❌ "Provider not enabled" → Enable GitHub in providers
   ❌ "Invalid redirect URL" → Check URL configuration
   ```

---

## ✅ Verification Checklist

Before testing, verify:

### GitHub OAuth
- [ ] OAuth app updated with production callback URL
- [ ] Callback URL is Supabase URL (not app URL)
- [ ] Client ID and Secret in Supabase
- [ ] Provider enabled in Supabase

### Supabase
- [ ] GitHub provider enabled
- [ ] Site URL set to production domain
- [ ] Redirect URLs include production domain
- [ ] Database migration completed
- [ ] Your email has 'admin' role

### Vercel
- [ ] Latest code deployed
- [ ] Environment variables set
- [ ] Production URL matches configuration

---

## 🎯 What's Next

Once OAuth login works:

1. **Create admin dashboard** (`/admin` page)
2. **Build role-specific sidebars**
   - AdminSidebar (full access)
   - PublisherSidebar (publishing focus)
   - ContributorSidebar (content creation)
3. **Add user profile display** in Header
4. **Implement sign out** UI

---

## 📝 Quick Reference

### Production URLs
```
App:              https://www-gailp-prd.vercel.app
Login:            https://www-gailp-prd.vercel.app/login
Supabase Project: https://ksidbebbiljckrxlunxi.supabase.co
GitHub OAuth:     https://github.com/settings/developers
```

### Callback URL (for GitHub OAuth app)
```
https://ksidbebbiljckrxlunxi.supabase.co/auth/v1/callback
```

### Your Credentials
```
GitHub Client ID: Ov23li4jkaFi1CB9hs0C
Supabase URL:     https://ksidbebbiljckrxlunxi.supabase.co
```

### WordPress Roles
```
admin       → You (full access)
publisher   → Publish content, no user management
contributor → Create drafts, no publishing
reader      → View only (default for new users)
```

---

**Version:** 0.3.0
**Last Updated:** 2025-11-06
**Status:** Production-Only Configuration

**Simple, clean, production-ready!** 🚀
