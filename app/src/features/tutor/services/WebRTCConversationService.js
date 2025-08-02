/**
 * Simple EventEmitter implementation for React Native
 */
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  off(event, listenerToRemove) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(listener => listener !== listenerToRemove);
  }

  emit(event, ...args) {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => {
      try {
        listener(...args);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  removeAllListeners(event) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }
}
import { AudioModule } from 'expo-audio';
import { mediaDevices, RTCPeerConnection, RTCSessionDescription } from 'react-native-webrtc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../../shared/config/api.js';
// Removed getScenarioPrompt import - now using enhanced prompts from backend

/**
 * Persistent WebRTC Conversation Service
 * Maintains WebRTC connection and conversation state independently of UI components
 */
class WebRTCConversationService extends EventEmitter {
  constructor() {
    super();

    // Connection state
    this.peerConnection = null;
    this.dataChannel = null;
    this.localStream = null;
    this.isConnected = false;
    this.isSessionActive = false;
    this.isAISpeaking = false;

    // Audio state
    this.audioOutputDevice = "speaker";
    this.isBluetoothAvailable = false;

    // Session configuration
    this.currentScenario = null;
    this.currentLevel = "beginner";
    this.currentUser = null; // Store user information for personalized conversations

    // Session control state
    this.userEndedSession = false; // Flag to prevent auto-restart when user explicitly ends
    this.allowAutoRestart = true; // Global flag to control automatic session restart
    this.userEndedSessionTimestamp = null; // ✅ CRITICAL FIX: Track when user ended session
    this.sessionManagementDisabled = false; // ✅ CRITICAL FIX: Completely disable session management

    // Timeout management
    this.aiResponseTimeout = null; // Track AI response trigger timeout

    // Transcription state
    this.currentUserTranscript = "";
    this.currentAITranscript = "";
    this.conversationHistory = []; // Array of {type: 'user'|'ai', text: string, timestamp: Date}

    // Note: Message queue removed - OpenAI handles conversation flow automatically

    // Debounced state management
    this.stateUpdateTimeout = null;

    // Note: Audio level detection removed - OpenAI handles VAD automatically

    // Rate limiting and cooldown
    this.lastConnectionAttempt = 0;
    this.connectionCooldown = 5000; // 5 seconds between connection attempts

    // Race condition protection with operation queue
    this.isStartingSession = false;
    this.isStoppingSession = false;
    this.isConnecting = false;
    this.operationQueue = [];
    this.isProcessingQueue = false;
    this.sessionId = null; // Unique session identifier for debugging

    // Connection stability management
    this.lastConnectionAttempt = 0;
    this.connectionCooldownMs = 2000; // 2 second cooldown between attempts
    this.dataChannelReadyTimeout = null;
    this.maxDataChannelWaitMs = 10000; // 10 second timeout for data channel
    this.signalingStateValidation = true;
    this.isRequestingToken = false; // Prevent multiple token requests

    // ✅ CRITICAL FIX: Circuit breaker pattern to prevent infinite loops
    this.circuitBreaker = {
      failureCount: 0,
      maxFailures: 3, // Max failures before circuit opens
      resetTimeout: 30000, // 30 seconds before trying again
      lastFailureTime: 0,
      state: 'CLOSED' // CLOSED, OPEN, HALF_OPEN
    };

    // ✅ CRITICAL FIX: Session debouncing to prevent rapid navigation triggers
    this.sessionDebounce = {
      lastSessionStart: 0,
      minInterval: 2000, // Minimum 2 seconds between session starts
      lastScenario: null
    };

    // Debug mode for enhanced logging
    this.debugMode = process.env.NODE_ENV === 'development' || false;
    this.connectionAttempts = 0;

    // Audio-only fallback mode
    this.isAudioOnlyMode = false;

    // Minimal audio state tracking for proper completion detection
    this.audioResponseState = {
      isAudioPlaying: false,
      lastResponseId: null,
      audioDataReceived: false,
      transcriptReceived: false
    };

    // ICE connection monitoring
    this.iceConnectionMonitor = {
      reconnectAttempts: 0,
      maxReconnectAttempts: 3,
      reconnectDelay: 2000,
      isReconnecting: false
    };

    console.log("🎯 WebRTCConversationService initialized");
  }

  /**
   * Debug logging helper
   */
  debugLog(message, data = null) {
    if (this.debugMode) {
      const sessionId = this.sessionId || 'unknown';
      console.log(`🐛 [${sessionId}] ${message}`, data || '');
    }
  }

  /**
   * Minimal audio state management for proper completion detection
   */
  setAudioPlaying(isPlaying, responseId = null) {
    const sessionId = this.sessionId || 'unknown';

    if (isPlaying) {
      console.log(`🎯 [${sessionId}] AI started speaking (response: ${responseId})`);
      this.audioResponseState.isAudioPlaying = true;
      this.audioResponseState.lastResponseId = responseId;
      this.audioResponseState.audioDataReceived = false;
      this.audioResponseState.transcriptReceived = false;
    } else {
      console.log(`🎯 [${sessionId}] AI finished speaking - clearing audio state`);
      this.audioResponseState.isAudioPlaying = false;
      // Reset state for next response
      this.audioResponseState.audioDataReceived = false;
      this.audioResponseState.transcriptReceived = false;
      this.audioResponseState.lastResponseId = null;
    }
  }

  /**
   * Check if we can safely mark audio as complete (legacy method)
   */
  canCompleteAudioResponse() {
    // Only complete if we have both audio data and transcript, or if we're in a timeout scenario
    return this.audioResponseState.audioDataReceived && this.audioResponseState.transcriptReceived;
  }



  /**
   * Validate that audio completion is legitimate (not premature)
   */
  validateAudioCompletion(source = 'unknown') {
    const sessionId = this.sessionId || 'unknown';

    if (!this.isAISpeaking) {
      console.log(`🎯 [${sessionId}] Audio completion validation: AI not speaking (source: ${source})`);
      return true; // Already completed
    }

    if (!this.audioResponseState.audioDataReceived) {
      console.warn(`🎯 [${sessionId}] ⚠️ Premature audio completion detected: No audio data received (source: ${source})`);
      return false;
    }

    console.log(`🎯 [${sessionId}] Audio completion validation passed (source: ${source})`);
    return true;
  }



  /**
   * Handle ICE connection disconnection with recovery
   */
  handleICEDisconnection() {
    const sessionId = this.sessionId || 'unknown';

    // Don't start multiple recovery attempts
    if (this.iceConnectionMonitor.isReconnecting) {
      console.log(`🎯 [${sessionId}] ICE recovery already in progress`);
      return;
    }

    // Check if we should attempt recovery
    if (this.iceConnectionMonitor.reconnectAttempts >= this.iceConnectionMonitor.maxReconnectAttempts) {
      console.error(`🎯 [${sessionId}] Max ICE reconnect attempts reached`);
      this.emit('error', {
        type: 'ice_connection_failed',
        error: new Error(`ICE connection lost after ${this.iceConnectionMonitor.maxReconnectAttempts} attempts`)
      });
      return;
    }

    this.iceConnectionMonitor.isReconnecting = true;
    this.iceConnectionMonitor.reconnectAttempts++;

    console.log(`🎯 [${sessionId}] Attempting ICE recovery (attempt ${this.iceConnectionMonitor.reconnectAttempts}/${this.iceConnectionMonitor.maxReconnectAttempts})`);

    // Wait a bit for potential automatic recovery
    setTimeout(() => {
      if (this.peerConnection &&
        (this.peerConnection.iceConnectionState === 'connected' ||
          this.peerConnection.iceConnectionState === 'completed')) {
        console.log(`🎯 [${sessionId}] ICE connection recovered automatically`);
        this.iceConnectionMonitor.isReconnecting = false;
      } else {
        console.log(`🎯 [${sessionId}] ICE connection did not recover, continuing to monitor`);
        this.iceConnectionMonitor.isReconnecting = false;
      }
    }, this.iceConnectionMonitor.reconnectDelay);
  }

  /**
   * Comprehensive WebRTC state debugging
   */
  debugWebRTCState(context = '') {
    const sessionId = this.sessionId || 'unknown';
    console.log(`🔍 [${sessionId}] WebRTC State Debug ${context}:`);
    console.log(`   Peer Connection State: ${this.peerConnection?.connectionState || 'null'}`);
    console.log(`   ICE Connection State: ${this.peerConnection?.iceConnectionState || 'null'}`);
    console.log(`   Signaling State: ${this.peerConnection?.signalingState || 'null'}`);
    console.log(`   Data Channel State: ${this.dataChannel?.readyState || 'null'}`);
    console.log(`   Data Channel ID: ${this.dataChannel?.id || 'null'}`);
    console.log(`   Data Channel Label: ${this.dataChannel?.label || 'null'}`);
    console.log(`   Data Channel Protocol: ${this.dataChannel?.protocol || 'null'}`);
    console.log(`   Is Connected: ${this.isConnected}`);
    console.log(`   Is Session Active: ${this.isSessionActive}`);

    if (this.peerConnection) {
      console.log(`   Local Description: ${this.peerConnection.localDescription ? 'present' : 'null'}`);
      console.log(`   Remote Description: ${this.peerConnection.remoteDescription ? 'present' : 'null'}`);
    }
  }

  /**
   * Analyze SDP for data channel negotiation debugging
   */
  analyzeSDP(sdp, type) {
    const sessionId = this.sessionId || 'unknown';
    console.log(`🔍 [${sessionId}] SDP Analysis - ${type}:`);

    if (!sdp) {
      console.log(`   No SDP to analyze`);
      return;
    }

    // Check for data channel (SCTP) negotiation
    const hasDataChannel = sdp.includes('m=application') && sdp.includes('DTLS/SCTP');
    const hasSCTP = sdp.includes('sctp-port') || sdp.includes('webrtc-datachannel');
    const hasBundle = sdp.includes('a=group:BUNDLE');

    console.log(`   Has Data Channel (m=application): ${hasDataChannel}`);
    console.log(`   Has SCTP: ${hasSCTP}`);
    console.log(`   Has Bundle: ${hasBundle}`);

    // Extract data channel specific lines
    const lines = sdp.split('\n');
    const dataChannelLines = lines.filter(line =>
      line.includes('m=application') ||
      line.includes('sctp-port') ||
      line.includes('webrtc-datachannel') ||
      line.includes('a=sctpmap')
    );

    if (dataChannelLines.length > 0) {
      console.log(`   Data Channel SDP Lines:`);
      dataChannelLines.forEach(line => {
        console.log(`     ${line.trim()}`);
      });
    } else {
      console.warn(`   ⚠️  NO DATA CHANNEL LINES FOUND IN SDP`);
    }

    // Check for common issues
    if (type === 'Local Offer' && !hasDataChannel) {
      console.error(`   ❌ CRITICAL: Local offer missing data channel - this will cause connection failure`);
    }

    if (type === 'Remote Answer' && !hasDataChannel) {
      console.error(`   ❌ CRITICAL: Remote answer missing data channel - OpenAI doesn't support data channels`);
    }
  }

  /**
   * Initialize the service and set up audio
   */
  async initialize() {
    try {
      console.log("🎯 Initializing WebRTC Conversation Service");

      // ✅ CRITICAL FIX: Reset service to completely clean state on initialization
      this.resetToCleanState();

      // Set up audio mode for earphone compatibility
      await this.setupAudioMode();

      // Detect available audio devices
      await this.detectAudioDevices();

      this.emit('initialized');
      return true;
    } catch (error) {
      console.error("🎯 Error initializing WebRTC service:", error);
      this.emit('error', { type: 'initialization', error });
      return false;
    }
  }

  /**
   * ✅ CRITICAL FIX: Circuit breaker methods to prevent infinite loops
   */
  checkCircuitBreaker() {
    const now = Date.now();

    // If circuit is open, check if we should reset it
    if (this.circuitBreaker.state === 'OPEN') {
      if (now - this.circuitBreaker.lastFailureTime >= this.circuitBreaker.resetTimeout) {
        console.log('🔄 Circuit breaker reset - allowing one attempt');
        this.circuitBreaker.state = 'HALF_OPEN';
        return true;
      }
      return false;
    }

    return true; // CLOSED or HALF_OPEN allows attempts
  }

  recordCircuitBreakerSuccess() {
    console.log('✅ Circuit breaker success - resetting failure count');
    this.circuitBreaker.failureCount = 0;
    this.circuitBreaker.state = 'CLOSED';
  }

  recordCircuitBreakerFailure() {
    this.circuitBreaker.failureCount++;
    this.circuitBreaker.lastFailureTime = Date.now();

    console.log(`❌ Circuit breaker failure ${this.circuitBreaker.failureCount}/${this.circuitBreaker.maxFailures}`);

    if (this.circuitBreaker.failureCount >= this.circuitBreaker.maxFailures) {
      this.circuitBreaker.state = 'OPEN';
      console.log(`🚫 Circuit breaker OPEN - blocking requests for ${this.circuitBreaker.resetTimeout / 1000} seconds`);
    }
  }

  /**
   * Add operation to queue for sequential processing
   */
  async queueOperation(operationType, operationFn) {
    return new Promise((resolve, reject) => {
      const operation = {
        type: operationType,
        fn: operationFn,
        resolve,
        reject,
        timestamp: Date.now()
      };

      this.operationQueue.push(operation);
      console.log(`🎯 Queued operation: ${operationType} (queue length: ${this.operationQueue.length})`);

      this.processQueue();
    });
  }

  /**
   * Process operation queue sequentially with validation
   */
  async processQueue() {
    if (this.isProcessingQueue || this.operationQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    console.log(`🎯 Processing operation queue (${this.operationQueue.length} operations)`);

    while (this.operationQueue.length > 0) {
      const operation = this.operationQueue.shift();

      try {
        // ✅ CRITICAL FIX: Validate operation before execution
        if (operation.type === 'startSession' && this.isStartingSession) {
          console.warn(`🎯 Skipping duplicate startSession operation`);
          operation.reject(new Error('Session start already in progress'));
          continue;
        }

        if (operation.type === 'stopSession' && this.isStoppingSession) {
          console.warn(`🎯 Skipping duplicate stopSession operation`);
          operation.resolve(); // Resolve as success since stop is already happening
          continue;
        }

        console.log(`🎯 Executing operation: ${operation.type}`);
        const result = await operation.fn();
        operation.resolve(result);
      } catch (error) {
        console.error(`🎯 Operation ${operation.type} failed:`, error);
        operation.reject(error);
      }
    }

    this.isProcessingQueue = false;
    console.log("🎯 Operation queue processing complete");
  }

  /**
   * Set up audio mode with minimal configuration to avoid earphone disconnection
   */
  async setupAudioMode() {
    try {
      console.log("🎧 Setting up minimal audio mode for earphone compatibility");

      // Use minimal audio configuration to avoid interfering with earphone connectivity
      await AudioModule.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        // Remove staysActiveInBackground and shouldDuckAndroid to prevent earphone issues
      });

      console.log("🎧 Minimal audio mode configured successfully");
    } catch (error) {
      console.error("🎧 Error setting up audio mode:", error);
      throw error;
    }
  }

  /**
   * Detect available audio devices (for UI purposes only)
   */
  async detectAudioDevices() {
    try {
      if (AudioModule && typeof AudioModule.getAvailableOutputsAsync === "function") {
        const outputs = await AudioModule.getAvailableOutputsAsync();
        console.log("🎧 Available audio outputs:", outputs);

        // Look for Bluetooth devices
        const bluetoothOutput = outputs.find(output =>
          output.type === 'bluetooth' ||
          (output.name && output.name.toLowerCase().includes('bluetooth')) ||
          (output.name && output.name.toLowerCase().includes('airpods')) ||
          (output.name && output.name.toLowerCase().includes('headset'))
        );

        if (bluetoothOutput) {
          console.log("🎧 Bluetooth device detected:", bluetoothOutput.name);
          this.isBluetoothAvailable = true;
          this.audioOutputDevice = "bluetooth";
          this.emit('audioDeviceChanged', { device: 'bluetooth', available: true });
          return;
        }

        // Look for wired headphones
        const headphoneOutput = outputs.find(output =>
          output.type === 'headphones' ||
          (output.name && output.name.toLowerCase().includes('headphone')) ||
          (output.name && output.name.toLowerCase().includes('wired'))
        );

        if (headphoneOutput) {
          console.log("🎧 Wired headphones detected:", headphoneOutput.name);
          this.audioOutputDevice = "headphones";
          this.emit('audioDeviceChanged', { device: 'headphones', available: true });
          return;
        }
      }

      // Fallback to speaker
      console.log("🎧 Using speaker as audio output");
      this.isBluetoothAvailable = false;
      this.audioOutputDevice = "speaker";
      this.emit('audioDeviceChanged', { device: 'speaker', available: false });

    } catch (error) {
      console.error("🎧 Error detecting audio devices:", error);
      this.audioOutputDevice = "speaker";
      this.emit('audioDeviceChanged', { device: 'speaker', available: false });
    }
  }

  /**
   * Start a conversation session with race condition protection
   */
  async startSession(scenarioId, level = "beginner", user = null, isUserInitiated = true, lessonDetails = null) {
    // Use operation queue to prevent race conditions
    return this.queueOperation('startSession', async () => {
      return this.startSessionInternal(scenarioId, level, user, isUserInitiated, lessonDetails);
    });
  }

  /**
   * Internal session start implementation
   */
  async startSessionInternal(scenarioId, level = "beginner", user = null, isUserInitiated = true, lessonDetails = null) {
    // ✅ CRITICAL FIX: Check circuit breaker before starting session
    if (!this.checkCircuitBreaker()) {
      const timeUntilReset = this.circuitBreaker.resetTimeout - (Date.now() - this.circuitBreaker.lastFailureTime);
      throw new Error(`Circuit breaker OPEN - too many failures. Try again in ${Math.ceil(timeUntilReset / 1000)} seconds`);
    }

    // ✅ CRITICAL FIX: Always reset session control flags when starting any session
    console.log(`🎯 Starting ${isUserInitiated ? 'user-initiated' : 'auto'} session - resetting control flags BEFORE validation`);
    this.resetSessionControlFlags();

    // ✅ CRITICAL FIX: Skip user intent validation for explicitly user-initiated sessions
    if (!isUserInitiated && this.userEndedSession && this.userEndedSessionTimestamp) {
      const timeSinceUserEnded = Date.now() - this.userEndedSessionTimestamp;
      const minUserIntentRespectTime = 5000; // 5 seconds minimum before allowing new session

      if (timeSinceUserEnded < minUserIntentRespectTime) {
        console.log(`🎯 Respecting user intent for auto-session - session ended ${timeSinceUserEnded}ms ago, waiting ${minUserIntentRespectTime - timeSinceUserEnded}ms more`);
        throw new Error('Session recently ended by user. Please wait a moment before starting a new conversation.');
      }
    }

    // ✅ CRITICAL FIX: Session debouncing to prevent rapid navigation triggers
    const now = Date.now();
    const timeSinceLastStart = now - this.sessionDebounce.lastSessionStart;

    if (timeSinceLastStart < this.sessionDebounce.minInterval &&
      this.sessionDebounce.lastScenario === scenarioId) {
      console.log(`🎯 Session debounced - too soon since last start (${timeSinceLastStart}ms < ${this.sessionDebounce.minInterval}ms)`);
      return true;
    }

    // ✅ CRITICAL FIX: Prevent multiple sessions for the same scenario
    if (this.isSessionActive && this.currentScenario === scenarioId) {
      console.log(`🎯 Session already active for scenario: ${scenarioId} - skipping duplicate start`);
      return true;
    }

    // Record session start for debouncing
    this.sessionDebounce.lastSessionStart = now;
    this.sessionDebounce.lastScenario = scenarioId;

    // ✅ CRITICAL FIX: Flags already reset at the beginning of method - no need to reset again

    // ✅ CRITICAL FIX: Validate session restart capability
    if (!this.canRestartSession() && this.isSessionActive) {
      console.log(`🎯 Session restart validation: stopping current session first`);
      await this.stopSessionInternal();
      // Wait for cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // ✅ CRITICAL FIX: If different scenario or no active session, proceed
    if (this.isSessionActive && this.currentScenario !== scenarioId) {
      console.log(`🎯 Switching from ${this.currentScenario} to ${scenarioId} - stopping current session`);
      await this.stopSessionInternal();
      // Wait for cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Generate unique session ID for debugging
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    console.log(`🎯 Starting session with ID: ${this.sessionId}`);

    // Check network connectivity before attempting connection
    await this.checkNetworkConnectivity();

    // Enforce connection cooldown to prevent rapid successive attempts
    const timeSinceLastAttempt = Date.now() - this.lastConnectionAttempt;
    if (timeSinceLastAttempt < this.connectionCooldownMs) {
      const waitTime = this.connectionCooldownMs - timeSinceLastAttempt;
      console.log(`🎯 [${this.sessionId}] Connection cooldown active, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastConnectionAttempt = Date.now();
    this.connectionAttempts++;
    this.isStartingSession = true;

    this.debugLog('Starting session attempt', {
      attempt: this.connectionAttempts,
      scenarioId,
      level,
      userId: user?.id
    });

    try {
      console.log(`🎯 [${this.sessionId}] Starting conversation session: ${scenarioId}, level: ${level}`);

      // Reset session control flags for explicit new session start
      // This allows new conversations even after user ended previous session
      console.log(`🎯 [${this.sessionId}] Resetting session control flags for new conversation`);
      this.userEndedSession = false;
      this.allowAutoRestart = true;

      // ✅ CRITICAL FIX: Removed redundant session active check - already handled at method start

      // Enhanced clean state validation with retry
      await this.validateCleanStateWithRetry();

      this.currentScenario = scenarioId;
      this.currentLevel = level;
      this.currentUser = user; // Store user information for personalized conversations
      this.currentLessonDetails = lessonDetails; // ✅ NEW: Store lesson details for token request
      this.sessionStartTime = Date.now(); // Track session start for persistence

      // ✅ CRITICAL FIX: Enhanced user context logging for debugging personalization
      console.log(`🎯 [${this.sessionId}] Session configured for user: ${user?.displayName || 'anonymous'} (${user?.id || 'no-id'})`);
      console.log(`🎯 [${this.sessionId}] User context details:`, {
        displayName: user?.displayName,
        firstName: user?.firstName,
        name: user?.name,
        id: user?.id,
        hasUserData: !!user
      });

      // Create peer connection
      await this.createPeerConnection();

      // Set up local media stream
      await this.setupLocalStream();

      // Connect to OpenAI Realtime API
      await this.connectToRealtimeAPI();

      this.isSessionActive = true;
      // isConnected should already be true from data channel opening
      if (!this.isConnected) {
        this.isConnected = true;
      }
      this.emit('connected'); // Emit connected state - now ready
      this.emit('sessionStarted', { scenarioId, level });

      console.log(`🎯 [${this.sessionId}] Session started successfully`);
      return true;
    } catch (error) {
      console.error(`🎯 [${this.sessionId}] Error starting session:`, error);

      // Ensure cleanup on failure
      try {
        await this.stopSessionInternal();
      } catch (cleanupError) {
        console.error(`🎯 [${this.sessionId}] Error during cleanup after failed start:`, cleanupError);
      }

      this.emit('error', { type: 'session_start', error });
      return false;
    } finally {
      this.isStartingSession = false;
    }
  }

  /**
   * Check network connectivity before attempting WebRTC connection
   */
  async checkNetworkConnectivity() {
    const sessionId = this.sessionId || 'unknown';

    try {
      console.log(`🎯 [${sessionId}] Checking network connectivity`);

      // Create timeout controller compatible with React Native
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 5000);

      try {
        // Test basic internet connectivity using a more reliable endpoint
        const response = await fetch('https://www.google.com/generate_204', {
          method: 'HEAD',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Google's generate_204 returns 204 No Content on success
        if (response.status === 204 || response.ok) {
          console.log(`🎯 [${sessionId}] Network connectivity confirmed`);
          return;
        } else {
          throw new Error(`Network check failed: ${response.status}`);
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);

        // If it's just a network check failure, don't fail the entire process
        if (fetchError.name === 'AbortError') {
          console.warn(`🎯 [${sessionId}] Network check timed out, but continuing`);
          return; // Continue anyway
        }

        throw fetchError;
      }

    } catch (error) {
      console.error(`🎯 [${sessionId}] Network connectivity check failed:`, error.message);

      // Try alternative connectivity check with manual timeout
      try {
        console.log(`🎯 [${sessionId}] Trying alternative connectivity check`);

        const altController = new AbortController();
        const altTimeoutId = setTimeout(() => {
          altController.abort();
        }, 3000);

        try {
          const altResponse = await fetch('https://www.google.com/favicon.ico', {
            method: 'HEAD',
            signal: altController.signal,
          });

          clearTimeout(altTimeoutId);

          if (altResponse.ok) {
            console.log(`🎯 [${sessionId}] Alternative network check succeeded`);
            return;
          }
        } catch (altFetchError) {
          clearTimeout(altTimeoutId);
          throw altFetchError;
        }

      } catch (altError) {
        console.warn(`🎯 [${sessionId}] Alternative network check also failed:`, altError.message);
      }

      // Don't throw error, just warn - we'll let WebRTC connection attempt proceed
      // as the network check might fail due to CORS or other issues while WebRTC still works
      console.warn(`🎯 [${sessionId}] Proceeding with WebRTC connection despite network check failures`);
    }
  }

  /**
   * Enhanced clean state validation with retry mechanism
   */
  async validateCleanStateWithRetry(maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const issues = await this.validateCleanState();

      if (issues.length === 0) {
        console.log(`🎯 [${this.sessionId}] Clean state validated successfully`);
        return;
      }

      console.warn(`🎯 [${this.sessionId}] Clean state validation attempt ${attempt}/${maxRetries}, issues:`, issues);

      if (attempt < maxRetries) {
        // Force cleanup and wait longer between retries
        await this.forceCleanup();
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      } else {
        console.error(`🎯 [${this.sessionId}] Failed to achieve clean state after ${maxRetries} attempts`);
        throw new Error(`Clean state validation failed: ${issues.join(', ')}`);
      }
    }
  }

  /**
   * Validate that the service is in a clean state before starting a new session
   */
  async validateCleanState() {
    const issues = [];

    // Check for active connections
    if (this.peerConnection && this.peerConnection.connectionState !== 'closed') {
      issues.push(`Peer connection state: ${this.peerConnection.connectionState}`);
    }

    if (this.dataChannel && this.dataChannel.readyState !== 'closed') {
      issues.push(`Data channel state: ${this.dataChannel.readyState}`);
    }

    if (this.isConnected) {
      issues.push('Service still marked as connected');
    }

    if (this.isSessionActive) {
      issues.push('Session still marked as active');
    }

    // Check for lingering streams
    if (this.localStream) {
      issues.push('Local stream still active');
    }

    if (this.remoteStream) {
      issues.push('Remote stream still active');
    }

    return issues;
  }

  /**
   * Force cleanup of all resources
   */
  async forceCleanup() {
    const currentSessionId = this.sessionId || 'unknown';
    console.log(`🎯 [${currentSessionId}] Forcing cleanup of all resources`);

    // Close peer connection
    if (this.peerConnection) {
      try {
        this.peerConnection.close();
      } catch (error) {
        console.warn(`🎯 [${currentSessionId}] Error closing peer connection:`, error);
      }
      this.peerConnection = null;
    }

    // Close data channel
    if (this.dataChannel) {
      try {
        this.dataChannel.close();
      } catch (error) {
        console.warn(`🎯 [${currentSessionId}] Error closing data channel:`, error);
      }
      this.dataChannel = null;
    }

    // Stop streams
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (error) {
          console.warn(`🎯 [${currentSessionId}] Error stopping track:`, error);
        }
      });
      this.localStream = null;
    }

    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (error) {
          console.warn(`🎯 [${currentSessionId}] Error stopping remote track:`, error);
        }
      });
      this.remoteStream = null;
    }

    // Reset state
    this.isConnected = false;
    this.isSessionActive = false;
    this.isAISpeaking = false;
    this.isConnecting = false;
    this.isRequestingToken = false;
    this.currentScenario = null;
    this.currentLevel = "beginner";
    this.currentUser = null;
    this.sessionId = null;

    // Clear timeouts
    if (this.dataChannelReadyTimeout) {
      clearTimeout(this.dataChannelReadyTimeout);
      this.dataChannelReadyTimeout = null;
    }
  }

  /**
   * Create WebRTC peer connection
   */
  async createPeerConnection() {
    try {
      const sessionId = this.sessionId || 'unknown';
      console.log(`🎯 [${sessionId}] Creating peer connection`);

      // Clean up existing connection with proper state checking
      if (this.peerConnection) {
        console.log(`🎯 [${sessionId}] Cleaning up existing peer connection (state: ${this.peerConnection.connectionState})`);
        try {
          if (this.peerConnection.connectionState !== 'closed') {
            this.peerConnection.close();
          }
        } catch (error) {
          console.warn(`🎯 [${sessionId}] Error closing existing peer connection:`, error);
        }
        // Wait for connection to fully close
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      this.peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });

      console.log(`🎯 [${sessionId}] Peer connection created with signaling state: ${this.peerConnection.signalingState}`);

      // Set up event handlers with enhanced logging and null checks
      this.peerConnection.oniceconnectionstatechange = () => {
        if (this.peerConnection) {
          const iceState = this.peerConnection.iceConnectionState;
          console.log(`🎯 [${sessionId}] ICE connection state: ${iceState}`);
          this.emit('connectionStateChanged', iceState);

          // Handle different ICE states
          if (iceState === 'connected' || iceState === 'completed') {
            console.log(`🎯 [${sessionId}] ICE connection established successfully`);
            // Reset reconnect attempts on successful connection
            this.iceConnectionMonitor.reconnectAttempts = 0;
            this.iceConnectionMonitor.isReconnecting = false;
          } else if (iceState === 'disconnected') {
            console.warn(`🎯 [${sessionId}] ICE connection temporarily disconnected - monitoring for recovery`);
            // Don't immediately error - ICE can recover from disconnected state
            // Only start recovery if we haven't already
            if (!this.iceConnectionMonitor.isReconnecting) {
              this.handleICEDisconnection();
            }
          } else if (iceState === 'failed') {
            console.error(`🎯 [${sessionId}] ICE connection failed permanently`);
            this.emit('error', {
              type: 'ice_connection_failed',
              error: new Error(`ICE connection failed`)
            });
          }
        }
      };

      this.peerConnection.onsignalingstatechange = () => {
        if (this.peerConnection) {
          const signalingState = this.peerConnection.signalingState;
          console.log(`🎯 [${sessionId}] Signaling state changed: ${signalingState}`);
        }
      };

      this.peerConnection.onconnectionstatechange = () => {
        if (this.peerConnection) {
          const connectionState = this.peerConnection.connectionState;
          console.log(`🎯 [${sessionId}] Connection state changed: ${connectionState}`);

          if (connectionState === 'failed') {
            console.error(`🎯 [${sessionId}] Peer connection failed`);
            this.emit('error', {
              type: 'peer_connection_failed',
              error: new Error('Peer connection failed')
            });
          } else if (connectionState === 'connected') {
            console.log(`🎯 [${sessionId}] Peer connection established successfully`);
          }
        }
      };

      this.peerConnection.ontrack = (event) => {
        console.log(`🎯 [${sessionId}] Received remote track`);
        this.emit('remoteTrackReceived', event.streams[0]);
      };

      console.log(`🎯 [${sessionId}] Peer connection created successfully`);

      // INDUSTRY STANDARD: Create data channel BEFORE creating offer
      // This ensures data channel is included in SDP negotiation
      console.log(`🎯 [${sessionId}] Creating data channel before SDP offer (industry standard)`);
      await this.createDataChannelBeforeOffer();

    } catch (error) {
      const sessionId = this.sessionId || 'unknown';
      console.error(`🎯 [${sessionId}] Error creating peer connection:`, error);
      throw error;
    }
  }

  /**
   * Create data channel after WebRTC connection is established
   */
  async createDataChannel() {
    const sessionId = this.sessionId || 'unknown';

    if (!this.peerConnection) {
      throw new Error('Peer connection not available for data channel creation');
    }

    // Check if existing data channel is actually usable
    if (this.dataChannel) {
      const currentState = this.dataChannel.readyState;
      console.log(`🎯 [${sessionId}] Existing data channel found in state: ${currentState}`);

      if (currentState === 'open') {
        console.log(`🎯 [${sessionId}] Data channel already open and usable`);
        return;
      } else if (currentState === 'connecting') {
        console.warn(`🎯 [${sessionId}] Data channel stuck in connecting state, cleaning up`);
        await this.cleanupStuckDataChannel();
      } else {
        console.warn(`🎯 [${sessionId}] Data channel in unusable state (${currentState}), cleaning up`);
        await this.cleanupStuckDataChannel();
      }
    }

    try {
      console.log(`🎯 [${sessionId}] Creating data channel after connection establishment`);
      console.log(`🎯 [${sessionId}] Current connection state: ${this.peerConnection.connectionState}`);
      console.log(`🎯 [${sessionId}] Current ICE state: ${this.peerConnection.iceConnectionState}`);

      // Wait for ICE connection to be established before creating data channel
      await this.waitForICEConnection();

      // Create data channel for communication with OpenAI
      this.dataChannel = this.peerConnection.createDataChannel('oai-events', {
        ordered: true,
      });

      console.log(`🎯 [${sessionId}] Data channel created (initial state: ${this.dataChannel.readyState}), setting up handlers`);

      // Set up data channel handlers with timeout
      await this.setupDataChannelHandlers();

      console.log(`🎯 [${sessionId}] Data channel setup completed (final state: ${this.dataChannel?.readyState || 'null'})`);

    } catch (error) {
      console.error(`🎯 [${sessionId}] Error creating data channel:`, error);
      throw error;
    }
  }

  /**
   * Clean up data channel that's stuck in connecting state
   */
  async cleanupStuckDataChannel() {
    const sessionId = this.sessionId || 'unknown';

    if (!this.dataChannel) {
      return;
    }

    try {
      console.log(`🎯 [${sessionId}] Cleaning up stuck data channel (state: ${this.dataChannel.readyState})`);

      // Clear any existing timeout
      if (this.dataChannelReadyTimeout) {
        clearTimeout(this.dataChannelReadyTimeout);
        this.dataChannelReadyTimeout = null;
      }

      // Close the stuck data channel
      if (this.dataChannel.readyState !== 'closed') {
        this.dataChannel.close();
      }

      // Wait a moment for cleanup
      await new Promise(resolve => setTimeout(resolve, 100));

      // Remove reference
      this.dataChannel = null;

      console.log(`🎯 [${sessionId}] Stuck data channel cleaned up successfully`);

    } catch (error) {
      console.error(`🎯 [${sessionId}] Error cleaning up stuck data channel:`, error);
      // Force remove reference even if cleanup failed
      this.dataChannel = null;
    }
  }

  /**
   * Wait for ICE connection to be established
   */
  async waitForICEConnection(timeoutMs = 15000) {
    const sessionId = this.sessionId || 'unknown';

    return new Promise((resolve, reject) => {
      if (!this.peerConnection) {
        reject(new Error('Peer connection not available'));
        return;
      }

      const currentState = this.peerConnection.iceConnectionState;
      console.log(`🎯 [${sessionId}] Waiting for ICE connection, current state: ${currentState}`);

      // If already connected, resolve immediately
      if (currentState === 'connected' || currentState === 'completed') {
        console.log(`🎯 [${sessionId}] ICE connection already established`);
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        console.error(`🎯 [${sessionId}] ICE connection timeout after ${timeoutMs}ms`);
        console.error(`🎯 [${sessionId}] Final ICE state: ${this.peerConnection?.iceConnectionState || 'null'}`);
        reject(new Error('ICE connection timeout'));
      }, timeoutMs);

      const handleICEStateChange = () => {
        if (!this.peerConnection) {
          clearTimeout(timeout);
          reject(new Error('Peer connection lost during ICE wait'));
          return;
        }

        const iceState = this.peerConnection.iceConnectionState;
        console.log(`🎯 [${sessionId}] ICE state during wait: ${iceState}`);

        if (iceState === 'connected' || iceState === 'completed') {
          clearTimeout(timeout);
          this.peerConnection.removeEventListener('iceconnectionstatechange', handleICEStateChange);
          console.log(`🎯 [${sessionId}] ICE connection established successfully`);
          resolve();
        } else if (iceState === 'failed' || iceState === 'disconnected') {
          clearTimeout(timeout);
          this.peerConnection.removeEventListener('iceconnectionstatechange', handleICEStateChange);
          reject(new Error(`ICE connection failed: ${iceState}`));
        }
      };

      this.peerConnection.addEventListener('iceconnectionstatechange', handleICEStateChange);
    });
  }

  /**
   * ✅ CRITICAL FIX: Simplified data channel creation with single reliable approach
   */
  async createDataChannelWithFallback() {
    const sessionId = this.sessionId || 'unknown';

    try {
      console.log(`🎯 [${sessionId}] Creating data channel with simplified approach`);

      // Use the standard approach that works most reliably
      await this.createStandardDataChannel();

      console.log(`🎯 [${sessionId}] Data channel created successfully`);
      return;

    } catch (error) {
      console.error(`🎯 [${sessionId}] Data channel creation failed:`, error.message);

      // ✅ CRITICAL FIX: Record circuit breaker failure for data channel issues
      this.recordCircuitBreakerFailure();

      // Try audio-only fallback instead of multiple data channel attempts
      console.log(`🎯 [${sessionId}] Attempting audio-only fallback`);
      await this.enableAudioOnlyFallback();
    }
  }

  /**
   * Create data channel immediately without waiting for ICE
   */
  async createDataChannelImmediate() {
    const sessionId = this.sessionId || 'unknown';

    if (!this.peerConnection) {
      throw new Error('Peer connection not available');
    }

    // Check existing data channel state and clean up if necessary
    if (this.dataChannel) {
      const currentState = this.dataChannel.readyState;
      console.log(`🎯 [${sessionId}] Existing data channel found in immediate creation (state: ${currentState})`);

      if (currentState === 'open') {
        console.log(`🎯 [${sessionId}] Data channel already open in immediate creation`);
        return;
      } else {
        console.log(`🎯 [${sessionId}] Cleaning up existing data channel in state: ${currentState}`);
        await this.cleanupStuckDataChannel();
      }
    }

    console.log(`🎯 [${sessionId}] Creating data channel immediately`);

    // Create data channel for communication with OpenAI
    this.dataChannel = this.peerConnection.createDataChannel('oai-events', {
      ordered: true,
    });

    console.log(`🎯 [${sessionId}] Data channel created, setting up handlers with reduced timeout`);

    // Use shorter timeout for immediate creation
    const originalTimeout = this.maxDataChannelWaitMs;
    this.maxDataChannelWaitMs = 5000; // 5 second timeout

    try {
      await this.setupDataChannelHandlers();
    } finally {
      this.maxDataChannelWaitMs = originalTimeout; // Restore original timeout
    }
  }

  /**
   * Recreate peer connection and data channel as last resort
   */
  async recreatePeerConnectionAndDataChannel() {
    const sessionId = this.sessionId || 'unknown';
    console.log(`🎯 [${sessionId}] Recreating peer connection for data channel`);

    // This is a more drastic measure - we'll just try immediate creation
    // without recreating the entire connection since that would break the WebRTC negotiation
    await this.createDataChannelImmediate();
  }

  /**
   * INDUSTRY STANDARD: Create data channel before SDP offer
   * This ensures the data channel is properly negotiated in the SDP exchange
   */
  async createDataChannelBeforeOffer() {
    const sessionId = this.sessionId || 'unknown';

    if (!this.peerConnection) {
      throw new Error('Peer connection not available for data channel creation');
    }

    console.log(`🎯 [${sessionId}] Creating data channel before offer (standard WebRTC pattern)`);
    this.debugWebRTCState('before standard data channel creation');

    // Clean up any existing data channel
    if (this.dataChannel) {
      console.log(`🎯 [${sessionId}] Cleaning up existing data channel before creating new one`);
      this.dataChannel.close();
      this.dataChannel = null;
    }

    // Create data channel with standard configuration
    this.dataChannel = this.peerConnection.createDataChannel('oai-events', {
      ordered: true,
      // Standard WebRTC data channel options
    });

    console.log(`🎯 [${sessionId}] Data channel created before offer, initial state: ${this.dataChannel.readyState}`);

    // Set up event handlers immediately (industry standard pattern)
    this.setupStandardDataChannelHandlers();

    console.log(`🎯 [${sessionId}] Standard data channel setup complete, ready for SDP negotiation`);
  }

  /**
   * Set up standard data channel event handlers
   */
  setupStandardDataChannelHandlers() {
    const sessionId = this.sessionId || 'unknown';

    if (!this.dataChannel) {
      console.error(`🎯 [${sessionId}] Cannot set up handlers - no data channel`);
      return;
    }

    console.log(`🎯 [${sessionId}] Setting up standard data channel event handlers`);

    this.dataChannel.onopen = () => {
      console.log(`🎯 [${sessionId}] ✅ DATA CHANNEL OPENED (standard pattern)`);
      console.log(`🎯 [${sessionId}] Data channel state: ${this.dataChannel.readyState}`);
      this.debugWebRTCState('after data channel opened');
      this.emit('dataChannelOpened');
    };

    this.dataChannel.onclose = () => {
      console.log(`🎯 [${sessionId}] Data channel closed`);
      this.emit('dataChannelClosed');
    };

    this.dataChannel.onerror = (error) => {
      console.error(`🎯 [${sessionId}] Data channel error:`, error);
      this.emit('error', { type: 'data_channel', error });
    };

    this.dataChannel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleIncomingMessage(message);
      } catch (error) {
        console.error(`🎯 [${sessionId}] Error parsing data channel message:`, error);
      }
    };

    console.log(`🎯 [${sessionId}] Standard data channel handlers configured`);
  }

  /**
   * Wait for standard data channel to open (industry standard pattern)
   */
  async waitForStandardDataChannelOpen() {
    const sessionId = this.sessionId || 'unknown';

    return new Promise((resolve, reject) => {
      // Check if already open
      if (this.dataChannel && this.dataChannel.readyState === 'open') {
        console.log(`🎯 [${sessionId}] Data channel already open`);
        resolve();
        return;
      }

      if (!this.dataChannel) {
        reject(new Error('No data channel exists to wait for'));
        return;
      }

      console.log(`🎯 [${sessionId}] Waiting for data channel to open, current state: ${this.dataChannel.readyState}`);

      const timeout = setTimeout(() => {
        const finalState = this.dataChannel?.readyState || 'null';
        console.error(`🎯 [${sessionId}] Standard data channel open timeout - final state: ${finalState}`);
        this.debugWebRTCState('after data channel timeout');
        reject(new Error(`Standard data channel open timeout - state: ${finalState}`));
      }, 15000); // 15 second timeout for standard approach

      // Listen for the open event
      const originalOnOpen = this.dataChannel.onopen;
      this.dataChannel.onopen = () => {
        clearTimeout(timeout);
        console.log(`🎯 [${sessionId}] ✅ Standard data channel opened successfully`);

        // Call original handler
        if (originalOnOpen) {
          originalOnOpen();
        }

        resolve();
      };

      // Also monitor state changes as backup
      let pollCount = 0;
      const pollForOpen = () => {
        pollCount++;
        const currentState = this.dataChannel?.readyState;

        if (currentState === 'open') {
          clearTimeout(timeout);
          console.log(`🎯 [${sessionId}] ✅ Data channel opened via polling (backup detection)`);
          resolve();
          return;
        }

        if (currentState === 'closed' || currentState === 'closing') {
          clearTimeout(timeout);
          reject(new Error(`Data channel ${currentState} while waiting`));
          return;
        }

        if (pollCount < 75) { // 15 seconds of polling
          setTimeout(pollForOpen, 200);
        }
      };

      // Start backup polling
      setTimeout(pollForOpen, 1000); // Start after 1 second
    });
  }

  /**
   * Enable audio-only fallback when data channel fails
   */
  async enableAudioOnlyFallback() {
    const sessionId = this.sessionId || 'unknown';

    console.log(`🎯 [${sessionId}] Enabling audio-only fallback mode`);

    // Mark as audio-only mode
    this.isAudioOnlyMode = true;

    // Clean up failed data channel
    if (this.dataChannel) {
      try {
        this.dataChannel.close();
      } catch (error) {
        console.warn(`🎯 [${sessionId}] Error closing failed data channel:`, error);
      }
      this.dataChannel = null;
    }

    // Emit event to notify UI of audio-only mode
    this.emit('audioOnlyMode', { reason: 'data_channel_failed' });

    console.log(`🎯 [${sessionId}] ✅ Audio-only fallback enabled - conversation can proceed with audio only`);
  }

  /**
   * Send message with fallback handling
   */
  sendMessage(message) {
    const sessionId = this.sessionId || 'unknown';

    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      // Normal data channel communication
      try {
        this.dataChannel.send(JSON.stringify(message));
        console.log(`🎯 [${sessionId}] Sent message via data channel:`, message.type);
      } catch (error) {
        console.error(`🎯 [${sessionId}] Error sending via data channel:`, error);
        this.handleDataChannelSendError(message, error);
      }
    } else if (this.isAudioOnlyMode) {
      // Audio-only mode - log the message but don't send
      console.log(`🎯 [${sessionId}] Audio-only mode: would send message:`, message.type);
      // In audio-only mode, we rely purely on audio communication
      // Some messages like session.update might not be critical
    } else {
      console.warn(`🎯 [${sessionId}] Cannot send message - no data channel and not in audio-only mode`);
    }
  }

  /**
   * Handle data channel send errors
   */
  handleDataChannelSendError(message, error) {
    const sessionId = this.sessionId || 'unknown';

    console.error(`🎯 [${sessionId}] Data channel send error for message ${message.type}:`, error);

    // If data channel fails during conversation, switch to audio-only
    if (!this.isAudioOnlyMode) {
      console.log(`🎯 [${sessionId}] Switching to audio-only mode due to data channel send failure`);
      this.enableAudioOnlyFallback();
    }
  }

  /**
   * Create data channel early in the process (before WebRTC negotiation)
   */
  async createEarlyDataChannel() {
    const sessionId = this.sessionId || 'unknown';

    if (!this.peerConnection) {
      throw new Error('Peer connection not available for early data channel creation');
    }

    console.log(`🎯 [${sessionId}] Creating early data channel`);
    this.debugWebRTCState('before early data channel creation');

    // Create data channel before negotiation
    this.dataChannel = this.peerConnection.createDataChannel('oai-events', {
      ordered: true,
    });

    console.log(`🎯 [${sessionId}] Early data channel created with state: ${this.dataChannel.readyState}`);

    // Set up basic handlers but don't wait for open state yet
    this.dataChannel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleIncomingMessage(message);
      } catch (error) {
        console.error(`🎯 [${sessionId}] Error parsing early data channel message:`, error);
      }
    };

    this.dataChannel.onerror = (error) => {
      console.error(`🎯 [${sessionId}] Early data channel error:`, error);
    };

    // Don't wait for open state here - that will happen after negotiation
    console.log(`🎯 [${sessionId}] Early data channel setup complete, will validate after negotiation`);
  }

  /**
   * Alternative data channel creation strategy that addresses the onopen event issue
   */
  async createDataChannelAlternativeStrategy() {
    const sessionId = this.sessionId || 'unknown';
    const maxAttempts = 3;

    console.log(`🎯 [${sessionId}] Starting alternative data channel creation strategy`);

    // Check if we already have a data channel from early creation
    if (this.dataChannel) {
      const currentState = this.dataChannel.readyState;
      console.log(`🎯 [${sessionId}] Found existing data channel from early creation, state: ${currentState}`);

      if (currentState === 'open') {
        console.log(`🎯 [${sessionId}] Early data channel is already open, no further action needed`);
        this.emit('dataChannelOpened');
        return;
      } else if (currentState === 'connecting') {
        console.log(`🎯 [${sessionId}] Early data channel is connecting, waiting for it to open`);
        try {
          await this.waitForEarlyDataChannelOpen();
          console.log(`🎯 [${sessionId}] Early data channel opened successfully`);
          return;
        } catch (error) {
          console.warn(`🎯 [${sessionId}] Early data channel failed to open:`, error.message);
          await this.cleanupStuckDataChannel();
        }
      } else {
        console.warn(`🎯 [${sessionId}] Early data channel in bad state (${currentState}), cleaning up`);
        await this.cleanupStuckDataChannel();
      }
    }

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`🎯 [${sessionId}] Alternative strategy attempt ${attempt}/${maxAttempts}`);

        if (attempt === 1) {
          // Strategy 1: Wait for remote data channel (let OpenAI create it)
          await this.waitForRemoteDataChannel();
        } else if (attempt === 2) {
          // Strategy 2: Create local data channel with different configuration
          await this.createDataChannelWithAlternativeConfig();
        } else {
          // Strategy 3: Force renegotiation approach
          await this.createDataChannelWithRenegotiation();
        }

        console.log(`🎯 [${sessionId}] Alternative data channel strategy succeeded on attempt ${attempt}`);
        return;

      } catch (error) {
        console.error(`🎯 [${sessionId}] Alternative strategy attempt ${attempt} failed:`, error.message);

        if (attempt === maxAttempts) {
          console.error(`🎯 [${sessionId}] All alternative data channel strategies failed`);

          // Try one final fallback: proceed without data channel
          console.warn(`🎯 [${sessionId}] Attempting to proceed without data channel (audio-only mode)`);
          try {
            await this.proceedWithoutDataChannel();
            console.log(`🎯 [${sessionId}] Successfully proceeding in audio-only mode`);
            return;
          } catch (fallbackError) {
            console.error(`🎯 [${sessionId}] Audio-only fallback also failed:`, fallbackError.message);
            throw new Error(`Data channel creation failed after ${maxAttempts} alternative attempts and audio-only fallback: ${error.message}`);
          }
        }

        // Clean up before next attempt
        await this.cleanupStuckDataChannel();

        // Wait before next attempt
        const waitTime = attempt * 500; // 500ms, 1s, 1.5s
        console.log(`🎯 [${sessionId}] Waiting ${waitTime}ms before next alternative attempt`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  /**
   * Wait for early-created data channel to open
   */
  async waitForEarlyDataChannelOpen() {
    const sessionId = this.sessionId || 'unknown';

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.error(`🎯 [${sessionId}] Early data channel open timeout`);
        reject(new Error('Early data channel open timeout'));
      }, 5000); // 5 second timeout for early channel

      // Set up onopen handler if not already set
      if (this.dataChannel && !this.dataChannel.onopen) {
        this.dataChannel.onopen = () => {
          console.log(`🎯 [${sessionId}] Early data channel opened`);
          clearTimeout(timeout);
          this.emit('dataChannelOpened');
          resolve();
        };
      }

      // Also poll the state in case onopen doesn't fire
      let pollCount = 0;
      const pollForOpen = () => {
        pollCount++;
        const currentState = this.dataChannel?.readyState;

        if (currentState === 'open') {
          clearTimeout(timeout);
          console.log(`🎯 [${sessionId}] Early data channel opened via polling after ${pollCount} checks`);
          this.emit('dataChannelOpened');
          resolve();
          return;
        }

        if (currentState === 'closed' || currentState === 'closing') {
          clearTimeout(timeout);
          reject(new Error(`Early data channel ${currentState}`));
          return;
        }

        if (pollCount < 25) { // Poll for 5 seconds
          setTimeout(pollForOpen, 200);
        }
      };

      // Start polling
      setTimeout(pollForOpen, 100);
    });
  }

  /**
   * Strategy 1: Wait for remote data channel (let OpenAI create it)
   */
  async waitForRemoteDataChannel() {
    const sessionId = this.sessionId || 'unknown';

    console.log(`🎯 [${sessionId}] Waiting for remote peer to create data channel`);

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.error(`🎯 [${sessionId}] Remote data channel timeout`);
        reject(new Error('Remote data channel timeout'));
      }, 10000); // 10 second timeout

      // Listen for data channel from remote peer
      this.peerConnection.ondatachannel = (event) => {
        console.log(`🎯 [${sessionId}] Received data channel from remote peer`);
        clearTimeout(timeout);

        this.dataChannel = event.channel;
        console.log(`🎯 [${sessionId}] Remote data channel state: ${this.dataChannel.readyState}`);

        // Set up handlers
        this.dataChannel.onopen = () => {
          console.log(`🎯 [${sessionId}] Remote data channel opened`);
          this.emit('dataChannelOpened');
          resolve();
        };

        this.dataChannel.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleIncomingMessage(message);
          } catch (error) {
            console.error(`🎯 [${sessionId}] Error parsing remote data channel message:`, error);
          }
        };

        this.dataChannel.onerror = (error) => {
          console.error(`🎯 [${sessionId}] Remote data channel error:`, error);
          reject(new Error('Remote data channel error'));
        };

        // If already open, resolve immediately
        if (this.dataChannel.readyState === 'open') {
          console.log(`🎯 [${sessionId}] Remote data channel already open`);
          this.emit('dataChannelOpened');
          resolve();
        }
      };

      // Also check if we already have a data channel
      if (this.dataChannel && this.dataChannel.readyState === 'open') {
        clearTimeout(timeout);
        console.log(`🎯 [${sessionId}] Existing data channel is already open`);
        this.emit('dataChannelOpened');
        resolve();
      }
    });
  }

  /**
   * Strategy 2: Create local data channel with alternative configuration
   */
  async createDataChannelWithAlternativeConfig() {
    const sessionId = this.sessionId || 'unknown';

    if (!this.peerConnection) {
      throw new Error('Peer connection not available');
    }

    // Clean up any existing data channel
    if (this.dataChannel) {
      await this.cleanupStuckDataChannel();
    }

    console.log(`🎯 [${sessionId}] Creating data channel with alternative configuration`);

    // Try different data channel configuration
    this.dataChannel = this.peerConnection.createDataChannel('oai-events', {
      ordered: false, // Try unordered
      maxRetransmits: 0, // No retransmissions
      protocol: '', // Empty protocol
    });

    console.log(`🎯 [${sessionId}] Alternative config data channel created, state: ${this.dataChannel.readyState}`);

    // Set up handlers and wait for open
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.error(`🎯 [${sessionId}] Alternative config timeout`);
        reject(new Error('Alternative config data channel timeout'));
      }, 8000);

      this.dataChannel.onopen = () => {
        console.log(`🎯 [${sessionId}] Alternative config data channel opened`);
        clearTimeout(timeout);
        this.emit('dataChannelOpened');
        resolve();
      };

      this.dataChannel.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleIncomingMessage(message);
        } catch (error) {
          console.error(`🎯 [${sessionId}] Error parsing alternative config message:`, error);
        }
      };

      this.dataChannel.onerror = (error) => {
        console.error(`🎯 [${sessionId}] Alternative config data channel error:`, error);
        clearTimeout(timeout);
        reject(new Error('Alternative config data channel error'));
      };

      // Poll for state changes
      let pollCount = 0;
      const pollState = () => {
        pollCount++;
        const state = this.dataChannel?.readyState;

        if (state === 'open') {
          clearTimeout(timeout);
          console.log(`🎯 [${sessionId}] Alternative config opened via polling`);
          this.emit('dataChannelOpened');
          resolve();
        } else if (state === 'closed' || state === 'closing') {
          clearTimeout(timeout);
          reject(new Error(`Alternative config data channel ${state}`));
        } else if (pollCount < 40) { // 8 seconds
          setTimeout(pollState, 200);
        }
      };

      setTimeout(pollState, 100);
    });
  }

  /**
   * Strategy 3: Force renegotiation approach
   */
  async createDataChannelWithRenegotiation() {
    const sessionId = this.sessionId || 'unknown';

    console.log(`🎯 [${sessionId}] Creating data channel with renegotiation`);

    if (!this.peerConnection) {
      throw new Error('Peer connection not available');
    }

    // Clean up any existing data channel
    if (this.dataChannel) {
      await this.cleanupStuckDataChannel();
    }

    // Create data channel
    this.dataChannel = this.peerConnection.createDataChannel('oai-events', {
      ordered: true,
    });

    console.log(`🎯 [${sessionId}] Renegotiation data channel created, triggering renegotiation`);

    // Force renegotiation by creating a new offer
    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      console.log(`🎯 [${sessionId}] Renegotiation offer created and set`);

      // Note: In a real scenario, we'd need to send this offer to the remote peer
      // For now, we'll just wait for the data channel to open

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.error(`🎯 [${sessionId}] Renegotiation timeout`);
          reject(new Error('Renegotiation data channel timeout'));
        }, 6000);

        this.dataChannel.onopen = () => {
          console.log(`🎯 [${sessionId}] Renegotiation data channel opened`);
          clearTimeout(timeout);
          this.emit('dataChannelOpened');
          resolve();
        };

        this.dataChannel.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleIncomingMessage(message);
          } catch (error) {
            console.error(`🎯 [${sessionId}] Error parsing renegotiation message:`, error);
          }
        };

        this.dataChannel.onerror = (error) => {
          console.error(`🎯 [${sessionId}] Renegotiation data channel error:`, error);
          clearTimeout(timeout);
          reject(new Error('Renegotiation data channel error'));
        };
      });

    } catch (error) {
      console.error(`🎯 [${sessionId}] Renegotiation failed:`, error);
      throw new Error(`Renegotiation failed: ${error.message}`);
    }
  }

  /**
   * Strategy 1: Event-driven approach with enhanced monitoring
   */
  async createDataChannelWithEventMonitoring() {
    const sessionId = this.sessionId || 'unknown';

    if (!this.peerConnection) {
      throw new Error('Peer connection not available');
    }

    // Clean up any existing data channel
    if (this.dataChannel) {
      await this.cleanupStuckDataChannel();
    }

    console.log(`🎯 [${sessionId}] Creating data channel with event monitoring`);
    this.debugWebRTCState('before data channel creation');

    // Create data channel
    this.dataChannel = this.peerConnection.createDataChannel('oai-events', {
      ordered: true,
    });

    console.log(`🎯 [${sessionId}] Data channel created with initial state: ${this.dataChannel.readyState}`);

    // Set up enhanced event monitoring
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.error(`🎯 [${sessionId}] Event monitoring timeout - data channel state: ${this.dataChannel?.readyState}`);
        reject(new Error('Data channel event monitoring timeout'));
      }, 8000); // 8 second timeout

      let eventsFired = {
        onopen: false,
        onerror: false,
        onclose: false
      };

      this.dataChannel.onopen = () => {
        eventsFired.onopen = true;
        console.log(`🎯 [${sessionId}] Data channel onopen event fired - state: ${this.dataChannel.readyState}`);

        if (this.dataChannel.readyState === 'open') {
          clearTimeout(timeout);
          this.emit('dataChannelOpened');
          resolve();
        } else {
          console.error(`🎯 [${sessionId}] onopen fired but state is not open: ${this.dataChannel.readyState}`);
          reject(new Error('Data channel onopen event fired but state is not open'));
        }
      };

      this.dataChannel.onerror = (error) => {
        eventsFired.onerror = true;
        console.error(`🎯 [${sessionId}] Data channel error event:`, error);
        clearTimeout(timeout);
        reject(new Error('Data channel error event fired'));
      };

      this.dataChannel.onclose = () => {
        eventsFired.onclose = true;
        console.log(`🎯 [${sessionId}] Data channel close event fired`);
        if (!eventsFired.onopen) {
          clearTimeout(timeout);
          reject(new Error('Data channel closed before opening'));
        }
      };

      this.dataChannel.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleIncomingMessage(message);
        } catch (error) {
          console.error(`🎯 [${sessionId}] Error parsing data channel message:`, error);
        }
      };

      // Monitor state changes
      let stateCheckCount = 0;
      const stateMonitor = setInterval(() => {
        stateCheckCount++;
        const currentState = this.dataChannel?.readyState;
        console.log(`🎯 [${sessionId}] State monitor check ${stateCheckCount}: ${currentState}`);

        if (currentState === 'open' && !eventsFired.onopen) {
          console.warn(`🎯 [${sessionId}] Data channel is open but onopen event didn't fire - resolving anyway`);
          clearInterval(stateMonitor);
          clearTimeout(timeout);
          this.emit('dataChannelOpened');
          resolve();
        } else if (currentState === 'closed' || currentState === 'closing') {
          console.error(`🎯 [${sessionId}] Data channel closed during monitoring`);
          clearInterval(stateMonitor);
          clearTimeout(timeout);
          reject(new Error(`Data channel ${currentState} during monitoring`));
        }

        if (stateCheckCount >= 40) { // 8 seconds of monitoring
          clearInterval(stateMonitor);
        }
      }, 200);
    });
  }

  /**
   * Strategy 2: Polling-based approach that doesn't rely on onopen event
   */
  async createDataChannelWithPolling() {
    const sessionId = this.sessionId || 'unknown';

    if (!this.peerConnection) {
      throw new Error('Peer connection not available');
    }

    // Clean up any existing data channel
    if (this.dataChannel) {
      await this.cleanupStuckDataChannel();
    }

    console.log(`🎯 [${sessionId}] Creating data channel with polling strategy`);

    // Create data channel
    this.dataChannel = this.peerConnection.createDataChannel('oai-events', {
      ordered: true,
    });

    console.log(`🎯 [${sessionId}] Data channel created, starting polling for open state`);

    // Set up message handler immediately
    this.dataChannel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleIncomingMessage(message);
      } catch (error) {
        console.error(`🎯 [${sessionId}] Error parsing data channel message:`, error);
      }
    };

    // Use polling instead of relying on onopen event
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const timeout = 6000; // 6 second timeout
      let pollCount = 0;

      const pollForOpen = () => {
        pollCount++;
        const currentState = this.dataChannel?.readyState;
        const elapsed = Date.now() - startTime;

        console.log(`🎯 [${sessionId}] Poll ${pollCount}: state=${currentState}, elapsed=${elapsed}ms`);

        if (!this.dataChannel) {
          reject(new Error('Data channel lost during polling'));
          return;
        }

        if (currentState === 'open') {
          console.log(`🎯 [${sessionId}] Data channel opened via polling after ${elapsed}ms`);
          this.emit('dataChannelOpened');
          resolve();
          return;
        }

        if (currentState === 'closed' || currentState === 'closing') {
          reject(new Error(`Data channel ${currentState} during polling`));
          return;
        }

        if (elapsed >= timeout) {
          reject(new Error(`Data channel polling timeout after ${elapsed}ms - final state: ${currentState}`));
          return;
        }

        // Continue polling
        setTimeout(pollForOpen, 150); // Poll every 150ms
      };

      // Start polling
      pollForOpen();
    });
  }

  /**
   * Strategy 3: Immediate validation approach
   */
  async createDataChannelWithImmediateValidation() {
    const sessionId = this.sessionId || 'unknown';

    if (!this.peerConnection) {
      throw new Error('Peer connection not available');
    }

    // Clean up any existing data channel
    if (this.dataChannel) {
      await this.cleanupStuckDataChannel();
    }

    console.log(`🎯 [${sessionId}] Creating data channel with immediate validation`);

    // Wait a bit longer for WebRTC to stabilize
    console.log(`🎯 [${sessionId}] Waiting for WebRTC stabilization...`);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verify connection states before creating data channel
    const connectionState = this.peerConnection.connectionState;
    const iceState = this.peerConnection.iceConnectionState;
    const signalingState = this.peerConnection.signalingState;

    console.log(`🎯 [${sessionId}] Pre-creation states - connection: ${connectionState}, ice: ${iceState}, signaling: ${signalingState}`);

    if (connectionState !== 'connected' || iceState !== 'completed') {
      throw new Error(`WebRTC not ready for data channel - connection: ${connectionState}, ice: ${iceState}`);
    }

    // Create data channel
    this.dataChannel = this.peerConnection.createDataChannel('oai-events', {
      ordered: true,
    });

    console.log(`🎯 [${sessionId}] Data channel created, performing immediate validation`);

    // Set up message handler
    this.dataChannel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleIncomingMessage(message);
      } catch (error) {
        console.error(`🎯 [${sessionId}] Error parsing data channel message:`, error);
      }
    };

    // Immediate validation with shorter timeout
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        const finalState = this.dataChannel?.readyState;
        console.error(`🎯 [${sessionId}] Immediate validation timeout - final state: ${finalState}`);
        reject(new Error(`Data channel immediate validation timeout - state: ${finalState}`));
      }, 3000); // 3 second timeout

      // Check state immediately and then poll rapidly
      let checkCount = 0;
      const rapidCheck = () => {
        checkCount++;
        const currentState = this.dataChannel?.readyState;

        if (currentState === 'open') {
          clearTimeout(timeout);
          console.log(`🎯 [${sessionId}] Data channel validated as open after ${checkCount} checks`);
          this.emit('dataChannelOpened');
          resolve();
          return;
        }

        if (currentState === 'closed' || currentState === 'closing') {
          clearTimeout(timeout);
          reject(new Error(`Data channel ${currentState} during validation`));
          return;
        }

        if (checkCount < 30) { // Check for 3 seconds
          setTimeout(rapidCheck, 100); // Check every 100ms
        }
      };

      // Start immediate checking
      rapidCheck();
    });
  }

  /**
   * Set up local media stream
   */
  async setupLocalStream() {
    try {
      console.log("🎯 Setting up local media stream");

      const stream = await mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      this.localStream = stream;

      // Add tracks to peer connection
      stream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, stream);
      });

      console.log("🎯 Local media stream set up successfully");

    } catch (error) {
      console.error("🎯 Error setting up local media stream:", error);
      throw error;
    }
  }

  /**
   * Connect to OpenAI Realtime API with proper state management
   */
  async connectToRealtimeAPI() {
    // Prevent concurrent connections
    if (this.isConnecting) {
      console.log("🎯 Connection already in progress, waiting...");
      while (this.isConnecting) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }

    this.isConnecting = true;

    try {
      // Check cooldown period
      const now = Date.now();
      const timeSinceLastAttempt = now - this.lastConnectionAttempt;

      if (timeSinceLastAttempt < this.connectionCooldown) {
        const remainingCooldown = this.connectionCooldown - timeSinceLastAttempt;
        console.log(`🎯 Connection cooldown active, waiting ${remainingCooldown}ms`);
        await new Promise(resolve => setTimeout(resolve, remainingCooldown));
      }

      this.lastConnectionAttempt = Date.now();
      console.log("🎯 Connecting to OpenAI Realtime API");

      // Validate peer connection state
      if (!this.peerConnection) {
        throw new Error("Peer connection is null when creating offer");
      }

      const connectionState = this.peerConnection.connectionState;
      console.log(`🎯 Peer connection state before offer: ${connectionState}`);

      // Ensure peer connection is in the right state
      if (connectionState === 'closed' || connectionState === 'failed') {
        throw new Error(`Peer connection is in invalid state: ${connectionState}`);
      }

      // Get ephemeral token from backend
      const ephemeralKey = await this.getEphemeralToken();

      // Create and set local description
      console.log("🎯 Creating WebRTC offer");
      const offer = await this.peerConnection.createOffer();

      // Analyze SDP for data channel negotiation
      this.analyzeSDP(offer.sdp, 'Local Offer');

      console.log("🎯 Setting local description");
      await this.peerConnection.setLocalDescription(offer);

      // Verify state after setting local description
      const stateAfterLocal = this.peerConnection.signalingState;
      console.log(`🎯 Signaling state after local description: ${stateAfterLocal}`);

      if (stateAfterLocal !== 'have-local-offer') {
        throw new Error(`Invalid signaling state after local description: ${stateAfterLocal}`);
      }

      // Send offer to OpenAI Realtime API
      console.log("🎯 Sending offer to OpenAI");
      const response = await this.sendOfferToOpenAI(offer, ephemeralKey);

      // Validate peer connection before setting remote description
      if (!this.peerConnection) {
        throw new Error("Peer connection is null when setting remote description");
      }

      const stateBeforeRemote = this.peerConnection.signalingState;
      console.log(`🎯 Signaling state before remote description: ${stateBeforeRemote}`);

      if (stateBeforeRemote !== 'have-local-offer') {
        throw new Error(`Invalid signaling state before remote description: ${stateBeforeRemote}. Expected 'have-local-offer'`);
      }

      // Analyze remote SDP before setting
      this.analyzeSDP(response.sdp, 'Remote Answer');

      // Set remote description
      console.log("🎯 Setting remote description");
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(response));

      const stateAfterRemote = this.peerConnection.signalingState;
      console.log(`🎯 Signaling state after remote description: ${stateAfterRemote}`);

      // Don't mark as connected yet - wait for session to be active
      // this.isConnected = true;
      this.emit('connecting'); // Emit connecting state instead

      // Data channel was already created before offer - wait for it to open with fallback
      console.log("🎯 WebRTC connection established, waiting for data channel to open");

      // Emit connecting state before attempting data channel connection
      this.emit('connecting');

      try {
        await this.waitForStandardDataChannelOpen();
        console.log("🎯 ✅ Data channel opened successfully");
        // Now we're truly connected - data channel is open
        this.isConnected = true;
        this.emit('connected'); // ✅ FIXED: Emit 'connected' when actually connected
      } catch (error) {
        console.error("🎯 ❌ Data channel failed to open:", error.message);
        console.log("🎯 🔄 Attempting graceful fallback to audio-only mode");
        await this.enableAudioOnlyFallback();
      }

      // Send session configuration
      await this.configureSession();

      // ✅ CRITICAL FIX: Update session state when connection is established
      this.isSessionActive = true;
      this.updateState({
        isConnected: true,
        isSessionActive: true,
        isConnecting: false
      });

      // ✅ CRITICAL FIX: Record circuit breaker success
      this.recordCircuitBreakerSuccess();

      console.log("🎯 Connected to OpenAI Realtime API successfully");
    } catch (error) {
      console.error("🎯 Error connecting to OpenAI:", error);

      // ✅ CRITICAL FIX: Record circuit breaker failure
      this.recordCircuitBreakerFailure();

      this.emit('error', { type: 'connection', error });
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Wait for data channel to be ready with enhanced validation
   */
  async waitForDataChannelReady(timeoutMs = 10000) {
    const sessionId = this.sessionId || 'unknown';

    return new Promise((resolve, reject) => {
      // Check if data channel is already open
      if (this.dataChannel && this.dataChannel.readyState === 'open') {
        console.log(`🎯 [${sessionId}] Data channel already ready`);
        resolve();
        return;
      }

      // Check if data channel exists but is not open
      if (!this.dataChannel) {
        console.error(`🎯 [${sessionId}] No data channel exists when waiting for ready state`);
        reject(new Error('No data channel exists'));
        return;
      }

      const currentState = this.dataChannel.readyState;
      console.log(`🎯 [${sessionId}] Waiting for data channel ready, current state: ${currentState}`);

      const timeout = setTimeout(() => {
        const finalState = this.dataChannel?.readyState || 'null';
        console.error(`🎯 [${sessionId}] Data channel ready timeout after ${timeoutMs}ms, final state: ${finalState}`);
        reject(new Error('Data channel ready timeout'));
      }, timeoutMs);

      let checkCount = 0;
      const maxChecks = timeoutMs / 100; // Prevent infinite loops

      const checkReady = () => {
        checkCount++;

        if (!this.dataChannel) {
          clearTimeout(timeout);
          reject(new Error('Data channel lost during wait'));
          return;
        }

        const state = this.dataChannel.readyState;

        if (state === 'open') {
          clearTimeout(timeout);
          console.log(`🎯 [${sessionId}] Data channel ready after ${checkCount * 100}ms`);
          resolve();
        } else if (state === 'closed' || state === 'closing') {
          clearTimeout(timeout);
          reject(new Error(`Data channel closed during wait (state: ${state})`));
        } else if (checkCount >= maxChecks) {
          clearTimeout(timeout);
          reject(new Error(`Data channel ready check limit exceeded (state: ${state})`));
        } else {
          // Continue checking
          setTimeout(checkReady, 100);
        }
      };

      checkReady();
    });
  }

  /**
   * Configure the AI session with optimized settings (without overriding prompts)
   */
  async configureSession() {
    try {
      console.log("🎯 Configuring AI session settings (prompts already set during token generation)");

      // Wait for data channel to be ready before sending configuration
      await this.waitForDataChannelReady();

      // Enhanced session configuration for more natural conversation
      // NOTE: We do NOT override instructions here - they were already set during token generation
      // with our enhanced prompts from createContextAwareTeachingPrompt()
      const sessionUpdateEvent = {
        type: "session.update",
        session: {
          // instructions: NOT SET HERE - using the enhanced prompts from token generation
          voice: "alloy", // Consistent with working configuration
          input_audio_format: "pcm16",
          output_audio_format: "pcm16",
          input_audio_transcription: {
            model: "whisper-1",
          },
          turn_detection: {
            type: "server_vad",
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 2000, // REDUCED from 4000ms to 2000ms to encourage shorter, more interactive responses
          },
          tools: [],
          tool_choice: "none",
          temperature: 0.7 // Balanced temperature for natural but consistent responses
          // Note: OpenAI Realtime API doesn't support max_response_output_tokens in session.update
          // Response length is controlled through instructions
        },
      };

      this.sendMessage(sessionUpdateEvent);
      console.log("🎯 Session configured with enhanced prompts for scenario:", this.currentScenario);

      // Wait a bit for session update to be processed, then trigger AI response
      this.aiResponseTimeout = setTimeout(() => {
        console.log("🎯 Triggering AI to start conversation using enhanced prompts");

        // Use response.create to make AI speak first without any user input
        // The enhanced prompts already contain the proper starter, so no need to override
        const responseCreateEvent = {
          type: "response.create",
          response: {
            modalities: ["text", "audio"]
            // Note: OpenAI Realtime API doesn't support max_response_output_tokens in response.create
            // Response length is controlled through instructions in the session configuration
          }
        };
        this.sendMessage(responseCreateEvent);
        this.aiResponseTimeout = null; // Clear reference after execution
      }, 1000); // Reduced from 2000ms to 1000ms since data channel is now ready

    } catch (error) {
      console.error("🎯 Error configuring session:", error);
      throw error;
    }
  }

  /**
   * Get ephemeral token from backend with retry logic
   */
  async getEphemeralToken(retryCount = 0) {
    const maxRetries = 3;
    const baseDelay = 1000;
    const sessionId = this.sessionId || 'unknown';

    // Prevent multiple simultaneous token requests
    if (this.isRequestingToken) {
      console.log(`🎯 [${sessionId}] Token request already in progress, waiting...`);
      while (this.isRequestingToken) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      // If another request completed successfully, we might not need to make another
      if (this.isConnected) {
        throw new Error('Connection already established by another token request');
      }
    }

    this.isRequestingToken = true;

    try {
      // Get auth token
      const authToken = await AsyncStorage.getItem('accessToken');
      if (!authToken) {
        throw new Error('No authentication token found');
      }

      // ✅ CRITICAL FIX: Detect lesson-based conversations and use lesson details
      const isLessonScenario = this.currentScenario && this.currentScenario.startsWith('lesson-');
      let lessonDetails = this.currentLessonDetails || ""; // Use passed lesson details first
      let isLessonBased = false;

      if (isLessonScenario) {
        isLessonBased = true;

        // If no lesson details were passed, extract from scenario ID as fallback
        if (!lessonDetails) {
          const lessonId = this.currentScenario.replace('lesson-', '');

          // Set appropriate lesson details based on lesson ID
          if (lessonId.includes('greetings') || lessonId.includes('introduction')) {
            lessonDetails = "Korean Greetings and Introductions - Practice basic greetings like 안녕하세요, introducing yourself, and common courtesy expressions";
          } else if (lessonId.includes('alphabet') || lessonId.includes('hangul')) {
            lessonDetails = "Korean Alphabet (한글) - Practice individual letter pronunciation, vowel and consonant sounds, and basic reading skills";
          } else if (lessonId.includes('food') || lessonId.includes('restaurant')) {
            lessonDetails = "Food and Restaurant Vocabulary - Practice ordering food, restaurant expressions, and food-related conversations";
          } else if (lessonId.includes('shopping') || lessonId.includes('market')) {
            lessonDetails = "Shopping and Market Vocabulary - Practice asking prices, shopping expressions, and market conversations";
          } else if (lessonId.includes('weather') || lessonId.includes('time')) {
            lessonDetails = "Weather and Time Expressions - Practice describing weather conditions and telling time in Korean";
          } else if (lessonId.includes('transportation') || lessonId.includes('direction')) {
            lessonDetails = "Transportation and Directions - Practice asking for directions and using public transportation";
          } else if (lessonId.includes('family') || lessonId.includes('relationship')) {
            lessonDetails = "Family and Relationships - Practice talking about family members and relationships";
          } else if (lessonId.includes('daily') || lessonId.includes('routine')) {
            lessonDetails = "Daily Life and Routines - Practice describing daily activities and personal routines";
          } else if (lessonId.includes('business') || lessonId.includes('work')) {
            lessonDetails = "Business and Work Vocabulary - Practice professional conversations and workplace expressions";
          } else if (lessonId.includes('culture') || lessonId.includes('tradition')) {
            lessonDetails = "Korean Culture and Traditions - Practice discussing cultural concepts and traditional customs";
          } else {
            // Generic lesson description
            lessonDetails = `Korean Language Lesson (${lessonId}) - Practice vocabulary, expressions, and conversation skills from this lesson`;
          }
        }

        console.log(`🎯 Detected lesson-based conversation: ${this.currentScenario}`);
        console.log(`🎯 Lesson details: ${lessonDetails}`);
      }

      const requestBody = {
        model: "gpt-4o-mini-realtime-preview-2024-12-17",
        voice: "alloy",
        scenarioId: this.currentScenario,
        isScenarioBased: !isLessonScenario, // If it's a lesson, don't use scenario-based prompts
        isLessonBased, // ✅ CRITICAL FIX: Pass lesson-based flag
        lessonDetails, // ✅ CRITICAL FIX: Pass lesson content details
        level: this.currentLevel,
        user: this.currentUser, // ✅ CRITICAL FIX: Pass user context for personalization
      };

      console.log("🎯 Getting ephemeral token with params:", requestBody);

      const response = await fetch(`${API_BASE_URL}/openai/realtime/token`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        // Handle rate limiting with exponential backoff
        if (response.status === 429 && retryCount < maxRetries) {
          // Rate limited - use exponential backoff
          const delay = Math.min(baseDelay * Math.pow(2, retryCount), 30000); // Cap at 30 seconds
          console.log(`🎯 Rate limited, retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries + 1})`);

          await new Promise(resolve => setTimeout(resolve, delay));
          return this.getEphemeralToken(retryCount + 1);
        }

        throw new Error(`Token request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("🎯 Token response data:", data);

      // Handle different response formats
      let ephemeralKey;
      if (data.success && data.data?.ephemeralKey) {
        // New format: {"success": true, "data": {"ephemeralKey": "..."}}
        ephemeralKey = data.data.ephemeralKey;
      } else if (data.token) {
        // Backend format: {"token": "..."}
        ephemeralKey = data.token;
      } else {
        console.error("🎯 Invalid token response structure:", data);
        // throw new Error(`Invalid token response from server: ${JSON.stringify(data)}`);
      }

      console.log(`🎯 [${sessionId}] Ephemeral token received successfully`);
      return ephemeralKey;
    } catch (error) {
      console.error(`🎯 [${sessionId}] Error getting ephemeral token:`, error);

      // Handle retry logic
      if (retryCount < maxRetries) {
        if (error.message?.includes('429') || error.message?.includes('rate limit')) {
          // Rate limited - use exponential backoff
          const delay = Math.min(baseDelay * Math.pow(2, retryCount), 30000); // Cap at 30 seconds
          console.log(`🎯 [${sessionId}] Rate limited, retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries + 1})`);

          this.isRequestingToken = false; // Clear lock before retry
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.getEphemeralToken(retryCount + 1);
        }
      }

      throw error;
    } finally {
      this.isRequestingToken = false;
    }
  }

  /**
   * Send offer to OpenAI Realtime API
   */
  async sendOfferToOpenAI(offer, ephemeralKey) {
    try {
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-mini-realtime-preview-2024-12-17";

      console.log(`🎯 Sending SDP to OpenAI using model: ${model}`);

      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          "Content-Type": "application/sdp",
        },
      });

      if (!sdpResponse.ok) {
        throw new Error(`OpenAI API error: ${sdpResponse.status} ${sdpResponse.statusText}`);
      }

      const answerSdp = await sdpResponse.text();

      return {
        type: "answer",
        sdp: answerSdp,
      };
    } catch (error) {
      console.error("🎯 Error sending offer to OpenAI:", error);
      throw error;
    }
  }

  /**
   * Set up data channel event handlers with timeout management
   */
  async setupDataChannelHandlers() {
    if (!this.dataChannel) {
      throw new Error('Data channel not available for handler setup');
    }

    const sessionId = this.sessionId || 'unknown';

    return new Promise((resolve, reject) => {
      // Clear any existing timeout
      if (this.dataChannelReadyTimeout) {
        clearTimeout(this.dataChannelReadyTimeout);
      }

      console.log(`🎯 [${sessionId}] Setting up data channel handlers, current state: ${this.dataChannel.readyState}`);
      this.debugLog('Data channel setup details', {
        readyState: this.dataChannel.readyState,
        peerConnectionState: this.peerConnection?.connectionState,
        iceConnectionState: this.peerConnection?.iceConnectionState,
        signalingState: this.peerConnection?.signalingState
      });

      // Set timeout for data channel ready
      this.dataChannelReadyTimeout = setTimeout(() => {
        console.error(`🎯 [${sessionId}] Data channel ready timeout after ${this.maxDataChannelWaitMs}ms`);
        console.error(`🎯 [${sessionId}] Data channel final state: ${this.dataChannel?.readyState || 'null'}`);
        console.error(`🎯 [${sessionId}] Peer connection state: ${this.peerConnection?.connectionState || 'null'}`);
        console.error(`🎯 [${sessionId}] ICE connection state: ${this.peerConnection?.iceConnectionState || 'null'}`);
        console.error(`🎯 [${sessionId}] Signaling state: ${this.peerConnection?.signalingState || 'null'}`);

        this.debugLog('Data channel timeout diagnostics', {
          connectionAttempts: this.connectionAttempts,
          lastConnectionAttempt: this.lastConnectionAttempt,
          timeSinceLastAttempt: Date.now() - this.lastConnectionAttempt
        });

        reject(new Error('Data channel ready timeout'));
      }, this.maxDataChannelWaitMs);

      this.dataChannel.onopen = () => {
        console.log(`🎯 [${sessionId}] Data channel opened successfully`);

        // Double-check the state to ensure it's actually open
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
          console.log(`🎯 [${sessionId}] Data channel state confirmed as open`);

          // Clear timeout on successful open
          if (this.dataChannelReadyTimeout) {
            clearTimeout(this.dataChannelReadyTimeout);
            this.dataChannelReadyTimeout = null;
          }

          this.emit('dataChannelOpened');
          resolve();
        } else {
          console.error(`🎯 [${sessionId}] Data channel onopen fired but state is not open: ${this.dataChannel?.readyState || 'null'}`);
          reject(new Error('Data channel onopen event fired but channel is not in open state'));
        }
      };

      this.dataChannel.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleIncomingMessage(message);
        } catch (error) {
          console.error(`🎯 [${sessionId}] Error parsing incoming message:`, error);
        }
      };

      this.dataChannel.onerror = (error) => {
        console.error(`🎯 [${sessionId}] Data channel error:`, error);

        // Clear timeout on error
        if (this.dataChannelReadyTimeout) {
          clearTimeout(this.dataChannelReadyTimeout);
          this.dataChannelReadyTimeout = null;
        }

        this.emit('error', { type: 'data_channel', error });
        reject(error);
      };

      this.dataChannel.onclose = () => {
        console.log(`🎯 [${sessionId}] Data channel closed`);

        // Clear timeout on close
        if (this.dataChannelReadyTimeout) {
          clearTimeout(this.dataChannelReadyTimeout);
          this.dataChannelReadyTimeout = null;
        }

        this.emit('dataChannelClosed');
      };

      // If data channel is already open, resolve immediately
      if (this.dataChannel.readyState === 'open') {
        console.log(`🎯 [${sessionId}] Data channel already open`);
        if (this.dataChannelReadyTimeout) {
          clearTimeout(this.dataChannelReadyTimeout);
          this.dataChannelReadyTimeout = null;
        }
        resolve();
      }
    });
  }

  /**
   * Handle incoming messages from OpenAI
   */
  handleIncomingMessage(message) {
    // Only log important message types to reduce noise
    const importantTypes = [
      'session.created', 'session.updated', 'error',
      'input_audio_buffer.speech_started', 'input_audio_buffer.speech_stopped',
      'response.audio.done', 'response.done'
    ];

    if (importantTypes.includes(message.type)) {
      console.log("🎯 Received message:", message.type);
    }

    switch (message.type) {
      case 'session.created':
        console.log("🎯 Session created");
        this.emit('sessionCreated', message);
        break;

      case 'session.updated':
        console.log("🎯 Session updated");
        this.emit('sessionUpdated', message);
        break;

      case 'input_audio_buffer.speech_started':
        console.log("🎯 User started speaking (handled automatically by OpenAI)");

        // If AI is currently speaking, this will cause OpenAI to truncate the response
        if (this.isAISpeaking) {
          console.log("🎯 User interrupted AI - OpenAI will handle truncation automatically");
          // OpenAI will send proper completion events, don't manually truncate
          // Let the natural response.done flow handle completion
        }

        this.emit('userSpeechStarted');
        break;

      case 'input_audio_buffer.speech_stopped':
        console.log("🎯 User stopped speaking (handled automatically by OpenAI)");
        this.emit('userSpeechStopped');
        break;

      case 'response.audio.delta':
        // AI is speaking - track audio data reception
        if (!this.isAISpeaking) {
          console.log("🎯 AI started speaking");
          this.updateState({ isAISpeaking: true });
          this.emit('aiSpeechStarted');
          this.setAudioPlaying(true, message.response_id);
        }
        this.audioResponseState.audioDataReceived = true;
        this.emit('audioData', message.delta);
        break;

      case 'response.audio.done':
        // AI finished sending audio data - mark as received
        console.log("🎯 AI finished sending audio data");
        this.audioResponseState.audioDataReceived = true;

        // DO NOT complete here - audio data being sent doesn't mean playback is complete
        // Let the natural flow handle completion when audio actually finishes playing
        console.log("🎯 Audio data received, waiting for natural completion");
        break;

      case 'response.done':
        console.log("🎯 Response generation completed - this is the proper completion signal");

        // This is the correct time to complete the audio response
        // OpenAI has finished generating the complete response
        if (this.isAISpeaking) {
          // Give a much longer delay to allow audio to finish playing naturally
          // The key insight: we need to wait for ACTUAL audio playback completion, not just generation
          setTimeout(() => {
            if (this.isAISpeaking && this.validateAudioCompletion('response.done')) {
              console.log("🎯 Completing AI response after extended delay (validated)");
              this.updateState({ isAISpeaking: false });
              this.setAudioPlaying(false);
              this.emit('aiSpeechEnded');
            } else if (this.isAISpeaking) {
              console.warn("🎯 Audio completion validation failed, extending delay further");
              // Extend delay even more for very long responses
              setTimeout(() => {
                if (this.isAISpeaking) {
                  console.log("🎯 Completing AI response after maximum delay");
                  this.updateState({ isAISpeaking: false });
                  this.setAudioPlaying(false);
                  this.emit('aiSpeechEnded');
                }
              }, 3000); // Additional 3 seconds for very long responses
            }
          }, 5000); // 5 second delay instead of 2 seconds - allows longer responses
        }

        this.emit('responseCompleted');
        break;

      // Handle transcript messages (now we'll process these)
      case 'response.audio_transcript.delta':
        // AI speaking transcript (partial)
        if (message.delta) {
          this.currentAITranscript += message.delta;
          console.log(`🎯 AI transcript delta: "${message.delta}" (total length: ${this.currentAITranscript.length})`);
          this.emit('aiTranscriptDelta', {
            delta: message.delta,
            transcript: this.currentAITranscript
          });
        }
        break;

      case 'response.audio_transcript.done':
        // AI speaking transcript (complete) - track completion
        const finalText = this.currentAITranscript.trim();
        console.log(`🎯 AI transcript completed: "${finalText}" (${finalText.length} chars)`);

        if (finalText) {
          const finalTranscript = {
            type: 'ai',
            text: finalText,
            timestamp: new Date()
          };
          this.conversationHistory.push(finalTranscript);
          this.currentAITranscript = "";

          // ✅ CRITICAL FIX: Update state with new conversation history
          this.updateState({
            conversationHistory: [...this.conversationHistory],
            currentAITranscript: ""
          });

          this.emit('aiTranscriptComplete', finalTranscript);
        }

        // Mark transcript as received for completion tracking
        this.audioResponseState.transcriptReceived = true;

        // DO NOT complete here - transcript being complete doesn't mean audio playback is complete
        // Let the natural flow handle completion when audio actually finishes playing
        console.log("🎯 Transcript received, waiting for natural completion");
        break;

      case 'conversation.item.created':
        // Handle user input transcription
        if (message.item && message.item.type === 'message' && message.item.role === 'user') {
          const content = message.item.content?.[0];
          if (content && content.type === 'input_audio' && content.transcript) {
            const userTranscript = {
              type: 'user',
              text: content.transcript,
              timestamp: new Date()
            };
            this.conversationHistory.push(userTranscript);

            // ✅ CRITICAL FIX: Update state with new conversation history
            this.updateState({
              conversationHistory: [...this.conversationHistory]
            });

            this.emit('userTranscriptComplete', userTranscript);
          }
        }
        break;

      case 'input_audio_buffer.committed':
      case 'conversation.item.truncated':
      case 'response.created':
      case 'response.output_item.added':
      case 'response.content_part.added':
      case 'response.content_part.done':
      case 'response.output_item.done':
      case 'output_audio_buffer.started':
      case 'output_audio_buffer.cleared':
        // These are normal operation messages, handle silently
        this.emit('message', message);
        break;

      case 'error':
        console.error("🎯 OpenAI error:", message.error);

        // Handle specific error types
        if (message.error?.code === 'unsupported_content_type' &&
          message.error?.message?.includes('truncated')) {
          console.warn("🎯 Truncation error - this is usually harmless and handled automatically by OpenAI");
          // Don't emit this as a critical error since it's handled automatically
        } else {
          this.emit('error', { type: 'openai', error: message.error });
        }
        break;

      // Handle missing transcription message types
      case 'conversation.item.input_audio_transcription.delta':
        // User input audio transcription (partial)
        if (message.delta) {
          this.currentUserTranscript += message.delta;
          this.emit('userTranscriptDelta', {
            delta: message.delta,
            transcript: this.currentUserTranscript
          });
        }
        break;

      case 'conversation.item.input_audio_transcription.completed':
        // User input audio transcription (complete)
        if (this.currentUserTranscript.trim()) {
          const finalTranscript = {
            type: 'user',
            text: this.currentUserTranscript.trim(),
            timestamp: new Date()
          };
          this.conversationHistory.push(finalTranscript);
          this.currentUserTranscript = "";

          // ✅ CRITICAL FIX: Update state with new conversation history
          this.updateState({
            conversationHistory: [...this.conversationHistory]
          });

          this.emit('userTranscriptComplete', finalTranscript);
        }
        break;

      case 'rate_limits.updated':
        // Handle rate limit updates
        console.log("🎯 Rate limits updated:", message.rate_limits);
        this.emit('rateLimitsUpdated', message.rate_limits);
        break;

      case 'output_audio_buffer.stopped':
        // OpenAI finished sending audio to buffer (NOT finished playing)
        console.log("🎯 OpenAI finished sending audio to buffer");

        // DO NOT complete audio response here
        // The audio is still playing locally in the WebRTC stream
        // We should only complete when we have a proper completion signal or timeout

        this.emit('outputAudioBufferStopped');
        break;

      case 'conversation.item.input_audio_transcription.failed':
        console.warn("🎯 Audio transcription failed:", message.error || 'Unknown error');
        // Continue processing - this is not a fatal error
        break;

      default:
        console.log("🎯 Unhandled message type:", message.type);
        this.emit('message', message);
    }
  }

  // sendMessage method is now implemented above with fallback handling

  /**
   * Send message immediately
   */
  sendMessageImmediate(message) {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      console.warn("🎯 Data channel not ready, cannot send message");
      return;
    }

    try {
      this.dataChannel.send(JSON.stringify(message));
      // Only log important outgoing messages
      if (message.type === 'session.update' || message.type === 'response.create') {
        console.log("🎯 Sent message:", message.type);
      }
    } catch (error) {
      console.error("🎯 Error sending message:", error);
      this.emit('error', { type: 'send_message', error });
    }
  }

  // Note: Message queue processing removed - OpenAI handles conversation flow

  /**
   * Update state (simplified - no queue management needed)
   */
  updateState(newState) {
    // Clear existing timeout
    if (this.stateUpdateTimeout) {
      clearTimeout(this.stateUpdateTimeout);
    }

    // Add safeguards to prevent external interference with audio completion
    if (newState.hasOwnProperty('isAISpeaking') && newState.isAISpeaking === false) {
      // Only allow setting isAISpeaking to false if we're not in the middle of audio playback
      if (this.audioResponseState && this.audioResponseState.isAudioPlaying) {
        console.warn("🎯 Preventing premature isAISpeaking=false during audio playback");
        // Remove the isAISpeaking update from newState to prevent interference
        const { isAISpeaking, ...safeState } = newState;
        newState = safeState;
      }
    }

    // Update state properties individually to avoid undefined overwrites
    Object.keys(newState).forEach(key => {
      if (newState[key] !== undefined) {
        this[key] = newState[key];
      }
    });

    // Emit the full current state, not just the partial update
    this.emit('stateChanged', this.getState());
  }

  /**
   * Stop the current session with race condition protection
   */
  async stopSession() {
    // Use operation queue to prevent race conditions
    return this.queueOperation('stopSession', async () => {
      return this.stopSessionInternal();
    });
  }

  /**
   * Internal session stop implementation
   */
  async stopSessionInternal() {
    this.isStoppingSession = true;
    const currentSessionId = this.sessionId || 'unknown';
    console.log(`🎯 [${currentSessionId}] Stopping conversation session`);

    try {
      // Clear any pending timeouts
      if (this.aiResponseTimeout) {
        clearTimeout(this.aiResponseTimeout);
        this.aiResponseTimeout = null;
      }
      if (this.stateUpdateTimeout) {
        clearTimeout(this.stateUpdateTimeout);
        this.stateUpdateTimeout = null;
      }
      if (this.dataChannelReadyTimeout) {
        clearTimeout(this.dataChannelReadyTimeout);
        this.dataChannelReadyTimeout = null;
      }

      // Close data channel with proper error handling
      if (this.dataChannel) {
        try {
          if (this.dataChannel.readyState === 'open') {
            this.dataChannel.close();
          }
        } catch (error) {
          console.warn(`🎯 [${currentSessionId}] Error closing data channel:`, error);
        }
        this.dataChannel = null;
      }

      // Stop local stream tracks first (before closing peer connection)
      if (this.localStream) {
        try {
          this.localStream.getTracks().forEach(track => {
            try {
              track.stop();
            } catch (error) {
              console.warn(`🎯 [${currentSessionId}] Error stopping track:`, error);
            }
          });
        } catch (error) {
          console.warn(`🎯 [${currentSessionId}] Error stopping local stream tracks:`, error);
        }
        this.localStream = null;
      }

      // Stop remote stream tracks
      if (this.remoteStream) {
        try {
          this.remoteStream.getTracks().forEach(track => {
            try {
              track.stop();
            } catch (error) {
              console.warn(`🎯 [${currentSessionId}] Error stopping remote track:`, error);
            }
          });
        } catch (error) {
          console.warn(`🎯 [${currentSessionId}] Error stopping remote stream tracks:`, error);
        }
        this.remoteStream = null;
      }

      // Close peer connection with proper state checking
      if (this.peerConnection) {
        try {
          // Only close if not already closed
          if (this.peerConnection.connectionState !== 'closed') {
            this.peerConnection.close();
          }
        } catch (error) {
          console.warn(`🎯 [${currentSessionId}] Error closing peer connection:`, error);
        }
        this.peerConnection = null;
      }

      // Reset state synchronously after resources are cleaned
      this.isConnected = false;
      this.isSessionActive = false;
      this.isAISpeaking = false;
      this.isConnecting = false;
      this.currentScenario = null;
      this.currentLevel = "beginner";
      this.currentUser = null;

      // ✅ CRITICAL FIX: Emit state update when session stops
      this.updateState({
        isConnected: false,
        isSessionActive: false,
        isAISpeaking: false,
        isConnecting: false,
        isStoppingSession: false
      });
      this.sessionId = null; // Clear session ID

      // Reset transcription state
      this.currentUserTranscript = "";
      this.currentAITranscript = "";
      this.conversationHistory = [];

      // ✅ CRITICAL FIX: Reset session lifecycle flags for subsequent sessions
      this.isStartingSession = false;
      this.isConnecting = false;

      // ✅ CRITICAL FIX: Clear any remaining operation queue items related to this session
      this.operationQueue = this.operationQueue.filter(op =>
        op.type !== 'startSession' && op.type !== 'stopSession'
      );

      console.log(`🎯 [${currentSessionId}] Session stopped successfully`);
      this.emit('sessionStopped');

      // Wait for WebRTC resources to be fully released
      // This is critical for mobile devices where WebRTC cleanup is asynchronous
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`🎯 [${currentSessionId}] Error stopping session:`, error);
      this.emit('error', { type: 'session_stop', error });
    } finally {
      this.isStoppingSession = false;
    }
  }

  /**
   * Stop the current session due to user action (prevents auto-restart)
   */
  async stopSessionByUser() {
    try {
      console.log("🎯 User ending conversation session - preventing auto-restart");

      // ✅ CRITICAL FIX: Set flags to prevent automatic restart with persistence
      this.userEndedSession = true;
      this.allowAutoRestart = false;
      this.sessionManagementDisabled = true; // ✅ CRITICAL FIX: Completely disable session management

      // ✅ CRITICAL FIX: Add timestamp to track when user ended session
      this.userEndedSessionTimestamp = Date.now();

      console.log("🎯 Session control flags set:", {
        userEndedSession: this.userEndedSession,
        allowAutoRestart: this.allowAutoRestart,
        sessionManagementDisabled: this.sessionManagementDisabled,
        timestamp: this.userEndedSessionTimestamp
      });

      // Stop the session
      await this.stopSession();

      this.emit('userEndedSession');

    } catch (error) {
      console.error("🎯 Error stopping session by user:", error);
      this.emit('error', { type: 'session_stop', error });
    }
  }

  /**
   * Reset session control flags (e.g., when explicitly starting a new scenario)
   * ✅ CRITICAL FIX: Reset all control flags when user explicitly starts a new session
   */
  resetSessionControlFlags() {
    console.log("🎯 Resetting session control flags for explicit new session start");
    this.userEndedSession = false;
    this.allowAutoRestart = true;
    this.userEndedSessionTimestamp = null; // Clear the timestamp
    this.sessionManagementDisabled = false; // ✅ CRITICAL FIX: Re-enable session management

    console.log("🎯 Session control flags reset:", {
      userEndedSession: this.userEndedSession,
      allowAutoRestart: this.allowAutoRestart,
      sessionManagementDisabled: this.sessionManagementDisabled,
      userEndedSessionTimestamp: this.userEndedSessionTimestamp
    });
  }

  /**
   * ✅ CRITICAL FIX: Check if session can be restarted and clear blocking conditions
   */
  canRestartSession() {
    const canRestart = !this.isSessionActive && !this.isStartingSession && !this.isStoppingSession;

    console.log("🎯 Session restart capability check:", {
      canRestart,
      isSessionActive: this.isSessionActive,
      isStartingSession: this.isStartingSession,
      isStoppingSession: this.isStoppingSession,
      userEndedSession: this.userEndedSession,
      allowAutoRestart: this.allowAutoRestart,
      sessionManagementDisabled: this.sessionManagementDisabled
    });

    return canRestart;
  }

  /**
   * ✅ CRITICAL FIX: Reset service to completely clean state
   */
  resetToCleanState() {
    console.log("🎯 Resetting service to completely clean state");

    // Reset session control flags
    this.userEndedSession = false;
    this.allowAutoRestart = true;
    this.userEndedSessionTimestamp = null;
    this.sessionManagementDisabled = false;

    // Reset session lifecycle flags
    this.isStartingSession = false;
    this.isStoppingSession = false;
    this.isConnecting = false;

    // Reset circuit breaker
    this.circuitBreaker.failureCount = 0;
    this.circuitBreaker.state = 'CLOSED';
    this.circuitBreaker.lastFailureTime = 0;

    // Reset session debounce
    this.sessionDebounce.lastSessionStart = 0;
    this.sessionDebounce.lastScenario = null;

    console.log("🎯 Service reset to clean state:", {
      userEndedSession: this.userEndedSession,
      allowAutoRestart: this.allowAutoRestart,
      sessionManagementDisabled: this.sessionManagementDisabled,
      isStartingSession: this.isStartingSession,
      isStoppingSession: this.isStoppingSession,
      circuitBreakerState: this.circuitBreaker.state
    });
  }

  /**
   * Change scenario without restarting the entire service
   */
  async changeScenario(scenarioId, level = "beginner", user = null) {
    try {
      console.log(`🎯 Changing scenario to: ${scenarioId}, level: ${level}, user: ${user?.displayName || 'anonymous'}`);

      this.currentScenario = scenarioId;
      this.currentLevel = level;
      this.currentUser = user;

      // Reconfigure session with new scenario
      await this.configureSession();

      this.emit('scenarioChanged', { scenarioId, level });

    } catch (error) {
      console.error("🎯 Error changing scenario:", error);
      this.emit('error', { type: 'scenario_change', error });
    }
  }

  /**
   * Check if a new session can be started based on current state and cooldowns
   */
  canStartNewSession() {
    // Can't start if currently starting a session
    if (this.isStartingSession) {
      return false;
    }

    // Can't start if currently stopping a session
    if (this.isStoppingSession) {
      return false;
    }

    // Can't start if currently connecting
    if (this.isConnecting) {
      return false;
    }

    // Can't start if session is already active
    if (this.isSessionActive) {
      return false;
    }

    return true;
  }

  /**
   * Get current state
   */
  getState() {
    return {
      isConnected: this.isConnected,
      isSessionActive: this.isSessionActive,
      isAISpeaking: this.isAISpeaking,
      audioOutputDevice: this.audioOutputDevice,
      isBluetoothAvailable: this.isBluetoothAvailable,
      currentScenario: this.currentScenario,
      currentLevel: this.currentLevel,
      userEndedSession: this.userEndedSession,
      allowAutoRestart: this.allowAutoRestart,
      userEndedSessionTimestamp: this.userEndedSessionTimestamp, // ✅ CRITICAL FIX: Include timestamp
      sessionManagementDisabled: this.sessionManagementDisabled, // ✅ CRITICAL FIX: Include management flag
      conversationHistory: this.conversationHistory,
      currentAITranscript: this.currentAITranscript,
      // Session lifecycle state
      isStartingSession: this.isStartingSession,
      isStoppingSession: this.isStoppingSession,
      isConnecting: this.isConnecting,
      // Note: currentAudioLevel removed - OpenAI handles VAD
    };
  }

  /**
   * Cleanup and destroy the service
   */
  async destroy() {
    const currentSessionId = this.sessionId || 'unknown';
    console.log(`🎯 [${currentSessionId}] Destroying WebRTC Conversation Service`);

    // Clear operation queue to prevent new operations
    this.operationQueue = [];
    this.isProcessingQueue = false;

    await this.stopSession();
    this.removeAllListeners();

    // Clear any remaining timeouts
    if (this.stateUpdateTimeout) {
      clearTimeout(this.stateUpdateTimeout);
    }
    if (this.aiResponseTimeout) {
      clearTimeout(this.aiResponseTimeout);
    }

    // ✅ CRITICAL FIX: Reset service to completely clean state on destroy
    this.resetToCleanState();

    console.log(`🎯 [${currentSessionId}] Service destroyed successfully`);
  }
}

// Create singleton instance
const webRTCConversationService = new WebRTCConversationService();

export default webRTCConversationService;
