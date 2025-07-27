import { useState, useEffect, useCallback, useRef } from 'react';
import webRTCConversationService from '../services/WebRTCConversationService';

/**
 * React hook to interface with the persistent WebRTC Conversation Service
 * Provides a clean API for components to interact with the conversation service
 */
export const useWebRTCConversation = () => {
  // State from the service
  const [isConnected, setIsConnected] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [audioOutputDevice, setAudioOutputDevice] = useState("speaker");
  const [isBluetoothAvailable, setIsBluetoothAvailable] = useState(false);
  const [currentScenario, setCurrentScenario] = useState(null);
  const [currentLevel, setCurrentLevel] = useState("beginner");
  const [currentAudioLevel, setCurrentAudioLevel] = useState(0);
  const [connectionState, setConnectionState] = useState('new');
  const [error, setError] = useState(null);

  // Session control state
  const [userEndedSession, setUserEndedSession] = useState(false);
  const [allowAutoRestart, setAllowAutoRestart] = useState(true);

  // Transcription state
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentUserTranscript, setCurrentUserTranscript] = useState("");
  const [currentAITranscript, setCurrentAITranscript] = useState("");

  // Track if service is initialized
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationRef = useRef(false);

  /**
   * Initialize the service
   */
  const initialize = useCallback(async () => {
    if (initializationRef.current) {
      console.log("🎯 Service already initialized");
      return true;
    }

    try {
      console.log("🎯 Initializing WebRTC service from hook");
      const success = await webRTCConversationService.initialize();

      if (success) {
        initializationRef.current = true;
        setIsInitialized(true);

        // Sync initial state
        const state = webRTCConversationService.getState();
        updateStateFromService(state);
      }

      return success;
    } catch (error) {
      console.error("🎯 Error initializing service:", error);
      setError(error);
      return false;
    }
  }, []);

  /**
   * Update local state from service state
   */
  const updateStateFromService = useCallback((serviceState) => {
    setIsConnected(serviceState.isConnected);
    setIsSessionActive(serviceState.isSessionActive);
    setIsAISpeaking(serviceState.isAISpeaking);
    setAudioOutputDevice(serviceState.audioOutputDevice);
    setIsBluetoothAvailable(serviceState.isBluetoothAvailable);
    setCurrentScenario(serviceState.currentScenario);
    setCurrentLevel(serviceState.currentLevel);
    setCurrentAudioLevel(serviceState.currentAudioLevel);
    setUserEndedSession(serviceState.userEndedSession);
    setAllowAutoRestart(serviceState.allowAutoRestart);
    setConversationHistory(serviceState.conversationHistory || []);
    setCurrentUserTranscript(serviceState.currentUserTranscript || "");
    setCurrentAITranscript(serviceState.currentAITranscript || "");
  }, []);

  /**
   * Start a conversation session
   */
  const startSession = useCallback(async (scenarioId, level = "beginner") => {
    try {
      setError(null);
      console.log(`🎯 Starting session from hook: ${scenarioId}, level: ${level}`);

      const success = await webRTCConversationService.startSession(scenarioId, level);

      if (success) {
        setCurrentScenario(scenarioId);
        setCurrentLevel(level);
      }

      return success;
    } catch (error) {
      console.error("🎯 Error starting session:", error);
      setError(error);
      return false;
    }
  }, []);

  /**
   * Stop the current session
   */
  const stopSession = useCallback(async () => {
    try {
      setError(null);
      console.log("🎯 Stopping session from hook");

      await webRTCConversationService.stopSession();

      // Reset local state
      setIsConnected(false);
      setIsSessionActive(false);
      setIsAISpeaking(false);
      setCurrentScenario(null);
      setCurrentLevel("beginner");
      setConnectionState('new');

    } catch (error) {
      console.error("🎯 Error stopping session:", error);
      setError(error);
    }
  }, []);

  /**
   * Change scenario without restarting the service
   */
  const changeScenario = useCallback(async (scenarioId, level = "beginner") => {
    try {
      setError(null);
      console.log(`🎯 Changing scenario from hook: ${scenarioId}, level: ${level}`);

      await webRTCConversationService.changeScenario(scenarioId, level);

      setCurrentScenario(scenarioId);
      setCurrentLevel(level);

    } catch (error) {
      console.error("🎯 Error changing scenario:", error);
      setError(error);
    }
  }, []);



  /**
   * Get current service state
   */
  const getServiceState = useCallback(() => {
    return webRTCConversationService.getState();
  }, []);

  /**
   * Set up event listeners
   */
  useEffect(() => {
    const service = webRTCConversationService;

    // State change handler
    const handleStateChanged = (newState) => {
      console.log("🎯 Service state changed:", newState);
      const fullState = service.getState();
      updateStateFromService(fullState);
    };

    // Connection state handler
    const handleConnectionStateChanged = (state) => {
      console.log("🎯 Connection state changed:", state);
      setConnectionState(state);
      setIsConnected(state === 'connected');
    };

    // Audio device change handler
    const handleAudioDeviceChanged = ({ device, available }) => {
      console.log("🎯 Audio device changed:", device, available);
      setAudioOutputDevice(device);
      setIsBluetoothAvailable(available);
    };

    // Session event handlers
    const handleSessionStarted = ({ scenarioId, level }) => {
      console.log("🎯 Session started:", scenarioId, level);
      setIsSessionActive(true);
      setCurrentScenario(scenarioId);
      setCurrentLevel(level);
    };

    const handleSessionStopped = () => {
      console.log("🎯 Session stopped");
      setIsSessionActive(false);
      setIsConnected(false);
      setIsAISpeaking(false);
      setCurrentScenario(null);
      setConnectionState('new');
    };

    const handleScenarioChanged = ({ scenarioId, level }) => {
      console.log("🎯 Scenario changed:", scenarioId, level);
      setCurrentScenario(scenarioId);
      setCurrentLevel(level);
    };

    // Speech event handlers (OpenAI handles detection automatically)
    const handleUserSpeechStarted = () => {
      console.log("🎯 User speech started (handled by OpenAI)");
    };

    const handleUserSpeechStopped = () => {
      console.log("🎯 User speech stopped (handled by OpenAI)");
    };

    const handleAISpeechStarted = () => {
      console.log("🎯 AI speech started");
      setIsAISpeaking(true);
    };

    const handleAISpeechEnded = () => {
      console.log("🎯 AI speech ended");
      setIsAISpeaking(false);
    };

    // Transcript event handlers
    const handleUserTranscriptComplete = (transcript) => {
      console.log("🎯 User transcript complete:", transcript);
      setConversationHistory(prev => [...prev, transcript]);
    };

    const handleAITranscriptDelta = ({ delta, transcript }) => {
      setCurrentAITranscript(transcript);
    };

    const handleAITranscriptComplete = (transcript) => {
      console.log("🎯 AI transcript complete:", transcript);
      setConversationHistory(prev => [...prev, transcript]);
      setCurrentAITranscript("");
    };

    // Error handler
    const handleError = (errorData) => {
      console.error("🎯 Service error:", errorData);
      setError(errorData);
    };

    // Initialization handler
    const handleInitialized = () => {
      console.log("🎯 Service initialized");
      setIsInitialized(true);
      const state = service.getState();
      updateStateFromService(state);
    };

    // Add event listeners
    service.on('stateChanged', handleStateChanged);
    service.on('connectionStateChanged', handleConnectionStateChanged);
    service.on('audioDeviceChanged', handleAudioDeviceChanged);
    service.on('sessionStarted', handleSessionStarted);
    service.on('sessionStopped', handleSessionStopped);
    service.on('scenarioChanged', handleScenarioChanged);
    service.on('userSpeechStarted', handleUserSpeechStarted);
    service.on('userSpeechStopped', handleUserSpeechStopped);
    service.on('aiSpeechStarted', handleAISpeechStarted);
    service.on('aiSpeechEnded', handleAISpeechEnded);
    service.on('userTranscriptComplete', handleUserTranscriptComplete);
    service.on('aiTranscriptDelta', handleAITranscriptDelta);
    service.on('aiTranscriptComplete', handleAITranscriptComplete);
    service.on('error', handleError);
    service.on('initialized', handleInitialized);

    // Cleanup function
    return () => {
      service.off('stateChanged', handleStateChanged);
      service.off('connectionStateChanged', handleConnectionStateChanged);
      service.off('audioDeviceChanged', handleAudioDeviceChanged);
      service.off('sessionStarted', handleSessionStarted);
      service.off('sessionStopped', handleSessionStopped);
      service.off('scenarioChanged', handleScenarioChanged);
      service.off('userSpeechStarted', handleUserSpeechStarted);
      service.off('userSpeechStopped', handleUserSpeechStopped);
      service.off('aiSpeechStarted', handleAISpeechStarted);
      service.off('aiSpeechEnded', handleAISpeechEnded);
      service.off('userTranscriptComplete', handleUserTranscriptComplete);
      service.off('aiTranscriptDelta', handleAITranscriptDelta);
      service.off('aiTranscriptComplete', handleAITranscriptComplete);
      service.off('error', handleError);
      service.off('initialized', handleInitialized);
    };
  }, [updateStateFromService]);

  // Auto-initialize on mount
  useEffect(() => {
    if (!initializationRef.current) {
      initialize();
    }
  }, [initialize]);

  /**
   * Stop session by user action (prevents auto-restart)
   */
  const stopSessionByUser = useCallback(async () => {
    try {
      setError(null);
      console.log("🎯 Stopping session by user action from hook");

      await webRTCConversationService.stopSessionByUser();

      // Update local state
      setIsConnected(false);
      setIsSessionActive(false);
      setIsAISpeaking(false);
      setCurrentScenario(null);
      setCurrentLevel("beginner");
      setConnectionState('new');
      setUserEndedSession(true);
      setAllowAutoRestart(false);

    } catch (error) {
      console.error("🎯 Error stopping session by user:", error);
      setError(error);
    }
  }, []);

  /**
   * Reset session control flags (allow auto-restart again)
   */
  const resetSessionControlFlags = useCallback(() => {
    try {
      console.log("🎯 Resetting session control flags from hook");
      webRTCConversationService.resetSessionControlFlags();
      setUserEndedSession(false);
      setAllowAutoRestart(true);
    } catch (error) {
      console.error("🎯 Error resetting session control flags:", error);
    }
  }, []);

  /**
   * Clear all data and force disconnect
   */
  const clearAllData = useCallback(async () => {
    try {
      console.log("🧹 Clearing all WebRTC data and forcing disconnect");

      // Stop session first
      await webRTCConversationService.stopSession();

      // Force destroy the service to clean up all resources
      await webRTCConversationService.destroy();

      // Reset all local state
      setIsConnected(false);
      setIsSessionActive(false);
      setIsAISpeaking(false);
      setCurrentScenario(null);
      setCurrentLevel("beginner");
      setConnectionState('new');
      setError(null);
      setUserEndedSession(false);
      setAllowAutoRestart(true);
      setConversationHistory([]);
      setCurrentUserTranscript("");
      setCurrentAITranscript("");
      setIsInitialized(false);
      initializationRef.current = false;

      console.log("✅ All WebRTC data cleared and disconnected");
    } catch (error) {
      console.error("❌ Error clearing all data:", error);
      setError(error);
    }
  }, []);

  return {
    // State
    isInitialized,
    isConnected,
    isSessionActive,
    isAISpeaking,
    audioOutputDevice,
    isBluetoothAvailable,
    currentScenario,
    currentLevel,
    currentAudioLevel,
    connectionState,
    error,
    userEndedSession,
    allowAutoRestart,
    conversationHistory,
    currentUserTranscript,
    currentAITranscript,

    // Actions
    initialize,
    startSession,
    stopSession,
    changeScenario,
    getServiceState,
    stopSessionByUser,
    resetSessionControlFlags,
    clearAllData,

    // Computed state
    isConnecting: connectionState === 'connecting',
    isDisconnected: connectionState === 'disconnected' || connectionState === 'failed',
  };
};
