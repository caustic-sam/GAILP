# FreshRSS Integration Setup Guide

## Overview

World Papers integrates with FreshRSS to provide live RSS feed aggregation. The system uses a 3-tier fallback approach for maximum reliability.

## Architecture

### Fallback Tiers

1. **Primary: Google Reader API**
   - Most feature-rich
   - Requires API access enabled in FreshRSS
   - Provides read/unread status, categories, subscriptions

2. **Fallback 1: Direct RSS Feed**
   - Works with basic FreshRSS setup
   - Requires RSS feed URL with token
   - No authentication needed

3. **Fallback 2: Mock Data**
   - Always available
   - Ensures app never breaks
   - Used when FreshRSS is unreachable

## Current Status

✅ **RSS Feed Fallback**: Working
⚠️ **Google Reader API**: Needs configuration (see below)
✅ **Mock Data Fallback**: Working

## Environment Variables

Add to `.env.local`:

```bash
# Google Reader API (preferred)
FRESHRSS_API_URL="http://192.168.1.133:8082/api/greader.php"
FRESHRSS_API_USERNAME="Gailp"
FRESHRSS_API_PASSWORD="your-api-password"  # See setup instructions

# RSS Feed (fallback)
FRESHRSS_RSS_URL="http://192.168.1.133:8082/i/?a=rss&user=roundrock&token=thisistheone&hours=168"
```

## FreshRSS Configuration

### Enable Google Reader API

1. Log into FreshRSS admin: http://192.168.1.133:8082/i
2. Navigate to **Settings → Authentication**
3. Enable **"Allow API access (required for mobile apps)"**
4. Set or note your **API password** (may differ from web login password)
5. Update `FRESHRSS_API_PASSWORD` in `.env.local`

### Get RSS Feed Token

Your RSS feed URL includes a token for authentication:
- Format: `http://[host]/i/?a=rss&user=[username]&token=[token]&hours=[hours]`
- Find token in: **Settings → Profile → API management**
- Or extract from the RSS URL shown on your FreshRSS homepage

## Testing

### Test Endpoint

Access: http://localhost:3000/api/test-freshrss

This endpoint runs diagnostic tests:
1. ✅ Client Creation
2. ✅ Authentication
3. ✅ Fetch Items
4. ✅ Unread Count
5. ✅ Subscriptions
6. ✅ RSS Fallback

### Main Feeds Endpoint

Access: http://localhost:3000/api/feeds?count=10

Parameters:
- `count`: Number of items (default: 20)
- `category`: Filter by category (policy, research, news, analysis)

Example responses:
```json
{
  "data": [/* feed items */],
  "source": "freshrss-rss",  // or "freshrss", "mock"
  "count": 10
}
```

## Feed Categorization

Items are automatically categorized based on keywords:

- **Policy**: regulation, policy, government, compliance
- **Research**: research, paper, journal, academic, study
- **Analysis**: analysis, opinion, commentary, blog
- **News**: Default for everything else

## Exposing Through Firewall

### Current Setup (Local Network)
```
FreshRSS: http://192.168.1.133:8082
Access: LAN only
```

### Production Setup Options

#### Option 1: Port Forwarding + Dynamic DNS
```bash
# Router Configuration
External Port: 8082 (or custom)
Internal IP: 192.168.1.133
Internal Port: 8082

# Dynamic DNS (e.g., DuckDNS, No-IP)
Domain: yourname.duckdns.org
Points to: Your home IP

# Update .env.local
FRESHRSS_API_URL="https://yourname.duckdns.org:8082/api/greader.php"
FRESHRSS_RSS_URL="https://yourname.duckdns.org:8082/i/?a=rss&user=roundrock&token=thisistheone&hours=168"
```

#### Option 2: Reverse Proxy (Recommended)
```bash
# Install nginx on FreshRSS host
# Configure SSL with Let's Encrypt
# Proxy external 443 → internal 8082

# Update .env.local
FRESHRSS_API_URL="https://feeds.yourdomain.com/api/greader.php"
FRESHRSS_RSS_URL="https://feeds.yourdomain.com/i/?a=rss&user=roundrock&token=thisistheone&hours=168"
```

#### Option 3: Cloudflare Tunnel (Zero-Config)
```bash
# Install cloudflared
# Create tunnel
# No port forwarding needed
# Automatic SSL

# Update .env.local
FRESHRSS_API_URL="https://[tunnel-id].cfargotunnel.com/api/greader.php"
```

### Security Considerations

⚠️ **Important**: Exposing services requires security measures:

1. **Use HTTPS** (Let's Encrypt, Cloudflare)
2. **Change default passwords**
3. **Enable FreshRSS API authentication**
4. **Consider IP whitelisting** (Vercel edge IPs)
5. **Monitor access logs**
6. **Keep FreshRSS updated**

### Recommended: Cloudflare Tunnel

Easiest and most secure option for home hosting:

```bash
# Install
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb

# Authenticate
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create freshrss

# Configure
cat > ~/.cloudflared/config.yml <<EOF
tunnel: [your-tunnel-id]
credentials-file: /home/[user]/.cloudflared/[tunnel-id].json

ingress:
  - hostname: feeds.yourdomain.com
    service: http://192.168.1.133:8082
  - service: http_status:404
EOF

# Run
cloudflared tunnel run freshrss

# Or install as service
sudo cloudflared service install
sudo systemctl start cloudflared
```

## Deployment to Vercel

When deploying to Vercel:

1. Add environment variables in Vercel dashboard
2. Use your public FreshRSS URL (after exposing through firewall)
3. RSS fallback will work automatically
4. Mock data ensures app never breaks

## Troubleshooting

### Google Reader API Returns "Unauthorized"

**Solution**: Enable API access in FreshRSS settings

```
Settings → Authentication → Allow API access
```

### RSS Feed Returns 401/403

**Solution**: Verify token in URL matches your FreshRSS user settings

```
Settings → Profile → API management → Generate new token
```

### Feeds Not Updating

**Check**:
1. FreshRSS is running: `curl http://192.168.1.133:8082`
2. Network connectivity from dev machine
3. FreshRSS has subscriptions and recent items
4. Auto-refresh settings (5-10 minutes)

### Vercel Deployment Can't Reach FreshRSS

**Expected**: Local network URLs won't work in production

**Solution**:
- Use RSS fallback with publicly accessible URL
- Or accept mock data for now
- Or set up Cloudflare Tunnel / reverse proxy

## Components Using FreshRSS

- `app/api/feeds/route.ts` - Main feed endpoint
- `components/FeedCard.tsx` - Feed display widget (5 min refresh)
- `components/GlobalFeedStream.tsx` - Horizontal feed stream (10 min refresh)
- `lib/freshrss.ts` - Google Reader API client
- `app/page.tsx` - Homepage integration

## Future Enhancements

- [ ] Mark items as read
- [ ] Star/favorite items
- [ ] Filter by feed source
- [ ] Search within feeds
- [ ] User preferences for categories
- [ ] Push notifications for important items
- [ ] Offline caching with Service Worker

## References

- [FreshRSS Documentation](https://freshrss.github.io/FreshRSS/)
- [Google Reader API Docs](https://freshrss.github.io/FreshRSS/en/developers/06_GoogleReader_API.html)
- [Cloudflare Tunnels](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
