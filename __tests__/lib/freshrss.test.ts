/**
 * Unit tests for FreshRSS Client Library
 * Tests authentication, item fetching, subscriptions, and error handling
 */

import { FreshRSSClient } from '@/lib/freshrss';
import {
  mockAuthResponse,
  mockStreamContentsResponse,
  mockUnreadCountResponse,
  mockSubscriptionsResponse,
  mockEditTagSuccessResponse,
  mockFreshRSSItems,
} from '../fixtures/freshrss.fixtures';

// Mock fetch globally
global.fetch = jest.fn();

describe('FreshRSSClient', () => {
  let client: FreshRSSClient;
  const mockConfig = {
    apiUrl: 'http://test.freshrss.local/api/greader.php',
    username: 'testuser',
    password: 'testpass',
  };

  beforeEach(() => {
    client = new FreshRSSClient(mockConfig);
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should successfully authenticate with valid credentials', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => mockAuthResponse.success,
      });

      const result = await client.authenticate();

      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockConfig.apiUrl}/accounts/ClientLogin`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
      );
    });

    it('should fail authentication with invalid credentials', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
        text: async () => mockAuthResponse.error,
      });

      const result = await client.authenticate();

      expect(result).toBe(false);
    });

    it('should handle network errors during authentication', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await client.authenticate();

      expect(result).toBe(false);
    });

    it('should handle malformed authentication response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => 'Invalid response format',
      });

      const result = await client.authenticate();

      expect(result).toBe(false);
    });
  });

  describe('getItems', () => {
    beforeEach(async () => {
      // Mock successful authentication
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => mockAuthResponse.success,
      });
      await client.authenticate();
      jest.clearAllMocks();
    });

    it('should fetch items successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStreamContentsResponse,
      });

      const items = await client.getItems({ count: 5 });

      expect(items).toHaveLength(5);
      expect(items[0]).toHaveProperty('id');
      expect(items[0]).toHaveProperty('title');
      expect(items[0]).toHaveProperty('origin');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/stream/contents/reading-list'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'GoogleLogin auth=mock-auth-token-12345',
          }),
        })
      );
    });

    it('should exclude read items when requested', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStreamContentsResponse,
      });

      await client.getItems({ count: 10, excludeRead: true });

      const callUrl = (global.fetch as jest.Mock).mock.calls[0][0];
      const url = new URL(callUrl);

      expect(url.searchParams.get('xt')).toBe('user/-/state/com.google/read');
    });

    it('should filter by newerThan timestamp', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStreamContentsResponse,
      });

      const timestamp = 1704067200;
      await client.getItems({ count: 10, newerThan: timestamp });

      const callUrl = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(callUrl).toContain(`ot=${timestamp}`);
    });

    it('should return empty array on API error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      const items = await client.getItems({ count: 10 });

      expect(items).toEqual([]);
    });

    it('should handle network errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network timeout'));

      const items = await client.getItems({ count: 10 });

      expect(items).toEqual([]);
    });

    it('should re-authenticate if auth token is missing', async () => {
      // Create new client without auth
      const newClient = new FreshRSSClient(mockConfig);

      // Mock auth response
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          text: async () => mockAuthResponse.success,
        })
        // Mock items response
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStreamContentsResponse,
        });

      const items = await newClient.getItems({ count: 5 });

      expect(global.fetch).toHaveBeenCalledTimes(2); // Auth + getItems
      expect(items).toHaveLength(5);
    });
  });

  describe('getUnreadCount', () => {
    beforeEach(async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => mockAuthResponse.success,
      });
      await client.authenticate();
      jest.clearAllMocks();
    });

    it('should fetch unread count successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUnreadCountResponse,
      });

      const count = await client.getUnreadCount();

      expect(count).toBe(42);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/unread-count'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'GoogleLogin auth=mock-auth-token-12345',
          }),
        })
      );
    });

    it('should return 0 if no unread items', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ unreadcounts: [] }),
      });

      const count = await client.getUnreadCount();

      expect(count).toBe(0);
    });

    it('should handle errors and return 0', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      const count = await client.getUnreadCount();

      expect(count).toBe(0);
    });
  });

  describe('getSubscriptions', () => {
    beforeEach(async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => mockAuthResponse.success,
      });
      await client.authenticate();
      jest.clearAllMocks();
    });

    it('should fetch subscriptions successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSubscriptionsResponse,
      });

      const subscriptions = await client.getSubscriptions();

      expect(subscriptions).toHaveLength(3);
      expect(subscriptions[0]).toHaveProperty('id');
      expect(subscriptions[0]).toHaveProperty('title');
      expect(subscriptions[0]).toHaveProperty('categories');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/subscription/list'),
        expect.any(Object)
      );
    });

    it('should return empty array on error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const subscriptions = await client.getSubscriptions();

      expect(subscriptions).toEqual([]);
    });
  });

  describe('markAsRead', () => {
    beforeEach(async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => mockAuthResponse.success,
      });
      await client.authenticate();
      jest.clearAllMocks();
    });

    it('should mark item as read successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => mockEditTagSuccessResponse,
      });

      const result = await client.markAsRead('item-123');

      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/edit-tag'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should return false on error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      });

      const result = await client.markAsRead('invalid-item');

      expect(result).toBe(false);
    });
  });

  describe('toggleStar', () => {
    beforeEach(async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => mockAuthResponse.success,
      });
      await client.authenticate();
      jest.clearAllMocks();
    });

    it('should star item successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => mockEditTagSuccessResponse,
      });

      const result = await client.toggleStar('item-123', true);

      expect(result).toBe(true);
    });

    it('should unstar item successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => mockEditTagSuccessResponse,
      });

      const result = await client.toggleStar('item-123', false);

      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      const result = await client.toggleStar('item-123', true);

      expect(result).toBe(false);
    });
  });

  describe('transformItem', () => {
    it('should transform FreshRSS item to World Papers format', () => {
      const freshRSSItem = mockFreshRSSItems[0];
      const transformed = FreshRSSClient.transformItem(freshRSSItem);

      expect(transformed).toHaveProperty('title', freshRSSItem.title);
      expect(transformed).toHaveProperty('link', freshRSSItem.canonical?.[0]?.href);
      expect(transformed).toHaveProperty('description', freshRSSItem.summary?.content);
      expect(transformed).toHaveProperty('author', freshRSSItem.author);
      expect(transformed).toHaveProperty('feedName', freshRSSItem.origin?.title);
      expect(transformed).toHaveProperty('feedUrl', freshRSSItem.origin?.htmlUrl);
      expect(transformed.publishedAt).toBeInstanceOf(Date);
    });

    it('should handle missing optional fields', () => {
      const minimalItem = {
        id: 'test-123',
        title: 'Test Article',
      };

      const transformed = FreshRSSClient.transformItem(minimalItem as any);

      expect(transformed.title).toBe('Test Article');
      expect(transformed.link).toBe('');
      expect(transformed.description).toBe('');
      expect(transformed.author).toBeUndefined();
      expect(transformed.publishedAt).toBeNull();
      expect(transformed.feedName).toBe('Unknown Feed');
      expect(transformed.feedUrl).toBe('');
    });

    it('should correctly convert Unix timestamp to Date', () => {
      const item = mockFreshRSSItems[0];
      const transformed = FreshRSSClient.transformItem(item);

      expect(transformed.publishedAt).toBeInstanceOf(Date);
      expect(transformed.publishedAt?.getTime()).toBe(item.published! * 1000);
    });
  });
});

describe('getFreshRSSClient', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return null if environment variables are not configured', () => {
    delete process.env.FRESHRSS_API_URL;
    delete process.env.FRESHRSS_API_USERNAME;
    delete process.env.FRESHRSS_API_PASSWORD;

    // Re-import to get fresh instance
    jest.isolateModules(() => {
      const { getFreshRSSClient } = require('@/lib/freshrss');
      const client = getFreshRSSClient();
      expect(client).toBeNull();
    });
  });

  it('should return client instance with valid configuration', () => {
    process.env.FRESHRSS_API_URL = 'http://test.local/api/greader.php';
    process.env.FRESHRSS_API_USERNAME = 'testuser';
    process.env.FRESHRSS_API_PASSWORD = 'testpass';

    jest.isolateModules(() => {
      const { getFreshRSSClient, FreshRSSClient: LocalFreshRSSClient } = require('@/lib/freshrss');
      const client = getFreshRSSClient();
      expect(client).not.toBeNull();
      expect(client).toBeInstanceOf(LocalFreshRSSClient);
    });
  });

  it('should return singleton instance', () => {
    process.env.FRESHRSS_API_URL = 'http://test.local/api/greader.php';
    process.env.FRESHRSS_API_USERNAME = 'testuser';
    process.env.FRESHRSS_API_PASSWORD = 'testpass';

    jest.isolateModules(() => {
      const { getFreshRSSClient } = require('@/lib/freshrss');
      const client1 = getFreshRSSClient();
      const client2 = getFreshRSSClient();
      expect(client1).toBe(client2);
    });
  });
});
