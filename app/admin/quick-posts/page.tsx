'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Rocket } from 'lucide-react';

export default function AdminQuickPostsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to admin dashboard after showing message
    const timer = setTimeout(() => {
      router.push('/admin');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-12 text-center">
        <div className="mb-6 inline-block p-4 bg-blue-100 rounded-full">
          <Rocket className="w-12 h-12 text-blue-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Coming Soon!
        </h1>

        <p className="text-lg text-gray-600 mb-6">
          Quick Posts management is a planned feature for V1.1.
        </p>

        <p className="text-sm text-gray-500">
          Redirecting you to the admin dashboard...
        </p>
      </Card>
    </div>
  );
}
