import { NextResponse } from 'next/server';
import { getSupabaseServer } from '../../../lib/supabase/server';

export async function GET(req: Request) {
  const supabase = await getSupabaseServer();
  await supabase.auth.exchangeCodeForSession(req.url);
  const url = new URL(req.url);
  // Redirect to homepage temporarily until admin dashboard is built
  const rt = url.searchParams.get('redirectedFrom') || '/';
  return NextResponse.redirect(rt, { headers: { 'Cache-Control': 'no-store' } });
}