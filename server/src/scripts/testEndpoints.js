/**
 * API Endpoints Test
 * Test the new API endpoints we've created
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5001/api/v1';

async function testEndpoint(endpoint, method = 'GET', headers = {}, body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function testAPIEndpoints() {
  console.log("🌐 TESTING API ENDPOINTS");
  console.log("=" * 40);

  const tests = [
    {
      name: "Cache Health Check",
      endpoint: "/cache/health",
      method: "GET"
    },
    {
      name: "Monitoring Health Check",
      endpoint: "/monitoring/health",
      method: "GET"
    },
    {
      name: "Cache Stats (requires auth)",
      endpoint: "/cache/stats",
      method: "GET",
      requiresAuth: true
    },
    {
      name: "Analytics User Data (requires auth)",
      endpoint: "/analytics/user",
      method: "GET",
      requiresAuth: true
    },
    {
      name: "Monitoring Performance",
      endpoint: "/monitoring/performance",
      method: "GET",
      requiresAuth: true
    }
  ];

  const results = [];

  for (const test of tests) {
    console.log(`\n🔍 Testing ${test.name}...`);

    if (test.requiresAuth) {
      console.log("⚠️ Skipping auth-required endpoint (no test token)");
      results.push({
        name: test.name,
        status: "SKIPPED",
        reason: "Requires authentication"
      });
      continue;
    }

    const result = await testEndpoint(test.endpoint, test.method);

    if (result.success) {
      console.log(`✅ ${test.name}: ${result.status}`);
      results.push({
        name: test.name,
        status: "PASS",
        httpStatus: result.status
      });
    } else {
      console.log(`❌ ${test.name}: ${result.error || result.status}`);
      results.push({
        name: test.name,
        status: "FAIL",
        error: result.error,
        httpStatus: result.status
      });
    }
  }

  // Summary
  console.log("\n" + "=" * 40);
  console.log("📊 ENDPOINT TEST SUMMARY");
  console.log("=" * 40);

  const passed = results.filter(r => r.status === "PASS").length;
  const skipped = results.filter(r => r.status === "SKIPPED").length;
  const total = results.length;

  results.forEach(result => {
    let status;
    if (result.status === "PASS") status = "✅ PASS";
    else if (result.status === "SKIPPED") status = "⏭️ SKIP";
    else status = "❌ FAIL";

    console.log(`${status} ${result.name}`);
    if (result.error) {
      console.log(`    Error: ${result.error}`);
    }
    if (result.reason) {
      console.log(`    Reason: ${result.reason}`);
    }
  });

  console.log(`\n📈 Results: ${passed} passed, ${skipped} skipped, ${total - passed - skipped} failed`);

  return { passed, skipped, total, results };
}

// Check if server is running first
async function checkServerRunning() {
  console.log("🔍 Checking if server is running...");
  try {
    const response = await fetch(`${BASE_URL.replace('/api/v1', '')}/health`);
    if (response.ok) {
      console.log("✅ Server is running");
      return true;
    } else {
      console.log("❌ Server responded but not healthy");
      return false;
    }
  } catch (error) {
    console.log("❌ Server is not running or not accessible");
    console.log("💡 Start the server with: npm start");
    return false;
  }
}

// Main execution
async function main() {
  const serverRunning = await checkServerRunning();

  if (!serverRunning) {
    console.log("\n⚠️ Cannot test endpoints - server is not running");
    console.log("Please start the server first and then run this test again.");
    process.exit(1);
  }

  const results = await testAPIEndpoints();

  if (results.passed > 0) {
    console.log("\n🎉 API endpoints are accessible!");
  } else {
    console.log("\n⚠️ No endpoints passed tests");
  }

  process.exit(0);
}

main().catch(error => {
  console.error("Test failed:", error);
  process.exit(1);
});
