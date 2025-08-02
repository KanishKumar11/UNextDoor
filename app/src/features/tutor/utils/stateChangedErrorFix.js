/**
 * State Changed Error Fix Validator
 * Tests that the ReferenceError in stateChanged event listener is resolved
 */

import webRTCConversationService from '../services/WebRTCConversationService';

/**
 * Test that stateChanged events don't cause ReferenceErrors
 * @param {Function} getHookState - Function to get current hook state
 * @returns {Promise<Object>} Test results
 */
export const testStateChangedEventHandling = async (getHookState) => {
  const results = {
    success: false,
    errors: [],
    stateChanges: [],
    testSteps: []
  };

  try {
    console.log('🧪 Testing stateChanged event handling...');

    // Step 1: Monitor for errors in stateChanged events
    results.testSteps.push('Monitoring stateChanged events for errors');

    const originalConsoleError = console.error;
    const capturedErrors = [];

    // Capture console errors
    console.error = (...args) => {
      const errorMessage = args.join(' ');
      if (errorMessage.includes('stateChanged') || errorMessage.includes('service') || errorMessage.includes('ReferenceError')) {
        capturedErrors.push({
          timestamp: Date.now(),
          message: errorMessage,
          args: args
        });
      }
      originalConsoleError(...args);
    };

    // Step 2: Trigger state changes that would cause the error
    results.testSteps.push('Triggering state changes');

    // Monitor stateChanged events
    const stateChangeHandler = (state) => {
      results.stateChanges.push({
        timestamp: Date.now(),
        hasState: !!state,
        isSessionActive: state?.isSessionActive,
        isConnected: state?.isConnected,
        conversationHistoryLength: state?.conversationHistory?.length || 0
      });
    };

    webRTCConversationService.on('stateChanged', stateChangeHandler);

    // Trigger some state updates that would previously cause the error
    webRTCConversationService.updateState({
      isConnected: true,
      conversationHistory: [{ type: 'test', text: 'test message', timestamp: new Date() }]
    });

    // Wait for state change to be processed
    await new Promise(resolve => setTimeout(resolve, 100));

    webRTCConversationService.updateState({
      isAISpeaking: true,
      currentAITranscript: 'Test AI response'
    });

    // Wait for state change to be processed
    await new Promise(resolve => setTimeout(resolve, 100));

    // Step 3: Check if hook state is properly synchronized
    results.testSteps.push('Checking hook state synchronization');

    const hookState = getHookState();
    const serviceState = webRTCConversationService.getState();

    // Verify no ReferenceErrors occurred
    if (capturedErrors.length === 0) {
      console.log('✅ No ReferenceErrors detected in stateChanged events');
      results.success = true;
    } else {
      console.log('❌ ReferenceErrors still occurring:', capturedErrors);
      results.errors = capturedErrors;
    }

    // Step 4: Verify canStartNewSession can be called without errors
    results.testSteps.push('Testing canStartNewSession method');

    try {
      const canStart = webRTCConversationService.canStartNewSession();
      console.log('✅ canStartNewSession() called successfully:', canStart);
    } catch (error) {
      console.log('❌ Error calling canStartNewSession():', error);
      results.errors.push({
        timestamp: Date.now(),
        message: `canStartNewSession error: ${error.message}`,
        type: 'method_call_error'
      });
      results.success = false;
    }

    // Cleanup
    webRTCConversationService.off('stateChanged', stateChangeHandler);
    console.error = originalConsoleError;

  } catch (error) {
    console.error('🧪 Error testing stateChanged event handling:', error);
    results.errors.push({
      timestamp: Date.now(),
      message: `Test error: ${error.message}`,
      type: 'test_error'
    });
  }

  return results;
};

/**
 * Quick check for ReferenceErrors in current session
 * @param {Function} getHookState - Function to get current hook state
 * @returns {Object} Quick check results
 */
export const quickReferenceErrorCheck = (getHookState) => {
  const results = {
    timestamp: new Date().toISOString(),
    hasErrors: false,
    errors: [],
    canCallMethods: true,
    stateSync: true
  };

  try {
    // Test 1: Can we call canStartNewSession without errors?
    try {
      const canStart = webRTCConversationService.canStartNewSession();
      console.log('✅ canStartNewSession() works:', canStart);
    } catch (error) {
      results.hasErrors = true;
      results.canCallMethods = false;
      results.errors.push(`canStartNewSession error: ${error.message}`);
    }

    // Test 2: Can we get state without errors?
    try {
      const serviceState = webRTCConversationService.getState();
      const hookState = getHookState();

      // Basic sync check
      if (serviceState.isSessionActive !== hookState.isSessionActive) {
        results.stateSync = false;
        results.errors.push('State sync issue: isSessionActive mismatch');
      }
    } catch (error) {
      results.hasErrors = true;
      results.errors.push(`State access error: ${error.message}`);
    }

    // Test 3: Trigger a small state update to see if it causes errors
    try {
      const originalConsoleError = console.error;
      let errorCaught = false;

      console.error = (...args) => {
        const errorMessage = args.join(' ');
        if (errorMessage.includes('ReferenceError') || errorMessage.includes('service')) {
          errorCaught = true;
          results.hasErrors = true;
          results.errors.push(`Console error: ${errorMessage}`);
        }
        originalConsoleError(...args);
      };

      // Trigger a state update (using AI transcript since user transcript was removed)
      webRTCConversationService.updateState({
        currentAITranscript: 'Test AI transcript update'
      });

      // Wait briefly for any async errors
      setTimeout(() => {
        console.error = originalConsoleError;
        if (errorCaught) {
          console.log('❌ ReferenceError still occurring in state updates');
        } else {
          console.log('✅ No ReferenceErrors in state updates');
        }
      }, 50);

    } catch (error) {
      results.hasErrors = true;
      results.errors.push(`State update test error: ${error.message}`);
    }

  } catch (error) {
    results.hasErrors = true;
    results.errors.push(`Quick check error: ${error.message}`);
  }

  return results;
};

/**
 * Monitor for ReferenceErrors during a conversation session
 * @param {Function} startSession - Function to start session
 * @param {Function} stopSession - Function to stop session
 * @param {Function} getHookState - Function to get current hook state
 * @returns {Promise<Object>} Monitoring results
 */
export const monitorReferenceErrorsDuringSession = async (startSession, stopSession, getHookState) => {
  const monitoring = {
    errors: [],
    stateChanges: 0,
    sessionEvents: [],
    success: false
  };

  try {
    console.log('🧪 Monitoring for ReferenceErrors during session...');

    // Capture errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const errorMessage = args.join(' ');
      if (errorMessage.includes('ReferenceError') ||
        errorMessage.includes('service') ||
        errorMessage.includes('stateChanged')) {
        monitoring.errors.push({
          timestamp: Date.now(),
          message: errorMessage
        });
      }
      originalConsoleError(...args);
    };

    // Monitor state changes
    const stateChangeHandler = () => {
      monitoring.stateChanges++;
    };

    // Monitor session events
    const sessionEventHandler = (eventType) => (data) => {
      monitoring.sessionEvents.push({
        type: eventType,
        timestamp: Date.now()
      });
    };

    webRTCConversationService.on('stateChanged', stateChangeHandler);
    webRTCConversationService.on('sessionStarted', sessionEventHandler('sessionStarted'));
    webRTCConversationService.on('sessionStopped', sessionEventHandler('sessionStopped'));

    // Start session
    const sessionStarted = await startSession('error-test', 'beginner');

    if (sessionStarted) {
      // Wait for session to establish
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Stop session
      await stopSession();

      // Wait for cleanup
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Check results
    if (monitoring.errors.length === 0) {
      monitoring.success = true;
      console.log('✅ No ReferenceErrors during session lifecycle');
    } else {
      console.log('❌ ReferenceErrors detected:', monitoring.errors);
    }

    // Cleanup
    webRTCConversationService.off('stateChanged', stateChangeHandler);
    webRTCConversationService.off('sessionStarted', sessionEventHandler('sessionStarted'));
    webRTCConversationService.off('sessionStopped', sessionEventHandler('sessionStopped'));
    console.error = originalConsoleError;

  } catch (error) {
    monitoring.errors.push({
      timestamp: Date.now(),
      message: `Monitoring error: ${error.message}`
    });
  }

  return monitoring;
};

export default {
  testStateChangedEventHandling,
  quickReferenceErrorCheck,
  monitorReferenceErrorsDuringSession
};
