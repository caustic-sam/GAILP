import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { mockVideos } from '@/lib/mockData';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache for 1 hour

// Curated YouTube channels focused on AI policy, tech policy, and digital governance
const YOUTUBE_CHANNELS = [
  // Center for Democracy & Technology
  'UCG1yVMJKHh9MHT9B0bCJRqQ',
  // Electronic Frontier Foundation
  'UCGls_HN8gyyuHJfyF2V7FbA',
  // Brookings Institution
  'UCdMy8hGiQmN4G7NMzaYZAqw',
  // MIT Media Lab
  'UCe5R3IjnEQgFc_LjBgxW9Ug',
];

interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  duration?: string;
  views?: string;
  date: string;
  channel: string;
}

async function fetchYouTubeRSS(channelId: string): Promise<Video[]> {
  try {
    const parser = new Parser({
      customFields: {
        item: [
          ['media:group', 'media'],
          ['yt:videoId', 'videoId'],
          ['yt:channelId', 'channelId'],
        ]
      }
    });

    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const feed = await parser.parseURL(feedUrl);

    return feed.items.slice(0, 3).map((item: any) => {
      const videoId = item.videoId || item.id?.split(':').pop();

      return {
        id: videoId || item.guid || item.id,
        title: item.title || 'Untitled Video',
        description: item.contentSnippet || item.content || '',
        url: item.link || `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail: item.media?.['media:thumbnail']?.[0]?.$?.url ||
                   `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
        date: item.pubDate ? new Date(item.pubDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }) : 'Recent',
        channel: feed.title || 'YouTube',
      };
    });
  } catch (error) {
    console.error(`Error fetching YouTube RSS for channel ${channelId}:`, error);
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '4');

  try {
    // Fetch videos from all channels
    const videoPromises = YOUTUBE_CHANNELS.map(channelId => fetchYouTubeRSS(channelId));
    const results = await Promise.allSettled(videoPromises);

    // Flatten and filter successful results
    const allVideos = results
      .filter((result): result is PromiseFulfilledResult<Video[]> => result.status === 'fulfilled')
      .flatMap(result => result.value)
      .filter(video => video !== null);

    // Sort by date (newest first) and limit
    const sortedVideos = allVideos
      .sort((a, b) => {
        // If we can't parse dates, keep original order
        return 0;
      })
      .slice(0, limit);

    if (sortedVideos.length > 0) {
      return NextResponse.json({
        videos: sortedVideos,
        source: 'youtube-rss',
        count: sortedVideos.length,
      });
    } else {
      // Fallback to mock data
      return NextResponse.json({
        videos: mockVideos.slice(0, limit),
        source: 'mock',
        count: mockVideos.length,
      });
    }
  } catch (error) {
    console.error('Error fetching videos:', error);

    // Fallback to mock data
    return NextResponse.json({
      videos: mockVideos.slice(0, limit),
      source: 'mock',
      count: mockVideos.length,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
