import { sendSuccess, sendError } from "../utils/responseUtils.js";
import * as tutorService from "../services/tutorService.js";
import pronunciationAnalysisService from "../services/pronunciationAnalysisService.js";
import grammarAnalysisService from "../services/grammarAnalysisService.js";
import vocabularyAnalysisService from "../services/vocabularyAnalysisService.js";

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
    const { scenarioId, title, level } = req.body;
    const userId = req.user.id;

    const result = await tutorService.startConversation(
      userId,
      scenarioId,
      title,
      level
    );

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
 * Continue a conversation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const continueConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, audioUrl } = req.body;
    const userId = req.user.id;

    const result = await tutorService.sendMessage(
      id,
      userId,
      message,
      audioUrl
    );

    if (result.error) {
      return sendError(res, 400, result.error);
    }

    return sendSuccess(res, 200, "Message sent successfully", {
      response: result.response,
      feedback: result.feedback,
    });
  } catch (error) {
    console.error("Controller error continuing conversation:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Get conversation history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getConversationHistory = async (req, res) => {
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
    console.error("Controller error getting conversation history:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Analyze speech from audio
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const analyzeSpeech = async (req, res) => {
  try {
    const { audioUrl, language = "ko" } = req.body;

    const result = await tutorService.recognizeSpeech(audioUrl, language);

    if (result.error) {
      return sendError(res, 400, result.error);
    }

    return sendSuccess(res, 200, "Speech analyzed successfully", {
      transcript: result.transcript,
      confidence: result.confidence,
      pronunciation: result.pronunciation,
    });
  } catch (error) {
    console.error("Controller error analyzing speech:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Analyze pronunciation from audio
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const analyzePronunciation = async (req, res) => {
  try {
    console.log("🎤 Pronunciation analysis request received");
    console.log("Request body:", req.body);
    console.log(
      "Request file:",
      req.file ? "Audio file received" : "No audio file"
    );

    // Check if audio file was uploaded
    if (!req.file) {
      console.error("❌ No audio file uploaded");
      return sendError(res, 400, "Audio file is required");
    }

    const { targetText, userLevel = "beginner" } = req.body;

    console.log("Extracted data:", {
      audioFile: !!req.file,
      audioFileSize: req.file.size,
      targetText: !!targetText,
      userLevel,
    });

    // Check if audio file is too small (likely empty)
    if (req.file.size < 1000) {
      console.log("❌ Audio file too small, likely empty recording");
      return sendSuccess(res, "Pronunciation analysis completed", {
        success: true,
        transcribedText: "",
        targetText,
        accuracy: 0,
        phonemeAnalysis: [],
        difficultSounds: [],
        accentFeedback:
          "No audio detected. Please try recording again and speak clearly into the microphone.",
        improvementTips: [
          "Make sure your microphone is working",
          "Speak clearly and loudly enough",
          "Try recording in a quiet environment",
        ],
        strengths: [],
        practiceExercises: [
          "Test your microphone first",
          "Practice speaking the phrase out loud before recording",
        ],
      });
    }

    if (!targetText) {
      console.error("❌ Missing required fields:", {
        targetText: !!targetText,
      });
      return sendError(res, 400, "Target text is required");
    }

    // Pass the audio file buffer to the analysis service
    const result = await pronunciationAnalysisService.analyzePronunciation(
      req.file.buffer,
      targetText,
      userLevel
    );

    if (!result.success) {
      return sendError(
        res,
        400,
        result.error || "Failed to analyze pronunciation"
      );
    }

    return sendSuccess(res, 200, "Pronunciation analyzed successfully", {
      transcribedText: result.transcribedText,
      targetText: result.targetText,
      accuracy: result.accuracy,
      phonemeAnalysis: result.phonemeAnalysis,
      difficultSounds: result.difficultSounds,
      accentFeedback: result.accentFeedback,
      improvementTips: result.improvementTips,
      strengths: result.strengths,
      practiceExercises: result.practiceExercises,
    });
  } catch (error) {
    console.error("Controller error analyzing pronunciation:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Get common pronunciation challenges
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getPronunciationChallenges = async (req, res) => {
  try {
    return sendSuccess(
      res,
      200,
      "Pronunciation challenges retrieved successfully",
      {
        phonemes: pronunciationAnalysisService.koreanPhonemes,
        commonChallenges: pronunciationAnalysisService.commonChallenges,
      }
    );
  } catch (error) {
    console.error("Controller error getting pronunciation challenges:", error);
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
    const { text, userLevel = "beginner" } = req.body;

    if (!text) {
      return sendError(res, 400, "Text is required");
    }

    const result = await grammarAnalysisService.analyzeGrammar(text, userLevel);

    if (!result.success) {
      return sendError(res, 400, result.error || "Failed to analyze grammar");
    }

    return sendSuccess(res, 200, "Grammar analyzed successfully", {
      text: result.text,
      score: result.score,
      corrections: result.corrections,
      grammarRules: result.grammarRules,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      suggestions: result.suggestions,
      nextLevelTips: result.nextLevelTips,
    });
  } catch (error) {
    console.error("Controller error analyzing grammar:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Get grammar rules
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getGrammarRules = async (req, res) => {
  try {
    const { category } = req.query;

    const rules = grammarAnalysisService.getGrammarRules(category);

    return sendSuccess(res, 200, "Grammar rules retrieved successfully", {
      rules,
    });
  } catch (error) {
    console.error("Controller error getting grammar rules:", error);
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
    const { text, userLevel = "beginner" } = req.body;

    if (!text) {
      return sendError(res, 400, "Text is required");
    }

    const result = await vocabularyAnalysisService.analyzeVocabulary(
      text,
      userLevel
    );

    if (!result.success) {
      return sendError(
        res,
        400,
        result.error || "Failed to analyze vocabulary"
      );
    }

    return sendSuccess(res, 200, "Vocabulary analyzed successfully", {
      text: result.text,
      textLevel: result.textLevel,
      words: result.words,
      suggestions: result.suggestions,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      newWords: result.newWords,
      recommendedVocabulary: result.recommendedVocabulary,
    });
  } catch (error) {
    console.error("Controller error analyzing vocabulary:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Get vocabulary by level
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getVocabularyLevel = async (req, res) => {
  try {
    const { level = "beginner" } = req.params;

    const vocabularyLevel =
      vocabularyAnalysisService.getVocabularyByLevel(level);

    return sendSuccess(res, 200, "Vocabulary level retrieved successfully", {
      level,
      ...vocabularyLevel,
    });
  } catch (error) {
    console.error("Controller error getting vocabulary level:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Get vocabulary categories
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getVocabularyCategories = async (req, res) => {
  try {
    const { category } = req.query;

    const categories =
      vocabularyAnalysisService.getVocabularyCategories(category);

    return sendSuccess(
      res,
      200,
      "Vocabulary categories retrieved successfully",
      {
        categories,
      }
    );
  } catch (error) {
    console.error("Controller error getting vocabulary categories:", error);
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
 * Get detailed progress
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getDetailedProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await tutorService.getDetailedProgress(userId);

    if (result.error) {
      return sendError(res, 400, result.error);
    }

    return sendSuccess(res, 200, "Detailed progress retrieved successfully", {
      progress: result.progress,
    });
  } catch (error) {
    console.error("Controller error getting detailed progress:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Complete a lesson
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const completeLesson = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lessonId, performance } = req.body;

    const result = await tutorService.completeLesson(
      userId,
      lessonId,
      performance
    );

    if (result.error) {
      return sendError(res, 400, result.error);
    }

    return sendSuccess(res, 200, "Lesson completed successfully", {
      progress: result.progress,
      achievements: result.achievements,
    });
  } catch (error) {
    console.error("Controller error completing lesson:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Update learning path
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateLearningPath = async (req, res) => {
  try {
    const userId = req.user.id;
    const { preferences } = req.body;

    const result = await tutorService.updateLearningPath(userId, preferences);

    if (result.error) {
      return sendError(res, 400, result.error);
    }

    return sendSuccess(res, 200, "Learning path updated successfully", {
      learningPath: result.learningPath,
    });
  } catch (error) {
    console.error("Controller error updating learning path:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Get daily challenge
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getDailyChallenge = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await tutorService.getDailyChallenge(userId);

    if (result.error) {
      return sendError(res, 400, result.error);
    }

    return sendSuccess(res, 200, "Daily challenge retrieved successfully", {
      challenge: result.challenge,
    });
  } catch (error) {
    console.error("Controller error getting daily challenge:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Submit feedback
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const submitFeedback = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lessonId, rating, comments } = req.body;

    const result = await tutorService.submitFeedback(
      userId,
      lessonId,
      rating,
      comments
    );

    if (result.error) {
      return sendError(res, 400, result.error);
    }

    return sendSuccess(res, 200, "Feedback submitted successfully", {
      feedback: result.feedback,
    });
  } catch (error) {
    console.error("Controller error submitting feedback:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Get vocabulary by level
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getVocabularyByLevel = async (req, res) => {
  try {
    const { level } = req.params;

    const result = await tutorService.getVocabularyByLevel(level);

    if (result.error) {
      return sendError(res, 400, result.error);
    }

    return sendSuccess(res, 200, "Vocabulary retrieved successfully", {
      vocabulary: result.vocabulary,
    });
  } catch (error) {
    console.error("Controller error getting vocabulary by level:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Record practice session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const recordPracticeSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { duration, activityType, performance } = req.body;

    const result = await tutorService.recordPracticeSession(
      userId,
      duration,
      activityType,
      performance
    );

    if (result.error) {
      return sendError(res, 400, result.error);
    }

    return sendSuccess(res, 200, "Practice session recorded successfully", {
      session: result.session,
      progress: result.progress,
    });
  } catch (error) {
    console.error("Controller error recording practice session:", error);
    return sendError(res, 500, "Server error");
  }
};
