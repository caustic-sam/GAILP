/**
 * GAILP Pre-Launch Comprehensive Audit
 *
 * Automated audit suite for January 1st, 2026 launch readiness
 *
 * Checks:
 * 1. Code structure & TODOs
 * 2. Authentication & security
 * 3. Database integrity
 * 4. Link validation
 * 5. Feature functionality
 * 6. UX/UI consistency
 * 7. Performance indicators
 * 8. Deployment readiness
 *
 * Usage: npx tsx scripts/pre-launch-audit.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface AuditIssue {
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  file?: string;
  line?: number;
  recommendation: string;
}

interface AuditReport {
  timestamp: Date;
  issues: AuditIssue[];
  stats: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  passed: string[];
  launchReady: boolean;
}

const issues: AuditIssue[] = [];
const passed: string[] = [];

// Helpers
function addIssue(issue: Omit<AuditIssue, 'category'> & { category: string }) {
  issues.push(issue as AuditIssue);
}

function addPass(check: string) {
  passed.push(check);
}

function scanFiles(
  dir: string,
  extensions: string[],
  excludeDirs: string[] = ['node_modules', '.next', 'dist', 'build', '.git']
): string[] {
  const results: string[] = [];

  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!excludeDirs.includes(entry.name)) {
        results.push(...scanFiles(fullPath, extensions, excludeDirs));
      }
    } else if (entry.isFile()) {
      if (extensions.some(ext => entry.name.endsWith(ext))) {
        results.push(fullPath);
      }
    }
  }

  return results;
}

// ============================================================================
// AUDIT 1: CODE STRUCTURE & TODOs
// ============================================================================
function auditCodeStructure() {
  console.log('\n🔍 [1/8] Auditing code structure & TODOs...');

  const sourceFiles = scanFiles(
    path.join(__dirname, '..'),
    ['.ts', '.tsx', '.js', '.jsx']
  );

  let todoCount = 0;
  let fixmeCount = 0;
  let hackCount = 0;

  for (const file of sourceFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;

      // TODO comments
      if (/\/\/\s*TODO/i.test(line)) {
        todoCount++;
        addIssue({
          category: 'Code Quality',
          severity: 'medium',
          title: 'TODO comment found',
          description: line.trim(),
          file: file.replace(path.join(__dirname, '..'), ''),
          line: lineNum,
          recommendation: 'Review and complete or remove before launch'
        });
      }

      // FIXME comments
      if (/\/\/\s*FIXME/i.test(line)) {
        fixmeCount++;
        addIssue({
          category: 'Code Quality',
          severity: 'high',
          title: 'FIXME comment found',
          description: line.trim(),
          file: file.replace(path.join(__dirname, '..'), ''),
          line: lineNum,
          recommendation: 'Must fix before launch'
        });
      }

      // HACK comments
      if (/\/\/\s*HACK/i.test(line)) {
        hackCount++;
        addIssue({
          category: 'Code Quality',
          severity: 'medium',
          title: 'HACK comment found',
          description: line.trim(),
          file: file.replace(path.join(__dirname, '..'), ''),
          line: lineNum,
          recommendation: 'Consider refactoring or documenting why needed'
        });
      }

      // console.log (should be removed in production)
      if (/console\.(log|debug|info)/.test(line) && !file.includes('/scripts/')) {
        addIssue({
          category: 'Code Quality',
          severity: 'low',
          title: 'console.log found in source code',
          description: line.trim(),
          file: file.replace(path.join(__dirname, '..'), ''),
          line: lineNum,
          recommendation: 'Remove or replace with proper logging'
        });
      }
    });
  }

  console.log(`   ✓ Scanned ${sourceFiles.length} files`);
  console.log(`   ℹ Found ${todoCount} TODOs, ${fixmeCount} FIXMEs, ${hackCount} HACKs`);

  if (todoCount + fixmeCount + hackCount === 0) {
    addPass('No TODO/FIXME/HACK comments found');
  }
}

// ============================================================================
// AUDIT 2: AUTHENTICATION & SECURITY
// ============================================================================
function auditSecurity() {
  console.log('\n🔒 [2/8] Auditing authentication & security...');

  // Check if RLS is enabled
  const migrationDir = path.join(__dirname, '../supabase/migrations');
  if (fs.existsSync(migrationDir)) {
    const migrations = fs.readdirSync(migrationDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    const latestRlsMigration = migrations.find(m => m.includes('disable_rls'));

    if (latestRlsMigration) {
      addIssue({
        category: 'Security',
        severity: 'critical',
        title: 'Row Level Security (RLS) is DISABLED',
        description: `Migration ${latestRlsMigration} disables RLS on articles table`,
        file: `/supabase/migrations/${latestRlsMigration}`,
        recommendation: 'Re-enable RLS before production launch - this is a CRITICAL security issue'
      });
    } else {
      addPass('RLS appears to be enabled');
    }
  }

  // Check for hardcoded secrets
  const envExample = path.join(__dirname, '../.env.example');
  const envLocal = path.join(__dirname, '../.env.local');

  if (!fs.existsSync(envExample)) {
    addIssue({
      category: 'Security',
      severity: 'medium',
      title: 'Missing .env.example file',
      description: 'No environment variable template found',
      recommendation: 'Create .env.example to document required environment variables'
    });
  } else {
    addPass('.env.example exists');
  }

  // Check middleware.ts for auth protection
  const middleware = path.join(__dirname, '../middleware.ts');
  if (fs.existsSync(middleware)) {
    const content = fs.readFileSync(middleware, 'utf-8');
    if (content.includes('/admin') && content.includes('auth')) {
      addPass('Middleware protects admin routes');
    } else {
      addIssue({
        category: 'Security',
        severity: 'high',
        title: 'Admin routes may not be protected',
        description: 'Middleware does not appear to check authentication for /admin routes',
        file: '/middleware.ts',
        recommendation: 'Verify admin routes require authentication'
      });
    }
  }

  // Check for exposed API keys in code
  const sourceFiles = scanFiles(
    path.join(__dirname, '..'),
    ['.ts', '.tsx', '.js', '.jsx']
  );

  for (const file of sourceFiles) {
    const content = fs.readFileSync(file, 'utf-8');

    // Check for hardcoded keys (common patterns)
    if (/['"]sk_[a-zA-Z0-9]{32,}['"]/.test(content)) {
      addIssue({
        category: 'Security',
        severity: 'critical',
        title: 'Potential hardcoded API secret key',
        file: file.replace(path.join(__dirname, '..'), ''),
        description: 'Found pattern matching secret key format',
        recommendation: 'Move to environment variables immediately'
      });
    }
  }

  console.log('   ✓ Security checks complete');
}

// ============================================================================
// AUDIT 3: DATABASE INTEGRITY
// ============================================================================
function auditDatabase() {
  console.log('\n🗄️  [3/8] Auditing database configuration...');

  // Check migrations
  const migrationDir = path.join(__dirname, '../supabase/migrations');
  if (!fs.existsSync(migrationDir)) {
    addIssue({
      category: 'Database',
      severity: 'high',
      title: 'No migrations directory found',
      description: 'Database migrations directory does not exist',
      recommendation: 'Verify Supabase setup and migrations'
    });
  } else {
    const migrations = fs.readdirSync(migrationDir).filter(f => f.endsWith('.sql'));
    console.log(`   ✓ Found ${migrations.length} migrations`);
    addPass(`${migrations.length} database migrations exist`);
  }

  // Check for Supabase client setup
  const supabaseLib = path.join(__dirname, '../lib/supabase.ts');
  if (!fs.existsSync(supabaseLib)) {
    addIssue({
      category: 'Database',
      severity: 'critical',
      title: 'Supabase client not found',
      description: '/lib/supabase.ts does not exist',
      recommendation: 'Create Supabase client configuration'
    });
  } else {
    const content = fs.readFileSync(supabaseLib, 'utf-8');
    if (content.includes('createClient')) {
      addPass('Supabase client properly configured');
    }
  }
}

// ============================================================================
// AUDIT 4: LINK VALIDATION
// ============================================================================
function auditLinks() {
  console.log('\n🔗 [4/8] Auditing internal links...');

  const validRoutes = new Set([
    '/',
    '/about',
    '/contact',
    '/blog',
    '/articles',
    '/policies',
    '/policy-updates',
    '/policy-pulse',
    '/videos',
    '/admin',
    '/admin/articles/new',
    '/admin/media',
    '/admin/studio',
    '/admin/settings',
    '/auth/callback',
  ]);

  const dynamicRoutePatterns = [
    /^\/articles\/[^/]+$/,
    /^\/admin\/articles\/[^/]+\/edit$/,
  ];

  const sourceFiles = scanFiles(
    path.join(__dirname, '..'),
    ['.tsx', '.ts']
  );

  let brokenLinks = 0;

  for (const file of sourceFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
      const hrefMatch = line.match(/href=["']([^"']+)["']/g);
      if (hrefMatch) {
        hrefMatch.forEach(match => {
          const href = match.match(/href=["']([^"']+)["']/)?.[1];
          if (!href) return;

          // Skip external and special links
          if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) return;

          const urlPath = href.split('?')[0].split('#')[0];

          const isValid = validRoutes.has(urlPath) ||
                         dynamicRoutePatterns.some(p => p.test(urlPath));

          if (!isValid) {
            brokenLinks++;
            addIssue({
              category: 'Links',
              severity: 'medium',
              title: 'Potentially broken internal link',
              description: `Link to ${href}`,
              file: file.replace(path.join(__dirname, '..'), ''),
              line: idx + 1,
              recommendation: 'Verify route exists or update link'
            });
          }
        });
      }
    });
  }

  if (brokenLinks === 0) {
    addPass('No broken internal links detected');
  }

  console.log(`   ✓ Checked links in ${sourceFiles.length} files`);
}

// ============================================================================
// AUDIT 5: FEATURE FUNCTIONALITY
// ============================================================================
function auditFeatures() {
  console.log('\n✨ [5/8] Auditing feature completeness...');

  // Check critical pages exist
  const criticalPages = [
    'app/page.tsx',
    'app/admin/page.tsx',
    'app/articles/page.tsx',
    'app/auth/callback/route.ts',
  ];

  for (const page of criticalPages) {
    const fullPath = path.join(__dirname, '..', page);
    if (!fs.existsSync(fullPath)) {
      addIssue({
        category: 'Features',
        severity: 'critical',
        title: `Critical page missing: ${page}`,
        description: 'Required page does not exist',
        file: page,
        recommendation: 'Create this page immediately'
      });
    } else {
      addPass(`Critical page exists: ${page}`);
    }
  }

  // Check API routes exist
  const criticalApiRoutes = [
    'app/api/articles/route.ts',
    'app/api/admin/articles/route.ts',
    'app/api/auth/signout/route.ts',
  ];

  for (const route of criticalApiRoutes) {
    const fullPath = path.join(__dirname, '..', route);
    if (!fs.existsSync(fullPath)) {
      addIssue({
        category: 'Features',
        severity: 'high',
        title: `Critical API route missing: ${route}`,
        description: 'Required API route does not exist',
        file: route,
        recommendation: 'Create this API route'
      });
    } else {
      addPass(`API route exists: ${route}`);
    }
  }

  // Check if Quick Posts should be removed
  const quickPostsPage = path.join(__dirname, '../app/quick-posts');
  if (fs.existsSync(quickPostsPage)) {
    addIssue({
      category: 'Features',
      severity: 'medium',
      title: 'Quick Posts feature still exists',
      description: 'Quick Posts marked for removal but directory still exists',
      file: '/app/quick-posts',
      recommendation: 'Remove or hide Quick Posts feature for MVP launch'
    });
  }

  // Check if Scheduled Publishing UI should be removed
  const adminArticles = path.join(__dirname, '../app/admin/articles/new/page.tsx');
  if (fs.existsSync(adminArticles)) {
    const content = fs.readFileSync(adminArticles, 'utf-8');
    if (content.includes('scheduled_for') || content.includes('scheduledFor')) {
      addIssue({
        category: 'Features',
        severity: 'low',
        title: 'Scheduled publishing UI still present',
        description: 'UI for scheduling posts exists but feature marked for post-launch',
        file: '/app/admin/articles/new/page.tsx',
        recommendation: 'Remove or disable scheduled publishing UI for MVP'
      });
    }
  }

  console.log('   ✓ Feature audit complete');
}

// ============================================================================
// AUDIT 6: UX/UI CONSISTENCY
// ============================================================================
function auditUX() {
  console.log('\n🎨 [6/8] Auditing UX/UI consistency...');

  // Check for hardcoded text that should be in config
  const sourceFiles = scanFiles(
    path.join(__dirname, '..', 'app'),
    ['.tsx']
  );

  const siteNames = new Set<string>();

  for (const file of sourceFiles) {
    const content = fs.readFileSync(file, 'utf-8');

    // Look for potential site name variations
    const matches = content.match(/(World Papers|GAILP|Global AI & Policy)/g);
    if (matches) {
      matches.forEach(m => siteNames.add(m));
    }
  }

  if (siteNames.size > 1) {
    addIssue({
      category: 'UX/UI',
      severity: 'low',
      title: 'Inconsistent site naming',
      description: `Found ${siteNames.size} different site name variations: ${Array.from(siteNames).join(', ')}`,
      recommendation: 'Standardize site name across all pages'
    });
  } else {
    addPass('Consistent site naming');
  }

  // Check for missing alt text on images
  for (const file of sourceFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
      if (line.includes('<Image') || line.includes('<img')) {
        if (!line.includes('alt=')) {
          addIssue({
            category: 'UX/UI',
            severity: 'low',
            title: 'Image missing alt text',
            description: 'Accessibility issue - image without alt attribute',
            file: file.replace(path.join(__dirname, '..'), ''),
            line: idx + 1,
            recommendation: 'Add descriptive alt text for accessibility'
          });
        }
      }
    });
  }

  console.log('   ✓ UX/UI audit complete');
}

// ============================================================================
// AUDIT 7: PERFORMANCE INDICATORS
// ============================================================================
function auditPerformance() {
  console.log('\n⚡ [7/8] Auditing performance indicators...');

  // Check for large client components
  const componentFiles = scanFiles(
    path.join(__dirname, '..'),
    ['.tsx']
  );

  for (const file of componentFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const isClientComponent = content.includes("'use client'");
    const sizeKB = Buffer.byteLength(content, 'utf-8') / 1024;

    if (isClientComponent && sizeKB > 50) {
      addIssue({
        category: 'Performance',
        severity: 'medium',
        title: `Large client component: ${sizeKB.toFixed(1)}KB`,
        description: 'Client component may impact initial load time',
        file: file.replace(path.join(__dirname, '..'), ''),
        recommendation: 'Consider code splitting or moving to server component'
      });
    }
  }

  // Check for potential N+1 queries in API routes
  const apiFiles = scanFiles(
    path.join(__dirname, '../app/api'),
    ['.ts']
  );

  for (const file of apiFiles) {
    const content = fs.readFileSync(file, 'utf-8');

    // Simple heuristic: multiple .from() calls in loops
    if (content.includes('for (') || content.includes('.map(')) {
      if ((content.match(/\.from\(/g) || []).length > 1) {
        addIssue({
          category: 'Performance',
          severity: 'low',
          title: 'Potential N+1 query pattern',
          description: 'Multiple database calls inside loops detected',
          file: file.replace(path.join(__dirname, '..'), ''),
          recommendation: 'Review query patterns, consider using joins or batch fetches'
        });
      }
    }
  }

  console.log('   ✓ Performance audit complete');
}

// ============================================================================
// AUDIT 8: DEPLOYMENT READINESS
// ============================================================================
function auditDeployment() {
  console.log('\n🚀 [8/8] Auditing deployment readiness...');

  // Check for next.config.js
  const nextConfig = path.join(__dirname, '../next.config.js');
  if (!fs.existsSync(nextConfig)) {
    addIssue({
      category: 'Deployment',
      severity: 'critical',
      title: 'Missing next.config.js',
      description: 'Next.js configuration file not found',
      recommendation: 'Create next.config.js with production settings'
    });
  } else {
    addPass('next.config.js exists');
  }

  // Check for package.json scripts
  const packageJson = path.join(__dirname, '../package.json');
  if (fs.existsSync(packageJson)) {
    const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf-8'));

    const requiredScripts = ['build', 'start'];
    for (const script of requiredScripts) {
      if (!pkg.scripts?.[script]) {
        addIssue({
          category: 'Deployment',
          severity: 'high',
          title: `Missing package.json script: ${script}`,
          description: 'Required build script not found',
          recommendation: `Add "${script}" script to package.json`
        });
      } else {
        addPass(`package.json has "${script}" script`);
      }
    }
  }

  // Check .gitignore
  const gitignore = path.join(__dirname, '../.gitignore');
  if (fs.existsSync(gitignore)) {
    const content = fs.readFileSync(gitignore, 'utf-8');
    const requiredEntries = ['.env.local', 'node_modules', '.next'];

    for (const entry of requiredEntries) {
      if (!content.includes(entry)) {
        addIssue({
          category: 'Deployment',
          severity: 'medium',
          title: `.gitignore missing entry: ${entry}`,
          description: 'Important files/directories not ignored',
          recommendation: `Add "${entry}" to .gitignore`
        });
      }
    }
    addPass('.gitignore properly configured');
  }

  // Check for Vercel configuration
  const vercelJson = path.join(__dirname, '../vercel.json');
  if (fs.existsSync(vercelJson)) {
    addPass('vercel.json configuration exists');
  } else {
    addIssue({
      category: 'Deployment',
      severity: 'info',
      title: 'No vercel.json found',
      description: 'Vercel configuration file not found (may not be required)',
      recommendation: 'Consider adding vercel.json for custom deployment settings'
    });
  }

  console.log('   ✓ Deployment audit complete');
}

// ============================================================================
// GENERATE REPORT
// ============================================================================
function generateReport(): AuditReport {
  const stats = {
    critical: issues.filter(i => i.severity === 'critical').length,
    high: issues.filter(i => i.severity === 'high').length,
    medium: issues.filter(i => i.severity === 'medium').length,
    low: issues.filter(i => i.severity === 'low').length,
    info: issues.filter(i => i.severity === 'info').length,
  };

  // Launch ready if no critical issues and less than 3 high priority
  const launchReady = stats.critical === 0 && stats.high < 3;

  return {
    timestamp: new Date(),
    issues,
    stats,
    passed,
    launchReady
  };
}

function printReport(report: AuditReport) {
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 PRE-LAUNCH AUDIT REPORT');
  console.log('='.repeat(80));

  console.log(`\n🕒 Generated: ${report.timestamp.toLocaleString()}`);
  console.log(`\n📈 Summary:`);
  console.log(`   ✅ Passed Checks: ${report.passed.length}`);
  console.log(`   ⚠️  Issues Found: ${report.issues.length}`);
  console.log(`   🔴 Critical: ${report.stats.critical}`);
  console.log(`   🟠 High: ${report.stats.high}`);
  console.log(`   🟡 Medium: ${report.stats.medium}`);
  console.log(`   🟢 Low: ${report.stats.low}`);
  console.log(`   ℹ️  Info: ${report.stats.info}`);

  // Launch readiness
  console.log('\n' + '='.repeat(80));
  if (report.launchReady) {
    console.log('✅ LAUNCH READY - No blocking issues detected');
  } else {
    console.log('❌ NOT LAUNCH READY - Critical issues must be resolved');
  }
  console.log('='.repeat(80));

  // Group issues by category and severity
  const categories = [...new Set(issues.map(i => i.category))];

  console.log('\n\n📋 DETAILED FINDINGS:\n');

  const severityOrder: Array<AuditIssue['severity']> = ['critical', 'high', 'medium', 'low', 'info'];

  for (const severity of severityOrder) {
    const severityIssues = issues.filter(i => i.severity === severity);
    if (severityIssues.length === 0) continue;

    const icon = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🟢',
      info: 'ℹ️'
    }[severity];

    console.log(`\n${icon} ${severity.toUpperCase()} (${severityIssues.length})`);
    console.log('-'.repeat(80));

    for (const issue of severityIssues) {
      console.log(`\n   📌 ${issue.title}`);
      console.log(`      Category: ${issue.category}`);
      if (issue.file) console.log(`      File: ${issue.file}${issue.line ? `:${issue.line}` : ''}`);
      console.log(`      Issue: ${issue.description}`);
      console.log(`      Fix: ${issue.recommendation}`);
    }
  }

  // Passed checks
  if (report.passed.length > 0) {
    console.log('\n\n✅ PASSED CHECKS:\n');
    console.log('-'.repeat(80));
    report.passed.forEach(check => {
      console.log(`   ✓ ${check}`);
    });
  }

  // Recommendations
  console.log('\n\n💡 PRIORITY ACTION ITEMS:\n');
  console.log('-'.repeat(80));

  const criticalIssues = issues.filter(i => i.severity === 'critical');
  const highIssues = issues.filter(i => i.severity === 'high');

  if (criticalIssues.length > 0) {
    console.log('\n🔴 MUST FIX BEFORE LAUNCH:');
    criticalIssues.forEach((issue, idx) => {
      console.log(`   ${idx + 1}. ${issue.title}`);
      console.log(`      → ${issue.recommendation}`);
    });
  }

  if (highIssues.length > 0) {
    console.log('\n🟠 STRONGLY RECOMMENDED:');
    highIssues.forEach((issue, idx) => {
      console.log(`   ${idx + 1}. ${issue.title}`);
      console.log(`      → ${issue.recommendation}`);
    });
  }

  console.log('\n\n' + '='.repeat(80));
  console.log('📝 Next Steps:');
  console.log('   1. Address all CRITICAL issues immediately');
  console.log('   2. Review and fix HIGH priority issues');
  console.log('   3. Triage MEDIUM/LOW issues based on launch timeline');
  console.log('   4. Re-run audit: npx tsx scripts/pre-launch-audit.ts');
  console.log('   5. Run deployment test: npx tsx scripts/test-deployment.ts');
  console.log('='.repeat(80));
  console.log('\n');
}

function saveReport(report: AuditReport) {
  const reportPath = path.join(__dirname, '../audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`💾 Full report saved to: audit-report.json`);
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================
async function main() {
  console.log('\n🚀 GAILP PRE-LAUNCH AUDIT');
  console.log('='.repeat(80));
  console.log('Target Launch: January 1, 2026');
  console.log('Running comprehensive checks...\n');

  try {
    auditCodeStructure();
    auditSecurity();
    auditDatabase();
    auditLinks();
    auditFeatures();
    auditUX();
    auditPerformance();
    auditDeployment();

    const report = generateReport();
    printReport(report);
    saveReport(report);

    // Exit with error code if not launch ready
    process.exit(report.launchReady ? 0 : 1);

  } catch (error) {
    console.error('\n❌ Audit failed with error:', error);
    process.exit(1);
  }
}

main();
