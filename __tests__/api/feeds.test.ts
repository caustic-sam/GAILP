/**
 * Integration tests for /api/feeds endpoint
 * Tests the 3-tier fallback system (Google Reader API → RSS → Mock Data)
 */

import { GET } from '@/app/api/feeds/route';
import { getFreshRSSClient } from '@/lib/freshrss';
import Parser from 'rss-parser';
import {
  mockStreamContentsResponse,
  mockUnreadCountResponse,
  mockRSSFeed,
  mockAuthResponse,
} from '../fixtures/freshrss.fixtures';

// Mock dependencies
jest.mock('@/lib/freshrss');
jest.mock('rss-parser');

// Mock fetch globally
global.fetch = jest.fn();

describe('GET /api/feeds', () => {
  let originalRSSUrl: string | undefined;

  const mockRequest = (params: Record<string, string> = {}) => {
    const url = new URL('http://localhost:3000/api/feeds');
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return new Request(url.toString());
  };

  beforeAll(() => {
    originalRSSUrl = process.env.FRESHRSS_RSS_URL;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    if (!process.env.FRESHRSS_RSS_URL) {
      process.env.FRESHRSS_RSS_URL = 'http://test.freshrss.local/feed';
    }
  });

  afterEach(() => {
    if (typeof originalRSSUrl === 'undefined') {
      delete process.env.FRESHRSS_RSS_URL;
    } else {
      process.env.FRESHRSS_RSS_URL = originalRSSUrl;
    }
  });

  describe('Tier 1: Google Reader API', () => {
    it('should fetch feeds from FreshRSS Google Reader API successfully', async () => {
      const mockClient = {
        authenticate: jest.fn().mockResolvedValue(true),
        getItems: jest.fn().mockResolvedValue(mockStreamContentsResponse.items),
        getUnreadCount: jest.fn().mockResolvedValue(42),
      };

      (getFreshRSSClient as jest.Mock).mockReturnValue(mockClient);

      const response = await GET(mockRequest({ count: '5' }));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.source).toBe('freshrss');
      expect(data.data).toHaveLength(5);
      expect(data.unreadCount).toBe(42);
      expect(data.data[0]).toHaveProperty('title');
      expect(data.data[0]).toHaveProperty('category');
      expect(mockClient.getItems).toHaveBeenCalledWith({
        count: 10, // count * 2 for filtering
        excludeRead: false,
      });
    });

    it('should filter by category', async () => {
      const mockClient = {
        authenticate: jest.fn().mockResolvedValue(true),
        getItems: jest.fn().mockResolvedValue(mockStreamContentsResponse.items),
        getUnreadCount: jest.fn().mockResolvedValue(42),
      };

      (getFreshRSSClient as jest.Mock).mockReturnValue(mockClient);

      const response = await GET(mockRequest({ count: '5', category: 'policy' }));
      const data = await response.json();

      expect(data.data.every((item: any) => item.category === 'policy')).toBe(true);
    });

    it('should categorize items correctly', async () => {
      const mockClient = {
        authenticate: jest.fn().mockResolvedValue(true),
        getItems: jest.fn().mockResolvedValue(mockStreamContentsResponse.items),
        getUnreadCount: jest.fn().mockResolvedValue(42),
      };

      (getFreshRSSClient as jest.Mock).mockReturnValue(mockClient);

      const response = await GET(mockRequest({ count: '10' }));
      const data = await response.json();

      // Check that items have valid categories
      const validCategories = ['policy', 'research', 'news', 'analysis'];
      data.data.forEach((item: any) => {
        expect(validCategories).toContain(item.category);
      });
    });

    it('should respect count parameter', async () => {
      const mockClient = {
        authenticate: jest.fn().mockResolvedValue(true),
        getItems: jest.fn().mockResolvedValue(mockStreamContentsResponse.items),
        getUnreadCount: jest.fn().mockResolvedValue(42),
      };

      (getFreshRSSClient as jest.Mock).mockReturnValue(mockClient);

      const response = await GET(mockRequest({ count: '3' }));
      const data = await response.json();

      expect(data.data).toHaveLength(3);
    });

    it('should use default count of 20 if not specified', async () => {
      const mockClient = {
        authenticate: jest.fn().mockResolvedValue(true),
        getItems: jest.fn().mockResolvedValue(
          Array(20).fill(mockStreamContentsResponse.items[0])
        ),
        getUnreadCount: jest.fn().mockResolvedValue(42),
      };

      (getFreshRSSClient as jest.Mock).mockReturnValue(mockClient);

      const response = await GET(mockRequest());
      const data = await response.json();

      expect(mockClient.getItems).toHaveBeenCalledWith({
        count: 40, // 20 * 2
        excludeRead: false,
      });
    });
  });

  describe('Tier 2: RSS Fallback', () => {
    it('should fall back to RSS feed when Google Reader API fails', async () => {
      // Mock Google Reader API failure
      const mockClient = {
        authenticate: jest.fn().mockResolvedValue(true),
        getItems: jest.fn().mockRejectedValue(new Error('API Error')),
        getUnreadCount: jest.fn().mockRejectedValue(new Error('API Error')),
      };

      (getFreshRSSClient as jest.Mock).mockReturnValue(mockClient);

      // Mock RSS parser success
      const mockParser = {
        parseURL: jest.fn().mockResolvedValue({
          title: 'World Papers RSS Feed',
          items: [
            {
              guid: 'item-1',
              title: 'Test Article',
              link: 'https://example.com/article',
              contentSnippet: 'Article description',
              creator: 'Author Name',
              pubDate: new Date().toISOString(),
              categories: ['policy'],
            },
          ],
        }),
      };

      (Parser as jest.Mock).mockImplementation(() => mockParser);

      const response = await GET(mockRequest({ count: '5' }));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.source).toBe('freshrss-rss');
      expect(data.data).toHaveLength(1);
      expect(mockParser.parseURL).toHaveBeenCalled();
    });

    it('should use FRESHRSS_RSS_URL environment variable', async () => {
      const mockClient = {
        authenticate: jest.fn().mockResolvedValue(true),
        getItems: jest.fn().mockRejectedValue(new Error('API Error')),
      };

      (getFreshRSSClient as jest.Mock).mockReturnValue(mockClient);

      const mockParser = {
        parseURL: jest.fn().mockResolvedValue({
          title: 'Feed',
          items: [],
        }),
      };

      (Parser as jest.Mock).mockImplementation(() => mockParser);

      // Set env var
      const originalEnv = process.env.FRESHRSS_RSS_URL;
      process.env.FRESHRSS_RSS_URL = 'http://custom.rss.url/feed';

      await GET(mockRequest({ count: '5' }));

      expect(mockParser.parseURL).toHaveBeenCalledWith('http://custom.rss.url/feed');

      // Restore
      if (originalEnv) {
        process.env.FRESHRSS_RSS_URL = originalEnv;
      } else {
        delete process.env.FRESHRSS_RSS_URL;
      }
    });

    it('should categorize RSS items correctly', async () => {
      const mockClient = {
        authenticate: jest.fn().mockResolvedValue(true),
        getItems: jest.fn().mockRejectedValue(new Error('API Error')),
      };

      (getFreshRSSClient as jest.Mock).mockReturnValue(mockClient);

      const mockParser = {
        parseURL: jest.fn().mockResolvedValue({
          title: 'Feed',
          items: [
            {
              guid: '1',
              title: 'Research Study on AI',
              link: 'https://example.com/1',
              categories: ['research'],
            },
            {
              guid: '2',
              title: 'Policy Update',
              link: 'https://example.com/2',
              categories: ['policy'],
            },
          ],
        }),
      };

      (Parser as jest.Mock).mockImplementation(() => mockParser);

      const response = await GET(mockRequest());
      const data = await response.json();

      expect(data.data[0].category).toBe('research');
      expect(data.data[1].category).toBe('policy');
    });

    it('should fall back to mock data when RSS URL is not configured', async () => {
      const mockClient = {
        authenticate: jest.fn().mockResolvedValue(true),
        getItems: jest.fn().mockRejectedValue(new Error('API Error')),
      };

      (getFreshRSSClient as jest.Mock).mockReturnValue(mockClient);

      const mockParser = {
        parseURL: jest.fn(),
      };

      (Parser as jest.Mock).mockImplementation(() => mockParser);

      delete process.env.FRESHRSS_RSS_URL;

      const response = await GET(mockRequest({ count: '5' }));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.source).toBe('mock');
      expect(mockParser.parseURL).not.toHaveBeenCalled();
    });
  });

  describe('Tier 3: Mock Data Fallback', () => {
    it('should fall back to mock data when both API and RSS fail', async () => {
      // Mock Google Reader API failure
      const mockClient = {
        authenticate: jest.fn().mockResolvedValue(true),
        getItems: jest.fn().mockRejectedValue(new Error('API Error')),
      };

      (getFreshRSSClient as jest.Mock).mockReturnValue(mockClient);

      // Mock RSS parser failure
      const mockParser = {
        parseURL: jest.fn().mockRejectedValue(new Error('RSS Error')),
      };

      (Parser as jest.Mock).mockImplementation(() => mockParser);

      const response = await GET(mockRequest({ count: '5' }));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.source).toBe('mock');
      expect(data.data).toHaveLength(5);
      expect(data.error).toBeDefined();
    });

    it('should use mock data when FreshRSS is not configured', async () => {
      (getFreshRSSClient as jest.Mock).mockReturnValue(null);

      const response = await GET(mockRequest({ count: '3' }));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.source).toBe('mock');
      expect(data.data).toHaveLength(3);
    });

    it('should filter mock data by category', async () => {
      (getFreshRSSClient as jest.Mock).mockReturnValue(null);

      const response = await GET(mockRequest({ category: 'policy' }));
      const data = await response.json();

      expect(data.source).toBe('mock');
      expect(data.data.every((item: any) => item.category === 'policy')).toBe(true);
    });

    it('should respect count parameter with mock data', async () => {
      (getFreshRSSClient as jest.Mock).mockReturnValue(null);

      const response = await GET(mockRequest({ count: '2' }));
      const data = await response.json();

      expect(data.data).toHaveLength(2);
    });
  });

  describe('Response Format', () => {
    it('should return correctly formatted feed items', async () => {
      (getFreshRSSClient as jest.Mock).mockReturnValue(null);

      const response = await GET(mockRequest({ count: '1' }));
      const data = await response.json();

      const item = data.data[0];
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('title');
      expect(item).toHaveProperty('link');
      expect(item).toHaveProperty('description');
      expect(item).toHaveProperty('author');
      expect(item).toHaveProperty('publishedAt');
      expect(item).toHaveProperty('feedName');
      expect(item).toHaveProperty('feedUrl');
      expect(item).toHaveProperty('category');
    });

    it('should include source and count in response', async () => {
      (getFreshRSSClient as jest.Mock).mockReturnValue(null);

      const response = await GET(mockRequest({ count: '3' }));
      const data = await response.json();

      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('source');
      expect(data).toHaveProperty('count');
      expect(data.count).toBe(3);
    });

    it('should have correct Content-Type header', async () => {
      (getFreshRSSClient as jest.Mock).mockReturnValue(null);

      const response = await GET(mockRequest());

      expect(response.headers.get('content-type')).toContain('application/json');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid count parameter gracefully', async () => {
      (getFreshRSSClient as jest.Mock).mockReturnValue(null);

      const response = await GET(mockRequest({ count: 'invalid' }));
      const data = await response.json();

      // Should default to 20 or use NaN handling
      expect(response.status).toBe(200);
      expect(data.data).toBeDefined();
    });

    it('should handle invalid category parameter', async () => {
      (getFreshRSSClient as jest.Mock).mockReturnValue(null);

      const response = await GET(mockRequest({ category: 'invalid-category' }));
      const data = await response.json();

      // Should return empty array or all items
      expect(response.status).toBe(200);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should complete request within reasonable time', async () => {
      (getFreshRSSClient as jest.Mock).mockReturnValue(null);

      const startTime = Date.now();
      await GET(mockRequest());
      const endTime = Date.now();

      // Mock data should be instant (< 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});
