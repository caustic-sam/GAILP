#!/bin/bash
# Run all Atlassian setup scripts in order

set -e

echo "🚀 GAILP Atlassian Integration - Automated Setup"
echo "================================================"
echo ""

# Check for required environment variables
if [ -z "$ATLASSIAN_API_TOKEN" ]; then
  echo "❌ Error: ATLASSIAN_API_TOKEN environment variable not set"
  echo ""
  echo "Please set it from your Claude Desktop config:"
  echo "export ATLASSIAN_API_TOKEN=\"your-token-here\""
  exit 1
fi

echo "✅ Environment variables configured"
echo ""

# Step 1: Create Jira Project
echo "📦 Step 1/4: Creating Jira project..."
echo "-----------------------------------"
npx tsx scripts/atlassian/create-jira-project.ts
echo ""

# Wait for Jira to process
echo "⏳ Waiting 5 seconds for Jira to process..."
sleep 5
echo ""

# Step 2: Create Confluence Structure
echo "📑 Step 2/4: Creating Confluence page structure..."
echo "-----------------------------------------------"
npx tsx scripts/atlassian/create-confluence-structure.ts
echo ""

# Wait for Confluence to process
echo "⏳ Waiting 5 seconds for Confluence to process..."
sleep 5
echo ""

# Step 3: Import Backlog
echo "📝 Step 3/4: Importing backlog to Jira..."
echo "--------------------------------------"
npx tsx scripts/atlassian/backlog-to-jira.ts
echo ""

echo "✅ All automation scripts completed!"
echo ""
echo "📋 Manual Steps Remaining:"
echo "1. Configure issue type colors in Jira UI"
echo "2. Add custom fields (GitHub PR, Confluence Page, etc.)"
echo "3. Migrate documentation content to Confluence pages"
echo "4. Set up GitHub Actions for automated sync"
echo ""
echo "🔗 Quick Links:"
echo "   Jira: https://cortexaillc.atlassian.net/jira/software/projects/GAILP/board"
echo "   Confluence: https://cortexaillc.atlassian.net/wiki/spaces/G"
echo ""
echo "📚 Next: Review docs/ATLASSIAN-IMPLEMENTATION-STATUS.md for Phase 2"
