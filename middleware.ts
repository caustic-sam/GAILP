import { NextResponse } from 'next/server';

/**
 * No-op middleware
 * Auth is enforced via server-side layout in /admin (see app/admin/layout.tsx).
 * This avoids prerender/auth issues on the Edge and keeps deploys stable.
 */
export function middleware() {
  return NextResponse.next();
}

// Disable matchers; add paths back here if you later need middleware (e.g., logging).
export const config = { matcher: [] };
