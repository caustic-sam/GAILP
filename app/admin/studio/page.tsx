'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import {
  FileText,
  Image as ImageIcon,
  Layers,
  Plus,
  FolderOpen,
  Palette
} from 'lucide-react';

export default function StudioPage() {
  const sections = [
    {
      title: 'Publishing Desk',
      description: 'Create and manage articles, drafts, and scheduled posts',
      icon: FileText,
      color: 'blue',
      actions: [
        { label: 'New Article', href: '/admin/articles/new', icon: Plus },
        { label: 'View All Articles', href: '/admin', icon: FolderOpen }
      ]
    },
    {
      title: 'Media Vault',
      description: 'Upload and manage images, videos, and documents',
      icon: ImageIcon,
      color: 'orange',
      actions: [
        { label: 'Upload Media', href: '/admin/media/upload', icon: Plus },
        { label: 'Browse Library', href: '/admin/media', icon: FolderOpen }
      ]
    },
    {
      title: 'Component Gallery',
      description: 'Browse and manage reusable UI components',
      icon: Layers,
      color: 'purple',
      actions: [
        { label: 'New Component', href: '/components/new', icon: Plus },
        { label: 'View Gallery', href: '/components', icon: Palette }
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-100',
          icon: 'text-blue-600',
          button: 'bg-blue-600 hover:bg-blue-700'
        };
      case 'orange':
        return {
          bg: 'bg-orange-100',
          icon: 'text-orange-600',
          button: 'bg-orange-600 hover:bg-orange-700'
        };
      case 'purple':
        return {
          bg: 'bg-purple-100',
          icon: 'text-purple-600',
          button: 'bg-purple-600 hover:bg-purple-700'
        };
      default:
        return {
          bg: 'bg-gray-100',
          icon: 'text-gray-600',
          button: 'bg-gray-600 hover:bg-gray-700'
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f] border-b border-blue-900/20">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Studio</h1>
            <p className="text-xl text-blue-100">
              Your creative workspace for content, media, and components
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sections.map((section) => {
            const Icon = section.icon;
            const colors = getColorClasses(section.color);

            return (
              <Card key={section.title} className="overflow-hidden">
                <div className="p-8">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-lg ${colors.bg} flex items-center justify-center mb-6`}>
                    <Icon className={`w-8 h-8 ${colors.icon}`} />
                  </div>

                  {/* Title & Description */}
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    {section.title}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {section.description}
                  </p>

                  {/* Actions */}
                  <div className="space-y-3">
                    {section.actions.map((action) => {
                      const ActionIcon = action.icon;
                      return (
                        <Link
                          key={action.label}
                          href={action.href}
                          className={`flex items-center justify-center gap-2 w-full px-4 py-3 ${colors.button} text-white rounded-lg font-medium transition-colors`}
                        >
                          <ActionIcon className="w-5 h-5" />
                          <span>{action.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">12</div>
            <div className="text-sm text-gray-600">Published Articles</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">45</div>
            <div className="text-sm text-gray-600">Media Files</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">8</div>
            <div className="text-sm text-gray-600">Components</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">3</div>
            <div className="text-sm text-gray-600">Drafts</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
