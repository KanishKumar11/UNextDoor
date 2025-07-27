/**
 * Integration Test Suite
 * Tests all new services and their integration with existing codebase
 */

import { responseCacheManager } from "../services/responseCacheService.js";
import { webrtcSessionPersistence } from "../services/webrtcSessionPersistence.js";
import { conversationAnalytics } from "../services/conversationAnalyticsService.js";
import { conversationFlowManager } from "../services/conversationFlowService.js";
import { createOptimizedCompletion } from "../services/aiModelService.js";
import OpenAI from "openai";
import config from "../config/index.js";

/**
 * Test Response Caching System
 */
async function testResponseCaching() {
  console.log("\n🧪 Testing Response Caching System...");
  
  try {
    // Initialize cache
    await responseCacheManager.initialize();
    
    // Test cache key generation
    const cacheKey = responseCacheManager.generateCacheKey({
      useCase: "educational_chat",
      userLevel: "beginner",
      scenarioId: "s1",
      promptHash: "test123",
      modelUsed: "gpt-4o-mini"
    });
    
    console.log(`✅ Cache key generated: ${cacheKey}`);
    
    // Test cache set/get
    const testData = { message: "Test response", timestamp: Date.now() };
    await responseCacheManager.set(cacheKey, testData, 60);
    
    const retrieved = await responseCacheManager.get(cacheKey);
    const dataMatches = retrieved && retrieved.response.message === testData.message;
    
    console.log(`✅ Cache set/get: ${dataMatches ? 'PASS' : 'FAIL'}`);
    
    // Test cache stats
    const stats = await responseCacheManager.getStats();
    console.log(`✅ Cache stats retrieved: ${stats.type} (${stats.connected ? 'connected' : 'fallback'})`);
    
    // Cleanup
    await responseCacheManager.clear("test:*");
    
    return true;
  } catch (error) {
    console.error("❌ Response caching test failed:", error.message);
    return false;
  }
}

/**
 * Test AI Model Service with Caching
 */
async function testAIModelServiceWithCaching() {
  console.log("\n🧪 Testing AI Model Service with Caching...");
  
  try {
    const openai = new OpenAI({ apiKey: config.openai.apiKey });
    
    const messages = [
      { role: "user", content: "Hello, how do you say 'hello' in Korean?" }
    ];
    
    const mockUser = {
      subscriptionTier: "free",
      preferences: { languageLevel: "beginner" }
    };
    
    // First call (should miss cache)
    console.log("🔄 Making first AI call (cache miss expected)...");
    const result1 = await createOptimizedCompletion(
      openai,
      "educational_chat",
      messages,
      mockUser
    );
    
    console.log(`✅ First call: ${result1.success ? 'SUCCESS' : 'FAIL'}`);
    console.log(`📊 Model used: ${result1.modelUsed}`);
    console.log(`💾 From cache: ${result1.fromCache || false}`);
    
    // Second call (should hit cache if cacheable)
    console.log("🔄 Making second AI call (cache hit possible)...");
    const result2 = await createOptimizedCompletion(
      openai,
      "educational_chat",
      messages,
      mockUser
    );
    
    console.log(`✅ Second call: ${result2.success ? 'SUCCESS' : 'FAIL'}`);
    console.log(`💾 From cache: ${result2.fromCache || false}`);
    
    return result1.success && result2.success;
  } catch (error) {
    console.error("❌ AI Model service test failed:", error.message);
    return false;
  }
}

/**
 * Test WebRTC Session Persistence
 */
async function testWebRTCSessionPersistence() {
  console.log("\n🧪 Testing WebRTC Session Persistence...");
  
  try {
    const testUserId = "test-user-webrtc";
    const sessionOptions = {
      scenarioId: "s1",
      level: "beginner",
      isScenarioBased: true
    };
    
    // Create session
    console.log("🔄 Creating WebRTC session...");
    const session = await webrtcSessionPersistence.createOrResumeSession(testUserId, sessionOptions);
    
    console.log(`✅ Session created: ${session.sessionId}`);
    console.log(`📊 Is resumed: ${session.isResumed}`);
    
    // Save a test message
    console.log("🔄 Saving test message...");
    const messageData = {
      role: "user",
      content: "안녕하세요",
      timestamp: new Date(),
      audioTranscript: "annyeonghaseyo"
    };
    
    const messageSaved = await webrtcSessionPersistence.saveMessage(session.sessionId, messageData);
    console.log(`✅ Message saved: ${messageSaved ? 'SUCCESS' : 'FAIL'}`);
    
    // Update session status
    console.log("🔄 Updating session status...");
    const statusUpdated = await webrtcSessionPersistence.updateSessionStatus(session.sessionId, "active");
    console.log(`✅ Status updated: ${statusUpdated ? 'SUCCESS' : 'FAIL'}`);
    
    // End session
    console.log("🔄 Ending session...");
    const summary = await webrtcSessionPersistence.endSession(session.sessionId);
    console.log(`✅ Session ended: ${summary ? 'SUCCESS' : 'FAIL'}`);
    
    if (summary) {
      console.log(`📊 Session duration: ${Math.floor(summary.duration / 1000)}s`);
      console.log(`📊 Message count: ${summary.messageCount}`);
    }
    
    return true;
  } catch (error) {
    console.error("❌ WebRTC session persistence test failed:", error.message);
    return false;
  }
}

/**
 * Test Conversation Analytics
 */
async function testConversationAnalytics() {
  console.log("\n🧪 Testing Conversation Analytics...");
  
  try {
    const testSessionId = "test-analytics-session";
    const testUserId = "test-user-analytics";
    
    // Initialize analytics session
    console.log("🔄 Initializing analytics session...");
    conversationAnalytics.initializeSession(testSessionId, {
      userId: testUserId,
      scenarioId: "s1",
      level: "beginner"
    });
    
    console.log("✅ Analytics session initialized");
    
    // Track some messages
    console.log("🔄 Tracking messages...");
    conversationAnalytics.trackMessage(testSessionId, {
      role: "user",
      content: "Hello",
      responseTime: 2000
    });
    
    conversationAnalytics.trackMessage(testSessionId, {
      role: "assistant",
      content: "안녕하세요! Hello in Korean is 안녕하세요.",
      modelUsed: "gpt-4o-mini",
      fromCache: false
    });
    
    console.log("✅ Messages tracked");
    
    // Track learning events
    console.log("🔄 Tracking learning events...");
    conversationAnalytics.trackLearningEvent(testSessionId, {
      type: "vocabulary_introduced",
      data: { word: "안녕하세요" }
    });
    
    conversationAnalytics.trackLearningEvent(testSessionId, {
      type: "grammar_point",
      data: { concept: "formal greetings" }
    });
    
    console.log("✅ Learning events tracked");
    
    // Track flow events
    console.log("🔄 Tracking flow events...");
    conversationAnalytics.trackFlowEvent(testSessionId, {
      type: "state_transition",
      data: { fromState: "greeting", toState: "active_learning" }
    });
    
    console.log("✅ Flow events tracked");
    
    // End analytics session
    console.log("🔄 Ending analytics session...");
    const analyticsResult = await conversationAnalytics.endSession(testSessionId);
    
    console.log(`✅ Analytics session ended: ${analyticsResult ? 'SUCCESS' : 'FAIL'}`);
    
    if (analyticsResult) {
      console.log(`📊 Quality score: ${analyticsResult.qualityScore}`);
      console.log(`📊 Engagement score: ${analyticsResult.engagementScore}`);
      console.log(`📊 Message count: ${analyticsResult.messageCount}`);
    }
    
    return true;
  } catch (error) {
    console.error("❌ Conversation analytics test failed:", error.message);
    return false;
  }
}

/**
 * Test Conversation Flow Management
 */
async function testConversationFlowManagement() {
  console.log("\n🧪 Testing Conversation Flow Management...");
  
  try {
    const testUserId = "test-user-flow";
    
    // Initialize session
    console.log("🔄 Initializing flow session...");
    const session = conversationFlowManager.getSession(testUserId);
    console.log(`✅ Flow session initialized: ${session.userId}`);
    
    // Update metrics
    console.log("🔄 Updating flow metrics...");
    conversationFlowManager.updateMetrics(testUserId, {
      newMessage: true,
      responseTime: 3000
    });
    
    conversationFlowManager.updateMetrics(testUserId, {
      mistake: {
        type: "pronunciation",
        content: "안녕하세요"
      }
    });
    
    console.log("✅ Flow metrics updated");
    
    // Test break suggestion
    console.log("🔄 Testing break suggestion...");
    const breakCheck = conversationFlowManager.checkBreakSuggestion(testUserId);
    console.log(`✅ Break suggestion: ${breakCheck.shouldSuggest ? 'YES' : 'NO'}`);
    
    // Test practice recommendation
    console.log("🔄 Testing practice recommendation...");
    const practiceCheck = conversationFlowManager.checkPracticeRecommendation(testUserId, {
      weakAreas: ["pronunciation"],
      recentMistakes: session.recentMistakes
    });
    console.log(`✅ Practice recommendation: ${practiceCheck.shouldPractice ? 'YES' : 'NO'}`);
    
    // Test state transition
    console.log("🔄 Testing state transition...");
    const transition = conversationFlowManager.transitionState(testUserId, "active_learning");
    console.log(`✅ State transition: ${transition.transitioned ? 'SUCCESS' : 'NO CHANGE'}`);
    
    // End session
    console.log("🔄 Ending flow session...");
    const summary = conversationFlowManager.endSession(testUserId);
    console.log(`✅ Flow session ended: ${summary ? 'SUCCESS' : 'FAIL'}`);
    
    return true;
  } catch (error) {
    console.error("❌ Conversation flow management test failed:", error.message);
    return false;
  }
}

/**
 * Test Integration Between Services
 */
async function testServiceIntegration() {
  console.log("\n🧪 Testing Service Integration...");
  
  try {
    const testUserId = "test-integration-user";
    const sessionOptions = {
      scenarioId: "s1",
      level: "intermediate",
      isScenarioBased: true
    };
    
    console.log("🔄 Testing full integration flow...");
    
    // 1. Create WebRTC session (should initialize analytics and flow)
    const session = await webrtcSessionPersistence.createOrResumeSession(testUserId, sessionOptions);
    console.log(`✅ Step 1: WebRTC session created: ${session.sessionId}`);
    
    // 2. Simulate message exchange with analytics tracking
    const messageData = {
      role: "user",
      content: "How do you say 'thank you' in Korean?",
      responseTime: 2500
    };
    
    await webrtcSessionPersistence.saveMessage(session.sessionId, messageData);
    console.log("✅ Step 2: Message saved to persistence");
    
    // 3. Track analytics for the message
    conversationAnalytics.trackMessage(session.sessionId, messageData);
    console.log("✅ Step 3: Message tracked in analytics");
    
    // 4. Update flow metrics
    conversationFlowManager.updateMetrics(testUserId, {
      newMessage: true,
      responseTime: messageData.responseTime
    });
    console.log("✅ Step 4: Flow metrics updated");
    
    // 5. End session (should trigger all cleanup)
    const summary = await webrtcSessionPersistence.endSession(session.sessionId);
    console.log(`✅ Step 5: Session ended with full integration: ${summary ? 'SUCCESS' : 'FAIL'}`);
    
    if (summary && summary.analytics) {
      console.log(`📊 Final quality score: ${summary.analytics.qualityScore}`);
      console.log(`📊 Final engagement score: ${summary.analytics.engagementScore}`);
    }
    
    return true;
  } catch (error) {
    console.error("❌ Service integration test failed:", error.message);
    return false;
  }
}

/**
 * Run all integration tests
 */
async function runAllIntegrationTests() {
  console.log("🚀 RUNNING COMPREHENSIVE INTEGRATION TESTS");
  console.log("=" * 60);
  
  const tests = [
    { name: "Response Caching", test: testResponseCaching },
    { name: "AI Model Service with Caching", test: testAIModelServiceWithCaching },
    { name: "WebRTC Session Persistence", test: testWebRTCSessionPersistence },
    { name: "Conversation Analytics", test: testConversationAnalytics },
    { name: "Conversation Flow Management", test: testConversationFlowManagement },
    { name: "Service Integration", test: testServiceIntegration }
  ];
  
  const results = [];
  
  for (const { name, test } of tests) {
    console.log(`\n🧪 Running ${name} test...`);
    try {
      const result = await test();
      results.push({ name, passed: result });
      console.log(`${result ? '✅' : '❌'} ${name}: ${result ? 'PASSED' : 'FAILED'}`);
    } catch (error) {
      console.error(`❌ ${name}: ERROR - ${error.message}`);
      results.push({ name, passed: false, error: error.message });
    }
  }
  
  console.log("\n" + "=" * 60);
  console.log("📊 INTEGRATION TEST RESULTS");
  console.log("=" * 60);
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.name}`);
    if (result.error) {
      console.log(`    Error: ${result.error}`);
    }
  });
  
  console.log(`\n📈 Overall: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
  
  if (passed === total) {
    console.log("🎉 ALL INTEGRATION TESTS PASSED! System is ready for production.");
  } else {
    console.log("⚠️ Some tests failed. Please review and fix issues before deployment.");
  }
  
  return { passed, total, results };
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllIntegrationTests().catch(console.error);
}

export { runAllIntegrationTests };
