'use client';

import React from 'react';
import { ArrowRight, Video, Calendar, MessageSquare, Bell } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function VideosPage() {
  const upcomingFeatures = [
    {
      icon: Video,
      title: 'Live Policy Briefings',
      description: 'Real-time coverage of major policy announcements and regulatory updates'
    },
    {
      icon: Calendar,
      title: 'Expert Webinars',
      description: 'Regular sessions with policymakers, researchers, and industry leaders'
    },
    {
      icon: MessageSquare,
      title: 'Interactive Q&A',
      description: 'Ask questions and engage directly with experts during live sessions'
    },
    {
      icon: Bell,
      title: 'Event Notifications',
      description: 'Never miss important hearings, conferences, and policy discussions'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f] border-b border-blue-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Live Hub</h1>
              <p className="text-blue-200">Live coverage and video analysis</p>
            </div>
            <a
              href="/"
              className="text-blue-200 hover:text-white font-medium transition-colors"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-6">
            Coming Soon
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Watch Policy Unfold in Real Time
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Stream live coverage of policy events, watch expert analysis, and join interactive
            discussions as global digital policy evolves. Be the first to know when we go live.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" icon={<ArrowRight className="w-5 h-5" />}>
              Get Launch Notifications
            </Button>
            <Button variant="secondary" size="lg">
              Browse Sample Videos
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {upcomingFeatures.map((feature, idx) => (
            <Card key={idx} hover className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Video Preview Mockup */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Platform Preview</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((num) => (
              <Card key={num} hover className="overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                  <Video className="w-16 h-16 text-white opacity-50" />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                      LIVE
                    </span>
                    <span className="text-xs text-gray-500">2,847 watching</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Policy Briefing Example {num}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Expert analysis and live commentary
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Stay Connected</h3>
            <p className="text-gray-600 mb-6">
              Our Live Hub will feature daily streams, expert interviews, and breaking policy coverage.
              Subscribe now to get notified when we launch and receive exclusive early access.
            </p>
            <Button size="lg" variant="primary">
              Subscribe Now
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600">
            World Papers Live Hub - Coming Soon
          </p>
        </div>
      </div>
    </div>
  );
}
