'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function AuthTestPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Auth Status Test</h1>

      {user ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-lg font-bold text-green-900 mb-2">✅ Authenticated</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>ID:</strong> {user.id}</p>
          </div>
          <a
            href="/admin"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Admin →
          </a>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-bold text-red-900 mb-2">❌ Not Authenticated</h2>
          <p className="text-sm text-red-700 mb-4">
            You need to log in first.
          </p>
          <a
            href="/login?redirectTo=/auth-test"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Login →
          </a>
        </div>
      )}
    </div>
  );
}
