/**
 * OpenAI Realtime API Service
 * Handles WebSocket connections to OpenAI's Realtime API for real-time audio conversations
 */

import { RealtimeClient } from "@openai/realtime-api-beta";
import OpenAI from "openai";
import config from "../config/index.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Generate fallback instructions using enhanced prompts
 * @param {Object} options - Options for prompt generation
 * @returns {Promise<string>} Enhanced instructions
 */
async function generateFallbackInstructions(options = {}) {
  try {
    console.log("⚠️ Generating fallback instructions with enhanced prompts");
    const { createTeachingPrompt } = await import('../data/promptTemplates.js');
    return createTeachingPrompt({
      isScenarioBased: options.isScenarioBased || false,
      scenarioId: options.scenarioId || null,
      level: options.level || 'beginner'
    });
  } catch (error) {
    console.error("❌ Failed to generate enhanced fallback instructions:", error);
    return "You are Miles, a helpful AI Korean language tutor. Start with a friendly greeting and teach Korean step by step.";
  }
}
import { webrtcSessionPersistence } from "./webrtcSessionPersistence.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

// Active sessions
const activeSessions = new Map();

/**
 * Create a new Realtime API session
 * @param {string} userId - User ID
 * @param {Object} options - Session options
 * @returns {Promise<Object>} Session information
 */
export const createSession = async (userId, options = {}) => {
  try {
    console.log(`🎯 Creating WebRTC session for user: ${userId}`);

    // Create or resume persistent session
    const persistentSession = await webrtcSessionPersistence.createOrResumeSession(userId, options);
    const sessionId = persistentSession.sessionId;

    // Create a new Realtime client
    const client = new RealtimeClient({
      apiKey: config.openai.apiKey,
    });

    // Set up session parameters
    client.updateSession({
      model: "gpt-4o-realtime-preview",
      voice: options.voice || "alloy",
      instructions: options.instructions || await generateFallbackInstructions(options),
      turn_detection: { type: "server_vad" },
      input_audio_transcription: { model: "whisper-1" },
    });

    // Set up event handling
    client.on("conversation.updated", async (event) => {
      const { item, delta } = event;
      const session = activeSessions.get(sessionId);

      if (session && session.socket) {
        // Forward the event to the client
        session.socket.emit("realtime:conversation-updated", {
          sessionId,
          item,
          delta,
        });

        // If there's audio data, send it to the client
        if (delta && delta.audio) {
          session.socket.emit("realtime:audio", {
            sessionId,
            audio: delta.audio,
          });
        }

        // If there's transcript data, send it to the client
        if (delta && delta.transcript) {
          session.socket.emit("realtime:transcript", {
            sessionId,
            transcript: delta.transcript,
            isFinal: item.status === "completed",
          });

          // Save completed messages to persistent storage
          if (item.status === "completed" && item.type === "message") {
            const messageData = {
              role: item.role,
              content: delta.transcript || item.content?.[0]?.transcript,
              timestamp: new Date(),
              audioTranscript: delta.transcript,
              metadata: {
                itemId: item.id,
                type: item.type,
                status: item.status
              }
            };

            await webrtcSessionPersistence.saveMessage(sessionId, messageData);
          }
        }
      }
    });

    // Store session data
    activeSessions.set(sessionId, {
      id: sessionId,
      userId,
      client,
      startTime: Date.now(),
      lastActivity: Date.now(),
      options,
      socket: null,
      webrtcOffer: null,
      webrtcAnswer: null,
      iceCandidates: [],
    });

    // Connect to the Realtime API
    await client.connect();

    return {
      sessionId,
      status: "created",
    };
  } catch (error) {
    console.error("Error creating Realtime API session:", error);
    throw error;
  }
};

/**
 * Associate a socket with a session
 * @param {string} sessionId - Session ID
 * @param {Object} socket - Socket.IO socket
 * @returns {Promise<boolean>} Success status
 */
export const associateSocket = async (sessionId, socket) => {
  try {
    const session = activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Associate socket with session
    session.socket = socket;
    session.lastActivity = Date.now();

    return true;
  } catch (error) {
    console.error("Error associating socket with session:", error);
    throw error;
  }
};

/**
 * Send audio data to the Realtime API
 * @param {string} sessionId - Session ID
 * @param {Buffer} audioData - Audio data buffer
 * @returns {Promise<boolean>} Success status
 */
export const sendAudio = async (sessionId, audioData) => {
  try {
    const session = activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Update last activity timestamp
    session.lastActivity = Date.now();

    // Convert buffer to Int16Array
    const audioArray = new Int16Array(audioData.buffer);

    // Send audio to the Realtime API
    session.client.appendInputAudio(audioArray);

    return true;
  } catch (error) {
    console.error("Error sending audio to Realtime API:", error);
    throw error;
  }
};

/**
 * Create a response from the Realtime API
 * @param {string} sessionId - Session ID
 * @returns {Promise<boolean>} Success status
 */
export const createResponse = async (sessionId) => {
  try {
    const session = activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Update last activity timestamp
    session.lastActivity = Date.now();

    // Create response
    session.client.createResponse();

    return true;
  } catch (error) {
    console.error("Error creating response from Realtime API:", error);
    throw error;
  }
};

/**
 * End a Realtime API session
 * @param {string} sessionId - Session ID
 * @returns {Promise<boolean>} Success status
 */
export const endSession = async (sessionId) => {
  try {
    const session = activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    console.log(`🏁 Ending WebRTC session: ${sessionId}`);

    // End persistent session and get summary
    const sessionSummary = await webrtcSessionPersistence.endSession(sessionId);

    // Disconnect from the Realtime API
    await session.client.disconnect();

    // Remove session from memory
    activeSessions.delete(sessionId);

    console.log(`✅ WebRTC session ended successfully: ${sessionId}`);
    return { success: true, summary: sessionSummary };
  } catch (error) {
    console.error("Error ending Realtime API session:", error);
    throw error;
  }
};

/**
 * Get active sessions
 * @returns {Array} Active sessions
 */
export const getActiveSessions = () => {
  return Array.from(activeSessions.values()).map((session) => ({
    id: session.id,
    userId: session.userId,
    startTime: session.startTime,
    lastActivity: session.lastActivity,
  }));
};

/**
 * Handle WebRTC offer from client
 * @param {string} sessionId - Session ID
 * @param {Object} offer - WebRTC offer
 * @returns {Promise<Object>} WebRTC answer
 */
export const handleWebRTCOffer = async (sessionId, offer) => {
  try {
    const session = activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Store the offer
    session.webrtcOffer = offer;
    session.lastActivity = Date.now();

    // Create a mock answer (in a real implementation, this would come from OpenAI's WebRTC endpoint)
    // For now, we'll create a simple SDP answer
    const answer = {
      type: "answer",
      sdp: `v=0
o=- ${Date.now()} 1 IN IP4 0.0.0.0
s=-
t=0 0
a=group:BUNDLE audio
a=msid-semantic: WMS
m=audio 9 UDP/TLS/RTP/SAVPF 111
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=ice-ufrag:${Math.random().toString(36).substring(2, 8)}
a=ice-pwd:${Math.random().toString(36).substring(2, 15)}
a=fingerprint:sha-256 ${Array.from({ length: 32 }, () =>
        Math.floor(Math.random() * 256)
          .toString(16)
          .padStart(2, "0")
      ).join(":")}
a=setup:active
a=mid:audio
a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level
a=recvonly
a=rtcp-mux
a=rtpmap:111 opus/48000/2
a=fmtp:111 minptime=10;useinbandfec=1
`,
    };

    // Store the answer
    session.webrtcAnswer = answer;

    return answer;
  } catch (error) {
    console.error("Error handling WebRTC offer:", error);
    throw error;
  }
};

/**
 * Handle ICE candidate from client
 * @param {string} sessionId - Session ID
 * @param {Object} candidate - ICE candidate
 * @returns {Promise<boolean>} Success status
 */
export const handleICECandidate = async (sessionId, candidate) => {
  try {
    const session = activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Store the candidate
    session.iceCandidates.push(candidate);
    session.lastActivity = Date.now();

    return true;
  } catch (error) {
    console.error("Error handling ICE candidate:", error);
    throw error;
  }
};

export default {
  createSession,
  associateSocket,
  sendAudio,
  createResponse,
  endSession,
  getActiveSessions,
  handleWebRTCOffer,
  handleICECandidate,
};
