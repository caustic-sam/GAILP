'use client';

import React, { useState } from 'react';
import { PageHero } from '@/components/PageHero';
import { Card } from '@/components/ui/Card';
import { WorldClocks } from '@/components/WorldClocks';
import {
  Globe, ExternalLink, Search, Filter, TrendingUp,
  FileText, Shield, Brain, Fingerprint, Scale,
  ChevronRight, Clock, MapPin, Building2
} from 'lucide-react';

type PolicyCategory = 'all' | 'data-protection' | 'ai-governance' | 'digital-identity' | 'cybersecurity' | 'platform-regulation';

interface PolicySource {
  id: string;
  name: string;
  jurisdiction: string;
  flag: string;
  category: PolicyCategory[];
  description: string;
  url: string;
  updateFrequency: string;
  recentActivity: string;
  icon: any;
}

const policySources: PolicySource[] = [
  // European Union
  {
    id: 'eu-dpa',
    name: 'European Data Protection Board',
    jurisdiction: 'European Union',
    flag: '🇪🇺',
    category: ['data-protection'],
    description: 'GDPR implementation guidelines, decisions, and recommendations',
    url: 'https://edpb.europa.eu',
    updateFrequency: 'Weekly',
    recentActivity: '2 hours ago',
    icon: Shield
  },
  {
    id: 'eu-ai-act',
    name: 'EU AI Act Implementation',
    jurisdiction: 'European Union',
    flag: '🇪🇺',
    category: ['ai-governance'],
    description: 'Official EU Artificial Intelligence Act updates and compliance guidance',
    url: 'https://digital-strategy.ec.europa.eu/ai',
    updateFrequency: 'Daily',
    recentActivity: '5 hours ago',
    icon: Brain
  },
  {
    id: 'eu-dsa-dma',
    name: 'DSA/DMA Enforcement',
    jurisdiction: 'European Union',
    flag: '🇪🇺',
    category: ['platform-regulation'],
    description: 'Digital Services Act and Digital Markets Act implementation',
    url: 'https://digital-strategy.ec.europa.eu',
    updateFrequency: 'Daily',
    recentActivity: '1 day ago',
    icon: Scale
  },

  // United States
  {
    id: 'us-ftc',
    name: 'FTC Privacy & Data Security',
    jurisdiction: 'United States',
    flag: '🇺🇸',
    category: ['data-protection', 'cybersecurity'],
    description: 'Federal Trade Commission enforcement actions and guidance',
    url: 'https://www.ftc.gov/privacy-data-security',
    updateFrequency: 'Weekly',
    recentActivity: '3 hours ago',
    icon: Shield
  },
  {
    id: 'us-nist',
    name: 'NIST AI Risk Management',
    jurisdiction: 'United States',
    flag: '🇺🇸',
    category: ['ai-governance', 'cybersecurity'],
    description: 'AI Risk Management Framework and cybersecurity standards',
    url: 'https://www.nist.gov/ai',
    updateFrequency: 'Monthly',
    recentActivity: '2 days ago',
    icon: Brain
  },
  {
    id: 'us-cisa',
    name: 'CISA Cybersecurity Advisories',
    jurisdiction: 'United States',
    flag: '🇺🇸',
    category: ['cybersecurity'],
    description: 'Critical infrastructure protection and cyber threat intelligence',
    url: 'https://www.cisa.gov',
    updateFrequency: 'Daily',
    recentActivity: '4 hours ago',
    icon: Shield
  },

  // United Kingdom
  {
    id: 'uk-ico',
    name: 'UK Information Commissioner',
    jurisdiction: 'United Kingdom',
    flag: '🇬🇧',
    category: ['data-protection'],
    description: 'UK GDPR enforcement, guidance, and data protection updates',
    url: 'https://ico.org.uk',
    updateFrequency: 'Weekly',
    recentActivity: '1 day ago',
    icon: Shield
  },
  {
    id: 'uk-ai-regulation',
    name: 'UK AI Regulation',
    jurisdiction: 'United Kingdom',
    flag: '🇬🇧',
    category: ['ai-governance'],
    description: 'Pro-innovation AI regulatory framework updates',
    url: 'https://www.gov.uk/ai-regulation',
    updateFrequency: 'Monthly',
    recentActivity: '3 days ago',
    icon: Brain
  },

  // Canada
  {
    id: 'ca-privacy',
    name: 'Office of the Privacy Commissioner',
    jurisdiction: 'Canada',
    flag: '🇨🇦',
    category: ['data-protection'],
    description: 'PIPEDA enforcement and privacy law guidance',
    url: 'https://www.priv.gc.ca',
    updateFrequency: 'Weekly',
    recentActivity: '12 hours ago',
    icon: Shield
  },
  {
    id: 'ca-ai-data-act',
    name: 'Canadian AI & Data Act',
    jurisdiction: 'Canada',
    flag: '🇨🇦',
    category: ['ai-governance', 'data-protection'],
    description: 'Bill C-27 - AI and data protection legislation updates',
    url: 'https://www.parl.ca/legisinfo',
    updateFrequency: 'Monthly',
    recentActivity: '5 days ago',
    icon: Brain
  },

  // Australia
  {
    id: 'au-oaic',
    name: 'Australian Information Commissioner',
    jurisdiction: 'Australia',
    flag: '🇦🇺',
    category: ['data-protection'],
    description: 'Privacy Act enforcement and information access',
    url: 'https://www.oaic.gov.au',
    updateFrequency: 'Weekly',
    recentActivity: '8 hours ago',
    icon: Shield
  },

  // Singapore
  {
    id: 'sg-pdpc',
    name: 'Singapore PDPC',
    jurisdiction: 'Singapore',
    flag: '🇸🇬',
    category: ['data-protection', 'ai-governance'],
    description: 'Personal Data Protection Act and AI governance framework',
    url: 'https://www.pdpc.gov.sg',
    updateFrequency: 'Weekly',
    recentActivity: '6 hours ago',
    icon: Shield
  },

  // International Organizations
  {
    id: 'oecd-digital',
    name: 'OECD Digital Economy',
    jurisdiction: 'International',
    flag: '🌐',
    category: ['ai-governance', 'data-protection', 'platform-regulation'],
    description: 'International AI principles and digital policy frameworks',
    url: 'https://www.oecd.org/digital',
    updateFrequency: 'Monthly',
    recentActivity: '1 week ago',
    icon: Globe
  },
  {
    id: 'iso-standards',
    name: 'ISO/IEC Standards',
    jurisdiction: 'International',
    flag: '🌐',
    category: ['ai-governance', 'cybersecurity'],
    description: 'International standards for AI, privacy, and security',
    url: 'https://www.iso.org',
    updateFrequency: 'Quarterly',
    recentActivity: '2 weeks ago',
    icon: FileText
  }
];

const categories = [
  { id: 'all', label: 'All Sources', icon: Globe },
  { id: 'data-protection', label: 'Data Protection', icon: Shield },
  { id: 'ai-governance', label: 'AI Governance', icon: Brain },
  { id: 'digital-identity', label: 'Digital Identity', icon: Fingerprint },
  { id: 'cybersecurity', label: 'Cybersecurity', icon: Shield },
  { id: 'platform-regulation', label: 'Platform Regulation', icon: Scale }
] as const;

export default function PolicyUpdatesPage() {
  const [selectedCategory, setSelectedCategory] = useState<PolicyCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSources = policySources.filter(source => {
    const matchesCategory = selectedCategory === 'all' || source.category.includes(selectedCategory);
    const matchesSearch = searchQuery === '' ||
      source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.jurisdiction.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const stats = [
    { label: 'Active Sources', value: policySources.length.toString(), icon: Building2 },
    { label: 'Jurisdictions', value: new Set(policySources.map(s => s.jurisdiction)).size.toString(), icon: MapPin },
    { label: 'Updates Today', value: '12', icon: TrendingUp },
    { label: 'Live Tracking', value: 'Real-time', icon: Clock }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHero
        title="Global Policy Intelligence"
        subtitle="Real-time tracking of regulatory developments across digital governance, AI, data protection, and cybersecurity."
      />

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            {/* Search and Filter */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by source, jurisdiction, or topic..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Filter button (mobile) */}
                <button className="md:hidden flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter className="w-5 h-5" />
                  <span className="font-medium">Filter</span>
                </button>
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id as PolicyCategory)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{cat.label}</span>
                      {isActive && (
                        <span className="ml-1 px-2 py-0.5 bg-white/20 rounded text-xs">
                          {filteredSources.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Policy Sources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredSources.map((source) => {
                const Icon = source.icon;
                return (
                  <a
                    key={source.id}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <Card hover className="p-6 h-full flex flex-col hover:shadow-xl transition-all duration-300 hover:border-blue-300">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-3xl shadow-sm border border-gray-200 group-hover:scale-110 group-hover:shadow-md transition-all">
                            {source.flag}
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-500 mb-1">{source.jurisdiction}</div>
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                              <Icon className="w-5 h-5 text-blue-600" />
                            </div>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {source.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {source.description}
                        </p>

                        {/* Category Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {source.category.map((cat) => (
                            <span
                              key={cat}
                              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded"
                            >
                              {categories.find(c => c.id === cat)?.label}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{source.recentActivity}</span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-600 font-medium text-sm group-hover:gap-2 transition-all">
                          <span>Visit Source</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </Card>
                  </a>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredSources.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No sources found</h3>
                <p className="text-gray-600">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}

            {/* Bottom CTA */}
            <div className="mt-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-2">Need a Custom Source?</h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                We continuously monitor regulatory developments worldwide. Contact us to add specific sources or jurisdictions to your tracking dashboard.
              </p>
              <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                Request Custom Source
              </button>
            </div>
          </div>

          {/* Sidebar - World Clocks */}
          <div className="lg:col-span-3">
            <div className="lg:sticky lg:top-24">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900">Global Policy Time</h3>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  Track policy updates across major jurisdictions in real-time
                </p>
                <WorldClocks />
              </Card>

              {/* Quick Stats Card */}
              <Card className="p-6 mt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">This Week</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">New Updates</span>
                    <span className="text-2xl font-bold text-blue-600">47</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Policies</span>
                    <span className="text-2xl font-bold text-green-600">156</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">In Review</span>
                    <span className="text-2xl font-bold text-yellow-600">23</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
