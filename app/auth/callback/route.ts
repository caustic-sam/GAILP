import { NextResponse } from 'next/server';
import { getSupabaseServer } from '../../../lib/supabase/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  console.log('🔄 OAuth callback received', { code: !!code });

  if (!code) {
    console.error('❌ No code in callback');
    return NextResponse.redirect(new URL('/login?error=no_code', url.origin));
  }

  try {
    const supabase = await getSupabaseServer();

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    console.log('🔐 Code exchange result:', {
      success: !!data.session,
      error: error?.message
    });

    if (error) {
      console.error('❌ Code exchange failed:', error);
      return NextResponse.redirect(new URL('/login?error=auth_failed', url.origin));
    }

    if (!data.session) {
      console.error('❌ No session after code exchange');
      return NextResponse.redirect(new URL('/login?error=no_session', url.origin));
    }

    // Get user profile to determine redirect
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', data.session.user.id)
      .single();

    console.log('👤 User profile:', profile?.email, 'Role:', profile?.role);

    // Redirect based on role
    let redirectTo = '/';
    if (profile && ['admin', 'publisher', 'contributor'].includes(profile.role)) {
      redirectTo = '/admin';
    }

    const finalUrl = url.searchParams.get('redirectedFrom') || redirectTo;
    console.log('✅ Redirecting to:', finalUrl);

    return NextResponse.redirect(new URL(finalUrl, url.origin));
  } catch (error) {
    console.error('❌ Callback error:', error);
    return NextResponse.redirect(new URL('/login?error=callback_failed', url.origin));
  }
}