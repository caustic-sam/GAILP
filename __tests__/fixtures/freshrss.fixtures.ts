// Test fixtures for FreshRSS integration tests
import type { FreshRSSItem } from '@/lib/freshrss';

export const mockAuthResponse = {
  success: 'SID=mock-sid\nAuth=mock-auth-token-12345',
  error: 'Error=BadAuthentication',
};

export const mockFreshRSSItems: FreshRSSItem[] = [
  {
    id: 'tag:google.com,2005:reader/item/0001',
    title: 'EU AI Act Implementation Guidelines Released',
    summary: {
      content: 'European Commission publishes detailed guidance for organizations implementing the AI Act.',
    },
    canonical: [{ href: 'https://example.com/eu-ai-act-guidelines' }],
    author: 'EU Commission',
    published: 1704067200, // 2024-01-01 00:00:00
    categories: ['policy', 'regulation'],
    origin: {
      streamId: 'feed/1',
      title: 'EU Digital Policy',
      htmlUrl: 'https://example.com/eu-digital-policy',
    },
  },
  {
    id: 'tag:google.com,2005:reader/item/0002',
    title: 'New Research on AI Governance Frameworks',
    summary: {
      content: 'Stanford HAI releases comprehensive study on global AI governance approaches.',
    },
    canonical: [{ href: 'https://example.com/ai-governance-research' }],
    author: 'Stanford HAI',
    published: 1704153600, // 2024-01-02 00:00:00
    categories: ['research', 'academic'],
    origin: {
      streamId: 'feed/2',
      title: 'AI Research News',
      htmlUrl: 'https://example.com/ai-research',
    },
  },
  {
    id: 'tag:google.com,2005:reader/item/0003',
    title: 'NIST Cybersecurity Framework 2.0 Update',
    summary: {
      content: 'Major revision includes AI security considerations and supply chain risk management.',
    },
    canonical: [{ href: 'https://example.com/nist-csf-2.0' }],
    author: 'NIST',
    published: 1704240000, // 2024-01-03 00:00:00
    categories: ['policy', 'cybersecurity'],
    origin: {
      streamId: 'feed/3',
      title: 'NIST Publications',
      htmlUrl: 'https://example.com/nist-pubs',
    },
  },
  {
    id: 'tag:google.com,2005:reader/item/0004',
    title: 'Analysis: The Future of Digital Identity',
    summary: {
      content: 'Expert commentary on evolving identity standards and decentralized identity systems.',
    },
    canonical: [{ href: 'https://example.com/digital-identity-analysis' }],
    author: 'Digital Policy Analyst',
    published: 1704326400, // 2024-01-04 00:00:00
    categories: ['analysis', 'opinion'],
    origin: {
      streamId: 'feed/4',
      title: 'Policy Analysis Blog',
      htmlUrl: 'https://example.com/policy-analysis',
    },
  },
  {
    id: 'tag:google.com,2005:reader/item/0005',
    title: 'Breaking: UK Announces New Data Protection Rules',
    summary: {
      content: 'Post-Brexit data governance framework unveiled with new provisions for international transfers.',
    },
    canonical: [{ href: 'https://example.com/uk-data-protection' }],
    author: 'ICO',
    published: 1704412800, // 2024-01-05 00:00:00
    categories: ['news', 'data-protection'],
    origin: {
      streamId: 'feed/5',
      title: 'UK Government News',
      htmlUrl: 'https://example.com/uk-gov-news',
    },
  },
];

export const mockStreamContentsResponse = {
  items: mockFreshRSSItems,
  continuation: 'continuation-token-12345',
  updated: 1704412800,
};

export const mockUnreadCountResponse = {
  max: 1000,
  unreadcounts: [
    {
      id: 'user/-/state/com.google/reading-list',
      count: 42,
      newestItemTimestampUsec: '1704412800000000',
    },
    {
      id: 'feed/1',
      count: 10,
      newestItemTimestampUsec: '1704412800000000',
    },
  ],
};

export const mockSubscriptionsResponse = {
  subscriptions: [
    {
      id: 'feed/1',
      title: 'EU Digital Policy',
      url: 'https://example.com/eu-digital-policy/feed',
      htmlUrl: 'https://example.com/eu-digital-policy',
      categories: [
        {
          id: 'user/-/label/policy',
          label: 'policy',
        },
      ],
    },
    {
      id: 'feed/2',
      title: 'AI Research News',
      url: 'https://example.com/ai-research/feed',
      htmlUrl: 'https://example.com/ai-research',
      categories: [
        {
          id: 'user/-/label/research',
          label: 'research',
        },
      ],
    },
    {
      id: 'feed/3',
      title: 'NIST Publications',
      url: 'https://example.com/nist-pubs/feed',
      htmlUrl: 'https://example.com/nist-pubs',
      categories: [
        {
          id: 'user/-/label/policy',
          label: 'policy',
        },
      ],
    },
  ],
};

export const mockRSSFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>World Papers RSS Feed</title>
    <link>http://192.168.1.133:8082</link>
    <description>Your FreshRSS feed</description>
    <item>
      <title>EU AI Act Implementation Guidelines Released</title>
      <link>https://example.com/eu-ai-act-guidelines</link>
      <description>European Commission publishes detailed guidance for organizations implementing the AI Act.</description>
      <author>EU Commission</author>
      <pubDate>Mon, 01 Jan 2024 00:00:00 GMT</pubDate>
      <category>policy</category>
      <guid>tag:google.com,2005:reader/item/0001</guid>
    </item>
    <item>
      <title>New Research on AI Governance Frameworks</title>
      <link>https://example.com/ai-governance-research</link>
      <description>Stanford HAI releases comprehensive study on global AI governance approaches.</description>
      <author>Stanford HAI</author>
      <pubDate>Tue, 02 Jan 2024 00:00:00 GMT</pubDate>
      <category>research</category>
      <guid>tag:google.com,2005:reader/item/0002</guid>
    </item>
  </channel>
</rss>`;

export const mockEditTagSuccessResponse = 'OK';
export const mockEditTagErrorResponse = 'Error=InvalidItemId';
