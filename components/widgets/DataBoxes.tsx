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
  trend?: string;
}

const defaultFeeds: DataFeed[] = [
  {
    title: 'Policy Updates',
    value: '247',
    subtitle: 'Global regulations tracked',
    icon: Scale,
    color: 'text-blue-400'
  },
  {
    title: 'Countries Monitored',
    value: '89',
    subtitle: 'Active jurisdictions',
    icon: Globe,
    color: 'text-purple-400'
  },
  {
    title: 'Expert Contributors',
    value: '156',
    subtitle: 'Publishing insights',
    icon: TrendingUp,
    color: 'text-green-400'
  }
];

export function DataBoxes() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dataFeeds, setDataFeeds] = useState<DataFeed[]>(defaultFeeds);
  const [loading, setLoading] = useState(true);

  // Fetch real stats from API
  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();

        if (data.stats && data.stats.length >= 3) {
          const newFeeds: DataFeed[] = [
            {
              title: data.stats[0].label || 'Policy Updates',
              value: data.stats[0].value || '0',
              subtitle: 'Global regulations tracked',
              icon: Scale,
              color: 'text-blue-400',
              trend: data.stats[0].trend
            },
            {
              title: data.stats[1].label || 'Countries Monitored',
              value: data.stats[1].value || '0',
              subtitle: 'Active jurisdictions',
              icon: Globe,
              color: 'text-purple-400',
              trend: data.stats[1].trend
            },
            {
              title: data.stats[2].label || 'Expert Contributors',
              value: data.stats[2].value || '0',
              subtitle: 'Publishing insights',
              icon: TrendingUp,
              color: 'text-green-400',
              trend: data.stats[2].trend
            }
          ];
          setDataFeeds(newFeeds);
        }
      } catch (error) {
        console.error('Error fetching stats for DataBoxes:', error);
        // Keep default feeds on error
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // Rotation animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % dataFeeds.length);
    }, 4000); // Rotate every 4 seconds

    return () => clearInterval(interval);
  }, [dataFeeds.length]);

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
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold text-white mb-1">{feed.value}</div>
                {feed.trend && feed.trend !== '+0' && feed.trend !== '0' && (
                  <div className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                    feed.trend.startsWith('+') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                  }`}>
                    {feed.trend}
                  </div>
                )}
              </div>
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
