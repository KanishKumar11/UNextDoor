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

  // Transcription state (user transcript removed - only show AI responses)
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentAITranscript, setCurrentAITranscript] = useState("");
  const [isWaitingForTranscription, setIsWaitingForTranscription] = useState(false); // ✅ NEW: Track transcription loading

  // Session lifecycle state
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [canStartNewSession, setCanStartNewSession] = useState(true);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [isStoppingSession, setIsStoppingSession] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Track if service is initialized
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationRef = useRef(false);

  /**
   * Initialize the service
   */
  const initialize = useCallback(async () => {
    if (initializationRef.current) {
      console.log("🎯 Service already initialized - syncing state");
      // ✅ FIXED: Always sync state even if service is already initialized
      setIsInitialized(true);
      const state = webRTCConversationService.getState();
      updateStateFromService(state);
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
  }, [updateStateFromService]);

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
    setCurrentAITranscript(serviceState.currentAITranscript || "");

    // Session lifecycle state
    setIsCleaningUp(serviceState.isCleaningUp || false);
    setIsStartingSession(serviceState.isStartingSession || false);
    setIsStoppingSession(serviceState.isStoppingSession || false);
    setIsConnecting(serviceState.isConnecting || false);

    // Calculate canStartNewSession since it's no longer in service state to avoid circular calls
    const canStart = webRTCConversationService.canStartNewSession();
    setCanStartNewSession(canStart);
  }, []);

  /**
   * Start a conversation session
   */
  const startSession = useCallback(async (scenarioId, level = "beginner", user = null, isUserInitiated = true) => {
    try {
      setError(null);
      console.log(`🎯 Starting ${isUserInitiated ? 'user-initiated' : 'auto'} session from hook: ${scenarioId}, level: ${level}, user: ${user?.displayName || 'anonymous'}`);

      const success = await webRTCConversationService.startSession(scenarioId, level, user, isUserInitiated);

      if (success) {
        setCurrentScenario(scenarioId);
        setCurrentLevel(level);
      }

      return success;
    } catch (error) {
      console.error("🎯 Error starting session:", error);

      // ✅ CRITICAL FIX: Handle circuit breaker errors specifically
      if (error.message.includes('Circuit breaker OPEN')) {
        setError(new Error('Too many connection failures. Please wait a moment before trying again.'));
      } else {
        setError(error);
      }

      return false;
    }
  }, []);

  /**
   * ✅ CRITICAL FIX: Explicitly start user-initiated session (bypasses all blocking)
   */
  const startUserSession = useCallback(async (scenarioId, level = "beginner", user = null) => {
    console.log(`🎯 User explicitly starting new conversation: ${scenarioId}`);
    return startSession(scenarioId, level, user, true); // Always user-initiated
  }, [startSession]);

  /**
   * ✅ CRITICAL FIX: Reset service to clean state (for debugging and recovery)
   */
  const resetServiceState = useCallback(() => {
    console.log("🎯 Hook: Resetting service to clean state");
    webRTCConversationService.resetToCleanState();
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
  const changeScenario = useCallback(async (scenarioId, level = "beginner", user = null) => {
    try {
      setError(null);
      console.log(`🎯 Changing scenario from hook: ${scenarioId}, level: ${level}, user: ${user?.displayName || 'anonymous'}`);

      await webRTCConversationService.changeScenario(scenarioId, level, user);

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

    // State change handler - now receives full state from service
    const handleStateChanged = (fullState) => {
      console.log("🎯 Service state changed - updating UI with full state");
      console.log("🎯 Key state values:", {
        isSessionActive: fullState.isSessionActive,
        isConnected: fullState.isConnected,
        conversationHistoryLength: fullState.conversationHistory?.length || 0,
        isCleaningUp: fullState.isCleaningUp
      });
      updateStateFromService(fullState);
    };

    // Connection state handler - only update connection state, let service handle isConnected
    const handleConnectionStateChanged = (state) => {
      console.log("🎯 ICE connection state changed:", state);
      setConnectionState(state);
      // Don't override isConnected here - let the service state update handle it
      // This prevents conflicts between ICE state and service state
    };

    // WebRTC connection progression handlers
    const handleConnecting = () => {
      console.log("🎯 WebRTC connecting - updating UI state");
      setIsConnecting(true);
      setConnectionState('connecting');
    };

    const handleConnected = () => {
      console.log("🎯 WebRTC connected - updating UI state");
      setIsConnecting(false);
      setConnectionState('connected');
      // Let the service state update handle isConnected flag
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
      // Don't update individual state here - service updateState will handle it
      // This prevents conflicts and ensures consistency
      setError(null); // Clear any previous errors
    };

    const handleSessionStopped = () => {
      console.log("🎯 Session stopped");
      // Don't update individual state here - service updateState will handle it
      // This prevents conflicts and ensures consistency during cleanup
      setConnectionState('new'); // Reset connection state for next session
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
      setIsWaitingForTranscription(true); // ✅ NEW: Start waiting for transcription
    };

    const handleAISpeechEnded = () => {
      console.log("🎯 AI speech ended - updating hook state");
      // Only update local hook state, don't interfere with service logic
      setIsAISpeaking(false);
      // Keep waiting for transcription until we receive it
    };

    // Transcript event handlers - service now handles state updates, these are for additional UI logic
    // User transcript handlers removed - only show AI responses to users

    const handleAITranscriptDelta = ({ delta, transcript }) => {
      // Update current AI transcript for real-time display
      setCurrentAITranscript(transcript);
    };

    const handleAITranscriptComplete = (transcript) => {
      console.log("🎯 AI transcript complete:", transcript.text);
      setIsWaitingForTranscription(false); // ✅ NEW: Stop waiting for transcription
      // Don't update conversationHistory here - service updateState will handle it
      // Don't clear currentAITranscript here - service updateState will handle it
      // This prevents duplicate updates and ensures consistency
    };

    // Handle rate limits and audio buffer events
    const handleRateLimitsUpdated = (rateLimits) => {
      console.log("🎯 Rate limits updated:", rateLimits);
      // Could be used for UI warnings about rate limiting
    };

    const handleOutputAudioBufferStopped = () => {
      console.log("🎯 Output audio buffer stopped");
      // Could be used for UI state updates
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
      const state = webRTCConversationService.getState();
      updateStateFromService(state);
    };

    // Add event listeners
    webRTCConversationService.on('stateChanged', handleStateChanged);
    webRTCConversationService.on('connectionStateChanged', handleConnectionStateChanged);
    webRTCConversationService.on('connecting', handleConnecting); // ✅ NEW: Handle connecting state
    webRTCConversationService.on('connected', handleConnected);   // ✅ NEW: Handle connected state
    webRTCConversationService.on('audioDeviceChanged', handleAudioDeviceChanged);
    webRTCConversationService.on('sessionStarted', handleSessionStarted);
    webRTCConversationService.on('sessionStopped', handleSessionStopped);
    webRTCConversationService.on('scenarioChanged', handleScenarioChanged);
    webRTCConversationService.on('userSpeechStarted', handleUserSpeechStarted);
    webRTCConversationService.on('userSpeechStopped', handleUserSpeechStopped);
    webRTCConversationService.on('aiSpeechStarted', handleAISpeechStarted);
    webRTCConversationService.on('aiSpeechEnded', handleAISpeechEnded);
    // User transcript event listeners removed - only show AI responses
    webRTCConversationService.on('aiTranscriptDelta', handleAITranscriptDelta);
    webRTCConversationService.on('aiTranscriptComplete', handleAITranscriptComplete);
    webRTCConversationService.on('rateLimitsUpdated', handleRateLimitsUpdated);
    webRTCConversationService.on('outputAudioBufferStopped', handleOutputAudioBufferStopped);
    webRTCConversationService.on('error', handleError);
    webRTCConversationService.on('initialized', handleInitialized);

    // Cleanup function
    return () => {
      webRTCConversationService.off('stateChanged', handleStateChanged);
      webRTCConversationService.off('connectionStateChanged', handleConnectionStateChanged);
      webRTCConversationService.off('connecting', handleConnecting); // ✅ NEW: Cleanup connecting handler
      webRTCConversationService.off('connected', handleConnected);   // ✅ NEW: Cleanup connected handler
      webRTCConversationService.off('audioDeviceChanged', handleAudioDeviceChanged);
      webRTCConversationService.off('sessionStarted', handleSessionStarted);
      webRTCConversationService.off('sessionStopped', handleSessionStopped);
      webRTCConversationService.off('scenarioChanged', handleScenarioChanged);
      webRTCConversationService.off('userSpeechStarted', handleUserSpeechStarted);
      webRTCConversationService.off('userSpeechStopped', handleUserSpeechStopped);
      webRTCConversationService.off('aiSpeechEnded', handleAISpeechEnded);
      webRTCConversationService.off('aiSpeechStarted', handleAISpeechStarted);
      // User transcript event listeners removed
      webRTCConversationService.off('aiTranscriptDelta', handleAITranscriptDelta);
      webRTCConversationService.off('aiTranscriptComplete', handleAITranscriptComplete);
      webRTCConversationService.off('rateLimitsUpdated', handleRateLimitsUpdated);
      webRTCConversationService.off('outputAudioBufferStopped', handleOutputAudioBufferStopped);
      webRTCConversationService.off('error', handleError);
      webRTCConversationService.off('initialized', handleInitialized);
    };
  }, []); // ✅ FIXED: Removed updateStateFromService dependency to prevent infinite re-registration loops

  // Auto-initialize on mount and ensure state synchronization
  useEffect(() => {
    const initializeAndSync = async () => {
      await initialize();

      // ✅ ADDITIONAL FIX: Force state synchronization after initialization
      // This ensures UI state is always in sync with service state
      const currentState = webRTCConversationService.getState();
      updateStateFromService(currentState);
      console.log("🎯 State synchronized on mount:", {
        isSessionActive: currentState.isSessionActive,
        isConnected: currentState.isConnected,
        conversationHistoryLength: currentState.conversationHistory?.length || 0
      });
    };

    initializeAndSync();
  }, [initialize]);

  // ✅ CRITICAL FIX: Separate effect for state synchronization to prevent dependency loops
  useEffect(() => {
    const syncState = () => {
      const currentState = webRTCConversationService.getState();
      const prevState = {
        isSessionActive: isSessionActive,
        isConnected: isConnected,
        conversationHistoryLength: conversationHistory?.length || 0
      };

      // Only log if state actually changed to prevent spam
      const hasChanged =
        prevState.isSessionActive !== currentState.isSessionActive ||
        prevState.isConnected !== currentState.isConnected ||
        prevState.conversationHistoryLength !== (currentState.conversationHistory?.length || 0);

      updateStateFromService(currentState);

      if (hasChanged) {
        console.log("🎯 State synchronized (changed):", {
          isSessionActive: currentState.isSessionActive,
          isConnected: currentState.isConnected,
          conversationHistoryLength: currentState.conversationHistory?.length || 0
        });
      }
    };

    // Sync state immediately on mount
    syncState();

    // ✅ CRITICAL FIX: Further reduced frequency to 10000ms to prevent auto-reconnection triggers
    const syncInterval = setInterval(syncState, 10000);

    return () => {
      clearInterval(syncInterval);
    };
  }, [updateStateFromService, isSessionActive, isConnected, conversationHistory]);

  /**
   * Stop session by user action (prevents auto-restart)
   */
  const stopSessionByUser = useCallback(async () => {
    try {
      setError(null);
      console.log("🎯 Stopping session by user action from hook");

      await webRTCConversationService.stopSessionByUser();

      // Update local state - but don't force AI speaking to false if audio is still playing
      setIsConnected(false);
      setIsSessionActive(false);
      // Only set isAISpeaking to false if the service confirms it's not speaking
      const serviceState = webRTCConversationService.getState();
      if (!serviceState.isAISpeaking) {
        setIsAISpeaking(false);
      }
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

      // Reset initialization flag so service can be reinitialized
      initializationRef.current = false;
      setIsInitialized(false);

      // Reset all local state with audio protection
      setIsConnected(false);
      setIsSessionActive(false);

      // Only reset isAISpeaking if service confirms AI is not speaking
      const serviceState = webRTCConversationService.getState();
      if (!serviceState.isAISpeaking) {
        setIsAISpeaking(false);
      } else {
        console.log("🎯 Preserving isAISpeaking state during cleanup - AI is still speaking");
      }

      setCurrentScenario(null);
      setCurrentLevel("beginner");
      setConnectionState('new');
      setError(null);
      setUserEndedSession(false);
      setAllowAutoRestart(true);
      setConversationHistory([]);
      // ✅ FIXED: Removed setCurrentUserTranscript - this state doesn't exist
      setCurrentAITranscript("");
      setIsWaitingForTranscription(false); // ✅ ADDED: Reset transcription loading state
      setIsInitialized(false);
      initializationRef.current = false;

      console.log("✅ All WebRTC data cleared and disconnected");

      // Auto-reinitialize after a short delay to allow for cleanup
      setTimeout(() => {
        if (!initializationRef.current) {
          console.log("🔄 Auto-reinitializing service after cleanup");
          initialize();
        }
      }, 500);

    } catch (error) {
      console.error("❌ Error clearing all data:", error);
      setError(error);
    }
  }, [initialize]);

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
    currentAITranscript,
    isWaitingForTranscription, // ✅ NEW: Export transcription loading state

    // Session lifecycle state
    isCleaningUp,
    canStartNewSession,
    isStartingSession,
    isStoppingSession,
    isConnecting, // ✅ FIXED: Export isConnecting state

    // Actions
    initialize,
    startSession,
    startUserSession, // ✅ CRITICAL FIX: Export explicit user session start
    stopSession,
    changeScenario,
    stopSessionByUser,
    resetSessionControlFlags,
    resetServiceState, // ✅ CRITICAL FIX: Export service state reset
    clearAllData,
    getServiceState, // ✅ CRITICAL FIX: Export service state getter

    // Computed state - fixed status logic
    isDisconnected: connectionState === 'disconnected' || connectionState === 'failed',
    isReady: isConnected && isSessionActive && !isConnecting && !isCleaningUp,
  };
};
