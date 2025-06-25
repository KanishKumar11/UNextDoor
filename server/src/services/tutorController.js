import { sendSuccess, sendError } from "../utils/responseUtils.js";
import * as tutorService from "../services/tutorService.js";

/**
 * Get all available scenarios
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getScenarios = async (req, res) => {
  try {
    const { level } = req.query;
    const result = await tutorService.getScenarios(level);

    if (result.error) {
      return sendError(res, 400, result.error);
    }

    return sendSuccess(res, 200, "Scenarios retrieved successfully", {
      scenarios: result.scenarios,
    });
  } catch (error) {
    console.error("Controller error getting scenarios:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Get scenario by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getScenarioById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await tutorService.getScenarioById(id);

    if (result.error) {
      return sendError(res, 400, result.error);
    }

    return sendSuccess(res, 200, "Scenario retrieved successfully", {
      scenario: result.scenario,
    });
  } catch (error) {
    console.error("Controller error getting scenario by ID:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Start a new conversation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const startConversation = async (req, res) => {
  try {
    const { scenarioId } = req.body;
    const userId = req.user.id;

    const result = await tutorService.startConversation(userId, scenarioId);

    if (result.error) {
      return sendError(res, 400, result.error);
    }

    return sendSuccess(res, 201, "Conversation started successfully", {
      conversation: result.conversation,
    });
  } catch (error) {
    console.error("Controller error starting conversation:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Send a message in a conversation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, audioUrl } = req.body;
    const userId = req.user.id;

    const result = await tutorService.sendMessage(id, userId, message, audioUrl);

    if (result.error) {
      return sendError(res, 400, result.error);
    }

    return sendSuccess(res, 200, "Message sent successfully", {
      response: result.response,
      feedback: result.feedback,
    });
  } catch (error) {
    console.error("Controller error sending message:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Get a conversation by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await tutorService.getConversation(id, userId);

    if (result.error) {
      return sendError(res, 400, result.error);
    }

    return sendSuccess(res, 200, "Conversation retrieved successfully", {
      conversation: result.conversation,
    });
  } catch (error) {
    console.error("Controller error getting conversation:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Get all conversations for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const result = await tutorService.getUserConversations(
      userId,
      parseInt(page, 10),
      parseInt(limit, 10)
    );

    if (result.error) {
      return sendError(res, 400, result.error);
    }

    return sendSuccess(res, 200, "Conversations retrieved successfully", {
      conversations: result.conversations,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Controller error getting user conversations:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Recognize speech from audio
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const recognizeSpeech = async (req, res) => {
  try {
    const { audioUrl, language = "ko" } = req.body;

    const result = await tutorService.recognizeSpeech(audioUrl, language);

    if (result.error) {
      return sendError(res, 400, result.error);
    }

    return sendSuccess(res, 200, "Speech recognized successfully", {
      transcript: result.transcript,
      confidence: result.confidence,
      pronunciation: result.pronunciation,
    });
  } catch (error) {
    console.error("Controller error recognizing speech:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Synthesize speech from text
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const synthesizeSpeech = async (req, res) => {
  try {
    const { text, language = "ko", voice = "female" } = req.body;

    const result = await tutorService.synthesizeSpeech(text, language, voice);

    if (result.error) {
      return sendError(res, 400, result.error);
    }

    return sendSuccess(res, 200, "Speech synthesized successfully", {
      audioUrl: result.audioUrl,
    });
  } catch (error) {
    console.error("Controller error synthesizing speech:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Analyze grammar in text
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const analyzeGrammar = async (req, res) => {
  try {
    const { text, language = "ko" } = req.body;

    const result = await tutorService.analyzeGrammar(text, language);

    if (result.error) {
      return sendError(res, 400, result.error);
    }

    return sendSuccess(res, 200, "Grammar analyzed successfully", {
      corrections: result.corrections,
      score: result.score,
    });
  } catch (error) {
    console.error("Controller error analyzing grammar:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Analyze vocabulary in text
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const analyzeVocabulary = async (req, res) => {
  try {
    const { text, language = "ko" } = req.body;

    const result = await tutorService.analyzeVocabulary(text, language);

    if (result.error) {
      return sendError(res, 400, result.error);
    }

    return sendSuccess(res, 200, "Vocabulary analyzed successfully", {
      words: result.words,
      suggestions: result.suggestions,
      level: result.level,
    });
  } catch (error) {
    console.error("Controller error analyzing vocabulary:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Get user progress
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await tutorService.getUserProgress(userId);

    if (result.error) {
      return sendError(res, 400, result.error);
    }

    return sendSuccess(res, 200, "User progress retrieved successfully", {
      progress: result.progress,
    });
  } catch (error) {
    console.error("Controller error getting user progress:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Update user progress
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateUserProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { progressData } = req.body;

    const result = await tutorService.updateUserProgress(userId, progressData);

    if (result.error) {
      return sendError(res, 400, result.error);
    }

    return sendSuccess(res, 200, "User progress updated successfully", {
      progress: result.progress,
    });
  } catch (error) {
    console.error("Controller error updating user progress:", error);
    return sendError(res, 500, "Server error");
  }
};
