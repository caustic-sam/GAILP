import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { mockArticles } from '@/lib/mockData';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET: Fetch published articles for public display
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10');

  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.log('📝 Using mock data (Supabase not configured)');

      return NextResponse.json({
        articles: mockArticles.slice(0, limit),
        source: 'mock',
        count: mockArticles.length,
      });
    }

    // Fetch only published articles
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, slug, summary, content, published_at, created_at, read_time_minutes, word_count, featured_image_url')
      .eq('status', 'published')
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return NextResponse.json({
      articles: data || [],
      source: 'supabase',
      count: data?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching articles:', error);

    // Fallback to mock data
    return NextResponse.json({
      articles: mockArticles.slice(0, limit),
      source: 'mock',
      count: mockArticles.length,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
