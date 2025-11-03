import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected routes
  const protectedRoutes = ['/admin', '/studio'];
  const isProtectedRoute = protectedRoutes.some(route =>
    req.nextUrl.pathname.startsWith(route)
  );

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !session) {
    const redirectPath = `${req.nextUrl.pathname}${req.nextUrl.search}` || '/admin';
    const loginUrl = new URL('/login', req.url);
    const safeRedirect =
      redirectPath.startsWith('/') && !redirectPath.startsWith('//') ? redirectPath : '/admin';
    loginUrl.searchParams.set('redirectTo', safeRedirect);
    return NextResponse.redirect(loginUrl);
  }

  // Check user role for admin routes
  if (req.nextUrl.pathname.startsWith('/admin') && session) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    // Require admin or editor role
    if (profile && !['admin', 'editor'].includes(profile.role)) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/studio/:path*'],
};
