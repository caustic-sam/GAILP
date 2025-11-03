#!/usr/bin/env tsx
/**
 * Sync Markdown Documentation to Confluence
 *
 * Converts markdown to Confluence storage format and updates pages
 */

import { readFile } from 'fs/promises';
import axios from 'axios';
import { Remarkable } from 'remarkable';

const INSTANCE_URL = process.env.CONFLUENCE_BASE_URL || process.env.ATLASSIAN_INSTANCE_URL || 'https://cortexaillc.atlassian.net';
const USERNAME = process.env.CONFLUENCE_USERNAME || process.env.ATLASSIAN_USERNAME || 'malsicario@malsicario.com';
const API_TOKEN = process.env.CONFLUENCE_API_TOKEN || process.env.ATLASSIAN_API_TOKEN;
const SPACE_KEY = 'G';

if (!API_TOKEN) {
  console.error('❌ API_TOKEN environment variable is required');
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

// Mapping of markdown files to Confluence pages
const DOC_MAPPING: Record<string, string> = {
  'docs/00-START-HERE.md': 'Getting Started Checklist',
  'docs/QUICK-START.md': 'Quick Start Guide',
  'docs/CLAUDE-CODE-GUIDE.md': 'Claude Code Integration',
  'docs/ATLASSIAN-MCP-SETUP.md': 'Atlassian MCP Setup',
  'docs/PRODUCTION-PLAN.md': 'Product Roadmap',
  'docs/RSS-OPS-GUIDE.md': 'RSS Operations Guide',
  'DEPLOYMENT-OPS-GUIDE.md': 'Deployment Operations Guide',
  'docs/design-system.md': 'Component Library',
  'docs/LAYOUT-GUIDE.md': 'Layout Guidelines',
  'docs/VISUAL-ADJUSTMENT-GUIDE.md': 'Visual Adjustments Guide',
  'README.md': 'Vision & Mission',
  'CHANGELOG.md': 'Changelog'
};

// Initialize markdown parser with safe HTML rendering
const md = new Remarkable({
  html: true,
  breaks: true,
  typographer: true,
});

function markdownToConfluenceStorage(markdown: string): string {
  // Use Remarkable library for safe markdown to HTML conversion
  let html = md.render(markdown);

  // Post-process for Confluence-specific macros
  // Convert code blocks to Confluence code macro
  html = html.replace(/<pre><code class="language-(\w+)">([\s\S]+?)<\/code><\/pre>/g,
    '<ac:structured-macro ac:name="code"><ac:parameter ac:name="language">$1</ac:parameter><ac:plain-text-body><![CDATA[$2]]></ac:plain-text-body></ac:structured-macro>');

  // Convert plain code blocks
  html = html.replace(/<pre><code>([\s\S]+?)<\/code><\/pre>/g,
    '<ac:structured-macro ac:name="code"><ac:plain-text-body><![CDATA[$1]]></ac:plain-text-body></ac:structured-macro>');

  return html;
}

async function findPageByTitle(spaceKey: string, title: string) {
  try {
    const response = await client.get(`/rest/api/content`, {
      params: {
        spaceKey,
        title,
        expand: 'version'
      }
    });

    if (response.data.results.length > 0) {
      return response.data.results[0];
    }
    return null;
  } catch (error: any) {
    console.error(`  ❌ Error finding page "${title}":`, error.response?.data?.message || error.message);
    return null;
  }
}

async function updatePage(pageId: string, title: string, content: string, version: number) {
  try {
    await client.put(`/rest/api/content/${pageId}`, {
      version: { number: version + 1 },
      title: title,
      type: 'page',
      body: {
        storage: {
          value: content,
          representation: 'storage'
        }
      }
    });
    console.log(`  ✅ Updated: ${title}`);
    return true;
  } catch (error: any) {
    console.error(`  ❌ Failed to update "${title}":`, error.response?.data?.message || error.message);
    return false;
  }
}

async function syncDocument(filePath: string, pageTitle: string) {
  try {
    // Read markdown file
    const markdown = await readFile(filePath, 'utf-8');

    // Convert to Confluence storage format
    const confluenceContent = markdownToConfluenceStorage(markdown);

    // Find existing page
    const page = await findPageByTitle(SPACE_KEY, pageTitle);

    if (page) {
      // Update existing page
      await updatePage(page.id, pageTitle, confluenceContent, page.version.number);
    } else {
      console.log(`  ⚠️  Page "${pageTitle}" not found, skipping (create manually first)`);
    }
  } catch (error: any) {
    console.error(`  ❌ Error syncing ${filePath}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Starting documentation sync...\n');

  let synced = 0;
  let skipped = 0;

  for (const [filePath, pageTitle] of Object.entries(DOC_MAPPING)) {
    console.log(`📄 Syncing: ${filePath} → ${pageTitle}`);

    try {
      await syncDocument(filePath, pageTitle);
      synced++;
    } catch (error) {
      skipped++;
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n✅ Sync complete!');
  console.log(`📊 Synced: ${synced}, Skipped: ${skipped}`);
  console.log(`\n🔗 View in Confluence: ${INSTANCE_URL}/wiki/spaces/${SPACE_KEY}`);
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
