'use client';

export const dynamic = 'force-dynamic';

export default function AdminSettingsPlaceholder() {
  return (
    <div className="min-h-[50vh] grid place-items-center p-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold">Admin Settings</h1>
        <p className="text-gray-600">
          This page requires authentication and will be enabled once AuthProvider
          wraps this route.
        </p>
      </div>
    </div>
  );
}