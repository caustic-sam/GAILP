'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, Menu, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const navItems = [
  { id: 'home', label: 'Policy Updates', href: '/policy-updates' },
  { id: 'analysis', label: 'Expert Blog', href: '/blog' },
  { id: 'videos', label: 'Live Hub', href: '/videos' },
  { id: 'policies', label: 'Research', href: '/policies' },
  { id: 'components', label: 'Components', href: '/components' },
  { id: 'about', label: 'About', href: '/about' }
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f] border-b border-blue-900/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-left">
              <div className="text-white font-bold text-base leading-tight">World Papers</div>
              <div className="text-blue-200 text-xs">Global Policy Analysis</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'text-white bg-white/10'
                    : 'text-blue-100 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/admin/studio"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-blue-100 hover:text-white hover:bg-white/10"
            >
              <Settings className="w-4 h-4" />
              <span>Studio</span>
            </Link>
            <Button variant="primary" size="sm">Subscribe</Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-blue-900/20 bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8f]">
          <div className="px-6 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'text-white bg-white/10'
                    : 'text-blue-100 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/admin/studio"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-blue-100 hover:text-white hover:bg-white/10"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Settings className="w-4 h-4" />
              <span>Studio</span>
            </Link>
            <div className="pt-2">
              <Button variant="primary" size="sm" className="w-full">Subscribe</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
