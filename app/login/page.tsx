// app/login/page.tsx
import { redirect } from 'next/navigation';
import { getSupabaseServer } from '../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const supabase = await getSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();
  if (session) redirect('/admin');

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const redirectTo = `${origin}/auth/callback`;

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <div className="space-x-2">
        <a className="px-4 py-2 border rounded" href={`/api/auth/oauth?provider=github&redirectTo=${encodeURIComponent(redirectTo)}`}>Sign in with GitHub</a>
        <a className="px-4 py-2 border rounded" href={`/api/auth/oauth?provider=google&redirectTo=${encodeURIComponent(redirectTo)}`}>Sign in with Google</a>
      </div>
    </div>
  );
}