/**
 * Check for Old Role References
 *
 * Scans codebase for references to removed roles (publisher, contributor)
 * Run this after role changes to ensure consistency
 *
 * Usage: npx tsx scripts/check-role-references.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const OLD_ROLES = ['publisher', 'contributor'];
const issues: Array<{ file: string; line: number; content: string }> = [];

function scanFiles(dir: string, excludeDirs: string[] = ['node_modules', '.next', '.git', 'dist']) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!excludeDirs.includes(entry.name)) {
        scanFiles(fullPath, excludeDirs);
      }
    } else if (entry.isFile()) {
      // Only check TypeScript/JavaScript files in app, components, lib
      if ((fullPath.includes('/app/') || fullPath.includes('/components/') || fullPath.includes('/lib/')) &&
          (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        checkFile(fullPath);
      }
    }
  }
}

function checkFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;

    // Check for old role references
    OLD_ROLES.forEach(role => {
      const regex = new RegExp(`['"]${role}['"]`, 'i');
      if (regex.test(line)) {
        issues.push({
          file: filePath.replace(process.cwd(), ''),
          line: idx + 1,
          content: line.trim()
        });
      }
    });
  });
}

// Main execution
console.log('\n🔍 CHECKING FOR OLD ROLE REFERENCES\n');
console.log('='.repeat(60));
console.log(`Looking for: ${OLD_ROLES.join(', ')}`);
console.log('Scanning: app/, components/, lib/');
console.log('='.repeat(60));

scanFiles(process.cwd());

if (issues.length === 0) {
  console.log('\n✅ No old role references found!');
  console.log('\nCurrent simplified roles: admin, reader\n');
} else {
  console.log(`\n⚠️  Found ${issues.length} potential issue(s):\n`);

  issues.forEach(issue => {
    console.log(`📄 ${issue.file}:${issue.line}`);
    console.log(`   ${issue.content}`);
    console.log('');
  });

  console.log('💡 Action Required:');
  console.log('   - Review each reference');
  console.log('   - Update to use simplified roles (admin, reader)');
  console.log('   - Or document why the reference is acceptable');
  console.log('');
}

console.log('='.repeat(60));
console.log('\n');

process.exit(issues.length > 0 ? 1 : 0);
