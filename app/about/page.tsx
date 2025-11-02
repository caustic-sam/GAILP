export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About World Papers</h1>
        <p className="text-lg text-gray-600 mb-6">
          Your trusted source for global digital policy analysis and insights.
        </p>

        <div className="prose prose-lg">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Mission</h2>
          <p className="text-gray-600 mb-4">
            World Papers provides comprehensive coverage and expert analysis of digital policy developments worldwide.
            We help policymakers, legal professionals, and business leaders navigate the complex landscape of digital governance.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">What We Do</h2>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Track and analyze digital policy developments globally</li>
            <li>Provide expert commentary and insights</li>
            <li>Offer policy templates and frameworks</li>
            <li>Connect policy professionals worldwide</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Contact Us</h2>
          <p className="text-gray-600">
            For inquiries, please reach out to us at{' '}
            <a href="mailto:contact@worldpapers.com" className="text-blue-600 hover:text-blue-700">
              contact@worldpapers.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
