/**
 * Session Transition Fix Validator
 * Tests that session transitions between scenarios work properly without race conditions
 */

import webRTCConversationService from '../services/WebRTCConversationService';

/**
 * Test session transition between scenarios
 * @param {Function} startSession - Function to start session
 * @param {Function} stopSession - Function to stop session
 * @param {Function} clearAllData - Function to clear all data
 * @param {Function} getHookState - Function to get current hook state
 * @returns {Promise<Object>} Test results
 */
export const testSessionTransition = async (startSession, stopSession, clearAllData, getHookState) => {
  const results = {
    success: false,
    steps: [],
    issues: [],
    cleanupCalls: 0,
    destroyCalls: 0,
    initializeCalls: 0
  };

  try {
    console.log('🧪 Testing session transition between scenarios...');

    // Monitor service calls
    const originalDestroy = webRTCConversationService.destroy;
    const originalInitialize = webRTCConversationService.initialize;
    
    webRTCConversationService.destroy = async function(...args) {
      results.destroyCalls++;
      console.log(`🧪 Destroy call #${results.destroyCalls}`);
      return originalDestroy.apply(this, args);
    };
    
    webRTCConversationService.initialize = async function(...args) {
      results.initializeCalls++;
      console.log(`🧪 Initialize call #${results.initializeCalls}`);
      return originalInitialize.apply(this, args);
    };

    // Step 1: Start first session
    results.steps.push('Starting first session');
    const firstSessionStart = await startSession('scenario-1', 'beginner');
    
    if (!firstSessionStart) {
      results.issues.push('First session failed to start');
      return results;
    }

    // Wait for session to establish
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const firstSessionState = getHookState();
    if (!firstSessionState.isSessionActive) {
      results.issues.push('First session not active after start');
    }

    // Step 2: Simulate scenario transition (like navigation)
    results.steps.push('Simulating scenario transition');
    
    // This simulates what happens during navigation
    await clearAllData();
    
    // Wait for cleanup to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const afterCleanupState = getHookState();
    
    // Step 3: Check if service is ready for new session
    results.steps.push('Checking service readiness');
    
    // Wait for auto-reinitialization
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const readyState = getHookState();
    if (!readyState.isInitialized) {
      results.issues.push('Service not reinitialized after cleanup');
    }

    // Step 4: Start second session
    results.steps.push('Starting second session');
    
    const secondSessionStart = await startSession('scenario-2', 'beginner');
    
    if (!secondSessionStart) {
      results.issues.push('Second session failed to start - CRITICAL ISSUE');
      
      // Get debug info
      const debugState = webRTCConversationService.getSessionHealth();
      results.issues.push(`Debug info: ${JSON.stringify(debugState)}`);
    } else {
      // Wait for session to establish
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const secondSessionState = getHookState();
      if (!secondSessionState.isSessionActive) {
        results.issues.push('Second session not active after start');
      }
      
      // Clean up second session
      await stopSession();
    }

    // Restore original methods
    webRTCConversationService.destroy = originalDestroy;
    webRTCConversationService.initialize = originalInitialize;

    // Analyze results
    if (results.destroyCalls > 2) {
      results.issues.push(`Too many destroy calls: ${results.destroyCalls} (should be ≤ 2)`);
    }
    
    if (results.initializeCalls < 2) {
      results.issues.push(`Not enough initialize calls: ${results.initializeCalls} (should be ≥ 2)`);
    }

    results.success = results.issues.length === 0;
    
    if (results.success) {
      console.log('✅ Session transition test PASSED');
    } else {
      console.log('❌ Session transition test FAILED:', results.issues);
    }

  } catch (error) {
    console.error('🧪 Error testing session transition:', error);
    results.issues.push(`Test error: ${error.message}`);
  }

  return results;
};

/**
 * Monitor for multiple cleanup calls during navigation
 * @param {Function} clearAllData - Function to clear all data
 * @returns {Promise<Object>} Monitoring results
 */
export const monitorCleanupCalls = async (clearAllData) => {
  const monitoring = {
    cleanupCalls: [],
    destroyCalls: [],
    totalCleanups: 0,
    totalDestroys: 0,
    hasRaceCondition: false
  };

  try {
    console.log('🧪 Monitoring cleanup calls...');

    // Monitor cleanup calls
    const originalStopSessionInternal = webRTCConversationService.stopSessionInternal;
    const originalDestroy = webRTCConversationService.destroy;
    
    webRTCConversationService.stopSessionInternal = async function(...args) {
      monitoring.totalCleanups++;
      monitoring.cleanupCalls.push({
        timestamp: Date.now(),
        callNumber: monitoring.totalCleanups
      });
      console.log(`🧪 Cleanup call #${monitoring.totalCleanups}`);
      return originalStopSessionInternal.apply(this, args);
    };
    
    webRTCConversationService.destroy = async function(...args) {
      monitoring.totalDestroys++;
      monitoring.destroyCalls.push({
        timestamp: Date.now(),
        callNumber: monitoring.totalDestroys
      });
      console.log(`🧪 Destroy call #${monitoring.totalDestroys}`);
      return originalDestroy.apply(this, args);
    };

    // Trigger cleanup
    await clearAllData();
    
    // Wait for any additional cleanup calls
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Restore original methods
    webRTCConversationService.stopSessionInternal = originalStopSessionInternal;
    webRTCConversationService.destroy = originalDestroy;

    // Check for race conditions
    if (monitoring.totalCleanups > 2 || monitoring.totalDestroys > 1) {
      monitoring.hasRaceCondition = true;
    }

    console.log(`🧪 Monitoring complete: ${monitoring.totalCleanups} cleanups, ${monitoring.totalDestroys} destroys`);

  } catch (error) {
    console.error('🧪 Error monitoring cleanup calls:', error);
  }

  return monitoring;
};

/**
 * Test service reinitialization after destruction
 * @param {Function} initialize - Function to initialize service
 * @param {Function} clearAllData - Function to clear all data
 * @param {Function} getHookState - Function to get current hook state
 * @returns {Promise<Object>} Test results
 */
export const testServiceReinitialization = async (initialize, clearAllData, getHookState) => {
  const results = {
    success: false,
    steps: [],
    issues: [],
    reinitializationTime: 0
  };

  try {
    console.log('🧪 Testing service reinitialization...');

    // Step 1: Ensure service is initialized
    results.steps.push('Initial service state');
    let initialState = getHookState();
    
    if (!initialState.isInitialized) {
      await initialize();
      await new Promise(resolve => setTimeout(resolve, 1000));
      initialState = getHookState();
    }

    if (!initialState.isInitialized) {
      results.issues.push('Service not initialized at start');
      return results;
    }

    // Step 2: Destroy service
    results.steps.push('Destroying service');
    const destroyStartTime = Date.now();
    
    await clearAllData();
    
    // Step 3: Wait for auto-reinitialization
    results.steps.push('Waiting for auto-reinitialization');
    
    let reinitializedState;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 200));
      reinitializedState = getHookState();
      
      if (reinitializedState.isInitialized) {
        results.reinitializationTime = Date.now() - destroyStartTime;
        break;
      }
      
      attempts++;
    }

    if (!reinitializedState.isInitialized) {
      results.issues.push('Service not reinitialized after destruction');
    } else {
      console.log(`✅ Service reinitialized in ${results.reinitializationTime}ms`);
    }

    results.success = results.issues.length === 0;

  } catch (error) {
    console.error('🧪 Error testing service reinitialization:', error);
    results.issues.push(`Test error: ${error.message}`);
  }

  return results;
};

/**
 * Quick check for session transition readiness
 * @param {Function} getHookState - Function to get current hook state
 * @returns {Object} Readiness check results
 */
export const quickTransitionReadinessCheck = (getHookState) => {
  const hookState = getHookState();
  const serviceHealth = webRTCConversationService.getSessionHealth();
  
  const readiness = {
    timestamp: new Date().toISOString(),
    isReady: true,
    issues: [],
    recommendations: []
  };

  // Check service state
  if (!hookState.isInitialized) {
    readiness.isReady = false;
    readiness.issues.push('Service not initialized');
    readiness.recommendations.push('Wait for service initialization or call initialize()');
  }

  if (hookState.isCleaningUp) {
    readiness.isReady = false;
    readiness.issues.push('Service is cleaning up');
    readiness.recommendations.push('Wait for cleanup to complete');
  }

  if (hookState.isSessionActive) {
    readiness.issues.push('Session is still active');
    readiness.recommendations.push('Stop current session before starting new one');
  }

  // Check service health
  if (serviceHealth.hasCleanupPromise) {
    readiness.isReady = false;
    readiness.issues.push('Cleanup operation in progress');
    readiness.recommendations.push('Wait for cleanup to complete');
  }

  if (serviceHealth.sessionRestartCooldownRemaining > 0) {
    readiness.issues.push(`Session restart cooldown: ${serviceHealth.sessionRestartCooldownRemaining}ms`);
    readiness.recommendations.push('Wait for cooldown period to expire');
  }

  return readiness;
};

export default {
  testSessionTransition,
  monitorCleanupCalls,
  testServiceReinitialization,
  quickTransitionReadinessCheck
};
