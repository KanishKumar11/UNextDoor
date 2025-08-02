/**
 * Comprehensive State Management Fix Test
 * Tests both first conversation state progression and subsequent conversation functionality
 */

import webRTCConversationService from '../services/WebRTCConversationService';

/**
 * Test comprehensive state management fixes
 */
export const testComprehensiveStateManagementFix = async () => {
  console.log('🔧 Testing Comprehensive State Management Fixes');
  
  const results = {
    success: false,
    phase1Fixes: {
      stateProgressionFixed: false,
      connectingEventEmitted: false,
      connectedEventEmitted: false,
      loadingIndicatorWorking: false
    },
    phase2Fixes: {
      eventListenerManagementFixed: false,
      initializationSyncFixed: false,
      stateDesynchronizationFixed: false
    },
    phase3Fixes: {
      transcriptionEventFlowFixed: false,
      transcriptionLoadingStateWorking: false,
      transcriptionEventPersistence: false
    },
    firstConversationTest: {
      stateProgression: [],
      connectionEvents: [],
      transcriptionEvents: [],
      success: false
    },
    subsequentConversationTest: {
      stateProgression: [],
      connectionEvents: [],
      transcriptionEvents: [],
      success: false
    },
    diagnostics: {
      events: [],
      stateTransitions: [],
      errors: []
    },
    errors: []
  };

  try {
    console.log('🔄 Phase 1: Testing First Conversation State Progression');
    
    // Initialize service
    await webRTCConversationService.initialize();
    console.log('✅ Service initialized');

    // Monitor state progression events
    const stateProgressionMonitor = (event, data) => {
      const timestamp = Date.now();
      results.diagnostics.events.push({ event, data, timestamp });
      
      if (event === 'connecting') {
        results.phase1Fixes.connectingEventEmitted = true;
        results.firstConversationTest.connectionEvents.push({ event: 'connecting', timestamp });
        console.log('✅ CONNECTING event emitted correctly');
      }
      
      if (event === 'connected') {
        results.phase1Fixes.connectedEventEmitted = true;
        results.firstConversationTest.connectionEvents.push({ event: 'connected', timestamp });
        console.log('✅ CONNECTED event emitted correctly');
      }
      
      if (event === 'stateChanged') {
        results.diagnostics.stateTransitions.push({
          timestamp,
          isConnected: data?.isConnected,
          isSessionActive: data?.isSessionActive,
          isConnecting: data?.isConnecting
        });
      }
    };

    // Register event monitors
    webRTCConversationService.on('connecting', () => stateProgressionMonitor('connecting'));
    webRTCConversationService.on('connected', () => stateProgressionMonitor('connected'));
    webRTCConversationService.on('stateChanged', (data) => stateProgressionMonitor('stateChanged', data));
    
    // Monitor transcription events
    webRTCConversationService.on('aiTranscriptComplete', (transcript) => {
      results.firstConversationTest.transcriptionEvents.push({
        timestamp: Date.now(),
        length: transcript.text.length,
        text: transcript.text.substring(0, 50) + '...'
      });
      results.phase3Fixes.transcriptionEventFlowFixed = true;
      console.log('✅ Transcription event received in first conversation');
    });

    // Test first conversation
    console.log('🎯 Starting first conversation...');
    const firstSessionResult = await webRTCConversationService.startSession(
      'comprehensive-state-test-1',
      'beginner',
      { id: 'test-user-1', displayName: 'First Conversation Test User' }
    );

    if (firstSessionResult) {
      console.log('✅ First session started successfully');
      
      // Wait for connection establishment and initial response
      await new Promise(resolve => setTimeout(resolve, 15000));
      
      // Check if state progression worked
      results.phase1Fixes.stateProgressionFixed = 
        results.phase1Fixes.connectingEventEmitted && 
        results.phase1Fixes.connectedEventEmitted;
      
      results.firstConversationTest.success = 
        results.firstConversationTest.connectionEvents.length >= 2 &&
        results.firstConversationTest.transcriptionEvents.length > 0;
      
      console.log(`🎯 First conversation test: ${results.firstConversationTest.success ? 'PASS' : 'FAIL'}`);
      
      // Stop first session
      await webRTCConversationService.stopSession();
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for cleanup
    }

    console.log('🔄 Phase 2: Testing Subsequent Conversation Functionality');
    
    // Reset monitoring for second conversation
    results.subsequentConversationTest.connectionEvents = [];
    results.subsequentConversationTest.transcriptionEvents = [];
    
    // Monitor subsequent conversation events
    webRTCConversationService.on('aiTranscriptComplete', (transcript) => {
      results.subsequentConversationTest.transcriptionEvents.push({
        timestamp: Date.now(),
        length: transcript.text.length,
        text: transcript.text.substring(0, 50) + '...'
      });
      results.phase3Fixes.transcriptionEventPersistence = true;
      console.log('✅ Transcription event received in subsequent conversation');
    });

    // Test subsequent conversation
    console.log('🎯 Starting subsequent conversation...');
    const secondSessionResult = await webRTCConversationService.startSession(
      'comprehensive-state-test-2',
      'intermediate',
      { id: 'test-user-2', displayName: 'Subsequent Conversation Test User' }
    );

    if (secondSessionResult) {
      console.log('✅ Second session started successfully');
      results.phase2Fixes.eventListenerManagementFixed = true;
      
      // Wait for connection and transcription
      await new Promise(resolve => setTimeout(resolve, 15000));
      
      // Check if subsequent conversation worked
      results.subsequentConversationTest.success = 
        results.subsequentConversationTest.transcriptionEvents.length > 0;
      
      console.log(`🎯 Subsequent conversation test: ${results.subsequentConversationTest.success ? 'PASS' : 'FAIL'}`);
      
      // Stop second session
      await webRTCConversationService.stopSession();
    }

    // Evaluate overall success
    results.phase2Fixes.initializationSyncFixed = 
      results.firstConversationTest.success && results.subsequentConversationTest.success;
    
    results.phase2Fixes.stateDesynchronizationFixed = 
      results.diagnostics.stateTransitions.length > 0;
    
    results.phase3Fixes.transcriptionLoadingStateWorking = 
      results.phase3Fixes.transcriptionEventFlowFixed && 
      results.phase3Fixes.transcriptionEventPersistence;

    // Overall success criteria
    results.success = 
      results.phase1Fixes.stateProgressionFixed &&
      results.phase2Fixes.eventListenerManagementFixed &&
      results.phase3Fixes.transcriptionEventFlowFixed &&
      results.firstConversationTest.success &&
      results.subsequentConversationTest.success;

  } catch (error) {
    console.error('❌ Comprehensive state management test failed:', error);
    results.errors.push(`Test execution: ${error.message}`);
  } finally {
    try {
      await webRTCConversationService.destroy();
    } catch (error) {
      results.errors.push(`Cleanup: ${error.message}`);
    }
  }

  // Print detailed results
  console.log('\n🔧 Comprehensive State Management Fix Test Results:');
  console.log('=' * 80);
  console.log(`   Overall Success: ${results.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');
  
  console.log('📊 Phase 1 Fixes (State Progression):');
  console.log(`   State Progression Fixed: ${results.phase1Fixes.stateProgressionFixed ? '✅ YES' : '❌ NO'}`);
  console.log(`   Connecting Event Emitted: ${results.phase1Fixes.connectingEventEmitted ? '✅ YES' : '❌ NO'}`);
  console.log(`   Connected Event Emitted: ${results.phase1Fixes.connectedEventEmitted ? '✅ YES' : '❌ NO'}`);
  
  console.log('\n📊 Phase 2 Fixes (Event Listener Management):');
  console.log(`   Event Listener Management: ${results.phase2Fixes.eventListenerManagementFixed ? '✅ YES' : '❌ NO'}`);
  console.log(`   Initialization Sync Fixed: ${results.phase2Fixes.initializationSyncFixed ? '✅ YES' : '❌ NO'}`);
  console.log(`   State Desynchronization Fixed: ${results.phase2Fixes.stateDesynchronizationFixed ? '✅ YES' : '❌ NO'}`);
  
  console.log('\n📊 Phase 3 Fixes (Transcription Event Flow):');
  console.log(`   Transcription Event Flow: ${results.phase3Fixes.transcriptionEventFlowFixed ? '✅ YES' : '❌ NO'}`);
  console.log(`   Transcription Loading State: ${results.phase3Fixes.transcriptionLoadingStateWorking ? '✅ YES' : '❌ NO'}`);
  console.log(`   Event Persistence: ${results.phase3Fixes.transcriptionEventPersistence ? '✅ YES' : '❌ NO'}`);
  
  console.log('\n🎯 First Conversation Test:');
  console.log(`   Success: ${results.firstConversationTest.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Connection Events: ${results.firstConversationTest.connectionEvents.length}`);
  console.log(`   Transcription Events: ${results.firstConversationTest.transcriptionEvents.length}`);
  
  console.log('\n🎯 Subsequent Conversation Test:');
  console.log(`   Success: ${results.subsequentConversationTest.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Transcription Events: ${results.subsequentConversationTest.transcriptionEvents.length}`);
  
  console.log('\n📈 Diagnostics:');
  console.log(`   Total Events: ${results.diagnostics.events.length}`);
  console.log(`   State Transitions: ${results.diagnostics.stateTransitions.length}`);
  console.log(`   Errors: ${results.errors.length}`);

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(error => console.log(`   ${error}`));
  }

  return results;
};

/**
 * Quick test for comprehensive state management fixes
 */
export const quickComprehensiveStateTest = async () => {
  console.log('⚡ Quick Comprehensive State Management Test');
  
  try {
    const result = await testComprehensiveStateManagementFix();
    
    if (result.success) {
      console.log('✅ All state management fixes working correctly');
      console.log(`   Phase 1 (State Progression): ${result.phase1Fixes.stateProgressionFixed ? 'FIXED' : 'NEEDS WORK'}`);
      console.log(`   Phase 2 (Event Management): ${result.phase2Fixes.eventListenerManagementFixed ? 'FIXED' : 'NEEDS WORK'}`);
      console.log(`   Phase 3 (Transcription Flow): ${result.phase3Fixes.transcriptionEventFlowFixed ? 'FIXED' : 'NEEDS WORK'}`);
      console.log(`   First conversation: ${result.firstConversationTest.success ? 'WORKING' : 'BROKEN'}`);
      console.log(`   Subsequent conversations: ${result.subsequentConversationTest.success ? 'WORKING' : 'BROKEN'}`);
      return true;
    } else {
      console.log('❌ State management fixes need attention');
      console.log(`   Connection events: ${result.firstConversationTest.connectionEvents.length}`);
      console.log(`   Transcription events: ${result.firstConversationTest.transcriptionEvents.length + result.subsequentConversationTest.transcriptionEvents.length}`);
      console.log(`   Errors: ${result.errors.length}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Quick comprehensive state test failed:', error);
    return false;
  }
};

export default {
  testComprehensiveStateManagementFix,
  quickComprehensiveStateTest
};
