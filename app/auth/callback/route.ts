import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

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
    // We'll collect cookies here and set them on the final response
    let response = NextResponse.redirect(`${origin}/admin`);

    // Create Supabase client with cookie handling for route handler
    console.log('🔧 Creating Supabase client with cookie handling...');
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
    console.log('🔄 Exchanging code for session...');
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

    // Update avatar from GitHub OAuth metadata if available
    const githubAvatar = data.session.user.user_metadata?.avatar_url;
    if (githubAvatar && profile) {
      console.log('🖼️ Updating avatar from GitHub:', githubAvatar);
      await supabase
        .from('user_profiles')
        .update({ avatar_url: githubAvatar })
        .eq('id', data.session.user.id);
    }

    // Determine redirect based on role and query parameter
    let redirectTo = '/';
    if (profile && profile.role === 'admin') {
      redirectTo = '/admin';
    }

    // Check for explicit redirectTo parameter (from login page)
    const finalUrl = requestUrl.searchParams.get('redirectTo') || redirectTo;
    console.log('✅ Redirecting to:', finalUrl);

    // If the final URL is different from /admin, create a new response with the right redirect
    // but copy over all the cookies that were set
    if (finalUrl !== '/admin') {
      const newResponse = NextResponse.redirect(`${origin}${finalUrl}`);
      // Copy all cookies from the original response
      response.cookies.getAll().forEach((cookie) => {
        newResponse.cookies.set(cookie);
      });
      return newResponse;
    }

    return response;
  } catch (error) {
    console.error('❌ Callback error:', error);
    return NextResponse.redirect(`${origin}/login?error=callback_failed`);
  }
}