'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Shield } from 'lucide-react';

interface BreachStat {
  label: string;
  value: string;
  trend: string;
  icon: React.ReactNode;
}

export function BreachCounter() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Rotating breach statistics (Family Feud style)
  const breachStats: BreachStat[] = [
    {
      label: 'Data Breaches in 2024',
      value: '3,842',
      trend: '+23% from 2023',
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />
    },
    {
      label: 'Records Exposed',
      value: '8.2B',
      trend: '+18% this year',
      icon: <TrendingUp className="w-5 h-5 text-orange-500" />
    },
    {
      label: 'Avg. Cost per Breach',
      value: '$4.45M',
      trend: '+15% annually',
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />
    },
    {
      label: 'Days to Identify',
      value: '277',
      trend: 'Average globally',
      icon: <Shield className="w-5 h-5 text-blue-500" />
    },
    {
      label: 'Ransomware Attacks',
      value: '493M',
      trend: '+37% increase',
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % breachStats.length);
        setIsAnimating(false);
      }, 300);
    }, 4000); // Rotate every 4 seconds

    return () => clearInterval(interval);
  }, [breachStats.length]);

  const currentStat = breachStats[currentIndex];

  return (
    <div className="p-6 bg-white/60 backdrop-blur-sm border border-white/40 shadow-lg rounded-xl max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Global Cyber Threats</h3>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-xs text-red-600 font-medium">LIVE</span>
        </div>
      </div>

      <div
        className={`transition-all duration-300 ${
          isAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
        }`}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="mt-1">
            {currentStat.icon}
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-600 mb-1">{currentStat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">{currentStat.value}</p>
            <p className="text-xs text-red-600 font-medium">{currentStat.trend}</p>
          </div>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        {breachStats.map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? 'w-6 bg-red-500'
                : 'w-1.5 bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-red-200">
        <p className="text-xs text-gray-500 text-center">
          Real-time cybersecurity statistics
        </p>
      </div>
    </div>
  );
}
