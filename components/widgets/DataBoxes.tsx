'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Globe, Scale, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface DataFeed {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
}

const dataFeeds: DataFeed[] = [
  {
    title: 'Policy Updates',
    value: '247',
    subtitle: 'Global regulations tracked',
    icon: Scale,
    color: 'text-blue-400'
  },
  {
    title: 'AI Headlines',
    value: '89',
    subtitle: 'Stories this week',
    icon: TrendingUp,
    color: 'text-green-400'
  },
  {
    title: 'Tech Law',
    value: '156',
    subtitle: 'Active jurisdictions',
    icon: Globe,
    color: 'text-purple-400'
  }
];

export function DataBoxes() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % dataFeeds.length);
    }, 4000); // Rotate every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4">
      {dataFeeds.map((feed, index) => {
        const Icon = feed.icon;
        const isActive = index === currentIndex;

        return (
          <Card
            key={index}
            className={`p-6 bg-white/10 backdrop-blur-sm border-white/20 transition-all duration-500 ${
              isActive ? 'ring-2 ring-white/50 scale-105' : 'opacity-70'
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <Icon className={`w-8 h-8 mb-3 ${feed.color}`} />
              <div className="text-3xl font-bold text-white mb-1">{feed.value}</div>
              <div className="text-sm font-semibold text-blue-100 mb-1">{feed.title}</div>
              <div className="text-xs text-blue-200">{feed.subtitle}</div>
              {isActive && (
                <div className="mt-3 flex items-center gap-1 text-xs text-white font-medium">
                  <span>View More</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
