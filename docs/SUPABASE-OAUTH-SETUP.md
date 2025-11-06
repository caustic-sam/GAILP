# Supabase OAuth Configuration Guide

**Version:** 0.2.0
**Date:** 2025-11-06
**Providers:** GitHub, Apple Sign In
**Estimated Time:** 30 minutes

---

## 🎯 Overview

This guide walks you through configuring GitHub and Apple OAuth providers in Supabase for the GAILP platform.

### What You'll Configure

1. **GitHub OAuth App** (15 min)
2. **Apple Sign In Service** (15 min)
3. **Supabase Provider Settings** (5 min)
4. **Test Both Providers** (5 min)

---

## Part 1: GitHub OAuth Setup

### Step 1: Create GitHub OAuth App

1. **Navigate to GitHub Settings:**
   - Go to: https://github.com/settings/developers
   - Click: **"OAuth Apps"** → **"New OAuth App"**

2. **Fill in Application Details:**
   ```
   Application name:       GAILP (Development)
   Homepage URL:           http://localhost:3000
   Authorization callback: http://localhost:3000/auth/callback
   ```

3. **Click "Register application"**

4. **Copy Credentials:**
   - **Client ID:** Copy this (you'll need it)
   - **Client Secret:** Click "Generate a new client secret" → Copy it immediately

   ⚠️ **Save these securely** - the secret won't be shown again!

### Step 2: Create Production OAuth App

Repeat Step 1 with production URLs:

```
Application name:       GAILP (Production)
Homepage URL:           https://your-domain.vercel.app
Authorization callback: https://your-domain.vercel.app/auth/callback
```

### Step 3: Add to Supabase

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to: **Authentication** → **Providers**
4. Find **GitHub** → Click to expand
5. Toggle **"Enable Sign in with GitHub"** → ON
6. Enter credentials:
   ```
   Client ID:     [paste from GitHub]
   Client Secret: [paste from GitHub]
   ```
7. Click **"Save"**

---

## Part 2: Apple Sign In Setup

### Prerequisites

- Apple Developer Program membership ($99/year)
- Access to https://developer.apple.com/account

### Step 1: Create App ID

1. **Go to Apple Developer:**
   - Navigate to: https://developer.apple.com/account/resources/identifiers/list
   - Click: **"+"** → **"App IDs"** → **"Continue"**

2. **Register App ID:**
   ```
   Description:    GAILP
   Bundle ID:      com.gailp.webapp (or your domain)
   Capabilities:   ✅ Sign In with Apple
   ```

3. **Click "Continue"** → **"Register"**

### Step 2: Create Services ID

1. **Create Services ID:**
   - Click **"+"** → **"Services IDs"** → **"Continue"**

2. **Configure Services ID:**
   ```
   Description:    GAILP Web Auth
   Identifier:     com.gailp.webapp.auth (must be unique)
   ✅ Sign In with Apple
   ```

3. **Click "Continue"** → **"Register"**

4. **Configure Sign In with Apple:**
   - Click on the newly created Services ID
   - Click "Configure" next to "Sign In with Apple"
   - **Primary App ID:** Select the App ID from Step 1
   - **Domains and Subdomains:**
     ```
     localhost               (for development)
     your-domain.vercel.app  (for production)
     ```
   - **Return URLs:**
     ```
     http://localhost:3000/auth/callback
     https://your-domain.vercel.app/auth/callback
     ```
   - Click **"Save"** → **"Continue"** → **"Register"**

### Step 3: Create Private Key

1. **Generate Key:**
   - Navigate to: https://developer.apple.com/account/resources/authkeys/list
   - Click **"+"** → **"Sign In with Apple"** → **"Continue"**

2. **Configure Key:**
   ```
   Key Name:  GAILP Sign In Key
   ✅ Sign In with Apple
   ```

3. **Click "Configure":**
   - **Primary App ID:** Select your App ID
   - Click **"Save"** → **"Continue"** → **"Register"**

4. **Download Key:**
   - Click **"Download"**
   - Save as: `AuthKey_XXXXXXXXXX.p8`
   - **⚠️ IMPORTANT:** You can only download this once!
   - Note the **Key ID** (e.g., `AB12CD34EF`)

### Step 4: Find Team ID

1. **Get Team ID:**
   - Go to: https://developer.apple.com/account
   - Look for **"Team ID"** in the sidebar
   - Example: `A1B2C3D4E5`
   - Copy this value

### Step 5: Add to Supabase

1. **Navigate to Supabase:**
   - Dashboard → **Authentication** → **Providers**
   - Find **Apple** → Click to expand

2. **Toggle ON:** "Enable Sign in with Apple"

3. **Enter Configuration:**
   ```
   Services ID:  com.gailp.webapp.auth (from Step 2)
   Team ID:      A1B2C3D4E5 (from Step 4)
   Key ID:       AB12CD34EF (from Step 3)
   Private Key:  [paste contents of AuthKey_XXXXXXXXXX.p8]
   ```

4. **Private Key Format:**
   Open the `.p8` file in a text editor. It should look like:
   ```
   -----BEGIN PRIVATE KEY-----
   MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
   ...
   -----END PRIVATE KEY-----
   ```
   Copy the **entire contents** including the BEGIN/END lines.

5. **Click "Save"**

---

## Part 3: Supabase Configuration

### Update Redirect URLs

1. **Navigate to:**
   - Dashboard → **Authentication** → **URL Configuration**

2. **Site URL:**
   ```
   Development:  http://localhost:3000
   Production:   https://your-domain.vercel.app
   ```

3. **Redirect URLs (add both):**
   ```
   http://localhost:3000/auth/callback
   https://your-domain.vercel.app/auth/callback
   ```

4. **Click "Save"**

### Email Templates (Optional)

Since we're removing OTP, you can disable email templates:

1. **Navigate to:** Authentication → **Email Templates**
2. **Disable:** "Confirm signup" and "Magic Link" templates
3. Or leave them for account verification emails

---

## Part 4: Environment Variables

### Update `.env.local`

No new environment variables needed! OAuth is configured entirely in Supabase.

Your existing vars are sufficient:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

For production (Vercel):
```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

---

## Part 5: Testing

### Test GitHub OAuth

1. **Start Dev Server:**
   ```bash
   pnpm dev
   ```

2. **Navigate to:** http://localhost:3000/login

3. **Click:** "Sign in with GitHub"

4. **Expected Flow:**
   - Redirects to GitHub
   - Shows authorization screen
   - Click "Authorize"
   - Redirects back to `/admin`
   - You're logged in!

5. **Verify in Supabase:**
   - Dashboard → **Authentication** → **Users**
   - Your GitHub account should appear
   - Check `user_profiles` table for role assignment

### Test Apple Sign In

⚠️ **Local Testing Limitation:**

Apple Sign In **requires HTTPS**. For local testing:

**Option A: Use ngrok (Recommended)**

1. **Install ngrok:**
   ```bash
   brew install ngrok
   # or download from https://ngrok.com/download
   ```

2. **Start tunnel:**
   ```bash
   ngrok http 3000
   ```

3. **Copy HTTPS URL:**
   ```
   Forwarding: https://abc123.ngrok.io → http://localhost:3000
   ```

4. **Update Apple Services ID:**
   - Add ngrok domain to "Domains and Subdomains"
   - Add `https://abc123.ngrok.io/auth/callback` to "Return URLs"

5. **Test:**
   - Visit: https://abc123.ngrok.io/login
   - Click "Sign in with Apple"
   - Should work!

**Option B: Test in Production**

Deploy to Vercel first, then test Apple Sign In on production URL.

---

## Part 6: Troubleshooting

### Common Issues

#### GitHub: "Redirect URI mismatch"

**Problem:** Callback URL doesn't match

**Solution:**
- Check GitHub OAuth App settings
- Ensure callback URL is **exactly:** `http://localhost:3000/auth/callback`
- No trailing slash
- Correct protocol (http vs https)

#### Apple: "invalid_client"

**Problem:** Services ID or credentials wrong

**Solution:**
- Verify Services ID matches Supabase config
- Check Team ID is correct
- Ensure Private Key is complete (including BEGIN/END lines)
- Key ID matches the downloaded key

#### Apple: "unauthorized_client"

**Problem:** Return URL not authorized

**Solution:**
- Add return URL in Apple Developer Console
- Format: `https://your-domain.com/auth/callback`
- Save and wait 5 minutes for Apple's CDN to update

#### Supabase: Session not persisting

**Problem:** Cookies not being set

**Solution:**
- Check `NEXT_PUBLIC_SITE_URL` matches current domain
- Clear browser cookies
- Try incognito mode
- Verify Supabase redirect URLs are correct

### Debug Tools

#### Check Supabase Auth Logs

1. **Dashboard → Logs → Auth Logs**
2. Look for errors during OAuth flow
3. Check for "provider not enabled" errors

#### Check Browser Console

1. **Open DevTools → Console**
2. Look for errors during redirect
3. Check Network tab for failed requests

#### Verify Database

```sql
-- Check if profile was created
SELECT * FROM public.user_profiles WHERE email = 'your@email.com';

-- Check role assignment
SELECT email, role FROM public.user_profiles ORDER BY created_at DESC;
```

---

## Part 7: Production Deployment

### Before Deploying to Vercel

1. **Update Environment Variables:**
   - Vercel Dashboard → Settings → Environment Variables
   - Set `NEXT_PUBLIC_SITE_URL` to production domain

2. **Update OAuth Apps:**
   - GitHub: Add production callback URL
   - Apple: Add production domain and return URL

3. **Update Supabase:**
   - Add production redirect URL
   - Update Site URL

4. **Deploy:**
   ```bash
   git push origin main
   ```

5. **Test in Production:**
   - Visit your production domain
   - Test both OAuth providers
   - Verify roles are assigned correctly

---

## Part 8: Security Checklist

### Before Going Live

- [ ] GitHub Client Secret is secure (not in git)
- [ ] Apple Private Key is secure (not in git)
- [ ] Supabase service role key is NOT in `.env.local`
- [ ] Only use `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon key is safe)
- [ ] Redirect URLs are production domains only
- [ ] RLS policies are enabled on `user_profiles` table
- [ ] Test with non-admin account to verify reader role
- [ ] Session duration configured appropriately
- [ ] Rate limiting enabled in Supabase (default: on)

---

## 📞 Need Help?

### Resources

- **Supabase OAuth Docs:** https://supabase.com/docs/guides/auth/social-login
- **GitHub OAuth Docs:** https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app
- **Apple Sign In Docs:** https://developer.apple.com/sign-in-with-apple/get-started/

### Support Channels

- **Supabase Discord:** https://discord.supabase.com
- **GitHub Issues:** For code-specific problems
- **Stack Overflow:** Tag with `supabase` and `oauth`

---

## ✅ Completion Checklist

Before moving to code implementation:

- [ ] GitHub OAuth app created (dev + prod)
- [ ] Apple Sign In configured (Services ID, Key, Team ID)
- [ ] Both providers enabled in Supabase
- [ ] Redirect URLs configured correctly
- [ ] Tested GitHub OAuth (works)
- [ ] Tested Apple Sign In (works or using ngrok)
- [ ] User profiles created with correct roles
- [ ] Ready to implement UI changes

---

**Created:** 2025-11-06
**Updated:** 2025-11-06
**Version:** 1.0.0
**Status:** Ready for Implementation
