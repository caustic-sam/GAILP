import { NextResponse, NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  console.log('🔄 OAuth callback received', { code: !!code });

  if (!code) {
    console.error('❌ No code in callback');
    return NextResponse.redirect(new URL('/login?error=no_code', url.origin));
  }

  try {
    const cookieStore = await cookies();

    // Create Supabase client with cookie handling
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              // In route handlers, cookies can't always be set synchronously
              console.error('Cookie set error:', error);
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options, maxAge: 0 });
            } catch (error) {
              console.error('Cookie remove error:', error);
            }
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

    return NextResponse.redirect(new URL(finalUrl, url.origin));
  } catch (error) {
    console.error('❌ Callback error:', error);
    return NextResponse.redirect(new URL('/login?error=callback_failed', url.origin));
  }
}