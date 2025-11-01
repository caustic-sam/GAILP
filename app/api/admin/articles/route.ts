import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { mockArticles } from '@/lib/mockData';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Mock data for development
const mockAdminArticles = [
  {
    id: '1',
    title: 'Getting Started with Digital Policy Analysis',
    slug: 'getting-started-digital-policy',
    status: 'published' as const,
    published_at: '2025-01-15T10:00:00Z',
    scheduled_for: null,
    created_at: '2025-01-10T09:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
    author_name: 'Admin',
    view_count: 1247,
    revision_count: 3,
  },
  {
    id: '2',
    title: 'Draft: AI Regulation Landscape 2025',
    slug: 'ai-regulation-landscape-2025',
    status: 'draft' as const,
    published_at: null,
    scheduled_for: null,
    created_at: '2025-10-30T14:30:00Z',
    updated_at: '2025-10-31T09:15:00Z',
    author_name: 'Admin',
    view_count: 0,
    revision_count: 7,
  },
  {
    id: '3',
    title: 'Understanding GDPR Compliance in 2025',
    slug: 'gdpr-compliance-2025',
    status: 'scheduled' as const,
    published_at: null,
    scheduled_for: '2025-11-05T08:00:00Z',
    created_at: '2025-10-28T11:00:00Z',
    updated_at: '2025-10-30T16:00:00Z',
    author_name: 'Admin',
    view_count: 0,
    revision_count: 2,
  },
  {
    id: '4',
    title: 'The Future of Data Privacy',
    slug: 'future-of-data-privacy',
    status: 'published' as const,
    published_at: '2025-10-20T12:00:00Z',
    scheduled_for: null,
    created_at: '2025-10-18T10:00:00Z',
    updated_at: '2025-10-20T12:00:00Z',
    author_name: 'Admin',
    view_count: 892,
    revision_count: 5,
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.log('📝 Using mock data (Supabase not configured)');

      // Filter mock data by status if provided
      let filtered = mockAdminArticles;
      if (status && status !== 'all') {
        filtered = mockAdminArticles.filter(a => a.status === status);
      }

      return NextResponse.json({
        articles: filtered,
        source: 'mock',
        count: filtered.length,
      });
    }

    // Build Supabase query - use only columns that exist in base schema
    // Compatible with both original and enhanced schemas
    let query = supabase
      .from('articles')
      .select('id, title, slug, status, published_at, created_at, updated_at')
      .order('updated_at', { ascending: false });

    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // Map to expected format, adding defaults for missing fields
    const articles = (data || []).map(article => ({
      ...article,
      scheduled_for: null,
      author_name: 'Admin',
      view_count: 0,
      revision_count: 0,
    }));

    return NextResponse.json({
      articles,
      source: 'supabase',
      count: articles.length,
    });
  } catch (error) {
    console.error('Error fetching articles:', error);

    // Fallback to mock data
    let filtered = mockAdminArticles;
    if (status && status !== 'all') {
      filtered = mockAdminArticles.filter(a => a.status === status);
    }

    return NextResponse.json({
      articles: filtered,
      source: 'mock',
      count: filtered.length,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// POST: Create new article
export async function POST(request: Request) {
  try {
    console.log('📥 POST /api/admin/articles - Received request');

    const body = await request.json();
    console.log('📋 Request body:', {
      title: body.title,
      slug: body.slug,
      contentLength: body.content?.length,
      status: body.status,
    });

    // Validate required fields
    if (!body.title || !body.slug || !body.content) {
      console.error('❌ Validation failed - missing fields:', {
        hasTitle: !!body.title,
        hasSlug: !!body.slug,
        hasContent: !!body.content,
      });
      return NextResponse.json(
        { error: 'Missing required fields: title, slug, content' },
        { status: 400 }
      );
    }

    // Calculate read time
    const wordsPerMinute = 200;
    const wordCount = body.content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    console.log('📊 Calculated read time:', readTime, 'minutes');

    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.log('📝 Mock save mode (Supabase not configured)');

      // Simulate successful save
      const mockArticle = {
        id: Math.random().toString(36).substring(2, 11),
        ...body,
        read_time: readTime,
        view_count: 0,
        revision_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author_name: 'Admin',
      };

      console.log('✅ Mock article created:', mockArticle.id);

      return NextResponse.json({
        article: mockArticle,
        source: 'mock',
        message: 'Article saved successfully (mock mode)',
      });
    }

    // Insert into Supabase - using base schema column names
    // Base schema uses: summary (not excerpt), read_time_minutes (not read_time)
    const articleData: any = {
      title: body.title,
      slug: body.slug,
      content: body.content,
      summary: body.excerpt || body.content.substring(0, 200) + '...', // Base schema requires summary
      status: body.status === 'scheduled' ? 'draft' : body.status || 'draft', // Base schema doesn't have 'scheduled'
      featured_image_url: body.featured_image_url || null,
      published_at: body.published_at || null,
      read_time_minutes: readTime,
      word_count: wordCount,
      meta_description: body.seo_description || body.excerpt || null,
    };

    // Use admin client to bypass RLS policies
    const { data, error } = await supabaseAdmin
      .from('articles')
      .insert([articleData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return NextResponse.json({
      article: data,
      source: 'supabase',
      message: 'Article saved successfully',
    });
  } catch (error) {
    console.error('❌ Error creating article:', error);

    // Handle Supabase errors (which are plain objects, not Error instances)
    const isSupabaseError = error && typeof error === 'object' && 'code' in error && 'message' in error;

    // Provide detailed error information
    const errorDetails = {
      message: error instanceof Error
        ? error.message
        : isSupabaseError
        ? (error as any).message
        : 'Unknown error',
      code: isSupabaseError ? (error as any).code : undefined,
      details: isSupabaseError ? (error as any).details : undefined,
      hint: isSupabaseError ? (error as any).hint : undefined,
      stack: error instanceof Error ? error.stack : undefined,
      type: error?.constructor?.name,
    };

    console.error('❌ Error details:', errorDetails);

    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : isSupabaseError
          ? (error as any).message
          : 'Failed to create article',
        details: errorDetails,
      },
      { status: 500 }
    );
  }
}
