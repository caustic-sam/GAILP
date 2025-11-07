import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  console.log('🔄 OAuth callback received', { code: !!code });

  if (!code) {
    console.error('❌ No code in callback');
    return NextResponse.redirect(`${origin}/login?error=no_code`);
  }

  try {
    // Use existing Supabase server client (handles cookies automatically)
    const supabase = await getSupabaseServer();

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    console.log('🔐 Code exchange result:', {
      success: !!data.session,
      error: error?.message,
      userId: data.session?.user?.id
    });

    if (error) {
      console.error('❌ Code exchange failed:', error);
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }

    if (!data.session) {
      console.error('❌ No session after code exchange');
      return NextResponse.redirect(`${origin}/login?error=no_session`);
    }

    // Get user profile to determine redirect
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('email, role')
      .eq('id', data.session.user.id)
      .single();

    console.log('👤 User profile:', profile?.email, 'Role:', profile?.role);

    // Determine redirect based on role
    let redirectTo = '/';
    if (profile && ['admin', 'publisher', 'contributor'].includes(profile.role)) {
      redirectTo = '/admin';
    }

    const finalUrl = requestUrl.searchParams.get('redirectedFrom') || redirectTo;
    console.log('✅ Redirecting to:', finalUrl);

    return NextResponse.redirect(`${origin}${finalUrl}`);
  } catch (error) {
    console.error('❌ Callback error:', error);
    return NextResponse.redirect(`${origin}/login?error=callback_failed`);
  }
}