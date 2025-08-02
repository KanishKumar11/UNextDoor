/**
 * WebRTC Session Lifecycle and Race Condition Tests
 * Tests for the fixes implemented to address critical WebRTC management issues
 */

import webRTCConversationService from '../../services/WebRTCConversationService';
import { act } from '@testing-library/react-native';

// Mock expo-audio
jest.mock('expo-audio', () => ({
  AudioModule: {
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
    getAvailableOutputsAsync: jest.fn().mockResolvedValue([
      { type: 'speaker', name: 'Speaker', selected: true },
      { type: 'bluetooth', name: 'AirPods Pro', selected: false },
    ]),
    selectAudioOutput: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock react-native-webrtc
jest.mock('react-native-webrtc', () => ({
  mediaDevices: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }],
    }),
  },
  RTCPeerConnection: jest.fn().mockImplementation(() => ({
    createOffer: jest.fn().mockResolvedValue({ sdp: 'mock-sdp' }),
    setLocalDescription: jest.fn().mockResolvedValue(undefined),
    setRemoteDescription: jest.fn().mockResolvedValue(undefined),
    addTrack: jest.fn(),
    close: jest.fn(),
    createDataChannel: jest.fn().mockReturnValue({
      onopen: null,
      onmessage: null,
      onerror: null,
      onclose: null,
      send: jest.fn(),
      close: jest.fn(),
      readyState: 'open',
    }),
    iceConnectionState: 'new',
    connectionState: 'new',
    oniceconnectionstatechange: null,
    ontrack: null,
  })),
  RTCSessionDescription: jest.fn().mockImplementation((desc) => desc),
}));

describe('WebRTC Session Lifecycle and Race Condition Fixes', () => {
  beforeEach(() => {
    webRTCConversationService.removeAllListeners();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await webRTCConversationService.destroy();
  });

  describe('Operation Queue and Race Condition Prevention', () => {
    beforeEach(async () => {
      await webRTCConversationService.initialize();
    });

    it('should prevent multiple simultaneous session starts', async () => {
      const sessionStartSpy = jest.fn();
      webRTCConversationService.on('sessionStarted', sessionStartSpy);

      // Start multiple sessions simultaneously
      const promises = [
        webRTCConversationService.startSession('scenario-1', 'beginner'),
        webRTCConversationService.startSession('scenario-2', 'beginner'),
        webRTCConversationService.startSession('scenario-3', 'beginner'),
      ];

      const results = await Promise.all(promises);

      // Only one session should succeed
      const successCount = results.filter(result => result === true).length;
      expect(successCount).toBe(1);
      expect(sessionStartSpy).toHaveBeenCalledTimes(1);
    });

    it('should queue operations sequentially', async () => {
      const operationOrder = [];

      // Mock the internal methods to track execution order
      const originalStartInternal = webRTCConversationService.startSessionInternal;
      const originalStopInternal = webRTCConversationService.stopSessionInternal;

      webRTCConversationService.startSessionInternal = jest.fn(async (...args) => {
        operationOrder.push('start');
        return originalStartInternal.call(webRTCConversationService, ...args);
      });

      webRTCConversationService.stopSessionInternal = jest.fn(async (...args) => {
        operationOrder.push('stop');
        return originalStopInternal.call(webRTCConversationService, ...args);
      });

      // Queue multiple operations
      const promises = [
        webRTCConversationService.startSession('scenario-1', 'beginner'),
        webRTCConversationService.stopSession(),
        webRTCConversationService.startSession('scenario-2', 'beginner'),
      ];

      await Promise.all(promises);

      // Operations should execute in order
      expect(operationOrder).toEqual(['start', 'stop', 'start']);
    });

    it('should generate unique session IDs for debugging', async () => {
      const sessionIds = [];

      // Start and stop multiple sessions
      for (let i = 0; i < 3; i++) {
        await webRTCConversationService.startSession(`scenario-${i}`, 'beginner');
        sessionIds.push(webRTCConversationService.sessionId);
        await webRTCConversationService.stopSession();
      }

      // All session IDs should be unique
      const uniqueIds = new Set(sessionIds);
      expect(uniqueIds.size).toBe(3);

      // Session IDs should follow the expected format
      sessionIds.forEach(id => {
        expect(id).toMatch(/^session_\d+_[a-z0-9]+$/);
      });
    });
  });

  describe('Enhanced Clean State Validation', () => {
    beforeEach(async () => {
      await webRTCConversationService.initialize();
    });

    it('should validate clean state with retry mechanism', async () => {
      // Start a session to create some state
      await webRTCConversationService.startSession('test-scenario', 'beginner');

      // Mock validateCleanState to fail first time, succeed second time
      let callCount = 0;
      const originalValidateCleanState = webRTCConversationService.validateCleanState;
      webRTCConversationService.validateCleanState = jest.fn(async () => {
        callCount++;
        if (callCount === 1) {
          return ['Peer connection state: connecting']; // Return issues
        }
        return []; // Return no issues
      });

      // Stop the session (which should trigger cleanup)
      await webRTCConversationService.stopSession();

      // Start a new session (which should trigger clean state validation)
      const result = await webRTCConversationService.startSession('new-scenario', 'beginner');

      expect(result).toBe(true);
      expect(webRTCConversationService.validateCleanState).toHaveBeenCalledTimes(2);
    });

    it('should detect and report clean state issues', async () => {
      const issues = await webRTCConversationService.validateCleanState();

      // Initially should have no issues
      expect(issues).toEqual([]);

      // Start a session to create state
      await webRTCConversationService.startSession('test-scenario', 'beginner');

      // Now should detect active state
      const issuesWithActiveSession = await webRTCConversationService.validateCleanState();
      expect(issuesWithActiveSession.length).toBeGreaterThan(0);
      expect(issuesWithActiveSession).toContain('Session still marked as active');
    });
  });

  describe('Session ID Tracking and Logging', () => {
    beforeEach(async () => {
      await webRTCConversationService.initialize();
    });

    it('should track session IDs throughout lifecycle', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await webRTCConversationService.startSession('test-scenario', 'beginner');
      const sessionId = webRTCConversationService.sessionId;

      expect(sessionId).toBeTruthy();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Starting session with ID: ${sessionId}`)
      );

      await webRTCConversationService.stopSession();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(`[${sessionId}] Stopping conversation session`)
      );

      consoleSpy.mockRestore();
    });

    it('should clear session ID on session stop', async () => {
      await webRTCConversationService.startSession('test-scenario', 'beginner');
      expect(webRTCConversationService.sessionId).toBeTruthy();

      await webRTCConversationService.stopSession();
      expect(webRTCConversationService.sessionId).toBeNull();
    });
  });

  describe('Message Type Handling', () => {
    beforeEach(async () => {
      await webRTCConversationService.initialize();
      await webRTCConversationService.startSession('test-scenario', 'beginner');
    });

    it('should handle user transcription delta messages', () => {
      const userTranscriptDeltaSpy = jest.fn();
      webRTCConversationService.on('userTranscriptDelta', userTranscriptDeltaSpy);

      webRTCConversationService.handleIncomingMessage({
        type: 'conversation.item.input_audio_transcription.delta',
        delta: 'Hello '
      });

      expect(userTranscriptDeltaSpy).toHaveBeenCalledWith({
        delta: 'Hello ',
        transcript: 'Hello '
      });
    });

    it('should handle user transcription completed messages', () => {
      const userTranscriptCompleteSpy = jest.fn();
      webRTCConversationService.on('userTranscriptComplete', userTranscriptCompleteSpy);

      // First add some transcript content (user transcript handling removed, but test the event)
      webRTCConversationService.currentUserTranscript = 'Hello world';

      webRTCConversationService.handleIncomingMessage({
        type: 'conversation.item.input_audio_transcription.completed'
      });

      expect(userTranscriptCompleteSpy).toHaveBeenCalledWith({
        type: 'user',
        text: 'Hello world',
        timestamp: expect.any(Date)
      });
    });

    it('should handle rate limits updated messages', () => {
      const rateLimitsUpdatedSpy = jest.fn();
      webRTCConversationService.on('rateLimitsUpdated', rateLimitsUpdatedSpy);

      const rateLimits = { requests: 100, tokens: 1000 };
      webRTCConversationService.handleIncomingMessage({
        type: 'rate_limits.updated',
        rate_limits: rateLimits
      });

      expect(rateLimitsUpdatedSpy).toHaveBeenCalledWith(rateLimits);
    });

    it('should handle output audio buffer stopped messages', () => {
      const outputAudioBufferStoppedSpy = jest.fn();
      webRTCConversationService.on('outputAudioBufferStopped', outputAudioBufferStoppedSpy);

      webRTCConversationService.handleIncomingMessage({
        type: 'output_audio_buffer.stopped'
      });

      expect(outputAudioBufferStoppedSpy).toHaveBeenCalled();
    });
  });

  describe('Operation Queue Edge Cases', () => {
    beforeEach(async () => {
      await webRTCConversationService.initialize();
    });

    it('should handle operation queue errors gracefully', async () => {
      const errorSpy = jest.fn();
      webRTCConversationService.on('error', errorSpy);

      // Mock an operation that throws an error
      const originalStartInternal = webRTCConversationService.startSessionInternal;
      webRTCConversationService.startSessionInternal = jest.fn().mockRejectedValue(
        new Error('Test operation error')
      );

      const result = await webRTCConversationService.startSession('test-scenario', 'beginner');

      expect(result).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith({
        type: 'session_start',
        error: expect.any(Error)
      });

      // Restore original method
      webRTCConversationService.startSessionInternal = originalStartInternal;
    });

    it('should clear operation queue on destroy', async () => {
      // Queue some operations
      const promises = [
        webRTCConversationService.startSession('scenario-1', 'beginner'),
        webRTCConversationService.stopSession(),
      ];

      // Destroy service before operations complete
      await webRTCConversationService.destroy();

      // Queue should be cleared
      expect(webRTCConversationService.operationQueue).toEqual([]);
      expect(webRTCConversationService.isProcessingQueue).toBe(false);

      // Wait for any pending promises to resolve/reject
      await Promise.allSettled(promises);
    });
  });
});
