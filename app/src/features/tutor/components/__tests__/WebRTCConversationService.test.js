import webRTCConversationService from '../../services/WebRTCConversationService';

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
    oniceconnectionstatechange: null,
    ontrack: null,
  })),
  RTCSessionDescription: jest.fn().mockImplementation((desc) => desc),
}));

describe('WebRTCConversationService', () => {
  beforeEach(() => {
    // Reset service state before each test
    webRTCConversationService.removeAllListeners();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // Clean up after each test
    await webRTCConversationService.stopSession();
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const result = await webRTCConversationService.initialize();
      expect(result).toBe(true);
    });

    it('should emit initialized event', async () => {
      const initSpy = jest.fn();
      webRTCConversationService.on('initialized', initSpy);
      
      await webRTCConversationService.initialize();
      
      expect(initSpy).toHaveBeenCalled();
    });

    it('should detect audio devices', async () => {
      const deviceChangeSpy = jest.fn();
      webRTCConversationService.on('audioDeviceChanged', deviceChangeSpy);
      
      await webRTCConversationService.initialize();
      
      expect(deviceChangeSpy).toHaveBeenCalledWith({
        device: 'bluetooth',
        available: true,
      });
    });
  });

  describe('Session Management', () => {
    beforeEach(async () => {
      await webRTCConversationService.initialize();
    });

    it('should start a session successfully', async () => {
      const sessionStartSpy = jest.fn();
      webRTCConversationService.on('sessionStarted', sessionStartSpy);
      
      const result = await webRTCConversationService.startSession('test-scenario', 'beginner');
      
      expect(result).toBe(true);
      expect(sessionStartSpy).toHaveBeenCalledWith({
        scenarioId: 'test-scenario',
        level: 'beginner',
      });
    });

    it('should stop existing session when starting new one', async () => {
      // Start first session
      await webRTCConversationService.startSession('scenario-1', 'beginner');
      expect(webRTCConversationService.getState().isSessionActive).toBe(true);
      
      // Start second session
      await webRTCConversationService.startSession('scenario-2', 'intermediate');
      
      const state = webRTCConversationService.getState();
      expect(state.currentScenario).toBe('scenario-2');
      expect(state.currentLevel).toBe('intermediate');
    });

    it('should change scenario without restarting service', async () => {
      await webRTCConversationService.startSession('scenario-1', 'beginner');
      
      const scenarioChangeSpy = jest.fn();
      webRTCConversationService.on('scenarioChanged', scenarioChangeSpy);
      
      await webRTCConversationService.changeScenario('scenario-2', 'intermediate');
      
      expect(scenarioChangeSpy).toHaveBeenCalledWith({
        scenarioId: 'scenario-2',
        level: 'intermediate',
      });
      
      const state = webRTCConversationService.getState();
      expect(state.currentScenario).toBe('scenario-2');
      expect(state.currentLevel).toBe('intermediate');
    });

    it('should stop session and reset state', async () => {
      await webRTCConversationService.startSession('test-scenario', 'beginner');
      
      const sessionStopSpy = jest.fn();
      webRTCConversationService.on('sessionStopped', sessionStopSpy);
      
      await webRTCConversationService.stopSession();
      
      expect(sessionStopSpy).toHaveBeenCalled();
      
      const state = webRTCConversationService.getState();
      expect(state.isSessionActive).toBe(false);
      expect(state.isConnected).toBe(false);
      expect(state.currentScenario).toBe(null);
    });
  });

  describe('State Management', () => {
    beforeEach(async () => {
      await webRTCConversationService.initialize();
    });

    it('should update state and emit events', () => {
      const stateChangeSpy = jest.fn();
      webRTCConversationService.on('stateChanged', stateChangeSpy);
      
      webRTCConversationService.updateState({ isRecording: true });
      
      expect(stateChangeSpy).toHaveBeenCalledWith({ isRecording: true });
      expect(webRTCConversationService.getState().isRecording).toBe(true);
    });

    it('should handle critical state updates immediately', () => {
      const stateChangeSpy = jest.fn();
      webRTCConversationService.on('stateChanged', stateChangeSpy);
      
      webRTCConversationService.updateState({ isAISpeaking: true });
      
      expect(stateChangeSpy).toHaveBeenCalledWith({ isAISpeaking: true });
      expect(webRTCConversationService.getState().isAISpeaking).toBe(true);
    });

    it('should return current state', () => {
      const state = webRTCConversationService.getState();
      
      expect(state).toHaveProperty('isConnected');
      expect(state).toHaveProperty('isSessionActive');
      expect(state).toHaveProperty('isRecording');
      expect(state).toHaveProperty('isAISpeaking');
      expect(state).toHaveProperty('audioOutputDevice');
      expect(state).toHaveProperty('currentScenario');
    });
  });

  describe('Message Handling', () => {
    beforeEach(async () => {
      await webRTCConversationService.initialize();
      await webRTCConversationService.startSession('test-scenario', 'beginner');
    });

    it('should handle incoming speech started message', () => {
      const speechStartSpy = jest.fn();
      webRTCConversationService.on('userSpeechStarted', speechStartSpy);
      
      webRTCConversationService.handleIncomingMessage({
        type: 'input_audio_buffer.speech_started',
      });
      
      expect(speechStartSpy).toHaveBeenCalled();
      expect(webRTCConversationService.getState().isRecording).toBe(true);
    });

    it('should handle incoming AI speech message', () => {
      const aiSpeechSpy = jest.fn();
      webRTCConversationService.on('aiSpeechStarted', aiSpeechSpy);
      
      webRTCConversationService.handleIncomingMessage({
        type: 'response.audio.delta',
        delta: 'audio-data',
      });
      
      expect(aiSpeechSpy).toHaveBeenCalled();
      expect(webRTCConversationService.getState().isAISpeaking).toBe(true);
    });

    it('should queue messages when AI is speaking', () => {
      // Set AI speaking state
      webRTCConversationService.updateState({ isAISpeaking: true });
      
      const message = { type: 'test_message' };
      webRTCConversationService.sendMessage(message);
      
      // Message should be queued, not sent immediately
      expect(webRTCConversationService.messageQueue).toContain(message);
    });
  });

  describe('Error Handling', () => {
    it('should handle initialization errors gracefully', async () => {
      // Mock audio setup to fail
      const { AudioModule } = require('expo-audio');
      AudioModule.setAudioModeAsync.mockRejectedValueOnce(new Error('Audio setup failed'));
      
      const errorSpy = jest.fn();
      webRTCConversationService.on('error', errorSpy);
      
      const result = await webRTCConversationService.initialize();
      
      expect(result).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith({
        type: 'initialization',
        error: expect.any(Error),
      });
    });

    it('should handle session start errors', async () => {
      await webRTCConversationService.initialize();
      
      // Mock peer connection creation to fail
      const { RTCPeerConnection } = require('react-native-webrtc');
      RTCPeerConnection.mockImplementationOnce(() => {
        throw new Error('Peer connection failed');
      });
      
      const errorSpy = jest.fn();
      webRTCConversationService.on('error', errorSpy);
      
      const result = await webRTCConversationService.startSession('test-scenario', 'beginner');
      
      expect(result).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith({
        type: 'session_start',
        error: expect.any(Error),
      });
    });
  });

  describe('Cleanup', () => {
    it('should clean up resources on destroy', async () => {
      await webRTCConversationService.initialize();
      await webRTCConversationService.startSession('test-scenario', 'beginner');
      
      await webRTCConversationService.destroy();
      
      const state = webRTCConversationService.getState();
      expect(state.isSessionActive).toBe(false);
      expect(state.isConnected).toBe(false);
    });
  });
});
