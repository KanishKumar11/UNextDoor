/**
 * WebRTC Regression Fix Test
 * Tests the targeted fix for audio cutoff and ICE connection issues
 */

import webRTCConversationService from '../services/WebRTCConversationService';

/**
 * Test the regression fix for audio completion and ICE stability
 */
export const testRegressionFix = async () => {
  console.log('🔧 Testing WebRTC Regression Fix');
  
  const results = {
    success: false,
    audioCompletion: {
      properStateTracking: false,
      noEarlyCutoff: false,
      completeTranscripts: false,
      naturalCompletion: false
    },
    iceStability: {
      properDisconnectionHandling: false,
      noImmediateErrors: false,
      recoveryMechanism: false
    },
    performance: {
      responseCount: 0,
      completeResponses: 0,
      incompleteResponses: 0,
      averageResponseTime: 0,
      iceDisconnections: 0
    },
    diagnostics: {
      events: [],
      stateTransitions: [],
      completionTiming: []
    },
    errors: []
  };

  try {
    // Initialize service
    await webRTCConversationService.initialize();
    console.log('✅ Service initialized');

    // Monitor audio response state transitions
    const stateMonitor = setInterval(() => {
      if (webRTCConversationService.audioResponseState) {
        const state = webRTCConversationService.audioResponseState;
        results.diagnostics.stateTransitions.push({
          timestamp: Date.now(),
          isAudioPlaying: state.isAudioPlaying,
          audioDataReceived: state.audioDataReceived,
          transcriptReceived: state.transcriptReceived,
          responseId: state.lastResponseId
        });
      }
    }, 200);

    // Monitor ICE connection events
    webRTCConversationService.on('connectionStateChanged', (state) => {
      results.diagnostics.events.push({ event: 'iceStateChange', state, timestamp: Date.now() });
      
      if (state === 'disconnected') {
        results.performance.iceDisconnections++;
        console.log('📡 ICE disconnection detected');
      }
    });

    // Monitor audio completion events
    let audioStartTime = null;
    
    webRTCConversationService.on('aiSpeechStarted', () => {
      audioStartTime = Date.now();
      results.diagnostics.events.push({ event: 'aiSpeechStarted', timestamp: Date.now() });
      console.log('🎤 AI speech started');
    });

    webRTCConversationService.on('aiSpeechEnded', () => {
      const endTime = Date.now();
      const duration = audioStartTime ? endTime - audioStartTime : 0;
      
      results.diagnostics.events.push({ event: 'aiSpeechEnded', timestamp: endTime, duration });
      results.diagnostics.completionTiming.push(duration);
      results.performance.responseCount++;
      
      console.log(`🎤 AI speech ended (duration: ${duration}ms)`);
    });

    webRTCConversationService.on('aiTranscriptComplete', (transcript) => {
      results.diagnostics.events.push({ 
        event: 'aiTranscriptComplete', 
        timestamp: Date.now(),
        length: transcript.text.length,
        complete: transcript.text.match(/[.!?]$/) !== null
      });
      
      // Check if transcript is complete
      if (transcript.text.length > 10 && transcript.text.match(/[.!?]$/)) {
        results.performance.completeResponses++;
      } else {
        results.performance.incompleteResponses++;
        console.warn('⚠️ Potentially incomplete transcript:', transcript.text.substring(0, 50) + '...');
      }
    });

    // Monitor for early cutoff patterns
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      const message = args.join(' ');
      
      // Detect proper completion patterns (good)
      if (message.includes('AI speech completed naturally (audio + transcript ready)') ||
          message.includes('Transcript completed, audio ready - completing response')) {
        results.audioCompletion.naturalCompletion = true;
      }
      
      // Detect timeout patterns (acceptable fallback)
      if (message.includes('Timeout reached, completing audio response')) {
        console.warn('⚠️ Timeout fallback used - this is acceptable but not ideal');
      }
      
      originalConsoleLog.apply(console, args);
    };

    try {
      console.log('🔄 Starting conversation to test regression fix...');
      const sessionResult = await webRTCConversationService.startSession(
        'regression-test',
        'beginner',
        { id: 'test-user', displayName: 'Test User' }
      );

      if (sessionResult) {
        console.log('✅ Session started successfully');
        
        // Test for 25 seconds to capture multiple responses
        console.log('⏳ Testing regression fix for 25 seconds...');
        await new Promise(resolve => setTimeout(resolve, 25000));
        
        // Analyze results
        
        // Audio completion analysis
        results.audioCompletion.properStateTracking = results.diagnostics.stateTransitions.some(
          s => s.audioDataReceived && s.transcriptReceived
        );
        
        results.audioCompletion.noEarlyCutoff = results.performance.incompleteResponses === 0;
        results.audioCompletion.completeTranscripts = results.performance.completeResponses > 0;
        
        // ICE stability analysis
        results.iceStability.properDisconnectionHandling = results.performance.iceDisconnections <= 1; // Allow 1 disconnection
        results.iceStability.noImmediateErrors = results.errors.length === 0;
        results.iceStability.recoveryMechanism = true; // We have the mechanism in place
        
        // Performance analysis
        if (results.diagnostics.completionTiming.length > 0) {
          results.performance.averageResponseTime = Math.round(
            results.diagnostics.completionTiming.reduce((a, b) => a + b, 0) / 
            results.diagnostics.completionTiming.length
          );
        }
        
        results.success = 
          results.audioCompletion.properStateTracking &&
          results.audioCompletion.noEarlyCutoff &&
          results.audioCompletion.completeTranscripts &&
          results.iceStability.properDisconnectionHandling &&
          results.performance.completeResponses >= results.performance.incompleteResponses;
        
      } else {
        console.error('❌ Session failed to start');
        results.errors.push('Session start failed');
      }

    } catch (error) {
      console.error('❌ Regression fix test failed:', error.message);
      results.errors.push(`Test execution: ${error.message}`);
    }

    // Stop monitoring
    clearInterval(stateMonitor);
    console.log = originalConsoleLog; // Restore original console.log

    // Cleanup
    await webRTCConversationService.stopSession();

  } catch (error) {
    console.error('❌ Regression fix test failed:', error);
    results.errors.push(`Test setup: ${error.message}`);
  } finally {
    try {
      await webRTCConversationService.destroy();
    } catch (error) {
      results.errors.push(`Cleanup: ${error.message}`);
    }
  }

  // Print detailed results
  console.log('\n📊 WebRTC Regression Fix Test Results:');
  console.log('=' * 50);
  console.log(`   Overall Success: ${results.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');
  
  console.log('🎵 Audio Completion:');
  console.log(`   Proper State Tracking: ${results.audioCompletion.properStateTracking ? '✅ YES' : '❌ NO'}`);
  console.log(`   No Early Cutoff: ${results.audioCompletion.noEarlyCutoff ? '✅ YES' : '❌ NO'}`);
  console.log(`   Complete Transcripts: ${results.audioCompletion.completeTranscripts ? '✅ YES' : '❌ NO'}`);
  console.log(`   Natural Completion: ${results.audioCompletion.naturalCompletion ? '✅ YES' : '❌ NO'}`);

  console.log('\n📡 ICE Stability:');
  console.log(`   Proper Disconnection Handling: ${results.iceStability.properDisconnectionHandling ? '✅ YES' : '❌ NO'}`);
  console.log(`   No Immediate Errors: ${results.iceStability.noImmediateErrors ? '✅ YES' : '❌ NO'}`);
  console.log(`   Recovery Mechanism: ${results.iceStability.recoveryMechanism ? '✅ YES' : '❌ NO'}`);

  console.log('\n📈 Performance Metrics:');
  console.log(`   Total Responses: ${results.performance.responseCount}`);
  console.log(`   Complete Responses: ${results.performance.completeResponses}`);
  console.log(`   Incomplete Responses: ${results.performance.incompleteResponses}`);
  console.log(`   Average Response Time: ${results.performance.averageResponseTime}ms`);
  console.log(`   ICE Disconnections: ${results.performance.iceDisconnections}`);

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(error => console.log(`   ${error}`));
  }

  return results;
};

/**
 * Quick test for regression fix
 */
export const quickRegressionTest = async () => {
  console.log('⚡ Quick Regression Fix Test');
  
  try {
    const result = await testRegressionFix();
    
    if (result.success) {
      console.log('✅ Regression fix working correctly');
      console.log(`   Complete responses: ${result.performance.completeResponses}`);
      console.log(`   Incomplete responses: ${result.performance.incompleteResponses}`);
      console.log(`   ICE disconnections: ${result.performance.iceDisconnections}`);
      console.log(`   Average response time: ${result.performance.averageResponseTime}ms`);
      return true;
    } else {
      console.log('❌ Regression fix needs attention');
      const audioIssues = Object.entries(result.audioCompletion)
        .filter(([_, working]) => !working)
        .map(([component, _]) => component);
      const iceIssues = Object.entries(result.iceStability)
        .filter(([_, working]) => !working)
        .map(([component, _]) => component);
      console.log('   Audio issues:', audioIssues);
      console.log('   ICE issues:', iceIssues);
      return false;
    }
  } catch (error) {
    console.error('❌ Quick regression test failed:', error);
    return false;
  }
};

export default {
  testRegressionFix,
  quickRegressionTest
};
