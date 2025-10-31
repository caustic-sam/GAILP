export const mockPolicies = [
  {
    id: 1,
    title: "EU AI Act",
    summary: "New compliance requirements for large online platforms under Europe's largest digital regulation.",
    jurisdiction: { region: "EU", country: "European Union" },
    status: "in_force" as const,
    date: "3 hours ago",
    category: "Regulation",
    comments: 45
  },
  {
    id: 2,
    title: "Singapore Digital Identity Framework Update",
    summary: "Proposed amendments to enhance cross-border digital identity verification systems.",
    jurisdiction: { region: "APAC", country: "Singapore" },
    status: "draft" as const,
    date: "5 hours ago",
    category: "Digital ID",
    comments: 28
  },
  {
    id: 3,
    title: "UK State Pension Laws Harmonization",
    summary: "Multi-state initiative to align data protection standards across gains momentum.",
    jurisdiction: { region: "UK", country: "United Kingdom" },
    status: "adopted" as const,
    date: "8 hours ago",
    category: "Privacy",
    comments: 52
  },
  {
    id: 4,
    title: "African Union Digital Transformation Strategy",
    summary: "Comprehensive framework for digital economy and data localization policies announced.",
    jurisdiction: { region: "Africa", country: "African Union" },
    status: "draft" as const,
    date: "1 day ago",
    category: "Strategy",
    comments: 19
  }
];

export const mockArticles = [
  {
    id: 1,
    title: "The Convergence of AI Governance and Data Protection: A Global Perspective",
    summary: "As artificial intelligence continues its evolution worldwide, policymakers are grappling with how to balance innovation with robust data protection frameworks. This analysis explores how different jurisdictions are approaching this complex challenge and what it means for global digital policy trends.",
    author: { name: "Dr. Sarah Chen", avatar: "SC", title: "Senior Policy Analyst" },
    date: "Nov 15, 2024",
    readTime: "12 min read",
    image: "/api/placeholder/400/250",
    likes: 24,
    comments: 8,
    category: "AI Policy"
  },
  {
    id: 2,
    title: "Digital Identity Standards: Lessons from Estonia's Roadmap Program",
    summary: "Estonia's pioneering approach to digital identity frameworks is influencing global standards development.",
    author: { name: "Prof. Michael Rodriguez", avatar: "MR", title: "Digital Identity Expert" },
    date: "Nov 12, 2024",
    readTime: "8 min read",
    image: "/api/placeholder/400/250",
    likes: 31,
    comments: 12,
    category: "Digital ID"
  },
  {
    id: 3,
    title: "Cross-Border Data Flows: Navigating the Regulatory Landscape",
    summary: "How emerging data localization requirements are reshaping international digital commerce.",
    author: { name: "Dr. Amara Okonkwo", avatar: "AO", title: "Data Governance Lead" },
    date: "Nov 10, 2024",
    readTime: "10 min read",
    image: "/api/placeholder/400/250",
    likes: 18,
    comments: 5,
    category: "Data Protection"
  }
];

export const mockThoughts = [
  {
    id: 1,
    author: { name: "Alex", avatar: "A" },
    time: "2h",
    content: "Interesting development: Nigeria's DPC just published guidance on AI systems. Could this be a template for other African nations?"
  },
  {
    id: 2,
    author: { name: "DataPolicy_EU", avatar: "D" },
    time: "4h",
    content: "The new EU adequacy decision for Japan has major implications for cross-border AI development. Detailed analysis coming soon."
  },
  {
    id: 3,
    author: { name: "TechPolicy_Asia", avatar: "T" },
    time: "5h",
    content: "Breaking: Singapore just announced comprehensive revisions to its AI governance framework. We're seeing unprecedented regulatory pace in 2 years for traditional tech policy."
  }
];

export const mockVideos = [
  {
    id: 1,
    title: "Weekly Policy Roundup",
    description: "Key developments in global digital policy this week",
    duration: "18:24",
    views: "12k views",
    date: "Nov 12",
    thumbnail: "/api/placeholder/300/180"
  },
  {
    id: 2,
    title: "AI Governance Deep Dive",
    description: "Analyzing the EU AI Act's implementation timeline",
    duration: "24:15",
    views: "28k views",
    date: "Nov 8",
    thumbnail: "/api/placeholder/300/180"
  }
];

export const quickStats = [
  { label: "Policy Updates", value: "247", trend: "+23" },
  { label: "Countries Monitored", value: "89", trend: "+5" },
  { label: "Expert Contributors", value: "156", trend: "+12" },
  { label: "This Week's Updates", value: "+23", trend: "active" }
];