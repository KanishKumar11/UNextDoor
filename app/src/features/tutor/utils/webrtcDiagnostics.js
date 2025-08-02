/**
 * WebRTC Diagnostics Utility
 * Helps diagnose issues with user input detection and session state
 */

import webRTCConversationService from '../services/WebRTCConversationService';

/**
 * Comprehensive diagnostic check for WebRTC session
 * @returns {Object} Diagnostic results
 */
export const runWebRTCDiagnostics = () => {
  const state = webRTCConversationService.getState();
  const health = webRTCConversationService.getSessionHealth();
  
  const diagnostics = {
    timestamp: new Date().toISOString(),
    sessionState: {
      isSessionActive: state.isSessionActive,
      isConnected: state.isConnected,
      isAISpeaking: state.isAISpeaking,
      isCleaningUp: state.isCleaningUp,
      canStartNewSession: state.canStartNewSession,
    },
    connectionHealth: {
      peerConnectionState: health.peerConnectionState,
      iceConnectionState: health.iceConnectionState,
      dataChannelState: health.dataChannelState,
      hasLocalStream: health.hasLocalStream,
      localStreamTracks: health.localStreamTracks,
    },
    potentialIssues: [],
    recommendations: []
  };

  // Check for common issues
  if (state.isSessionActive && !state.isConnected) {
    diagnostics.potentialIssues.push('Session active but not connected');
    diagnostics.recommendations.push('Check peer connection and data channel state');
  }

  if (health.dataChannelState !== 'open' && state.isSessionActive) {
    diagnostics.potentialIssues.push(`Data channel not open: ${health.dataChannelState}`);
    diagnostics.recommendations.push('Data channel must be open for user input detection');
  }

  if (!health.hasLocalStream && state.isSessionActive) {
    diagnostics.potentialIssues.push('No local stream available');
    diagnostics.recommendations.push('Local stream required for audio input');
  }

  if (health.localStreamTracks === 0 && state.isSessionActive) {
    diagnostics.potentialIssues.push('Local stream has no tracks');
    diagnostics.recommendations.push('Audio tracks required for voice input');
  }

  if (health.peerConnectionState === 'failed') {
    diagnostics.potentialIssues.push('Peer connection failed');
    diagnostics.recommendations.push('Restart session to recover from connection failure');
  }

  if (health.iceConnectionState === 'failed') {
    diagnostics.potentialIssues.push('ICE connection failed');
    diagnostics.recommendations.push('Check network connectivity and STUN servers');
  }

  return diagnostics;
};

/**
 * Monitor WebRTC events for debugging
 * @param {number} duration - Duration to monitor in milliseconds
 * @returns {Promise<Array>} Array of captured events
 */
export const monitorWebRTCEvents = (duration = 30000) => {
  return new Promise((resolve) => {
    const events = [];
    const startTime = Date.now();

    // Event handlers
    const handlers = {
      sessionStarted: (data) => events.push({ type: 'sessionStarted', data, timestamp: Date.now() }),
      sessionStopped: (data) => events.push({ type: 'sessionStopped', data, timestamp: Date.now() }),
      connected: (data) => events.push({ type: 'connected', data, timestamp: Date.now() }),
      connectionStateChanged: (data) => events.push({ type: 'connectionStateChanged', data, timestamp: Date.now() }),
      dataChannelOpened: (data) => events.push({ type: 'dataChannelOpened', data, timestamp: Date.now() }),
      dataChannelClosed: (data) => events.push({ type: 'dataChannelClosed', data, timestamp: Date.now() }),
      userSpeechStarted: (data) => events.push({ type: 'userSpeechStarted', data, timestamp: Date.now() }),
      userSpeechStopped: (data) => events.push({ type: 'userSpeechStopped', data, timestamp: Date.now() }),
      aiSpeechStarted: (data) => events.push({ type: 'aiSpeechStarted', data, timestamp: Date.now() }),
      aiSpeechEnded: (data) => events.push({ type: 'aiSpeechEnded', data, timestamp: Date.now() }),
      userTranscriptComplete: (data) => events.push({ type: 'userTranscriptComplete', data, timestamp: Date.now() }),
      aiTranscriptComplete: (data) => events.push({ type: 'aiTranscriptComplete', data, timestamp: Date.now() }),
      error: (data) => events.push({ type: 'error', data, timestamp: Date.now() }),
    };

    // Add event listeners
    Object.keys(handlers).forEach(event => {
      webRTCConversationService.on(event, handlers[event]);
    });

    // Stop monitoring after duration
    setTimeout(() => {
      // Remove event listeners
      Object.keys(handlers).forEach(event => {
        webRTCConversationService.off(event, handlers[event]);
      });

      resolve({
        events,
        duration: Date.now() - startTime,
        summary: {
          totalEvents: events.length,
          eventTypes: [...new Set(events.map(e => e.type))],
          hasUserSpeech: events.some(e => e.type === 'userSpeechStarted'),
          hasAISpeech: events.some(e => e.type === 'aiSpeechStarted'),
          hasErrors: events.some(e => e.type === 'error'),
        }
      });
    }, duration);
  });
};

/**
 * Test user input detection specifically
 * @returns {Promise<Object>} Test results
 */
export const testUserInputDetection = async () => {
  const results = {
    success: false,
    steps: [],
    issues: [],
    recommendations: []
  };

  try {
    console.log('🧪 Testing user input detection...');

    // Step 1: Check initial state
    results.steps.push('Checking session state');
    const initialDiagnostics = runWebRTCDiagnostics();
    
    if (!initialDiagnostics.sessionState.isSessionActive) {
      results.issues.push('Session not active - cannot test user input');
      return results;
    }

    if (!initialDiagnostics.sessionState.isConnected) {
      results.issues.push('Session not connected - user input will not work');
      results.recommendations.push('Ensure session is fully connected before testing input');
    }

    // Step 2: Check data channel
    results.steps.push('Checking data channel');
    if (initialDiagnostics.connectionHealth.dataChannelState !== 'open') {
      results.issues.push(`Data channel not open: ${initialDiagnostics.connectionHealth.dataChannelState}`);
      results.recommendations.push('Data channel must be open for OpenAI communication');
    }

    // Step 3: Check local stream
    results.steps.push('Checking local audio stream');
    if (!initialDiagnostics.connectionHealth.hasLocalStream) {
      results.issues.push('No local stream - microphone not accessible');
      results.recommendations.push('Check microphone permissions and audio setup');
    }

    if (initialDiagnostics.connectionHealth.localStreamTracks === 0) {
      results.issues.push('Local stream has no audio tracks');
      results.recommendations.push('Ensure audio track is properly added to stream');
    }

    // Step 4: Monitor for user speech events
    results.steps.push('Monitoring for user speech detection');
    console.log('🎤 Please speak now to test user input detection...');
    
    const monitoring = await monitorWebRTCEvents(10000); // Monitor for 10 seconds
    
    if (monitoring.summary.hasUserSpeech) {
      results.success = true;
      console.log('✅ User input detection working');
    } else {
      results.issues.push('No user speech events detected during monitoring');
      results.recommendations.push('Check microphone permissions, audio routing, and VAD settings');
      
      // Additional diagnostics
      if (!monitoring.summary.hasAISpeech) {
        results.issues.push('No AI speech detected either - possible connection issue');
      }
      
      if (monitoring.summary.hasErrors) {
        results.issues.push('Errors detected during monitoring');
        const errors = monitoring.events.filter(e => e.type === 'error');
        results.issues.push(`Error details: ${JSON.stringify(errors)}`);
      }
    }

    results.monitoringResults = monitoring;

  } catch (error) {
    console.error('🧪 Error testing user input detection:', error);
    results.issues.push(`Test error: ${error.message}`);
  }

  return results;
};

/**
 * Quick check for common user input issues
 * @returns {Object} Quick diagnostic results
 */
export const quickInputCheck = () => {
  const diagnostics = runWebRTCDiagnostics();
  
  const issues = [];
  const fixes = [];

  // Check session state
  if (!diagnostics.sessionState.isSessionActive) {
    issues.push('❌ Session not active');
    fixes.push('Start a conversation session');
  } else {
    issues.push('✅ Session is active');
  }

  // Check connection
  if (!diagnostics.sessionState.isConnected) {
    issues.push('❌ Not connected to OpenAI');
    fixes.push('Wait for connection or restart session');
  } else {
    issues.push('✅ Connected to OpenAI');
  }

  // Check data channel
  if (diagnostics.connectionHealth.dataChannelState !== 'open') {
    issues.push(`❌ Data channel: ${diagnostics.connectionHealth.dataChannelState}`);
    fixes.push('Wait for data channel to open or restart session');
  } else {
    issues.push('✅ Data channel is open');
  }

  // Check local stream
  if (!diagnostics.connectionHealth.hasLocalStream) {
    issues.push('❌ No microphone stream');
    fixes.push('Check microphone permissions');
  } else if (diagnostics.connectionHealth.localStreamTracks === 0) {
    issues.push('❌ No audio tracks in stream');
    fixes.push('Restart session to reinitialize audio');
  } else {
    issues.push('✅ Microphone stream available');
  }

  return {
    timestamp: new Date().toISOString(),
    issues,
    fixes,
    canDetectInput: diagnostics.sessionState.isSessionActive && 
                   diagnostics.sessionState.isConnected && 
                   diagnostics.connectionHealth.dataChannelState === 'open' && 
                   diagnostics.connectionHealth.hasLocalStream &&
                   diagnostics.connectionHealth.localStreamTracks > 0
  };
};

export default {
  runWebRTCDiagnostics,
  monitorWebRTCEvents,
  testUserInputDetection,
  quickInputCheck
};
