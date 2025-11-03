#!/usr/bin/env tsx
/**
 * Import Backlog to Jira
 *
 * Parses BACKLOG.md and creates Jira issues
 */

import { readFile } from 'fs/promises';
import axios from 'axios';

const INSTANCE_URL = process.env.ATLASSIAN_INSTANCE_URL || 'https://cortexaillc.atlassian.net';
const USERNAME = process.env.ATLASSIAN_USERNAME || 'malsicario@malsicario.com';
const API_TOKEN = process.env.ATLASSIAN_API_TOKEN;
const PROJECT_KEY = 'GAILP';

if (!API_TOKEN) {
  console.error('❌ ATLASSIAN_API_TOKEN environment variable is required');
  process.exit(1);
}

const client = axios.create({
  baseURL: INSTANCE_URL,
  auth: {
    username: USERNAME,
    password: API_TOKEN
  },
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

interface BacklogItem {
  title: string;
  description: string;
  priority: 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest';
  labels: string[];
  issueType: 'Epic' | 'Story' | 'Task' | 'Bug';
  storyPoints?: number;
  section: string;
}

async function parseBacklog(path: string): Promise<BacklogItem[]> {
  const content = await readFile(path, 'utf-8');
  const items: BacklogItem[] = [];

  const lines = content.split('\n');
  let currentSection = '';
  let currentPriority: 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest' = 'Medium';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect section
    if (line.startsWith('## High Priority')) {
      currentSection = 'High Priority';
      currentPriority = 'High';
    } else if (line.startsWith('## Medium Priority')) {
      currentSection = 'Medium Priority';
      currentPriority = 'Medium';
    } else if (line.startsWith('## Lower Priority')) {
      currentSection = 'Lower Priority';
      currentPriority = 'Low';
    }

    // Detect items (### headings with numbers)
    if (line.match(/^### \d+\. /)) {
      const title = line.replace(/^### \d+\. /, '').trim();

      // Collect description until next heading or task list
      let description = '';
      let j = i + 1;
      while (j < lines.length && !lines[j].startsWith('#') && !lines[j].startsWith('**Tasks:**')) {
        if (lines[j].startsWith('**Status:**') ||
            lines[j].startsWith('**Effort:**') ||
            lines[j].startsWith('**Description:**')) {
          j++;
          continue;
        }
        description += lines[j] + '\n';
        j++;
      }

      // Determine labels and type
      const labels: string[] = [];
      let issueType: 'Epic' | 'Story' | 'Task' | 'Bug' = 'Task';

      const fullText = (title + description).toLowerCase();

      if (fullText.includes('security') || fullText.includes('rls') || fullText.includes('auth')) {
        labels.push('security');
        issueType = 'Task';
      }
      if (fullText.includes('image') || fullText.includes('upload') || fullText.includes('ui') || fullText.includes('frontend')) {
        labels.push('frontend');
      }
      if (fullText.includes('api') || fullText.includes('endpoint') || fullText.includes('backend')) {
        labels.push('backend');
      }
      if (fullText.includes('database') || fullText.includes('schema') || fullText.includes('supabase')) {
        labels.push('database');
      }
      if (fullText.includes('homepage') || fullText.includes('page')) {
        labels.push('frontend');
      }
      if (fullText.includes('category') || fullText.includes('tag') || fullText.includes('management')) {
        labels.push('backend', 'frontend');
      }
      if (fullText.includes('1-2 hours') || fullText.includes('small')) {
        labels.push('quick-win');
      }

      // Estimate story points based on effort
      let storyPoints = 3;
      if (fullText.includes('small') || fullText.includes('1-2 hours')) storyPoints = 2;
      if (fullText.includes('medium') || fullText.includes('2-4 hours')) storyPoints = 3;
      if (fullText.includes('large') || fullText.includes('5-8 hours')) storyPoints = 5;
      if (fullText.includes('6-10 hours')) storyPoints = 8;

      items.push({
        title,
        description: description.trim(),
        priority: currentSection.includes('High') ? 'High' : currentSection.includes('Lower') ? 'Low' : 'Medium',
        labels: [...new Set(labels)], // Remove duplicates
        issueType,
        storyPoints,
        section: currentSection
      });
    }
  }

  return items;
}

async function createJiraIssue(item: BacklogItem) {
  try {
    const response = await client.post('/rest/api/3/issue', {
      fields: {
        project: { key: PROJECT_KEY },
        summary: item.title,
        description: {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: item.description || 'No description provided.' }]
            }
          ]
        },
        issuetype: { name: item.issueType },
        priority: { name: item.priority },
        labels: item.labels
      }
    });

    console.log(`  ✅ ${response.data.key}: ${item.title}`);
    return response.data;
  } catch (error: any) {
    console.error(`  ❌ Failed to create "${item.title}":`, error.response?.data?.errors || error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Starting backlog import...\n');

  const backlogPath = './BACKLOG.md';
  console.log(`📖 Reading: ${backlogPath}`);

  const items = await parseBacklog(backlogPath);
  console.log(`✅ Found ${items.length} items\n`);

  // Only import top 10 items to start
  const topItems = items.slice(0, 10);
  console.log(`📝 Importing top ${topItems.length} items:\n`);

  let created = 0;
  for (const item of topItems) {
    const result = await createJiraIssue(item);
    if (result) created++;

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n✅ Import complete!`);
  console.log(`📊 Created ${created} out of ${topItems.length} issues`);
  console.log(`\n📋 Remaining items in backlog: ${items.length - topItems.length}`);
  console.log('\n💡 Tip: Review created issues and adjust as needed');
  console.log(`🔗 Jira Board: ${INSTANCE_URL}/jira/software/projects/${PROJECT_KEY}/board`);
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
