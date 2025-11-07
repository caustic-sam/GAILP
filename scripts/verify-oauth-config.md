# OAuth Configuration Verification

## Current Configuration

### Environment Variables (Local)
```
NEXT_PUBLIC_SITE_URL=https://www-gailp-prd.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://ksidbebbiljckrxlunxi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[configured]
SUPABASE_SERVICE_ROLE_KEY=[configured]
```

✅ **Status:** Environment variables are correct!

---

## GitHub OAuth App Settings

**Required Configuration:**

### Application Settings
- **Application name:** GAILP (or GAILP Production)
- **Homepage URL:** `https://www-gailp-prd.vercel.app`
- **Authorization callback URL:** `https://ksidbebbiljckrxlunxi.supabase.co/auth/v1/callback`

### Your OAuth App Details
- **Client ID:** `Ov23li4jkaFi1CB9hs0C`
- **Client Secret:** [stored in Supabase]

### ⚠️ CRITICAL: Authorization Callback URL

The callback URL in your GitHub OAuth app **MUST** match **exactly**:

```
https://ksidbebbiljckrxlunxi.supabase.co/auth/v1/callback
```

**Why?** When using Supabase Auth, GitHub redirects to **Supabase first**, then Supabase redirects to your app.

---

## Supabase Dashboard Settings

### Authentication → Providers → GitHub

**Settings to verify:**

1. **Enable Sign in with GitHub:** ✅ ON
2. **Client ID (OAuth):** `Ov23li4jkaFi1CB9hs0C`
3. **Client Secret (OAuth):** [your GitHub client secret]

### Authentication → URL Configuration

**Site URL:**
```
https://www-gailp-prd.vercel.app
```

**Redirect URLs (add all of these):**
```
https://www-gailp-prd.vercel.app/*
https://www-gailp-prd.vercel.app/auth/callback
```

---

## Vercel Environment Variables

Go to: https://vercel.com/caustic-sams-projects-2d85e2bb/www-gailp-prd/settings/environment-variables

**Verify these are set:**

```
NEXT_PUBLIC_SITE_URL=https://www-gailp-prd.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://ksidbebbiljckrxlunxi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your anon key]
SUPABASE_SERVICE_ROLE_KEY=[your service role key]
```

**Note:** After adding/changing variables, you must **redeploy** for them to take effect.

---

## Step-by-Step Fix

### 1. Update GitHub OAuth App (2 minutes)

1. Go to: https://github.com/settings/developers
2. Click on your OAuth app with Client ID: `Ov23li4jkaFi1CB9hs0C`
3. Find "Authorization callback URL" field
4. **Replace with:** `https://ksidbebbiljckrxlunxi.supabase.co/auth/v1/callback`
5. Click **"Update application"**

### 2. Verify Supabase Configuration (2 minutes)

1. Go to: https://supabase.com/dashboard
2. Select project: `ksidbebbiljckrxlunxi`
3. Go to: Authentication → Providers → GitHub
4. Verify:
   - Toggle is **ON**
   - Client ID: `Ov23li4jkaFi1CB9hs0C`
   - Client Secret is filled in
5. Go to: Authentication → URL Configuration
6. Verify:
   - Site URL: `https://www-gailp-prd.vercel.app`
   - Redirect URLs include: `https://www-gailp-prd.vercel.app/*`

### 3. Test (1 minute)

1. Visit: https://www-gailp-prd.vercel.app/login
2. Click "Sign in with GitHub"
3. Should redirect to GitHub authorization
4. Click "Authorize"
5. Should redirect back to homepage
6. ✅ Success!

---

## Troubleshooting

### Error: "redirect_uri is not associated with this application"

**Cause:** GitHub OAuth app callback URL doesn't match what Supabase is sending.

**Fix:**
- GitHub OAuth app callback **MUST BE:** `https://ksidbebbiljckrxlunxi.supabase.co/auth/v1/callback`
- Check for typos, extra spaces, wrong protocol (http vs https)
- It takes ~5 seconds for GitHub to update after you save

### Error: "Provider not enabled"

**Cause:** GitHub provider not enabled in Supabase.

**Fix:**
- Supabase → Authentication → Providers → GitHub
- Toggle **ON**
- Add Client ID and Secret
- Click **Save**

### Error: Session doesn't persist / redirects back to login

**Cause:** Redirect URLs in Supabase don't match your domain.

**Fix:**
- Supabase → Authentication → URL Configuration
- Site URL: `https://www-gailp-prd.vercel.app`
- Add redirect URL: `https://www-gailp-prd.vercel.app/*`

---

## Quick Reference

### The Magic URLs

**Your App:**
```
https://www-gailp-prd.vercel.app
```

**Supabase Callback (for GitHub OAuth app):**
```
https://ksidbebbiljckrxlunxi.supabase.co/auth/v1/callback
```

**Your App's Auth Callback (for Supabase config):**
```
https://www-gailp-prd.vercel.app/auth/callback
```

### The Flow

```
User clicks "Sign in"
  ↓
www-gailp-prd.vercel.app/login
  ↓
www-gailp-prd.vercel.app/api/auth/oauth?provider=github
  ↓
Supabase processes and redirects to GitHub
  ↓
GitHub authorization page
  ↓
User clicks "Authorize"
  ↓
GitHub redirects to: ksidbebbiljckrxlunxi.supabase.co/auth/v1/callback  ← MUST BE IN GITHUB APP
  ↓
Supabase exchanges code for session
  ↓
Supabase redirects to: www-gailp-prd.vercel.app/auth/callback
  ↓
App processes session and redirects to: www-gailp-prd.vercel.app/
  ↓
✅ User logged in!
```

---

## After OAuth Works

Once you can successfully log in:

1. **Run database migration** (if not done yet):
   - Supabase → SQL Editor
   - Run: `supabase/migrations/003_wordpress_roles.sql`

2. **Verify your role:**
   ```sql
   SELECT email, role FROM public.user_profiles
   WHERE email = 'malsicario@malsicario.com';
   ```
   Should show: `admin`

3. **Ready for next phase:**
   - Build admin dashboard
   - Create role-specific sidebars
   - Add user profile display

---

**The #1 issue is almost always the GitHub OAuth callback URL!**
Make sure it's the Supabase URL, not your app URL.
