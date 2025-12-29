import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type ArticleStatus = 'draft' | 'scheduled' | 'published' | 'archived';

interface AdminArticleSummary {
  id: string;
  title: string;
  slug: string;
  status: ArticleStatus;
  published_at: string | null;
  scheduled_for: string | null;
  created_at: string;
  updated_at: string;
  author_name: string;
  view_count: number;
  revision_count: number;
}

interface ArticleCreatePayload {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status?: ArticleStatus;
  featured_image_url?: string;
  published_at?: string | null;
  scheduled_for?: string | null;
  seo_description?: string;
}

interface SupabaseErrorDetails {
  message: string;
  code?: string;
  details?: unknown;
  hint?: unknown;
}

function extractSupabaseError(error: unknown): SupabaseErrorDetails | null {
  if (error && typeof error === 'object' && 'message' in error) {
    const err = error as { message: string; code?: string | number; details?: unknown; hint?: unknown };
    return {
      message: err.message,
      code: err.code ? String(err.code) : undefined,
      details: err.details,
      hint: err.hint,
    };
  }
  return null;
}

function isArticleStatus(value: string): value is ArticleStatus {
  return ['draft', 'scheduled', 'published', 'archived'].includes(value);
}

// Mock data for development
const mockAdminArticles: AdminArticleSummary[] = [
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
  const statusParam = searchParams.get('status');
  const statusFilter = statusParam && isArticleStatus(statusParam) ? statusParam : null;

  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.log('📝 Using mock data (Supabase not configured)');

      // Filter mock data by status if provided
      let filtered = mockAdminArticles;
      if (statusFilter) {
        filtered = mockAdminArticles.filter(a => a.status === statusFilter);
      }

      return NextResponse.json({
        articles: filtered,
        source: 'mock',
        count: filtered.length,
      });
    }

    // Get current user to check role and apply filters
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Fetch user profile to check role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 403 }
      );
    }

    const userRole = profile.role;

    // Build Supabase query - select all needed columns
    // Use admin client to bypass RLS (we handle permissions in code above)
    let query = supabaseAdmin
      .from('articles')
      .select('id, title, slug, status, published_at, scheduled_for, created_at, updated_at, view_count, revision_count, author_id')
      .order('updated_at', { ascending: false});

    // Simplified for MVP - only admins have access to admin API
    // Apply status filter
    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // Map to expected format, adding defaults for missing fields
    const articles = (data || []).map(article => ({
      ...article,
      scheduled_for: article.scheduled_for || null,
      author_name: 'Admin', // TODO: Join with user_profiles to get actual author name
      view_count: article.view_count || 0,
      revision_count: article.revision_count || 0,
    }));

    return NextResponse.json({
      articles,
      source: 'supabase',
      count: articles.length,
      role: userRole, // Include role for debugging
    });
  } catch (error) {
    console.error('Error fetching articles:', error);

    // Fallback to mock data
    let filtered = mockAdminArticles;
    if (statusFilter) {
      filtered = mockAdminArticles.filter(a => a.status === statusFilter);
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
    const body = (await request.json()) as ArticleCreatePayload;
    // Sanitized logging - only log metadata, never content
    console.log('📥 POST /api/admin/articles', {
      hasTitle: !!body.title,
      hasSlug: !!body.slug,
      contentLength: body.content?.length,
      status: body.status || 'draft',
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

    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.log('📝 Mock save mode (Supabase not configured)');

      // Simulate successful save
      const mockId = Math.random().toString(36).substring(2, 11);
      const mockArticle = {
        id: mockId,
        ...body,
        read_time: readTime,
        view_count: 0,
        revision_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author_name: 'Admin',
      };

      console.log('✅ Mock article created:', mockId);

      return NextResponse.json({
        article: mockArticle,
        source: 'mock',
        message: 'Article saved successfully (mock mode)',
      });
    }

    // Get current user to set as author
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to create articles' },
        { status: 401 }
      );
    }

    // Fetch user profile to verify role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 403 }
      );
    }

    // Simplified for MVP - only admins can create articles
    if (profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can create articles' },
        { status: 403 }
      );
    }

    // Get requested status, default to draft
    const requestedStatus = body.status || 'draft';

    // Insert into Supabase - using base schema column names
    // Base schema uses: summary (not excerpt), read_time_minutes (not read_time)
    const articleData: Record<string, unknown> = {
      title: body.title,
      slug: body.slug,
      content: body.content,
      summary: body.excerpt || body.content.substring(0, 200) + '...', // Base schema requires summary
      excerpt: body.excerpt || body.content.substring(0, 200) + '...', // Also save to excerpt
      status: requestedStatus,
      author_id: session.user.id, // Set current user as author
      featured_image_url: body.featured_image_url || null,
      published_at: body.published_at || null,
      scheduled_for: body.scheduled_for || null, // Save scheduled date
      read_time_minutes: readTime,
      word_count: wordCount,
      meta_description: body.seo_description || body.excerpt || null,
    };

    // Use admin client to bypass RLS policies for insert
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

    const supabaseError = extractSupabaseError(error);
    const fallbackMessage = error instanceof Error ? error.message : 'Failed to create article';

    if (supabaseError) {
      console.error('❌ Error details:', supabaseError);
    }

    return NextResponse.json(
      {
        error: supabaseError?.message ?? fallbackMessage,
        details: supabaseError ?? undefined,
      },
      { status: 500 }
    );
  }
}
