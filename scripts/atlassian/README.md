# Atlassian Integration Scripts

This directory contains scripts for integrating GitHub with Jira and Confluence.

## Prerequisites

```bash
npm install axios @atlassian/jira-pi-client
```

## Environment Variables

Create `.env.local` in project root:

```env
ATLASSIAN_INSTANCE_URL=https://cortexaillc.atlassian.net
ATLASSIAN_USERNAME=malsicario@malsicario.com
ATLASSIAN_API_TOKEN=your-token-here
```

## Scripts

### 1. Create Jira Project
```bash
npx tsx scripts/atlassian/create-jira-project.ts
```

### 2. Import Backlog to Jira
```bash
npx tsx scripts/atlassian/backlog-to-jira.ts
```

### 3. Sync Documentation to Confluence
```bash
npx tsx scripts/atlassian/sync-to-confluence.ts
```

### 4. Create Confluence Page Structure
```bash
npx tsx scripts/atlassian/create-confluence-structure.ts
```

## Manual Steps

See [ATLASSIAN-INTEGRATION-PLAN.md](../../docs/ATLASSIAN-INTEGRATION-PLAN.md) for the complete implementation plan.
