# Deployment Guide - World Papers (GAILP)

**Pre-Launch Deployment to Vercel → malsicario.com**

---

## Table of Contents

1. [Pre-Deployment](#pre-deployment)
2. [Environment Configuration](#environment-configuration)
3. [Deploy to Vercel](#deploy-to-vercel)
4. [Post-Deployment Testing](#post-deployment-testing)
5. [Custom Domain Setup](#custom-domain-setup)
6. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment

### 1. Final Code Review

```bash
# Ensure you're on the main branch
git branch

# Pull latest changes
git pull origin main

# Check status
git status

# Run local build test
npm run build
```

**Expected**: Build completes without errors

---

### 2. Environment Variables Check

Verify all required environment variables are set:

#### Required Variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (admin)
- `QUICK_POST_SECRET` - Secret for Drafts app integration

#### Optional Variables:
- `NEXT_PUBLIC_SITE_NAME` - "World Papers" (default)
- `NEXT_PUBLIC_SITE_URL` - Production URL

---

### 3. Run Link Validator

```bash
npx tsx scripts/validate-links.ts
```

**Expected**: 0-4 issues (only in commented code)

---

## Environment Configuration

### Vercel Dashboard Setup

1. **Go to Vercel Project Settings**
   - Settings → Environment Variables

2. **Add Production Variables**

   ```
   NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY = eyJhbGc...
   QUICK_POST_SECRET = your-secret-key
   ```

3. **Set Environment Scope**
   - ✅ Production
   - ✅ Preview
   - ⬜ Development (use local .env.local)

---

## Deploy to Vercel

### Method 1: Git Push (Recommended)

```bash
# Stage all changes
git add .

# Create deployment commit
git commit -m "Pre-launch deployment: All fixes applied

✅ Media vault file display fixed
✅ Article image preview working
✅ Navigation labels updated (Think Tank, GSA)
✅ Cursor pointers added
✅ Admin sidebar cleaned up
✅ All links validated and fixed
✅ Data boxes fetch real stats

Ready for malsicario.com launch"

# Push to trigger deployment
git push origin main
```

**Vercel will automatically**:
- Detect the push
- Start build process
- Run `npm run build`
- Deploy to production URL

---

### Method 2: Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## Post-Deployment Testing

### Automated Tests

#### Quick Smoke Test (30 seconds)
```bash
npx tsx scripts/smoke-test.ts https://your-app.vercel.app
```

#### Full Health Check (2 minutes)
```bash
DEPLOYMENT_URL=https://your-app.vercel.app npx tsx scripts/test-deployment.ts
```

---

### Manual Testing Checklist

Use: [POST-DEPLOYMENT-CHECKLIST.md](./POST-DEPLOYMENT-CHECKLIST.md)

**Critical Tests**:
1. ✅ Media Vault displays files
2. ✅ Article image preview works
3. ✅ Navigation labels correct
4. ✅ Admin sidebar clean (no duplication)
5. ✅ Data boxes show stats

---

## Custom Domain Setup

### Configure malsicario.com

#### Step 1: Add Domain in Vercel

1. Go to Project Settings → Domains
2. Click "Add Domain"
3. Enter: `malsicario.com`
4. Click "Add"

#### Step 2: Configure DNS

Vercel will provide DNS records. Add these to your domain registrar:

**Option A: A Record (Recommended)**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

**Option B: CNAME**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

#### Step 3: Wait for SSL

- SSL certificate auto-generated
- Takes 5-10 minutes
- Status: "Valid" when ready

#### Step 4: Test Custom Domain

```bash
# Test DNS propagation
nslookup malsicario.com

# Test SSL
curl -I https://malsicario.com

# Run smoke test
npx tsx scripts/smoke-test.ts https://malsicario.com
```

---

## Troubleshooting

### Media Vault Shows No Files

**Symptoms**: Empty grid on `/admin/media`

**Solutions**:
1. Click "Refresh" button (top-right)
2. Check browser console for errors
3. Verify Supabase env vars in Vercel
4. Check Supabase Storage bucket is PUBLIC

**Test**:
```bash
# Check if Supabase URL is accessible
curl https://xxxxx.supabase.co/storage/v1/bucket/media
```

---

### Images Don't Load in Articles

**Symptoms**: Broken images in article preview

**Solutions**:
1. Verify `next.config.js` deployed correctly
2. Check `*.supabase.co` in `remotePatterns`
3. Clear browser cache
4. Check Vercel build logs for config warnings

**Verify**:
```bash
# Check deployed config
curl https://your-app.vercel.app/_next/static/chunks/webpack.js | grep supabase
```

---

### Stats Show Mock Data (247, 89, 156)

**Symptoms**: Data boxes don't update

**This is expected if**:
- Database has no published articles
- No authors in database
- API returns empty results

**Solution**: Publish some articles and stats will update automatically

---

### Build Fails on Vercel

**Common Issues**:

1. **Missing Environment Variables**
   - Check all required vars are set
   - Scope set to "Production"

2. **TypeScript Errors**
   - Run `npm run build` locally first
   - Fix any type errors

3. **Dependency Issues**
   - Clear cache in Vercel settings
   - Redeploy

---

## Rollback Procedure

### If Deployment Breaks Production

1. **Immediate Rollback**
   - Go to Vercel Dashboard → Deployments
   - Find last working deployment
   - Click "..." → "Promote to Production"

2. **Fix Issues Locally**
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Re-deploy When Fixed**

---

## Post-Launch Monitoring

### Week 1 Checklist

- [ ] Monitor Vercel Analytics for errors
- [ ] Check Supabase logs for API issues
- [ ] Review user feedback
- [ ] Test on different devices/browsers
- [ ] Monitor page load times

### Performance Targets

- Lighthouse Score: >80
- First Contentful Paint: <2s
- Time to Interactive: <3s
- No 500 errors in logs

---

## Support

**If issues persist**:
1. Check Vercel build logs
2. Check browser console errors
3. Review Supabase logs
4. Contact: [your-email@example.com]

---

**Deployment Version**: 1.0.0
**Last Updated**: 2025-01-23
**Target Domain**: malsicario.com
