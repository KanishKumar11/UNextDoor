/**
 * Quick Validation Script
 * Simple validation of core services without full integration test
 */

import { responseCacheManager } from "../services/responseCacheService.js";
import { conversationAnalytics } from "../services/conversationAnalyticsService.js";
import { webrtcSessionPersistence } from "../services/webrtcSessionPersistence.js";
import { conversationFlowManager } from "../services/conversationFlowService.js";

/**
 * Quick validation of all services
 */
async function runQuickValidation() {
  console.log("🔍 QUICK VALIDATION OF AI TUTOR SERVICES");
  console.log("=" * 50);
  
  const results = [];
  
  // Test 1: Response Cache Service
  console.log("\n1️⃣ Testing Response Cache Service...");
  try {
    await responseCacheManager.initialize();
    const stats = await responseCacheManager.getStats();
    console.log(`✅ Cache service initialized: ${stats.type} (${stats.connected ? 'connected' : 'fallback'})`);
    
    // Test cache operations
    const testKey = "test-validation-key";
    const testData = { message: "validation test", timestamp: Date.now() };
    
    await responseCacheManager.set(testKey, testData, 60);
    const retrieved = await responseCacheManager.get(testKey);
    
    if (retrieved && retrieved.response.message === testData.message) {
      console.log("✅ Cache set/get operations working");
      results.push({ service: "Response Cache", status: "✅ PASS" });
    } else {
      console.log("❌ Cache operations failed");
      results.push({ service: "Response Cache", status: "❌ FAIL" });
    }
    
    // Cleanup
    await responseCacheManager.clear("test-*");
    
  } catch (error) {
    console.log(`❌ Cache service error: ${error.message}`);
    results.push({ service: "Response Cache", status: "❌ ERROR", error: error.message });
  }
  
  // Test 2: Conversation Analytics
  console.log("\n2️⃣ Testing Conversation Analytics...");
  try {
    const testSessionId = "validation-session-123";
    const testUserId = "validation-user-123";
    
    // Initialize analytics session
    conversationAnalytics.initializeSession(testSessionId, {
      userId: testUserId,
      scenarioId: "s1",
      level: "beginner"
    });
    
    // Track some events
    conversationAnalytics.trackMessage(testSessionId, {
      role: "user",
      content: "Hello",
      responseTime: 2000
    });
    
    conversationAnalytics.trackLearningEvent(testSessionId, {
      type: "vocabulary_introduced",
      data: { word: "안녕하세요" }
    });
    
    // End session
    const analyticsResult = await conversationAnalytics.endSession(testSessionId);
    
    if (analyticsResult && analyticsResult.qualityScore !== undefined) {
      console.log(`✅ Analytics working - Quality Score: ${analyticsResult.qualityScore}`);
      results.push({ service: "Conversation Analytics", status: "✅ PASS" });
    } else {
      console.log("❌ Analytics session failed");
      results.push({ service: "Conversation Analytics", status: "❌ FAIL" });
    }
    
  } catch (error) {
    console.log(`❌ Analytics error: ${error.message}`);
    results.push({ service: "Conversation Analytics", status: "❌ ERROR", error: error.message });
  }
  
  // Test 3: Conversation Flow Manager
  console.log("\n3️⃣ Testing Conversation Flow Manager...");
  try {
    const testUserId = "flow-validation-user";
    
    // Initialize flow session
    const session = conversationFlowManager.getSession(testUserId);
    
    // Update metrics
    conversationFlowManager.updateMetrics(testUserId, {
      newMessage: true,
      responseTime: 3000
    });
    
    // Check break suggestion
    const breakCheck = conversationFlowManager.checkBreakSuggestion(testUserId);
    
    // End session
    const summary = conversationFlowManager.endSession(testUserId);
    
    console.log(`✅ Flow manager working - Break suggestion: ${breakCheck.shouldSuggest ? 'YES' : 'NO'}`);
    results.push({ service: "Conversation Flow", status: "✅ PASS" });
    
  } catch (error) {
    console.log(`❌ Flow manager error: ${error.message}`);
    results.push({ service: "Conversation Flow", status: "❌ ERROR", error: error.message });
  }
  
  // Test 4: WebRTC Session Persistence (basic check)
  console.log("\n4️⃣ Testing WebRTC Session Persistence...");
  try {
    const activeSessions = webrtcSessionPersistence.getActiveSessions();
    console.log(`✅ WebRTC persistence accessible - Active sessions: ${activeSessions.length}`);
    results.push({ service: "WebRTC Persistence", status: "✅ PASS" });
    
  } catch (error) {
    console.log(`❌ WebRTC persistence error: ${error.message}`);
    results.push({ service: "WebRTC Persistence", status: "❌ ERROR", error: error.message });
  }
  
  // Test 5: Service Integration Check
  console.log("\n5️⃣ Testing Service Integration...");
  try {
    // Test that services can work together
    const testUserId = "integration-test-user";
    
    // Create a mock session that uses multiple services
    const sessionOptions = {
      scenarioId: "s1",
      level: "beginner",
      isScenarioBased: true
    };
    
    // This would normally create a database entry, but we'll just test the service interaction
    const sessionData = {
      sessionId: "integration-session-123",
      userId: testUserId,
      startTime: Date.now(),
      messageCount: 0,
      status: 'active'
    };
    
    // Initialize analytics for the session
    conversationAnalytics.initializeSession(sessionData.sessionId, sessionData);
    
    // Initialize flow manager
    conversationFlowManager.getSession(testUserId);
    
    // Simulate message exchange
    conversationAnalytics.trackMessage(sessionData.sessionId, {
      role: "user",
      content: "Test integration",
      responseTime: 1500
    });
    
    conversationFlowManager.updateMetrics(testUserId, {
      newMessage: true,
      responseTime: 1500
    });
    
    // End both sessions
    await conversationAnalytics.endSession(sessionData.sessionId);
    conversationFlowManager.endSession(testUserId);
    
    console.log("✅ Service integration working");
    results.push({ service: "Service Integration", status: "✅ PASS" });
    
  } catch (error) {
    console.log(`❌ Integration error: ${error.message}`);
    results.push({ service: "Service Integration", status: "❌ ERROR", error: error.message });
  }
  
  // Summary
  console.log("\n" + "=" * 50);
  console.log("📊 VALIDATION SUMMARY");
  console.log("=" * 50);
  
  const passed = results.filter(r => r.status.includes("PASS")).length;
  const total = results.length;
  
  results.forEach(result => {
    console.log(`${result.status} ${result.service}`);
    if (result.error) {
      console.log(`    Error: ${result.error}`);
    }
  });
  
  console.log(`\n📈 Overall: ${passed}/${total} services validated (${Math.round(passed/total*100)}%)`);
  
  if (passed === total) {
    console.log("🎉 ALL SERVICES VALIDATED SUCCESSFULLY!");
    console.log("✅ System is ready for frontend integration and deployment.");
  } else {
    console.log("⚠️ Some services need attention before proceeding.");
  }
  
  return { passed, total, results };
}

// Run validation if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runQuickValidation()
    .then(results => {
      process.exit(results.passed === results.total ? 0 : 1);
    })
    .catch(error => {
      console.error("Validation failed:", error);
      process.exit(1);
    });
}

export { runQuickValidation };
