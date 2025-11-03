import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      return NextResponse.json({
        authenticated: false,
        error: sessionError.message,
        sessionError: sessionError,
      });
    }

    if (!session) {
      return NextResponse.json({
        authenticated: false,
        message: 'No active session',
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    return NextResponse.json({
      authenticated: true,
      session: {
        user: {
          id: session.user.id,
          email: session.user.email,
        },
        expires_at: session.expires_at,
      },
      profile: profile,
      profileError: profileError?.message,
    });
  } catch (error) {
    return NextResponse.json({
      authenticated: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
