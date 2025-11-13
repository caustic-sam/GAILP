# Policy Sources - Update Status

## Overview

The Policy Updates page currently displays 14 policy sources with **static** "recentActivity" timestamps. These are hardcoded placeholder values and do not reflect actual update times.

## Current Sources

### ✅ Has RSS/API Feed

1. **CISA Cybersecurity Advisories** (🇺🇸)
   - URL: https://www.cisa.gov
   - Feed: https://www.cisa.gov/cybersecurity-advisories/all.xml
   - Type: RSS/XML

2. **FTC Privacy & Data Security** (🇺🇸)
   - URL: https://www.ftc.gov/privacy-data-security
   - Feed: https://www.ftc.gov/feeds/recent.xml
   - Type: RSS/XML

3. **UK Information Commissioner** (🇬🇧)
   - URL: https://ico.org.uk
   - Feed: https://ico.org.uk/about-the-ico/news-and-events/news-and-blogs/rss-feeds/
   - Type: RSS/XML

### ⚠️ Requires Web Scraping

4. **EU AI Act Implementation** (🇪🇺)
   - URL: https://digital-strategy.ec.europa.eu/ai
   - No RSS feed - requires scraping or API

5. **DSA/DMA Enforcement** (🇪🇺)
   - URL: https://digital-strategy.ec.europa.eu
   - No RSS feed - requires scraping

6. **NIST AI Risk Management** (🇺🇸)
   - URL: https://www.nist.gov/ai
   - Limited feed availability

7. **UK AI Regulation** (🇬🇧)
   - URL: https://www.gov.uk/ai-regulation
   - GOV.UK has feeds but specific AI page may not

8. **Office of the Privacy Commissioner** (🇨🇦)
   - URL: https://www.priv.gc.ca
   - May have news feed

9. **Canadian AI & Data Act** (🇨🇦)
   - URL: https://www.parl.ca/legisinfo
   - Legislative updates via Parliament site

10. **Australian Information Commissioner** (🇦🇺)
    - URL: https://www.oaic.gov.au
    - May have news feed

11. **Singapore PDPC** (🇸🇬)
    - URL: https://www.pdpc.gov.sg
    - May have news feed

12. **OECD Digital Economy** (🌐)
    - URL: https://www.oecd.org/digital
    - OECD has various feeds

13. **Council of Europe AI** (🌐)
    - URL: https://www.coe.int/ai
    - CoE news feeds available

14. **GDPR Enforcement Tracker** (🇪🇺)
    - URL: https://www.enforcementtracker.com
    - Third-party tracker - may have API

## Implementation Options

### Option 1: RSS Feed Aggregator

Create a background job to fetch RSS feeds:

```typescript
// lib/policy-feeds/aggregator.ts
export async function fetchPolicyUpdates() {
  const feeds = [
    { id: 'us-cisa', url: 'https://www.cisa.gov/cybersecurity-advisories/all.xml' },
    { id: 'us-ftc', url: 'https://www.ftc.gov/feeds/recent.xml' },
    { id: 'uk-ico', url: 'https://ico.org.uk/rss-feed.xml' },
    // ... more feeds
  ];

  const updates = await Promise.all(
    feeds.map(async feed => {
      const response = await fetch(feed.url);
      const xml = await response.text();
      const parsed = parseXML(xml);
      return {
        id: feed.id,
        latestUpdate: parsed.items[0].pubDate,
        items: parsed.items
      };
    })
  );

  return updates;
}
```

### Option 2: Web Scraping Service

For sources without RSS feeds, use a scraping service:

- **Puppeteer/Playwright**: For JavaScript-heavy sites
- **Cheerio**: For simple HTML parsing
- **ScrapingBee/ScraperAPI**: Managed scraping services

### Option 3: Manual Curation

Admin updates timestamps manually via CMS:

```typescript
// app/admin/policy-sources/page.tsx
<button onClick={() => markAsUpdated(source.id)}>
  Mark as Updated
</button>
```

### Option 4: API Integration

Use official APIs where available:

- **CISA**: KEV Catalog API
- **NIST**: NVD API
- **EU Digital Strategy**: May have undocumented APIs

## Recommended Approach

**Phase 1** (Quick Win):
1. Implement RSS feed aggregator for 3-4 sources with feeds
2. Update timestamps automatically every 6 hours
3. Show "Last checked" timestamp

**Phase 2** (Enhanced):
1. Add web scraping for high-priority sources
2. Store full article metadata (title, summary, link)
3. Display recent updates on Policy Updates page

**Phase 3** (Full Integration):
1. Full-text search across policy documents
2. Alert system for breaking policy changes
3. Personalized policy tracking dashboard

## Database Schema

```sql
CREATE TABLE policy_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  url TEXT,
  published_at TIMESTAMP NOT NULL,
  fetched_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(source_id, url)
);

CREATE INDEX idx_policy_updates_source ON policy_updates(source_id);
CREATE INDEX idx_policy_updates_published ON policy_updates(published_at DESC);
```

## Next Steps

1. ✅ Document current status (this file)
2. ⏳ Identify RSS feeds for each source
3. ⏳ Build RSS feed aggregator
4. ⏳ Create admin interface for manual updates
5. ⏳ Implement cron job for automatic updates

## Timeline Estimate

- RSS Aggregator: 4-6 hours
- Admin Interface: 2-3 hours
- Web Scraping (per source): 2-4 hours
- Full Integration: 20-30 hours

## Notes

- Consider rate limiting when fetching multiple feeds
- Cache feed responses to avoid excessive requests
- Some sources may require CORS proxy or server-side fetching
- EU sources may require special handling due to geo-restrictions
