/**
 * Event-Driven Audio Completion Test
 * Tests the new event-driven completion logic that replaces timeout-based completion
 */

import webRTCConversationService from '../services/WebRTCConversationService';

/**
 * Test event-driven audio completion (no more arbitrary timeouts)
 */
export const testEventDrivenCompletion = async () => {
  console.log('🔧 Testing Event-Driven Audio Completion');
  
  const results = {
    success: false,
    completionMechanisms: {
      naturalCompletion: 0,
      transcriptTriggeredCompletion: 0,
      audioDataTriggeredCompletion: 0,
      fallbackTimeoutUsed: 0
    },
    timing: {
      responses: [],
      averageCompletionTime: 0,
      longestResponse: 0,
      shortestResponse: Infinity
    },
    eventFlow: {
      properEventSequence: 0,
      improperEventSequence: 0,
      events: []
    },
    audioQuality: {
      totalResponses: 0,
      completeResponses: 0,
      prematureCutoffs: 0,
      naturalCompletions: 0
    },
    diagnostics: {
      stateTransitions: [],
      completionSources: [],
      fallbackActivations: 0,
      timeoutReplacements: 0
    },
    errors: []
  };

  try {
    // Initialize service
    await webRTCConversationService.initialize();
    console.log('✅ Service initialized');

    // Monitor completion mechanisms
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      const message = args.join(' ');
      
      // Detect new event-driven completion patterns
      if (message.includes('All completion conditions met')) {
        results.completionMechanisms.naturalCompletion++;
        results.diagnostics.completionSources.push('natural');
      }
      
      if (message.includes('transcript_triggered_completion')) {
        results.completionMechanisms.transcriptTriggeredCompletion++;
        results.diagnostics.completionSources.push('transcript_triggered');
      }
      
      if (message.includes('audio_data_triggered_completion')) {
        results.completionMechanisms.audioDataTriggeredCompletion++;
        results.diagnostics.completionSources.push('audio_data_triggered');
      }
      
      if (message.includes('fallback_timeout')) {
        results.completionMechanisms.fallbackTimeoutUsed++;
        results.diagnostics.fallbackActivations++;
        console.warn('⚠️ Fallback timeout used - this should be rare');
      }
      
      // Detect proper event sequence
      if (message.includes('Response generation completed - marking response as ready')) {
        results.eventFlow.events.push({ event: 'response_generation_complete', timestamp: Date.now() });
      }
      
      if (message.includes('natural completion detected')) {
        results.eventFlow.properEventSequence++;
        results.audioQuality.naturalCompletions++;
      }
      
      // Detect old timeout patterns (should not appear)
      if (message.includes('Completing AI response after natural delay (validated)') ||
          message.includes('Completing AI response after extended delay')) {
        results.diagnostics.timeoutReplacements++;
        console.warn('⚠️ Old timeout-based completion detected - this should not happen');
      }
      
      originalConsoleLog.apply(console, args);
    };

    // Monitor audio events with detailed timing
    let audioStartTime = null;
    let responseCount = 0;
    
    webRTCConversationService.on('aiSpeechStarted', () => {
      audioStartTime = Date.now();
      responseCount++;
      results.eventFlow.events.push({ 
        event: 'aiSpeechStarted', 
        timestamp: audioStartTime,
        responseNumber: responseCount
      });
      console.log(`🎤 AI speech started (response #${responseCount})`);
    });

    webRTCConversationService.on('aiSpeechEnded', () => {
      const endTime = Date.now();
      const duration = audioStartTime ? endTime - audioStartTime : 0;
      
      results.timing.responses.push(duration);
      results.timing.longestResponse = Math.max(results.timing.longestResponse, duration);
      results.timing.shortestResponse = Math.min(results.timing.shortestResponse, duration);
      
      results.eventFlow.events.push({ 
        event: 'aiSpeechEnded', 
        timestamp: endTime, 
        duration,
        responseNumber: responseCount
      });
      
      console.log(`🎤 AI speech ended (response #${responseCount}, duration: ${duration}ms)`);
    });

    webRTCConversationService.on('aiTranscriptComplete', (transcript) => {
      results.audioQuality.totalResponses++;
      
      results.eventFlow.events.push({ 
        event: 'aiTranscriptComplete', 
        timestamp: Date.now(),
        length: transcript.text.length,
        complete: transcript.text.match(/[.!?]$/) !== null,
        responseNumber: responseCount
      });
      
      // Check if transcript is complete (proper ending)
      if (transcript.text.length > 10 && transcript.text.match(/[.!?]$/)) {
        results.audioQuality.completeResponses++;
        console.log(`✅ Complete transcript (response #${responseCount}):`, transcript.text.substring(0, 80) + '...');
      } else {
        results.audioQuality.prematureCutoffs++;
        console.warn(`⚠️ Potentially incomplete transcript (response #${responseCount}):`, transcript.text);
      }
    });

    webRTCConversationService.on('responseCompleted', () => {
      results.eventFlow.events.push({ event: 'responseCompleted', timestamp: Date.now() });
      console.log('✅ Response completed event received');
    });

    webRTCConversationService.on('outputAudioBufferStopped', () => {
      results.eventFlow.events.push({ event: 'outputAudioBufferStopped', timestamp: Date.now() });
      console.log('📡 Output audio buffer stopped');
    });

    // Monitor audio response state changes
    const stateMonitor = setInterval(() => {
      if (webRTCConversationService.audioResponseState) {
        const state = webRTCConversationService.audioResponseState;
        results.diagnostics.stateTransitions.push({
          timestamp: Date.now(),
          isAudioPlaying: state.isAudioPlaying,
          audioDataReceived: state.audioDataReceived,
          transcriptReceived: state.transcriptReceived,
          responseGenerationComplete: state.responseGenerationComplete,
          hasFallbackTimeout: !!state.audioCompletionFallbackTimeout
        });
      }
    }, 200);

    try {
      console.log('🔄 Starting conversation to test event-driven completion...');
      const sessionResult = await webRTCConversationService.startSession(
        'event-driven-completion-test',
        'beginner',
        { id: 'test-user', displayName: 'Test User' }
      );

      if (sessionResult) {
        console.log('✅ Session started successfully');
        
        // Test for 45 seconds to capture multiple responses with varying lengths
        console.log('⏳ Testing event-driven completion for 45 seconds...');
        await new Promise(resolve => setTimeout(resolve, 45000));
        
        // Stop monitoring
        clearInterval(stateMonitor);
        
        // Analyze results
        
        // Calculate timing statistics
        if (results.timing.responses.length > 0) {
          results.timing.averageCompletionTime = Math.round(
            results.timing.responses.reduce((a, b) => a + b, 0) / results.timing.responses.length
          );
        }
        
        // Analyze event flow
        const responseGenerationEvents = results.eventFlow.events.filter(e => e.event === 'response_generation_complete');
        const naturalCompletionEvents = results.eventFlow.events.filter(e => e.event === 'aiSpeechEnded');
        
        // Success criteria for event-driven completion
        results.success = 
          results.audioQuality.completeResponses > results.audioQuality.prematureCutoffs &&
          results.audioQuality.totalResponses > 0 &&
          results.completionMechanisms.fallbackTimeoutUsed === 0 && // Should not use fallback timeout
          results.diagnostics.timeoutReplacements === 0 && // Should not use old timeout logic
          results.completionMechanisms.naturalCompletion > 0 && // Should use natural completion
          results.timing.longestResponse > 3000; // Should handle responses longer than old 3-second timeout
        
      } else {
        console.error('❌ Session failed to start');
        results.errors.push('Session start failed');
      }

    } catch (error) {
      console.error('❌ Event-driven completion test failed:', error.message);
      results.errors.push(`Test execution: ${error.message}`);
    }

    // Restore original console.log
    console.log = originalConsoleLog;

    // Cleanup
    await webRTCConversationService.stopSession();

  } catch (error) {
    console.error('❌ Event-driven completion test failed:', error);
    results.errors.push(`Test setup: ${error.message}`);
  } finally {
    try {
      await webRTCConversationService.destroy();
    } catch (error) {
      results.errors.push(`Cleanup: ${error.message}`);
    }
  }

  // Print detailed results
  console.log('\n📊 Event-Driven Audio Completion Test Results:');
  console.log('=' * 70);
  console.log(`   Overall Success: ${results.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');
  
  console.log('🔄 Completion Mechanisms:');
  console.log(`   Natural Completion: ${results.completionMechanisms.naturalCompletion}`);
  console.log(`   Transcript Triggered: ${results.completionMechanisms.transcriptTriggeredCompletion}`);
  console.log(`   Audio Data Triggered: ${results.completionMechanisms.audioDataTriggeredCompletion}`);
  console.log(`   Fallback Timeout Used: ${results.completionMechanisms.fallbackTimeoutUsed} ${results.completionMechanisms.fallbackTimeoutUsed === 0 ? '✅' : '⚠️'}`);

  console.log('\n⏱️ Timing Analysis:');
  console.log(`   Total Responses: ${results.timing.responses.length}`);
  console.log(`   Average Completion Time: ${results.timing.averageCompletionTime}ms`);
  console.log(`   Longest Response: ${results.timing.longestResponse}ms ${results.timing.longestResponse > 3000 ? '✅' : '⚠️'}`);
  console.log(`   Shortest Response: ${results.timing.shortestResponse === Infinity ? 'N/A' : results.timing.shortestResponse + 'ms'}`);

  console.log('\n🎵 Audio Quality:');
  console.log(`   Total Responses: ${results.audioQuality.totalResponses}`);
  console.log(`   Complete Responses: ${results.audioQuality.completeResponses}`);
  console.log(`   Premature Cutoffs: ${results.audioQuality.prematureCutoffs} ${results.audioQuality.prematureCutoffs === 0 ? '✅' : '⚠️'}`);
  console.log(`   Natural Completions: ${results.audioQuality.naturalCompletions}`);

  console.log('\n🔧 System Improvements:');
  console.log(`   Old Timeout Logic Eliminated: ${results.diagnostics.timeoutReplacements === 0 ? '✅ YES' : '❌ NO'}`);
  console.log(`   Event-Driven Logic Active: ${results.completionMechanisms.naturalCompletion > 0 ? '✅ YES' : '❌ NO'}`);
  console.log(`   Fallback Safety Net: ${results.diagnostics.fallbackActivations === 0 ? '✅ UNUSED (GOOD)' : '⚠️ USED'}`);

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(error => console.log(`   ${error}`));
  }

  return results;
};

/**
 * Quick test for event-driven completion
 */
export const quickEventDrivenCompletionTest = async () => {
  console.log('⚡ Quick Event-Driven Completion Test');
  
  try {
    const result = await testEventDrivenCompletion();
    
    if (result.success) {
      console.log('✅ Event-driven completion working correctly');
      console.log(`   Natural completions: ${result.completionMechanisms.naturalCompletion}`);
      console.log(`   Fallback timeouts: ${result.completionMechanisms.fallbackTimeoutUsed}`);
      console.log(`   Longest response: ${result.timing.longestResponse}ms`);
      console.log(`   Complete responses: ${result.audioQuality.completeResponses}`);
      return true;
    } else {
      console.log('❌ Event-driven completion needs attention');
      console.log(`   Fallback timeouts used: ${result.completionMechanisms.fallbackTimeoutUsed}`);
      console.log(`   Premature cutoffs: ${result.audioQuality.prematureCutoffs}`);
      console.log(`   Old timeout logic: ${result.diagnostics.timeoutReplacements > 0 ? 'DETECTED' : 'ELIMINATED'}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Quick event-driven completion test failed:', error);
    return false;
  }
};

export default {
  testEventDrivenCompletion,
  quickEventDrivenCompletionTest
};
