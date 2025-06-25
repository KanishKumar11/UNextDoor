/**
 * Realtime Conversation Socket Service
 * Handles WebSocket communication for real-time AI conversations using OpenAI's Realtime API
 */

import { v4 as uuidv4 } from "uuid";
import openaiRealtimeService from "../openaiRealtimeService.js";
import Conversation from "../../models/Conversation.js";
import {
  saveTranscriptToConversation,
  saveAIResponseToConversation,
} from "../conversationService.js";

// Active socket connections
const activeSockets = new Map();

/**
 * Initialize Realtime Conversation socket handlers
 * @param {Object} namespace - Socket.IO namespace
 */
export const initializeRealtimeConversationHandlers = (namespace) => {
  namespace.on("connection", (socket) => {
    console.log(
      `Realtime Conversation WebSocket client connected: ${socket.id} (User: ${socket.user.id})`
    );

    // Initialize user data
    const userId = socket.user.id;
    let activeSessionId = null;

    // Handle session creation
    socket.on("realtime:create-session", async (data, callback) => {
      try {
        const { conversationId, options } = data;
        console.log(
          `Creating Realtime Conversation session for user ${userId}`
        );

        // Create a new conversation if not provided
        let actualConversationId = conversationId;
        if (!actualConversationId) {
          const conversation = new Conversation({
            userId,
            title: options.title || "Realtime Conversation",
            language: options.language || "ko",
            level: options.level || "beginner",
            messages: [],
          });
          await conversation.save();
          actualConversationId = conversation._id.toString();
        }

        // Create a new session with OpenAI Realtime API
        const sessionResult = await openaiRealtimeService.createSession(
          userId,
          {
            ...options,
            instructions:
              options.instructions ||
              `You are a helpful AI language tutor specializing in teaching Korean to English speakers.
            The user's proficiency level is ${options.level || "beginner"}.
            Respond in Korean with English translations when appropriate.
            Keep your responses concise and focused on helping the user learn Korean.`,
          }
        );

        // Associate socket with session
        await openaiRealtimeService.associateSocket(
          sessionResult.sessionId,
          socket
        );

        // Store session ID in socket data
        activeSessionId = sessionResult.sessionId;
        activeSockets.set(socket.id, {
          userId,
          socket,
          activeSessionId,
          conversationId: actualConversationId,
        });

        // Send response
        if (callback) {
          callback({
            success: true,
            sessionId: sessionResult.sessionId,
            conversationId: actualConversationId,
          });
        }

        // Notify client that session has started
        socket.emit("realtime:session-started", {
          sessionId: sessionResult.sessionId,
          conversationId: actualConversationId,
        });

        console.log(
          `Realtime Conversation session started: ${sessionResult.sessionId}`
        );
      } catch (error) {
        console.error("Error creating Realtime Conversation session:", error);
        if (callback) {
          callback({
            success: false,
            error: error.message,
          });
        }
      }
    });

    // Handle WebRTC offer
    socket.on("webrtc:offer", async (data) => {
      try {
        const { sessionId, offer } = data;
        console.log(`Received WebRTC offer for session ${sessionId}`);

        // Validate session
        const socketData = activeSockets.get(socket.id);
        if (!socketData || socketData.activeSessionId !== sessionId) {
          throw new Error("Invalid session ID");
        }

        // Process the offer and generate an answer
        const answer = await openaiRealtimeService.handleWebRTCOffer(
          sessionId,
          offer
        );

        // Send the answer back to the client
        socket.emit("webrtc:answer", {
          sessionId,
          answer,
        });

        console.log(`Sent WebRTC answer for session ${sessionId}`);
      } catch (error) {
        console.error("Error processing WebRTC offer:", error);
        socket.emit("realtime:error", {
          type: "webrtc-offer",
          message: error.message,
        });
      }
    });

    // Handle ICE candidate
    socket.on("webrtc:ice-candidate", async (data) => {
      try {
        const { sessionId, candidate } = data;

        // Validate session
        const socketData = activeSockets.get(socket.id);
        if (!socketData || socketData.activeSessionId !== sessionId) {
          throw new Error("Invalid session ID");
        }

        // Process the ICE candidate
        await openaiRealtimeService.handleICECandidate(sessionId, candidate);

        // In a real implementation, we would forward ICE candidates from OpenAI to the client
        // For now, we'll just acknowledge receipt
      } catch (error) {
        console.error("Error processing ICE candidate:", error);
        socket.emit("realtime:error", {
          type: "ice-candidate",
          message: error.message,
        });
      }
    });

    // Handle audio data
    socket.on("realtime:audio-data", async (data) => {
      try {
        const { sessionId, audioData } = data;

        // Validate session
        const socketData = activeSockets.get(socket.id);
        if (!socketData || socketData.activeSessionId !== sessionId) {
          throw new Error("Invalid session ID");
        }

        // Send audio to OpenAI Realtime API
        await openaiRealtimeService.sendAudio(
          sessionId,
          Buffer.from(audioData)
        );
      } catch (error) {
        console.error("Error processing audio data:", error);
        socket.emit("realtime:error", {
          type: "audio-data",
          message: error.message,
        });
      }
    });

    // Handle create response
    socket.on("realtime:create-response", async (data) => {
      try {
        const { sessionId } = data;

        // Validate session
        const socketData = activeSockets.get(socket.id);
        if (!socketData || socketData.activeSessionId !== sessionId) {
          throw new Error("Invalid session ID");
        }

        // Create response from OpenAI Realtime API
        await openaiRealtimeService.createResponse(sessionId);
      } catch (error) {
        console.error("Error creating response:", error);
        socket.emit("realtime:error", {
          type: "create-response",
          message: error.message,
        });
      }
    });

    // Handle end session
    socket.on("realtime:end-session", async (data) => {
      try {
        const { sessionId } = data;

        // Validate session
        const socketData = activeSockets.get(socket.id);
        if (!socketData || socketData.activeSessionId !== sessionId) {
          throw new Error("Invalid session ID");
        }

        // End session
        await openaiRealtimeService.endSession(sessionId);

        // Clear session data
        socketData.activeSessionId = null;

        // Notify client that session has ended
        socket.emit("realtime:session-ended", {
          sessionId,
        });

        console.log(`Realtime Conversation session ended: ${sessionId}`);
      } catch (error) {
        console.error("Error ending Realtime Conversation session:", error);
        socket.emit("realtime:error", {
          type: "end-session",
          message: error.message,
        });
      }
    });

    // Handle save conversation
    socket.on("realtime:save-conversation", async (data, callback) => {
      try {
        const { sessionId, transcript, response } = data;

        // Validate session
        const socketData = activeSockets.get(socket.id);
        if (!socketData || socketData.activeSessionId !== sessionId) {
          throw new Error("Invalid session ID");
        }

        // Save to conversation
        if (socketData.conversationId) {
          if (transcript) {
            await saveTranscriptToConversation(
              socketData.conversationId,
              userId,
              transcript
            );
          }

          if (response) {
            await saveAIResponseToConversation(
              socketData.conversationId,
              response
            );
          }
        }

        // Send response
        if (callback) {
          callback({
            success: true,
          });
        }
      } catch (error) {
        console.error("Error saving conversation:", error);
        if (callback) {
          callback({
            success: false,
            error: error.message,
          });
        }
      }
    });

    // Handle disconnection
    socket.on("disconnect", async () => {
      console.log(
        `Realtime Conversation WebSocket client disconnected: ${socket.id}`
      );

      // Get socket data
      const socketData = activeSockets.get(socket.id);
      if (socketData && socketData.activeSessionId) {
        try {
          // End session
          await openaiRealtimeService.endSession(socketData.activeSessionId);
          console.log(
            `Realtime Conversation session ended on disconnect: ${socketData.activeSessionId}`
          );
        } catch (error) {
          console.error("Error ending session on disconnect:", error);
        }
      }

      // Remove socket data
      activeSockets.delete(socket.id);
    });
  });
};

export default {
  initializeRealtimeConversationHandlers,
};
