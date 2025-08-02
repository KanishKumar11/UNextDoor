/**
 * Natural Audio Flow Test
 * Tests the proper solution that removes artificial synchronization
 * and allows OpenAI's natural audio/transcript flow
 */

import webRTCConversationService from '../services/WebRTCConversationService';

/**
 * Test natural audio flow without artificial synchronization
 */
export const testNaturalAudioFlow = async () => {
  console.log('🎵 Testing Natural Audio Flow (No Artificial Synchronization)');
  
  const results = {
    success: false,
    naturalFlow: {
      audioPlaysNaturally: false,
      transcriptIndependent: false,
      noForcedSynchronization: false,
      iceConnectionStable: false
    },
    audioQuality: {
      completeResponses: 0,
      interruptedResponses: 0,
      averageResponseLength: 0,
      totalResponses: 0
    },
    connectionStability: {
      iceDisconnections: 0,
      iceRecoveries: 0,
      connectionErrors: 0
    },
    diagnostics: {
      events: [],
      artificialSyncDetected: false,
      naturalFlowEvents: 0
    },
    errors: []
  };

  try {
    // Initialize service
    await webRTCConversationService.initialize();
    console.log('✅ Service initialized');

    // Monitor for artificial synchronization patterns (should not occur)
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      const message = args.join(' ');
      
      // Detect artificial synchronization patterns (bad)
      if (message.includes('Waiting for:') || 
          message.includes('Audio response status:') ||
          message.includes('Finalizing complete audio response')) {
        results.diagnostics.artificialSyncDetected = true;
        console.warn('❌ Artificial synchronization detected - this should not happen');
      }
      
      // Detect natural flow patterns (good)
      if (message.includes('AI finished playing audio') ||
          message.includes('AI speech completed naturally') ||
          message.includes('AI transcript completed:')) {
        results.diagnostics.naturalFlowEvents++;
      }
      
      originalConsoleLog.apply(console, args);
    };

    // Monitor ICE connection events
    webRTCConversationService.on('connectionStateChanged', (state) => {
      results.diagnostics.events.push({ event: 'iceStateChange', state, timestamp: Date.now() });
      
      if (state === 'disconnected') {
        results.connectionStability.iceDisconnections++;
      } else if (state === 'connected' || state === 'completed') {
        results.connectionStability.iceRecoveries++;
      }
    });

    // Monitor audio events
    webRTCConversationService.on('aiSpeechStarted', () => {
      console.log('🎤 AI speech started naturally');
      results.diagnostics.events.push({ event: 'aiSpeechStarted', timestamp: Date.now() });
    });

    webRTCConversationService.on('aiSpeechEnded', () => {
      console.log('🎤 AI speech ended naturally');
      results.diagnostics.events.push({ event: 'aiSpeechEnded', timestamp: Date.now() });
      results.audioQuality.totalResponses++;
    });

    webRTCConversationService.on('aiTranscriptComplete', (transcript) => {
      console.log('📝 AI transcript completed independently:', transcript.text.length, 'chars');
      results.diagnostics.events.push({ 
        event: 'aiTranscriptComplete', 
        timestamp: Date.now(),
        length: transcript.text.length 
      });
      
      results.audioQuality.averageResponseLength += transcript.text.length;
      
      // Check if response seems complete
      if (transcript.text.length > 10 && transcript.text.match(/[.!?]$/)) {
        results.audioQuality.completeResponses++;
      } else {
        results.audioQuality.interruptedResponses++;
      }
    });

    // Monitor for connection errors
    webRTCConversationService.on('error', (error) => {
      if (error.type === 'ice_connection_failed') {
        results.connectionStability.connectionErrors++;
        console.warn('⚠️ ICE connection error:', error.error.message);
      }
    });

    try {
      console.log('🔄 Starting conversation to test natural audio flow...');
      const sessionResult = await webRTCConversationService.startSession(
        'natural-flow-test',
        'beginner',
        { id: 'test-user', displayName: 'Test User' }
      );

      if (sessionResult) {
        console.log('✅ Session started successfully');
        
        // Wait for natural conversation flow
        console.log('⏳ Testing natural audio flow for 30 seconds...');
        await new Promise(resolve => setTimeout(resolve, 30000));
        
        // Analyze results
        results.naturalFlow.audioPlaysNaturally = !results.diagnostics.artificialSyncDetected;
        results.naturalFlow.transcriptIndependent = results.diagnostics.naturalFlowEvents > 0;
        results.naturalFlow.noForcedSynchronization = !results.diagnostics.artificialSyncDetected;
        results.naturalFlow.iceConnectionStable = results.connectionStability.connectionErrors === 0;
        
        // Calculate average response length
        if (results.audioQuality.totalResponses > 0) {
          results.audioQuality.averageResponseLength = Math.round(
            results.audioQuality.averageResponseLength / results.audioQuality.totalResponses
          );
        }
        
        results.success = 
          results.naturalFlow.audioPlaysNaturally &&
          results.naturalFlow.transcriptIndependent &&
          results.naturalFlow.noForcedSynchronization &&
          results.audioQuality.completeResponses >= results.audioQuality.interruptedResponses;
        
      } else {
        console.error('❌ Session failed to start');
        results.errors.push('Session start failed');
      }

    } catch (error) {
      console.error('❌ Natural audio flow test failed:', error.message);
      results.errors.push(`Test execution: ${error.message}`);
    }

    // Restore original console.log
    console.log = originalConsoleLog;

    // Cleanup
    await webRTCConversationService.stopSession();

  } catch (error) {
    console.error('❌ Natural audio flow test failed:', error);
    results.errors.push(`Test setup: ${error.message}`);
  } finally {
    try {
      await webRTCConversationService.destroy();
    } catch (error) {
      results.errors.push(`Cleanup: ${error.message}`);
    }
  }

  // Print detailed results
  console.log('\n📊 Natural Audio Flow Test Results:');
  console.log('=' * 50);
  console.log(`   Overall Success: ${results.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');
  
  console.log('🎵 Natural Flow Components:');
  console.log(`   Audio Plays Naturally: ${results.naturalFlow.audioPlaysNaturally ? '✅ YES' : '❌ NO'}`);
  console.log(`   Transcript Independent: ${results.naturalFlow.transcriptIndependent ? '✅ YES' : '❌ NO'}`);
  console.log(`   No Forced Synchronization: ${results.naturalFlow.noForcedSynchronization ? '✅ YES' : '❌ NO'}`);
  console.log(`   ICE Connection Stable: ${results.naturalFlow.iceConnectionStable ? '✅ YES' : '❌ NO'}`);

  console.log('\n🎤 Audio Quality:');
  console.log(`   Total Responses: ${results.audioQuality.totalResponses}`);
  console.log(`   Complete Responses: ${results.audioQuality.completeResponses}`);
  console.log(`   Interrupted Responses: ${results.audioQuality.interruptedResponses}`);
  console.log(`   Average Response Length: ${results.audioQuality.averageResponseLength} chars`);

  console.log('\n🔗 Connection Stability:');
  console.log(`   ICE Disconnections: ${results.connectionStability.iceDisconnections}`);
  console.log(`   ICE Recoveries: ${results.connectionStability.iceRecoveries}`);
  console.log(`   Connection Errors: ${results.connectionStability.connectionErrors}`);

  console.log('\n📋 Flow Analysis:');
  console.log(`   Artificial Sync Detected: ${results.diagnostics.artificialSyncDetected ? '❌ YES (BAD)' : '✅ NO (GOOD)'}`);
  console.log(`   Natural Flow Events: ${results.diagnostics.naturalFlowEvents}`);

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(error => console.log(`   ${error}`));
  }

  return results;
};

/**
 * Quick test for natural audio flow
 */
export const quickNaturalFlowTest = async () => {
  console.log('⚡ Quick Natural Audio Flow Test');
  
  try {
    const result = await testNaturalAudioFlow();
    
    if (result.success) {
      console.log('✅ Natural audio flow working correctly');
      console.log(`   Complete responses: ${result.audioQuality.completeResponses}`);
      console.log(`   Interrupted responses: ${result.audioQuality.interruptedResponses}`);
      console.log(`   Artificial sync detected: ${result.diagnostics.artificialSyncDetected ? 'YES (BAD)' : 'NO (GOOD)'}`);
      console.log(`   Connection errors: ${result.connectionStability.connectionErrors}`);
      return true;
    } else {
      console.log('❌ Natural audio flow issues detected');
      const issues = Object.entries(result.naturalFlow)
        .filter(([_, working]) => !working)
        .map(([component, _]) => component);
      console.log('   Issues:', issues);
      console.log(`   Artificial sync detected: ${result.diagnostics.artificialSyncDetected}`);
      console.log(`   Connection errors: ${result.connectionStability.connectionErrors}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Quick natural flow test failed:', error);
    return false;
  }
};

export default {
  testNaturalAudioFlow,
  quickNaturalFlowTest
};
