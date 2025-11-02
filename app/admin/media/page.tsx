'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface MediaFile {
  id: string;
  filename: string;
  original_filename: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  media_type: 'image' | 'video' | 'audio' | 'document' | 'other';
  width?: number;
  height?: number;
  alt_text?: string;
  caption?: string;
  title?: string;
  description?: string;
  tags: string[];
  folder?: string;
  uploaded_at: string;
  used_in_articles: number;
}

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'audio' | 'document'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMedia();
  }, [filter]);

  async function loadMedia() {
    setLoading(true);
    try {
      let query = supabase
        .from('media')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('media_type', filter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading media:', error);
        return;
      }

      setMedia(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        // Generate unique filename
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${timestamp}_${sanitizedName}`;
        const filePath = `uploads/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${filename}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          alert(`Failed to upload ${file.name}: ${uploadError.message}`);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        // Determine media type
        const mimeType = file.type;
        let mediaType: MediaFile['media_type'] = 'other';
        if (mimeType.startsWith('image/')) mediaType = 'image';
        else if (mimeType.startsWith('video/')) mediaType = 'video';
        else if (mimeType.startsWith('audio/')) mediaType = 'audio';
        else if (mimeType.includes('pdf') || mimeType.includes('document')) mediaType = 'document';

        // Get image dimensions if it's an image
        let width, height;
        if (mediaType === 'image') {
          const dimensions = await getImageDimensions(file);
          width = dimensions.width;
          height = dimensions.height;
        }

        // Save metadata to database
        const { error: dbError } = await supabase.from('media').insert({
          filename: filename,
          original_filename: file.name,
          file_path: filePath,
          file_url: urlData.publicUrl,
          file_size: file.size,
          mime_type: mimeType,
          file_extension: file.name.split('.').pop() || '',
          media_type: mediaType,
          width,
          height,
          title: file.name.split('.')[0],
        });

        if (dbError) {
          console.error('Database error:', dbError);
          alert(`Failed to save ${file.name} metadata: ${dbError.message}`);
        }
      }

      // Reload media
      await loadMedia();
      alert(`Successfully uploaded ${files.length} file(s)`);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload files');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        resolve({ width: 0, height: 0 });
      };
      img.src = URL.createObjectURL(file);
    });
  }

  async function updateMediaDetails(mediaId: string, updates: Partial<MediaFile>) {
    try {
      const { error } = await supabase
        .from('media')
        .update(updates)
        .eq('id', mediaId);

      if (error) throw error;

      // Update local state
      setMedia(media.map(m => m.id === mediaId ? { ...m, ...updates } : m));
      setSelectedMedia(selectedMedia ? { ...selectedMedia, ...updates } : null);

      alert('Media updated successfully');
    } catch (error) {
      console.error('Error updating media:', error);
      alert('Failed to update media');
    }
  }

  async function deleteMedia(mediaId: string) {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const mediaItem = media.find(m => m.id === mediaId);
      if (!mediaItem) return;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('media')
        .remove([mediaItem.file_path]);

      if (storageError) {
        console.error('Storage error:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('media')
        .delete()
        .eq('id', mediaId);

      if (dbError) throw dbError;

      // Update local state
      setMedia(media.filter(m => m.id !== mediaId));
      setSelectedMedia(null);

      alert('Media deleted successfully');
    } catch (error) {
      console.error('Error deleting media:', error);
      alert('Failed to delete media');
    }
  }

  function copyUrlToClipboard(url: string) {
    navigator.clipboard.writeText(url);
    alert('URL copied to clipboard!');
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  const filteredMedia = media.filter(item =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: media.length,
    images: media.filter(m => m.media_type === 'image').length,
    videos: media.filter(m => m.media_type === 'video').length,
    audio: media.filter(m => m.media_type === 'audio').length,
    documents: media.filter(m => m.media_type === 'document').length,
    totalSize: media.reduce((sum, m) => sum + m.file_size, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
              <p className="text-gray-600 mt-1">Upload and manage your media files</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : '+ Upload Files'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-6 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">Total Files</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">Images</div>
              <div className="text-2xl font-bold text-blue-600">{stats.images}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">Videos</div>
              <div className="text-2xl font-bold text-purple-600">{stats.videos}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">Audio</div>
              <div className="text-2xl font-bold text-green-600">{stats.audio}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">Documents</div>
              <div className="text-2xl font-bold text-orange-600">{stats.documents}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">Total Size</div>
              <div className="text-2xl font-bold text-gray-900">{formatFileSize(stats.totalSize)}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 items-center mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('image')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'image' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Images
              </button>
              <button
                onClick={() => setFilter('video')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'video' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Videos
              </button>
              <button
                onClick={() => setFilter('audio')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'audio' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Audio
              </button>
              <button
                onClick={() => setFilter('document')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'document' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Documents
              </button>
            </div>

            <input
              type="text"
              placeholder="Search media..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Media Grid/List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading media...</p>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-gray-600">No media files found</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 text-blue-600 hover:text-blue-700 underline"
            >
              Upload your first file
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-4 gap-4">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedMedia(item)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition"
              >
                {item.media_type === 'image' ? (
                  <img src={item.file_url} alt={item.alt_text || item.title || ''} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.title || item.original_filename}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(item.file_size)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredMedia.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.media_type === 'image' ? (
                          <img src={item.file_url} alt="" className="w-12 h-12 rounded object-cover" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{item.title || item.original_filename}</p>
                          <p className="text-sm text-gray-500">{item.original_filename}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.media_type}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatFileSize(item.file_size)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(item.uploaded_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedMedia(item)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Media Details Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Media Details</h2>
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Preview */}
                <div>
                  {selectedMedia.media_type === 'image' ? (
                    <img src={selectedMedia.file_url} alt="" className="w-full rounded" />
                  ) : (
                    <div className="w-full h-64 bg-gray-100 rounded flex items-center justify-center">
                      <svg className="w-24 h-24 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}

                  <div className="mt-4 space-y-2">
                    <button
                      onClick={() => copyUrlToClipboard(selectedMedia.file_url)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Copy URL
                    </button>
                    <button
                      onClick={() => window.open(selectedMedia.file_url, '_blank')}
                      className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Open in New Tab
                    </button>
                    <button
                      onClick={() => deleteMedia(selectedMedia.id)}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete File
                    </button>
                  </div>
                </div>

                {/* Details Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={selectedMedia.title || ''}
                      onChange={(e) => setSelectedMedia({ ...selectedMedia, title: e.target.value })}
                      onBlur={(e) => updateMediaDetails(selectedMedia.id, { title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
                    <input
                      type="text"
                      value={selectedMedia.alt_text || ''}
                      onChange={(e) => setSelectedMedia({ ...selectedMedia, alt_text: e.target.value })}
                      onBlur={(e) => updateMediaDetails(selectedMedia.id, { alt_text: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
                    <textarea
                      value={selectedMedia.caption || ''}
                      onChange={(e) => setSelectedMedia({ ...selectedMedia, caption: e.target.value })}
                      onBlur={(e) => updateMediaDetails(selectedMedia.id, { caption: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={selectedMedia.description || ''}
                      onChange={(e) => setSelectedMedia({ ...selectedMedia, description: e.target.value })}
                      onBlur={(e) => updateMediaDetails(selectedMedia.id, { description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold mb-2">File Information</h3>
                    <dl className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Filename:</dt>
                        <dd className="font-medium">{selectedMedia.original_filename}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Type:</dt>
                        <dd className="font-medium">{selectedMedia.mime_type}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Size:</dt>
                        <dd className="font-medium">{formatFileSize(selectedMedia.file_size)}</dd>
                      </div>
                      {selectedMedia.width && selectedMedia.height && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Dimensions:</dt>
                          <dd className="font-medium">{selectedMedia.width} × {selectedMedia.height}</dd>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Uploaded:</dt>
                        <dd className="font-medium">{new Date(selectedMedia.uploaded_at).toLocaleString()}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Used in articles:</dt>
                        <dd className="font-medium">{selectedMedia.used_in_articles}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">File URL</label>
                    <input
                      type="text"
                      value={selectedMedia.file_url}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
