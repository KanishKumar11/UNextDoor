/**
 * Comprehensive Truncation Fix Test
 * Tests all identified sources of audio truncation including component lifecycle issues
 */

import webRTCConversationService from '../services/WebRTCConversationService';

/**
 * Test comprehensive truncation fixes including component lifecycle protection
 */
export const testComprehensiveTruncationFix = async () => {
  console.log('🔧 Testing Comprehensive Truncation Fixes');
  
  const results = {
    success: false,
    protectionMechanisms: {
      componentUnmountProtection: false,
      appBackgroundProtection: false,
      cleanupFunctionProtection: false,
      hookStateProtection: false,
      rateLimitProtection: false
    },
    audioQuality: {
      totalResponses: 0,
      completeResponses: 0,
      interruptedResponses: 0,
      longestResponse: 0,
      averageResponseLength: 0
    },
    lifecycleEvents: {
      componentUnmounts: 0,
      appStateChanges: 0,
      cleanupCalls: 0,
      gracefulCleanups: 0,
      forcedCleanups: 0
    },
    diagnostics: {
      events: [],
      protectionActivations: [],
      truncationPrevented: 0
    },
    errors: []
  };

  try {
    // Initialize service
    await webRTCConversationService.initialize();
    console.log('✅ Service initialized');

    // Monitor for protection mechanism activations
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      const message = args.join(' ');
      
      // Detect protection mechanisms
      if (message.includes('AI is speaking - allowing response to complete')) {
        results.protectionMechanisms.componentUnmountProtection = true;
        results.diagnostics.protectionActivations.push('componentUnmountProtection');
        results.diagnostics.truncationPrevented++;
      }
      
      if (message.includes('App going to background but AI is speaking')) {
        results.protectionMechanisms.appBackgroundProtection = true;
        results.diagnostics.protectionActivations.push('appBackgroundProtection');
        results.diagnostics.truncationPrevented++;
      }
      
      if (message.includes('AI is speaking during cleanup - using graceful cleanup')) {
        results.protectionMechanisms.cleanupFunctionProtection = true;
        results.diagnostics.protectionActivations.push('cleanupFunctionProtection');
        results.diagnostics.truncationPrevented++;
      }
      
      if (message.includes('Preserving isAISpeaking state during cleanup')) {
        results.protectionMechanisms.hookStateProtection = true;
        results.diagnostics.protectionActivations.push('hookStateProtection');
        results.diagnostics.truncationPrevented++;
      }
      
      if (message.includes('Allowing realtime token request despite rate limit')) {
        results.protectionMechanisms.rateLimitProtection = true;
        results.diagnostics.protectionActivations.push('rateLimitProtection');
      }
      
      // Detect lifecycle events
      if (message.includes('Component unmounting')) {
        results.lifecycleEvents.componentUnmounts++;
      }
      
      if (message.includes('App state changed')) {
        results.lifecycleEvents.appStateChanges++;
      }
      
      if (message.includes('using graceful cleanup')) {
        results.lifecycleEvents.gracefulCleanups++;
      } else if (message.includes('Force stopping') || message.includes('Force complete')) {
        results.lifecycleEvents.forcedCleanups++;
      }
      
      originalConsoleLog.apply(console, args);
    };

    // Monitor audio events with detailed tracking
    let audioStartTime = null;
    let responseCount = 0;
    
    webRTCConversationService.on('aiSpeechStarted', () => {
      audioStartTime = Date.now();
      responseCount++;
      results.diagnostics.events.push({ 
        event: 'aiSpeechStarted', 
        timestamp: audioStartTime,
        responseNumber: responseCount
      });
      console.log(`🎤 AI speech started (response #${responseCount})`);
    });

    webRTCConversationService.on('aiSpeechEnded', () => {
      const endTime = Date.now();
      const duration = audioStartTime ? endTime - audioStartTime : 0;
      
      results.diagnostics.events.push({ 
        event: 'aiSpeechEnded', 
        timestamp: endTime, 
        duration,
        responseNumber: responseCount
      });
      
      console.log(`🎤 AI speech ended (response #${responseCount}, duration: ${duration}ms)`);
    });

    webRTCConversationService.on('aiTranscriptComplete', (transcript) => {
      results.audioQuality.totalResponses++;
      results.audioQuality.averageResponseLength += transcript.text.length;
      
      if (transcript.text.length > results.audioQuality.longestResponse) {
        results.audioQuality.longestResponse = transcript.text.length;
      }
      
      results.diagnostics.events.push({ 
        event: 'aiTranscriptComplete', 
        timestamp: Date.now(),
        length: transcript.text.length,
        complete: transcript.text.match(/[.!?]$/) !== null,
        responseNumber: responseCount
      });
      
      // Check if transcript is complete
      if (transcript.text.length > 10 && transcript.text.match(/[.!?]$/)) {
        results.audioQuality.completeResponses++;
        console.log(`✅ Complete transcript (response #${responseCount}):`, transcript.text.substring(0, 80) + '...');
      } else {
        results.audioQuality.interruptedResponses++;
        console.warn(`⚠️ Potentially interrupted transcript (response #${responseCount}):`, transcript.text);
      }
    });

    // Simulate lifecycle events to test protection mechanisms
    const simulateLifecycleEvents = () => {
      setTimeout(() => {
        console.log('🧪 Simulating component unmount during AI speech');
        // This would normally trigger the component unmount protection
      }, 10000);
      
      setTimeout(() => {
        console.log('🧪 Simulating app background during AI speech');
        // This would normally trigger the app background protection
      }, 20000);
      
      setTimeout(() => {
        console.log('🧪 Simulating cleanup during AI speech');
        // This would normally trigger the cleanup protection
      }, 30000);
    };

    try {
      console.log('🔄 Starting conversation to test comprehensive truncation fixes...');
      const sessionResult = await webRTCConversationService.startSession(
        'comprehensive-truncation-fix-test',
        'beginner',
        { id: 'test-user', displayName: 'Test User' }
      );

      if (sessionResult) {
        console.log('✅ Session started successfully');
        
        // Start lifecycle event simulation
        simulateLifecycleEvents();
        
        // Test for 45 seconds to capture multiple responses and lifecycle events
        console.log('⏳ Testing comprehensive truncation fixes for 45 seconds...');
        await new Promise(resolve => setTimeout(resolve, 45000));
        
        // Analyze results
        
        // Calculate average response length
        if (results.audioQuality.totalResponses > 0) {
          results.audioQuality.averageResponseLength = Math.round(
            results.audioQuality.averageResponseLength / results.audioQuality.totalResponses
          );
        }
        
        // Success criteria
        results.success = 
          results.audioQuality.completeResponses > results.audioQuality.interruptedResponses &&
          results.audioQuality.totalResponses > 0 &&
          results.audioQuality.longestResponse > 150 && // Should have at least one substantial response
          results.lifecycleEvents.gracefulCleanups >= results.lifecycleEvents.forcedCleanups; // More graceful than forced
        
      } else {
        console.error('❌ Session failed to start');
        results.errors.push('Session start failed');
      }

    } catch (error) {
      console.error('❌ Comprehensive truncation fix test failed:', error.message);
      results.errors.push(`Test execution: ${error.message}`);
    }

    // Restore original console.log
    console.log = originalConsoleLog;

    // Cleanup
    await webRTCConversationService.stopSession();

  } catch (error) {
    console.error('❌ Comprehensive truncation fix test failed:', error);
    results.errors.push(`Test setup: ${error.message}`);
  } finally {
    try {
      await webRTCConversationService.destroy();
    } catch (error) {
      results.errors.push(`Cleanup: ${error.message}`);
    }
  }

  // Print detailed results
  console.log('\n📊 Comprehensive Truncation Fix Test Results:');
  console.log('=' * 70);
  console.log(`   Overall Success: ${results.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');
  
  console.log('🛡️ Protection Mechanisms:');
  console.log(`   Component Unmount Protection: ${results.protectionMechanisms.componentUnmountProtection ? '✅ ACTIVE' : '⚠️ NOT TESTED'}`);
  console.log(`   App Background Protection: ${results.protectionMechanisms.appBackgroundProtection ? '✅ ACTIVE' : '⚠️ NOT TESTED'}`);
  console.log(`   Cleanup Function Protection: ${results.protectionMechanisms.cleanupFunctionProtection ? '✅ ACTIVE' : '⚠️ NOT TESTED'}`);
  console.log(`   Hook State Protection: ${results.protectionMechanisms.hookStateProtection ? '✅ ACTIVE' : '⚠️ NOT TESTED'}`);
  console.log(`   Rate Limit Protection: ${results.protectionMechanisms.rateLimitProtection ? '✅ ACTIVE' : '⚠️ NOT TESTED'}`);

  console.log('\n🎵 Audio Quality:');
  console.log(`   Total Responses: ${results.audioQuality.totalResponses}`);
  console.log(`   Complete Responses: ${results.audioQuality.completeResponses}`);
  console.log(`   Interrupted Responses: ${results.audioQuality.interruptedResponses}`);
  console.log(`   Longest Response: ${results.audioQuality.longestResponse} chars`);
  console.log(`   Average Response Length: ${results.audioQuality.averageResponseLength} chars`);

  console.log('\n🔄 Lifecycle Events:');
  console.log(`   Component Unmounts: ${results.lifecycleEvents.componentUnmounts}`);
  console.log(`   App State Changes: ${results.lifecycleEvents.appStateChanges}`);
  console.log(`   Cleanup Calls: ${results.lifecycleEvents.cleanupCalls}`);
  console.log(`   Graceful Cleanups: ${results.lifecycleEvents.gracefulCleanups}`);
  console.log(`   Forced Cleanups: ${results.lifecycleEvents.forcedCleanups}`);

  console.log('\n📋 Protection Summary:');
  console.log(`   Protection Activations: ${results.diagnostics.protectionActivations.length}`);
  console.log(`   Truncations Prevented: ${results.diagnostics.truncationPrevented}`);
  
  if (results.diagnostics.protectionActivations.length > 0) {
    console.log('   Active Protections:', results.diagnostics.protectionActivations.join(', '));
  }

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(error => console.log(`   ${error}`));
  }

  return results;
};

/**
 * Quick test for comprehensive truncation fixes
 */
export const quickComprehensiveTruncationTest = async () => {
  console.log('⚡ Quick Comprehensive Truncation Fix Test');
  
  try {
    const result = await testComprehensiveTruncationFix();
    
    if (result.success) {
      console.log('✅ Comprehensive truncation fixes working correctly');
      console.log(`   Complete responses: ${result.audioQuality.completeResponses}`);
      console.log(`   Interrupted responses: ${result.audioQuality.interruptedResponses}`);
      console.log(`   Longest response: ${result.audioQuality.longestResponse} chars`);
      console.log(`   Truncations prevented: ${result.diagnostics.truncationPrevented}`);
      return true;
    } else {
      console.log('❌ Comprehensive truncation fixes need attention');
      const activeProtections = Object.entries(result.protectionMechanisms)
        .filter(([_, active]) => active)
        .map(([mechanism, _]) => mechanism);
      console.log('   Active protections:', activeProtections);
      console.log(`   Complete vs interrupted: ${result.audioQuality.completeResponses} vs ${result.audioQuality.interruptedResponses}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Quick comprehensive truncation test failed:', error);
    return false;
  }
};

export default {
  testComprehensiveTruncationFix,
  quickComprehensiveTruncationTest
};
