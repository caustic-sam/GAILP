import React from 'react';
import Link from 'next/link';

export default function PolicyPulsePage() {
  return (
    <main className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Policy Pulse</h1>
      <p className="mb-4 text-gray-700">Global policy pulse updates, inspired by <Link href="http://malsicario.duckdns.org:8082/i/?a=global&rid=690833c97590d" target="_blank" className="text-blue-600 underline">this feed</Link>.</p>
      {/* Example content, replace with live data integration as needed */}
      <section className="space-y-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold">EU AI Act</h2>
          <p className="text-gray-600">New compliance requirements for large online platforms under Europe&apos;s largest digital regulation.</p>
          <span className="text-xs text-gray-400">3 hours ago • Regulation</span>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold">Singapore Digital Identity Framework Update</h2>
          <p className="text-gray-600">Proposed amendments to enhance cross-border digital identity verification systems.</p>
          <span className="text-xs text-gray-400">5 hours ago • Digital ID</span>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold">UK State Pension Laws Harmonization</h2>
          <p className="text-gray-600">Multi-state initiative to align data protection standards across gains momentum.</p>
          <span className="text-xs text-gray-400">8 hours ago • Privacy</span>
        </div>
      </section>
    </main>
  );
}
