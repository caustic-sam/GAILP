import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET: Fetch single article by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log('📥 GET /api/admin/articles/[id] - Fetching article:', id);

    if (!isSupabaseConfigured()) {
      console.log('📝 Mock mode - Supabase not configured');
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    console.log('✅ Article fetched:', data.title);

    return NextResponse.json({
      article: data,
      source: 'supabase',
    });
  } catch (error) {
    console.error('❌ Error fetching article:', error);

    const isSupabaseError = error && typeof error === 'object' && 'code' in error && 'message' in error;

    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : isSupabaseError
          ? (error as any).message
          : 'Failed to fetch article',
      },
      { status: 500 }
    );
  }
}

// PUT: Update existing article
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log('📥 PUT /api/admin/articles/[id] - Updating article:', id);

    const body = await request.json();
    console.log('📋 Request body:', {
      title: body.title,
      slug: body.slug,
      contentLength: body.content?.length,
      status: body.status,
    });

    // Validate required fields
    if (!body.title || !body.slug || !body.content) {
      console.error('❌ Validation failed - missing fields');
      return NextResponse.json(
        { error: 'Missing required fields: title, slug, content' },
        { status: 400 }
      );
    }

    // Calculate read time
    const wordsPerMinute = 200;
    const wordCount = body.content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);

    if (!isSupabaseConfigured()) {
      console.log('📝 Mock update mode (Supabase not configured)');
      return NextResponse.json({
        article: {
          id,
          ...body,
          read_time: readTime,
          updated_at: new Date().toISOString(),
        },
        source: 'mock',
        message: 'Article updated successfully (mock mode)',
      });
    }

    // Update in Supabase - using base schema column names
    const articleData: any = {
      title: body.title,
      slug: body.slug,
      content: body.content,
      summary: body.excerpt || body.content.substring(0, 200) + '...',
      status: body.status === 'scheduled' ? 'draft' : body.status || 'draft',
      featured_image_url: body.featured_image_url || null,
      published_at: body.published_at || null,
      read_time_minutes: readTime,
      word_count: wordCount,
      meta_description: body.seo_description || body.excerpt || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('articles')
      .update(articleData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('✅ Article updated:', data.title);

    return NextResponse.json({
      article: data,
      source: 'supabase',
      message: 'Article updated successfully',
    });
  } catch (error) {
    console.error('❌ Error updating article:', error);

    const isSupabaseError = error && typeof error === 'object' && 'code' in error && 'message' in error;

    const errorDetails = {
      message: error instanceof Error
        ? error.message
        : isSupabaseError
        ? (error as any).message
        : 'Unknown error',
      code: isSupabaseError ? (error as any).code : undefined,
      details: isSupabaseError ? (error as any).details : undefined,
      hint: isSupabaseError ? (error as any).hint : undefined,
    };

    console.error('❌ Error details:', errorDetails);

    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : isSupabaseError
          ? (error as any).message
          : 'Failed to update article',
        details: errorDetails,
      },
      { status: 500 }
    );
  }
}
