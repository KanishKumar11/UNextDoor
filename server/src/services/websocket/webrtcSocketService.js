/**
 * Simplified WebRTC Socket Service
 * Handles real-time audio communication without WebRTC peer connections
 */

import { v4 as uuidv4 } from "uuid";
import OpenAI from "openai";
import config from "../../config/index.js";
import Conversation from "../../models/Conversation.js";
import {
  saveTranscriptToConversation,
  saveAIResponseToConversation,
} from "../conversationService.js";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

// Active sessions
const activeSessions = new Map();

/**
 * Initialize WebRTC WebSocket handlers
 * @param {Object} namespace - Socket.IO namespace
 */
export const initializeWebRTCSocketHandlers = (namespace) => {
  namespace.on("connection", (socket) => {
    console.log(
      `WebRTC WebSocket client connected: ${socket.id} (User: ${socket.user.id})`
    );

    // Initialize user data
    const userId = socket.user.id;
    let activeSessionId = null;

    // Handle WebRTC ready event
    socket.on("webrtc:ready", async (data = {}) => {
      try {
        // Log client info if provided
        if (data.platform) {
          console.log(
            `Client platform: ${data.platform}, version: ${
              data.version || "unknown"
            }`
          );
        }

        // Create a new session ID
        const sessionId = uuidv4();

        // Initialize session data
        const session = {
          id: sessionId,
          userId,
          socket,
          startTime: Date.now(),
          lastActivity: Date.now(),
          conversationId: null,
          platform: data.platform || "unknown",
        };

        // Store session
        activeSessions.set(sessionId, session);
        activeSessionId = sessionId;

        // Notify client that session has started
        socket.emit("webrtc:session-started", {
          sessionId,
          message: "Session started successfully",
        });

        console.log(`WebRTC session started: ${sessionId}`);

        // Send a simulated transcript after a short delay
        setTimeout(() => {
          // Only send if session is still active
          if (activeSessions.has(sessionId)) {
            socket.emit("transcript", {
              text: "Hello! I am your AI language tutor. How can I help you today?",
              isFinal: true,
            });
          }
        }, 2000);
      } catch (error) {
        console.error("Error starting WebRTC session:", error);
        socket.emit("error", { message: "Failed to start session" });
      }
    });

    // Handle audio data (simulated)
    socket.on("webrtc:audio", async (data) => {
      try {
        const { sessionId } = data;

        // Validate session
        const session = activeSessions.get(sessionId);
        if (!session) {
          return socket.emit("error", { message: "Invalid session ID" });
        }

        // Update last activity timestamp
        session.lastActivity = Date.now();

        // Simulate processing audio
        simulateAudioProcessing(session);
      } catch (error) {
        console.error("Error processing audio data:", error);
        socket.emit("error", { message: "Failed to process audio data" });
      }
    });

    // Handle conversation start
    socket.on("conversation:start", async (data) => {
      try {
        const { sessionId, conversationId } = data;

        // Validate session
        const session = activeSessions.get(sessionId);
        if (!session) {
          return socket.emit("error", { message: "Invalid session ID" });
        }

        // If conversationId is provided, validate it
        if (conversationId) {
          const conversation = await Conversation.findOne({
            _id: conversationId,
            userId,
          });

          if (!conversation) {
            return socket.emit("error", { message: "Conversation not found" });
          }

          session.conversationId = conversationId;
        } else {
          try {
            // Create a new conversation
            const newConversation = new Conversation({
              userId,
              title: "AI Tutor Conversation",
              level: "intermediate", // Default level
              scenarioId: "default", // Default scenario
              messages: [],
              startedAt: new Date(),
              lastMessageAt: new Date(),
            });

            await newConversation.save();
            session.conversationId = newConversation._id;
          } catch (convError) {
            console.error("Error creating conversation:", convError);
            // Continue without conversation ID
          }
        }

        socket.emit("conversation:started", {
          sessionId,
          conversationId: session.conversationId,
        });
      } catch (error) {
        console.error("Error starting conversation:", error);
        socket.emit("error", { message: "Failed to start conversation" });
      }
    });

    // Handle WebRTC disconnect
    socket.on("webrtc:disconnect", () => {
      cleanupSession();
    });

    // Handle socket disconnect
    socket.on("disconnect", () => {
      console.log(`WebRTC WebSocket client disconnected: ${socket.id}`);
      cleanupSession();
    });

    /**
     * Clean up session resources
     */
    const cleanupSession = () => {
      if (activeSessionId) {
        // Remove session
        activeSessions.delete(activeSessionId);
        activeSessionId = null;
      }
    };
  });

  // Set up session cleanup interval
  setInterval(() => {
    const now = Date.now();

    // Clean up sessions that have been inactive for more than 30 minutes
    for (const [sessionId, session] of activeSessions.entries()) {
      if (now - session.lastActivity > 30 * 60 * 1000) {
        console.log(`Cleaning up inactive session: ${sessionId}`);
        activeSessions.delete(sessionId);
      }
    }
  }, 5 * 60 * 1000); // Run every 5 minutes
};

/**
 * Simulate audio processing and generate responses
 * @param {Object} session - Session object
 */
const simulateAudioProcessing = async (session) => {
  try {
    // Simulate interim transcription
    session.socket.emit("transcript", {
      text: "Processing your speech...",
      isFinal: false,
    });

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate a random user message
    const userMessages = [
      "Hello, how are you today?",
      "I want to learn Korean.",
      "Can you teach me some basic phrases?",
      'How do I say "thank you" in Korean?',
      "What is your name?",
    ];

    const randomIndex = Math.floor(Math.random() * userMessages.length);
    const userMessage = userMessages[randomIndex];

    // Send final transcript to client
    session.socket.emit("transcript", {
      text: userMessage,
      isFinal: true,
    });

    // Generate AI response
    setTimeout(async () => {
      try {
        // AI responses corresponding to user messages
        const aiResponses = [
          "I'm doing well, thank you! How can I help you with your Korean learning today?",
          "That's great! Korean is a fascinating language. Would you like to start with some basic greetings?",
          'Of course! Let\'s start with "안녕하세요" (annyeonghaseyo) which means "hello".',
          '"감사합니다" (gamsahamnida) is "thank you" in Korean. For a more casual "thanks", you can say "고마워" (gomawo).',
          'My name is AI Tutor. In Korean, you can say "제 이름은 AI Tutor 입니다" (je ireumeun AI Tutor imnida).',
        ];

        const aiResponse = aiResponses[randomIndex];

        // Save to conversation if we have a conversation ID
        if (session.conversationId) {
          try {
            await saveTranscriptToConversation(
              session.conversationId,
              session.userId,
              userMessage
            );

            await saveAIResponseToConversation(
              session.conversationId,
              aiResponse
            );
          } catch (saveError) {
            console.error("Error saving to conversation:", saveError);
            // Continue even if saving fails
          }
        }

        // Send AI response to client
        session.socket.emit("ai-response", {
          text: aiResponse,
          audioUrl: `https://example.com/audio/${session.id}/${Date.now()}.mp3`,
        });
      } catch (responseError) {
        console.error("Error generating AI response:", responseError);
        session.socket.emit("error", {
          message: "Failed to generate AI response",
        });
      }
    }, 1000);
  } catch (error) {
    console.error("Error in simulateAudioProcessing:", error);
    session.socket.emit("error", { message: "Failed to process audio" });
  }
};
