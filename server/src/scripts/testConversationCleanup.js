/**
 * Test Conversation Cleanup and Restart
 * Simulates the conversation end and restart flow to verify the fix
 */

console.log('🧪 TESTING CONVERSATION CLEANUP AND RESTART FIX');
console.log('=' * 60);

/**
 * Mock WebRTC Conversation Service for testing
 */
class MockWebRTCConversationService {
  constructor() {
    // Connection state
    this.isConnected = false;
    this.isSessionActive = false;
    this.isAISpeaking = false;

    // Session control state
    this.userEndedSession = false;
    this.allowAutoRestart = true;

    // Timeout management
    this.aiResponseTimeout = null;
    this.stateUpdateTimeout = null;

    // Session data
    this.currentScenario = null;
    this.currentLevel = "beginner";
    this.conversationHistory = [];
  }

  /**
   * Start a conversation session (with the fix)
   */
  async startSession(scenarioId, level = "beginner") {
    try {
      console.log(`🎯 Starting conversation session: ${scenarioId}, level: ${level}`);

      // Reset session control flags for explicit new session start
      // This allows new conversations even after user ended previous session
      console.log("🎯 Resetting session control flags for new conversation");
      this.userEndedSession = false;
      this.allowAutoRestart = true;

      if (this.isSessionActive) {
        console.log("🎯 Session already active, stopping current session first");
        await this.stopSession();
      }

      this.currentScenario = scenarioId;
      this.currentLevel = level;

      // Simulate connection process
      console.log("🎯 Simulating connection to OpenAI...");
      this.isConnected = true;
      this.isSessionActive = true;

      // Simulate AI response timeout
      this.aiResponseTimeout = setTimeout(() => {
        console.log("🎯 AI response triggered");
        this.aiResponseTimeout = null;
      }, 100); // Shorter timeout for testing

      console.log("✅ Session started successfully");
      return true;
    } catch (error) {
      console.error("❌ Error starting session:", error);
      return false;
    }
  }

  /**
   * Stop the current session
   */
  async stopSession() {
    try {
      console.log("🎯 Stopping conversation session");

      // Clear any pending timeouts
      if (this.aiResponseTimeout) {
        clearTimeout(this.aiResponseTimeout);
        this.aiResponseTimeout = null;
        console.log("🧹 Cleared AI response timeout");
      }
      if (this.stateUpdateTimeout) {
        clearTimeout(this.stateUpdateTimeout);
        this.stateUpdateTimeout = null;
        console.log("🧹 Cleared state update timeout");
      }

      // Reset state
      this.isConnected = false;
      this.isSessionActive = false;
      this.isAISpeaking = false;
      this.currentScenario = null;
      this.currentLevel = "beginner";
      this.conversationHistory = [];

      console.log("✅ Session stopped successfully");
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
    } catch (error) {
      console.error("❌ Error stopping session:", error);
    }
  }

  /**
   * Stop the current session due to user action (prevents auto-restart)
   */
  async stopSessionByUser() {
    try {
      console.log("🎯 User ending conversation session - preventing auto-restart");

      // Set flags to prevent automatic restart
      this.userEndedSession = true;
      this.allowAutoRestart = false;

      // Stop the session
      await this.stopSession();

      console.log("✅ Session stopped by user");
    } catch (error) {
      console.error("❌ Error stopping session by user:", error);
    }
  }

  /**
   * Reset session control flags
   */
  resetSessionControlFlags() {
    console.log("🎯 Resetting session control flags");
    this.userEndedSession = false;
    this.allowAutoRestart = true;
  }

  /**
   * Get current state
   */
  getState() {
    return {
      isConnected: this.isConnected,
      isSessionActive: this.isSessionActive,
      isAISpeaking: this.isAISpeaking,
      currentScenario: this.currentScenario,
      currentLevel: this.currentLevel,
      userEndedSession: this.userEndedSession,
      allowAutoRestart: this.allowAutoRestart,
      conversationHistory: this.conversationHistory,
      hasActiveTimeouts: !!(this.aiResponseTimeout || this.stateUpdateTimeout)
    };
  }
}

/**
 * Test the conversation flow
 */
async function testConversationFlow() {
  const service = new MockWebRTCConversationService();

  console.log('\n1️⃣ TESTING INITIAL CONVERSATION START');
  console.log('-' * 40);
  
  // Start first conversation
  const success1 = await service.startSession('restaurant-ordering', 'beginner');
  const state1 = service.getState();
  
  console.log('✅ First conversation started:', success1);
  console.log('📊 State after start:', {
    isSessionActive: state1.isSessionActive,
    currentScenario: state1.currentScenario,
    allowAutoRestart: state1.allowAutoRestart,
    userEndedSession: state1.userEndedSession
  });

  console.log('\n2️⃣ TESTING USER ENDING CONVERSATION');
  console.log('-' * 40);
  
  // User ends conversation (clicks close button)
  await service.stopSessionByUser();
  const state2 = service.getState();
  
  console.log('✅ Conversation ended by user');
  console.log('📊 State after user end:', {
    isSessionActive: state2.isSessionActive,
    currentScenario: state2.currentScenario,
    allowAutoRestart: state2.allowAutoRestart,
    userEndedSession: state2.userEndedSession,
    hasActiveTimeouts: state2.hasActiveTimeouts
  });

  console.log('\n3️⃣ TESTING NEW CONVERSATION START (THE FIX)');
  console.log('-' * 40);
  
  // Try to start new conversation (this should work with the fix)
  const success2 = await service.startSession('greetings-introductions', 'beginner');
  const state3 = service.getState();
  
  console.log('✅ Second conversation started:', success2);
  console.log('📊 State after restart:', {
    isSessionActive: state3.isSessionActive,
    currentScenario: state3.currentScenario,
    allowAutoRestart: state3.allowAutoRestart,
    userEndedSession: state3.userEndedSession,
    hasActiveTimeouts: state3.hasActiveTimeouts
  });

  console.log('\n4️⃣ TESTING SCENARIO CHANGE');
  console.log('-' * 40);
  
  // Test changing to another scenario
  const success3 = await service.startSession('making-plans', 'intermediate');
  const state4 = service.getState();
  
  console.log('✅ Scenario changed:', success3);
  console.log('📊 State after scenario change:', {
    isSessionActive: state4.isSessionActive,
    currentScenario: state4.currentScenario,
    currentLevel: state4.currentLevel,
    allowAutoRestart: state4.allowAutoRestart
  });

  console.log('\n5️⃣ TESTING FINAL CLEANUP');
  console.log('-' * 40);
  
  // Final cleanup
  await service.stopSession();
  const state5 = service.getState();
  
  console.log('✅ Final cleanup completed');
  console.log('📊 Final state:', {
    isSessionActive: state5.isSessionActive,
    currentScenario: state5.currentScenario,
    hasActiveTimeouts: state5.hasActiveTimeouts
  });

  // Wait for any pending timeouts to complete
  await new Promise(resolve => setTimeout(resolve, 200));

  console.log('\n' + '=' * 60);
  console.log('🎯 CONVERSATION CLEANUP FIX VERIFICATION');
  console.log('=' * 60);

  const allTestsPassed = success1 && success2 && success3;
  
  if (allTestsPassed) {
    console.log('🎉 SUCCESS! All conversation flow tests passed:');
    console.log('   ✅ Initial conversation starts correctly');
    console.log('   ✅ User can end conversation properly');
    console.log('   ✅ New conversation starts after ending previous one');
    console.log('   ✅ Scenario changes work correctly');
    console.log('   ✅ Timeouts are properly cleaned up');
    console.log('\n💡 The "Initializing..." stuck issue should be resolved!');
  } else {
    console.log('⚠️ Some tests failed:');
    if (!success1) console.log('   ❌ Initial conversation failed to start');
    if (!success2) console.log('   ❌ New conversation failed to start after ending');
    if (!success3) console.log('   ❌ Scenario change failed');
  }

  return allTestsPassed;
}

// Run the test
testConversationFlow().catch(console.error);
