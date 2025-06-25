/**
 * AI Tutor Socket Service
 * Handles WebSocket communication for AI language tutoring
 */

import aiTutorService from "../aiTutorService.js";

// Map to store active socket connections
const activeSockets = new Map();

/**
 * Initialize AI Tutor socket handlers
 *
 * @param {Object} tutorNamespace - Tutor namespace from Socket.IO
 */
export const initAITutorSocketHandlers = (tutorNamespace) => {
  // Middleware for authentication
  tutorNamespace.use(async (socket, next) => {
    try {
      // Authentication is handled by the main WebSocket middleware
      // Just check if user data is attached to the socket
      if (!socket.user || !socket.user.id) {
        return next(new Error("Authentication required"));
      }
      next();
    } catch (error) {
      console.error("AI Tutor socket authentication error:", error);
      next(new Error("Authentication failed"));
    }
  });

  // Handle connection
  tutorNamespace.on("connection", (socket) => {
    const userId = socket.user.id;
    console.log(`User ${userId} connected to AI Tutor socket`);

    // Store socket connection
    activeSockets.set(socket.id, {
      userId,
      socket,
      activeSessionId: null,
    });

    // Handle create session
    socket.on("tutor:create-session", async (data, callback) => {
      try {
        const { conversationId, scenarioId, title, level } = data;
        console.log(
          `Creating AI tutor session for user ${userId}, conversation ${conversationId}`
        );

        // Create a new session
        const result = await aiTutorService.createSession(
          userId,
          conversationId,
          {
            scenarioId,
            title,
            level,
          }
        );

        // Store session ID in socket data
        const socketData = activeSockets.get(socket.id);
        if (socketData) {
          socketData.activeSessionId = result.sessionId;
        }

        // Send response
        if (callback) {
          callback({
            success: true,
            sessionId: result.sessionId,
            conversationId: result.conversationId,
          });
        }

        // Emit session created event
        socket.emit("tutor:session-created", {
          sessionId: result.sessionId,
          conversationId: result.conversationId,
        });

        // Send initial greeting after a short delay
        setTimeout(async () => {
          try {
            // Get scenario-specific greeting
            let greeting =
              "안녕하세요! 저는 당신의 한국어 튜터입니다. 어떻게 도와드릴까요? (Hello! I am your Korean tutor. How can I help you?)";

            if (scenarioId) {
              switch (scenarioId) {
                case "s1":
                  greeting =
                    "안녕하세요! 오늘은 인사와 자기소개에 대해 연습해 보겠습니다. 먼저, 안녕하세요! 저는 당신의 한국어 튜터입니다. 당신은 어떻게 지내세요? (Hello! Today we'll practice greetings and introductions. First, hello! I am your Korean tutor. How are you doing?)";
                  break;
                case "s2":
                  greeting =
                    "안녕하세요! 오늘은 음식 주문하는 방법에 대해 연습해 보겠습니다. 한국 식당에서 주문할 때 사용할 수 있는 표현을 배워봅시다. 뭐 먹고 싶으세요? (Hello! Today we'll practice ordering food. Let's learn expressions you can use when ordering at a Korean restaurant. What would you like to eat?)";
                  break;
                case "s3":
                  greeting =
                    "안녕하세요! 오늘은 계획 세우기에 대해 연습해 보겠습니다. 약속을 잡거나 일정을 계획할 때 사용하는 표현을 배워봅시다. 이번 주말에 무슨 계획이 있으세요? (Hello! Today we'll practice making plans. Let's learn expressions used when making appointments or planning schedules. Do you have any plans for this weekend?)";
                  break;
                default:
                // Use default greeting
              }
            }

            // Save greeting to conversation and get audio (if available)
            const greetingResult = await aiTutorService.saveGreeting(
              result.sessionId,
              greeting
            );

            // Send AI greeting with audio (if available)
            socket.emit("tutor:ai-response", {
              sessionId: result.sessionId,
              response: greeting,
              timestamp: new Date(),
              audioData: greetingResult.audioData,
              hasAudio: greetingResult.hasAudio || false,
            });
          } catch (error) {
            console.error("Error sending initial greeting:", error);
          }
        }, 1000);
      } catch (error) {
        console.error("Error creating AI tutor session:", error);
        if (callback) {
          callback({
            success: false,
            error: error.message,
          });
        }
        socket.emit("tutor:error", {
          type: "create-session",
          message: error.message,
        });
      }
    });

    // Handle end session
    socket.on("tutor:end-session", async (data, callback) => {
      try {
        const { sessionId } = data;
        console.log(`Ending AI tutor session ${sessionId} for user ${userId}`);

        // Check if session exists and belongs to user
        const socketData = activeSockets.get(socket.id);
        if (!socketData || socketData.activeSessionId !== sessionId) {
          throw new Error("Invalid session ID");
        }

        // End the session
        await aiTutorService.endSession(sessionId);

        // Clear session ID in socket data
        socketData.activeSessionId = null;

        // Send response
        if (callback) {
          callback({
            success: true,
          });
        }

        // Emit session ended event
        socket.emit("tutor:session-ended", {
          sessionId,
        });
      } catch (error) {
        console.error("Error ending AI tutor session:", error);
        if (callback) {
          callback({
            success: false,
            error: error.message,
          });
        }
        socket.emit("tutor:error", {
          type: "end-session",
          message: error.message,
        });
      }
    });

    // Handle user message
    socket.on("tutor:send-message", async (data, callback) => {
      try {
        const { sessionId, message } = data;
        console.log(
          `Processing message for session ${sessionId} from user ${userId}`
        );

        // Check if session exists and belongs to user
        const socketData = activeSockets.get(socket.id);
        if (!socketData || socketData.activeSessionId !== sessionId) {
          throw new Error("Invalid session ID");
        }

        // Process the message
        const result = await aiTutorService.processMessage(sessionId, message);

        // Send response
        if (callback) {
          callback({
            success: true,
            response: result.response,
            timestamp: result.timestamp,
          });
        }

        // Emit AI response event with audio (if available)
        socket.emit("tutor:ai-response", {
          sessionId,
          response: result.response,
          timestamp: result.timestamp,
          audioData: result.audioData,
          hasAudio: result.hasAudio || false,
        });
      } catch (error) {
        console.error("Error processing message:", error);
        if (callback) {
          callback({
            success: false,
            error: error.message,
          });
        }
        socket.emit("tutor:error", {
          type: "send-message",
          message: error.message,
        });
      }
    });

    // Handle audio data
    socket.on("tutor:audio-data", async (data) => {
      try {
        const { sessionId, audioData } = data;

        console.log(
          `Received audio data for session ${sessionId} from user ${userId}`
        );

        // Check if session exists and belongs to user
        const socketData = activeSockets.get(socket.id);
        if (!socketData || socketData.activeSessionId !== sessionId) {
          throw new Error("Invalid session ID");
        }

        // Process the audio data using Whisper API
        const result = await aiTutorService.processAudio(
          sessionId,
          Buffer.from(audioData)
        );

        // Send the transcript to the client
        if (result.transcript) {
          socket.emit("tutor:transcript", {
            sessionId,
            transcript: result.transcript,
            isFinal: true,
          });
        }

        // Send the AI response with audio (if available)
        if (result.response) {
          socket.emit("tutor:ai-response", {
            sessionId,
            response: result.response,
            timestamp: new Date(),
            audioData: result.audioData,
            hasAudio: result.hasAudio || false,
          });
        }
      } catch (error) {
        console.error("Error processing audio data:", error);
        socket.emit("tutor:error", {
          type: "audio-data",
          message: error.message,
        });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User ${userId} disconnected from AI Tutor socket`);

      // Get socket data
      const socketData = activeSockets.get(socket.id);
      if (socketData && socketData.activeSessionId) {
        // End active session
        aiTutorService
          .endSession(socketData.activeSessionId)
          .catch((error) =>
            console.error(
              `Error ending session on disconnect: ${error.message}`
            )
          );
      }

      // Remove socket from active sockets
      activeSockets.delete(socket.id);
    });
  });
};

export default {
  initAITutorSocketHandlers,
};
