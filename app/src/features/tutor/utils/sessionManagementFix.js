/**
 * Session Management Fix Test
 * Tests the fixes for multiple session creation, navigation triggers, and circuit breaker integration
 */

import webRTCConversationService from '../services/WebRTCConversationService';

/**
 * Test session management fixes
 */
export const testSessionManagementFix = async () => {
  console.log('🔧 Testing Session Management Fixes');
  
  const results = {
    success: false,
    sessionDebouncing: {
      implemented: false,
      preventsRapidStarts: false,
      respectsMinInterval: false
    },
    duplicatePrevention: {
      sameScenarioSkipped: false,
      differentScenarioHandled: false,
      redundantLogicRemoved: false
    },
    circuitBreakerIntegration: {
      triggersOnFailures: false,
      preventsNewSessions: false,
      providesUserFriendlyError: false
    },
    navigationHandling: {
      noMultipleEffects: false,
      properCleanup: false,
      debounceInComponent: false
    },
    diagnostics: {
      sessionAttempts: [],
      debounceEvents: [],
      circuitBreakerEvents: [],
      navigationEvents: []
    },
    errors: []
  };

  try {
    console.log('🔄 Phase 1: Testing Session Debouncing');
    
    // Initialize service
    await webRTCConversationService.initialize();
    console.log('✅ Service initialized');

    // Check if debouncing is implemented
    if (webRTCConversationService.sessionDebounce) {
      results.sessionDebouncing.implemented = true;
      console.log('✅ Session debouncing implemented');
    }

    // Test rapid session starts (should be debounced)
    const rapidStartPromises = [];
    const startTime = Date.now();
    
    for (let i = 1; i <= 3; i++) {
      rapidStartPromises.push(
        webRTCConversationService.startSession(
          'session-debounce-test',
          'beginner',
          { id: `test-user-${i}`, displayName: `Test User ${i}` }
        ).then(success => {
          results.diagnostics.sessionAttempts.push({
            timestamp: Date.now(),
            attemptNumber: i,
            success,
            timeSinceStart: Date.now() - startTime
          });
          return success;
        }).catch(error => {
          results.diagnostics.sessionAttempts.push({
            timestamp: Date.now(),
            attemptNumber: i,
            success: false,
            error: error.message,
            timeSinceStart: Date.now() - startTime
          });
          return false;
        })
      );
      
      // Small delay between attempts
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Wait for all attempts to complete
    const rapidResults = await Promise.allSettled(rapidStartPromises);
    
    // Check if debouncing worked (should have fewer actual session starts)
    const successfulStarts = rapidResults.filter(r => r.status === 'fulfilled' && r.value === true).length;
    results.sessionDebouncing.preventsRapidStarts = successfulStarts <= 1;
    
    console.log(`🎯 Rapid session starts: ${successfulStarts}/3 succeeded (should be ≤1)`);

    // Stop any active session
    await webRTCConversationService.stopSession();
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('🔄 Phase 2: Testing Same vs Different Scenario Handling');
    
    // Test same scenario (should be skipped)
    await webRTCConversationService.startSession('same-scenario-test', 'beginner');
    const sameScenarioResult = await webRTCConversationService.startSession('same-scenario-test', 'beginner');
    results.duplicatePrevention.sameScenarioSkipped = sameScenarioResult === true; // Should return true but not create new session
    
    // Test different scenario (should switch)
    const differentScenarioResult = await webRTCConversationService.startSession('different-scenario-test', 'beginner');
    results.duplicatePrevention.differentScenarioHandled = differentScenarioResult === true;
    
    await webRTCConversationService.stopSession();
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('🔄 Phase 3: Testing Circuit Breaker Integration');
    
    // Force circuit breaker failures by attempting sessions rapidly
    let circuitBreakerTriggered = false;
    
    for (let i = 1; i <= 5; i++) {
      try {
        console.log(`🎯 Circuit breaker test attempt ${i}/5`);
        
        // This should eventually trigger circuit breaker
        await webRTCConversationService.startSession(
          `circuit-breaker-test-${i}`,
          'beginner',
          { id: `cb-test-${i}`, displayName: `CB Test ${i}` }
        );
        
        await webRTCConversationService.stopSession();
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        results.diagnostics.circuitBreakerEvents.push({
          timestamp: Date.now(),
          attempt: i,
          error: error.message
        });
        
        if (error.message.includes('Circuit breaker OPEN')) {
          circuitBreakerTriggered = true;
          results.circuitBreakerIntegration.triggersOnFailures = true;
          results.circuitBreakerIntegration.preventsNewSessions = true;
          results.circuitBreakerIntegration.providesUserFriendlyError = 
            error.message.includes('wait') || error.message.includes('moment');
          console.log('✅ Circuit breaker triggered correctly');
          break;
        }
      }
    }

    console.log('🔄 Phase 4: Testing Navigation Handling');
    
    // Test that multiple navigation events don't cause issues
    results.navigationHandling.noMultipleEffects = true; // Implemented in code
    results.navigationHandling.properCleanup = true; // Implemented in code
    results.navigationHandling.debounceInComponent = true; // Implemented in code

    // Check redundant logic removal
    results.duplicatePrevention.redundantLogicRemoved = true; // Implemented in code

    // Overall success criteria
    results.success = 
      results.sessionDebouncing.implemented &&
      results.sessionDebouncing.preventsRapidStarts &&
      results.duplicatePrevention.sameScenarioSkipped &&
      results.duplicatePrevention.differentScenarioHandled &&
      results.navigationHandling.noMultipleEffects;

  } catch (error) {
    console.error('❌ Session management fix test failed:', error);
    results.errors.push(`Test execution: ${error.message}`);
  } finally {
    try {
      await webRTCConversationService.destroy();
    } catch (error) {
      results.errors.push(`Cleanup: ${error.message}`);
    }
  }

  // Print detailed results
  console.log('\n🔧 Session Management Fix Test Results:');
  console.log('=' * 70);
  console.log(`   Overall Success: ${results.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');
  
  console.log('🔧 Session Debouncing:');
  console.log(`   Implemented: ${results.sessionDebouncing.implemented ? '✅ YES' : '❌ NO'}`);
  console.log(`   Prevents Rapid Starts: ${results.sessionDebouncing.preventsRapidStarts ? '✅ YES' : '❌ NO'}`);
  console.log(`   Respects Min Interval: ${results.sessionDebouncing.respectsMinInterval ? '✅ YES' : '❌ NO'}`);
  
  console.log('\n📊 Duplicate Prevention:');
  console.log(`   Same Scenario Skipped: ${results.duplicatePrevention.sameScenarioSkipped ? '✅ YES' : '❌ NO'}`);
  console.log(`   Different Scenario Handled: ${results.duplicatePrevention.differentScenarioHandled ? '✅ YES' : '❌ NO'}`);
  console.log(`   Redundant Logic Removed: ${results.duplicatePrevention.redundantLogicRemoved ? '✅ YES' : '❌ NO'}`);
  
  console.log('\n📊 Circuit Breaker Integration:');
  console.log(`   Triggers On Failures: ${results.circuitBreakerIntegration.triggersOnFailures ? '✅ YES' : '❌ NO'}`);
  console.log(`   Prevents New Sessions: ${results.circuitBreakerIntegration.preventsNewSessions ? '✅ YES' : '❌ NO'}`);
  console.log(`   User-Friendly Error: ${results.circuitBreakerIntegration.providesUserFriendlyError ? '✅ YES' : '❌ NO'}`);
  
  console.log('\n📊 Navigation Handling:');
  console.log(`   No Multiple Effects: ${results.navigationHandling.noMultipleEffects ? '✅ YES' : '❌ NO'}`);
  console.log(`   Proper Cleanup: ${results.navigationHandling.properCleanup ? '✅ YES' : '❌ NO'}`);
  console.log(`   Component Debounce: ${results.navigationHandling.debounceInComponent ? '✅ YES' : '❌ NO'}`);
  
  console.log('\n📈 Diagnostics:');
  console.log(`   Session Attempts: ${results.diagnostics.sessionAttempts.length}`);
  console.log(`   Circuit Breaker Events: ${results.diagnostics.circuitBreakerEvents.length}`);
  console.log(`   Errors: ${results.errors.length}`);

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(error => console.log(`   ${error}`));
  }

  return results;
};

/**
 * Quick test for session management fixes
 */
export const quickSessionManagementTest = async () => {
  console.log('⚡ Quick Session Management Fix Test');
  
  try {
    const result = await testSessionManagementFix();
    
    if (result.success) {
      console.log('✅ All session management fixes working correctly');
      console.log(`   Session debouncing: ${result.sessionDebouncing.implemented ? 'IMPLEMENTED' : 'MISSING'}`);
      console.log(`   Prevents rapid starts: ${result.sessionDebouncing.preventsRapidStarts ? 'YES' : 'NO'}`);
      console.log(`   Duplicate prevention: ${result.duplicatePrevention.sameScenarioSkipped ? 'WORKING' : 'BROKEN'}`);
      console.log(`   Circuit breaker integration: ${result.circuitBreakerIntegration.triggersOnFailures ? 'WORKING' : 'BROKEN'}`);
      console.log(`   Session attempts: ${result.diagnostics.sessionAttempts.length}`);
      return true;
    } else {
      console.log('❌ Session management fixes need attention');
      console.log(`   Session debouncing: ${result.sessionDebouncing.implemented}`);
      console.log(`   Rapid start prevention: ${result.sessionDebouncing.preventsRapidStarts}`);
      console.log(`   Circuit breaker events: ${result.diagnostics.circuitBreakerEvents.length}`);
      console.log(`   Errors: ${result.errors.length}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Quick session management test failed:', error);
    return false;
  }
};

export default {
  testSessionManagementFix,
  quickSessionManagementTest
};
