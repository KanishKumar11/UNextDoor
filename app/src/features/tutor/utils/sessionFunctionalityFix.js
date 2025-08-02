/**
 * Session Functionality Fix Validator
 * Tests that transcription failures, WebRTC state issues, and concurrent sessions are resolved
 */

import webRTCConversationService from '../services/WebRTCConversationService';

/**
 * Test transcription failure handling and recovery
 * @param {Function} startSession - Function to start session
 * @param {Function} stopSession - Function to stop session
 * @param {Function} getHookState - Function to get current hook state
 * @returns {Promise<Object>} Test results
 */
export const testTranscriptionFailureHandling = async (startSession, stopSession, getHookState) => {
  const results = {
    success: false,
    steps: [],
    issues: [],
    transcriptionEvents: [],
    recoveryAttempts: 0
  };

  try {
    console.log('🧪 Testing transcription failure handling...');

    // Monitor transcription events
    const transcriptionHandler = (data) => {
      results.transcriptionEvents.push({
        timestamp: Date.now(),
        type: data.type,
        error: data.error
      });
    };

    const messageHandler = (message) => {
      if (message.type && message.type.includes('transcription')) {
        results.transcriptionEvents.push({
          timestamp: Date.now(),
          type: message.type,
          data: message
        });
      }
    };

    webRTCConversationService.on('transcriptionError', transcriptionHandler);
    webRTCConversationService.on('message', messageHandler);

    // Step 1: Start session
    results.steps.push('Starting session for transcription test');
    const sessionStarted = await startSession('transcription-test', 'beginner');
    
    if (!sessionStarted) {
      results.issues.push('Session failed to start');
      return results;
    }

    // Wait for session to establish
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 2: Simulate transcription failure by sending a mock message
    results.steps.push('Simulating transcription failure');
    
    // Simulate the transcription failure message that was seen in logs
    const mockTranscriptionFailure = {
      type: 'conversation.item.input_audio_transcription.failed',
      error: 'Simulated transcription failure for testing'
    };

    // Send the mock failure through the message handler
    webRTCConversationService.handleIncomingMessage(mockTranscriptionFailure);

    // Wait for recovery attempt
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 3: Check if recovery was attempted
    results.steps.push('Checking recovery attempt');
    
    const transcriptionErrors = results.transcriptionEvents.filter(e => 
      e.type === 'user_transcription_failed' || 
      e.type === 'conversation.item.input_audio_transcription.failed'
    );

    if (transcriptionErrors.length > 0) {
      console.log('✅ Transcription failure detected and handled');
      results.recoveryAttempts = transcriptionErrors.length;
    } else {
      results.issues.push('Transcription failure not properly handled');
    }

    // Cleanup
    await stopSession();
    webRTCConversationService.off('transcriptionError', transcriptionHandler);
    webRTCConversationService.off('message', messageHandler);

    results.success = results.issues.length === 0 && results.recoveryAttempts > 0;

  } catch (error) {
    console.error('🧪 Error testing transcription failure handling:', error);
    results.issues.push(`Test error: ${error.message}`);
  }

  return results;
};

/**
 * Test concurrent session prevention
 * @param {Function} startSession - Function to start session
 * @param {Function} stopSession - Function to stop session
 * @returns {Promise<Object>} Test results
 */
export const testConcurrentSessionPrevention = async (startSession, stopSession) => {
  const results = {
    success: false,
    steps: [],
    issues: [],
    concurrentAttempts: 0,
    actualSessions: 0
  };

  try {
    console.log('🧪 Testing concurrent session prevention...');

    // Step 1: Attempt multiple concurrent session starts
    results.steps.push('Attempting concurrent session starts');
    
    const sessionPromises = [
      startSession('concurrent-test-1', 'beginner'),
      startSession('concurrent-test-2', 'beginner'),
      startSession('concurrent-test-3', 'beginner')
    ];

    results.concurrentAttempts = sessionPromises.length;

    // Wait for all attempts to complete
    const sessionResults = await Promise.allSettled(sessionPromises);
    
    // Count successful sessions
    results.actualSessions = sessionResults.filter(result => 
      result.status === 'fulfilled' && result.value === true
    ).length;

    console.log(`🧪 Concurrent attempts: ${results.concurrentAttempts}, Actual sessions: ${results.actualSessions}`);

    // Step 2: Validate only one session was created
    if (results.actualSessions === 1) {
      console.log('✅ Concurrent session prevention working correctly');
    } else if (results.actualSessions > 1) {
      results.issues.push(`Multiple concurrent sessions created: ${results.actualSessions}`);
    } else {
      results.issues.push('No sessions were created from concurrent attempts');
    }

    // Cleanup
    await stopSession();

    results.success = results.issues.length === 0 && results.actualSessions === 1;

  } catch (error) {
    console.error('🧪 Error testing concurrent session prevention:', error);
    results.issues.push(`Test error: ${error.message}`);
  }

  return results;
};

/**
 * Test WebRTC state management improvements
 * @param {Function} startSession - Function to start session
 * @param {Function} stopSession - Function to stop session
 * @returns {Promise<Object>} Test results
 */
export const testWebRTCStateManagement = async (startSession, stopSession) => {
  const results = {
    success: false,
    steps: [],
    issues: [],
    stateTransitions: []
  };

  try {
    console.log('🧪 Testing WebRTC state management...');

    // Monitor connection state changes
    const stateHandler = (state) => {
      results.stateTransitions.push({
        timestamp: Date.now(),
        state: state
      });
    };

    webRTCConversationService.on('connectionStateChanged', stateHandler);

    // Step 1: Start session and monitor states
    results.steps.push('Starting session and monitoring states');
    
    const sessionStarted = await startSession('state-test', 'beginner');
    
    if (!sessionStarted) {
      results.issues.push('Session failed to start');
      return results;
    }

    // Wait for connection to establish
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Step 2: Check for proper state transitions
    results.steps.push('Validating state transitions');
    
    const connectedStates = results.stateTransitions.filter(t => t.state === 'connected');
    const failedStates = results.stateTransitions.filter(t => t.state === 'failed');

    if (connectedStates.length > 0) {
      console.log('✅ Connection reached connected state');
    } else {
      results.issues.push('Connection never reached connected state');
    }

    if (failedStates.length > 0) {
      results.issues.push('Connection failed during establishment');
    }

    // Step 3: Test session restart
    results.steps.push('Testing session restart');
    
    await stopSession();
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const secondSessionStarted = await startSession('state-test-2', 'beginner');
    
    if (!secondSessionStarted) {
      results.issues.push('Second session failed to start');
    } else {
      console.log('✅ Second session started successfully');
    }

    // Cleanup
    await stopSession();
    webRTCConversationService.off('connectionStateChanged', stateHandler);

    results.success = results.issues.length === 0;

  } catch (error) {
    console.error('🧪 Error testing WebRTC state management:', error);
    results.issues.push(`Test error: ${error.message}`);
  }

  return results;
};

/**
 * Test audio configuration improvements
 * @param {Function} startSession - Function to start session
 * @param {Function} stopSession - Function to stop session
 * @returns {Promise<Object>} Test results
 */
export const testAudioConfiguration = async (startSession, stopSession) => {
  const results = {
    success: false,
    steps: [],
    issues: [],
    audioSettings: null
  };

  try {
    console.log('🧪 Testing audio configuration improvements...');

    // Step 1: Start session and check audio settings
    results.steps.push('Starting session and checking audio settings');
    
    const sessionStarted = await startSession('audio-test', 'beginner');
    
    if (!sessionStarted) {
      results.issues.push('Session failed to start');
      return results;
    }

    // Wait for session to establish
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 2: Validate audio stream properties
    results.steps.push('Validating audio stream properties');
    
    const serviceState = webRTCConversationService.getState();
    const sessionHealth = webRTCConversationService.getSessionHealth();

    if (sessionHealth.hasLocalStream) {
      console.log('✅ Local stream is available');
      
      if (sessionHealth.localStreamTracks > 0) {
        console.log('✅ Audio tracks are present');
      } else {
        results.issues.push('No audio tracks in local stream');
      }
    } else {
      results.issues.push('No local stream available');
    }

    // Cleanup
    await stopSession();

    results.success = results.issues.length === 0;

  } catch (error) {
    console.error('🧪 Error testing audio configuration:', error);
    results.issues.push(`Test error: ${error.message}`);
  }

  return results;
};

/**
 * Comprehensive test of all session functionality fixes
 * @param {Function} startSession - Function to start session
 * @param {Function} stopSession - Function to stop session
 * @param {Function} getHookState - Function to get current hook state
 * @returns {Promise<Object>} Test results
 */
export const testAllSessionFixes = async (startSession, stopSession, getHookState) => {
  const results = {
    success: false,
    testResults: {},
    overallIssues: []
  };

  try {
    console.log('🧪 Running comprehensive session functionality tests...');

    // Test 1: Transcription failure handling
    console.log('🧪 Test 1: Transcription failure handling');
    results.testResults.transcription = await testTranscriptionFailureHandling(startSession, stopSession, getHookState);

    // Test 2: Concurrent session prevention
    console.log('🧪 Test 2: Concurrent session prevention');
    results.testResults.concurrent = await testConcurrentSessionPrevention(startSession, stopSession);

    // Test 3: WebRTC state management
    console.log('🧪 Test 3: WebRTC state management');
    results.testResults.webrtc = await testWebRTCStateManagement(startSession, stopSession);

    // Test 4: Audio configuration
    console.log('🧪 Test 4: Audio configuration');
    results.testResults.audio = await testAudioConfiguration(startSession, stopSession);

    // Analyze overall results
    const failedTests = Object.entries(results.testResults).filter(([name, result]) => !result.success);
    
    if (failedTests.length === 0) {
      results.success = true;
      console.log('✅ All session functionality tests PASSED');
    } else {
      console.log('❌ Some session functionality tests FAILED:', failedTests.map(([name]) => name));
      results.overallIssues = failedTests.map(([name, result]) => ({
        test: name,
        issues: result.issues
      }));
    }

  } catch (error) {
    console.error('🧪 Error running comprehensive tests:', error);
    results.overallIssues.push(`Comprehensive test error: ${error.message}`);
  }

  return results;
};

export default {
  testTranscriptionFailureHandling,
  testConcurrentSessionPrevention,
  testWebRTCStateManagement,
  testAudioConfiguration,
  testAllSessionFixes
};
