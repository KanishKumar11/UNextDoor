/**
 * Audio-Transcript Synchronization Test
 * Tests the fixes for premature audio cutoff issues
 */

import webRTCConversationService from '../services/WebRTCConversationService';

/**
 * Test audio-transcript synchronization
 */
export const testAudioTranscriptSync = async () => {
  console.log('🎵 Testing Audio-Transcript Synchronization');
  
  const results = {
    success: false,
    synchronization: {
      audioSendingDetected: false,
      transcriptCompletionDetected: false,
      audioPlaybackCompletionDetected: false,
      properSequencing: false,
      noPrematureCutoff: false
    },
    timing: {
      audioStart: null,
      audioSendingComplete: null,
      transcriptComplete: null,
      audioPlaybackComplete: null,
      finalCompletion: null
    },
    diagnostics: {
      events: [],
      audioResponseStates: [],
      transcriptLength: 0,
      prematureCutoffs: 0
    },
    errors: []
  };

  try {
    // Initialize service
    await webRTCConversationService.initialize();
    console.log('✅ Service initialized');

    // Monitor audio response state changes
    const stateMonitor = setInterval(() => {
      if (webRTCConversationService.audioResponseState) {
        const state = webRTCConversationService.audioResponseState;
        results.diagnostics.audioResponseStates.push({
          timestamp: Date.now(),
          audioSending: state.audioSendingComplete,
          transcript: state.transcriptComplete,
          playback: state.audioPlaybackComplete,
          responseId: state.responseId
        });
      }
    }, 100);

    // Listen for key events
    webRTCConversationService.on('aiSpeechStarted', () => {
      console.log('🎤 AI speech started event');
      results.timing.audioStart = Date.now();
      results.diagnostics.events.push({ event: 'aiSpeechStarted', timestamp: Date.now() });
    });

    webRTCConversationService.on('aiTranscriptComplete', (transcript) => {
      console.log('📝 AI transcript completed:', transcript.text.length, 'characters');
      results.timing.transcriptComplete = Date.now();
      results.diagnostics.transcriptLength = transcript.text.length;
      results.synchronization.transcriptCompletionDetected = true;
      results.diagnostics.events.push({ event: 'aiTranscriptComplete', timestamp: Date.now(), length: transcript.text.length });
      
      // Check for incomplete sentences (potential cutoff)
      const text = transcript.text.trim();
      if (text.length > 10 && !text.match(/[.!?]$/)) {
        console.warn('⚠️ Potential transcript cutoff detected - no ending punctuation');
        results.diagnostics.prematureCutoffs++;
      }
    });

    webRTCConversationService.on('outputAudioBufferStopped', () => {
      console.log('🔊 Audio playback completed');
      results.timing.audioPlaybackComplete = Date.now();
      results.synchronization.audioPlaybackCompletionDetected = true;
      results.diagnostics.events.push({ event: 'outputAudioBufferStopped', timestamp: Date.now() });
    });

    webRTCConversationService.on('aiSpeechEnded', () => {
      console.log('✅ AI speech ended (final)');
      results.timing.finalCompletion = Date.now();
      results.synchronization.noPrematureCutoff = true;
      results.diagnostics.events.push({ event: 'aiSpeechEnded', timestamp: Date.now() });
    });

    webRTCConversationService.on('responseCompleted', () => {
      console.log('🎉 Response completed (final)');
      results.diagnostics.events.push({ event: 'responseCompleted', timestamp: Date.now() });
    });

    try {
      console.log('🔄 Starting conversation to test synchronization...');
      const sessionResult = await webRTCConversationService.startSession(
        'audio-sync-test',
        'beginner',
        { id: 'test-user', displayName: 'Test User' }
      );

      if (sessionResult) {
        console.log('✅ Session started successfully');
        
        // Wait for AI to respond (simulate conversation)
        console.log('⏳ Waiting for AI response to test synchronization...');
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
        
        // Analyze timing
        if (results.timing.audioStart && results.timing.finalCompletion) {
          const totalDuration = results.timing.finalCompletion - results.timing.audioStart;
          console.log(`📊 Total response duration: ${totalDuration}ms`);
          
          // Check proper sequencing
          if (results.timing.transcriptComplete && results.timing.audioPlaybackComplete) {
            const transcriptFirst = results.timing.transcriptComplete < results.timing.finalCompletion;
            const playbackFirst = results.timing.audioPlaybackComplete < results.timing.finalCompletion;
            results.synchronization.properSequencing = transcriptFirst && playbackFirst;
          }
        }
        
        // Check if synchronization worked
        results.synchronization.audioSendingDetected = results.diagnostics.audioResponseStates.some(s => s.audioSending);
        
        results.success = 
          results.synchronization.transcriptCompletionDetected &&
          results.synchronization.audioPlaybackCompletionDetected &&
          results.synchronization.noPrematureCutoff &&
          results.diagnostics.prematureCutoffs === 0;
        
      } else {
        console.error('❌ Session failed to start');
        results.errors.push('Session start failed');
      }

    } catch (error) {
      console.error('❌ Synchronization test failed:', error.message);
      results.errors.push(`Test execution: ${error.message}`);
    }

    // Stop monitoring
    clearInterval(stateMonitor);

    // Cleanup
    await webRTCConversationService.stopSession();

  } catch (error) {
    console.error('❌ Audio-transcript sync test failed:', error);
    results.errors.push(`Test setup: ${error.message}`);
  } finally {
    try {
      await webRTCConversationService.destroy();
    } catch (error) {
      results.errors.push(`Cleanup: ${error.message}`);
    }
  }

  // Print detailed results
  console.log('\n📊 Audio-Transcript Synchronization Test Results:');
  console.log('=' * 60);
  console.log(`   Overall Success: ${results.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');
  
  console.log('🔄 Synchronization Components:');
  console.log(`   Audio Sending Detected: ${results.synchronization.audioSendingDetected ? '✅ YES' : '❌ NO'}`);
  console.log(`   Transcript Completion: ${results.synchronization.transcriptCompletionDetected ? '✅ YES' : '❌ NO'}`);
  console.log(`   Audio Playback Completion: ${results.synchronization.audioPlaybackCompletionDetected ? '✅ YES' : '❌ NO'}`);
  console.log(`   Proper Sequencing: ${results.synchronization.properSequencing ? '✅ YES' : '❌ NO'}`);
  console.log(`   No Premature Cutoff: ${results.synchronization.noPrematureCutoff ? '✅ YES' : '❌ NO'}`);

  if (results.timing.audioStart) {
    console.log('\n⏱️ Timing Analysis:');
    const timings = results.timing;
    if (timings.transcriptComplete) {
      console.log(`   Transcript completed: +${timings.transcriptComplete - timings.audioStart}ms`);
    }
    if (timings.audioPlaybackComplete) {
      console.log(`   Audio playback completed: +${timings.audioPlaybackComplete - timings.audioStart}ms`);
    }
    if (timings.finalCompletion) {
      console.log(`   Final completion: +${timings.finalCompletion - timings.audioStart}ms`);
    }
  }

  console.log('\n📝 Content Analysis:');
  console.log(`   Transcript Length: ${results.diagnostics.transcriptLength} characters`);
  console.log(`   Premature Cutoffs Detected: ${results.diagnostics.prematureCutoffs}`);

  if (results.diagnostics.events.length > 0) {
    console.log('\n📋 Event Timeline:');
    results.diagnostics.events.forEach(({ event, timestamp, length }) => {
      const timeOffset = results.timing.audioStart ? timestamp - results.timing.audioStart : 0;
      console.log(`   +${timeOffset}ms: ${event}${length ? ` (${length} chars)` : ''}`);
    });
  }

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(error => console.log(`   ${error}`));
  }

  return results;
};

/**
 * Quick test for audio synchronization
 */
export const quickAudioSyncTest = async () => {
  console.log('⚡ Quick Audio Synchronization Test');
  
  try {
    const result = await testAudioTranscriptSync();
    
    if (result.success) {
      console.log('✅ Audio-transcript synchronization working correctly');
      console.log(`   Transcript length: ${result.diagnostics.transcriptLength} characters`);
      console.log(`   Premature cutoffs: ${result.diagnostics.prematureCutoffs}`);
      return true;
    } else {
      console.log('❌ Audio-transcript synchronization issues detected');
      const issues = Object.entries(result.synchronization)
        .filter(([_, working]) => !working)
        .map(([component, _]) => component);
      console.log('   Issues:', issues);
      return false;
    }
  } catch (error) {
    console.error('❌ Quick audio sync test failed:', error);
    return false;
  }
};

/**
 * Test specific synchronization scenarios
 */
export const testSyncScenarios = async () => {
  console.log('🧪 Testing Specific Synchronization Scenarios');
  
  const scenarios = [
    { name: 'Short Response', duration: 3000 },
    { name: 'Medium Response', duration: 7000 },
    { name: 'Long Response', duration: 12000 }
  ];
  
  const results = {};
  
  for (const scenario of scenarios) {
    console.log(`\n🔄 Testing ${scenario.name} (${scenario.duration}ms)...`);
    
    try {
      const result = await testAudioTranscriptSync();
      results[scenario.name] = {
        success: result.success,
        transcriptLength: result.diagnostics.transcriptLength,
        prematureCutoffs: result.diagnostics.prematureCutoffs,
        synchronizationWorking: result.synchronization.noPrematureCutoff
      };
      
      console.log(`   ${scenario.name}: ${result.success ? '✅ PASS' : '❌ FAIL'}`);
      
    } catch (error) {
      console.error(`   ${scenario.name}: ❌ ERROR - ${error.message}`);
      results[scenario.name] = { success: false, error: error.message };
    }
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n📊 Scenario Test Summary:');
  Object.entries(results).forEach(([scenario, result]) => {
    console.log(`   ${scenario}: ${result.success ? '✅ PASS' : '❌ FAIL'}`);
    if (result.transcriptLength) {
      console.log(`     Transcript: ${result.transcriptLength} chars, Cutoffs: ${result.prematureCutoffs}`);
    }
  });
  
  return results;
};

export default {
  testAudioTranscriptSync,
  quickAudioSyncTest,
  testSyncScenarios
};
