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
import getScenarioPrompt from '../data/scenarioPrompts';

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
    
    // Message queue to prevent conflicts during AI speech
    this.messageQueue = [];
    this.isProcessingQueue = false;
    
    // Debounced state management
    this.stateUpdateTimeout = null;
    
    // Audio level detection
    this.audioLevelInterval = null;
    this.currentAudioLevel = 0;

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
      
      if (this.isSessionActive) {
        console.log("🎯 Session already active, stopping current session first");
        await this.stopSession();
      }
      
      this.currentScenario = scenarioId;
      this.currentLevel = level;
      
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
      
      // Set up event handlers
      this.peerConnection.oniceconnectionstatechange = () => {
        console.log("🎯 ICE connection state:", this.peerConnection.iceConnectionState);
        this.emit('connectionStateChanged', this.peerConnection.iceConnectionState);
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

      // Create offer
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      // Send offer to OpenAI Realtime API
      const response = await this.sendOfferToOpenAI(offer, ephemeralKey);

      // Set remote description
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
   * Configure the AI session with scenario-specific prompts
   */
  async configureSession() {
    try {
      console.log("🎯 Configuring AI session");
      
      // Get scenario-specific prompt
      const sessionInstructions = getScenarioPrompt(this.currentScenario, this.currentLevel);
      
      // Add critical instruction for natural teaching flow
      const finalInstructions = `${sessionInstructions}

CRITICAL: Keep responses focused and concise (2-3 sentences maximum). When asking for repetition, speak the Korean phrase clearly, then pause and wait for the student to practice. Don't rush - allow natural pauses for learning.`;

      const sessionUpdateEvent = {
        type: "session.update",
        session: {
          instructions: finalInstructions,
          voice: "alloy",
          input_audio_format: "pcm16",
          output_audio_format: "pcm16",
          input_audio_transcription: {
            model: "whisper-1",
          },
          turn_detection: {
            type: "server_vad",
            threshold: 0.5, // Lower threshold to be less sensitive
            prefix_padding_ms: 300,
            silence_duration_ms: 5000, // Much longer silence duration to let AI finish speaking
          },
          tools: [],
          tool_choice: "none",
          temperature: 0.7,
          max_response_output_tokens: 300, // Allow longer responses for teaching and explanations
        },
      };

      this.sendMessage(sessionUpdateEvent);
      console.log("🎯 Session configured with scenario:", this.currentScenario);
      
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
    const baseDelay = 1000; // 1 second

    try {
      // Import API configuration
      const { API_BASE_URL } = await import('../../../shared/config/api.js');
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;

      // Get auth token
      const authToken = await AsyncStorage.getItem('accessToken');
      if (!authToken) {
        throw new Error('No authentication token found');
      }

      const requestBody = {
        model: "gpt-4o-mini-realtime-preview-2024-12-17",
        voice: "alloy",
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
          const delay = baseDelay * Math.pow(2, retryCount);
          console.log(`🎯 Rate limited, retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);

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

      // Handle transcript messages (don't log to reduce noise)
      case 'response.audio_transcript.delta':
      case 'response.audio_transcript.done':
      case 'input_audio_buffer.committed':
      case 'conversation.item.created':
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
   * Send message to OpenAI with queue management
   */
  sendMessage(message) {
    if (this.isAISpeaking && message.type !== 'response.cancel') {
      // Queue the message if AI is speaking
      console.log("🎯 Queueing message while AI is speaking:", message.type);
      this.messageQueue.push(message);
      return;
    }

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

  /**
   * Process queued messages
   */
  processMessageQueue() {
    if (this.isProcessingQueue || this.messageQueue.length === 0 || this.isAISpeaking) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.messageQueue.length > 0 && !this.isAISpeaking) {
      const message = this.messageQueue.shift();
      this.sendMessageImmediate(message);
    }

    this.isProcessingQueue = false;
  }

  /**
   * Update state with debouncing
   */
  updateState(newState) {
    // Clear existing timeout
    if (this.stateUpdateTimeout) {
      clearTimeout(this.stateUpdateTimeout);
    }

    // Update state immediately for critical properties
    const criticalProps = ['isAISpeaking'];
    const hasCriticalUpdate = Object.keys(newState).some(key => criticalProps.includes(key));

    if (hasCriticalUpdate) {
      Object.assign(this, newState);
      this.emit('stateChanged', { ...newState });

      // Process message queue when AI stops speaking
      if (newState.isAISpeaking === false) {
        setTimeout(() => this.processMessageQueue(), 100);
      }
    } else {
      // Debounce non-critical updates
      this.stateUpdateTimeout = setTimeout(() => {
        Object.assign(this, newState);
        this.emit('stateChanged', { ...newState });
      }, 100);
    }
  }



  /**
   * Stop the current session
   */
  async stopSession() {
    try {
      console.log("🎯 Stopping conversation session");

      // Stop audio level detection
      if (this.audioLevelInterval) {
        clearInterval(this.audioLevelInterval);
        this.audioLevelInterval = null;
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

      // Clear message queue
      this.messageQueue = [];
      this.isProcessingQueue = false;

      // Reset state
      this.isConnected = false;
      this.isSessionActive = false;
      this.isAISpeaking = false;
      this.currentScenario = null;
      this.currentLevel = "beginner";

      this.emit('sessionStopped');

    } catch (error) {
      console.error("🎯 Error stopping session:", error);
      this.emit('error', { type: 'session_stop', error });
    }
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
      currentAudioLevel: this.currentAudioLevel,
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
  }
}

// Create singleton instance
const webRTCConversationService = new WebRTCConversationService();

export default webRTCConversationService;
