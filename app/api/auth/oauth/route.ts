import { NextResponse } from 'next/server';
import { getSupabaseServer } from '../../../../lib/supabase/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const provider = url.searchParams.get('provider') as 'github' | 'google' | null;
  const redirectTo = url.searchParams.get('redirectTo') ?? '/auth/callback';
  if (!provider) return NextResponse.redirect(new URL('/login', url));

  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo }
  });

  if (error || !data?.url) return NextResponse.redirect(new URL('/login?err=oauth', url));
  return NextResponse.redirect(data.url);
}