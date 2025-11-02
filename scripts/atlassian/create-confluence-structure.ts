#!/usr/bin/env tsx
/**
 * Create Confluence Page Structure for GAILP
 *
 * Creates the main page hierarchy with emoji navigation
 */

import axios from 'axios';

const INSTANCE_URL = process.env.ATLASSIAN_INSTANCE_URL || 'https://cortexaillc.atlassian.net';
const USERNAME = process.env.ATLASSIAN_USERNAME || 'malsicario@malsicario.com';
const API_TOKEN = process.env.ATLASSIAN_API_TOKEN;

if (!API_TOKEN) {
  console.error('❌ ATLASSIAN_API_TOKEN environment variable is required');
  process.exit(1);
}

const client = axios.create({
  baseURL: `${INSTANCE_URL}/wiki`,
  auth: {
    username: USERNAME,
    password: API_TOKEN
  },
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

const SPACE_KEY = 'G'; // GAILP space

interface Page {
  title: string;
  emoji?: string;
  content: string;
  children?: Page[];
}

const PAGE_STRUCTURE: Page[] = [
  {
    title: '📋 Project Overview',
    content: `
<h2>Welcome to GAILP Platform</h2>
<p>Global AI &amp; Digital Policy Hub - A content management and publishing platform for digital policy analysis.</p>
<h3>Quick Links</h3>
<ul>
  <li><a href="#child-page-getting-started">Getting Started</a></li>
  <li><a href="#child-page-team">Team Directory</a></li>
  <li><a href="https://github.com/yourusername/www-GAILP-prd">GitHub Repository</a></li>
</ul>
`,
    children: [
      { title: 'Vision & Mission', content: '<p>Our vision and mission statements will be added here.</p>' },
      { title: 'Team Directory', content: '<p>Team member information and roles.</p>' },
      { title: 'Quick Start Guide', content: '<p>Getting started with GAILP platform development.</p>' },
      { title: 'Getting Started Checklist', content: '<p>Onboarding checklist for new team members.</p>' }
    ]
  },
  {
    title: '🗺️ Product & Roadmap',
    content: '<h2>Product Planning</h2><p>Roadmaps, feature specifications, and integration plans.</p>',
    children: [
      { title: 'Product Roadmap', content: '<p>High-level product roadmap and milestones.</p>' },
      { title: 'Feature Specifications', content: '<p>Detailed feature specifications.</p>' },
      {
        title: 'Integration Plans',
        content: '<p>Third-party integration plans and documentation.</p>',
        children: [
          { title: 'WordPress Migration', content: '<p>WordPress migration plan.</p>' },
          { title: 'FreshRSS Integration', content: '<p>FreshRSS integration plan.</p>' },
          { title: 'NIST RAG MCP', content: '<p>NIST RAG MCP integration plan.</p>' },
          { title: 'Web3 Integration', content: '<p>Web3 integration plan.</p>' }
        ]
      },
      { title: 'Project Status Dashboard', content: '<p>Current project status and metrics.</p>' }
    ]
  },
  {
    title: '📚 User Guides',
    content: '<h2>User Documentation</h2><p>Guides for using the GAILP platform.</p>',
    children: [
      { title: 'Content Management Guide', content: '<p>How to create and manage content.</p>' },
      { title: 'Admin Dashboard Guide', content: '<p>Admin dashboard features and usage.</p>' },
      { title: 'RSS Operations Guide', content: '<p>RSS feed management and operations.</p>' },
      { title: 'Deployment Operations Guide', content: '<p>Deployment procedures and operations.</p>' }
    ]
  },
  {
    title: '🎨 Design System',
    content: '<h2>Design System</h2><p>Design principles, components, and guidelines.</p>',
    children: [
      { title: 'Design Principles', content: '<p>Core design principles and philosophy.</p>' },
      { title: 'Component Library', content: '<p>Reusable UI components.</p>' },
      { title: 'Layout Guidelines', content: '<p>Layout and spacing guidelines.</p>' },
      { title: 'Visual Adjustments Guide', content: '<p>Visual customization guide.</p>' },
      { title: 'Design History', content: '<p>Design evolution and decision history.</p>' }
    ]
  },
  {
    title: '💼 Business & Operations',
    content: '<h2>Business Operations</h2><p>Business documentation and operational procedures.</p>',
    children: [
      { title: 'Handoff Documentation', content: '<p>Project handoff documentation.</p>' },
      { title: 'Delivery Summaries', content: '<p>Delivery and milestone summaries.</p>' },
      { title: 'Meeting Notes', content: '<p>Meeting notes and decisions.</p>' },
      { title: 'Decision Records', content: '<p>Architecture Decision Records (ADRs).</p>' },
      { title: 'Client Communications', content: '<p>Client communication log.</p>' }
    ]
  },
  {
    title: '🔧 Developer Resources',
    content: `
<h2>Developer Resources</h2>
<p>Technical documentation and development guides.</p>
<h3>Quick Links</h3>
<ul>
  <li><a href="https://github.com/yourusername/www-GAILP-prd/blob/main/docs/DATABASE-SETUP.md">Database Setup (GitHub)</a></li>
  <li><a href="https://github.com/yourusername/www-GAILP-prd/blob/main/docs/TESTING.md">Testing Guide (GitHub)</a></li>
</ul>
`,
    children: [
      { title: 'API Documentation', content: '<p>API reference and examples.</p>' },
      { title: 'Architecture Overview', content: '<p>System architecture and design.</p>' },
      { title: 'Contributing Guide', content: '<p>How to contribute to the project.</p>' },
      { title: 'Setup Instructions', content: '<p>Development environment setup (see GitHub for technical details).</p>' },
      { title: 'Troubleshooting', content: '<p>Common issues and solutions.</p>' }
    ]
  },
  {
    title: '🤖 AI Agent Guides',
    content: '<h2>AI Agent Integration</h2><p>Guides for AI agent integration and usage.</p>',
    children: [
      { title: 'Claude Code Integration', content: '<p>Claude Code usage guide.</p>' },
      { title: 'Atlassian MCP Setup', content: '<p>Atlassian MCP server setup guide.</p>' },
      { title: 'Agent Templates', content: '<p>Templates for AI agent tasks.</p>' },
      { title: 'Best Practices', content: '<p>Best practices for AI-assisted development.</p>' }
    ]
  },
  {
    title: '📝 Session Archive',
    content: '<h2>Session Archive</h2><p>Development session notes and changelog.</p>',
    children: [
      { title: '2025-11-01 Session Notes', content: '<p>Session notes from November 1, 2025.</p>' },
      { title: '2025-11-02 Atlassian Setup', content: '<p>Atlassian integration setup session.</p>' },
      { title: 'Changelog', content: '<p>Project changelog (auto-synced from GitHub).</p>' }
    ]
  }
];

async function getSpaceHomepage(spaceKey: string) {
  try {
    const response = await client.get(`/rest/api/space/${spaceKey}?expand=homepage`);
    return response.data.homepage.id;
  } catch (error: any) {
    console.error('❌ Failed to get space homepage:', error.response?.data || error.message);
    throw error;
  }
}

async function createPage(title: string, content: string, parentId: string, spaceKey: string) {
  try {
    const response = await client.post('/rest/api/content', {
      type: 'page',
      title: title,
      space: { key: spaceKey },
      ancestors: [{ id: parentId }],
      body: {
        storage: {
          value: content,
          representation: 'storage'
        }
      }
    });
    console.log(`  ✅ Created: ${title}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
      console.log(`  ℹ️  Exists: ${title}`);
      // Try to find existing page
      const searchResponse = await client.get(`/rest/api/content?spaceKey=${spaceKey}&title=${encodeURIComponent(title)}&expand=version`);
      if (searchResponse.data.results.length > 0) {
        return searchResponse.data.results[0];
      }
    }
    console.error(`  ❌ Failed to create "${title}":`, error.response?.data?.message || error.message);
    return null;
  }
}

async function createPageHierarchy(pages: Page[], parentId: string, spaceKey: string, depth: number = 0) {
  for (const page of pages) {
    const indent = '  '.repeat(depth);
    console.log(`${indent}📄 Creating: ${page.title}`);

    const createdPage = await createPage(page.title, page.content, parentId, spaceKey);

    if (createdPage && page.children && page.children.length > 0) {
      await createPageHierarchy(page.children, createdPage.id, spaceKey, depth + 1);
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

async function main() {
  console.log('🚀 Starting Confluence structure creation...\n');

  console.log(`📦 Space: ${SPACE_KEY} (GAILP)`);
  console.log('');

  // Get space homepage as parent
  console.log('🏠 Getting space homepage...');
  const homepageId = await getSpaceHomepage(SPACE_KEY);
  console.log(`✅ Homepage ID: ${homepageId}\n`);

  // Create page structure
  console.log('📑 Creating page hierarchy...\n');
  await createPageHierarchy(PAGE_STRUCTURE, homepageId, SPACE_KEY);

  console.log('\n✅ Confluence structure creation complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Review pages in Confluence UI');
  console.log('2. Run: npx tsx scripts/atlassian/sync-to-confluence.ts');
  console.log('3. Customize page templates as needed');
  console.log(`\n🔗 Confluence Space: ${INSTANCE_URL}/wiki/spaces/${SPACE_KEY}`);
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
