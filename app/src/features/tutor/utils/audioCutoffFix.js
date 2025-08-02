/**
 * Audio Cutoff Fix Test
 * Tests the fix for premature audio truncation issues
 */

import webRTCConversationService from '../services/WebRTCConversationService';

/**
 * Test the audio cutoff fix
 */
export const testAudioCutoffFix = async () => {
  console.log('🎵 Testing Audio Cutoff Fix');
  
  const results = {
    success: false,
    audioCompletion: {
      noEarlyCutoff: false,
      properCompletionTiming: false,
      completeTranscripts: false,
      naturalAudioFlow: false
    },
    transcriptQuality: {
      totalResponses: 0,
      completeResponses: 0,
      incompleteResponses: 0,
      averageLength: 0,
      examples: []
    },
    timingAnalysis: {
      audioStartTimes: [],
      audioEndTimes: [],
      responseDurations: [],
      averageResponseTime: 0
    },
    diagnostics: {
      events: [],
      prematureCutoffs: 0,
      properCompletions: 0,
      outputBufferEvents: 0
    },
    errors: []
  };

  try {
    // Initialize service
    await webRTCConversationService.initialize();
    console.log('✅ Service initialized');

    // Monitor for premature cutoff patterns
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      const message = args.join(' ');
      
      // Detect proper completion patterns (good)
      if (message.includes('Response generation completed - this is the proper completion signal') ||
          message.includes('Completing AI response after natural delay')) {
        results.diagnostics.properCompletions++;
      }
      
      // Detect premature cutoff patterns (bad)
      if (message.includes('AI speech completed naturally (audio + transcript ready)') ||
          message.includes('Timeout reached, completing audio response')) {
        results.diagnostics.prematureCutoffs++;
        console.warn('⚠️ Potential premature cutoff detected');
      }
      
      // Count output buffer events
      if (message.includes('OpenAI finished sending audio to buffer')) {
        results.diagnostics.outputBufferEvents++;
      }
      
      originalConsoleLog.apply(console, args);
    };

    // Monitor audio events
    let currentAudioStart = null;
    
    webRTCConversationService.on('aiSpeechStarted', () => {
      currentAudioStart = Date.now();
      results.diagnostics.events.push({ event: 'aiSpeechStarted', timestamp: currentAudioStart });
      console.log('🎤 AI speech started');
    });

    webRTCConversationService.on('aiSpeechEnded', () => {
      const endTime = Date.now();
      const duration = currentAudioStart ? endTime - currentAudioStart : 0;
      
      results.timingAnalysis.audioEndTimes.push(endTime);
      results.timingAnalysis.responseDurations.push(duration);
      results.diagnostics.events.push({ event: 'aiSpeechEnded', timestamp: endTime, duration });
      
      console.log(`🎤 AI speech ended (duration: ${duration}ms)`);
    });

    webRTCConversationService.on('aiTranscriptComplete', (transcript) => {
      results.diagnostics.events.push({ 
        event: 'aiTranscriptComplete', 
        timestamp: Date.now(),
        length: transcript.text.length,
        text: transcript.text
      });
      
      results.transcriptQuality.totalResponses++;
      results.transcriptQuality.averageLength += transcript.text.length;
      
      // Store example for analysis
      results.transcriptQuality.examples.push({
        text: transcript.text,
        length: transcript.text.length,
        complete: transcript.text.match(/[.!?]$/) !== null,
        timestamp: Date.now()
      });
      
      // Check if transcript is complete (ends with punctuation)
      if (transcript.text.length > 10 && transcript.text.match(/[.!?]$/)) {
        results.transcriptQuality.completeResponses++;
        console.log('✅ Complete transcript received:', transcript.text.substring(0, 50) + '...');
      } else {
        results.transcriptQuality.incompleteResponses++;
        console.warn('⚠️ Potentially incomplete transcript:', transcript.text);
      }
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
      console.log('🔄 Starting conversation to test audio cutoff fix...');
      const sessionResult = await webRTCConversationService.startSession(
        'audio-cutoff-test',
        'beginner',
        { id: 'test-user', displayName: 'Test User' }
      );

      if (sessionResult) {
        console.log('✅ Session started successfully');
        
        // Test for 30 seconds to capture multiple responses
        console.log('⏳ Testing audio cutoff fix for 30 seconds...');
        await new Promise(resolve => setTimeout(resolve, 30000));
        
        // Analyze results
        
        // Calculate average response time
        if (results.timingAnalysis.responseDurations.length > 0) {
          results.timingAnalysis.averageResponseTime = Math.round(
            results.timingAnalysis.responseDurations.reduce((a, b) => a + b, 0) / 
            results.timingAnalysis.responseDurations.length
          );
        }
        
        // Calculate average transcript length
        if (results.transcriptQuality.totalResponses > 0) {
          results.transcriptQuality.averageLength = Math.round(
            results.transcriptQuality.averageLength / results.transcriptQuality.totalResponses
          );
        }
        
        // Audio completion analysis
        results.audioCompletion.noEarlyCutoff = results.diagnostics.prematureCutoffs === 0;
        results.audioCompletion.properCompletionTiming = results.diagnostics.properCompletions > 0;
        results.audioCompletion.completeTranscripts = results.transcriptQuality.completeResponses > results.transcriptQuality.incompleteResponses;
        results.audioCompletion.naturalAudioFlow = results.diagnostics.outputBufferEvents > 0; // Should have buffer events but not cause cutoffs
        
        results.success = 
          results.audioCompletion.noEarlyCutoff &&
          results.audioCompletion.properCompletionTiming &&
          results.audioCompletion.completeTranscripts &&
          results.transcriptQuality.totalResponses > 0;
        
      } else {
        console.error('❌ Session failed to start');
        results.errors.push('Session start failed');
      }

    } catch (error) {
      console.error('❌ Audio cutoff fix test failed:', error.message);
      results.errors.push(`Test execution: ${error.message}`);
    }

    // Restore original console.log
    console.log = originalConsoleLog;

    // Cleanup
    await webRTCConversationService.stopSession();

  } catch (error) {
    console.error('❌ Audio cutoff fix test failed:', error);
    results.errors.push(`Test setup: ${error.message}`);
  } finally {
    try {
      await webRTCConversationService.destroy();
    } catch (error) {
      results.errors.push(`Cleanup: ${error.message}`);
    }
  }

  // Print detailed results
  console.log('\n📊 Audio Cutoff Fix Test Results:');
  console.log('=' * 50);
  console.log(`   Overall Success: ${results.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');
  
  console.log('🎵 Audio Completion Analysis:');
  console.log(`   No Early Cutoff: ${results.audioCompletion.noEarlyCutoff ? '✅ YES' : '❌ NO'}`);
  console.log(`   Proper Completion Timing: ${results.audioCompletion.properCompletionTiming ? '✅ YES' : '❌ NO'}`);
  console.log(`   Complete Transcripts: ${results.audioCompletion.completeTranscripts ? '✅ YES' : '❌ NO'}`);
  console.log(`   Natural Audio Flow: ${results.audioCompletion.naturalAudioFlow ? '✅ YES' : '❌ NO'}`);

  console.log('\n📝 Transcript Quality:');
  console.log(`   Total Responses: ${results.transcriptQuality.totalResponses}`);
  console.log(`   Complete Responses: ${results.transcriptQuality.completeResponses}`);
  console.log(`   Incomplete Responses: ${results.transcriptQuality.incompleteResponses}`);
  console.log(`   Average Length: ${results.transcriptQuality.averageLength} chars`);

  console.log('\n⏱️ Timing Analysis:');
  console.log(`   Average Response Time: ${results.timingAnalysis.averageResponseTime}ms`);
  console.log(`   Total Audio Sessions: ${results.timingAnalysis.responseDurations.length}`);

  console.log('\n🔍 Diagnostics:');
  console.log(`   Premature Cutoffs: ${results.diagnostics.prematureCutoffs} (should be 0)`);
  console.log(`   Proper Completions: ${results.diagnostics.properCompletions}`);
  console.log(`   Output Buffer Events: ${results.diagnostics.outputBufferEvents}`);

  if (results.transcriptQuality.examples.length > 0) {
    console.log('\n📋 Transcript Examples:');
    results.transcriptQuality.examples.slice(0, 3).forEach((example, index) => {
      const status = example.complete ? '✅ Complete' : '❌ Incomplete';
      console.log(`   ${index + 1}. ${status} (${example.length} chars): "${example.text.substring(0, 80)}..."`);
    });
  }

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(error => console.log(`   ${error}`));
  }

  return results;
};

/**
 * Quick test for audio cutoff fix
 */
export const quickAudioCutoffTest = async () => {
  console.log('⚡ Quick Audio Cutoff Fix Test');
  
  try {
    const result = await testAudioCutoffFix();
    
    if (result.success) {
      console.log('✅ Audio cutoff fix working correctly');
      console.log(`   Complete responses: ${result.transcriptQuality.completeResponses}`);
      console.log(`   Incomplete responses: ${result.transcriptQuality.incompleteResponses}`);
      console.log(`   Premature cutoffs: ${result.diagnostics.prematureCutoffs}`);
      console.log(`   Average response time: ${result.timingAnalysis.averageResponseTime}ms`);
      return true;
    } else {
      console.log('❌ Audio cutoff fix needs attention');
      const issues = Object.entries(result.audioCompletion)
        .filter(([_, working]) => !working)
        .map(([component, _]) => component);
      console.log('   Issues:', issues);
      console.log(`   Premature cutoffs: ${result.diagnostics.prematureCutoffs}`);
      console.log(`   Complete vs incomplete: ${result.transcriptQuality.completeResponses} vs ${result.transcriptQuality.incompleteResponses}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Quick audio cutoff test failed:', error);
    return false;
  }
};

export default {
  testAudioCutoffFix,
  quickAudioCutoffTest
};
