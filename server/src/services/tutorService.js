import mongoose from "mongoose";
import OpenAI from "openai";
import config from "../config/index.js";
import Scenario from "../models/Scenario.js";
import Conversation from "../models/Conversation.js";
import UserProgress from "../models/UserProgress.js";
import User from "../models/User.js";
import { uploadAudio, getAudioUrl } from "../utils/storageUtils.js";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

/**
 * Get all available scenarios
 * @param {string} level - Optional level filter (beginner, intermediate, advanced)
 * @returns {Promise<Object>} Result with scenarios or error
 */
export const getScenarios = async (level) => {
  try {
    const query = {};

    if (level) {
      query.level = level.toLowerCase();
    }

    const scenarios = await Scenario.find(query).sort({ order: 1 });

    return {
      success: true,
      scenarios,
    };
  } catch (error) {
    console.error("Error getting scenarios:", error);
    return { error: "Server error" };
  }
};

/**
 * Get scenario by ID
 * @param {string} id - Scenario ID
 * @returns {Promise<Object>} Result with scenario or error
 */
export const getScenarioById = async (id) => {
  try {
    if (!id) {
      return { error: "Scenario ID is required" };
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { error: "Invalid scenario ID format" };
    }

    const scenario = await Scenario.findById(id);

    if (!scenario) {
      return { error: "Scenario not found" };
    }

    return {
      success: true,
      scenario,
    };
  } catch (error) {
    console.error("Error getting scenario by ID:", error);
    return { error: "Server error" };
  }
};

/**
 * Start a new conversation
 * @param {string} userId - User ID
 * @param {string} scenarioId - Scenario ID (optional for free conversation)
 * @param {string} title - Conversation title
 * @param {string} level - Conversation level (beginner, intermediate, advanced)
 * @returns {Promise<Object>} Result with conversation or error
 */
export const startConversation = async (userId, scenarioId, title, level) => {
  try {
    if (!userId) {
      return { error: "User ID is required" };
    }

    // Validate required fields
    if (!title) {
      return { error: "Title is required" };
    }

    // Get user to check their proficiency level preference if level is not provided
    let userLevel = level;
    if (!userLevel) {
      const user = await User.findById(userId);
      if (!user) {
        return { error: "User not found" };
      }

      // Use user's preference from profile, or default to beginner
      userLevel =
        (user.preferences && user.preferences.languageLevel) || "beginner";
    }

    // Validate level enum
    const validLevels = ["beginner", "intermediate", "advanced"];
    if (!validLevels.includes(userLevel.toLowerCase())) {
      return {
        error: "Level must be one of: beginner, intermediate, advanced",
      };
    }

    let scenario = null;
    let validScenarioId = null;

    if (scenarioId && scenarioId !== "free") {
      if (!mongoose.Types.ObjectId.isValid(scenarioId)) {
        return { error: "Invalid scenario ID format" };
      }

      scenario = await Scenario.findById(scenarioId);

      if (!scenario) {
        return { error: "Scenario not found" };
      }

      validScenarioId = scenario._id;
    }

    // Import scenario prompts
    const { getScenarioPrompt, getLevelBasedPrompt } = await import(
      "../data/scenarioPrompts.js"
    );

    // Create initial system message based on user level
    let systemMessage;
    if (scenario) {
      // Use scenario-specific prompt with user level
      systemMessage = getScenarioPrompt(scenarioId, userLevel.toLowerCase());
    } else {
      // Use general prompt with user level
      systemMessage = getLevelBasedPrompt(userLevel.toLowerCase());
    }

    // Create initial AI greeting based on user level
    let aiGreeting;
    if (scenario) {
      aiGreeting = `안녕하세요! 오늘은 '${scenario.title}' 시나리오를 연습해 보겠습니다. 준비되셨나요? (Hello! Today we'll practice the '${scenario.title}' scenario. Are you ready?)`;
    } else {
      aiGreeting =
        "안녕하세요! 저는 당신의 한국어 튜터입니다. 어떻게 도와드릴까요? (Hello! I'm your Korean language tutor. How can I help you today?)";
    }

    // Create new conversation
    const conversation = new Conversation({
      userId,
      scenarioId: validScenarioId, // Use the validated scenarioId (null for free conversations)
      title: title || (scenario ? scenario.title : "Free Conversation"),
      level: userLevel.toLowerCase(),
      languageCode: "ko", // Use languageCode instead of language
      messages: [
        {
          role: "system",
          content: systemMessage,
        },
        {
          role: "assistant",
          content: aiGreeting,
        },
      ],
      startedAt: new Date(),
      lastMessageAt: new Date(),
    });

    await conversation.save();

    return {
      success: true,
      conversation: {
        id: conversation._id,
        title: conversation.title,
        level: conversation.level,
        messages: conversation.messages.filter((msg) => msg.role !== "system"),
        startedAt: conversation.startedAt,
      },
    };
  } catch (error) {
    console.error("Error starting conversation:", error);
    return { error: "Server error" };
  }
};

/**
 * Send a message in a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID
 * @param {string} message - Message text
 * @param {string} audioUrl - Audio URL (optional)
 * @returns {Promise<Object>} Result with AI response or error
 */
export const sendMessage = async (
  conversationId,
  userId,
  message,
  audioUrl
) => {
  try {
    if (!conversationId || !userId) {
      return { error: "Conversation ID and user ID are required" };
    }

    if (!message && !audioUrl) {
      return { error: "Message or audio is required" };
    }

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return { error: "Invalid conversation ID format" };
    }

    // Find conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId,
    });

    if (!conversation) {
      return { error: "Conversation not found" };
    }

    // If audio was provided but no message, transcribe the audio
    let userMessage = message;
    if (!userMessage && audioUrl) {
      const transcriptionResult = await recognizeSpeech(audioUrl);
      if (transcriptionResult.error) {
        return { error: transcriptionResult.error };
      }
      userMessage = transcriptionResult.transcript;
    }

    // Add user message to conversation
    conversation.messages.push({
      role: "user",
      content: userMessage,
      audioUrl,
    });

    // Get conversation history for context
    const messageHistory = conversation.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Generate AI response using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messageHistory,
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiResponse = completion.choices[0].message.content;

    // Add AI response to conversation
    conversation.messages.push({
      role: "assistant",
      content: aiResponse,
    });

    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Generate feedback on user's message
    const feedback = await generateFeedback(userMessage);

    // Update user progress
    await updateUserProgressFromMessage(userId, userMessage, feedback);

    return {
      success: true,
      response: {
        content: aiResponse,
        timestamp: new Date(),
      },
      feedback,
    };
  } catch (error) {
    console.error("Error sending message:", error);
    return { error: "Server error" };
  }
};

/**
 * Generate feedback on user's Korean message
 * @param {string} message - User message
 * @returns {Promise<Object>} Feedback object
 */
const generateFeedback = async (message) => {
  try {
    const prompt = `
      Analyze the following Korean text and provide feedback:
      "${message}"

      Provide feedback in the following JSON format:
      {
        "grammar": {
          "errors": [
            {"text": "incorrect text", "correction": "correct text", "explanation": "explanation"}
          ],
          "score": 0-100
        },
        "vocabulary": {
          "level": "beginner/intermediate/advanced",
          "suggestions": ["alternative word or phrase", "another alternative"]
        },
        "pronunciation": {
          "difficult_sounds": ["sound", "another sound"],
          "tips": ["tip for improvement", "another tip"]
        }
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const feedbackText = completion.choices[0].message.content;
    return JSON.parse(feedbackText);
  } catch (error) {
    console.error("Error generating feedback:", error);
    return {
      grammar: { errors: [], score: 0 },
      vocabulary: { level: "unknown", suggestions: [] },
      pronunciation: { difficult_sounds: [], tips: [] },
    };
  }
};

/**
 * Update user progress based on message and feedback
 * @param {string} userId - User ID
 * @param {string} message - User message
 * @param {Object} feedback - Feedback object
 * @returns {Promise<void>}
 */
const updateUserProgressFromMessage = async (userId, message, feedback) => {
  try {
    // Find or create user progress
    let userProgress = await UserProgress.findOne({ userId });

    if (!userProgress) {
      userProgress = new UserProgress({
        userId,
        fluencyScore: 0,
        grammarScore: 0,
        pronunciationScore: 0,
        vocabularyScore: 0,
        messageCount: 0,
        wordCount: 0,
        lastActiveDate: new Date(),
      });
    }

    // Update progress based on feedback
    userProgress.messageCount += 1;
    userProgress.wordCount += message.split(/\s+/).length;
    userProgress.lastActiveDate = new Date();

    // Update scores (simple weighted average)
    if (feedback.grammar && typeof feedback.grammar.score === "number") {
      userProgress.grammarScore =
        userProgress.grammarScore * 0.7 + feedback.grammar.score * 0.3;
    }

    // Save progress
    await userProgress.save();
  } catch (error) {
    console.error("Error updating user progress:", error);
  }
};

/**
 * Get a conversation by ID
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result with conversation or error
 */
export const getConversation = async (conversationId, userId) => {
  try {
    if (!conversationId || !userId) {
      return { error: "Conversation ID and user ID are required" };
    }

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return { error: "Invalid conversation ID format" };
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId,
    });

    if (!conversation) {
      return { error: "Conversation not found" };
    }

    return {
      success: true,
      conversation: {
        id: conversation._id,
        scenarioId: conversation.scenarioId,
        title: conversation.title,
        level: conversation.level,
        messages: conversation.messages.filter((msg) => msg.role !== "system"),
        startedAt: conversation.startedAt,
        lastMessageAt: conversation.lastMessageAt,
      },
    };
  } catch (error) {
    console.error("Error getting conversation:", error);
    return { error: "Server error" };
  }
};

/**
 * Get all conversations for a user
 * @param {string} userId - User ID
 * @param {number} page - Page number
 * @param {number} limit - Number of items per page
 * @returns {Promise<Object>} Result with conversations or error
 */
export const getUserConversations = async (userId, page = 1, limit = 10) => {
  try {
    if (!userId) {
      return { error: "User ID is required" };
    }

    const skip = (page - 1) * limit;

    const conversations = await Conversation.find({ userId })
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Conversation.countDocuments({ userId });

    const mappedConversations = conversations.map((conv) => ({
      id: conv._id,
      scenarioId: conv.scenarioId,
      title: conv.title,
      level: conv.level,
      messageCount: conv.messages.filter((msg) => msg.role !== "system").length,
      startedAt: conv.startedAt,
      lastMessageAt: conv.lastMessageAt,
    }));

    return {
      success: true,
      conversations: mappedConversations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error getting user conversations:", error);
    return { error: "Server error" };
  }
};

/**
 * Recognize speech from audio
 * @param {string} audioUrl - Audio URL
 * @param {string} language - Language code
 * @returns {Promise<Object>} Result with transcript or error
 */
export const recognizeSpeech = async (audioUrl, language = "ko") => {
  try {
    if (!audioUrl) {
      return { error: "Audio URL is required" };
    }

    // In a real implementation, this would use Vapi or another speech recognition service
    // For now, we'll simulate it with OpenAI

    const transcription = await openai.audio.transcriptions.create({
      file: await fetch(audioUrl).then((res) => res.blob()),
      model: "whisper-1",
      language,
    });

    return {
      success: true,
      transcript: transcription.text,
      confidence: 0.9, // Simulated confidence score
      pronunciation: {
        score: 85, // Simulated pronunciation score
        difficultSounds: [],
      },
    };
  } catch (error) {
    console.error("Error recognizing speech:", error);
    return { error: "Speech recognition failed" };
  }
};

/**
 * Synthesize speech from text
 * @param {string} text - Text to synthesize
 * @param {string} language - Language code
 * @param {string} voice - Voice type
 * @returns {Promise<Object>} Result with audio URL or error
 */
export const synthesizeSpeech = async (
  text,
  language = "ko",
  voice = "female"
) => {
  try {
    if (!text) {
      return { error: "Text is required" };
    }

    // In a real implementation, this would use Vapi or another TTS service
    // For now, we'll simulate it

    // Simulate audio generation
    const audioData = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice === "female" ? "nova" : "echo",
      input: text,
    });

    // Convert to buffer
    const buffer = Buffer.from(await audioData.arrayBuffer());

    // Upload to storage
    const fileName = `speech_${Date.now()}.mp3`;
    const audioUrl = await uploadAudio(buffer, fileName);

    return {
      success: true,
      audioUrl,
    };
  } catch (error) {
    console.error("Error synthesizing speech:", error);
    return { error: "Speech synthesis failed" };
  }
};

/**
 * Analyze grammar in text
 * @param {string} text - Text to analyze
 * @param {string} language - Language code
 * @returns {Promise<Object>} Result with grammar analysis or error
 */
export const analyzeGrammar = async (text, language = "ko") => {
  try {
    if (!text) {
      return { error: "Text is required" };
    }

    const prompt = `
      Analyze the grammar in this Korean text:
      "${text}"

      Provide corrections and explanations in JSON format:
      {
        "corrections": [
          {
            "original": "incorrect phrase",
            "corrected": "correct phrase",
            "explanation": "explanation of the grammar rule"
          }
        ],
        "score": 0-100
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content);

    return {
      success: true,
      corrections: result.corrections,
      score: result.score,
    };
  } catch (error) {
    console.error("Error analyzing grammar:", error);
    return { error: "Grammar analysis failed" };
  }
};

/**
 * Analyze vocabulary in text
 * @param {string} text - Text to analyze
 * @param {string} language - Language code
 * @returns {Promise<Object>} Result with vocabulary analysis or error
 */
export const analyzeVocabulary = async (text, language = "ko") => {
  try {
    if (!text) {
      return { error: "Text is required" };
    }

    const prompt = `
      Analyze the vocabulary in this Korean text:
      "${text}"

      Provide analysis in JSON format:
      {
        "words": [
          {
            "word": "Korean word",
            "meaning": "English meaning",
            "level": "beginner/intermediate/advanced"
          }
        ],
        "suggestions": [
          {
            "original": "original word",
            "alternative": "better word",
            "reason": "reason for suggestion"
          }
        ],
        "level": "beginner/intermediate/advanced"
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content);

    return {
      success: true,
      words: result.words,
      suggestions: result.suggestions,
      level: result.level,
    };
  } catch (error) {
    console.error("Error analyzing vocabulary:", error);
    return { error: "Vocabulary analysis failed" };
  }
};

/**
 * Get user progress
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result with progress or error
 */
export const getUserProgress = async (userId) => {
  try {
    if (!userId) {
      return { error: "User ID is required" };
    }

    const progress = await UserProgress.findOne({ userId });

    if (!progress) {
      return {
        success: true,
        progress: {
          fluencyScore: 0,
          grammarScore: 0,
          pronunciationScore: 0,
          vocabularyScore: 0,
          messageCount: 0,
          wordCount: 0,
          lastActiveDate: null,
        },
      };
    }

    return {
      success: true,
      progress,
    };
  } catch (error) {
    console.error("Error getting user progress:", error);
    return { error: "Server error" };
  }
};

/**
 * Update user progress
 * @param {string} userId - User ID
 * @param {Object} progressData - Progress data
 * @returns {Promise<Object>} Result with updated progress or error
 */
export const updateUserProgress = async (userId, progressData) => {
  try {
    if (!userId) {
      return { error: "User ID is required" };
    }

    if (!progressData) {
      return { error: "Progress data is required" };
    }

    let progress = await UserProgress.findOne({ userId });

    if (!progress) {
      progress = new UserProgress({
        userId,
        ...progressData,
        lastActiveDate: new Date(),
      });
    } else {
      // Update only provided fields
      Object.keys(progressData).forEach((key) => {
        if (progress[key] !== undefined) {
          progress[key] = progressData[key];
        }
      });

      progress.lastActiveDate = new Date();
    }

    await progress.save();

    return {
      success: true,
      progress,
    };
  } catch (error) {
    console.error("Error updating user progress:", error);
    return { error: "Server error" };
  }
};

/**
 * Record practice session
 * @param {string} userId - User ID
 * @param {number} duration - Session duration in seconds
 * @param {string} activityType - Type of activity (conversation, vocabulary, etc.)
 * @param {number} performance - Performance score (0-100)
 * @returns {Promise<Object>} Result with session and progress or error
 */
export const recordPracticeSession = async (
  userId,
  duration,
  activityType,
  performance = 0
) => {
  try {
    if (!userId) {
      return { error: "User ID is required" };
    }

    if (!duration || duration <= 0) {
      return { error: "Valid duration is required" };
    }

    if (!activityType) {
      return { error: "Activity type is required" };
    }

    // Find or create user progress
    let userProgress = await UserProgress.findOne({ userId });

    if (!userProgress) {
      userProgress = new UserProgress({
        userId,
        totalLearningTime: 0,
        practiceSessionsCompleted: 0,
        lastActiveDate: new Date(),
      });
    }

    // Update practice session data
    userProgress.totalLearningTime += duration;
    userProgress.practiceSessionsCompleted += 1;
    userProgress.lastActiveDate = new Date();

    // Update streak if this is a new day
    const today = new Date();
    const lastActiveDate = userProgress.lastActiveDate || new Date(0);
    const daysDiff = Math.floor(
      (today - lastActiveDate) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 1) {
      // Consecutive day, increment streak
      userProgress.currentStreak = (userProgress.currentStreak || 0) + 1;
      userProgress.longestStreak = Math.max(
        userProgress.longestStreak || 0,
        userProgress.currentStreak
      );
    } else if (daysDiff > 1) {
      // Streak broken, reset to 1
      userProgress.currentStreak = 1;
    }
    // If daysDiff === 0, it's the same day, don't change streak

    // Save updated progress
    await userProgress.save();

    // Create practice session record
    const sessionRecord = {
      userId,
      duration,
      activityType,
      performance,
      timestamp: new Date(),
    };

    return {
      success: true,
      session: sessionRecord,
      progress: {
        totalLearningTime: userProgress.totalLearningTime,
        practiceSessionsCompleted: userProgress.practiceSessionsCompleted,
        currentStreak: userProgress.currentStreak,
        longestStreak: userProgress.longestStreak,
      },
    };
  } catch (error) {
    console.error("Error recording practice session:", error);
    return { error: "Server error" };
  }
};
