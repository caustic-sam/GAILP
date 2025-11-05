// app/login/page.tsx — server component to unblock build
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <p className="text-sm text-gray-700 mb-4">
        This page is ready to be wired to your authentication provider. For now, use the sign-in link below.
      </p>
      <a
        href="/api/auth/start"
        className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Continue to Sign In →
      </a>
    </div>
  );
}