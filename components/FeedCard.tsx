'use client';

import { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { ExternalLink, RefreshCw } from 'lucide-react';

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

interface FeedCardProps {
  title: string;
  icon?: React.ReactNode;
  category: 'policy' | 'research' | 'news' | 'analysis';
  itemCount?: number;
  refreshInterval?: number; // in milliseconds
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
  return `${days} days ago`;
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
  const [source, setSource] = useState<'freshrss' | 'freshrss-rss' | 'mock'>('mock');
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setError(null);
      const response = await fetch(
        `/api/feeds?category=${category}&count=${itemCount}`
      );
      const data = await response.json();

      setItems(data.data || []);
      setSource(data.source);

      if (data.error) {
        setError(data.error);
      }
    } catch (err) {
      console.error('Error fetching feed items:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch feeds');
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
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            aria-label="Refresh feed"
          >
            <RefreshCw
              className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`}
            />
          </button>
        </div>

        {/* Source indicator */}
        <div className="mb-3 flex items-center gap-2">
          <span
            className={`text-xs px-2 py-1 rounded font-medium ${
              source === 'freshrss' || source === 'freshrss-rss'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {source === 'freshrss' || source === 'freshrss-rss' ? '🟢 Live Feed' : '📝 Demo Content'}
          </span>
          {error && (
            <span className="text-xs text-red-600">
              ({error})
            </span>
          )}
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
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No items found in this category</p>
            <p className="text-xs mt-2">Try refreshing or check your FreshRSS feeds</p>
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
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span className="truncate">{item.feedName}</span>
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
        {items.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <a
              href="#"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all {category} updates →
            </a>
          </div>
        )}
      </div>
    </Card>
  );
}
