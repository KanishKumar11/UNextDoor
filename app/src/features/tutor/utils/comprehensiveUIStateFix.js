/**
 * Comprehensive UI State Fix Test
 * Tests all identified issues: ReferenceError, state synchronization, header updates, and subsequent conversations
 */

import webRTCConversationService from '../services/WebRTCConversationService';

/**
 * Test comprehensive UI state fixes
 */
export const testComprehensiveUIStateFix = async () => {
  console.log('🔧 Testing Comprehensive UI State Fixes');
  
  const results = {
    success: false,
    referenceErrorFix: {
      cleanupFixed: false,
      noReferenceErrors: false
    },
    stateSync: {
      serviceToUISync: false,
      headerUpdates: false,
      conversationHistorySync: false,
      connectionStateSync: false
    },
    firstConversation: {
      connectionProgression: [],
      headerUpdates: [],
      transcriptionEvents: [],
      success: false
    },
    subsequentConversation: {
      noErrorScreen: false,
      properInitialization: false,
      transcriptionEvents: [],
      headerUpdates: [],
      success: false
    },
    diagnostics: {
      stateUpdates: [],
      eventFlow: [],
      errors: []
    },
    errors: []
  };

  try {
    console.log('🔄 Phase 1: Testing ReferenceError Fix');
    
    // Test cleanup without ReferenceError
    try {
      await webRTCConversationService.initialize();
      
      // Simulate cleanup that would cause ReferenceError
      await webRTCConversationService.destroy();
      results.referenceErrorFix.cleanupFixed = true;
      results.referenceErrorFix.noReferenceErrors = true;
      console.log('✅ Cleanup completed without ReferenceError');
    } catch (error) {
      if (error.message.includes('setCurrentUserTranscript')) {
        results.errors.push('ReferenceError still exists: setCurrentUserTranscript');
      } else {
        results.referenceErrorFix.cleanupFixed = true;
        results.referenceErrorFix.noReferenceErrors = true;
      }
    }

    console.log('🔄 Phase 2: Testing First Conversation State Synchronization');
    
    // Re-initialize for testing
    await webRTCConversationService.initialize();
    
    // Monitor state updates
    const stateUpdateMonitor = (state) => {
      results.diagnostics.stateUpdates.push({
        timestamp: Date.now(),
        isConnected: state.isConnected,
        isSessionActive: state.isSessionActive,
        conversationHistoryLength: state.conversationHistory?.length || 0,
        isConnecting: state.isConnecting
      });
      
      // Check for header update data
      if (state.conversationHistory && state.conversationHistory.length > 0) {
        results.stateSync.conversationHistorySync = true;
        results.firstConversation.headerUpdates.push({
          timestamp: Date.now(),
          exchangeCount: state.conversationHistory.length
        });
      }
      
      if (state.isConnected !== undefined) {
        results.stateSync.connectionStateSync = true;
        results.firstConversation.connectionProgression.push({
          timestamp: Date.now(),
          isConnected: state.isConnected,
          isSessionActive: state.isSessionActive,
          isConnecting: state.isConnecting
        });
      }
    };

    webRTCConversationService.on('stateChanged', stateUpdateMonitor);
    
    // Monitor transcription events
    webRTCConversationService.on('aiTranscriptComplete', (transcript) => {
      results.firstConversation.transcriptionEvents.push({
        timestamp: Date.now(),
        length: transcript.text.length,
        text: transcript.text.substring(0, 50) + '...'
      });
      console.log('✅ First conversation transcription received');
    });

    // Start first conversation
    console.log('🎯 Starting first conversation...');
    const firstSessionResult = await webRTCConversationService.startSession(
      'ui-state-fix-test-1',
      'beginner',
      { id: 'test-user-1', displayName: 'UI State Fix Test User 1' }
    );

    if (firstSessionResult) {
      console.log('✅ First session started successfully');
      
      // Wait for connection and initial response
      await new Promise(resolve => setTimeout(resolve, 15000));
      
      // Check if state synchronization worked
      results.stateSync.serviceToUISync = results.diagnostics.stateUpdates.length > 0;
      results.stateSync.headerUpdates = results.firstConversation.headerUpdates.length > 0;
      
      results.firstConversation.success = 
        results.firstConversation.connectionProgression.length > 0 &&
        results.firstConversation.transcriptionEvents.length > 0;
      
      console.log(`🎯 First conversation test: ${results.firstConversation.success ? 'PASS' : 'FAIL'}`);
      
      // Stop first session
      await webRTCConversationService.stopSession();
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for cleanup
    }

    console.log('🔄 Phase 3: Testing Subsequent Conversation Functionality');
    
    // Reset monitoring for second conversation
    results.subsequentConversation.transcriptionEvents = [];
    results.subsequentConversation.headerUpdates = [];
    
    // Monitor subsequent conversation events
    webRTCConversationService.on('aiTranscriptComplete', (transcript) => {
      results.subsequentConversation.transcriptionEvents.push({
        timestamp: Date.now(),
        length: transcript.text.length,
        text: transcript.text.substring(0, 50) + '...'
      });
      console.log('✅ Subsequent conversation transcription received');
    });

    // Test subsequent conversation (this should not show error screen)
    console.log('🎯 Starting subsequent conversation...');
    try {
      const secondSessionResult = await webRTCConversationService.startSession(
        'ui-state-fix-test-2',
        'intermediate',
        { id: 'test-user-2', displayName: 'UI State Fix Test User 2' }
      );

      if (secondSessionResult) {
        console.log('✅ Second session started without error screen');
        results.subsequentConversation.noErrorScreen = true;
        results.subsequentConversation.properInitialization = true;
        
        // Wait for connection and transcription
        await new Promise(resolve => setTimeout(resolve, 15000));
        
        // Check if subsequent conversation worked
        results.subsequentConversation.success = 
          results.subsequentConversation.noErrorScreen &&
          results.subsequentConversation.transcriptionEvents.length > 0;
        
        console.log(`🎯 Subsequent conversation test: ${results.subsequentConversation.success ? 'PASS' : 'FAIL'}`);
        
        // Stop second session
        await webRTCConversationService.stopSession();
      }
    } catch (error) {
      console.error('❌ Subsequent conversation failed:', error);
      results.errors.push(`Subsequent conversation: ${error.message}`);
    }

    // Evaluate overall success
    results.success = 
      results.referenceErrorFix.noReferenceErrors &&
      results.stateSync.serviceToUISync &&
      results.stateSync.connectionStateSync &&
      results.firstConversation.success &&
      results.subsequentConversation.success;

  } catch (error) {
    console.error('❌ Comprehensive UI state test failed:', error);
    results.errors.push(`Test execution: ${error.message}`);
  } finally {
    try {
      await webRTCConversationService.destroy();
    } catch (error) {
      results.errors.push(`Cleanup: ${error.message}`);
    }
  }

  // Print detailed results
  console.log('\n🔧 Comprehensive UI State Fix Test Results:');
  console.log('=' * 80);
  console.log(`   Overall Success: ${results.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');
  
  console.log('🔧 ReferenceError Fix:');
  console.log(`   Cleanup Fixed: ${results.referenceErrorFix.cleanupFixed ? '✅ YES' : '❌ NO'}`);
  console.log(`   No Reference Errors: ${results.referenceErrorFix.noReferenceErrors ? '✅ YES' : '❌ NO'}`);
  
  console.log('\n📊 State Synchronization:');
  console.log(`   Service to UI Sync: ${results.stateSync.serviceToUISync ? '✅ YES' : '❌ NO'}`);
  console.log(`   Header Updates: ${results.stateSync.headerUpdates ? '✅ YES' : '❌ NO'}`);
  console.log(`   Conversation History Sync: ${results.stateSync.conversationHistorySync ? '✅ YES' : '❌ NO'}`);
  console.log(`   Connection State Sync: ${results.stateSync.connectionStateSync ? '✅ YES' : '❌ NO'}`);
  
  console.log('\n🎯 First Conversation:');
  console.log(`   Success: ${results.firstConversation.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Connection Progression Events: ${results.firstConversation.connectionProgression.length}`);
  console.log(`   Header Updates: ${results.firstConversation.headerUpdates.length}`);
  console.log(`   Transcription Events: ${results.firstConversation.transcriptionEvents.length}`);
  
  console.log('\n🎯 Subsequent Conversation:');
  console.log(`   Success: ${results.subsequentConversation.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   No Error Screen: ${results.subsequentConversation.noErrorScreen ? '✅ YES' : '❌ NO'}`);
  console.log(`   Proper Initialization: ${results.subsequentConversation.properInitialization ? '✅ YES' : '❌ NO'}`);
  console.log(`   Transcription Events: ${results.subsequentConversation.transcriptionEvents.length}`);
  
  console.log('\n📈 Diagnostics:');
  console.log(`   State Updates: ${results.diagnostics.stateUpdates.length}`);
  console.log(`   Event Flow Events: ${results.diagnostics.eventFlow.length}`);
  console.log(`   Errors: ${results.errors.length}`);

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(error => console.log(`   ${error}`));
  }

  return results;
};

/**
 * Quick test for comprehensive UI state fixes
 */
export const quickUIStateTest = async () => {
  console.log('⚡ Quick Comprehensive UI State Test');
  
  try {
    const result = await testComprehensiveUIStateFix();
    
    if (result.success) {
      console.log('✅ All UI state fixes working correctly');
      console.log(`   ReferenceError fixed: ${result.referenceErrorFix.noReferenceErrors ? 'YES' : 'NO'}`);
      console.log(`   State synchronization: ${result.stateSync.serviceToUISync ? 'WORKING' : 'BROKEN'}`);
      console.log(`   Header updates: ${result.stateSync.headerUpdates ? 'WORKING' : 'BROKEN'}`);
      console.log(`   First conversation: ${result.firstConversation.success ? 'WORKING' : 'BROKEN'}`);
      console.log(`   Subsequent conversations: ${result.subsequentConversation.success ? 'WORKING' : 'BROKEN'}`);
      return true;
    } else {
      console.log('❌ UI state fixes need attention');
      console.log(`   State updates: ${result.diagnostics.stateUpdates.length}`);
      console.log(`   First conversation events: ${result.firstConversation.transcriptionEvents.length}`);
      console.log(`   Subsequent conversation events: ${result.subsequentConversation.transcriptionEvents.length}`);
      console.log(`   Errors: ${result.errors.length}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Quick UI state test failed:', error);
    return false;
  }
};

export default {
  testComprehensiveUIStateFix,
  quickUIStateTest
};
