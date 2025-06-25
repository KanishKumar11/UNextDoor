/**
 * AI Tutor Service
 * Handles real-time communication for AI language tutoring with audio support
 */

import OpenAI from "openai";
import config from "../config/index.js";
import Conversation from "../models/Conversation.js";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Readable } from "stream";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize OpenAI client with API key from config
const openai = new OpenAI({
  apiKey: config.openai?.apiKey || process.env.OPENAI_API_KEY,
});

// Map to store active sessions
const activeSessions = new Map();

/**
 * Create a new AI tutor session
 *
 * @param {string} userId - User ID
 * @param {string} conversationId - Conversation ID
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Session details
 */
export const createSession = async (userId, conversationId, options = {}) => {
  try {
    console.log(
      `Creating AI tutor session for user ${userId}, conversation ${conversationId}`
    );

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        throw new Error(`Conversation ${conversationId} not found`);
      }
    } else {
      // Create a new conversation if none provided
      conversation = new Conversation({
        userId,
        title: options.title || "New Conversation",
        level: options.level || "beginner", // Must be lowercase to match the enum
        scenarioId: options.scenarioId,
        messages: [],
      });
      await conversation.save();
      conversationId = conversation._id.toString();
    }

    // Create a unique session ID
    const sessionId = uuidv4();

    // Define system message based on scenario
    let systemMessage =
      "You are a helpful Korean language tutor. Respond in Korean and English to help the student learn.";

    if (options.scenarioId) {
      switch (options.scenarioId) {
        case "s1":
          systemMessage =
            "You are a helpful Korean language tutor focusing on greetings and introductions. Teach basic Korean greetings and help the student introduce themselves. Respond in both Korean and English.";
          break;
        case "s2":
          systemMessage =
            "You are a helpful Korean language tutor focusing on ordering food. Teach Korean phrases for ordering in a restaurant. Respond in both Korean and English.";
          break;
        case "s3":
          systemMessage =
            "You are a helpful Korean language tutor focusing on making plans. Teach Korean phrases for scheduling and planning activities. Respond in both Korean and English.";
          break;
        default:
        // Use default system message
      }
    }

    // Store session in active sessions map
    activeSessions.set(sessionId, {
      userId,
      conversationId,
      scenarioId: options.scenarioId,
      startTime: new Date(),
      messages: [
        {
          role: "system",
          content: systemMessage,
        },
      ],
      systemMessage,
    });

    console.log(`AI tutor session created with ID: ${sessionId}`);

    // Return session details
    return {
      sessionId,
      conversationId,
    };
  } catch (error) {
    console.error("Error creating AI tutor session:", error);
    throw error;
  }
};

/**
 * End an AI tutor session
 *
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} Result
 */
export const endSession = async (sessionId) => {
  try {
    const sessionData = activeSessions.get(sessionId);
    if (!sessionData) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Remove from active sessions
    activeSessions.delete(sessionId);

    return { success: true };
  } catch (error) {
    console.error(`Error ending AI tutor session ${sessionId}:`, error);
    throw error;
  }
};

/**
 * Process user message
 *
 * @param {string} sessionId - Session ID
 * @param {string} message - User message
 * @returns {Promise<Object>} AI response
 */
export const processMessage = async (sessionId, message) => {
  try {
    const sessionData = activeSessions.get(sessionId);
    if (!sessionData) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Add user message to session
    sessionData.messages.push({
      role: "user",
      content: message,
    });

    // Get conversation from database
    const conversation = await Conversation.findById(
      sessionData.conversationId
    );
    if (!conversation) {
      throw new Error(`Conversation ${sessionData.conversationId} not found`);
    }

    // Add user message to conversation
    conversation.messages.push({
      role: "user",
      content: message,
      timestamp: new Date(),
    });

    // Update last message timestamp
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Generate AI response
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: sessionData.messages,
      temperature: 0.7,
      max_tokens: 300,
    });

    const aiResponse = response.choices[0].message.content;

    // Add AI response to session
    sessionData.messages.push({
      role: "assistant",
      content: aiResponse,
    });

    // Add AI response to conversation
    conversation.messages.push({
      role: "assistant",
      content: aiResponse,
      timestamp: new Date(),
    });

    // Update last message timestamp
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Generate speech for the AI response (may be null if API quota exceeded)
    const audioData = await generateSpeech(aiResponse);

    return {
      response: aiResponse,
      timestamp: new Date(),
      audioData,
      hasAudio: audioData !== null,
    };
  } catch (error) {
    console.error(`Error processing message for session ${sessionId}:`, error);
    throw error;
  }
};

/**
 * Get session status
 *
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} Session status
 */
export const getSessionStatus = async (sessionId) => {
  try {
    const sessionData = activeSessions.get(sessionId);
    if (!sessionData) {
      throw new Error(`Session ${sessionId} not found`);
    }

    return {
      userId: sessionData.userId,
      conversationId: sessionData.conversationId,
      scenarioId: sessionData.scenarioId,
      duration: Math.floor((new Date() - sessionData.startTime) / 1000),
      messageCount: sessionData.messages.length - 1, // Exclude system message
    };
  } catch (error) {
    console.error(`Error getting status for session ${sessionId}:`, error);
    throw error;
  }
};

/**
 * Get all active sessions
 *
 * @returns {Array} Active sessions
 */
export const getActiveSessions = () => {
  return Array.from(activeSessions.entries()).map(([sessionId, data]) => ({
    sessionId,
    userId: data.userId,
    conversationId: data.conversationId,
    scenarioId: data.scenarioId,
    duration: Math.floor((new Date() - data.startTime) / 1000),
    messageCount: data.messages.length - 1, // Exclude system message
  }));
};

/**
 * Save AI greeting to conversation and generate audio
 *
 * @param {string} sessionId - Session ID
 * @param {string} greeting - Greeting message
 * @returns {Promise<Object>} Result with audio data
 */
export const saveGreeting = async (sessionId, greeting) => {
  try {
    const sessionData = activeSessions.get(sessionId);
    if (!sessionData) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Add greeting to session messages
    sessionData.messages.push({
      role: "assistant",
      content: greeting,
    });

    // Get conversation from database
    const conversation = await Conversation.findById(
      sessionData.conversationId
    );
    if (!conversation) {
      throw new Error(`Conversation ${sessionData.conversationId} not found`);
    }

    // Add greeting to conversation
    conversation.messages.push({
      role: "assistant",
      content: greeting,
      timestamp: new Date(),
    });

    // Update last message timestamp
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Generate speech for the greeting (may be null if API quota exceeded)
    const audioData = await generateSpeech(greeting);

    return {
      success: true,
      audioData,
      hasAudio: audioData !== null,
    };
  } catch (error) {
    console.error(`Error saving greeting for session ${sessionId}:`, error);
    throw error;
  }
};

/**
 * Process audio data from client
 *
 * @param {string} sessionId - Session ID
 * @param {Buffer} audioData - Audio data buffer
 * @returns {Promise<Object>} Processing result with transcript
 */
export const processAudio = async (sessionId, audioData) => {
  try {
    const sessionData = activeSessions.get(sessionId);
    if (!sessionData) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Save audio to a temporary file
    const audioFilePath = path.join(
      uploadsDir,
      `${sessionId}-${Date.now()}.webm`
    );
    fs.writeFileSync(audioFilePath, audioData);

    // Use OpenAI Whisper API to transcribe the audio
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioFilePath),
      model: "whisper-1",
      language: "ko", // Korean language
    });

    // Clean up the temporary file
    fs.unlinkSync(audioFilePath);

    // If we got a transcript, process it as a message
    if (transcription.text) {
      // Process the transcribed message
      const result = await processMessage(sessionId, transcription.text);

      return {
        transcript: transcription.text,
        response: result.response,
        audioData: result.audioData,
        hasAudio: result.hasAudio,
        isFinal: true,
      };
    }

    return {
      transcript: "",
      isFinal: false,
    };
  } catch (error) {
    console.error(`Error processing audio for session ${sessionId}:`, error);
    throw error;
  }
};

/**
 * Generate speech from text
 *
 * @param {string} text - Text to convert to speech
 * @returns {Promise<Buffer|null>} Audio data or null if generation fails
 */
export const generateSpeech = async (text) => {
  try {
    // Use OpenAI TTS API to generate speech
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    });

    // Convert the response to a buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());
    return buffer;
  } catch (error) {
    console.error("Error generating speech:", error);
    // Return null instead of throwing error to allow graceful fallback
    return null;
  }
};

export default {
  createSession,
  endSession,
  processMessage,
  getSessionStatus,
  getActiveSessions,
  saveGreeting,
  processAudio,
  generateSpeech,
};
