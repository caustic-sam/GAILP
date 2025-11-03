'use client';

import React from 'react';
import { Home, FileText, Users, BookOpen, Mail } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Articles', href: '/articles', icon: FileText },
  { label: 'Policies', href: '/policies', icon: BookOpen },
  { label: 'Glossary', href: '/glossary', icon: BookOpen },
  { label: 'About', href: '/about', icon: Users },
  { label: 'Contact', href: '/contact', icon: Mail }
];

export function RightSidebar() {
  return (
    <aside className="hidden xl:block fixed right-0 top-0 w-12 hover:w-48 h-screen overflow-y-auto bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f] border-l border-blue-900/20 z-40 transition-all duration-300 group">
      <nav className="p-2 pt-20">
        <h3 className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-3 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap overflow-hidden">
          Quick Nav
        </h3>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="flex items-center gap-2 px-2 py-2 text-sm font-medium text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors overflow-hidden"
                  title={item.label}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{item.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
