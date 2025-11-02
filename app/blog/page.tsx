'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, User, ArrowRight, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author_name: string;
  view_count: number;
  featured_image: string | null;
  tags: string[];
}

export default function BlogPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPublishedArticles() {
      try {
        const response = await fetch('/api/admin/articles?status=published');
        const data = await response.json();
        setArticles(data.articles || []);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPublishedArticles();
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getExcerpt = (article: Article) => {
    if (article.excerpt) return article.excerpt;
    if (!article.content) return 'No content available...';
    // Fallback: extract first 150 characters from content
    const plainText = article.content.replace(/<[^>]*>/g, '');
    return plainText.substring(0, 150) + '...';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f] border-b border-blue-900/20">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Expert Blog</h1>
            <p className="text-xl text-blue-100">
              In-depth analysis and expert commentary on digital policy, governance, and data protection.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading articles...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Articles Yet</h2>
            <p className="text-gray-600 mb-6">
              We're working on bringing you insightful content. Check back soon!
            </p>
            <Button variant="primary" size="lg">
              Subscribe for Updates
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Link key={article.id} href={`/articles/${article.slug}`}>
                <Card hover className="h-full flex flex-col overflow-hidden">
                  {/* Featured Image */}
                  {article.featured_image ? (
                    <div className="w-full h-48 overflow-hidden">
                      <img
                        src={article.featured_image}
                        alt={article.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8f] flex items-center justify-center">
                      <TrendingUp className="w-16 h-16 text-blue-100 opacity-50" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{article.author_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(article.published_at)}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
                      {article.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                      {getExcerpt(article)}
                    </p>

                    {/* Tags */}
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {article.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Read More */}
                    <div className="flex items-center gap-2 text-blue-600 font-medium hover:gap-3 transition-all">
                      <span>Read More</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination (if needed in the future) */}
        {articles.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-gray-600">
              Showing {articles.length} article{articles.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f] mt-16">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Stay Informed</h2>
          <p className="text-xl text-blue-100 mb-8">
            Subscribe to get the latest policy insights delivered to your inbox
          </p>
          <Button variant="primary" size="lg" icon={<ArrowRight className="w-5 h-5" />}>
            Subscribe Now
          </Button>
        </div>
      </div>
    </div>
  );
}
