# RSS Operations Guide - World Papers

## Overview

World Papers uses FreshRSS as its RSS feed aggregation backend with a robust 3-tier fallback system. This guide covers deployment, operations, monitoring, and troubleshooting.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                      World Papers Frontend                   │
│                     (Next.js 14 / Vercel)                   │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │  /api/feeds Endpoint │
        └──────────┬────────────┘
                   │
        ┌──────────┴──────────┐
        │   Tier 1: Primary   │
        │ Google Reader API   │
        └──────────┬────────────┘
                   │ (on failure)
        ┌──────────┴──────────┐
        │   Tier 2: Fallback  │
        │  Direct RSS Feed    │
        └──────────┬────────────┘
                   │ (on failure)
        ┌──────────┴──────────┐
        │   Tier 3: Safety    │
        │    Mock Data        │
        └─────────────────────┘
```

### Data Flow

1. **Client Request** → `/api/feeds?count=20&category=policy`
2. **Tier 1 Attempt** → FreshRSS Google Reader API
   - Authenticate with username/password
   - Fetch items from reading list
   - Return categorized items
3. **Tier 2 Fallback** → Direct RSS feed with token
   - Parse RSS XML
   - Transform to standard format
   - Categorize items
4. **Tier 3 Safety** → Mock data
   - Return curated sample articles
   - Ensures app never breaks
   - Maintains user experience

## Environment Configuration

### Required Variables

```bash
# FreshRSS Google Reader API (Tier 1)
FRESHRSS_API_URL=http://your-freshrss-host/api/greader.php
FRESHRSS_API_USERNAME=your-username
FRESHRSS_API_PASSWORD=your-api-password

# FreshRSS RSS Feed (Tier 2 Fallback)
FRESHRSS_RSS_URL=http://your-freshrss-host/i/?a=rss&user=your-username&token=your-token&hours=168
```

### Local Development (.env.local)

```bash
# Copy from .env.example
cp .env.example .env.local

# Edit with your FreshRSS credentials
FRESHRSS_API_URL="http://192.168.1.133:8082/api/greader.php"
FRESHRSS_API_USERNAME="roundrock"
FRESHRSS_API_PASSWORD="your-password"
FRESHRSS_RSS_URL="http://192.168.1.133:8082/i/?a=rss&user=roundrock&token=your-token&hours=168"
```

### Production (Vercel)

Configure in Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add all required variables
3. Set scope: Production, Preview, Development
4. Redeploy to apply changes

## FreshRSS Setup

### Initial Installation

See [FRESHRSS-SETUP.md](./FRESHRSS-SETUP.md) for detailed setup instructions.

### Enable Google Reader API

1. Log into FreshRSS admin panel
2. Navigate to **Settings → Authentication**
3. Enable **"Allow API access (required for mobile apps)"**
4. Set your API password (can differ from web login)
5. Save settings

### Get RSS Feed Token

1. Go to **Settings → Profile → API Management**
2. Copy your API token
3. Or find in RSS URL on homepage: `token=xxxxx`

### Subscription Management

Add feeds for relevant categories:

```bash
# Policy & Regulation
- EU Digital Policy Feed
- NIST Publications
- UK Government Digital
- FTC Technology Updates

# Research & Academic
- Stanford HAI
- MIT Technology Review Research
- ACM TechNews
- arXiv Computer Science

# News & Analysis
- TechCrunch Policy
- Ars Technica Policy
- The Verge Policy
- CoinDesk Policy
```

### Feed Categories

FreshRSS allows organizing feeds into categories:
- **policy** - Government, regulation, compliance
- **research** - Academic papers, studies
- **news** - Breaking news, announcements
- **analysis** - Opinion, commentary, blogs

## Deployment

### Vercel Deployment

#### Automatic (via GitHub)

Push to `main` branch triggers automatic deployment:

```bash
git add .
git commit -m "feat: Update RSS configuration"
git push origin main
```

GitHub Actions workflow:
1. Runs pre-deployment tests
2. Validates FreshRSS integration
3. Builds with production credentials
4. Deploys to Vercel
5. Runs smoke tests

#### Manual (via CLI)

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

### Environment Variables in CI/CD

GitHub Secrets required:

```bash
VERCEL_TOKEN          # Vercel API token
VERCEL_ORG_ID         # Organization ID
VERCEL_PROJECT_ID     # Project ID
FRESHRSS_API_URL      # Production FreshRSS URL
FRESHRSS_API_USERNAME # FreshRSS username
FRESHRSS_API_PASSWORD # API password
FRESHRSS_RSS_URL      # RSS feed URL with token
```

## Monitoring

### Health Checks

#### Test Endpoint

```bash
# Check all tiers
curl https://your-domain.com/api/test-freshrss

# Expected response
{
  "timestamp": "2025-11-01T10:00:00.000Z",
  "config": {
    "apiUrl": "http://...",
    "username": "roundrock",
    "passwordSet": true,
    "rssUrl": "http://..."
  },
  "tests": {
    "clientCreation": { "status": "PASSED" },
    "authentication": { "status": "PASSED", "authenticated": true },
    "fetchItems": { "status": "PASSED", "itemCount": 20 },
    "unreadCount": { "status": "PASSED", "count": 42 },
    "subscriptions": { "status": "PASSED", "count": 15 },
    "rssFallback": { "status": "PASSED", "itemCount": 20 }
  },
  "summary": {
    "overall": "✅ ALL TESTS PASSED",
    "passedCount": 6,
    "totalTests": 6
  }
}
```

#### Feeds Endpoint

```bash
# Check feeds are loading
curl https://your-domain.com/api/feeds?count=5

# Expected response
{
  "data": [
    {
      "id": "...",
      "title": "Article Title",
      "link": "https://...",
      "description": "...",
      "author": "Author Name",
      "publishedAt": "2025-11-01T10:00:00.000Z",
      "feedName": "Feed Name",
      "feedUrl": "https://...",
      "category": "policy"
    }
  ],
  "source": "freshrss",  // or "freshrss-rss" or "mock"
  "count": 5,
  "unreadCount": 42  // only with Google Reader API
}
```

### Vercel Analytics

Enable in Vercel Dashboard:
- Monitor request volume to `/api/feeds`
- Track response times
- Monitor error rates
- Set up alerts for failures

### Logs

#### Vercel Logs

```bash
# View real-time logs
vercel logs

# Filter by function
vercel logs --filter=/api/feeds

# Follow mode
vercel logs --follow
```

#### Local Development

Console logs show tier fallback:
```bash
🔄 Fetching items from FreshRSS...
✅ Fetched 20 items from FreshRSS
📊 Returning 20 categorized items
```

Or on failure:
```bash
❌ FreshRSS API error: Network timeout
🔄 Trying RSS feed fallback...
✅ Fetched 15 items from RSS feed
```

## Performance Optimization

### Caching Strategy

Current setup:
```typescript
export const dynamic = 'force-dynamic';
export const revalidate = 0;  // No cache
```

For production, consider:
```typescript
export const revalidate = 300;  // 5 minutes
```

### Response Time Targets

- **Google Reader API**: < 500ms
- **RSS Fallback**: < 1000ms
- **Mock Data**: < 50ms

### Rate Limiting

FreshRSS has no built-in rate limiting, but consider:
- Client-side caching (5-10 minutes)
- Vercel Edge caching
- Request deduplication

## Troubleshooting

### Issue: "Unauthorized" from Google Reader API

**Symptoms:**
- Test endpoint shows `authentication: { status: "FAILED" }`
- Feeds fall back to RSS tier

**Solutions:**
1. Verify API access enabled in FreshRSS
2. Check username matches FreshRSS account
3. Verify API password (not web login password)
4. Check FreshRSS logs for auth attempts

**Diagnostic:**
```bash
# Test authentication directly
curl -X POST "http://your-freshrss/api/greader.php/accounts/ClientLogin" \
  -d "Email=your-username&Passwd=your-password"

# Expected: SID=... Auth=...
# Error: Error=BadAuthentication
```

### Issue: RSS Feed Returns 401/403

**Symptoms:**
- Tier 2 fallback fails
- Falls back to mock data

**Solutions:**
1. Regenerate RSS token in FreshRSS
2. Verify URL includes correct username
3. Check token hasn't expired
4. Ensure RSS access is enabled

**Diagnostic:**
```bash
# Test RSS feed
curl "http://your-freshrss/i/?a=rss&user=username&token=token&hours=168"

# Expected: Valid XML
# Error: 401 Unauthorized or 403 Forbidden
```

### Issue: Feeds Not Updating

**Symptoms:**
- Old articles displayed
- Stale data

**Solutions:**
1. Check FreshRSS is auto-refreshing feeds
2. Verify feed subscriptions are active
3. Clear Vercel deployment cache
4. Check feed sources are online

**Diagnostic:**
```bash
# Check FreshRSS feed update times
# Log into FreshRSS → View feed details → Last update time

# Force refresh in FreshRSS
# Click "Update all feeds" in admin panel
```

### Issue: Slow Response Times

**Symptoms:**
- API requests > 2 seconds
- Timeout errors

**Solutions:**
1. Enable response caching (`revalidate: 300`)
2. Reduce `count` parameter (default 20)
3. Check FreshRSS server resources
4. Consider CDN for FreshRSS

**Diagnostic:**
```bash
# Measure response time
time curl https://your-domain.com/api/feeds?count=10

# Check which tier is being used
curl https://your-domain.com/api/feeds | jq '.source'
```

### Issue: Categories Not Working

**Symptoms:**
- All items show as "news"
- Category filter returns no results

**Solutions:**
1. Update categorization keywords in `app/api/feeds/route.ts`
2. Organize feeds into FreshRSS categories
3. Use feed names with category keywords

**Diagnostic:**
```bash
# Check categorization
curl https://your-domain.com/api/feeds?count=20 | jq '.data[] | {title, category}'
```

## Security

### API Credentials

- **Never commit** `.env.local` to git
- Use **different passwords** for web vs API
- **Rotate tokens** quarterly
- Use **environment variables** only

### Exposing FreshRSS

When exposing through firewall:

#### ✅ Recommended: Cloudflare Tunnel
- Zero-config, automatic SSL
- No port forwarding needed
- DDoS protection included
- Free tier available

#### ⚠️ Alternative: Reverse Proxy (nginx)
- Manual SSL setup (Let's Encrypt)
- Requires port forwarding
- Full control over configuration

#### ❌ Not Recommended: Direct Port Forwarding
- Security risk without SSL
- No DDoS protection
- Exposes server directly

See [FRESHRSS-SETUP.md](./FRESHRSS-SETUP.md) for detailed instructions.

### Network Security

- Use HTTPS only in production
- Consider IP whitelisting (Vercel IPs)
- Enable FreshRSS API authentication
- Monitor access logs regularly
- Keep FreshRSS updated

## Maintenance

### Regular Tasks

**Daily:**
- Monitor Vercel deployment health
- Check error rates in analytics

**Weekly:**
- Review FreshRSS feed health
- Remove broken/inactive feeds
- Check for FreshRSS updates

**Monthly:**
- Review subscription list
- Add new relevant feeds
- Rotate API tokens (optional)

**Quarterly:**
- Update FreshRSS version
- Review security settings
- Audit access logs
- Backup FreshRSS database

### Backup & Recovery

#### FreshRSS Database

```bash
# Backup (if using SQLite)
cp /path/to/freshrss/data/db.sqlite /backups/freshrss-$(date +%Y%m%d).sqlite

# Backup (if using PostgreSQL/MySQL)
pg_dump freshrss > freshrss-backup-$(date +%Y%m%d).sql
mysqldump freshrss > freshrss-backup-$(date +%Y%m%d).sql
```

#### Configuration

```bash
# Backup FreshRSS config
tar -czf freshrss-config-$(date +%Y%m%d).tar.gz /path/to/freshrss/data/config.php

# Backup OPML (subscriptions)
# Export from FreshRSS: Settings → Import/Export → Export
```

### Disaster Recovery

**Scenario: FreshRSS Server Down**
- Tier 2 (RSS) or Tier 3 (Mock) automatically activates
- No action needed - app continues working
- Users see fallback data seamlessly

**Scenario: FreshRSS Data Loss**
- Restore from latest backup
- Re-import OPML subscriptions
- Verify feeds are updating
- Clear Vercel cache if needed

**Scenario: Vercel Deployment Failure**
- Check GitHub Actions logs
- Verify environment variables
- Rollback to previous deployment
- Fix issues and redeploy

## API Reference

### GET /api/feeds

Retrieve aggregated RSS feed items.

**Query Parameters:**
- `count` (number, default: 20) - Number of items to return
- `category` (string, optional) - Filter by category: policy, research, news, analysis

**Response:**
```typescript
{
  data: Array<{
    id: string
    title: string
    link: string
    description: string
    author?: string
    publishedAt: Date | null
    feedName: string
    feedUrl: string
    category: 'policy' | 'research' | 'news' | 'analysis'
  }>
  source: 'freshrss' | 'freshrss-rss' | 'mock'
  count: number
  unreadCount?: number  // Only with Google Reader API
  error?: string        // Only with mock data fallback
}
```

**Examples:**
```bash
# Get 10 items
curl https://your-domain.com/api/feeds?count=10

# Get policy items only
curl https://your-domain.com/api/feeds?category=policy

# Get 5 research items
curl https://your-domain.com/api/feeds?count=5&category=research
```

### GET /api/test-freshrss

Run diagnostic tests on FreshRSS integration.

**Response:**
```typescript
{
  timestamp: string
  config: {
    apiUrl: string
    username: string
    passwordSet: boolean
    rssUrl: string
  }
  tests: {
    clientCreation: { status: string }
    authentication: { status: string, authenticated?: boolean }
    fetchItems: { status: string, itemCount?: number }
    unreadCount: { status: string, count?: number }
    subscriptions: { status: string, count?: number }
    rssFallback: { status: string, itemCount?: number }
  }
  summary: {
    overall: string
    passedCount: number
    totalTests: number
  }
}
```

## Resources

### Documentation
- [FreshRSS Setup Guide](./FRESHRSS-SETUP.md)
- [Testing Guide](./TESTING.md)
- [Branch Strategy](./BRANCH-STRATEGY.md)
- [FreshRSS Official Docs](https://freshrss.github.io/FreshRSS/)
- [Google Reader API Docs](https://freshrss.github.io/FreshRSS/en/developers/06_GoogleReader_API.html)

### Support
- GitHub Issues: [Project Issues](https://github.com/your-org/world-papers/issues)
- FreshRSS Community: [GitHub Discussions](https://github.com/FreshRSS/FreshRSS/discussions)

### Tools
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Let's Encrypt](https://letsencrypt.org/)

## Changelog

### Version 0.2.0 (Current)
- ✅ FreshRSS integration with 3-tier fallback
- ✅ Google Reader API support
- ✅ Direct RSS feed fallback
- ✅ Mock data safety tier
- ✅ Automatic categorization
- ✅ Comprehensive test suite
- ✅ CI/CD pipeline with GitHub Actions
- ✅ Vercel deployment automation
- ✅ Complete documentation

### Version 0.1.0
- Initial release
- Basic Next.js setup
- Static content only
