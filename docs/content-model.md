# Content Model

This document defines the content schemas for World Papers.

## Policy

Comprehensive information about digital policies, laws, and regulations.

### Schema

```typescript
interface Policy {
  id: number | string
  title: string
  slug: string  // URL-friendly identifier
  summary: string  // ≤300 characters
  body?: string  // Full markdown content (optional)
  
  jurisdiction: {
    region: JurisdictionRegion
    country: string
    subnational: string | null  // State/Province/Territory
  }
  
  citations: Citation[]
  
  status: PolicyStatus
  effective_date: string | null  // ISO 8601 date
  sunset_date: string | null  // When policy expires (if applicable)
  
  authority: string  // Regulatory body/ministry
  authority_url: string | null
  
  topics: PolicyTopic[]
  tags: string[]
  
  related_policies: number[]  // IDs of related policies
  
  last_updated: string  // ISO 8601 datetime
  created_at: string  // ISO 8601 datetime
  
  metadata: {
    source_url: string
    official_text_url: string | null
    analysis_url: string | null
  }
}
```

### Enums

```typescript
enum JurisdictionRegion {
  Global = 'Global',
  EU = 'EU',
  UK = 'UK',
  USFederal = 'US-Federal',
  USStates = 'US-States',
  APAC = 'APAC',
  LATAM = 'LATAM',
  Africa = 'Africa',
  MiddleEast = 'Middle East'
}

enum PolicyStatus {
  Draft = 'draft',          // Proposed/under review
  Adopted = 'adopted',      // Passed but not yet in force
  InForce = 'in_force',     // Currently active
  Repealed = 'repealed',    // No longer active
  Amended = 'amended'       // Modified by newer legislation
}

enum PolicyTopic {
  Privacy = 'privacy',
  AIGovernance = 'ai_governance',
  DigitalID = 'digital_id',
  FinTech = 'fintech',
  Cybersecurity = 'cybersecurity',
  DataGovernance = 'data_governance',
  ConsumerRights = 'consumer_rights'
}
```

### Supporting Types

```typescript
interface Citation {
  title: string
  url: string
  date: string  // ISO 8601 date
  type: 'legislation' | 'guidance' | 'case_law' | 'standard'
}
```

### Example

```json
{
  "id": 1,
  "title": "EU AI Act",
  "slug": "eu-ai-act",
  "summary": "Comprehensive regulation establishing harmonized rules for artificial intelligence systems across the European Union.",
  "jurisdiction": {
    "region": "EU",
    "country": "European Union",
    "subnational": null
  },
  "citations": [
    {
      "title": "Regulation (EU) 2024/1689",
      "url": "https://eur-lex.europa.eu/...",
      "date": "2024-06-13",
      "type": "legislation"
    }
  ],
  "status": "in_force",
  "effective_date": "2024-08-01",
  "sunset_date": null,
  "authority": "European Commission",
  "authority_url": "https://commission.europa.eu",
  "topics": ["ai_governance", "privacy"],
  "tags": ["AI", "Machine Learning", "Risk Assessment"],
  "related_policies": [8, 12],
  "last_updated": "2024-10-15T10:30:00Z",
  "created_at": "2024-03-01T09:00:00Z",
  "metadata": {
    "source_url": "https://eur-lex.europa.eu/...",
    "official_text_url": "https://...",
    "analysis_url": "/analysis/eu-ai-act-explained"
  }
}
```

---

## Article

Long-form analysis and commentary on policy developments.

### Schema

```typescript
interface Article {
  id: number | string
  title: string
  slug: string
  summary: string  // ≤300 characters
  content: string  // MDX content
  
  author: Author
  co_authors: Author[]
  
  date: string  // ISO 8601 date (publication)
  updated_date: string | null  // ISO 8601 date
  
  reading_time: number  // Minutes
  word_count: number
  
  category: ArticleCategory
  tags: string[]
  
  series: string | null  // e.g., "State Privacy Laws 2024"
  series_order: number | null
  
  related_policies: number[]
  related_articles: number[]
  
  featured: boolean
  published: boolean
  
  metadata: {
    og_image: string
    seo_keywords: string[]
  }
}

enum ArticleCategory {
  Analysis = 'analysis',
  Explainer = 'explainer',
  Opinion = 'opinion',
  News = 'news',
  Tutorial = 'tutorial'
}

interface Author {
  name: string
  bio: string
  url: string | null
  avatar: string | null
}
```

### Example (Frontmatter)

```yaml
---
title: "The EU AI Act's Risk Pyramid: What It Means for Global Tech"
slug: "eu-ai-act-risk-pyramid"
summary: "An analysis of how the EU's risk-based approach to AI regulation will reshape product development worldwide."
author:
  name: "Sarah Chen"
  bio: "Policy analyst specializing in AI governance"
  url: "/authors/sarah-chen"
date: "2024-10-25"
updated_date: null
reading_time: 8
category: "analysis"
tags: ["AI Governance", "EU", "Risk Management"]
series: null
related_policies: [1, 8]
featured: true
published: true
---

Article content in MDX format...
```

---

## Thought (Micro-post)

Short-form content (280-500 characters) for quick updates and observations.

### Schema

```typescript
interface Thought {
  id: number | string
  content: string  // 280-500 chars, supports markdown links
  
  date: string  // ISO 8601 datetime
  
  hashtags: string[]
  mentions: string[]  // @handles (future)
  
  links: Link[]  // Extracted links with preview data
  
  image: string | null  // Optional image attachment
  
  related_policy: number | null
  related_article: number | null
  
  metadata: {
    platform: 'internal' | 'mastodon' | 'bluesky'  // Future syndication
    external_url: string | null
  }
}

interface Link {
  url: string
  title: string
  description: string
  image: string | null
}
```

### Example

```json
{
  "id": 1,
  "content": "The Texas Data Privacy Act takes effect in 8 months. Still hearing from businesses that think they're exempt because they're 'too small.' Spoiler: if you process data on 100K+ Texans OR get 50%+ revenue from selling data, you're in scope. #TexasPrivacy #DataProtection",
  "date": "2024-10-29T14:30:00Z",
  "hashtags": ["TexasPrivacy", "DataProtection"],
  "mentions": [],
  "links": [],
  "image": null,
  "related_policy": 6,
  "related_article": null,
  "metadata": {
    "platform": "internal",
    "external_url": null
  }
}
```

---

## Video

Video content with transcripts and metadata.

### Schema

```typescript
interface Video {
  id: number | string
  title: string
  slug: string
  description: string
  
  url: string  // YouTube/Vimeo embed URL
  thumbnail: string
  duration: string  // "MM:SS" or "HH:MM:SS"
  
  date: string  // ISO 8601 date (publication)
  
  tags: string[]
  category: VideoCategory
  
  transcript: string | null  // Markdown format
  has_transcript: boolean
  
  related_policies: number[]
  related_articles: number[]
}

enum VideoCategory {
  Explainer = 'explainer',
  Interview = 'interview',
  Hearing = 'hearing',
  Tutorial = 'tutorial',
  News = 'news'
}
```

---

## Event

Conferences, hearings, standards meetings, and other relevant events.

### Schema

```typescript
interface Event {
  id: number | string
  title: string
  slug: string
  description: string
  
  date: string  // ISO 8601 date
  end_date: string | null  // For multi-day events
  time: string | null  // "HH:MM" in local time
  timezone: string  // IANA timezone
  
  location: string  // "City, Country" or "Virtual"
  venue: string | null
  
  type: EventType
  
  organizer: string
  organizer_url: string | null
  
  registration_url: string | null
  registration_deadline: string | null
  
  tags: string[]
  related_policies: number[]
  
  ics_url: string | null  // Generated .ics file
}

enum EventType {
  Conference = 'conference',
  Hearing = 'hearing',
  Workshop = 'workshop',
  StandardsMeeting = 'standards_meeting',
  RegulatoryMeeting = 'regulatory_meeting',
  Webinar = 'webinar'
}
```

---

## Glossary Term

Definitions of key terms in digital policy, privacy, and identity.

### Schema

```typescript
interface GlossaryTerm {
  id: number | string
  term: string
  slug: string
  definition: string  // Markdown format
  
  category: GlossaryCategory
  
  related_terms: string[]  // Slugs of related terms
  see_also: string[]  // External links
  
  canonical_source: string | null  // URL to authoritative definition
  
  usage_example: string | null
}

enum GlossaryCategory {
  Privacy = 'privacy',
  AI = 'ai',
  DigitalID = 'digital_id',
  Cryptography = 'cryptography',
  Legal = 'legal',
  Technical = 'technical'
}
```

---

## Feed Collection

Curated collections of external content organized by theme.

### Schema

```typescript
interface FeedCollection {
  id: string
  title: string
  slug: string
  description: string
  
  sources: FeedSource[]
  
  items: FeedItem[]
  
  last_reviewed: string  // ISO 8601 date
  review_frequency: 'daily' | 'weekly' | 'monthly'
  
  tags: string[]
}

interface FeedSource {
  name: string
  url: string
  type: 'rss' | 'api' | 'manual'
}

interface FeedItem {
  id: string
  title: string
  summary: string
  url: string
  source: string
  date: string  // ISO 8601 date
  tags: string[]
}
```

---

## Data Adapters

The system supports multiple data sources:

1. **MDX Files** - Articles, Glossary entries
2. **JSON Seed Files** - Policies, Thoughts, Videos, Events
3. **World Papers API** - Real-time policy updates (optional)
4. **RSS Feeds** - External content aggregation

### Adapter Interface

```typescript
interface DataAdapter<T> {
  list(filters?: Filter): Promise<T[]>
  getById(id: string | number): Promise<T | null>
  search(query: string): Promise<T[]>
}

// Example usage
import { policyAdapter } from '@/lib/adapters/policies'

const policies = await policyAdapter.list({
  region: 'EU',
  status: 'in_force',
  topics: ['ai_governance']
})
```

---

## Search Index Schema

Client-side search using Lunr.js:

```typescript
interface SearchDocument {
  id: string
  type: 'policy' | 'article' | 'glossary' | 'video' | 'event'
  title: string
  content: string  // Concatenated searchable text
  tags: string[]
  date: string
  metadata: Record<string, any>
}
```

---

## File Organization

```
data/
├── seed/
│   ├── policies.json          # Policy data
│   ├── thoughts.json          # Micro-posts
│   ├── videos.json            # Video metadata
│   └── events.json            # Event data
├── collections/
│   ├── eu-ai-week.json        # Curated collection
│   └── us-state-privacy.json  # Curated collection
└── search/
    └── index.json             # Generated search index

content/
├── articles/
│   ├── 2024-10-25-eu-ai-act-risk-pyramid.mdx
│   └── 2024-10-22-us-state-privacy-landscape.mdx
└── glossary/
    ├── adequacy-decision.mdx
    └── consent.mdx
```

---

*Last Updated: 2024-10-30*
