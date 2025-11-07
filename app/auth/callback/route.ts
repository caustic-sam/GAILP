import { NextResponse } from 'next/server';
import { getSupabaseServer } from '../../../lib/supabase/server';

export async function GET(req: Request) {
  const supabase = await getSupabaseServer();
  await supabase.auth.exchangeCodeForSession(req.url);
  const url = new URL(req.url);

  // Get user profile to determine redirect
  const { data: { session } } = await supabase.auth.getSession();
  let redirectTo = '/';

  if (session) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    // Redirect admins, publishers, and contributors to admin dashboard
    if (profile && ['admin', 'publisher', 'contributor'].includes(profile.role)) {
      redirectTo = '/admin';
    }
  }

  const rt = url.searchParams.get('redirectedFrom') || redirectTo;
  return NextResponse.redirect(rt, { headers: { 'Cache-Control': 'no-store' } });
}