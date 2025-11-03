# Confluence Operations Guide

## Overview

This guide covers the operational procedures for syncing documentation from this repository to Atlassian Confluence. The automated sync keeps project documentation up-to-date in Confluence Space "G" (GAILP).

## Architecture

### Components

1. **Sync Script**: `scripts/atlassian/sync-docs.ts`
2. **GitHub Action**: `.github/workflows/confluence-sync.yml`
3. **Markdown Converter**: Uses Remarkable library (v2.0.1) for safe HTML rendering
4. **Confluence Space**: Space Key "G" at https://cortexaillc.atlassian.net

### Document Mapping

The following files are synced to Confluence:

| Local File | Confluence Page Title |
|------------|----------------------|
| `DEPLOYMENT-OPS-GUIDE.md` | Deployment Operations Guide |
| `docs/design-system.md` | Component Library |
| `docs/LAYOUT-GUIDE.md` | Layout Guidelines |
| `docs/VISUAL-ADJUSTMENT-GUIDE.md` | Visual Adjustments Guide |
| `README.md` | Vision & Mission |
| `CHANGELOG.md` | Changelog |

## Setup & Configuration

### Environment Variables

Required for both local execution and CI/CD:

```bash
# Confluence API Credentials
CONFLUENCE_BASE_URL="https://cortexaillc.atlassian.net"
CONFLUENCE_USERNAME="malsicario@malsicario.com"
CONFLUENCE_API_TOKEN="your-api-token-here"
CONFLUENCE_SPACE_KEY="G"

# Alternative naming (legacy support)
ATLASSIAN_INSTANCE_URL="https://cortexaillc.atlassian.net"
ATLASSIAN_USERNAME="malsicario@malsicario.com"
ATLASSIAN_API_TOKEN="your-api-token-here"
```

### GitHub Secrets

Configure in GitHub repository settings:

1. Navigate to: Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `CONFLUENCE_BASE_URL`
   - `CONFLUENCE_USERNAME`
   - `CONFLUENCE_API_TOKEN`

### Generating API Token

1. Go to: https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Name it: "GAILP Documentation Sync"
4. Copy the token immediately (it won't be shown again)
5. Store in GitHub Secrets and local `.env` file

## Manual Execution

### Prerequisites

```bash
# Install dependencies
npm install axios@1.7.7 remarkable@2.0.1

# Set environment variables
export CONFLUENCE_BASE_URL="https://cortexaillc.atlassian.net"
export CONFLUENCE_USERNAME="malsicario@malsicario.com"
export CONFLUENCE_API_TOKEN="your-token"
```

### Running Locally

```bash
# From project root
npx tsx scripts/atlassian/sync-docs.ts
```

### Expected Output

```
🔄 Starting Confluence sync...
📁 Found 6 documents to sync

📄 Processing: DEPLOYMENT-OPS-GUIDE.md → Deployment Operations Guide
   🔍 Searching for existing page...
   ✅ Page found (ID: 123456)
   📝 Updating page content...
   ✅ Updated: Deployment Operations Guide

... (continues for each file)

✅ Sync complete!
📊 Synced: 6, Skipped: 0

🔗 View in Confluence: https://cortexaillc.atlassian.net/wiki/spaces/G
```

## Automated Execution

### GitHub Actions Workflow

**Trigger**: Manual workflow dispatch via GitHub UI

**Location**: `.github/workflows/confluence-sync.yml`

**Steps**:
1. Checkout repository
2. Setup Node.js 18
3. Install pinned dependencies (axios@1.7.7, remarkable@2.0.1)
4. Run sync script with secrets
5. Output success/failure status

### Running from GitHub

1. Go to: Actions tab in GitHub repository
2. Select "Sync Documentation to Confluence"
3. Click "Run workflow"
4. Select branch (usually `main`)
5. Click "Run workflow" button
6. Monitor execution in real-time

## Monitoring & Troubleshooting

### Health Checks

#### 1. Verify Confluence Connectivity

```bash
curl -u "$CONFLUENCE_USERNAME:$CONFLUENCE_API_TOKEN" \
  "$CONFLUENCE_BASE_URL/wiki/rest/api/space/G"
```

Expected: 200 OK with space details

#### 2. Verify API Token Validity

```bash
curl -u "$CONFLUENCE_USERNAME:$CONFLUENCE_API_TOKEN" \
  "https://cortexaillc.atlassian.net/wiki/rest/api/user/current"
```

Expected: 200 OK with user profile

#### 3. Check Last Sync Status

```bash
# View GitHub Actions run history
gh run list --workflow=confluence-sync.yml --limit 5
```

### Common Issues

#### Issue: "API_TOKEN environment variable is required"

**Cause**: Missing or incorrectly named environment variable

**Solution**:
```bash
# Check if variable is set
echo $CONFLUENCE_API_TOKEN

# If empty, export it
export CONFLUENCE_API_TOKEN="your-token"
```

#### Issue: "401 Unauthorized"

**Causes**:
1. Invalid API token
2. Incorrect username
3. Expired token

**Solution**:
1. Verify username matches Atlassian account
2. Regenerate API token at https://id.atlassian.com/manage-profile/security/api-tokens
3. Update GitHub Secrets

#### Issue: "404 Not Found - Page does not exist"

**Cause**: First-time sync or page was deleted from Confluence

**Behavior**: Script will automatically create the page

**Manual Fix** (if needed):
```bash
# Script handles this automatically, but to manually verify:
curl -u "$CONFLUENCE_USERNAME:$CONFLUENCE_API_TOKEN" \
  "$CONFLUENCE_BASE_URL/wiki/rest/api/content?spaceKey=G&title=PageTitle"
```

#### Issue: "Rate Limited - 429 Too Many Requests"

**Cause**: Exceeded Atlassian API rate limits

**Solution**:
1. Wait 60 seconds
2. Re-run sync
3. Consider implementing exponential backoff in script

#### Issue: Markdown Rendering Issues

**Symptoms**: Code blocks, links, or formatting incorrect in Confluence

**Debug**:
1. Check local markdown syntax
2. Test Remarkable rendering locally:
```bash
node -e "
const { Remarkable } = require('remarkable');
const md = new Remarkable({ html: true, breaks: true });
console.log(md.render('# Test\n\`\`\`js\nconsole.log(\"hello\");\n\`\`\`'));
"
```

### Log Analysis

#### GitHub Actions Logs

1. Navigate to Actions → Workflow run
2. Expand "Sync Documentation" step
3. Look for:
   - `✅` Success indicators
   - `❌` Error messages
   - Page IDs and titles
   - HTTP status codes

#### Local Execution Logs

```bash
# Save logs to file
npx tsx scripts/atlassian/sync-docs.ts 2>&1 | tee confluence-sync.log

# Check for errors
grep -i "error\|fail" confluence-sync.log

# Check success rate
grep -E "Synced:|Skipped:" confluence-sync.log
```

## Monitoring Scripts

### 1. Confluence Health Monitor

Create `scripts/monitoring/confluence-health.sh`:

```bash
#!/bin/bash
# Confluence Health Monitor

CONFLUENCE_BASE_URL="${CONFLUENCE_BASE_URL:-https://cortexaillc.atlassian.net}"
CONFLUENCE_USERNAME="${CONFLUENCE_USERNAME}"
CONFLUENCE_API_TOKEN="${CONFLUENCE_API_TOKEN}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 Confluence Health Check"
echo "=========================="

# Test 1: API Connectivity
echo -n "Testing API connectivity... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -u "$CONFLUENCE_USERNAME:$CONFLUENCE_API_TOKEN" \
  "$CONFLUENCE_BASE_URL/wiki/rest/api/space/G")

if [ "$STATUS" = "200" ]; then
  echo -e "${GREEN}✅ OK${NC}"
else
  echo -e "${RED}❌ Failed (HTTP $STATUS)${NC}"
  exit 1
fi

# Test 2: User Authentication
echo -n "Testing authentication... "
USER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -u "$CONFLUENCE_USERNAME:$CONFLUENCE_API_TOKEN" \
  "https://cortexaillc.atlassian.net/wiki/rest/api/user/current")

if [ "$USER_STATUS" = "200" ]; then
  echo -e "${GREEN}✅ OK${NC}"
else
  echo -e "${RED}❌ Failed (HTTP $USER_STATUS)${NC}"
  exit 1
fi

# Test 3: Check Required Pages Exist
echo -n "Checking documentation pages... "
PAGES=(
  "Deployment Operations Guide"
  "Component Library"
  "Layout Guidelines"
  "Visual Adjustments Guide"
  "Vision & Mission"
  "Changelog"
)

MISSING=0
for PAGE in "${PAGES[@]}"; do
  ENCODED_TITLE=$(echo "$PAGE" | sed 's/ /%20/g')
  PAGE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -u "$CONFLUENCE_USERNAME:$CONFLUENCE_API_TOKEN" \
    "$CONFLUENCE_BASE_URL/wiki/rest/api/content?spaceKey=G&title=$ENCODED_TITLE")

  if [ "$PAGE_STATUS" != "200" ]; then
    echo -e "\n  ${YELLOW}⚠️  Missing: $PAGE${NC}"
    ((MISSING++))
  fi
done

if [ $MISSING -eq 0 ]; then
  echo -e "${GREEN}✅ All pages present${NC}"
else
  echo -e "\n${YELLOW}⚠️  $MISSING page(s) missing${NC}"
fi

echo ""
echo -e "${GREEN}✅ Health check complete${NC}"
```

### 2. Sync Status Monitor

Create `scripts/monitoring/sync-status.sh`:

```bash
#!/bin/bash
# Check last sync status from GitHub Actions

# Requires: gh CLI installed and authenticated
# Install: brew install gh

echo "📊 Confluence Sync Status"
echo "========================"

# Get last 5 workflow runs
gh run list --workflow=confluence-sync.yml --limit 5 --json conclusion,startedAt,displayTitle,url

# Get details of last run
echo ""
echo "Latest Run Details:"
gh run view --workflow=confluence-sync.yml --log-failed
```

### 3. Document Staleness Monitor

Create `scripts/monitoring/doc-staleness.sh`:

```bash
#!/bin/bash
# Check if documentation is stale (not synced recently)

CONFLUENCE_BASE_URL="${CONFLUENCE_BASE_URL:-https://cortexaillc.atlassian.net}"
CONFLUENCE_USERNAME="${CONFLUENCE_USERNAME}"
CONFLUENCE_API_TOKEN="${CONFLUENCE_API_TOKEN}"
STALE_DAYS=7

echo "📅 Document Staleness Check"
echo "=========================="

# Get page and check last modified date
PAGE_ID=$(curl -s \
  -u "$CONFLUENCE_USERNAME:$CONFLUENCE_API_TOKEN" \
  "$CONFLUENCE_BASE_URL/wiki/rest/api/content?spaceKey=G&title=Deployment%20Operations%20Guide" \
  | grep -o '"id":"[0-9]*"' | head -1 | grep -o '[0-9]*')

if [ -n "$PAGE_ID" ]; then
  LAST_MODIFIED=$(curl -s \
    -u "$CONFLUENCE_USERNAME:$CONFLUENCE_API_TOKEN" \
    "$CONFLUENCE_BASE_URL/wiki/rest/api/content/$PAGE_ID?expand=version" \
    | grep -o '"when":"[^"]*"' | head -1 | grep -o '[0-9T:.-]*')

  echo "Last modified: $LAST_MODIFIED"

  # Calculate days since last update
  if [[ "$OSTYPE" == "darwin"* ]]; then
    LAST_EPOCH=$(date -j -f "%Y-%m-%dT%H:%M:%S" "${LAST_MODIFIED:0:19}" +%s 2>/dev/null)
  else
    LAST_EPOCH=$(date -d "${LAST_MODIFIED:0:19}" +%s 2>/dev/null)
  fi

  NOW_EPOCH=$(date +%s)
  DAYS_OLD=$(( ($NOW_EPOCH - $LAST_EPOCH) / 86400 ))

  if [ $DAYS_OLD -gt $STALE_DAYS ]; then
    echo "⚠️  Documentation is $DAYS_OLD days old (threshold: $STALE_DAYS days)"
    echo "Consider running sync: gh workflow run confluence-sync.yml"
  else
    echo "✅ Documentation is up to date ($DAYS_OLD days old)"
  fi
else
  echo "❌ Could not find page"
fi
```

## Maintenance Tasks

### Weekly Tasks

- [ ] Review sync logs for errors
- [ ] Verify all pages are accessible in Confluence
- [ ] Check API token hasn't expired

### Monthly Tasks

- [ ] Review document mapping (add/remove files as needed)
- [ ] Update page titles if structure changed
- [ ] Verify GitHub Actions workflow still functioning
- [ ] Check Confluence Space permissions

### Quarterly Tasks

- [ ] Rotate API tokens
- [ ] Review and update this ops guide
- [ ] Audit Confluence Space organization
- [ ] Performance review of sync process

## Security Considerations

### API Token Security

- ✅ **DO**: Store tokens in GitHub Secrets
- ✅ **DO**: Use environment variables for local development
- ✅ **DO**: Rotate tokens quarterly
- ❌ **DON'T**: Commit tokens to git
- ❌ **DON'T**: Share tokens via chat/email
- ❌ **DON'T**: Use personal tokens for automation

### Access Control

- Confluence API token has read/write access to Space "G"
- GitHub Actions runs with restricted permissions
- Only repository admins can modify workflow secrets

## Disaster Recovery

### If Confluence Space is Deleted

1. Recreate Space with key "G"
2. Re-run sync script (will create all pages)
3. Verify page hierarchy and permissions

### If API Token is Compromised

1. Immediately revoke token at https://id.atlassian.com/manage-profile/security/api-tokens
2. Generate new token
3. Update GitHub Secrets
4. Update local `.env` file
5. Test sync with new token

### If Sync Script Fails Repeatedly

1. Check Confluence service status: https://status.atlassian.com/
2. Verify API rate limits not exceeded
3. Review recent changes to source markdown files
4. Test Remarkable library rendering locally
5. Contact Atlassian support if needed

## Performance Optimization

### Current Performance

- Average sync time: 10-20 seconds
- Files processed: 6 documents
- API calls per sync: ~12 (2 per document)

### Optimization Opportunities

1. **Batch Updates**: Group page updates into single API call (if Atlassian supports)
2. **Change Detection**: Only update pages with modified content
3. **Parallel Processing**: Update pages concurrently instead of sequentially
4. **Caching**: Cache page IDs to reduce search API calls

### Future Improvements

- [ ] Add content hash comparison to skip unchanged pages
- [ ] Implement retry logic with exponential backoff
- [ ] Add Slack/email notifications for sync failures
- [ ] Create web dashboard showing sync status
- [ ] Support for nested page hierarchy

## Support & Escalation

### Internal Contacts

- **Technical Owner**: DevOps Team
- **Content Owner**: Documentation Team
- **Confluence Admin**: IT Department

### External Support

- **Atlassian Support**: https://support.atlassian.com/
- **Community Forum**: https://community.atlassian.com/
- **API Documentation**: https://developer.atlassian.com/cloud/confluence/rest/v1/

## References

- [Confluence REST API v1](https://developer.atlassian.com/cloud/confluence/rest/v1/)
- [Confluence Storage Format](https://confluence.atlassian.com/doc/confluence-storage-format-790796544.html)
- [Remarkable Documentation](https://github.com/jonschlinkert/remarkable)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

**Last Updated**: 2025-11-03
**Version**: 1.0.0
**Maintainer**: DevOps Team
