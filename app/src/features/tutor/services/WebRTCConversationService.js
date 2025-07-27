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

    // Session control state
    this.userEndedSession = false; // Flag to prevent auto-restart when user explicitly ends
    this.allowAutoRestart = true; // Global flag to control automatic session restart

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

    console.log("🎯 WebRTCConversationService initialized");
  }

  /**
   * Initialize the service and set up audio
   */
  async initialize() {
    try {
      console.log("🎯 Initializing WebRTC Conversation Service");

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
   * Start a conversation session
   */
  async startSession(scenarioId, level = "beginner") {
    try {
      console.log(`🎯 Starting conversation session: ${scenarioId}, level: ${level}`);

      // Reset session control flags for explicit new session start
      // This allows new conversations even after user ended previous session
      console.log("🎯 Resetting session control flags for new conversation");
      this.userEndedSession = false;
      this.allowAutoRestart = true;

      if (this.isSessionActive) {
        console.log("🎯 Session already active, stopping current session first");
        await this.stopSession();
      }

      this.currentScenario = scenarioId;
      this.currentLevel = level;
      this.sessionStartTime = Date.now(); // Track session start for persistence

      // Create peer connection
      await this.createPeerConnection();

      // Set up local media stream
      await this.setupLocalStream();

      // Connect to OpenAI Realtime API
      await this.connectToRealtimeAPI();

      this.isSessionActive = true;
      this.emit('sessionStarted', { scenarioId, level });

      return true;
    } catch (error) {
      console.error("🎯 Error starting session:", error);
      this.emit('error', { type: 'session_start', error });
      return false;
    }
  }

  /**
   * Create WebRTC peer connection
   */
  async createPeerConnection() {
    try {
      console.log("🎯 Creating peer connection");

      // Clean up existing connection
      if (this.peerConnection) {
        this.peerConnection.close();
      }

      this.peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });

      // Set up event handlers with null checks
      this.peerConnection.oniceconnectionstatechange = () => {
        if (this.peerConnection) {
          console.log("🎯 ICE connection state:", this.peerConnection.iceConnectionState);
          this.emit('connectionStateChanged', this.peerConnection.iceConnectionState);
        }
      };

      this.peerConnection.ontrack = (event) => {
        console.log("🎯 Received remote track");
        this.emit('remoteTrackReceived', event.streams[0]);
      };

      // Create data channel for communication with OpenAI
      this.dataChannel = this.peerConnection.createDataChannel('oai-events', {
        ordered: true,
      });

      this.setupDataChannelHandlers();

    } catch (error) {
      console.error("🎯 Error creating peer connection:", error);
      throw error;
    }
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
   * Connect to OpenAI Realtime API
   */
  async connectToRealtimeAPI() {
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

      // Get ephemeral token from backend
      const ephemeralKey = await this.getEphemeralToken();

      // Create offer with null check
      if (!this.peerConnection) {
        throw new Error("Peer connection is null when creating offer");
      }

      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      // Send offer to OpenAI Realtime API
      const response = await this.sendOfferToOpenAI(offer, ephemeralKey);

      // Set remote description with null check
      if (!this.peerConnection) {
        throw new Error("Peer connection is null when setting remote description");
      }

      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(response));

      this.isConnected = true;
      this.emit('connected');

      // Send session configuration
      await this.configureSession();

      console.log("🎯 Connected to OpenAI Realtime API");
    } catch (error) {
      console.error("🎯 Error connecting to OpenAI:", error);
      this.emit('error', { type: 'connection', error });
      throw error;
    }
  }

  /**
   * Configure the AI session with optimized settings (without overriding prompts)
   */
  async configureSession() {
    try {
      console.log("🎯 Configuring AI session settings (prompts already set during token generation)");

      // Enhanced session configuration for more natural conversation
      // NOTE: We do NOT override instructions here - they were already set during token generation
      // with our enhanced prompts from createContextAwareTeachingPrompt()
      const sessionUpdateEvent = {
        type: "session.update",
        session: {
          // instructions: NOT SET HERE - using the enhanced prompts from token generation
          voice: "shimmer", // Consistent with optimized voice selection
          input_audio_format: "pcm16",
          output_audio_format: "pcm16",
          input_audio_transcription: {
            model: "whisper-1",
          },
          turn_detection: {
            type: "server_vad",
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 1800, // Shorter silence for more interactive conversation
          },
          tools: [],
          tool_choice: "none",
          temperature: 0.9, // Higher temperature for more natural, varied responses
          max_response_output_tokens: 150, // Shorter responses for better conversation flow
        },
      };

      this.sendMessage(sessionUpdateEvent);
      console.log("🎯 Session configured with enhanced prompts for scenario:", this.currentScenario);

      // Trigger the AI to start speaking immediately using enhanced prompts
      this.aiResponseTimeout = setTimeout(() => {
        console.log("🎯 Triggering AI to start conversation using enhanced prompts");

        // Use response.create to make AI speak first without any user input
        // The enhanced prompts already contain the proper starter, so no need to override
        const responseCreateEvent = {
          type: "response.create",
          response: {
            modalities: ["text", "audio"]
            // No instructions override - let the enhanced prompts handle the conversation start
          }
        };
        this.sendMessage(responseCreateEvent);
        this.aiResponseTimeout = null; // Clear reference after execution
      }, 2000); // Wait 2 seconds after session update for proper initialization

    } catch (error) {
      console.error("🎯 Error configuring session:", error);
      throw error;
    }
  }

  /**
   * Get ephemeral token from backend with retry logic
   */
  async getEphemeralToken(retryCount = 0) {
    const maxRetries = 8; // Increased from 3 to 8 attempts
    const baseDelay = 1500; // Increased base delay from 1000ms to 1500ms

    try {
      // Get auth token
      const authToken = await AsyncStorage.getItem('accessToken');
      if (!authToken) {
        throw new Error('No authentication token found');
      }

      const requestBody = {
        model: "gpt-4o-realtime-preview-2025-06-03",
        voice: "shimmer", // Optimized voice for educational content
        scenarioId: this.currentScenario,
        isScenarioBased: true,
        level: this.currentLevel,
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
          let delay = baseDelay * Math.pow(2, retryCount); // Default exponential backoff

          // Try to get enhanced rate limit info from backend
          try {
            const errorData = await response.json();
            if (errorData.retryAfter) {
              // Use the backend's suggested retry time (in seconds), but cap it at 5 minutes
              delay = Math.min(errorData.retryAfter * 1000, 5 * 60 * 1000);
              console.log(`🎯 Rate limited, backend suggests retrying in ${errorData.retryAfter}s (attempt ${retryCount + 1}/${maxRetries + 1})`);
              console.log(`🎯 Rate limit details:`, errorData);
            } else {
              console.log(`🎯 Rate limited, using exponential backoff: ${delay}ms (attempt ${retryCount + 1}/${maxRetries + 1})`);
            }
          } catch (parseError) {
            console.log(`🎯 Rate limited, using exponential backoff: ${delay}ms (attempt ${retryCount + 1}/${maxRetries + 1})`);
          }

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

      console.log("🎯 Ephemeral token received successfully");
      return ephemeralKey;
    } catch (error) {
      console.error("🎯 Error getting ephemeral token:", error);
      throw error;
    }
  }

  /**
   * Send offer to OpenAI Realtime API
   */
  async sendOfferToOpenAI(offer, ephemeralKey) {
    try {
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2025-06-03";

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
   * Set up data channel event handlers
   */
  setupDataChannelHandlers() {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => {
      console.log("🎯 Data channel opened");
      this.emit('dataChannelOpened');
    };

    this.dataChannel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleIncomingMessage(message);
      } catch (error) {
        console.error("🎯 Error parsing incoming message:", error);
      }
    };

    this.dataChannel.onerror = (error) => {
      console.error("🎯 Data channel error:", error);
      this.emit('error', { type: 'data_channel', error });
    };

    this.dataChannel.onclose = () => {
      console.log("🎯 Data channel closed");
      this.emit('dataChannelClosed');
    };
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
        this.emit('userSpeechStarted');
        break;

      case 'input_audio_buffer.speech_stopped':
        console.log("🎯 User stopped speaking (handled automatically by OpenAI)");
        this.emit('userSpeechStopped');
        break;

      case 'response.audio.delta':
        // AI is speaking
        if (!this.isAISpeaking) {
          this.updateState({ isAISpeaking: true });
          this.emit('aiSpeechStarted');
        }
        this.emit('audioData', message.delta);
        break;

      case 'response.audio.done':
        console.log("🎯 AI finished speaking");
        this.updateState({ isAISpeaking: false });
        this.emit('aiSpeechEnded');
        break;

      case 'response.done':
        console.log("🎯 Response completed");
        this.updateState({ isAISpeaking: false });
        this.emit('responseCompleted');
        break;

      // Handle transcript messages (now we'll process these)
      case 'response.audio_transcript.delta':
        // AI speaking transcript (partial)
        if (message.delta) {
          this.currentAITranscript += message.delta;
          this.emit('aiTranscriptDelta', {
            delta: message.delta,
            transcript: this.currentAITranscript
          });
        }
        break;

      case 'response.audio_transcript.done':
        // AI speaking transcript (complete)
        if (this.currentAITranscript.trim()) {
          const finalTranscript = {
            type: 'ai',
            text: this.currentAITranscript.trim(),
            timestamp: new Date()
          };
          this.conversationHistory.push(finalTranscript);
          this.emit('aiTranscriptComplete', finalTranscript);
          this.currentAITranscript = "";
        }
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
        this.emit('error', { type: 'openai', error: message.error });
        break;

      default:
        console.log("🎯 Unhandled message type:", message.type);
        this.emit('message', message);
    }
  }

  /**
   * Send message to OpenAI directly (no queue management - OpenAI handles this)
   */
  sendMessage(message) {
    this.sendMessageImmediate(message);
  }

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

    // Update state immediately
    Object.assign(this, newState);
    this.emit('stateChanged', { ...newState });
  }



  /**
   * Stop the current session
   */
  async stopSession() {
    try {
      console.log("🎯 Stopping conversation session");

      // Clear any pending timeouts
      if (this.aiResponseTimeout) {
        clearTimeout(this.aiResponseTimeout);
        this.aiResponseTimeout = null;
      }
      if (this.stateUpdateTimeout) {
        clearTimeout(this.stateUpdateTimeout);
        this.stateUpdateTimeout = null;
      }

      // Close data channel
      if (this.dataChannel) {
        this.dataChannel.close();
        this.dataChannel = null;
      }

      // Close peer connection
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }

      // Stop local stream
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }

      // Reset state
      this.isConnected = false;
      this.isSessionActive = false;
      this.isAISpeaking = false;
      this.currentScenario = null;
      this.currentLevel = "beginner";

      // Reset transcription state
      this.currentUserTranscript = "";
      this.currentAITranscript = "";
      this.conversationHistory = [];

      console.log("🎯 Session stopped successfully");
      this.emit('sessionStopped');

      // Add a small delay to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error("🎯 Error stopping session:", error);
      this.emit('error', { type: 'session_stop', error });
    }
  }

  /**
   * Stop the current session due to user action (prevents auto-restart)
   */
  async stopSessionByUser() {
    try {
      console.log("🎯 User ending conversation session - preventing auto-restart");

      // Set flags to prevent automatic restart
      this.userEndedSession = true;
      this.allowAutoRestart = false;

      // Stop the session
      await this.stopSession();

      this.emit('userEndedSession');

    } catch (error) {
      console.error("🎯 Error stopping session by user:", error);
      this.emit('error', { type: 'session_stop', error });
    }
  }

  /**
   * Reset session control flags (e.g., when starting a new scenario)
   */
  resetSessionControlFlags() {
    console.log("🎯 Resetting session control flags");
    this.userEndedSession = false;
    this.allowAutoRestart = true;
  }

  /**
   * Change scenario without restarting the entire service
   */
  async changeScenario(scenarioId, level = "beginner") {
    try {
      console.log(`🎯 Changing scenario to: ${scenarioId}, level: ${level}`);

      this.currentScenario = scenarioId;
      this.currentLevel = level;

      // Reconfigure session with new scenario
      await this.configureSession();

      this.emit('scenarioChanged', { scenarioId, level });

    } catch (error) {
      console.error("🎯 Error changing scenario:", error);
      this.emit('error', { type: 'scenario_change', error });
    }
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
      conversationHistory: this.conversationHistory,
      currentUserTranscript: this.currentUserTranscript,
      currentAITranscript: this.currentAITranscript,
      // Note: currentAudioLevel removed - OpenAI handles VAD
    };
  }

  /**
   * Cleanup and destroy the service
   */
  async destroy() {
    console.log("🎯 Destroying WebRTC Conversation Service");

    await this.stopSession();
    this.removeAllListeners();

    // Clear any remaining timeouts
    if (this.stateUpdateTimeout) {
      clearTimeout(this.stateUpdateTimeout);
    }
    if (this.aiResponseTimeout) {
      clearTimeout(this.aiResponseTimeout);
    }
  }
}

// Create singleton instance
const webRTCConversationService = new WebRTCConversationService();

export default webRTCConversationService;
