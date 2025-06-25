/**
 * Vapi Socket Service
 * Handles WebSocket connections for real-time Vapi communication
 */

import vapiRealTimeService from "../vapiRealTimeService.js";
import { verifyToken } from "../../middleware/authMiddleware.js";

// Map to store active socket connections
const activeSockets = new Map();

/**
 * Initialize Vapi socket handlers
 *
 * @param {Object} vapiNamespace - Vapi namespace from Socket.IO
 */
export const initVapiSocketHandlers = (vapiNamespace) => {
  // Use the provided Vapi namespace

  // Middleware for authentication
  vapiNamespace.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token) {
        return next(new Error("Authentication token is required"));
      }

      // Verify token
      const decoded = await verifyToken(token);
      if (!decoded) {
        return next(new Error("Invalid authentication token"));
      }

      // Store user ID in socket
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Authentication failed"));
    }
  });

  // Handle connections
  vapiNamespace.on("connection", (socket) => {
    console.log(`User ${socket.userId} connected to Vapi socket`);

    // Store socket in active sockets map
    activeSockets.set(socket.id, {
      userId: socket.userId,
      socket,
      activeCall: null,
    });

    // Handle create call
    socket.on("vapi:create-call", async (data, callback) => {
      try {
        const { conversationId, scenarioId, title, level } = data;

        // Create a new call
        const callResult = await vapiRealTimeService.createCall(
          socket.userId,
          conversationId,
          {
            scenarioId,
            title,
            level,
          }
        );

        // Store call ID in socket data
        const socketData = activeSockets.get(socket.id);
        if (socketData) {
          socketData.activeCall = callResult.callId;
        }

        // Send success response
        if (callback) {
          callback({
            success: true,
            callId: callResult.callId,
            conversationId: callResult.conversationId,
          });
        }

        // Emit call created event
        socket.emit("vapi:call-created", {
          callId: callResult.callId,
          conversationId: callResult.conversationId,
        });
      } catch (error) {
        console.error("Error creating Vapi call:", error);

        // Send error response
        if (callback) {
          callback({
            success: false,
            error: error.message || "Failed to create call",
          });
        }

        // Emit error event
        socket.emit("vapi:error", {
          type: "create-call",
          message: error.message || "Failed to create call",
        });
      }
    });

    // Handle end call
    socket.on("vapi:end-call", async (data, callback) => {
      try {
        const { callId } = data;
        const socketData = activeSockets.get(socket.id);

        // Verify call belongs to this socket
        if (!socketData || socketData.activeCall !== callId) {
          throw new Error("Call not found or not owned by this connection");
        }

        // End the call
        await vapiRealTimeService.endCall(callId);

        // Clear active call
        socketData.activeCall = null;

        // Send success response
        if (callback) {
          callback({
            success: true,
          });
        }

        // Emit call ended event
        socket.emit("vapi:call-ended", {
          callId,
        });
      } catch (error) {
        console.error("Error ending Vapi call:", error);

        // Send error response
        if (callback) {
          callback({
            success: false,
            error: error.message || "Failed to end call",
          });
        }

        // Emit error event
        socket.emit("vapi:error", {
          type: "end-call",
          message: error.message || "Failed to end call",
        });
      }
    });

    // Handle audio data
    socket.on("vapi:audio", async (data) => {
      try {
        const { callId, audioChunk } = data;
        const socketData = activeSockets.get(socket.id);

        // Verify call belongs to this socket
        if (!socketData || socketData.activeCall !== callId) {
          throw new Error("Call not found or not owned by this connection");
        }

        // Process audio chunk
        await vapiRealTimeService.processAudio(callId, Buffer.from(audioChunk));
      } catch (error) {
        console.error("Error processing audio:", error);

        // Emit error event
        socket.emit("vapi:error", {
          type: "process-audio",
          message: error.message || "Failed to process audio",
        });
      }
    });

    // Handle transcript
    socket.on("vapi:transcript", async (data) => {
      try {
        const { callId, transcript, isFinal } = data;
        const socketData = activeSockets.get(socket.id);

        // Verify call belongs to this socket
        if (!socketData || socketData.activeCall !== callId) {
          throw new Error("Call not found or not owned by this connection");
        }

        // Save transcript
        await vapiRealTimeService.saveTranscript(callId, transcript, isFinal);

        // Broadcast transcript to all clients for this call
        socket.emit("vapi:transcript-received", {
          callId,
          transcript,
          isFinal,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error saving transcript:", error);

        // Emit error event
        socket.emit("vapi:error", {
          type: "save-transcript",
          message: error.message || "Failed to save transcript",
        });
      }
    });

    // Handle AI response
    socket.on("vapi:ai-response", async (data) => {
      try {
        const { callId, response } = data;
        const socketData = activeSockets.get(socket.id);

        // Verify call belongs to this socket
        if (!socketData || socketData.activeCall !== callId) {
          throw new Error("Call not found or not owned by this connection");
        }

        // Save AI response
        await vapiRealTimeService.saveAIResponse(callId, response);

        // Broadcast AI response to all clients for this call
        socket.emit("vapi:ai-response-received", {
          callId,
          response,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error saving AI response:", error);

        // Emit error event
        socket.emit("vapi:error", {
          type: "save-ai-response",
          message: error.message || "Failed to save AI response",
        });
      }
    });

    // Handle get call status
    socket.on("vapi:get-call-status", async (data, callback) => {
      try {
        const { callId } = data;
        const socketData = activeSockets.get(socket.id);

        // Verify call belongs to this socket
        if (!socketData || socketData.activeCall !== callId) {
          throw new Error("Call not found or not owned by this connection");
        }

        // Get call status
        const status = await vapiRealTimeService.getCallStatus(callId);

        // Send success response
        if (callback) {
          callback({
            success: true,
            status,
          });
        }
      } catch (error) {
        console.error("Error getting call status:", error);

        // Send error response
        if (callback) {
          callback({
            success: false,
            error: error.message || "Failed to get call status",
          });
        }

        // Emit error event
        socket.emit("vapi:error", {
          type: "get-call-status",
          message: error.message || "Failed to get call status",
        });
      }
    });

    // Handle disconnect
    socket.on("disconnect", async () => {
      try {
        console.log(`User ${socket.userId} disconnected from Vapi socket`);

        // Get socket data
        const socketData = activeSockets.get(socket.id);
        if (socketData && socketData.activeCall) {
          // End active call
          await vapiRealTimeService.endCall(socketData.activeCall);
        }

        // Remove socket from active sockets
        activeSockets.delete(socket.id);
      } catch (error) {
        console.error("Error handling disconnect:", error);
      }
    });
  });
};

export default {
  initVapiSocketHandlers,
};
