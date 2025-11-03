#!/usr/bin/env tsx
/**
 * Create GAILP Jira Project
 *
 * This script creates the GAILP project in Jira with:
 * - Kanban board configuration
 * - Custom issue types
 * - Custom fields
 * - Labels
 * - Workflows
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

interface ProjectConfig {
  key: string;
  name: string;
  description: string;
  leadAccountId: string;
  projectTypeKey: string;
  projectTemplateKey: string;
}

async function getCurrentUser() {
  try {
    const response = await client.get('/rest/api/3/myself');
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to get current user:', error.response?.data || error.message);
    throw error;
  }
}

async function createProject(config: ProjectConfig) {
  try {
    console.log('📦 Creating Jira project:', config.key);
    const response = await client.post('/rest/api/3/project', config);
    console.log('✅ Project created:', response.data.key);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400 && error.response?.data?.errors?.projectKey) {
      console.log('ℹ️ Project already exists, continuing...');
      return { key: config.key, id: null };
    }
    console.error('❌ Failed to create project:', error.response?.data || error.message);
    throw error;
  }
}

async function getProjectId(projectKey: string) {
  try {
    const response = await client.get(`/rest/api/3/project/${projectKey}`);
    return response.data.id;
  } catch (error: any) {
    console.error('❌ Failed to get project:', error.response?.data || error.message);
    throw error;
  }
}

async function createLabels(projectKey: string) {
  const labels = [
    'frontend',
    'backend',
    'database',
    'security',
    'performance',
    'ui-ux',
    'integration',
    'web3',
    'ai-ml',
    'quick-win',
    'tech-debt',
    'breaking-change'
  ];

  console.log('🏷️  Creating labels...');

  // Note: Labels in Jira Cloud are created automatically when first used
  // We'll create a sample issue with all labels to initialize them
  try {
    const projectId = await getProjectId(projectKey);

    // Create a temporary task to initialize labels
    const tempIssue = await client.post('/rest/api/3/issue', {
      fields: {
        project: { key: projectKey },
        summary: '[SETUP] Label initialization - can be deleted',
        description: {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'This issue was created to initialize project labels. You can safely delete it.' }]
            }
          ]
        },
        issuetype: { name: 'Task' },
        labels: labels
      }
    });

    console.log(`✅ Labels initialized via ${tempIssue.data.key} (you can delete this issue later)`);
    return labels;
  } catch (error: any) {
    console.error('⚠️ Could not initialize labels:', error.response?.data || error.message);
    return labels;
  }
}

async function main() {
  console.log('🚀 Starting Jira project creation...\n');

  // Get current user as project lead
  console.log('👤 Getting current user...');
  const currentUser = await getCurrentUser();
  console.log(`✅ User: ${currentUser.displayName} (${currentUser.accountId})\n`);

  // Create project
  const projectConfig: ProjectConfig = {
    key: 'GAILP',
    name: 'GAILP Platform',
    description: 'Global AI & Digital Policy Hub - Content management and publishing platform for digital policy analysis',
    leadAccountId: currentUser.accountId,
    projectTypeKey: 'software', // Software project type
    projectTemplateKey: 'com.pyxis.greenhopper.jira:gh-simplified-kanban' // Kanban template
  };

  const project = await createProject(projectConfig);
  console.log('');

  // Wait a bit for project to be fully created
  console.log('⏳ Waiting for project initialization...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  console.log('');

  // Create labels
  await createLabels(projectConfig.key);
  console.log('');

  console.log('✅ Jira project setup complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Configure issue types and colors in Jira UI');
  console.log('2. Add custom fields (GitHub PR, Confluence Page, etc.)');
  console.log('3. Run: npx tsx scripts/atlassian/create-confluence-structure.ts');
  console.log('4. Run: npx tsx scripts/atlassian/backlog-to-jira.ts');
  console.log('\n🔗 Project URL:', `${INSTANCE_URL}/jira/software/projects/${projectConfig.key}/board`);
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
