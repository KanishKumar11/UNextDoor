/**
 * Audio Response State Fix Test
 * Tests the fixes for audio response state tracking and transcript completion
 */

import webRTCConversationService from '../services/WebRTCConversationService';

/**
 * Test audio response state tracking
 */
export const testAudioResponseStateTracking = async () => {
  console.log('🎵 Testing Audio Response State Tracking');
  
  const results = {
    success: false,
    stateTracking: {
      responseStateInitialized: false,
      audioSendingTracked: false,
      transcriptCompletionTracked: false,
      audioPlaybackTracked: false,
      properSynchronization: false
    },
    transcripts: {
      complete: 0,
      incomplete: 0,
      totalLength: 0,
      examples: []
    },
    diagnostics: {
      events: [],
      stateChanges: [],
      ignoredEvents: 0
    },
    errors: []
  };

  try {
    // Initialize service
    await webRTCConversationService.initialize();
    console.log('✅ Service initialized');

    // Monitor audio response state changes
    let lastState = null;
    const stateMonitor = setInterval(() => {
      if (webRTCConversationService.audioResponseState) {
        const currentState = JSON.stringify(webRTCConversationService.audioResponseState);
        if (currentState !== lastState) {
          results.diagnostics.stateChanges.push({
            timestamp: Date.now(),
            state: { ...webRTCConversationService.audioResponseState }
          });
          lastState = currentState;
        }
      }
    }, 100);

    // Listen for key events
    webRTCConversationService.on('aiSpeechStarted', () => {
      console.log('🎤 AI speech started - checking state initialization');
      results.diagnostics.events.push({ event: 'aiSpeechStarted', timestamp: Date.now() });
      
      // Check if response state was initialized
      if (webRTCConversationService.audioResponseState.responseId) {
        results.stateTracking.responseStateInitialized = true;
        console.log('✅ Response state initialized with ID:', webRTCConversationService.audioResponseState.responseId);
      }
    });

    webRTCConversationService.on('aiTranscriptComplete', (transcript) => {
      console.log('📝 AI transcript completed:', transcript.text.length, 'characters');
      results.diagnostics.events.push({ 
        event: 'aiTranscriptComplete', 
        timestamp: Date.now(), 
        length: transcript.text.length,
        text: transcript.text.substring(0, 50) + '...'
      });
      
      results.transcripts.totalLength += transcript.text.length;
      results.transcripts.examples.push({
        text: transcript.text,
        length: transcript.text.length,
        complete: transcript.text.match(/[.!?]$/) !== null
      });
      
      // Check if transcript seems complete
      if (transcript.text.length > 20 && transcript.text.match(/[.!?]$/)) {
        results.transcripts.complete++;
      } else {
        results.transcripts.incomplete++;
        console.warn('⚠️ Potentially incomplete transcript:', transcript.text);
      }
      
      results.stateTracking.transcriptCompletionTracked = true;
    });

    webRTCConversationService.on('outputAudioBufferStopped', () => {
      console.log('🔊 Audio buffer stopped event received');
      results.diagnostics.events.push({ event: 'outputAudioBufferStopped', timestamp: Date.now() });
      results.stateTracking.audioPlaybackTracked = true;
    });

    webRTCConversationService.on('aiSpeechEnded', () => {
      console.log('✅ AI speech ended (final)');
      results.diagnostics.events.push({ event: 'aiSpeechEnded', timestamp: Date.now() });
    });

    // Monitor for ignored events
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      const message = args.join(' ');
      if (message.includes('No active response, ignoring audio buffer stopped event')) {
        results.diagnostics.ignoredEvents++;
        console.warn('⚠️ Audio buffer event ignored - this indicates state tracking issues');
      }
      originalConsoleLog.apply(console, args);
    };

    try {
      console.log('🔄 Starting conversation to test audio response state tracking...');
      const sessionResult = await webRTCConversationService.startSession(
        'audio-state-test',
        'beginner',
        { id: 'test-user', displayName: 'Test User' }
      );

      if (sessionResult) {
        console.log('✅ Session started successfully');
        
        // Wait for multiple AI responses to test state tracking
        console.log('⏳ Waiting for AI responses to test state tracking...');
        await new Promise(resolve => setTimeout(resolve, 20000)); // Wait 20 seconds
        
        // Analyze results
        results.stateTracking.audioSendingTracked = results.diagnostics.stateChanges.some(
          change => change.state.audioSendingComplete === true
        );
        
        results.stateTracking.properSynchronization = 
          results.stateTracking.responseStateInitialized &&
          results.stateTracking.transcriptCompletionTracked &&
          results.stateTracking.audioPlaybackTracked &&
          results.diagnostics.ignoredEvents === 0;
        
        results.success = results.stateTracking.properSynchronization &&
                         results.transcripts.complete > results.transcripts.incomplete;
        
      } else {
        console.error('❌ Session failed to start');
        results.errors.push('Session start failed');
      }

    } catch (error) {
      console.error('❌ Audio response state test failed:', error.message);
      results.errors.push(`Test execution: ${error.message}`);
    }

    // Stop monitoring
    clearInterval(stateMonitor);
    console.log = originalConsoleLog; // Restore original console.log

    // Cleanup
    await webRTCConversationService.stopSession();

  } catch (error) {
    console.error('❌ Audio response state test failed:', error);
    results.errors.push(`Test setup: ${error.message}`);
  } finally {
    try {
      await webRTCConversationService.destroy();
    } catch (error) {
      results.errors.push(`Cleanup: ${error.message}`);
    }
  }

  // Print detailed results
  console.log('\n📊 Audio Response State Tracking Test Results:');
  console.log('=' * 60);
  console.log(`   Overall Success: ${results.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');
  
  console.log('🔄 State Tracking Components:');
  console.log(`   Response State Initialized: ${results.stateTracking.responseStateInitialized ? '✅ YES' : '❌ NO'}`);
  console.log(`   Audio Sending Tracked: ${results.stateTracking.audioSendingTracked ? '✅ YES' : '❌ NO'}`);
  console.log(`   Transcript Completion Tracked: ${results.stateTracking.transcriptCompletionTracked ? '✅ YES' : '❌ NO'}`);
  console.log(`   Audio Playback Tracked: ${results.stateTracking.audioPlaybackTracked ? '✅ YES' : '❌ NO'}`);
  console.log(`   Proper Synchronization: ${results.stateTracking.properSynchronization ? '✅ YES' : '❌ NO'}`);

  console.log('\n📝 Transcript Analysis:');
  console.log(`   Complete Transcripts: ${results.transcripts.complete}`);
  console.log(`   Incomplete Transcripts: ${results.transcripts.incomplete}`);
  console.log(`   Average Length: ${results.transcripts.examples.length > 0 ? Math.round(results.transcripts.totalLength / results.transcripts.examples.length) : 0} chars`);
  console.log(`   Ignored Audio Events: ${results.diagnostics.ignoredEvents}`);

  if (results.transcripts.examples.length > 0) {
    console.log('\n📋 Transcript Examples:');
    results.transcripts.examples.slice(0, 3).forEach((example, index) => {
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
 * Quick test for audio response state fixes
 */
export const quickAudioStateTest = async () => {
  console.log('⚡ Quick Audio Response State Test');
  
  try {
    const result = await testAudioResponseStateTracking();
    
    if (result.success) {
      console.log('✅ Audio response state tracking working correctly');
      console.log(`   Complete transcripts: ${result.transcripts.complete}`);
      console.log(`   Incomplete transcripts: ${result.transcripts.incomplete}`);
      console.log(`   Ignored events: ${result.diagnostics.ignoredEvents}`);
      return true;
    } else {
      console.log('❌ Audio response state tracking issues detected');
      const issues = Object.entries(result.stateTracking)
        .filter(([_, working]) => !working)
        .map(([component, _]) => component);
      console.log('   Issues:', issues);
      console.log(`   Incomplete transcripts: ${result.transcripts.incomplete}`);
      console.log(`   Ignored events: ${result.diagnostics.ignoredEvents}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Quick audio state test failed:', error);
    return false;
  }
};

export default {
  testAudioResponseStateTracking,
  quickAudioStateTest
};
