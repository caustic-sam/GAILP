'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { MessageSquare, Hash, Smartphone, Calendar } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface QuickPost {
  id: string;
  content: string;
  source: string;
  hashtags: string[];
  media_url: string | null;
  published_at: string;
}

export default function QuickPostsPage() {
  const [posts, setPosts] = useState<QuickPost[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('quick_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching posts:', error);
        return;
      }

      setPosts(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const renderContentWithHashtags = (content: string, hashtags: string[]) => {
    let processedContent = content;

    hashtags.forEach(tag => {
      const regex = new RegExp(`#${tag}\\b`, 'g');
      processedContent = processedContent.replace(
        regex,
        `<span class="text-blue-600 font-medium hover:text-blue-700 cursor-pointer">#${tag}</span>`
      );
    });

    return <span dangerouslySetInnerHTML={{ __html: processedContent }} />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f] border-b border-blue-900/20">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-12 h-12 text-blue-200" />
            <h1 className="text-5xl font-bold text-white">Quick Posts</h1>
          </div>
          <p className="text-xl text-blue-100">
            Brief thoughts, observations, and updates
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <Card className="p-16 text-center">
            <MessageSquare className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600 text-lg">Check back soon for updates!</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="p-6 hover:shadow-lg transition-all duration-200 border-l-4 border-blue-500"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <time dateTime={post.published_at}>
                      {formatDate(post.published_at)}
                    </time>
                    {post.source === 'drafts' && (
                      <>
                        <span className="text-gray-400">·</span>
                        <div className="flex items-center gap-1">
                          <Smartphone className="w-4 h-4" />
                          <span>via Drafts</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Content */}
                <p className="text-gray-900 text-lg leading-relaxed mb-4 whitespace-pre-wrap">
                  {post.hashtags && post.hashtags.length > 0
                    ? renderContentWithHashtags(post.content, post.hashtags)
                    : post.content
                  }
                </p>

                {/* Media */}
                {post.media_url && (
                  <div className="mb-4">
                    <img
                      src={post.media_url}
                      alt="Post media"
                      className="rounded-lg max-h-96 w-full object-cover"
                    />
                  </div>
                )}

                {/* Hashtags */}
                {post.hashtags && post.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                    {post.hashtags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors cursor-pointer"
                      >
                        <Hash className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Footer Note */}
        {!loading && posts.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">
              Showing {posts.length} {posts.length === 1 ? 'post' : 'posts'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
