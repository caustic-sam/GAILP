import { getSupabaseServer } from '../../lib/supabase/server';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getSupabaseServer();

  // ... rest of the code remains unchanged
  return (
    <div>
      {/* layout content */}
      {children}
    </div>
  );
}