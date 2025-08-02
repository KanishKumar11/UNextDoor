/**
 * WebRTC Issues Fix Test
 * Tests the fixes for user transcript display, connection status, and audio interruptions
 */

import webRTCConversationService from '../services/WebRTCConversationService';

/**
 * Test all three WebRTC issues fixes
 */
export const testWebRTCIssuesFixes = async () => {
  console.log('🔧 Testing WebRTC Issues Fixes');

  const results = {
    success: false,
    fixes: {
      userTranscriptHidden: false,
      connectionStatusAccurate: false,
      audioInterruptionsFixed: false
    },
    diagnostics: {
      connectionStates: [],
      audioTimeouts: 0,
      audioInterruptions: 0,
      userTranscriptEvents: 0,
      connectionStatusChanges: []
    },
    errors: []
  };

  try {
    // Initialize service
    await webRTCConversationService.initialize();
    console.log('✅ Service initialized');

    // Monitor connection states
    const stateMonitor = setInterval(() => {
      if (webRTCConversationService.peerConnection) {
        results.diagnostics.connectionStates.push({
          timestamp: Date.now(),
          connectionState: webRTCConversationService.peerConnection.connectionState,
          iceState: webRTCConversationService.peerConnection.iceConnectionState,
          isConnected: webRTCConversationService.isConnected,
          isSessionActive: webRTCConversationService.isSessionActive
        });
      }
    }, 200);

    // Monitor for audio timeout warnings
    const originalConsoleWarn = console.warn;
    console.warn = (...args) => {
      const message = args.join(' ');
      if (message.includes('Audio response timeout')) {
        results.diagnostics.audioTimeouts++;
        console.log(`⚠️ Audio timeout detected: ${results.diagnostics.audioTimeouts}`);
      }
      originalConsoleWarn.apply(console, args);
    };

    // Monitor for user transcript events (should not happen)
    webRTCConversationService.on('userTranscriptDelta', () => {
      results.diagnostics.userTranscriptEvents++;
      console.warn('❌ User transcript event detected - should be hidden');
    });

    webRTCConversationService.on('userTranscriptComplete', () => {
      results.diagnostics.userTranscriptEvents++;
      console.warn('❌ User transcript complete event detected - should be hidden');
    });

    // Monitor connection status changes
    let lastConnectionStatus = null;
    const checkConnectionStatus = () => {
      const isConnecting = webRTCConversationService.isConnecting;
      const isConnected = webRTCConversationService.isConnected;
      const isSessionActive = webRTCConversationService.isSessionActive;

      let status = 'unknown';
      if (isConnecting || (isConnected && !isSessionActive)) {
        status = 'connecting';
      } else if (isConnected && isSessionActive) {
        status = 'ready';
      } else {
        status = 'disconnected';
      }

      if (status !== lastConnectionStatus) {
        results.diagnostics.connectionStatusChanges.push({
          timestamp: Date.now(),
          status,
          isConnecting,
          isConnected,
          isSessionActive
        });
        lastConnectionStatus = status;
      }
    };

    const statusMonitor = setInterval(checkConnectionStatus, 100);

    try {
      console.log('🔄 Starting session to test fixes...');
      const sessionResult = await webRTCConversationService.startSession(
        'webrtc-fixes-test',
        'beginner',
        { id: 'test-user', displayName: 'Test User' }
      );

      if (sessionResult) {
        console.log('✅ Session started successfully');

        // Wait for conversation to develop
        console.log('⏳ Waiting for conversation to test audio handling...');
        await new Promise(resolve => setTimeout(resolve, 15000)); // Wait 15 seconds

        // Analyze results

        // Fix 1: User transcript should be hidden (no events)
        results.fixes.userTranscriptHidden = results.diagnostics.userTranscriptEvents === 0;

        // Fix 2: Connection status should be accurate
        const hasConnectingStatus = results.diagnostics.connectionStatusChanges.some(s => s.status === 'connecting');
        const hasReadyStatus = results.diagnostics.connectionStatusChanges.some(s => s.status === 'ready');
        results.fixes.connectionStatusAccurate = hasConnectingStatus && hasReadyStatus;

        // Fix 3: Audio interruptions should be minimal (allow 2 timeouts max for longer responses)
        results.fixes.audioInterruptionsFixed = results.diagnostics.audioTimeouts <= 2;

        results.success =
          results.fixes.userTranscriptHidden &&
          results.fixes.connectionStatusAccurate &&
          results.fixes.audioInterruptionsFixed;

      } else {
        console.error('❌ Session failed to start');
        results.errors.push('Session start failed');
      }

    } catch (error) {
      console.error('❌ WebRTC fixes test failed:', error.message);
      results.errors.push(`Test execution: ${error.message}`);
    }

    // Stop monitoring
    clearInterval(stateMonitor);
    clearInterval(statusMonitor);
    console.warn = originalConsoleWarn; // Restore original console.warn

    // Cleanup
    await webRTCConversationService.stopSession();

  } catch (error) {
    console.error('❌ WebRTC fixes test failed:', error);
    results.errors.push(`Test setup: ${error.message}`);
  } finally {
    try {
      await webRTCConversationService.destroy();
    } catch (error) {
      results.errors.push(`Cleanup: ${error.message}`);
    }
  }

  // Print detailed results
  console.log('\n📊 WebRTC Issues Fixes Test Results:');
  console.log('=' * 50);
  console.log(`   Overall Success: ${results.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');

  console.log('🔧 Individual Fixes:');
  console.log(`   User Transcript Hidden: ${results.fixes.userTranscriptHidden ? '✅ YES' : '❌ NO'}`);
  console.log(`   Connection Status Accurate: ${results.fixes.connectionStatusAccurate ? '✅ YES' : '❌ NO'}`);
  console.log(`   Audio Interruptions Fixed: ${results.fixes.audioInterruptionsFixed ? '✅ YES' : '❌ NO'}`);

  console.log('\n📊 Diagnostics:');
  console.log(`   User Transcript Events: ${results.diagnostics.userTranscriptEvents} (should be 0)`);
  console.log(`   Audio Timeouts: ${results.diagnostics.audioTimeouts} (should be ≤1)`);
  console.log(`   Connection Status Changes: ${results.diagnostics.connectionStatusChanges.length}`);

  if (results.diagnostics.connectionStatusChanges.length > 0) {
    console.log('\n🔄 Connection Status Timeline:');
    results.diagnostics.connectionStatusChanges.forEach(({ status, timestamp }, index) => {
      const timeOffset = index > 0 ? timestamp - results.diagnostics.connectionStatusChanges[0].timestamp : 0;
      console.log(`   +${timeOffset}ms: ${status}`);
    });
  }

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(error => console.log(`   ${error}`));
  }

  return results;
};

/**
 * Test specific connection status accuracy
 */
export const testConnectionStatusAccuracy = async () => {
  console.log('📡 Testing Connection Status Accuracy');

  const statusChanges = [];

  try {
    await webRTCConversationService.initialize();

    // Monitor status changes
    const monitor = setInterval(() => {
      const isConnecting = webRTCConversationService.isConnecting;
      const isConnected = webRTCConversationService.isConnected;
      const isSessionActive = webRTCConversationService.isSessionActive;

      let status = 'unknown';
      if (isConnecting || (isConnected && !isSessionActive)) {
        status = 'connecting';
      } else if (isConnected && isSessionActive) {
        status = 'ready';
      } else {
        status = 'disconnected';
      }

      if (statusChanges.length === 0 || statusChanges[statusChanges.length - 1].status !== status) {
        statusChanges.push({
          timestamp: Date.now(),
          status,
          details: { isConnecting, isConnected, isSessionActive }
        });
      }
    }, 50);

    const sessionResult = await webRTCConversationService.startSession(
      'status-test',
      'beginner',
      { id: 'test-user', displayName: 'Test User' }
    );

    clearInterval(monitor);
    await webRTCConversationService.stopSession();

    console.log('\n📊 Connection Status Timeline:');
    statusChanges.forEach(({ status, timestamp, details }, index) => {
      const timeOffset = index > 0 ? timestamp - statusChanges[0].timestamp : 0;
      console.log(`   +${timeOffset}ms: ${status} (connecting=${details.isConnecting}, connected=${details.isConnected}, active=${details.isSessionActive})`);
    });

    const hasCorrectSequence =
      statusChanges.some(s => s.status === 'connecting') &&
      statusChanges.some(s => s.status === 'ready');

    console.log(`\n✅ Connection status accuracy: ${hasCorrectSequence ? 'PASS' : 'FAIL'}`);
    return hasCorrectSequence;

  } catch (error) {
    console.error('❌ Connection status test failed:', error);
    return false;
  } finally {
    await webRTCConversationService.destroy();
  }
};

/**
 * Quick test for all fixes
 */
export const quickWebRTCFixesTest = async () => {
  console.log('⚡ Quick WebRTC Fixes Test');

  try {
    const result = await testWebRTCIssuesFixes();

    if (result.success) {
      console.log('✅ All WebRTC fixes working correctly');
      console.log(`   User transcript hidden: ${result.fixes.userTranscriptHidden}`);
      console.log(`   Connection status accurate: ${result.fixes.connectionStatusAccurate}`);
      console.log(`   Audio interruptions fixed: ${result.fixes.audioInterruptionsFixed}`);
      return true;
    } else {
      console.log('❌ Some WebRTC fixes need attention');
      const issues = Object.entries(result.fixes)
        .filter(([_, working]) => !working)
        .map(([fix, _]) => fix);
      console.log('   Issues:', issues);
      return false;
    }
  } catch (error) {
    console.error('❌ Quick WebRTC fixes test failed:', error);
    return false;
  }
};

export default {
  testWebRTCIssuesFixes,
  testConnectionStatusAccuracy,
  quickWebRTCFixesTest
};
