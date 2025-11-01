# FreshRSS Integration Plan

## Overview

This document outlines the integration strategy for connecting FreshRSS feeds to the World Papers homepage, enabling real-time updates to various content cards with policy news, research papers, and industry updates.

## Current State

### Existing Infrastructure
- **FreshRSS Client**: Already implemented at [lib/freshrss.ts](../lib/freshrss.ts)
- **Features Implemented**:
  - Google Reader API authentication
  - Fetch reading list items
  - Get unread count
  - Subscription management
  - Mark as read/star functionality
  - Item transformation to World Papers format
- **Status**: ✅ Client built, not integrated into homepage

### Homepage Content Cards (Current)
Located in [app/page.tsx](../app/page.tsx):
1. **Expert Analysis** - Single featured article (line 266)
2. **Policy Intelligence Feed** - Static policy updates (lines 293-322)
3. **Latest Research** - Recent policy documents (lines 327-357)
4. **Quick Thoughts** - Commentary feed (lines 380-395)

## Integration Goals

### Primary Objectives
1. **Live Policy Updates**: Replace static Policy Intelligence Feed with real FreshRSS items
2. **Dynamic Content**: Auto-update homepage cards every N minutes
3. **Content Categorization**: Route RSS items to appropriate cards based on feed source
4. **Fallback Strategy**: Maintain mock data when FreshRSS unavailable

### Secondary Objectives
1. **Admin Panel**: Simple interface to manage feed sources
2. **Caching**: Reduce API calls, improve performance
3. **Read Tracking**: Mark items as read when clicked
4. **Analytics**: Track which feeds drive engagement

## Integration Architecture

### 1. API Layer Enhancement

#### Create FreshRSS API Route
```typescript
// app/api/feeds/route.ts

import { NextResponse } from 'next/server';
import { getFreshRSSClient } from '@/lib/freshrss';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface FeedItem {
  id: string;
  title: string;
  link: string;
  description: string;
  author?: string;
  publishedAt: Date | null;
  feedName: string;
  feedUrl: string;
  category: 'policy' | 'research' | 'news' | 'analysis';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const count = parseInt(searchParams.get('count') || '20');
  const category = searchParams.get('category') || null;

  try {
    const client = getFreshRSSClient();

    if (!client) {
      // Fallback to mock data
      return NextResponse.json({
        data: getMockFeedItems(count, category),
        source: 'mock',
        count: getMockFeedItems(count, category).length,
      });
    }

    // Authenticate and fetch items
    const items = await client.getItems({ count, excludeRead: false });

    // Transform and categorize
    const categorizedItems = items
      .map(item => {
        const transformed = FreshRSSClient.transformItem(item);
        return {
          ...transformed,
          id: item.id,
          category: categorizeFeedItem(item),
        };
      })
      .filter(item => !category || item.category === category);

    return NextResponse.json({
      data: categorizedItems,
      source: 'freshrss',
      count: categorizedItems.length,
      unreadCount: await client.getUnreadCount(),
    });
  } catch (error) {
    console.error('FreshRSS API error:', error);

    // Fallback to mock data on error
    return NextResponse.json({
      data: getMockFeedItems(count, category),
      source: 'mock',
      count: getMockFeedItems(count, category).length,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Categorize feed items based on feed name or content keywords
function categorizeFeedItem(item: FreshRSSItem): 'policy' | 'research' | 'news' | 'analysis' {
  const feedName = item.origin?.title?.toLowerCase() || '';
  const title = item.title.toLowerCase();

  // Policy feeds
  if (feedName.includes('regulation') ||
      feedName.includes('policy') ||
      title.includes('regulation') ||
      title.includes('compliance')) {
    return 'policy';
  }

  // Research feeds
  if (feedName.includes('research') ||
      feedName.includes('paper') ||
      feedName.includes('journal')) {
    return 'research';
  }

  // Analysis feeds
  if (feedName.includes('analysis') ||
      feedName.includes('blog') ||
      feedName.includes('commentary')) {
    return 'analysis';
  }

  // Default to news
  return 'news';
}

function getMockFeedItems(count: number, category: string | null): FeedItem[] {
  // Return mock data matching the category
  return [];
}
```

### 2. Homepage Component Updates

#### Create FeedCard Component
```typescript
// components/FeedCard.tsx

'use client';

import { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { ExternalLink, RefreshCw } from 'lucide-react';

interface FeedCardProps {
  title: string;
  icon?: React.ReactNode;
  category: 'policy' | 'research' | 'news' | 'analysis';
  itemCount?: number;
  refreshInterval?: number; // in milliseconds
}

export function FeedCard({
  title,
  icon,
  category,
  itemCount = 5,
  refreshInterval = 300000, // 5 minutes default
}: FeedCardProps) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'freshrss' | 'mock'>('mock');

  const fetchItems = async () => {
    try {
      const response = await fetch(
        `/api/feeds?category=${category}&count=${itemCount}`
      );
      const data = await response.json();

      setItems(data.data);
      setSource(data.source);
    } catch (error) {
      console.error('Error fetching feed items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();

    // Set up auto-refresh
    const interval = setInterval(fetchItems, refreshInterval);

    return () => clearInterval(interval);
  }, [category, itemCount, refreshInterval]);

  const handleRefresh = () => {
    setLoading(true);
    fetchItems();
  };

  return (
    <Card>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          </div>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Refresh feed"
          >
            <RefreshCw
              className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`}
            />
          </button>
        </div>

        {/* Source indicator */}
        <div className="mb-3">
          <span
            className={`text-xs px-2 py-1 rounded ${
              source === 'freshrss'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {source === 'freshrss' ? '🔴 Live Feed' : '📝 Demo Content'}
          </span>
        </div>

        {/* Feed items */}
        {loading && items.length === 0 ? (
          <div className="space-y-3">
            {[...Array(itemCount)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <a
                key={item.id}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <div className="flex items-start gap-2">
                  <ExternalLink className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span>{item.feedName}</span>
                      {item.publishedAt && (
                        <>
                          <span>•</span>
                          <time>{formatRelativeTime(item.publishedAt)}</time>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* View all link */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <a
            href={`/feeds/${category}`}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all {category} updates →
          </a>
        </div>
      </div>
    </Card>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
```

#### Update Homepage
```typescript
// app/page.tsx

import { FeedCard } from '@/components/FeedCard';
import { Newspaper, FileText, Lightbulb } from 'lucide-react';

// Replace static Policy Intelligence Feed (lines 293-322)
<FeedCard
  title="Policy Intelligence Feed"
  icon={<Newspaper className="w-5 h-5 text-blue-600" />}
  category="policy"
  itemCount={5}
  refreshInterval={300000} // 5 minutes
/>

// Replace Latest Research (lines 327-357)
<FeedCard
  title="Latest Research"
  icon={<FileText className="w-5 h-5 text-green-600" />}
  category="research"
  itemCount={4}
  refreshInterval={600000} // 10 minutes
/>

// Optional: Add Analysis Feed
<FeedCard
  title="Expert Analysis"
  icon={<Lightbulb className="w-5 h-5 text-purple-600" />}
  category="analysis"
  itemCount={3}
  refreshInterval={300000}
/>
```

### 3. Feed Management Interface

#### Create Admin Page
```typescript
// app/admin/feeds/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';

export default function FeedManagementPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchSubscriptions();
    fetchUnreadCount();
  }, []);

  const fetchSubscriptions = async () => {
    const response = await fetch('/api/feeds/subscriptions');
    const data = await response.json();
    setSubscriptions(data.subscriptions);
  };

  const fetchUnreadCount = async () => {
    const response = await fetch('/api/feeds/unread-count');
    const data = await response.json();
    setUnreadCount(data.count);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Feed Management</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-600">Total Feeds</p>
            <p className="text-2xl font-bold">{subscriptions.length}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-600">Unread Items</p>
            <p className="text-2xl font-bold">{unreadCount}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-600">Active Categories</p>
            <p className="text-2xl font-bold">4</p>
          </div>
        </Card>
      </div>

      {/* Feed list */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Subscriptions</h2>
          <div className="space-y-3">
            {subscriptions.map((sub: any) => (
              <div
                key={sub.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{sub.title}</h3>
                  <p className="text-sm text-gray-600">{sub.url}</p>
                </div>
                <div className="flex items-center gap-2">
                  {sub.categories.map((cat: any) => (
                    <span
                      key={cat.id}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                    >
                      {cat.label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
```

### 4. Caching Strategy

#### Implement Redis/In-Memory Cache
```typescript
// lib/cache.ts

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class FeedCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  set<T>(key: string, data: T, ttl: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const feedCache = new FeedCache();
```

#### Use Cache in API Route
```typescript
// In app/api/feeds/route.ts

import { feedCache } from '@/lib/cache';

export async function GET(request: Request) {
  const cacheKey = `feeds:${category}:${count}`;

  // Check cache first
  const cached = feedCache.get(cacheKey);
  if (cached) {
    return NextResponse.json({
      ...cached,
      source: cached.source + ' (cached)',
    });
  }

  // Fetch from FreshRSS...
  const result = { data: items, source: 'freshrss', count: items.length };

  // Cache for 5 minutes
  feedCache.set(cacheKey, result, 300000);

  return NextResponse.json(result);
}
```

## Environment Configuration

### Required Environment Variables
```bash
# .env.local

# FreshRSS Configuration
FRESHRSS_API_URL=https://your-freshrss-instance.com/api/greader.php
FRESHRSS_API_USERNAME=your_username
FRESHRSS_API_PASSWORD=your_password

# Cache settings (optional)
FEED_CACHE_TTL=300000  # 5 minutes in ms
FEED_REFRESH_INTERVAL=300000
```

### Feed Source Recommendations

#### Policy Feeds
- [Federal Register](https://www.federalregister.gov/) - Tech/AI regulations
- [European Commission Digital](https://digital-strategy.ec.europa.eu/) - EU policy
- [NIST Computer Security](https://csrc.nist.gov/publications/sp) - Standards
- [W3C News](https://www.w3.org/blog/news/) - Web standards

#### Research Feeds
- [arXiv AI](https://arxiv.org/list/cs.AI/recent) - ML research papers
- [SSRN Tech Law](https://papers.ssrn.com/sol3/JELJOUR_Results.cfm) - Legal research
- [Stanford HAI](https://hai.stanford.edu/news) - AI ethics research

#### Analysis Feeds
- [EFF Deeplinks](https://www.eff.org/rss/updates.xml) - Digital rights
- [Brookings TechTank](https://www.brookings.edu/topic/technology/) - Policy analysis
- [Center for Data Innovation](https://www2.datainnovation.org/) - Data policy

## Testing Plan

### Unit Tests
```typescript
// __tests__/freshrss-integration.test.ts

import { getFreshRSSClient } from '@/lib/freshrss';

describe('FreshRSS Integration', () => {
  it('should fallback to mock data when not configured', async () => {
    const client = getFreshRSSClient();
    expect(client).toBeNull();
  });

  it('should fetch items successfully', async () => {
    // Mock FreshRSS client
    const mockClient = {
      getItems: jest.fn().mockResolvedValue([]),
      getUnreadCount: jest.fn().mockResolvedValue(42),
    };

    const items = await mockClient.getItems({ count: 5 });
    expect(items).toEqual([]);
  });

  it('should categorize feed items correctly', () => {
    const policyItem = {
      title: 'New AI Regulation Proposed',
      origin: { title: 'Policy Watch' },
    };

    const category = categorizeFeedItem(policyItem);
    expect(category).toBe('policy');
  });
});
```

### Integration Tests
1. **FreshRSS Connection**: Verify authentication works
2. **Feed Fetching**: Confirm items retrieved successfully
3. **Categorization**: Check correct routing to homepage cards
4. **Caching**: Validate cache hit/miss behavior
5. **Fallback**: Ensure mock data loads when FreshRSS down

### Manual Testing Checklist
- [ ] Homepage loads with live feed data
- [ ] Refresh button updates items
- [ ] External links open in new tab
- [ ] Relative timestamps display correctly
- [ ] Cache reduces API calls
- [ ] Fallback to mock data works
- [ ] Admin panel shows subscriptions
- [ ] Mobile responsive layout

## Performance Considerations

### Metrics to Monitor
- API response time: < 200ms (cached), < 2s (fresh)
- Homepage load time: < 1s (First Contentful Paint)
- Feed refresh frequency: Every 5 minutes
- Cache hit rate: > 80%

### Optimization Strategies
1. **Server-Side Rendering**: Pre-fetch feeds at build time for static generation
2. **Incremental Static Regeneration**: Rebuild pages every 5 minutes
3. **Client-Side Caching**: Use SWR or React Query for client cache
4. **Lazy Loading**: Load feeds below fold asynchronously

```typescript
// Use Next.js ISR
export const revalidate = 300; // 5 minutes

export async function generateStaticParams() {
  return [
    { category: 'policy' },
    { category: 'research' },
    { category: 'analysis' },
  ];
}
```

## Rollout Plan

### Phase 1: Development (2-3 hours)
- [ ] Create `/api/feeds` route
- [ ] Build `FeedCard` component
- [ ] Implement caching layer
- [ ] Add environment variables

### Phase 2: Testing (1-2 hours)
- [ ] Test with FreshRSS instance
- [ ] Verify categorization logic
- [ ] Check fallback behavior
- [ ] Mobile responsiveness

### Phase 3: Integration (1 hour)
- [ ] Replace homepage static cards
- [ ] Update documentation
- [ ] Add admin panel link
- [ ] Deploy to staging

### Phase 4: Production (30 min)
- [ ] Deploy to Vercel
- [ ] Monitor performance
- [ ] Check error logs
- [ ] Collect user feedback

### Total Estimated Time: 4-6 hours

## Success Criteria

- [ ] Homepage displays live FreshRSS items
- [ ] Feeds auto-refresh every 5 minutes
- [ ] Cache reduces API calls by > 70%
- [ ] Fallback to mock data is seamless
- [ ] Admin can view subscription list
- [ ] No performance regression (< 1s page load)
- [ ] Mobile experience is smooth

## Future Enhancements

### Short-term
- [ ] Mark items as read when clicked
- [ ] Star/save items for later
- [ ] Filter by specific feeds
- [ ] Search across all feed items

### Long-term
- [ ] AI-powered feed summarization
- [ ] Duplicate detection across feeds
- [ ] Custom feed rules (keyword filters)
- [ ] Email digests of top items
- [ ] Integration with NIST RAG for context

---

**Document Version**: 1.0
**Last Updated**: 2025-10-31
**Owner**: World Papers Team
