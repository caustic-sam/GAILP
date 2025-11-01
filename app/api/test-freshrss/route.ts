import { NextResponse } from 'next/server';
import { getFreshRSSClient } from '@/lib/freshrss';

export const dynamic = 'force-dynamic';

/**
 * Test endpoint to diagnose FreshRSS connection
 * Access at: http://localhost:3000/api/test-freshrss
 */
export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    config: {
      apiUrl: process.env.FRESHRSS_API_URL || 'NOT_SET',
      username: process.env.FRESHRSS_API_USERNAME || 'NOT_SET',
      passwordSet: !!process.env.FRESHRSS_API_PASSWORD,
      rssUrl: process.env.FRESHRSS_RSS_URL || 'NOT_SET',
    },
    tests: {},
  };

  // Test 1: Check if client can be created
  console.log('🧪 Test 1: Creating FreshRSS client...');
  const client = getFreshRSSClient();

  if (!client) {
    results.tests.clientCreation = {
      status: 'FAILED',
      error: 'Environment variables not configured',
    };
    return NextResponse.json(results, { status: 500 });
  }

  results.tests.clientCreation = { status: 'PASSED' };

  // Test 2: Test authentication
  console.log('🧪 Test 2: Testing authentication...');
  try {
    const authSuccess = await client.authenticate();
    results.tests.authentication = {
      status: authSuccess ? 'PASSED' : 'FAILED',
      authenticated: authSuccess,
    };

    if (!authSuccess) {
      return NextResponse.json(results, { status: 401 });
    }
  } catch (error) {
    results.tests.authentication = {
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    return NextResponse.json(results, { status: 500 });
  }

  // Test 3: Fetch items
  console.log('🧪 Test 3: Fetching items...');
  try {
    const items = await client.getItems({ count: 5, excludeRead: false });
    results.tests.fetchItems = {
      status: 'PASSED',
      itemCount: items.length,
      sampleItems: items.slice(0, 2).map(item => ({
        id: item.id,
        title: item.title,
        feedName: item.origin?.title || 'Unknown',
        published: item.published,
      })),
    };
  } catch (error) {
    results.tests.fetchItems = {
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Test 4: Get unread count
  console.log('🧪 Test 4: Getting unread count...');
  try {
    const unreadCount = await client.getUnreadCount();
    results.tests.unreadCount = {
      status: 'PASSED',
      count: unreadCount,
    };
  } catch (error) {
    results.tests.unreadCount = {
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Test 5: Get subscriptions
  console.log('🧪 Test 5: Getting subscriptions...');
  try {
    const subscriptions = await client.getSubscriptions();
    results.tests.subscriptions = {
      status: 'PASSED',
      count: subscriptions.length,
      feeds: subscriptions.slice(0, 5).map(sub => ({
        title: sub.title,
        url: sub.url,
        categories: sub.categories.map(c => c.label),
      })),
    };
  } catch (error) {
    results.tests.subscriptions = {
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Test 6: Test RSS fallback
  console.log('🧪 Test 6: Testing RSS fallback...');
  try {
    const Parser = require('rss-parser');
    const parser = new Parser();
    const rssUrl = process.env.FRESHRSS_RSS_URL || results.config.apiUrl.replace('/api/greader.php', '/i/?a=rss');

    const feed = await parser.parseURL(rssUrl);
    results.tests.rssFallback = {
      status: 'PASSED',
      feedTitle: feed.title,
      itemCount: feed.items?.length || 0,
      sampleItems: feed.items?.slice(0, 2).map((item: any) => ({
        title: item.title,
        pubDate: item.pubDate,
      })),
    };
  } catch (error) {
    results.tests.rssFallback = {
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Summary
  const allPassed = Object.values(results.tests).every(
    (test: any) => test.status === 'PASSED'
  );

  results.summary = {
    overall: allPassed ? '✅ ALL TESTS PASSED' : '⚠️ SOME TESTS FAILED',
    passedCount: Object.values(results.tests).filter(
      (test: any) => test.status === 'PASSED'
    ).length,
    totalTests: Object.keys(results.tests).length,
  };

  console.log('🎯 Test Summary:', results.summary);

  return NextResponse.json(results, {
    status: allPassed ? 200 : 207, // 207 = Multi-Status
  });
}
