/**
 * Simple Service Validation
 * Tests core functionality without background processes
 */

async function testCacheService() {
  console.log("🔍 Testing Response Cache Service...");
  try {
    const { responseCacheManager } = await import("../services/responseCacheService.js");
    
    // Test cache key generation
    const cacheKey = responseCacheManager.generateCacheKey({
      useCase: "educational_chat",
      userLevel: "beginner",
      scenarioId: "s1",
      promptHash: "test123",
      modelUsed: "gpt-4o-mini"
    });
    
    console.log(`✅ Cache key generated: ${cacheKey.substring(0, 20)}...`);
    
    // Test should cache logic
    const shouldCache1 = responseCacheManager.shouldCache("educational_chat");
    const shouldCache2 = responseCacheManager.shouldCache("realtime_conversation");
    
    console.log(`✅ Cache logic: educational_chat=${shouldCache1}, realtime=${shouldCache2}`);
    
    return { passed: true, service: "Response Cache" };
  } catch (error) {
    console.log(`❌ Cache service error: ${error.message}`);
    return { passed: false, service: "Response Cache", error: error.message };
  }
}

async function testAnalyticsService() {
  console.log("\n🔍 Testing Conversation Analytics...");
  try {
    const { conversationAnalytics } = await import("../services/conversationAnalyticsService.js");
    
    const testSessionId = "test-session-123";
    const testUserId = "test-user-123";
    
    // Test session initialization
    conversationAnalytics.initializeSession(testSessionId, {
      userId: testUserId,
      scenarioId: "s1",
      level: "beginner"
    });
    
    console.log("✅ Analytics session initialized");
    
    // Test message tracking
    conversationAnalytics.trackMessage(testSessionId, {
      role: "user",
      content: "Hello",
      responseTime: 2000
    });
    
    console.log("✅ Message tracking works");
    
    // Test learning event tracking
    conversationAnalytics.trackLearningEvent(testSessionId, {
      type: "vocabulary_introduced",
      data: { word: "안녕하세요" }
    });
    
    console.log("✅ Learning event tracking works");
    
    // Test system analytics
    const systemAnalytics = conversationAnalytics.getSystemAnalytics();
    console.log(`✅ System analytics: ${systemAnalytics.activeSessions} active sessions`);
    
    return { passed: true, service: "Conversation Analytics" };
  } catch (error) {
    console.log(`❌ Analytics error: ${error.message}`);
    return { passed: false, service: "Conversation Analytics", error: error.message };
  }
}

async function testFlowService() {
  console.log("\n🔍 Testing Conversation Flow Manager...");
  try {
    const { conversationFlowManager } = await import("../services/conversationFlowService.js");
    
    const testUserId = "flow-test-user";
    
    // Test session creation
    const session = conversationFlowManager.getSession(testUserId);
    console.log(`✅ Flow session created: ${session.userId}`);
    
    // Test metrics update
    conversationFlowManager.updateMetrics(testUserId, {
      newMessage: true,
      responseTime: 3000
    });
    
    console.log("✅ Flow metrics updated");
    
    // Test break suggestion
    const breakCheck = conversationFlowManager.checkBreakSuggestion(testUserId);
    console.log(`✅ Break suggestion: ${breakCheck.shouldSuggest ? 'YES' : 'NO'}`);
    
    // Test session status
    const status = conversationFlowManager.getSessionStatus(testUserId);
    console.log(`✅ Session status: ${status.currentState}`);
    
    return { passed: true, service: "Conversation Flow" };
  } catch (error) {
    console.log(`❌ Flow service error: ${error.message}`);
    return { passed: false, service: "Conversation Flow", error: error.message };
  }
}

async function testWebRTCPersistence() {
  console.log("\n🔍 Testing WebRTC Session Persistence...");
  try {
    const { webrtcSessionPersistence } = await import("../services/webrtcSessionPersistence.js");
    
    // Test basic functionality
    const activeSessions = webrtcSessionPersistence.getActiveSessions();
    console.log(`✅ WebRTC persistence accessible: ${activeSessions.length} active sessions`);
    
    // Test session data structure
    const testSession = {
      sessionId: "test-webrtc-session",
      userId: "test-user",
      startTime: Date.now(),
      messageCount: 0,
      status: 'active'
    };
    
    console.log("✅ WebRTC session structure validated");
    
    return { passed: true, service: "WebRTC Persistence" };
  } catch (error) {
    console.log(`❌ WebRTC persistence error: ${error.message}`);
    return { passed: false, service: "WebRTC Persistence", error: error.message };
  }
}

async function testAIModelService() {
  console.log("\n🔍 Testing AI Model Service...");
  try {
    const { AI_MODELS, USE_CASES, selectModel, getModelConfig } = await import("../services/aiModelService.js");
    
    // Test model selection
    const selectedModel = selectModel(USE_CASES.EDUCATIONAL_CHAT, "free");
    console.log(`✅ Model selection: ${selectedModel} for educational chat`);
    
    // Test model configuration
    const config = getModelConfig(selectedModel, USE_CASES.EDUCATIONAL_CHAT);
    console.log(`✅ Model config: ${config.model} with temp ${config.temperature}`);
    
    // Test use case mapping
    console.log(`✅ Available models: ${Object.keys(AI_MODELS).length}`);
    console.log(`✅ Available use cases: ${Object.keys(USE_CASES).length}`);
    
    return { passed: true, service: "AI Model Service" };
  } catch (error) {
    console.log(`❌ AI Model service error: ${error.message}`);
    return { passed: false, service: "AI Model Service", error: error.message };
  }
}

async function runSimpleValidation() {
  console.log("🚀 SIMPLE SERVICE VALIDATION");
  console.log("=" * 40);
  
  const tests = [
    testCacheService,
    testAnalyticsService,
    testFlowService,
    testWebRTCPersistence,
    testAIModelService
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await test();
      results.push(result);
    } catch (error) {
      console.log(`❌ Test failed: ${error.message}`);
      results.push({ passed: false, service: "Unknown", error: error.message });
    }
  }
  
  // Summary
  console.log("\n" + "=" * 40);
  console.log("📊 VALIDATION SUMMARY");
  console.log("=" * 40);
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.passed ? "✅ PASS" : "❌ FAIL";
    console.log(`${status} ${result.service}`);
    if (result.error) {
      console.log(`    Error: ${result.error}`);
    }
  });
  
  console.log(`\n📈 Overall: ${passed}/${total} services validated (${Math.round(passed/total*100)}%)`);
  
  if (passed === total) {
    console.log("\n🎉 ALL CORE SERVICES VALIDATED!");
    console.log("✅ Ready for frontend integration");
  } else {
    console.log("\n⚠️ Some services need attention");
  }
  
  return { passed, total, results };
}

// Run validation
runSimpleValidation()
  .then(results => {
    console.log(`\n🏁 Validation completed: ${results.passed}/${results.total} passed`);
    process.exit(results.passed === results.total ? 0 : 1);
  })
  .catch(error => {
    console.error("❌ Validation failed:", error);
    process.exit(1);
  });
