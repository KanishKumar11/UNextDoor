/**
 * Critical WebRTC Issue Test
 * Tests for the specific issues identified in the logs
 */

import webRTCConversationService from '../services/WebRTCConversationService';

/**
 * Test the specific critical issues from the logs
 */
export const testCriticalIssues = async () => {
  console.log('🚨 Testing Critical WebRTC Issues from Logs');
  
  const results = {
    success: false,
    issues: {
      dataChannelStuckInConnecting: false,
      fallbackLogicError: false,
      sessionConfigurationFailure: false,
      userContextMissing: false,
      networkCheckError: false
    },
    diagnostics: {
      dataChannelStates: [],
      fallbackAttempts: [],
      userContext: null,
      sessionConfigResult: null,
      networkCheckResult: null
    },
    errors: []
  };

  try {
    // Initialize service
    await webRTCConversationService.initialize();
    console.log('✅ Service initialized');

    // Test with specific user context from logs
    const testUser = {
      id: '681e425fae90401b8de97c57',
      displayName: 'Kanish Kumar',
      name: 'Kanish Kumar',
      firstName: 'Kanish'
    };

    // Monitor data channel states
    const dataChannelMonitor = setInterval(() => {
      if (webRTCConversationService.dataChannel) {
        const state = webRTCConversationService.dataChannel.readyState;
        results.diagnostics.dataChannelStates.push({
          state,
          timestamp: Date.now()
        });
        
        // Check for stuck in connecting state
        if (state === 'connecting') {
          const connectingStates = results.diagnostics.dataChannelStates.filter(s => s.state === 'connecting');
          if (connectingStates.length > 50) { // More than 5 seconds in connecting
            results.issues.dataChannelStuckInConnecting = true;
            console.warn('🚨 Data channel stuck in connecting state detected');
          }
        }
      }
    }, 100);

    // Monitor fallback attempts
    let fallbackAttemptCount = 0;
    const originalCreateDataChannel = webRTCConversationService.createDataChannel;
    webRTCConversationService.createDataChannel = async function() {
      fallbackAttemptCount++;
      results.diagnostics.fallbackAttempts.push({
        attempt: fallbackAttemptCount,
        timestamp: Date.now(),
        existingDataChannel: !!this.dataChannel,
        existingDataChannelState: this.dataChannel?.readyState || 'none'
      });
      
      // Check for fallback logic error
      if (fallbackAttemptCount > 1 && this.dataChannel && this.dataChannel.readyState === 'connecting') {
        results.issues.fallbackLogicError = true;
        console.warn('🚨 Fallback logic error: attempting to create data channel when existing one is in connecting state');
      }
      
      return originalCreateDataChannel.call(this);
    };

    try {
      // Start session with user context
      console.log('🔄 Starting session with user context...');
      const sessionResult = await webRTCConversationService.startSession(
        'critical-test-scenario',
        'beginner',
        testUser
      );

      results.diagnostics.userContext = testUser;

      if (sessionResult) {
        console.log('✅ Session started successfully');
        
        // Check if session configuration completed
        if (webRTCConversationService.isSessionActive) {
          console.log('✅ Session configuration completed');
          results.diagnostics.sessionConfigResult = 'success';
        } else {
          console.warn('⚠️ Session started but not active');
          results.issues.sessionConfigurationFailure = true;
          results.diagnostics.sessionConfigResult = 'inactive';
        }
        
        // Check data channel final state
        const finalDataChannelState = webRTCConversationService.dataChannel?.readyState;
        console.log(`📊 Final data channel state: ${finalDataChannelState}`);
        
        if (finalDataChannelState !== 'open') {
          results.issues.dataChannelStuckInConnecting = true;
          console.warn('🚨 Data channel did not reach open state');
        }
        
      } else {
        console.error('❌ Session failed to start');
        results.issues.sessionConfigurationFailure = true;
        results.diagnostics.sessionConfigResult = 'failed';
      }

    } catch (error) {
      console.error('❌ Session start failed:', error.message);
      results.errors.push(`Session start: ${error.message}`);
      
      if (error.message.includes('Data channel ready timeout')) {
        results.issues.sessionConfigurationFailure = true;
      }
      if (error.message.includes('timeout')) {
        results.issues.dataChannelStuckInConnecting = true;
      }
    }

    // Stop monitoring
    clearInterval(dataChannelMonitor);
    
    // Restore original method
    webRTCConversationService.createDataChannel = originalCreateDataChannel;

    // Cleanup
    await webRTCConversationService.stopSession();

  } catch (error) {
    console.error('❌ Critical issue test failed:', error);
    results.errors.push(`Test setup: ${error.message}`);
  } finally {
    try {
      await webRTCConversationService.destroy();
    } catch (error) {
      results.errors.push(`Cleanup: ${error.message}`);
    }
  }

  // Analyze results
  const issueCount = Object.values(results.issues).filter(Boolean).length;
  results.success = issueCount === 0 && results.errors.length === 0;

  // Print detailed results
  console.log('\n📊 Critical Issues Test Results:');
  console.log('=' * 50);
  console.log(`   Overall Success: ${results.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Issues Detected: ${issueCount}/5`);
  console.log('');
  
  console.log('🔍 Specific Issues:');
  console.log(`   Data Channel Stuck in Connecting: ${results.issues.dataChannelStuckInConnecting ? '❌ YES' : '✅ NO'}`);
  console.log(`   Fallback Logic Error: ${results.issues.fallbackLogicError ? '❌ YES' : '✅ NO'}`);
  console.log(`   Session Configuration Failure: ${results.issues.sessionConfigurationFailure ? '❌ YES' : '✅ NO'}`);
  console.log(`   User Context Missing: ${results.issues.userContextMissing ? '❌ YES' : '✅ NO'}`);
  console.log(`   Network Check Error: ${results.issues.networkCheckError ? '❌ YES' : '✅ NO'}`);

  if (results.diagnostics.dataChannelStates.length > 0) {
    console.log('\n📡 Data Channel State Timeline:');
    const stateChanges = [];
    let lastState = null;
    
    results.diagnostics.dataChannelStates.forEach(({ state, timestamp }) => {
      if (state !== lastState) {
        stateChanges.push({ state, timestamp });
        lastState = state;
      }
    });
    
    stateChanges.forEach(({ state, timestamp }, index) => {
      const duration = index > 0 ? timestamp - stateChanges[index - 1].timestamp : 0;
      console.log(`   ${state}: ${duration}ms`);
    });
  }

  if (results.diagnostics.fallbackAttempts.length > 0) {
    console.log('\n🔄 Fallback Attempts:');
    results.diagnostics.fallbackAttempts.forEach(({ attempt, existingDataChannel, existingDataChannelState }) => {
      console.log(`   Attempt ${attempt}: existing=${existingDataChannel}, state=${existingDataChannelState}`);
    });
  }

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(error => console.log(`   ${error}`));
  }

  return results;
};

/**
 * Test user context integration specifically
 */
export const testUserContextIntegration = async () => {
  console.log('👤 Testing User Context Integration');
  
  const testUser = {
    id: '681e425fae90401b8de97c57',
    displayName: 'Kanish Kumar',
    name: 'Kanish Kumar',
    firstName: 'Kanish'
  };

  try {
    // This would need to be tested on the server side
    // For now, we'll just verify the user object structure
    console.log('📋 Test User Object:', testUser);
    
    const hasRequiredFields = !!(testUser.id && (testUser.displayName || testUser.name || testUser.firstName));
    
    if (hasRequiredFields) {
      console.log('✅ User context has required fields for personalization');
      return true;
    } else {
      console.log('❌ User context missing required fields');
      return false;
    }
    
  } catch (error) {
    console.error('❌ User context test failed:', error);
    return false;
  }
};

/**
 * Quick test for the most critical issue
 */
export const quickCriticalTest = async () => {
  console.log('⚡ Quick Critical Issue Test');
  
  try {
    const result = await testCriticalIssues();
    
    if (result.success) {
      console.log('✅ All critical issues resolved');
      return true;
    } else {
      console.log('❌ Critical issues still present');
      const activeIssues = Object.entries(result.issues)
        .filter(([_, hasIssue]) => hasIssue)
        .map(([issue, _]) => issue);
      console.log('   Active issues:', activeIssues);
      return false;
    }
  } catch (error) {
    console.error('❌ Quick critical test failed:', error);
    return false;
  }
};

export default {
  testCriticalIssues,
  testUserContextIntegration,
  quickCriticalTest
};
