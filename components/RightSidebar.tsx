'use client';

import React from 'react';
import Link from 'next/link';
import { Home, FileText, Users, BookOpen, Mail, LayoutDashboard, Image, Settings, Edit3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { WorldClocks } from '@/components/WorldClocks';

type NavItem = { label: string; href: string; icon: React.ElementType };

const publicNavItems: NavItem[] = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Policy Updates', href: '/policy-updates', icon: FileText },
  { label: 'Blog', href: '/blog', icon: FileText },
  { label: 'Policy Pulse', href: '/policy-pulse', icon: BookOpen },
  { label: 'Articles', href: '/articles', icon: FileText },
  { label: 'Policies', href: '/policies', icon: BookOpen },
  { label: 'Videos', href: '/videos', icon: BookOpen },
  { label: 'About', href: '/about', icon: Users },
  { label: 'Contact', href: '/contact', icon: Mail },
];

const adminNavItems: NavItem[] = [
  { label: 'Content Manager', href: '/admin', icon: LayoutDashboard },
  { label: 'New Article', href: '/admin/articles/new', icon: Edit3 },
  { label: 'Media Studio', href: '/admin/media', icon: Image },
  { label: 'Publishing Studio', href: '/admin/studio', icon: FileText },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

// Named export expected by: import { RightSidebar } from '@/components/RightSidebar'
export function RightSidebar() {
  const { user } = useAuth();
  const isAdmin = user && ['admin', 'publisher', 'contributor'].includes(user.role);

  return (
    <aside className="hidden lg:block fixed right-0 top-12 h-[calc(100vh-3rem)] w-12 hover:w-56 overflow-y-auto bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f] border-l border-blue-900/20 z-40 transition-all duration-300 group">
      <nav className="p-2 pt-4">
        {/* Admin Section */}
        {isAdmin && (
          <>
            <h3 className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-3 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap overflow-hidden">
              Admin
            </h3>
            <ul className="space-y-1 mb-6">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2 px-2 py-2 text-sm font-medium text-yellow-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors overflow-hidden"
                      title={item.label}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {/* Public Navigation */}
        <h3 className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-3 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap overflow-hidden">
          Quick Nav
        </h3>
        <ul className="space-y-1">
          {publicNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="flex items-center gap-2 px-2 py-2 text-sm font-medium text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors overflow-hidden"
                  title={item.label}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* World Clocks */}
        <div className="mt-8 pt-6 border-t border-blue-800/30">
          <h3 className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-3 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap overflow-hidden">
            World Time
          </h3>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <WorldClocks />
          </div>
        </div>
      </nav>
    </aside>
  );
}
