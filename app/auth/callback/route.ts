import { NextResponse, NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  console.log('🔄 OAuth callback received', { code: !!code });

  if (!code) {
    console.error('❌ No code in callback');
    return NextResponse.redirect(`${origin}/login?error=no_code`);
  }

  try {
    let redirectUrl = `${origin}/admin`;

    // Create response that we'll set cookies on
    const response = new NextResponse(null, {
      status: 302,
      headers: {
        Location: redirectUrl,
      },
    });

    // Create Supabase client with cookie handling that sets on response
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
      }
    );

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

    // Update the redirect URL in the response
    response.headers.set('Location', `${origin}${finalUrl}`);

    return response;
  } catch (error) {
    console.error('❌ Callback error:', error);
    return NextResponse.redirect(`${origin}/login?error=callback_failed`);
  }
}