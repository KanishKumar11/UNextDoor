/**
 * Session Restart Validator
 * Utility to validate and debug WebRTC session restart issues
 */

import webRTCConversationService from '../services/WebRTCConversationService';

/**
 * Validate that a session can be restarted properly
 * @param {string} scenarioId - The scenario ID to test with
 * @param {string} level - The level to test with
 * @returns {Promise<Object>} Validation results
 */
export const validateSessionRestart = async (scenarioId = 'test-scenario', level = 'beginner') => {
  const results = {
    success: false,
    steps: [],
    errors: [],
    sessionHealth: {},
    recommendations: []
  };

  try {
    console.log('🧪 Starting session restart validation...');

    // Step 1: Check initial state
    results.steps.push('Checking initial state');
    const initialState = webRTCConversationService.getState();
    const initialHealth = webRTCConversationService.getSessionHealth();
    
    console.log('Initial state:', initialState);
    console.log('Initial health:', initialHealth);

    if (initialState.isSessionActive) {
      results.errors.push('Service has active session at start - should be clean');
    }

    // Step 2: Start first session
    results.steps.push('Starting first session');
    const firstSessionStart = await webRTCConversationService.startSession(scenarioId, level);
    
    if (!firstSessionStart) {
      results.errors.push('Failed to start first session');
      return results;
    }

    // Wait for session to be fully established
    await new Promise(resolve => setTimeout(resolve, 3000));

    const firstSessionState = webRTCConversationService.getState();
    if (!firstSessionState.isSessionActive) {
      results.errors.push('First session not active after start');
    }

    // Step 3: Stop first session
    results.steps.push('Stopping first session');
    await webRTCConversationService.stopSession();

    // Wait for cleanup to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    const afterStopState = webRTCConversationService.getState();
    const afterStopHealth = webRTCConversationService.getSessionHealth();

    console.log('After stop state:', afterStopState);
    console.log('After stop health:', afterStopHealth);

    if (afterStopState.isSessionActive) {
      results.errors.push('Session still active after stop');
    }

    if (afterStopState.isCleaningUp) {
      results.errors.push('Service still cleaning up after stop');
    }

    // Step 4: Validate clean state
    results.steps.push('Validating clean state');
    if (afterStopHealth.hasLocalStream) {
      results.errors.push('Local stream not properly cleaned up');
    }

    if (afterStopHealth.peerConnectionState !== 'none' && afterStopHealth.peerConnectionState !== 'closed') {
      results.errors.push(`Peer connection not properly closed: ${afterStopHealth.peerConnectionState}`);
    }

    // Step 5: Check restart readiness
    results.steps.push('Checking restart readiness');
    if (!afterStopState.canStartNewSession) {
      const cooldownRemaining = afterStopHealth.sessionRestartCooldownRemaining;
      if (cooldownRemaining > 0) {
        console.log(`Waiting for cooldown: ${cooldownRemaining}ms`);
        await new Promise(resolve => setTimeout(resolve, cooldownRemaining + 100));
      } else {
        results.errors.push('Cannot start new session but no cooldown active');
      }
    }

    // Step 6: Start second session
    results.steps.push('Starting second session');
    const secondSessionStart = await webRTCConversationService.startSession(scenarioId, level);

    if (!secondSessionStart) {
      results.errors.push('Failed to start second session - this is the main issue');
      
      // Get detailed health info for debugging
      const failureHealth = webRTCConversationService.getSessionHealth();
      results.sessionHealth = failureHealth;
      
      // Add specific recommendations based on failure
      if (failureHealth.isCleaningUp) {
        results.recommendations.push('Service is still cleaning up - increase cleanup timeout');
      }
      
      if (failureHealth.sessionRestartCooldownRemaining > 0) {
        results.recommendations.push('Session restart cooldown still active - wait longer between sessions');
      }
      
      if (failureHealth.hasLocalStream) {
        results.recommendations.push('Local stream not properly released - fix stream cleanup');
      }
      
      if (failureHealth.peerConnectionState !== 'none') {
        results.recommendations.push('Peer connection not properly closed - fix connection cleanup');
      }
      
      return results;
    }

    // Wait for second session to be established
    await new Promise(resolve => setTimeout(resolve, 3000));

    const secondSessionState = webRTCConversationService.getState();
    if (!secondSessionState.isSessionActive) {
      results.errors.push('Second session not active after start');
    }

    // Step 7: Clean up second session
    results.steps.push('Cleaning up second session');
    await webRTCConversationService.stopSession();

    // Final validation
    if (results.errors.length === 0) {
      results.success = true;
      console.log('✅ Session restart validation passed');
    } else {
      console.log('❌ Session restart validation failed:', results.errors);
    }

    results.sessionHealth = webRTCConversationService.getSessionHealth();

  } catch (error) {
    console.error('🧪 Session restart validation error:', error);
    results.errors.push(`Validation error: ${error.message}`);
    results.sessionHealth = webRTCConversationService.getSessionHealth();
  }

  return results;
};

/**
 * Quick health check for debugging session issues
 * @returns {Object} Current session health information
 */
export const getSessionHealthReport = () => {
  const state = webRTCConversationService.getState();
  const health = webRTCConversationService.getSessionHealth();
  
  return {
    timestamp: new Date().toISOString(),
    state,
    health,
    canRestart: health.canStartNewSession,
    issues: [
      ...(state.isCleaningUp ? ['Service is cleaning up'] : []),
      ...(health.sessionRestartCooldownRemaining > 0 ? [`Cooldown active: ${health.sessionRestartCooldownRemaining}ms`] : []),
      ...(health.hasLocalStream ? ['Local stream not released'] : []),
      ...(health.peerConnectionState !== 'none' && health.peerConnectionState !== 'closed' ? [`Peer connection: ${health.peerConnectionState}`] : []),
    ]
  };
};

/**
 * Force cleanup for debugging purposes
 * @returns {Promise<void>}
 */
export const forceCleanup = async () => {
  console.log('🧹 Forcing cleanup for debugging...');
  
  try {
    await webRTCConversationService.stopSession();
    
    // Wait extra time for mobile cleanup
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const health = webRTCConversationService.getSessionHealth();
    console.log('After force cleanup:', health);
    
    return health;
  } catch (error) {
    console.error('Error during force cleanup:', error);
    throw error;
  }
};
