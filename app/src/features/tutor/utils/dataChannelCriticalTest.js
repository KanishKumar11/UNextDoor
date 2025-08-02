/**
 * Critical Data Channel Issue Test
 * Tests for the specific data channel connection issues
 */

import webRTCConversationService from '../services/WebRTCConversationService';

/**
 * Test the critical data channel connection issues
 */
export const testDataChannelCriticalIssues = async () => {
  console.log('🚨 Testing Critical Data Channel Issues');
  
  const results = {
    success: false,
    issues: {
      abortSignalError: false,
      dataChannelStuckConnecting: false,
      onOpenEventNotFiring: false,
      fallbackStrategiesFailing: false
    },
    strategies: {
      earlyCreation: null,
      eventMonitoring: null,
      polling: null,
      immediateValidation: null
    },
    diagnostics: {
      networkCheckResult: null,
      webrtcStates: [],
      dataChannelStates: [],
      strategyAttempts: []
    },
    errors: []
  };

  try {
    // Test 1: Network connectivity check (should not have AbortSignal error)
    console.log('🔍 Testing network connectivity check...');
    try {
      await webRTCConversationService.checkNetworkConnectivity();
      results.diagnostics.networkCheckResult = 'success';
      console.log('✅ Network connectivity check passed');
    } catch (error) {
      results.diagnostics.networkCheckResult = 'failed';
      if (error.message.includes('AbortSignal.timeout is not a function')) {
        results.issues.abortSignalError = true;
        console.error('❌ AbortSignal.timeout compatibility issue detected');
      }
      console.warn('⚠️ Network connectivity check failed:', error.message);
    }

    // Initialize service
    await webRTCConversationService.initialize();
    console.log('✅ Service initialized');

    // Monitor WebRTC and data channel states
    const stateMonitor = setInterval(() => {
      if (webRTCConversationService.peerConnection) {
        results.diagnostics.webrtcStates.push({
          timestamp: Date.now(),
          connectionState: webRTCConversationService.peerConnection.connectionState,
          iceState: webRTCConversationService.peerConnection.iceConnectionState,
          signalingState: webRTCConversationService.peerConnection.signalingState
        });
      }
      
      if (webRTCConversationService.dataChannel) {
        results.diagnostics.dataChannelStates.push({
          timestamp: Date.now(),
          state: webRTCConversationService.dataChannel.readyState
        });
      }
    }, 200);

    // Test data channel creation strategies
    console.log('🔄 Testing data channel creation strategies...');
    
    try {
      const sessionResult = await webRTCConversationService.startSession(
        'critical-data-channel-test',
        'beginner',
        { id: 'test-user', displayName: 'Test User' }
      );

      if (sessionResult) {
        console.log('✅ Session started successfully');
        
        // Check final data channel state
        const finalDataChannelState = webRTCConversationService.dataChannel?.readyState;
        console.log(`📊 Final data channel state: ${finalDataChannelState}`);
        
        if (finalDataChannelState === 'open') {
          console.log('✅ Data channel reached open state');
          results.success = true;
        } else {
          console.error('❌ Data channel did not reach open state');
          results.issues.dataChannelStuckConnecting = true;
        }
        
      } else {
        console.error('❌ Session failed to start');
        results.issues.fallbackStrategiesFailing = true;
      }

    } catch (error) {
      console.error('❌ Session start failed:', error.message);
      results.errors.push(`Session start: ${error.message}`);
      
      if (error.message.includes('Data channel ready timeout')) {
        results.issues.dataChannelStuckConnecting = true;
      }
      if (error.message.includes('onopen')) {
        results.issues.onOpenEventNotFiring = true;
      }
      if (error.message.includes('alternative attempts')) {
        results.issues.fallbackStrategiesFailing = true;
      }
    }

    // Stop monitoring
    clearInterval(stateMonitor);

    // Cleanup
    await webRTCConversationService.stopSession();

  } catch (error) {
    console.error('❌ Critical data channel test failed:', error);
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
  console.log('\n📊 Critical Data Channel Test Results:');
  console.log('=' * 50);
  console.log(`   Overall Success: ${results.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Issues Detected: ${issueCount}/4`);
  console.log('');
  
  console.log('🔍 Specific Issues:');
  console.log(`   AbortSignal Error: ${results.issues.abortSignalError ? '❌ YES' : '✅ NO'}`);
  console.log(`   Data Channel Stuck: ${results.issues.dataChannelStuckConnecting ? '❌ YES' : '✅ NO'}`);
  console.log(`   OnOpen Event Not Firing: ${results.issues.onOpenEventNotFiring ? '❌ YES' : '✅ NO'}`);
  console.log(`   Fallback Strategies Failing: ${results.issues.fallbackStrategiesFailing ? '❌ YES' : '✅ NO'}`);

  console.log('\n🌐 Network Check Result:');
  console.log(`   Status: ${results.diagnostics.networkCheckResult || 'not tested'}`);

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
    
    if (stateChanges.length > 0) {
      stateChanges.forEach(({ state, timestamp }, index) => {
        const duration = index > 0 ? timestamp - stateChanges[index - 1].timestamp : 0;
        console.log(`   ${state}: ${duration}ms`);
      });
    } else {
      console.log('   No state changes detected');
    }
  }

  if (results.diagnostics.webrtcStates.length > 0) {
    console.log('\n🔗 WebRTC Connection Timeline:');
    const connectionStates = results.diagnostics.webrtcStates.filter((state, index) => 
      index === 0 || state.connectionState !== results.diagnostics.webrtcStates[index - 1].connectionState
    );
    
    connectionStates.forEach(({ connectionState, iceState, timestamp }, index) => {
      const duration = index > 0 ? timestamp - connectionStates[index - 1].timestamp : 0;
      console.log(`   Connection: ${connectionState}, ICE: ${iceState} (${duration}ms)`);
    });
  }

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(error => console.log(`   ${error}`));
  }

  return results;
};

/**
 * Test individual data channel strategies
 */
export const testDataChannelStrategies = async () => {
  console.log('🧪 Testing Individual Data Channel Strategies');
  
  const strategies = ['eventMonitoring', 'polling', 'immediateValidation'];
  const results = {};

  for (const strategy of strategies) {
    console.log(`\n🔄 Testing ${strategy} strategy...`);
    
    try {
      await webRTCConversationService.initialize();
      
      // This would require exposing individual strategy methods for testing
      // For now, we'll test the overall approach
      const startTime = Date.now();
      const sessionResult = await webRTCConversationService.startSession(
        `test-${strategy}`,
        'beginner',
        { id: 'test-user', displayName: 'Test User' }
      );
      const duration = Date.now() - startTime;

      results[strategy] = {
        success: !!sessionResult,
        duration,
        dataChannelState: webRTCConversationService.dataChannel?.readyState || 'null'
      };

      if (sessionResult) {
        console.log(`✅ ${strategy} strategy succeeded in ${duration}ms`);
      } else {
        console.log(`❌ ${strategy} strategy failed`);
      }

      await webRTCConversationService.stopSession();
      await webRTCConversationService.destroy();
      
      // Wait between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ ${strategy} strategy error:`, error.message);
      results[strategy] = {
        success: false,
        error: error.message
      };
    }
  }

  console.log('\n📊 Strategy Test Summary:');
  Object.entries(results).forEach(([strategy, result]) => {
    console.log(`   ${strategy}: ${result.success ? '✅ PASS' : '❌ FAIL'} ${result.duration ? `(${result.duration}ms)` : ''}`);
    if (result.error) {
      console.log(`     Error: ${result.error}`);
    }
  });

  return results;
};

/**
 * Quick test for the most critical data channel issue
 */
export const quickDataChannelCriticalTest = async () => {
  console.log('⚡ Quick Critical Data Channel Test');
  
  try {
    const result = await testDataChannelCriticalIssues();
    
    if (result.success) {
      console.log('✅ All critical data channel issues resolved');
      return true;
    } else {
      console.log('❌ Critical data channel issues still present');
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
  testDataChannelCriticalIssues,
  testDataChannelStrategies,
  quickDataChannelCriticalTest
};
