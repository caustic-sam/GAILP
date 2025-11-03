/* eslint-disable @next/next/no-img-element */


import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { RightSidebar } from '@/components/RightSidebar';
import { getFreshRSSClient, FreshRSSClient, FreshRSSItem } from '@/lib/freshrss';


export default async function PolicyPulsePage() {
  const client = getFreshRSSClient();
  let items: FreshRSSItem[] = [];
  if (client) {
    items = await client.getItems({ count: 20, excludeRead: false });
  }
  // --- Scarecrow categorization logic ---
  const CATEGORIES = [
    { key: 'identity', title: 'Digital Identity, Credentials, and Public Response' },
    { key: 'standards', title: 'Foundational Standards and Frameworks' },
    { key: 'cyber', title: 'Global Cyber Agencies' },
    { key: 'legislation', title: 'Global Legislative Tracking Analysis' },
    { key: 'legal', title: 'US Enforcement and Global Legal Analysis' },
    { key: 'civil', title: 'Civil Society & Industry Orgs' },
  ];

  function categorizeItem(item: FreshRSSItem): string | null {
    const title = item.title?.toLowerCase() || '';
    if (title.includes('identity') || title.includes('biometric')) return 'identity';
    if (title.includes('standard') || title.includes('governance') || title.includes('iso')) return 'standards';
    if (title.includes('cyber') || title.includes('ncsc') || title.includes('threat')) return 'cyber';
    if (title.includes('policy') || title.includes('regulation') || title.includes('tracker') || title.includes('freedom')) return 'legislation';
    if (title.includes('privacy') || title.includes('legal') || title.includes('court') || title.includes('compliance') || title.includes('data')) return 'legal';
    if (title.includes('society') || title.includes('org') || title.includes('foundation') || title.includes('edri') || title.includes('epic') || title.includes('noyb')) return 'civil';
    return null;
  }

  // Group items by category
  const grouped: Record<string, FreshRSSItem[]> = {
    identity: [],
    standards: [],
    cyber: [],
    legislation: [],
    legal: [],
    civil: [],
  };
    // Filter items to last 10 days and group
    const now = new Date();
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    items.forEach((item: FreshRSSItem) => {
      const cat = categorizeItem(item);
      // Use published date for filtering
      const published = item.published ? new Date(item.published) : null;
      if (cat && grouped[cat] && published && published >= tenDaysAgo) {
        grouped[cat].push(item);
      }
    });

  return (
    <>
      <Header />
      <div className="flex">
        <div className="flex-1">
          <main className="max-w-7xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-6">Policy Pulse</h1>
            {/* Jurisdiction image links */}
            <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
              <a href="#" className="flex-1 min-w-[120px] flex flex-col items-center p-2" title="US Legislation">
                <img src="/images/flags/us.png" alt="US Flag" className="w-16 h-16 object-contain mb-2 rounded shadow" />
                <span className="text-xs text-blue-900 font-semibold">US Legislation</span>
              </a>
              <a href="#" className="flex-1 min-w-[120px] flex flex-col items-center p-2" title="UK Legislation">
                <img src="/images/flags/uk.png" alt="UK Flag" className="w-16 h-16 object-contain mb-2 rounded shadow" />
                <span className="text-xs text-blue-900 font-semibold">UK Legislation</span>
              </a>
              <a href="#" className="flex-1 min-w-[120px] flex flex-col items-center p-2" title="EU Legislation">
                <img src="/images/flags/eu.png" alt="EU Flag" className="w-16 h-16 object-contain mb-2 rounded shadow" />
                <span className="text-xs text-blue-900 font-semibold">EU Legislation</span>
              </a>
              <a href="#" className="flex-1 min-w-[120px] flex flex-col items-center p-2" title="AU Legislation">
                <img src="/images/flags/au.png" alt="AU Flag" className="w-16 h-16 object-contain mb-2 rounded shadow" />
                <span className="text-xs text-blue-900 font-semibold">AU Legislation</span>
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CATEGORIES.map((cat) => {
                const headlines = grouped[cat.key];
                return (
                  <section
                    key={cat.key}
                    className="rounded-xl border border-blue-300 bg-blue-50/40 shadow-md p-5 transition hover:shadow-lg"
                  >
                    <h2 className="text-lg font-bold mb-3 text-blue-900">{cat.title}</h2>
                    {headlines.length === 0 ? (
                      <div className="text-gray-400 text-sm">No headlines available.</div>
                    ) : (
                      <>
                        <ul className="space-y-2">
                          {headlines.slice(0, 3).map((item: FreshRSSItem, idx: number) => {
                            const transformed = FreshRSSClient.transformItem(item);
                            // Infer nationality from feedName or title
                            const titleLower = transformed.title.toLowerCase();
                            const feedLower = (transformed.feedName || '').toLowerCase();
                            let flag = '';
                            if (titleLower.includes('uk') || feedLower.includes('uk') || titleLower.includes('britain') || feedLower.includes('britain')) flag = '🇬🇧';
                            else if (titleLower.includes('eu') || feedLower.includes('eu') || titleLower.includes('europe') || feedLower.includes('europe')) flag = '🇪🇺';
                            else if (titleLower.includes('australia') || feedLower.includes('australia') || titleLower.includes('au ') || feedLower.includes('au ')) flag = '🇦🇺';
                            else if (titleLower.includes('canada') || feedLower.includes('canada')) flag = '🇨🇦';
                            else if (titleLower.includes('india') || feedLower.includes('india')) flag = '🇮🇳';
                            else if (titleLower.includes('china') || feedLower.includes('china')) flag = '🇨🇳';
                            else if (titleLower.includes('japan') || feedLower.includes('japan')) flag = '🇯🇵';
                            else if (titleLower.includes('germany') || feedLower.includes('germany')) flag = '🇩🇪';
                            else if (titleLower.includes('france') || feedLower.includes('france')) flag = '🇫🇷';
                            // Default: US only if not matched
                            // Only show flag if not US
                            if (!flag && (titleLower.includes('us') || feedLower.includes('us') || titleLower.includes('america') || feedLower.includes('america'))) flag = '';
                            return (
                              <li key={idx}>
                                <Link href={transformed.link || '#'} target="_blank" className="text-blue-700 hover:underline font-medium">
                                  {flag && <span className="mr-1">{flag}</span>}
                                  {transformed.title}
                                </Link>
                                <span className="block text-xs text-gray-500">{transformed.feedName} • {transformed.publishedAt ? transformed.publishedAt.toLocaleDateString() : ''}</span>
                              </li>
                            );
                          })}
                        </ul>
                        {headlines.length < 3 && (
                          <div className="text-gray-400 text-xs mt-2">More coming soon</div>
                        )}
                      </>
                    )}
                  </section>
                );
              })}
            </div>
          </main>
          <footer className="w-full mt-10 py-6 border-t border-blue-100 text-center text-xs text-blue-900 bg-blue-50/30">
            &copy; {new Date().getFullYear()} GAILP. All rights reserved.
          </footer>
        </div>
        <RightSidebar />
      </div>
    </>
  );
}
