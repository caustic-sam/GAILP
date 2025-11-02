#!/usr/bin/env tsx
/**
 * Sync Markdown Documentation to Confluence
 *
 * Converts markdown to Confluence storage format and updates pages
 */

import { readFile } from 'fs/promises';
import axios from 'axios';
import { glob } from 'glob';

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

function markdownToConfluenceStorage(markdown: string): string {
  // Basic markdown to Confluence storage format conversion
  // This is simplified - for production, use a proper converter library

  let html = markdown;

  // Convert headers
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');

  // Convert bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Convert italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Convert inline code
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');

  // Convert code blocks
  html = html.replace(/```(\w+)?\n([\s\S]+?)```/g, '<ac:structured-macro ac:name="code"><ac:parameter ac:name="language">$1</ac:parameter><ac:plain-text-body><![CDATA[$2]]></ac:plain-text-body></ac:structured-macro>');

  // Convert links
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');

  // Convert lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>');

  // Wrap consecutive <li> in <ul>
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Convert paragraphs
  html = html.replace(/^(?!<[hul]|<ac:)(.+)$/gm, '<p>$1</p>');

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
