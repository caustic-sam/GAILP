/**
 * Quick Smoke Test
 *
 * Fast 30-second test of critical functionality
 * Usage: npx tsx scripts/smoke-test.ts [deployment-url]
 */

const url = process.argv[2] || 'http://localhost:3000';

const tests = [
  { name: 'Homepage loads', path: '/' },
  { name: 'Admin accessible', path: '/admin' },
  { name: 'API responds', path: '/api/stats' },
];

async function smokeTest() {
  console.log(`\n💨 SMOKE TEST: ${url}\n`);

  let passed = 0;

  for (const test of tests) {
    try {
      const response = await fetch(`${url}${test.path}`);
      if (response.ok) {
        console.log(`✅ ${test.name}`);
        passed++;
      } else {
        console.log(`❌ ${test.name} (${response.status})`);
      }
    } catch (error) {
      console.log(`❌ ${test.name} (error)`);
    }
  }

  console.log(`\n${passed}/${tests.length} tests passed\n`);
  process.exit(passed === tests.length ? 0 : 1);
}

smokeTest();
