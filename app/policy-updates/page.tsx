import { PageHero } from '@/components/PageHero';

export default function PolicyUpdatesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHero
        title="Policy Updates"
        subtitle="Latest policy updates and regulatory changes from around the world."
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            This page is under construction. Check back soon for comprehensive policy tracking and analysis
            covering digital governance, data protection, and regulatory developments worldwide.
          </p>
        </div>
      </div>
    </div>
  );
}
