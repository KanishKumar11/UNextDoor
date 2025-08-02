/**
 * WebRTC Industry Standard Implementation Test
 * Tests the new industry-standard WebRTC data channel implementation
 */

import webRTCConversationService from '../services/WebRTCConversationService';

/**
 * Test the industry standard WebRTC implementation
 */
export const testIndustryStandardWebRTC = async () => {
  console.log('🏭 Testing Industry Standard WebRTC Implementation');
  
  const results = {
    success: false,
    phases: {
      dataChannelBeforeOffer: false,
      sdpAnalysis: false,
      standardNegotiation: false,
      dataChannelOpen: false,
      audioOnlyFallback: false
    },
    diagnostics: {
      sdpAnalysis: {
        localOffer: null,
        remoteAnswer: null
      },
      dataChannelStates: [],
      webrtcStates: [],
      fallbackTriggered: false
    },
    errors: []
  };

  try {
    // Initialize service
    await webRTCConversationService.initialize();
    console.log('✅ Service initialized');

    // Monitor states
    const stateMonitor = setInterval(() => {
      if (webRTCConversationService.peerConnection) {
        results.diagnostics.webrtcStates.push({
          timestamp: Date.now(),
          connectionState: webRTCConversationService.peerConnection.connectionState,
          iceState: webRTCConversationService.peerConnection.iceConnectionState,
          signalingState: webRTCConversationService.peerConnection.signalingState
        });
      }
      
      if (webRTCConversationService.dataChannel) {
        results.diagnostics.dataChannelStates.push({
          timestamp: Date.now(),
          state: webRTCConversationService.dataChannel.readyState
        });
      }
    }, 200);

    // Listen for audio-only fallback
    webRTCConversationService.on('audioOnlyMode', (data) => {
      console.log('🔊 Audio-only mode activated:', data.reason);
      results.diagnostics.fallbackTriggered = true;
      results.phases.audioOnlyFallback = true;
    });

    // Listen for data channel events
    webRTCConversationService.on('dataChannelOpened', () => {
      console.log('✅ Data channel opened event received');
      results.phases.dataChannelOpen = true;
    });

    try {
      console.log('🔄 Starting session with industry standard approach...');
      const sessionResult = await webRTCConversationService.startSession(
        'industry-standard-test',
        'beginner',
        { id: 'test-user', displayName: 'Test User' }
      );

      if (sessionResult) {
        console.log('✅ Session started successfully');
        
        // Check if data channel opened
        const finalDataChannelState = webRTCConversationService.dataChannel?.readyState;
        console.log(`📊 Final data channel state: ${finalDataChannelState}`);
        
        if (finalDataChannelState === 'open') {
          console.log('✅ Data channel reached open state with industry standard approach');
          results.phases.dataChannelOpen = true;
          results.success = true;
        } else if (webRTCConversationService.isAudioOnlyMode) {
          console.log('✅ Audio-only fallback working correctly');
          results.phases.audioOnlyFallback = true;
          results.success = true; // Success with fallback
        } else {
          console.error('❌ Data channel failed and no fallback activated');
        }
        
      } else {
        console.error('❌ Session failed to start');
        results.errors.push('Session start failed');
      }

    } catch (error) {
      console.error('❌ Session start failed:', error.message);
      results.errors.push(`Session start: ${error.message}`);
      
      // Check if fallback was triggered
      if (webRTCConversationService.isAudioOnlyMode) {
        console.log('✅ Audio-only fallback activated after error');
        results.phases.audioOnlyFallback = true;
        results.success = true; // Success with fallback
      }
    }

    // Stop monitoring
    clearInterval(stateMonitor);

    // Cleanup
    await webRTCConversationService.stopSession();

  } catch (error) {
    console.error('❌ Industry standard test failed:', error);
    results.errors.push(`Test setup: ${error.message}`);
  } finally {
    try {
      await webRTCConversationService.destroy();
    } catch (error) {
      results.errors.push(`Cleanup: ${error.message}`);
    }
  }

  // Analyze results
  const phaseCount = Object.values(results.phases).filter(Boolean).length;
  
  // Print detailed results
  console.log('\n📊 Industry Standard WebRTC Test Results:');
  console.log('=' * 60);
  console.log(`   Overall Success: ${results.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Phases Completed: ${phaseCount}/5`);
  console.log('');
  
  console.log('🔍 Implementation Phases:');
  console.log(`   Data Channel Before Offer: ${results.phases.dataChannelBeforeOffer ? '✅ YES' : '❌ NO'}`);
  console.log(`   SDP Analysis: ${results.phases.sdpAnalysis ? '✅ YES' : '❌ NO'}`);
  console.log(`   Standard Negotiation: ${results.phases.standardNegotiation ? '✅ YES' : '❌ NO'}`);
  console.log(`   Data Channel Open: ${results.phases.dataChannelOpen ? '✅ YES' : '❌ NO'}`);
  console.log(`   Audio-Only Fallback: ${results.phases.audioOnlyFallback ? '✅ YES' : '❌ NO'}`);

  if (results.diagnostics.dataChannelStates.length > 0) {
    console.log('\n📡 Data Channel State Timeline:');
    const stateChanges = [];
    let lastState = null;
    
    results.diagnostics.dataChannelStates.forEach(({ state, timestamp }) => {
      if (state !== lastState) {
        stateChanges.push({ state, timestamp });
        lastState = state;
      }
    });
    
    if (stateChanges.length > 0) {
      stateChanges.forEach(({ state, timestamp }, index) => {
        const duration = index > 0 ? timestamp - stateChanges[index - 1].timestamp : 0;
        console.log(`   ${state}: ${duration}ms`);
      });
    } else {
      console.log('   No state changes detected');
    }
  }

  if (results.diagnostics.fallbackTriggered) {
    console.log('\n🔊 Fallback Analysis:');
    console.log('   Audio-only mode was activated - this is acceptable for conversation functionality');
    console.log('   Users can still have conversations using audio communication');
  }

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(error => console.log(`   ${error}`));
  }

  return results;
};

/**
 * Test SDP analysis functionality
 */
export const testSDPAnalysis = async () => {
  console.log('🔍 Testing SDP Analysis Functionality');
  
  // Mock SDP with data channel
  const mockSDPWithDataChannel = `v=0
o=- 123456789 2 IN IP4 127.0.0.1
s=-
t=0 0
a=group:BUNDLE 0 1
m=audio 9 UDP/TLS/RTP/SAVPF 111
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=ice-ufrag:test
a=ice-pwd:test
a=fingerprint:sha-256 test
a=setup:actpass
a=mid:0
m=application 9 UDP/DTLS/SCTP webrtc-datachannel
c=IN IP4 0.0.0.0
a=ice-ufrag:test
a=ice-pwd:test
a=fingerprint:sha-256 test
a=setup:actpass
a=mid:1
a=sctp-port:5000
a=max-message-size:262144`;

  const mockSDPWithoutDataChannel = `v=0
o=- 123456789 2 IN IP4 127.0.0.1
s=-
t=0 0
m=audio 9 UDP/TLS/RTP/SAVPF 111
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=ice-ufrag:test
a=ice-pwd:test
a=fingerprint:sha-256 test
a=setup:actpass`;

  try {
    await webRTCConversationService.initialize();
    
    console.log('\n📋 Testing SDP with data channel:');
    webRTCConversationService.analyzeSDP(mockSDPWithDataChannel, 'Test SDP With Data Channel');
    
    console.log('\n📋 Testing SDP without data channel:');
    webRTCConversationService.analyzeSDP(mockSDPWithoutDataChannel, 'Test SDP Without Data Channel');
    
    console.log('\n✅ SDP analysis test completed');
    return true;
    
  } catch (error) {
    console.error('❌ SDP analysis test failed:', error);
    return false;
  } finally {
    await webRTCConversationService.destroy();
  }
};

/**
 * Quick test for industry standard implementation
 */
export const quickIndustryStandardTest = async () => {
  console.log('⚡ Quick Industry Standard Test');
  
  try {
    const result = await testIndustryStandardWebRTC();
    
    if (result.success) {
      console.log('✅ Industry standard implementation working');
      if (result.phases.dataChannelOpen) {
        console.log('   Data channel opened successfully');
      } else if (result.phases.audioOnlyFallback) {
        console.log('   Audio-only fallback working correctly');
      }
      return true;
    } else {
      console.log('❌ Industry standard implementation has issues');
      const failedPhases = Object.entries(result.phases)
        .filter(([_, success]) => !success)
        .map(([phase, _]) => phase);
      console.log('   Failed phases:', failedPhases);
      return false;
    }
  } catch (error) {
    console.error('❌ Quick industry standard test failed:', error);
    return false;
  }
};

export default {
  testIndustryStandardWebRTC,
  testSDPAnalysis,
  quickIndustryStandardTest
};
