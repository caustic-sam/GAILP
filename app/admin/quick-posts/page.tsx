'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from 'sonner';
import {
  MessageSquare,
  Send,
  Trash2,
  Edit,
  Clock,
  CheckCircle,
  Archive,
  Plus,
  Hash,
  Smartphone,
  Globe,
} from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface QuickPost {
  id: string;
  content: string;
  source: string;
  status: 'draft' | 'published' | 'archived';
  hashtags: string[];
  media_url: string | null;
  created_at: string;
  published_at: string | null;
  updated_at: string;
}

type FilterStatus = 'all' | 'draft' | 'published' | 'archived';

export default function QuickPostsPage() {
  const [posts, setPosts] = useState<QuickPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [saving, setSaving] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchPosts();
  }, [filterStatus]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('quick_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching posts:', error);
        toast.error('Failed to load quick posts');
        return;
      }

      setPosts(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load quick posts');
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    if (!newPostContent.trim()) {
      toast.error('Content is required');
      return;
    }

    setSaving(true);
    try {
      // Extract hashtags
      const hashtagMatches = newPostContent.match(/#[\w]+/g);
      const hashtags = hashtagMatches ? hashtagMatches.map(tag => tag.substring(1)) : [];

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in');
        return;
      }

      const { error } = await supabase
        .from('quick_posts')
        .insert({
          content: newPostContent.trim(),
          hashtags,
          source: 'web',
          status: 'draft',
          author_id: user.id,
        });

      if (error) {
        console.error('Error creating post:', error);
        toast.error('Failed to create post');
        return;
      }

      toast.success('Quick post created!');
      setNewPostContent('');
      setShowNewPost(false);
      fetchPosts();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to create post');
    } finally {
      setSaving(false);
    }
  };

  const publishPost = async (id: string) => {
    try {
      const { error } = await supabase
        .from('quick_posts')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.error('Error publishing post:', error);
        toast.error('Failed to publish post');
        return;
      }

      toast.success('Post published!');
      fetchPosts();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to publish post');
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm('Delete this post?')) return;

    try {
      const { error } = await supabase
        .from('quick_posts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting post:', error);
        toast.error('Failed to delete post');
        return;
      }

      toast.success('Post deleted');
      fetchPosts();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete post');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'draft':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'archived':
        return <Archive className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'drafts':
        return <Smartphone className="w-4 h-4" />;
      case 'web':
        return <Globe className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
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
    return date.toLocaleDateString();
  };

  const filteredPosts = posts;
  const stats = {
    total: posts.length,
    drafts: posts.filter(p => p.status === 'draft').length,
    published: posts.filter(p => p.status === 'published').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f] border-b border-blue-900/20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Quick Posts</h1>
              <p className="text-xl text-blue-100">Micro-blog from anywhere</p>
            </div>
            <button
              onClick={() => setShowNewPost(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-blue-900 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              New Post
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Posts</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-yellow-600">{stats.drafts}</div>
            <div className="text-sm text-gray-600">Drafts</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{stats.published}</div>
            <div className="text-sm text-gray-600">Published</div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['all', 'draft', 'published', 'archived'] as FilterStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* New Post Form */}
        {showNewPost && (
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">New Quick Post</h3>
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="What's on your mind? Use #hashtags..."
              maxLength={280}
              className="w-full h-32 border border-gray-300 rounded-lg p-3 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex items-center justify-between mt-3">
              <div className="text-sm text-gray-600">
                {newPostContent.length}/280 characters
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowNewPost(false);
                    setNewPostContent('');
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={createPost}
                  disabled={saving || !newPostContent.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {saving ? 'Creating...' : 'Create Draft'}
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Posts List */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600">Create your first quick post to get started</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(post.status)}
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {post.status}
                    </span>
                    <span className="text-gray-400">·</span>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      {getSourceIcon(post.source)}
                      <span className="capitalize">{post.source}</span>
                    </div>
                    <span className="text-gray-400">·</span>
                    <span className="text-sm text-gray-600">{formatDate(post.created_at)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {post.status === 'draft' && (
                      <button
                        onClick={() => publishPost(post.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors text-sm font-medium"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Publish
                      </button>
                    )}
                    <button
                      onClick={() => deletePost(post.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>

                <p className="text-gray-900 text-lg mb-3 whitespace-pre-wrap">{post.content}</p>

                {post.hashtags && post.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.hashtags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm"
                      >
                        <Hash className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {post.media_url && (
                  <img
                    src={post.media_url}
                    alt="Post media"
                    className="mt-3 rounded-lg max-h-64 object-cover"
                  />
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
