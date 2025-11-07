import { NextResponse, NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  console.log('🔄 OAuth callback received', { code: !!code });

  if (!code) {
    console.error('❌ No code in callback');
    return NextResponse.redirect(new URL('/login?error=no_code', url.origin));
  }

  try {
    // Store cookies to set on response
    const cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }> = [];

    // Create Supabase client with cookie handling
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookiesToSet.push({ name, value, options });
          },
          remove(name: string, options: CookieOptions) {
            cookiesToSet.push({ name, value: '', options: { ...options, maxAge: 0 } });
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
      return NextResponse.redirect(new URL('/login?error=auth_failed', url.origin));
    }

    if (!data.session) {
      console.error('❌ No session after code exchange');
      return NextResponse.redirect(new URL('/login?error=no_session', url.origin));
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

    const finalUrl = url.searchParams.get('redirectedFrom') || redirectTo;
    console.log('✅ Redirecting to:', finalUrl);
    console.log('🍪 Setting cookies:', cookiesToSet.length);

    // Create response with redirect
    const response = NextResponse.redirect(new URL(finalUrl, url.origin));

    // Set all cookies that Supabase needs
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set({
        name,
        value,
        ...options,
        sameSite: 'lax',
        secure: true,
        path: '/',
      });
    });

    return response;
  } catch (error) {
    console.error('❌ Callback error:', error);
    return NextResponse.redirect(new URL('/login?error=callback_failed', url.origin));
  }
}