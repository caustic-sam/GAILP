'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Home */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image
              src="/images/globes/Screenshot 2025-10-31 at 22.39.31.png"
              alt="GAILP Globe"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="text-xl font-bold text-gray-900">GAILP</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/') && !isAdminRoute
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Home
            </Link>
            <Link
              href="/articles"
              className={`text-sm font-medium transition-colors ${
                isActive('/articles')
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Articles
            </Link>
            <Link
              href="/policies"
              className={`text-sm font-medium transition-colors ${
                isActive('/policies')
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Policies
            </Link>
            <Link
              href="/glossary"
              className={`text-sm font-medium transition-colors ${
                isActive('/glossary')
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Glossary
            </Link>

            {/* Admin Link (if on admin routes) */}
            {isAdminRoute && (
              <>
                <div className="w-px h-6 bg-gray-300"></div>
                <Link
                  href="/admin"
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/admin'
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Dashboard
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
