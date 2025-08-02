/**
 * UI State Synchronization Validator
 * Tests and validates that UI elements properly sync with WebRTC service state
 */

import webRTCConversationService from '../services/WebRTCConversationService';

/**
 * Validate UI state synchronization during session lifecycle
 * @param {Object} hookState - Current state from useWebRTCConversation hook
 * @returns {Object} Validation results
 */
export const validateUIStateSynchronization = (hookState) => {
  const serviceState = webRTCConversationService.getState();
  
  const validation = {
    timestamp: new Date().toISOString(),
    isInSync: true,
    mismatches: [],
    warnings: [],
    recommendations: []
  };

  // Check critical state synchronization
  const criticalChecks = [
    { key: 'isSessionActive', service: serviceState.isSessionActive, hook: hookState.isSessionActive },
    { key: 'isConnected', service: serviceState.isConnected, hook: hookState.isConnected },
    { key: 'isAISpeaking', service: serviceState.isAISpeaking, hook: hookState.isAISpeaking },
    { key: 'currentScenario', service: serviceState.currentScenario, hook: hookState.currentScenario },
    { key: 'conversationHistory.length', service: serviceState.conversationHistory?.length || 0, hook: hookState.conversationHistory?.length || 0 },
    { key: 'isCleaningUp', service: serviceState.isCleaningUp, hook: hookState.isCleaningUp },
    { key: 'canStartNewSession', service: serviceState.canStartNewSession, hook: hookState.canStartNewSession }
  ];

  criticalChecks.forEach(check => {
    if (check.service !== check.hook) {
      validation.isInSync = false;
      validation.mismatches.push({
        property: check.key,
        serviceValue: check.service,
        hookValue: check.hook,
        severity: 'critical'
      });
    }
  });

  // Check transcript synchronization
  if (serviceState.currentAITranscript !== hookState.currentAITranscript) {
    validation.warnings.push({
      property: 'currentAITranscript',
      serviceValue: serviceState.currentAITranscript?.length || 0,
      hookValue: hookState.currentAITranscript?.length || 0,
      severity: 'warning'
    });
  }

  // Generate recommendations
  if (validation.mismatches.length > 0) {
    validation.recommendations.push('Critical state mismatch detected - check event handlers and state updates');
  }

  if (serviceState.isSessionActive && !hookState.isSessionActive) {
    validation.recommendations.push('Service shows active session but UI shows inactive - check sessionStarted event handling');
  }

  if (serviceState.conversationHistory?.length > 0 && hookState.conversationHistory?.length === 0) {
    validation.recommendations.push('Service has conversation history but UI shows none - check transcript event handling');
  }

  return validation;
};

/**
 * Monitor UI state synchronization over time
 * @param {Function} getHookState - Function to get current hook state
 * @param {number} duration - Duration to monitor in milliseconds
 * @returns {Promise<Object>} Monitoring results
 */
export const monitorUIStateSynchronization = async (getHookState, duration = 30000) => {
  const results = {
    startTime: Date.now(),
    endTime: null,
    snapshots: [],
    issues: [],
    summary: {}
  };

  const interval = setInterval(() => {
    try {
      const hookState = getHookState();
      const validation = validateUIStateSynchronization(hookState);
      
      results.snapshots.push({
        timestamp: Date.now(),
        validation,
        serviceState: webRTCConversationService.getState(),
        hookState
      });

      if (!validation.isInSync) {
        results.issues.push({
          timestamp: Date.now(),
          mismatches: validation.mismatches,
          warnings: validation.warnings
        });
      }
    } catch (error) {
      results.issues.push({
        timestamp: Date.now(),
        error: error.message
      });
    }
  }, 1000); // Check every second

  // Stop monitoring after duration
  setTimeout(() => {
    clearInterval(interval);
    results.endTime = Date.now();
    
    // Generate summary
    results.summary = {
      totalSnapshots: results.snapshots.length,
      totalIssues: results.issues.length,
      syncSuccessRate: ((results.snapshots.length - results.issues.length) / results.snapshots.length * 100).toFixed(1),
      commonIssues: getCommonIssues(results.issues)
    };
  }, duration);

  return new Promise(resolve => {
    setTimeout(() => resolve(results), duration + 100);
  });
};

/**
 * Test session restart UI synchronization
 * @param {Function} startSession - Function to start session
 * @param {Function} stopSession - Function to stop session
 * @param {Function} getHookState - Function to get current hook state
 * @returns {Promise<Object>} Test results
 */
export const testSessionRestartUISync = async (startSession, stopSession, getHookState) => {
  const results = {
    success: false,
    steps: [],
    issues: [],
    stateSnapshots: []
  };

  try {
    console.log('🧪 Testing session restart UI synchronization...');

    // Step 1: Initial state check
    results.steps.push('Checking initial state');
    const initialState = getHookState();
    const initialValidation = validateUIStateSynchronization(initialState);
    results.stateSnapshots.push({ step: 'initial', validation: initialValidation });

    if (!initialValidation.isInSync) {
      results.issues.push('Initial state not synchronized');
    }

    // Step 2: Start first session
    results.steps.push('Starting first session');
    await startSession('test-scenario', 'beginner');
    
    // Wait for session to establish
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const firstSessionState = getHookState();
    const firstSessionValidation = validateUIStateSynchronization(firstSessionState);
    results.stateSnapshots.push({ step: 'first-session', validation: firstSessionValidation });

    if (!firstSessionValidation.isInSync) {
      results.issues.push('First session state not synchronized');
    }

    // Step 3: Stop first session
    results.steps.push('Stopping first session');
    await stopSession();
    
    // Wait for cleanup
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const afterStopState = getHookState();
    const afterStopValidation = validateUIStateSynchronization(afterStopState);
    results.stateSnapshots.push({ step: 'after-stop', validation: afterStopValidation });

    if (!afterStopValidation.isInSync) {
      results.issues.push('After stop state not synchronized');
    }

    // Step 4: Start second session (the critical test)
    results.steps.push('Starting second session');
    await startSession('test-scenario-2', 'beginner');
    
    // Wait for session to establish
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const secondSessionState = getHookState();
    const secondSessionValidation = validateUIStateSynchronization(secondSessionState);
    results.stateSnapshots.push({ step: 'second-session', validation: secondSessionValidation });

    if (!secondSessionValidation.isInSync) {
      results.issues.push('Second session state not synchronized - THIS IS THE MAIN ISSUE');
    }

    // Step 5: Test conversation flow
    results.steps.push('Testing conversation flow');
    
    // Monitor for conversation events
    const monitoring = await new Promise(resolve => {
      const events = [];
      const timeout = setTimeout(() => resolve(events), 10000);
      
      const handlers = {
        userTranscriptComplete: (data) => events.push({ type: 'userTranscript', data }),
        aiTranscriptComplete: (data) => events.push({ type: 'aiTranscript', data }),
        stateChanged: (data) => events.push({ type: 'stateChanged', data })
      };
      
      Object.keys(handlers).forEach(event => {
        webRTCConversationService.on(event, handlers[event]);
      });
      
      setTimeout(() => {
        Object.keys(handlers).forEach(event => {
          webRTCConversationService.off(event, handlers[event]);
        });
        clearTimeout(timeout);
        resolve(events);
      }, 10000);
    });

    results.stateSnapshots.push({ step: 'conversation-events', events: monitoring });

    // Final cleanup
    await stopSession();

    // Determine success
    results.success = results.issues.length === 0;

  } catch (error) {
    console.error('🧪 Error testing session restart UI sync:', error);
    results.issues.push(`Test error: ${error.message}`);
  }

  return results;
};

/**
 * Get common issues from monitoring results
 */
function getCommonIssues(issues) {
  const issueTypes = {};
  
  issues.forEach(issue => {
    if (issue.mismatches) {
      issue.mismatches.forEach(mismatch => {
        const key = mismatch.property;
        issueTypes[key] = (issueTypes[key] || 0) + 1;
      });
    }
  });
  
  return Object.entries(issueTypes)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([property, count]) => ({ property, count }));
}

/**
 * Quick UI sync check for debugging
 * @param {Object} hookState - Current hook state
 * @returns {Object} Quick check results
 */
export const quickUISyncCheck = (hookState) => {
  const validation = validateUIStateSynchronization(hookState);
  
  return {
    timestamp: new Date().toISOString(),
    isInSync: validation.isInSync,
    criticalIssues: validation.mismatches.filter(m => m.severity === 'critical').length,
    warnings: validation.warnings.length,
    topIssues: validation.mismatches.slice(0, 3).map(m => `${m.property}: service=${m.serviceValue}, hook=${m.hookValue}`),
    recommendations: validation.recommendations.slice(0, 2)
  };
};

export default {
  validateUIStateSynchronization,
  monitorUIStateSynchronization,
  testSessionRestartUISync,
  quickUISyncCheck
};
