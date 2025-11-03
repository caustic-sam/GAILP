#!/bin/bash
###############################################################################
# Security Migration Script
# Fixes HIGH priority security issues #1-2
#
# What this does:
# 1. Backs up current .env.local
# 2. Removes NEXT_PUBLIC_ prefix from service role key
# 3. Updates .gitignore to prevent .env.local commits
# 4. Creates .env.example with safe placeholders
# 5. Validates no browser-exposed secrets remain
# 6. Outputs Vercel setup instructions
###############################################################################

set -e  # Exit on error

echo "🔒 Starting Security Migration..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get project root (two levels up from scripts/security)
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$PROJECT_ROOT"

echo "📁 Project root: $PROJECT_ROOT"
echo ""

###############################################################################
# Step 1: Backup .env.local
###############################################################################
echo "📦 Step 1: Backing up .env.local..."

if [ -f ".env.local" ]; then
  BACKUP_FILE=".env.local.backup.$(date +%Y%m%d-%H%M%S)"
  cp .env.local "$BACKUP_FILE"
  echo -e "${GREEN}✅ Backup created: $BACKUP_FILE${NC}"
else
  echo -e "${YELLOW}⚠️  No .env.local found - skipping backup${NC}"
fi

echo ""

###############################################################################
# Step 2: Fix .env.local - Remove NEXT_PUBLIC_ from service key
###############################################################################
echo "🔧 Step 2: Fixing .env.local..."

if [ -f ".env.local" ]; then
  # Check if the vulnerable var exists
  if grep -q "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY" .env.local; then
    # Extract the service role key value
    SERVICE_KEY=$(grep "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY" .env.local | cut -d '=' -f 2- | tr -d '"')

    # Remove the old variable
    sed -i.bak '/NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY/d' .env.local

    # Add the corrected variable (without NEXT_PUBLIC_)
    # Find the line with NEXT_PUBLIC_SUPABASE_ANON_KEY and insert after it
    awk -v key="$SERVICE_KEY" '
      /NEXT_PUBLIC_SUPABASE_ANON_KEY/ {
        print
        print "SUPABASE_SERVICE_ROLE_KEY=\"" key "\""
        next
      }
      {print}
    ' .env.local > .env.local.tmp && mv .env.local.tmp .env.local

    # Clean up backup file created by sed
    rm -f .env.local.bak

    echo -e "${GREEN}✅ Service role key renamed (NEXT_PUBLIC_ prefix removed)${NC}"
  else
    echo -e "${GREEN}✅ Service role key already correctly named${NC}"
  fi

  # Remove NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY if it exists
  if grep -q "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY" .env.local; then
    sed -i.bak '/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY/d' .env.local
    rm -f .env.local.bak
    echo -e "${GREEN}✅ Removed unused NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  No .env.local found - skipping${NC}"
fi

echo ""

###############################################################################
# Step 3: Update .gitignore
###############################################################################
echo "📝 Step 3: Updating .gitignore..."

if ! grep -q "^\.env\.local$" .gitignore 2>/dev/null; then
  echo "" >> .gitignore
  echo "# Environment variables (contains secrets)" >> .gitignore
  echo ".env.local" >> .gitignore
  echo ".env.*.local" >> .gitignore
  echo -e "${GREEN}✅ Added .env.local to .gitignore${NC}"
else
  echo -e "${GREEN}✅ .env.local already in .gitignore${NC}"
fi

echo ""

###############################################################################
# Step 4: Create .env.example
###############################################################################
echo "📄 Step 4: Creating .env.example..."

cat > .env.example << 'EOF'
# Site Configuration
NEXT_PUBLIC_SITE_NAME="Your Site Name"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_DESCRIPTION="Your site description"

# Supabase Configuration
# Get these from: https://app.supabase.com/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# FreshRSS Integration (optional)
FRESHRSS_API_URL="http://your-freshrss-instance/api/greader.php"
FRESHRSS_API_USERNAME="your-username"
FRESHRSS_API_PASSWORD="your-password"

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ENABLED=false
NEXT_PUBLIC_GA_ID=""

# Optional: Newsletter Service
NEWSLETTER_API_URL=""
NEWSLETTER_API_KEY=""

# Optional: Search Backend (Meilisearch)
MEILISEARCH_HOST=""
MEILISEARCH_API_KEY=""
EOF

echo -e "${GREEN}✅ Created .env.example with safe placeholders${NC}"

echo ""

###############################################################################
# Step 5: Validate - Search for NEXT_PUBLIC_*_KEY patterns
###############################################################################
echo "🔍 Step 5: Validating no browser-exposed secrets..."

VIOLATIONS=0

# Check for NEXT_PUBLIC_*_KEY or NEXT_PUBLIC_*_SECRET patterns
if [ -f ".env.local" ]; then
  if grep -E "NEXT_PUBLIC_.*(KEY|SECRET|TOKEN|PASSWORD)" .env.local | grep -v "NEXT_PUBLIC_SUPABASE_URL\|NEXT_PUBLIC_SUPABASE_ANON_KEY\|NEXT_PUBLIC_ANALYTICS\|NEXT_PUBLIC_GA" > /dev/null 2>&1; then
    echo -e "${RED}❌ Found potentially exposed secrets in .env.local:${NC}"
    grep -E "NEXT_PUBLIC_.*(KEY|SECRET|TOKEN|PASSWORD)" .env.local | grep -v "NEXT_PUBLIC_SUPABASE_URL\|NEXT_PUBLIC_SUPABASE_ANON_KEY\|NEXT_PUBLIC_ANALYTICS\|NEXT_PUBLIC_GA"
    VIOLATIONS=$((VIOLATIONS + 1))
  else
    echo -e "${GREEN}✅ No browser-exposed secrets found in .env.local${NC}"
  fi
fi

# Check codebase for NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY references
if grep -r "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . 2>/dev/null | grep -v "node_modules\|.next\|scripts/security" > /dev/null; then
  echo -e "${RED}❌ Found code references to NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY:${NC}"
  grep -r "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . | grep -v "node_modules\|.next\|scripts/security"
  VIOLATIONS=$((VIOLATIONS + 1))
else
  echo -e "${GREEN}✅ No code references to NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY${NC}"
fi

echo ""

if [ $VIOLATIONS -eq 0 ]; then
  echo -e "${GREEN}✅ All security validations passed!${NC}"
else
  echo -e "${RED}❌ Security validations failed! Please review and fix the issues above.${NC}"
  exit 1
fi

echo ""

###############################################################################
# Step 6: Output Vercel Setup Instructions
###############################################################################
echo "📋 Step 6: Vercel Environment Variables Setup"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: You need to manually add these to Vercel:${NC}"
echo ""
echo "1. Go to: https://vercel.com/caustic-sams-projects-2d85e2bb/www-gailp-prd/settings/environment-variables"
echo ""
echo "2. Add these environment variables (for Production, Preview, and Development):"
echo ""
echo "   Variable Name: SUPABASE_SERVICE_ROLE_KEY"
if [ -f ".env.local" ]; then
  SERVICE_KEY=$(grep "^SUPABASE_SERVICE_ROLE_KEY" .env.local | cut -d '=' -f 2- | tr -d '"')
  if [ -n "$SERVICE_KEY" ]; then
    echo "   Value: ${SERVICE_KEY:0:20}... (copy from your .env.local)"
  fi
fi
echo ""
echo "   Variable Name: FRESHRSS_API_PASSWORD"
if [ -f ".env.local" ]; then
  FRESHRSS_PASSWORD=$(grep "^FRESHRSS_API_PASSWORD" .env.local | cut -d '=' -f 2- | tr -d '"')
  if [ -n "$FRESHRSS_PASSWORD" ]; then
    echo "   Value: $FRESHRSS_PASSWORD"
  fi
fi
echo ""
echo "3. Redeploy your application after adding these variables"
echo ""

###############################################################################
# Summary
###############################################################################
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Security migration complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Summary of changes:"
echo "  ✅ Backed up original .env.local"
echo "  ✅ Fixed service role key (removed NEXT_PUBLIC_ prefix)"
echo "  ✅ Updated .gitignore to prevent future commits"
echo "  ✅ Created .env.example with safe placeholders"
echo "  ✅ Validated no browser-exposed secrets"
echo ""
echo "Next steps:"
echo "  1. Review the changes in .env.local"
echo "  2. Add secrets to Vercel (see instructions above)"
echo "  3. Test locally: pnpm dev"
echo "  4. Commit changes: git add .env.example .gitignore"
echo ""
echo -e "${YELLOW}⚠️  DO NOT commit .env.local - it's now in .gitignore${NC}"
echo ""
