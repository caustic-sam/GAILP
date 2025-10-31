'use client';

import React, { useState } from 'react';
import { 
  Globe, Mail, Twitter, Linkedin, Rss, ArrowRight, 
  MessageCircle, Clock, Heart, Play, Send, 
  ThumbsUp, Menu, X, FileStack, BarChart3, Network 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { StatusDot } from '@/components/ui/StatusDot';
import { mockPolicies, mockArticles, mockThoughts, mockVideos, quickStats } from '@/lib/mockData';
import { TermOfDay } from '@/components/widgets/TermOfDay';
import { NISTAssistant } from '@/components/widgets/NISTAssistant';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Policy Updates', href: '/' },
    { id: 'analysis', label: 'Expert Blog', href: '#' },
    { id: 'videos', label: 'Live Hub', href: '#' },
    { id: 'policies', label: 'Research', href: '#' },
    { id: 'components', label: 'Components', href: '/components' },
    { id: 'about', label: 'About', href: '#' }
  ];

  const resourceCards = [
    {
      icon: FileStack,
      title: "Policy Templates",
      subtitle: "Policy Templates",
      description: "Ready-to-use frameworks for digital governance, privacy impact assessments, and compliance audits.",
      link: "Explore Templates"
    },
    {
      icon: BarChart3,
      title: "Research Reports",
      subtitle: "Research Reports",
      description: "In-depth analysis of global policy trends, comparative studies, and impact assessments.",
      link: "Access Reports"
    },
    {
      icon: Network,
      title: "Expert Network",
      subtitle: "Expert Network",
      description: "Connect with policy experts, legal professionals, and government officials worldwide.",
      link: "Join Network"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f] border-b border-blue-900/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="text-white font-bold text-base leading-tight">World Papers</div>
                <div className="text-blue-200 text-xs">Global Policy Analysis</div>
              </div>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors text-blue-100 hover:text-white hover:bg-white/5"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* CTA Button */}
            <div className="hidden md:block">
              <Button variant="primary" size="sm">Subscribe</Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Nav */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 space-y-1 border-t border-white/10">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className="block w-full px-4 py-2 rounded-lg text-left text-sm font-medium transition-colors text-blue-100 hover:text-white hover:bg-white/5"
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-2">
                <Button variant="primary" size="sm" className="w-full">Subscribe</Button>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8f] text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight bg-gradient-to-r from-gray-100 via-gray-50 to-gray-200 bg-clip-text text-transparent drop-shadow-sm">
            Navigate the Future of<br />Digital Policy
          </h1>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl">
            Your trusted source for comprehensive analysis, expert insights, and real-time updates on global digital governance, data protection, and identity policies.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" variant="primary">Explore Insights</Button>
            <Button size="lg" variant="secondary">Join Community</Button>
          </div>
        </div>
      </section>

      {/* Main Content - Three Column Layout */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column - Policy Intelligence Feed */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Policy Intelligence Feed</h2>
                <button className="text-blue-600 text-sm font-medium hover:text-blue-700">View All</button>
              </div>
              <p className="text-sm text-gray-600 mb-4">Latest updates from global regulatory bodies</p>
              
              {/* Filter Tabs */}
              <div className="flex gap-2 mb-4 border-b border-gray-200">
                {['All Updates', 'Data', 'Digital ID'].map((tab, idx) => (
                  <button
                    key={tab}
                    className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                      idx === 0 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {mockPolicies.map(policy => (
                <Card key={policy.id} hover className="p-4">
                  <div className="flex items-start gap-3">
                    <StatusDot status={policy.status} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 hover:text-blue-600 cursor-pointer">
                        {policy.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {policy.summary}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{policy.date}</span>
                        <span>•</span>
                        <span>{policy.category}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {policy.comments}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <button className="w-full mt-6 text-center text-blue-600 font-medium text-sm py-2 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2">
              View All Updates <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Insights */}
            <div className="mt-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Insights</h3>
              <div className="space-y-3">
                {quickStats.map((stat, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">{stat.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">{stat.value}</span>
                      {stat.trend !== 'active' && (
                        <span className="text-xs text-green-600 font-medium">{stat.trend}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Chat Preview */}
            <Card className="p-5 mt-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Community Chat</h3>
                  <p className="text-xs text-gray-600">23 online</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar size="sm">PE</Avatar>
                    <span className="font-semibold text-gray-900">PolicyExpert_EU</span>
                    <span className="text-gray-500">3m</span>
                  </div>
                  <p className="text-gray-700 ml-8">Has anyone analyzed the impact of the new UK data transparency directive?</p>
                </div>

                <div className="text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar size="sm">DA</Avatar>
                    <span className="font-semibold text-gray-900">DataPolicy_Analyst</span>
                    <span className="text-gray-500">1m</span>
                  </div>
                  <p className="text-gray-700 ml-8">Working on a comprehensive analysis. Should be published next week!</p>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Join the discussion..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </Card>
          </div>

          {/* Center Column - Expert Analysis */}
          <div className="lg:col-span-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Expert Analysis</h2>
                <button className="text-blue-600 text-sm font-medium hover:text-blue-700">View All Posts</button>
              </div>
            </div>

            <div className="space-y-6">
              {mockArticles.map((article, idx) => (
                <Card key={article.id} hover className="overflow-hidden">
                  <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm">
                    Article Image Placeholder
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar size="md">{article.author.avatar}</Avatar>
                      <div>
                        <div className="font-semibold text-sm text-gray-900">{article.author.name}</div>
                        <div className="text-xs text-gray-500">{article.author.title}</div>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                      {article.title}
                    </h3>

                    {idx === 0 && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                        {article.summary}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.readTime}
                        </span>
                        <span>{article.date}</span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                          {article.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {article.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {article.comments}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Video Insights */}
            <Card className="p-5 mt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Video Insights</h3>
              <p className="text-sm text-gray-600 mb-4">Expert video commentary</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockVideos.map(video => (
                  <div key={video.id} className="group cursor-pointer">
                    <div className="relative rounded-lg overflow-hidden mb-2 bg-gradient-to-br from-blue-600 to-blue-800 h-36 flex items-center justify-center">
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                          <Play className="w-6 h-6 text-blue-600 ml-1" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 rounded text-white text-xs font-medium">
                        {video.duration}
                      </div>
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-1 group-hover:text-blue-600">
                      {video.title}
                    </h4>
                    <p className="text-xs text-gray-600 mb-1">{video.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{video.views}</span>
                      <span>•</span>
                      <span>{video.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* NIST Assistant */}
            <div className="mt-6">
              <NISTAssistant />
            </div>
          </div>

          {/* Right Column - Policy Pulse, Videos, Community */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Policy Pulse */}
            <Card className="p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Policy Pulse</h3>
              <p className="text-sm text-gray-600 mb-4">Quick insights and observations</p>
              
              <div className="space-y-4">
                {mockThoughts.map(thought => (
                  <div key={thought.id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex items-start gap-2 mb-2">
                      <Avatar size="sm">{thought.author.avatar}</Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-900">{thought.author.name}</span>
                          <span className="text-xs text-gray-500">{thought.time}</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {thought.content}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <button className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            Like
                          </button>
                          <button className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 text-center text-blue-600 font-medium text-sm py-2 hover:bg-blue-50 rounded-lg transition-colors">
                Share a quick policy insight...
              </button>
            </Card>

            {/* Term of the Day */}
            <TermOfDay />

            {/* NIST Assistant */}
            <NISTAssistant />
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <section className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8f] text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Mail className="w-12 h-12 mx-auto mb-4 text-blue-200" />
          <h2 className="text-3xl font-bold mb-3">Get weekly insights, analysis, and updates delivered to your inbox</h2>
          <p className="text-blue-100 mb-8">Join 15,000+ policy professionals worldwide</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-5 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <Button variant="primary" size="lg">Subscribe</Button>
          </div>
        </div>
      </section>

      {/* Resource Library */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Policy Resource Library</h2>
            <p className="text-gray-600">Comprehensive collection of frameworks, templates, and research tools for policy professionals</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {resourceCards.map((resource, idx) => (
              <Card key={idx} className="p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <resource.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{resource.title}</h3>
                <h4 className="text-sm font-semibold text-blue-600 mb-3">{resource.subtitle}</h4>
                <p className="text-sm text-gray-600 mb-6">{resource.description}</p>
                <button className="text-blue-600 font-medium text-sm hover:text-blue-700 inline-flex items-center gap-2">
                  {resource.link} <ArrowRight className="w-4 h-4" />
                </button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a2332] text-gray-300 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold">World Papers</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Your trusted source for comprehensive digital policy intelligence, expert analysis, and professional insights.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-3">Platform</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Policy Updates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Expert Analysis</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Live Hub</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Resources Library</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-3">Research</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Policy Database</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Digital Identity</a></li>
                <li><a href="#" className="hover:text-white transition-colors">AI Governance</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cross-Border Data</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-3">Connect</h3>
              <ul className="space-y-2 text-sm mb-4">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Newsletter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
              <div className="flex gap-3">
                <a href="#" className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                  <Rss className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <div>© 2024 World Papers. All rights reserved.</div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Cookie Settings</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}