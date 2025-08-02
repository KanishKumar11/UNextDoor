/**
 * Data Channel Diagnostics and Testing
 * Comprehensive testing for data channel timeout issues
 */

import webRTCConversationService from '../services/WebRTCConversationService';

/**
 * Test data channel creation and connection
 */
export const testDataChannelConnection = async () => {
  const results = {
    success: false,
    steps: [],
    timings: {},
    errors: [],
    diagnostics: {}
  };

  console.log('🧪 Starting data channel connection test');

  try {
    // Step 1: Initialize service
    const initStart = Date.now();
    await webRTCConversationService.initialize();
    results.timings.initialization = Date.now() - initStart;
    results.steps.push('✅ Service initialized');

    // Step 2: Start session and monitor connection states
    const sessionStart = Date.now();
    
    // Set up monitoring
    const connectionStates = [];
    const iceStates = [];
    const dataChannelStates = [];

    const connectionMonitor = (state) => {
      connectionStates.push({ state, timestamp: Date.now() - sessionStart });
    };

    const iceMonitor = (state) => {
      iceStates.push({ state, timestamp: Date.now() - sessionStart });
    };

    const dataChannelMonitor = () => {
      if (webRTCConversationService.dataChannel) {
        dataChannelStates.push({ 
          state: webRTCConversationService.dataChannel.readyState, 
          timestamp: Date.now() - sessionStart 
        });
      }
    };

    webRTCConversationService.on('connectionStateChanged', connectionMonitor);
    webRTCConversationService.on('connected', () => {
      results.steps.push('✅ WebRTC connection established');
    });
    webRTCConversationService.on('dataChannelOpened', () => {
      results.steps.push('✅ Data channel opened');
    });

    // Monitor data channel state every 500ms
    const dataChannelInterval = setInterval(dataChannelMonitor, 500);

    try {
      const sessionResult = await webRTCConversationService.startSession(
        'data-channel-test',
        'beginner',
        { id: 'test-user', displayName: 'Test User' }
      );

      results.timings.sessionStart = Date.now() - sessionStart;

      if (sessionResult) {
        results.steps.push('✅ Session started successfully');
        results.success = true;
      } else {
        results.steps.push('❌ Session failed to start');
        results.errors.push('Session start returned false');
      }

    } catch (error) {
      results.steps.push(`❌ Session start failed: ${error.message}`);
      results.errors.push(error.message);
    } finally {
      clearInterval(dataChannelInterval);
      webRTCConversationService.off('connectionStateChanged', connectionMonitor);
    }

    // Collect diagnostics
    results.diagnostics = {
      connectionStates,
      iceStates,
      dataChannelStates,
      finalPeerConnectionState: webRTCConversationService.peerConnection?.connectionState || 'null',
      finalICEState: webRTCConversationService.peerConnection?.iceConnectionState || 'null',
      finalDataChannelState: webRTCConversationService.dataChannel?.readyState || 'null',
      sessionId: webRTCConversationService.sessionId
    };

    // Step 3: Cleanup
    await webRTCConversationService.stopSession();
    results.steps.push('✅ Session stopped');

  } catch (error) {
    console.error('❌ Data channel test failed:', error);
    results.errors.push(error.message);
  } finally {
    try {
      await webRTCConversationService.destroy();
      results.steps.push('✅ Service destroyed');
    } catch (error) {
      results.errors.push(`Cleanup error: ${error.message}`);
    }
  }

  // Print detailed results
  console.log('\n📊 Data Channel Test Results:');
  console.log(`   Success: ${results.success ? '✅ YES' : '❌ NO'}`);
  console.log(`   Initialization Time: ${results.timings.initialization}ms`);
  console.log(`   Session Start Time: ${results.timings.sessionStart || 'N/A'}ms`);
  
  console.log('\n📋 Steps:');
  results.steps.forEach(step => console.log(`   ${step}`));

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(error => console.log(`   ${error}`));
  }

  console.log('\n🔍 Connection Diagnostics:');
  console.log(`   Final Peer Connection State: ${results.diagnostics.finalPeerConnectionState}`);
  console.log(`   Final ICE State: ${results.diagnostics.finalICEState}`);
  console.log(`   Final Data Channel State: ${results.diagnostics.finalDataChannelState}`);
  console.log(`   Session ID: ${results.diagnostics.sessionId}`);

  if (results.diagnostics.connectionStates.length > 0) {
    console.log('\n🔄 Connection State Timeline:');
    results.diagnostics.connectionStates.forEach(({ state, timestamp }) => {
      console.log(`   ${timestamp}ms: ${state}`);
    });
  }

  if (results.diagnostics.iceStates.length > 0) {
    console.log('\n🧊 ICE State Timeline:');
    results.diagnostics.iceStates.forEach(({ state, timestamp }) => {
      console.log(`   ${timestamp}ms: ${state}`);
    });
  }

  if (results.diagnostics.dataChannelStates.length > 0) {
    console.log('\n📡 Data Channel State Timeline:');
    results.diagnostics.dataChannelStates.forEach(({ state, timestamp }) => {
      console.log(`   ${timestamp}ms: ${state}`);
    });
  }

  return results;
};

/**
 * Test multiple data channel connections to identify patterns
 */
export const testMultipleDataChannelConnections = async (numTests = 3) => {
  console.log(`🧪 Testing ${numTests} data channel connections for patterns`);

  const allResults = [];
  const summary = {
    totalTests: numTests,
    successful: 0,
    failed: 0,
    averageConnectionTime: 0,
    commonErrors: {},
    patterns: []
  };

  for (let i = 1; i <= numTests; i++) {
    console.log(`\n🔄 Test ${i}/${numTests}`);
    
    const result = await testDataChannelConnection();
    allResults.push({ test: i, ...result });

    if (result.success) {
      summary.successful++;
    } else {
      summary.failed++;
      
      // Track common errors
      result.errors.forEach(error => {
        summary.commonErrors[error] = (summary.commonErrors[error] || 0) + 1;
      });
    }

    // Wait between tests
    if (i < numTests) {
      console.log('⏳ Waiting 3 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // Calculate average connection time
  const successfulTimes = allResults
    .filter(r => r.success && r.timings.sessionStart)
    .map(r => r.timings.sessionStart);
  
  if (successfulTimes.length > 0) {
    summary.averageConnectionTime = Math.round(
      successfulTimes.reduce((a, b) => a + b, 0) / successfulTimes.length
    );
  }

  // Identify patterns
  if (summary.failed > 0) {
    const timeoutErrors = allResults.filter(r => 
      r.errors.some(e => e.includes('timeout'))
    ).length;
    
    if (timeoutErrors > 0) {
      summary.patterns.push(`${timeoutErrors}/${numTests} tests failed with timeout errors`);
    }

    const dataChannelErrors = allResults.filter(r => 
      r.errors.some(e => e.includes('data channel') || e.includes('Data channel'))
    ).length;
    
    if (dataChannelErrors > 0) {
      summary.patterns.push(`${dataChannelErrors}/${numTests} tests had data channel specific errors`);
    }
  }

  console.log('\n🏁 Multiple Data Channel Test Summary:');
  console.log(`   Total Tests: ${summary.totalTests}`);
  console.log(`   Successful: ${summary.successful}`);
  console.log(`   Failed: ${summary.failed}`);
  console.log(`   Success Rate: ${(summary.successful / summary.totalTests * 100).toFixed(1)}%`);
  console.log(`   Average Connection Time: ${summary.averageConnectionTime}ms`);

  if (Object.keys(summary.commonErrors).length > 0) {
    console.log('\n❌ Common Errors:');
    Object.entries(summary.commonErrors).forEach(([error, count]) => {
      console.log(`   ${count}x: ${error}`);
    });
  }

  if (summary.patterns.length > 0) {
    console.log('\n🔍 Patterns Identified:');
    summary.patterns.forEach(pattern => {
      console.log(`   ${pattern}`);
    });
  }

  return { allResults, summary };
};

/**
 * Quick data channel connectivity test
 */
export const quickDataChannelTest = async () => {
  console.log('🚀 Quick data channel connectivity test');
  
  try {
    const result = await testDataChannelConnection();
    
    if (result.success) {
      console.log('✅ Data channel test PASSED');
      return true;
    } else {
      console.log('❌ Data channel test FAILED');
      console.log('   Primary errors:', result.errors.slice(0, 2));
      return false;
    }
  } catch (error) {
    console.error('❌ Quick test failed:', error.message);
    return false;
  }
};
