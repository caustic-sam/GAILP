/**
 * Automated Deployment Health Check
 *
 * Tests critical endpoints and functionality after deployment
 * Usage: DEPLOYMENT_URL=https://your-app.vercel.app npx tsx scripts/test-deployment.ts
 */

const DEPLOYMENT_URL = process.env.DEPLOYMENT_URL || 'http://localhost:3000';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  critical: boolean;
}

const results: TestResult[] = [];

async function testEndpoint(name: string, path: string, critical = false): Promise<TestResult> {
  try {
    const url = `${DEPLOYMENT_URL}${path}`;
    console.log(`Testing: ${name} (${url})`);

    const response = await fetch(url);
    const passed = response.ok;

    return {
      name,
      passed,
      message: passed ? `✅ ${response.status}` : `❌ ${response.status} ${response.statusText}`,
      critical
    };
  } catch (error) {
    return {
      name,
      passed: false,
      message: `❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`,
      critical
    };
  }
}

async function testAPIEndpoint(name: string, path: string, critical = false): Promise<TestResult> {
  try {
    const url = `${DEPLOYMENT_URL}${path}`;
    console.log(`Testing API: ${name} (${url})`);

    const response = await fetch(url);
    const passed = response.ok;

    if (passed) {
      const data = await response.json();
      const hasData = data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0);

      return {
        name,
        passed: hasData,
        message: hasData ? `✅ ${response.status} (has data)` : `⚠️ ${response.status} (empty response)`,
        critical
      };
    }

    return {
      name,
      passed: false,
      message: `❌ ${response.status} ${response.statusText}`,
      critical
    };
  } catch (error) {
    return {
      name,
      passed: false,
      message: `❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`,
      critical
    };
  }
}

async function runTests() {
  console.log('\n🚀 DEPLOYMENT HEALTH CHECK\n');
  console.log('='.repeat(60));
  console.log(`Testing: ${DEPLOYMENT_URL}\n`);

  // Critical Page Tests
  console.log('\n📄 CRITICAL PAGES:');
  results.push(await testEndpoint('Homepage', '/', true));
  results.push(await testEndpoint('Admin Dashboard', '/admin', true));
  results.push(await testEndpoint('Media Vault', '/admin/media', true));
  results.push(await testEndpoint('New Article', '/admin/articles/new', true));

  // Public Pages
  console.log('\n📄 PUBLIC PAGES:');
  results.push(await testEndpoint('Think Tank', '/blog', false));
  results.push(await testEndpoint('Policy Updates', '/policy-updates', false));
  results.push(await testEndpoint('Policy Pulse', '/policy-pulse', false));
  results.push(await testEndpoint('About', '/about', false));

  // API Endpoints
  console.log('\n🔌 API ENDPOINTS:');
  results.push(await testAPIEndpoint('Stats API', '/api/stats', true));
  results.push(await testAPIEndpoint('Articles API', '/api/articles', true));
  results.push(await testAPIEndpoint('Videos API', '/api/videos', false));

  // Print Results
  console.log('\n📊 RESULTS:');
  console.log('='.repeat(60));

  const criticalTests = results.filter(r => r.critical);
  const nonCriticalTests = results.filter(r => !r.critical);

  console.log('\n🔴 CRITICAL TESTS:');
  criticalTests.forEach(r => {
    console.log(`  ${r.passed ? '✅' : '❌'} ${r.name}: ${r.message}`);
  });

  console.log('\n🟡 NON-CRITICAL TESTS:');
  nonCriticalTests.forEach(r => {
    console.log(`  ${r.passed ? '✅' : '⚠️'} ${r.name}: ${r.message}`);
  });

  // Summary
  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const criticalPassed = criticalTests.filter(r => r.passed).length;
  const criticalTotal = criticalTests.length;

  console.log('\n📋 SUMMARY:');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${passedTests}/${totalTests} passed (${Math.round(passedTests/totalTests*100)}%)`);
  console.log(`Critical Tests: ${criticalPassed}/${criticalTotal} passed (${Math.round(criticalPassed/criticalTotal*100)}%)`);

  // Deployment Status
  console.log('\n🎯 DEPLOYMENT STATUS:');
  if (criticalPassed === criticalTotal && passedTests >= totalTests * 0.8) {
    console.log('✅ READY FOR PRODUCTION');
    console.log('All critical tests passed. Deployment is healthy.');
  } else if (criticalPassed === criticalTotal) {
    console.log('⚠️ READY WITH WARNINGS');
    console.log('Critical tests passed but some non-critical tests failed.');
  } else {
    console.log('❌ NOT READY');
    console.log('Critical tests failed. Fix issues before deploying.');
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Exit code
  process.exit(criticalPassed === criticalTotal ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
