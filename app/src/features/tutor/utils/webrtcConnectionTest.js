/**
 * WebRTC Connection Stability Test
 * Tests the fixes for multiple conversation connection issues
 */

import webRTCConversationService from '../services/WebRTCConversationService';

/**
 * Test multiple consecutive conversations to validate connection stability
 */
export const testMultipleConversations = async (numConversations = 5) => {
  const results = {
    success: false,
    totalConversations: numConversations,
    successfulConversations: 0,
    failedConversations: 0,
    errors: [],
    sessionIds: [],
    connectionTimes: [],
    cleanupTimes: []
  };

  console.log(`🧪 Starting WebRTC connection stability test with ${numConversations} conversations`);

  try {
    // Initialize the service
    await webRTCConversationService.initialize();
    console.log('✅ WebRTC service initialized');

    for (let i = 1; i <= numConversations; i++) {
      console.log(`\n🔄 Starting conversation ${i}/${numConversations}`);
      
      try {
        const startTime = Date.now();
        
        // Start session
        const sessionStarted = await webRTCConversationService.startSession(
          `test-scenario-${i}`,
          'beginner',
          { id: 'test-user', displayName: 'Test User' }
        );

        if (!sessionStarted) {
          throw new Error(`Failed to start session ${i}`);
        }

        const connectionTime = Date.now() - startTime;
        results.connectionTimes.push(connectionTime);
        results.sessionIds.push(webRTCConversationService.sessionId);

        console.log(`✅ Conversation ${i} started successfully in ${connectionTime}ms`);
        console.log(`   Session ID: ${webRTCConversationService.sessionId}`);

        // Wait a bit to simulate conversation
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Stop session
        const cleanupStartTime = Date.now();
        await webRTCConversationService.stopSession();
        const cleanupTime = Date.now() - cleanupStartTime;
        results.cleanupTimes.push(cleanupTime);

        console.log(`✅ Conversation ${i} stopped successfully in ${cleanupTime}ms`);
        results.successfulConversations++;

        // Wait for cooldown between conversations
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`❌ Conversation ${i} failed:`, error.message);
        results.errors.push({
          conversation: i,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        results.failedConversations++;

        // Try to cleanup after error
        try {
          await webRTCConversationService.stopSession();
        } catch (cleanupError) {
          console.error(`❌ Cleanup after error failed:`, cleanupError.message);
        }
      }
    }

    // Calculate statistics
    const avgConnectionTime = results.connectionTimes.reduce((a, b) => a + b, 0) / results.connectionTimes.length;
    const avgCleanupTime = results.cleanupTimes.reduce((a, b) => a + b, 0) / results.cleanupTimes.length;

    results.success = results.failedConversations === 0;
    results.statistics = {
      averageConnectionTime: Math.round(avgConnectionTime),
      averageCleanupTime: Math.round(avgCleanupTime),
      successRate: (results.successfulConversations / numConversations * 100).toFixed(1)
    };

    console.log('\n📊 Test Results:');
    console.log(`   Success Rate: ${results.statistics.successRate}%`);
    console.log(`   Successful: ${results.successfulConversations}/${numConversations}`);
    console.log(`   Failed: ${results.failedConversations}/${numConversations}`);
    console.log(`   Avg Connection Time: ${results.statistics.averageConnectionTime}ms`);
    console.log(`   Avg Cleanup Time: ${results.statistics.averageCleanupTime}ms`);

    if (results.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      results.errors.forEach(error => {
        console.log(`   Conversation ${error.conversation}: ${error.error}`);
      });
    }

    // Unique session IDs check
    const uniqueSessionIds = new Set(results.sessionIds);
    if (uniqueSessionIds.size === results.sessionIds.length) {
      console.log('✅ All session IDs were unique');
    } else {
      console.log('❌ Duplicate session IDs detected');
      results.errors.push({
        conversation: 'all',
        error: 'Duplicate session IDs detected',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('❌ Test setup failed:', error);
    results.errors.push({
      conversation: 'setup',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  } finally {
    // Final cleanup
    try {
      await webRTCConversationService.destroy();
      console.log('✅ WebRTC service destroyed');
    } catch (error) {
      console.error('❌ Service destruction failed:', error);
    }
  }

  return results;
};

/**
 * Test race condition prevention
 */
export const testRaceConditionPrevention = async () => {
  console.log('🧪 Testing race condition prevention');

  const results = {
    success: false,
    simultaneousAttempts: 5,
    successfulStarts: 0,
    errors: []
  };

  try {
    await webRTCConversationService.initialize();

    // Try to start multiple sessions simultaneously
    const promises = [];
    for (let i = 1; i <= results.simultaneousAttempts; i++) {
      promises.push(
        webRTCConversationService.startSession(`race-test-${i}`, 'beginner')
          .then(success => ({ attempt: i, success }))
          .catch(error => ({ attempt: i, success: false, error: error.message }))
      );
    }

    const attemptResults = await Promise.all(promises);
    
    attemptResults.forEach(result => {
      if (result.success) {
        results.successfulStarts++;
      } else {
        results.errors.push({
          attempt: result.attempt,
          error: result.error || 'Unknown error'
        });
      }
    });

    // Only one should succeed
    results.success = results.successfulStarts === 1;

    console.log(`📊 Race condition test results:`);
    console.log(`   Successful starts: ${results.successfulStarts}/${results.simultaneousAttempts}`);
    console.log(`   Expected: 1 success (race condition prevented)`);
    console.log(`   Result: ${results.success ? '✅ PASS' : '❌ FAIL'}`);

    // Cleanup
    await webRTCConversationService.stopSession();

  } catch (error) {
    console.error('❌ Race condition test failed:', error);
    results.errors.push({
      attempt: 'setup',
      error: error.message
    });
  } finally {
    await webRTCConversationService.destroy();
  }

  return results;
};

/**
 * Test connection cooldown mechanism
 */
export const testConnectionCooldown = async () => {
  console.log('🧪 Testing connection cooldown mechanism');

  const results = {
    success: false,
    attempts: [],
    cooldownRespected: false
  };

  try {
    await webRTCConversationService.initialize();

    // First connection
    const start1 = Date.now();
    await webRTCConversationService.startSession('cooldown-test-1', 'beginner');
    const time1 = Date.now() - start1;
    results.attempts.push({ attempt: 1, time: time1 });

    await webRTCConversationService.stopSession();

    // Immediate second connection (should be delayed by cooldown)
    const start2 = Date.now();
    await webRTCConversationService.startSession('cooldown-test-2', 'beginner');
    const time2 = Date.now() - start2;
    results.attempts.push({ attempt: 2, time: time2 });

    // Check if cooldown was respected (second connection should take longer)
    results.cooldownRespected = time2 > time1 + 1000; // At least 1 second longer

    console.log(`📊 Cooldown test results:`);
    console.log(`   First connection: ${time1}ms`);
    console.log(`   Second connection: ${time2}ms`);
    console.log(`   Cooldown respected: ${results.cooldownRespected ? '✅ YES' : '❌ NO'}`);

    results.success = results.cooldownRespected;

    await webRTCConversationService.stopSession();

  } catch (error) {
    console.error('❌ Cooldown test failed:', error);
    results.error = error.message;
  } finally {
    await webRTCConversationService.destroy();
  }

  return results;
};

/**
 * Run all WebRTC stability tests
 */
export const runAllWebRTCTests = async () => {
  console.log('🚀 Running comprehensive WebRTC stability tests\n');

  const testResults = {
    multipleConversations: null,
    raceConditionPrevention: null,
    connectionCooldown: null,
    overallSuccess: false
  };

  try {
    // Test 1: Multiple conversations
    testResults.multipleConversations = await testMultipleConversations(3);
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 2: Race condition prevention
    testResults.raceConditionPrevention = await testRaceConditionPrevention();
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 3: Connection cooldown
    testResults.connectionCooldown = await testConnectionCooldown();

    // Overall success
    testResults.overallSuccess = 
      testResults.multipleConversations?.success &&
      testResults.raceConditionPrevention?.success &&
      testResults.connectionCooldown?.success;

    console.log('\n🏁 Overall Test Results:');
    console.log(`   Multiple Conversations: ${testResults.multipleConversations?.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Race Condition Prevention: ${testResults.raceConditionPrevention?.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Connection Cooldown: ${testResults.connectionCooldown?.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Overall: ${testResults.overallSuccess ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

  } catch (error) {
    console.error('❌ Test suite failed:', error);
    testResults.error = error.message;
  }

  return testResults;
};
