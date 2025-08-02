/**
 * Session Restart Fix Validator
 * Tests that both session restart functionality and UI synchronization work together
 */

import webRTCConversationService from '../services/WebRTCConversationService';

/**
 * Test session restart functionality with UI synchronization
 * @param {Function} startSession - Function to start session
 * @param {Function} stopSession - Function to stop session  
 * @param {Function} getHookState - Function to get current hook state
 * @returns {Promise<Object>} Test results
 */
export const testSessionRestartWithUISync = async (startSession, stopSession, getHookState) => {
  const results = {
    success: false,
    steps: [],
    issues: [],
    sessionResults: [],
    uiSyncResults: []
  };

  try {
    console.log('🧪 Testing session restart with UI synchronization...');

    // Test First Session
    results.steps.push('Testing first session');
    console.log('🧪 Starting first session...');
    
    const firstSessionStart = await startSession('test-scenario-1', 'beginner');
    if (!firstSessionStart) {
      results.issues.push('First session failed to start');
      return results;
    }

    // Wait for session to establish
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const firstSessionState = getHookState();
    const firstSessionService = webRTCConversationService.getState();
    
    results.sessionResults.push({
      session: 'first',
      started: firstSessionStart,
      hookState: {
        isSessionActive: firstSessionState.isSessionActive,
        isConnected: firstSessionState.isConnected,
        currentScenario: firstSessionState.currentScenario
      },
      serviceState: {
        isSessionActive: firstSessionService.isSessionActive,
        isConnected: firstSessionService.isConnected,
        currentScenario: firstSessionService.currentScenario
      }
    });

    // Validate first session UI sync
    if (firstSessionState.isSessionActive !== firstSessionService.isSessionActive) {
      results.issues.push('First session: UI state mismatch - isSessionActive');
    }
    if (firstSessionState.isConnected !== firstSessionService.isConnected) {
      results.issues.push('First session: UI state mismatch - isConnected');
    }

    // Stop first session
    console.log('🧪 Stopping first session...');
    await stopSession();
    
    // Wait for cleanup
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test Second Session (Critical Test)
    results.steps.push('Testing second session');
    console.log('🧪 Starting second session...');
    
    const secondSessionStart = await startSession('test-scenario-2', 'beginner');
    if (!secondSessionStart) {
      results.issues.push('Second session failed to start - CRITICAL ISSUE');
      
      // Get debug info
      const debugState = webRTCConversationService.getSessionHealth();
      results.issues.push(`Debug info: ${JSON.stringify(debugState)}`);
      return results;
    }

    // Wait for session to establish
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const secondSessionState = getHookState();
    const secondSessionService = webRTCConversationService.getState();
    
    results.sessionResults.push({
      session: 'second',
      started: secondSessionStart,
      hookState: {
        isSessionActive: secondSessionState.isSessionActive,
        isConnected: secondSessionState.isConnected,
        currentScenario: secondSessionState.currentScenario
      },
      serviceState: {
        isSessionActive: secondSessionService.isSessionActive,
        isConnected: secondSessionService.isConnected,
        currentScenario: secondSessionService.currentScenario
      }
    });

    // Validate second session UI sync
    if (secondSessionState.isSessionActive !== secondSessionService.isSessionActive) {
      results.issues.push('Second session: UI state mismatch - isSessionActive');
    }
    if (secondSessionState.isConnected !== secondSessionService.isConnected) {
      results.issues.push('Second session: UI state mismatch - isConnected');
    }
    if (secondSessionState.currentScenario !== secondSessionService.currentScenario) {
      results.issues.push('Second session: UI state mismatch - currentScenario');
    }

    // Test conversation flow in second session
    results.steps.push('Testing conversation flow in second session');
    
    // Monitor for state changes
    const stateChanges = [];
    const stateHandler = (state) => {
      stateChanges.push({
        timestamp: Date.now(),
        isSessionActive: state.isSessionActive,
        isConnected: state.isConnected,
        conversationHistoryLength: state.conversationHistory?.length || 0
      });
    };
    
    webRTCConversationService.on('stateChanged', stateHandler);
    
    // Wait for potential state changes
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    webRTCConversationService.off('stateChanged', stateHandler);
    
    results.uiSyncResults = stateChanges;

    // Final cleanup
    await stopSession();

    // Determine success
    results.success = results.issues.length === 0;
    
    if (results.success) {
      console.log('✅ Session restart with UI sync test PASSED');
    } else {
      console.log('❌ Session restart with UI sync test FAILED:', results.issues);
    }

  } catch (error) {
    console.error('🧪 Error testing session restart with UI sync:', error);
    results.issues.push(`Test error: ${error.message}`);
  }

  return results;
};

/**
 * Quick validation of current session state
 * @param {Function} getHookState - Function to get current hook state
 * @returns {Object} Validation results
 */
export const quickSessionStateValidation = (getHookState) => {
  const hookState = getHookState();
  const serviceState = webRTCConversationService.getState();
  
  const validation = {
    timestamp: new Date().toISOString(),
    isInSync: true,
    mismatches: [],
    canStartNewSession: webRTCConversationService.canStartNewSession(),
    sessionHealth: webRTCConversationService.getSessionHealth()
  };

  // Check critical state synchronization
  const checks = [
    { key: 'isSessionActive', hook: hookState.isSessionActive, service: serviceState.isSessionActive },
    { key: 'isConnected', hook: hookState.isConnected, service: serviceState.isConnected },
    { key: 'currentScenario', hook: hookState.currentScenario, service: serviceState.currentScenario },
    { key: 'isCleaningUp', hook: hookState.isCleaningUp, service: serviceState.isCleaningUp }
  ];

  checks.forEach(check => {
    if (check.hook !== check.service) {
      validation.isInSync = false;
      validation.mismatches.push({
        property: check.key,
        hookValue: check.hook,
        serviceValue: check.service
      });
    }
  });

  return validation;
};

/**
 * Monitor session restart process step by step
 * @param {Function} startSession - Function to start session
 * @param {Function} stopSession - Function to stop session
 * @param {Function} getHookState - Function to get current hook state
 * @returns {Promise<Object>} Monitoring results
 */
export const monitorSessionRestartProcess = async (startSession, stopSession, getHookState) => {
  const monitoring = {
    steps: [],
    stateSnapshots: [],
    events: [],
    success: false
  };

  try {
    // Monitor events
    const eventHandler = (eventType) => (data) => {
      monitoring.events.push({
        type: eventType,
        timestamp: Date.now(),
        data: typeof data === 'object' ? JSON.stringify(data) : data
      });
    };

    const events = ['sessionStarted', 'sessionStopped', 'connected', 'error', 'stateChanged'];
    events.forEach(event => {
      webRTCConversationService.on(event, eventHandler(event));
    });

    // Step 1: Initial state
    monitoring.steps.push('Initial state');
    monitoring.stateSnapshots.push({
      step: 'initial',
      hookState: getHookState(),
      serviceState: webRTCConversationService.getState(),
      canStart: webRTCConversationService.canStartNewSession()
    });

    // Step 2: Start session
    monitoring.steps.push('Starting session');
    const sessionStarted = await startSession('monitor-test', 'beginner');
    
    monitoring.stateSnapshots.push({
      step: 'after-start',
      sessionStarted,
      hookState: getHookState(),
      serviceState: webRTCConversationService.getState()
    });

    if (sessionStarted) {
      // Wait for establishment
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      monitoring.stateSnapshots.push({
        step: 'established',
        hookState: getHookState(),
        serviceState: webRTCConversationService.getState()
      });

      // Stop session
      monitoring.steps.push('Stopping session');
      await stopSession();
      
      monitoring.stateSnapshots.push({
        step: 'after-stop',
        hookState: getHookState(),
        serviceState: webRTCConversationService.getState()
      });

      monitoring.success = true;
    }

    // Cleanup event listeners
    events.forEach(event => {
      webRTCConversationService.off(event, eventHandler(event));
    });

  } catch (error) {
    monitoring.steps.push(`Error: ${error.message}`);
  }

  return monitoring;
};

export default {
  testSessionRestartWithUISync,
  quickSessionStateValidation,
  monitorSessionRestartProcess
};
