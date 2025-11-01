'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, RefreshCw, TrendingUp } from 'lucide-react';

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

function formatRelativeTime(date: Date | null): string {
  if (!date) return '';

  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return '1 day ago';
  return `${days}d ago`;
}

export function GlobalFeedStream() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'freshrss' | 'freshrss-rss' | 'mock'>('mock');

  const fetchItems = async () => {
    try {
      // Fetch all categories
      const response = await fetch('/api/feeds?count=20');
      const data = await response.json();

      setItems(data.data || []);
      setSource(data.source);
    } catch (err) {
      console.error('Error fetching global feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();

    // Auto-refresh every 10 minutes
    const interval = setInterval(fetchItems, 600000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    fetchItems();
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'policy':
        return 'bg-blue-100 text-blue-700';
      case 'research':
        return 'bg-green-100 text-green-700';
      case 'analysis':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <section className="py-12 bg-gray-50 border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Global Feed Stream</h2>
              <p className="text-sm text-gray-600">Latest updates from all sources</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                source === 'freshrss' || source === 'freshrss-rss'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {source === 'freshrss' || source === 'freshrss-rss' ? '🟢 Live' : '📝 Demo'}
            </span>

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
              aria-label="Refresh feed"
            >
              <RefreshCw
                className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Feed Items - Horizontal Scroll */}
        <div className="relative">
          <div className="overflow-x-auto pb-4 -mx-2 px-2">
            <div className="flex gap-4" style={{ minWidth: 'min-content' }}>
              {loading && items.length === 0 ? (
                // Loading skeletons
                [...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-80 bg-white rounded-lg border border-gray-200 p-4 animate-pulse"
                  >
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-gray-100 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                  </div>
                ))
              ) : items.length === 0 ? (
                <div className="w-full text-center py-8 text-gray-500">
                  <p>No feed items available</p>
                </div>
              ) : (
                items.map((item) => (
                  <a
                    key={item.id}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 w-80 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all p-4 group"
                  >
                    {/* Category badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-medium ${getCategoryColor(
                          item.category
                        )}`}
                      >
                        {item.category}
                      </span>
                      <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {item.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="truncate flex-1 mr-2">{item.feedName}</span>
                      {item.publishedAt && (
                        <span className="flex-shrink-0">
                          {formatRelativeTime(item.publishedAt)}
                        </span>
                      )}
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>

          {/* Scroll indicators */}
          {items.length > 3 && (
            <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none" />
          )}
        </div>

        {/* View All Link */}
        {items.length > 0 && (
          <div className="text-center mt-4">
            <a
              href="#"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all updates
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
