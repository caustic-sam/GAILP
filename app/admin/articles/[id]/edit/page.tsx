'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import dynamic from 'next/dynamic';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  category: string;
  tags: string[];
  featured_image_url?: string;
  seo_title?: string;
  seo_description?: string;
  scheduled_for?: string;
  wordpress_id?: number;
}

interface Category {
  value: string;
  label: string;
}

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);

  // Quill modules configuration
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      ['blockquote', 'code-block'],
      [{ align: [] }],
      ['link', 'image', 'video'],
      ['clean'],
    ],
  };

  useEffect(() => {
    loadArticle();
    loadCategories();
  }, [articleId]);

  async function loadMediaFiles() {
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('media_type', 'image')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setMediaFiles(data || []);
    } catch (error) {
      console.error('Error loading media:', error);
    }
  }

  async function loadArticle() {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single();

      if (error) throw error;
      setArticle(data);
    } catch (error) {
      console.error('Error loading article:', error);
      alert('Failed to load article');
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      // Get unique categories from all articles
      const { data, error } = await supabase
        .from('articles')
        .select('category')
        .not('category', 'is', null);

      if (error) throw error;

      const uniqueCategories = [...new Set(data.map((a) => a.category))].sort();
      setCategories(
        uniqueCategories.map((cat) => ({ value: cat, label: cat }))
      );
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  function generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function handleTitleChange(newTitle: string) {
    if (!article) return;

    const newSlug = generateSlug(newTitle);
    setArticle({ ...article, title: newTitle, slug: newSlug });
  }

  function addCategory() {
    if (!newCategory.trim()) return;

    const category = newCategory.trim();
    if (!categories.find((c) => c.value === category)) {
      setCategories([...categories, { value: category, label: category }].sort((a, b) => a.label.localeCompare(b.label)));
    }

    if (article) {
      setArticle({ ...article, category });
    }

    setNewCategory('');
    setShowNewCategory(false);
  }

  function addTag() {
    if (!tagInput.trim() || !article) return;

    const newTag = tagInput.trim();
    if (!article.tags.includes(newTag)) {
      setArticle({ ...article, tags: [...article.tags, newTag] });
    }
    setTagInput('');
  }

  function removeTag(tagToRemove: string) {
    if (!article) return;
    setArticle({
      ...article,
      tags: article.tags.filter((tag) => tag !== tagToRemove),
    });
  }

  async function saveArticle(newStatus?: 'draft' | 'published') {
    if (!article) return;

    setSaving(true);
    try {
      const updates: any = {
        title: article.title,
        slug: article.slug,
        content: article.content,
        excerpt: article.excerpt,
        category: article.category,
        tags: article.tags,
        featured_image_url: article.featured_image_url,
        seo_title: article.seo_title,
        seo_description: article.seo_description,
        updated_at: new Date().toISOString(),
      };

      if (newStatus) {
        updates.status = newStatus;
        if (newStatus === 'published' && !article.published_at) {
          updates.published_at = new Date().toISOString();
        }
      }

      const { error } = await supabase
        .from('articles')
        .update(updates)
        .eq('id', articleId);

      if (error) throw error;

      alert('Article saved successfully!');

      if (newStatus === 'published') {
        router.push('/admin/articles');
      }
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Failed to save article');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Article not found</p>
          <button
            onClick={() => router.push('/admin/articles')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            ← Back to articles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-gray-900">Edit Article</h1>
              {article.wordpress_id && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                  WP #{article.wordpress_id}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">Last updated: {new Date(article.updated_at).toLocaleString()}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              article.status === 'published' ? 'bg-green-100 text-green-800' :
              article.status === 'draft' ? 'bg-orange-100 text-orange-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {article.status}
            </span>

            <button
              onClick={() => saveArticle()}
              disabled={saving}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>

            {article.status === 'draft' && (
              <button
                onClick={() => saveArticle('published')}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                Publish
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Main Editor */}
          <div className="col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <input
                type="text"
                value={article.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Article title"
                className="w-full text-3xl font-bold border-none outline-none focus:ring-0 p-0"
              />
              <div className="mt-2 text-sm text-gray-500">
                Permalink: <span className="text-blue-600">/{article.slug}</span>
              </div>
            </div>

            {/* Content Editor */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <ReactQuill
                theme="snow"
                value={article.content}
                onChange={(content) => setArticle({ ...article, content })}
                modules={modules}
                className="quill-editor"
                style={{ minHeight: '500px' }}
              />
            </div>

            {/* Excerpt */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt
              </label>
              <textarea
                value={article.excerpt || ''}
                onChange={(e) => setArticle({ ...article, excerpt: e.target.value })}
                placeholder="Optional short description..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Category */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Category</h3>

              <select
                value={article.category || ''}
                onChange={(e) => setArticle({ ...article, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>

              {!showNewCategory ? (
                <button
                  onClick={() => setShowNewCategory(true)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  + Add new category
                </button>
              ) : (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                    placeholder="New category"
                    className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                  <button
                    onClick={addCategory}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowNewCategory(false);
                      setNewCategory('');
                    }}
                    className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Tags</h3>

              <div className="flex flex-wrap gap-2 mb-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  placeholder="Add tag..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Featured Image */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Featured Image</h3>

              {article.featured_image_url ? (
                <div>
                  <img
                    src={article.featured_image_url}
                    alt="Featured"
                    className="w-full rounded mb-2"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        loadMediaFiles();
                        setShowMediaPicker(true);
                      }}
                      className="flex-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      Change image
                    </button>
                    <button
                      onClick={() => setArticle({ ...article, featured_image_url: '' })}
                      className="flex-1 text-sm text-red-600 hover:text-red-700"
                    >
                      Remove image
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-2">No featured image</p>
                  <button
                    onClick={() => {
                      loadMediaFiles();
                      setShowMediaPicker(true);
                    }}
                    className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Choose from Media Library
                  </button>
                  <div className="mt-2 text-xs text-gray-500">or</div>
                  <input
                    type="text"
                    placeholder="Paste image URL"
                    onBlur={(e) => {
                      if (e.target.value) {
                        setArticle({ ...article, featured_image_url: e.target.value });
                      }
                    }}
                    className="w-full mt-2 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            {/* SEO */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">SEO</h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">SEO Title</label>
                  <input
                    type="text"
                    value={article.seo_title || ''}
                    onChange={(e) => setArticle({ ...article, seo_title: e.target.value })}
                    placeholder={article.title}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Meta Description</label>
                  <textarea
                    value={article.seo_description || ''}
                    onChange={(e) => setArticle({ ...article, seo_description: e.target.value })}
                    placeholder={article.excerpt}
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-bold">Choose Featured Image</h2>
              <button
                onClick={() => setShowMediaPicker(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {mediaFiles.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No images in media library</p>
                  <a
                    href="/admin/media"
                    target="_blank"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    Upload images to media library
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-4">
                  {mediaFiles.map((media) => (
                    <div
                      key={media.id}
                      onClick={() => {
                        setArticle({ ...article, featured_image_url: media.file_url });
                        setShowMediaPicker(false);
                      }}
                      className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden cursor-pointer hover:border-blue-500 transition"
                    >
                      <img
                        src={media.file_url}
                        alt={media.alt_text || media.title || ''}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {media.title || media.original_filename}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .quill-editor {
          min-height: 500px;
        }
        .quill-editor .ql-container {
          min-height: 450px;
          font-size: 16px;
        }
        .quill-editor .ql-editor {
          min-height: 450px;
        }
      `}</style>
    </div>
  );
}
