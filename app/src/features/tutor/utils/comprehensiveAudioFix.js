/**
 * Comprehensive Audio Cutoff Fix Test
 * Tests all identified sources of premature audio cutoffs
 */

import webRTCConversationService from '../services/WebRTCConversationService';

/**
 * Test comprehensive audio cutoff fixes
 */
export const testComprehensiveAudioFix = async () => {
  console.log('🎵 Testing Comprehensive Audio Cutoff Fixes');
  
  const results = {
    success: false,
    fixes: {
      serviceCompletionLogic: false,
      hookStateManagement: false,
      externalInterferencePrevention: false,
      validationMechanisms: false,
      naturalAudioFlow: false
    },
    audioQuality: {
      totalResponses: 0,
      completeResponses: 0,
      prematureCutoffs: 0,
      averageResponseLength: 0,
      validCompletions: 0
    },
    interferenceDetection: {
      preventedInterferences: 0,
      validationFailures: 0,
      stateProtections: 0
    },
    diagnostics: {
      events: [],
      completionSources: [],
      validationResults: [],
      stateChanges: []
    },
    errors: []
  };

  try {
    // Initialize service
    await webRTCConversationService.initialize();
    console.log('✅ Service initialized');

    // Monitor for comprehensive fix patterns
    const originalConsoleLog = console.log;
    const originalConsoleWarn = console.warn;
    
    console.log = (...args) => {
      const message = args.join(' ');
      
      // Detect proper completion patterns (good)
      if (message.includes('Completing AI response after natural delay (validated)')) {
        results.audioQuality.validCompletions++;
        results.diagnostics.completionSources.push('validated_completion');
      }
      
      // Detect validation patterns (good)
      if (message.includes('Audio completion validation passed')) {
        results.fixes.validationMechanisms = true;
        results.diagnostics.validationResults.push('passed');
      }
      
      // Detect extended delay patterns (acceptable)
      if (message.includes('Audio completion validation failed, extending delay')) {
        results.interferenceDetection.validationFailures++;
        results.diagnostics.validationResults.push('failed_extended');
      }
      
      originalConsoleLog.apply(console, args);
    };

    console.warn = (...args) => {
      const message = args.join(' ');
      
      // Detect interference prevention (good)
      if (message.includes('Preventing premature isAISpeaking=false during audio playback')) {
        results.interferenceDetection.preventedInterferences++;
        results.fixes.externalInterferencePrevention = true;
      }
      
      // Detect premature completion warnings (good detection)
      if (message.includes('Premature audio completion detected')) {
        results.audioQuality.prematureCutoffs++;
      }
      
      originalConsoleWarn.apply(console, args);
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
        console.log(`✅ Complete transcript (response #${responseCount}):`, transcript.text.substring(0, 60) + '...');
      } else {
        console.warn(`⚠️ Potentially incomplete transcript (response #${responseCount}):`, transcript.text);
      }
    });

    webRTCConversationService.on('stateChanged', (state) => {
      results.diagnostics.stateChanges.push({
        timestamp: Date.now(),
        isAISpeaking: state.isAISpeaking,
        isConnected: state.isConnected,
        isSessionActive: state.isSessionActive
      });
    });

    webRTCConversationService.on('outputAudioBufferStopped', () => {
      results.diagnostics.events.push({ event: 'outputAudioBufferStopped', timestamp: Date.now() });
      console.log('📡 Output audio buffer stopped (should not cause immediate cutoff)');
    });

    webRTCConversationService.on('responseCompleted', () => {
      results.diagnostics.events.push({ event: 'responseCompleted', timestamp: Date.now() });
      console.log('✅ Response completed event received');
    });

    try {
      console.log('🔄 Starting conversation to test comprehensive audio fixes...');
      const sessionResult = await webRTCConversationService.startSession(
        'comprehensive-audio-fix-test',
        'beginner',
        { id: 'test-user', displayName: 'Test User' }
      );

      if (sessionResult) {
        console.log('✅ Session started successfully');
        
        // Test for 35 seconds to capture multiple responses and edge cases
        console.log('⏳ Testing comprehensive audio fixes for 35 seconds...');
        await new Promise(resolve => setTimeout(resolve, 35000));
        
        // Analyze results
        
        // Calculate average response length
        if (results.audioQuality.totalResponses > 0) {
          results.audioQuality.averageResponseLength = Math.round(
            results.audioQuality.averageResponseLength / results.audioQuality.totalResponses
          );
        }
        
        // Analyze fixes
        results.fixes.serviceCompletionLogic = results.audioQuality.validCompletions > 0;
        results.fixes.hookStateManagement = results.diagnostics.stateChanges.length > 0;
        results.fixes.naturalAudioFlow = results.diagnostics.events.filter(e => e.event === 'outputAudioBufferStopped').length > 0;
        
        // Overall success criteria
        results.success = 
          results.fixes.serviceCompletionLogic &&
          results.fixes.validationMechanisms &&
          results.audioQuality.completeResponses > results.audioQuality.prematureCutoffs &&
          results.audioQuality.totalResponses > 0 &&
          results.interferenceDetection.preventedInterferences >= 0; // Allow 0 if no interference attempted
        
      } else {
        console.error('❌ Session failed to start');
        results.errors.push('Session start failed');
      }

    } catch (error) {
      console.error('❌ Comprehensive audio fix test failed:', error.message);
      results.errors.push(`Test execution: ${error.message}`);
    }

    // Restore original console methods
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;

    // Cleanup
    await webRTCConversationService.stopSession();

  } catch (error) {
    console.error('❌ Comprehensive audio fix test failed:', error);
    results.errors.push(`Test setup: ${error.message}`);
  } finally {
    try {
      await webRTCConversationService.destroy();
    } catch (error) {
      results.errors.push(`Cleanup: ${error.message}`);
    }
  }

  // Print detailed results
  console.log('\n📊 Comprehensive Audio Fix Test Results:');
  console.log('=' * 60);
  console.log(`   Overall Success: ${results.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');
  
  console.log('🔧 Fix Implementation Status:');
  console.log(`   Service Completion Logic: ${results.fixes.serviceCompletionLogic ? '✅ WORKING' : '❌ NEEDS ATTENTION'}`);
  console.log(`   Hook State Management: ${results.fixes.hookStateManagement ? '✅ WORKING' : '❌ NEEDS ATTENTION'}`);
  console.log(`   External Interference Prevention: ${results.fixes.externalInterferencePrevention ? '✅ WORKING' : '⚠️ NOT TESTED'}`);
  console.log(`   Validation Mechanisms: ${results.fixes.validationMechanisms ? '✅ WORKING' : '❌ NEEDS ATTENTION'}`);
  console.log(`   Natural Audio Flow: ${results.fixes.naturalAudioFlow ? '✅ WORKING' : '❌ NEEDS ATTENTION'}`);

  console.log('\n🎵 Audio Quality Analysis:');
  console.log(`   Total Responses: ${results.audioQuality.totalResponses}`);
  console.log(`   Complete Responses: ${results.audioQuality.completeResponses}`);
  console.log(`   Premature Cutoffs: ${results.audioQuality.prematureCutoffs}`);
  console.log(`   Valid Completions: ${results.audioQuality.validCompletions}`);
  console.log(`   Average Response Length: ${results.audioQuality.averageResponseLength} chars`);

  console.log('\n🛡️ Interference Detection:');
  console.log(`   Prevented Interferences: ${results.interferenceDetection.preventedInterferences}`);
  console.log(`   Validation Failures: ${results.interferenceDetection.validationFailures}`);
  console.log(`   State Protections: ${results.interferenceDetection.stateProtections}`);

  console.log('\n📋 Event Summary:');
  const eventCounts = results.diagnostics.events.reduce((acc, event) => {
    acc[event.event] = (acc[event.event] || 0) + 1;
    return acc;
  }, {});
  Object.entries(eventCounts).forEach(([event, count]) => {
    console.log(`   ${event}: ${count}`);
  });

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(error => console.log(`   ${error}`));
  }

  return results;
};

/**
 * Quick test for comprehensive audio fixes
 */
export const quickComprehensiveAudioTest = async () => {
  console.log('⚡ Quick Comprehensive Audio Fix Test');
  
  try {
    const result = await testComprehensiveAudioFix();
    
    if (result.success) {
      console.log('✅ Comprehensive audio fixes working correctly');
      console.log(`   Complete responses: ${result.audioQuality.completeResponses}`);
      console.log(`   Premature cutoffs: ${result.audioQuality.prematureCutoffs}`);
      console.log(`   Valid completions: ${result.audioQuality.validCompletions}`);
      console.log(`   Prevented interferences: ${result.interferenceDetection.preventedInterferences}`);
      return true;
    } else {
      console.log('❌ Comprehensive audio fixes need attention');
      const issues = Object.entries(result.fixes)
        .filter(([_, working]) => !working)
        .map(([component, _]) => component);
      console.log('   Issues:', issues);
      console.log(`   Complete vs premature: ${result.audioQuality.completeResponses} vs ${result.audioQuality.prematureCutoffs}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Quick comprehensive audio test failed:', error);
    return false;
  }
};

export default {
  testComprehensiveAudioFix,
  quickComprehensiveAudioTest
};
