/**
 * Link Validation Utility
 *
 * Scans all TypeScript/TSX files for internal links and validates them
 * against the actual route structure.
 *
 * Usage: npx tsx scripts/validate-links.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface LinkIssue {
  file: string;
  line: number;
  link: string;
  type: 'broken' | 'warning';
  message: string;
}

// Valid routes in the application
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
  '/admin/quick-posts',
  '/admin/import/wordpress',
  '/login',
  '/auth/callback',
  '/components',
]);

// Dynamic route patterns (e.g., /articles/[slug])
const dynamicRoutePatterns = [
  /^\/articles\/[^/]+$/,        // /articles/some-slug
  /^\/admin\/articles\/[^/]+\/edit$/, // /admin/articles/123/edit
];

const issues: LinkIssue[] = [];

function isValidRoute(href: string): boolean {
  // Strip query params and hash for validation
  const urlPath = href.split('?')[0].split('#')[0];

  // Exact match
  if (validRoutes.has(urlPath)) return true;

  // Dynamic route match
  return dynamicRoutePatterns.some(pattern => pattern.test(urlPath));
}

function extractLinks(content: string, filePath: string) {
  const lines = content.split('\n');

  // Patterns to match
  const patterns = [
    /href=["']([^"']+)["']/g,           // href="..." or href='...'
    /<Link\s+href=["']([^"']+)["']/g,  // <Link href="...">
    /router\.push\(["']([^"']+)["']\)/g, // router.push("...")
  ];

  lines.forEach((line, idx) => {
    patterns.forEach(pattern => {
      let match;
      const regex = new RegExp(pattern);

      while ((match = regex.exec(line)) !== null) {
        const href = match[1];

        // Skip external links
        if (href.startsWith('http://') || href.startsWith('https://')) continue;
        if (href.startsWith('mailto:')) continue;

        // Skip hash links
        if (href.startsWith('#')) continue;

        // Skip empty or placeholder links
        if (href === '' || href === '#') continue;

        // Check if route is valid
        if (!isValidRoute(href)) {
          issues.push({
            file: filePath,
            line: idx + 1,
            link: href,
            type: 'broken',
            message: 'Route does not exist'
          });
        }
      }
    });
  });
}

function scanDirectory(dir: string, excludeDirs: string[] = ['node_modules', '.next', 'dist', 'build']) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!excludeDirs.includes(entry.name)) {
        scanDirectory(fullPath, excludeDirs);
      }
    } else if (entry.isFile()) {
      if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        extractLinks(content, fullPath);
      }
    }
  }
}

// Main execution
console.log('\n🔗 LINK VALIDATION REPORT\n');
console.log('='.repeat(60));

const projectRoot = path.join(__dirname, '..');
const appDir = path.join(projectRoot, 'app');
const componentsDir = path.join(projectRoot, 'components');

console.log('\n📂 Scanning directories:');
console.log('   - app/');
console.log('   - components/');

scanDirectory(appDir);
scanDirectory(componentsDir);

console.log('\n📊 Results:');
console.log('='.repeat(60));

if (issues.length === 0) {
  console.log('\n✅ All links valid! No broken routes detected.\n');
} else {
  console.log(`\n❌ Found ${issues.length} potential issue(s):\n`);

  // Group by file
  const byFile = issues.reduce((acc, issue) => {
    if (!acc[issue.file]) acc[issue.file] = [];
    acc[issue.file].push(issue);
    return acc;
  }, {} as Record<string, LinkIssue[]>);

  Object.entries(byFile).forEach(([file, fileIssues]) => {
    console.log(`\n📄 ${file.replace(projectRoot, '')}`);
    fileIssues.forEach(issue => {
      console.log(`   Line ${issue.line}: ${issue.link}`);
      console.log(`   └─ ${issue.message}`);
    });
  });

  console.log('\n💡 Suggestions:');
  console.log('   1. Update broken links to valid routes');
  console.log('   2. Add new routes to validRoutes set if they exist');
  console.log('   3. Check for typos in route paths');
  console.log('');
}

console.log('='.repeat(60));
console.log('\n📋 Valid Routes Reference:');
console.log('   Public Routes:');
validRoutes.forEach(route => {
  if (!route.startsWith('/admin')) {
    console.log(`     - ${route}`);
  }
});
console.log('\n   Admin Routes:');
validRoutes.forEach(route => {
  if (route.startsWith('/admin')) {
    console.log(`     - ${route}`);
  }
});
console.log('\n   Dynamic Routes:');
dynamicRoutePatterns.forEach(pattern => {
  console.log(`     - ${pattern.toString()}`);
});

console.log('\n');
process.exit(issues.length > 0 ? 1 : 0);
