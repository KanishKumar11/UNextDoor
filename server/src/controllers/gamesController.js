import { sendSuccess, sendError } from "../utils/responseUtils.js";
import GameResult from "../models/GameResult.js";
import User from "../models/User.js";
import { GAME_TYPES } from "../constants/appConstants.js";
import xpService from "../services/xpService.js";
import {
  getMatchWordContent,
  getSentenceScrambleContent,
  getPronunciationContent,
  getConversationScenario,
  getRecentlyUsedContent,
} from "../data/gameContent.js";

/**
 * Get available games
 * @route GET /api/games
 * @access Public
 */
export const getAvailableGames = async (req, res) => {
  try {
    // Return comprehensive list of games with rich content support
    const games = [
      {
        id: "match-word",
        name: "Match the Word",
        description: "Match the Korean word to its English translation.",
        icon: "grid-outline",
        color: "#6FC953",
        difficulty: "beginner",
        type: GAME_TYPES.MATCHING,
        contentCount: 225, // Total vocabulary items available
        sessionSize: 10,
      },
      {
        id: "sentence-scramble",
        name: "Sentence Scramble",
        description:
          "Rearrange the words to form a grammatically correct Korean sentence.",
        icon: "shuffle-outline",
        color: "#3498db",
        difficulty: "intermediate",
        type: GAME_TYPES.WORD_ORDER,
        contentCount: 45, // Total sentences available
        sessionSize: 5,
      },
      {
        id: "pronunciation-challenge",
        name: "Pronunciation Challenge",
        description:
          "Record yourself speaking Korean and get feedback on your pronunciation.",
        icon: "mic-outline",
        color: "#9b59b6",
        difficulty: "all-levels",
        type: GAME_TYPES.PRONUNCIATION,
        contentCount: 40, // Total phrases available
        sessionSize: 5,
      },
      {
        id: "conversation-quest",
        name: "Conversation Quest",
        description:
          "Practice real-time conversations with Cooper, your AI language tutor.",
        icon: "chatbubbles-outline",
        color: "#e74c3c",
        difficulty: "all-levels",
        type: "CONVERSATION",
        contentCount: 13, // Total scenarios available
        sessionSize: 1,
      },
    ];

    sendSuccess(res, 200, "Games retrieved successfully", { games });
  } catch (error) {
    console.error("Error getting available games:", error);
    sendError(res, 500, "Error retrieving games");
  }
};

/**
 * Get game results for a specific lesson
 * @route GET /api/games/results/:gameType/:lessonId
 * @access Private
 */
export const getGameResults = async (req, res) => {
  try {
    const { gameType, lessonId } = req.params;
    const userId = req.user.id;

    // Validate game type
    if (
      !Object.values(GAME_TYPES).includes(gameType) &&
      !["match-word", "sentence-scramble", "pronunciation-challenge"].includes(
        gameType
      )
    ) {
      return sendError(res, 400, "Invalid game type");
    }

    // Get game results for this user, game type, and lesson
    const results = await GameResult.find({
      userId,
      gameType,
      lessonId,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    sendSuccess(res, 200, "Game results retrieved successfully", { results });
  } catch (error) {
    console.error("Error getting game results:", error);
    sendError(res, 500, "Error retrieving game results");
  }
};

/**
 * Save game results
 * @route POST /api/games/results
 * @access Private
 */
export const saveGameResults = async (req, res) => {
  try {
    const { gameType, lessonId, results } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!gameType || !lessonId || !results) {
      return sendError(res, 400, "Missing required fields");
    }

    // Validate game type
    if (
      !Object.values(GAME_TYPES).includes(gameType) &&
      !["match-word", "sentence-scramble", "pronunciation-challenge"].includes(
        gameType
      )
    ) {
      return sendError(res, 400, "Invalid game type");
    }

    // Create new game result
    const gameResult = new GameResult({
      userId,
      gameType,
      lessonId,
      score: results.score,
      accuracy: results.accuracy,
      timeSpent: results.timeSpent,
      correctAnswers: results.correctAnswers,
      totalQuestions: results.totalQuestions,
      rewards: results.rewards || [],
    });

    // Save game result
    await gameResult.save();

    // 🎮 AWARD XP FOR GAME COMPLETION
    console.log(
      `🎮 Awarding XP for game completion: ${gameType}, score: ${results.score}`
    );
    const xpResult = await xpService.awardGameXP(
      userId,
      gameType,
      results.score,
      {
        accuracy: results.accuracy,
        timeSpent: results.timeSpent,
        correctAnswers: results.correctAnswers,
        totalQuestions: results.totalQuestions,
      }
    );

    if (xpResult.error) {
      console.error("❌ Error awarding game XP:", xpResult.error);
    } else {
      console.log(`✅ Game XP awarded: ${xpResult.xpAwarded} XP`);
    }

    sendSuccess(res, 201, "Game results saved successfully", {
      gameResult,
      xpAwarded: xpResult.xpAwarded || 0,
      xpDetails: xpResult.details || null,
    });
  } catch (error) {
    console.error("Error saving game results:", error);
    sendError(res, 500, "Error saving game results");
  }
};

/**
 * Get leaderboard for a game type
 * @route GET /api/games/leaderboard/:gameType
 * @access Private
 */
export const getLeaderboard = async (req, res) => {
  try {
    const { gameType } = req.params;

    // Validate game type
    if (
      !Object.values(GAME_TYPES).includes(gameType) &&
      !["match-word", "sentence-scramble", "pronunciation-challenge"].includes(
        gameType
      )
    ) {
      return sendError(res, 400, "Invalid game type");
    }

    // Get top scores for this game type
    const leaderboard = await GameResult.aggregate([
      { $match: { gameType } },
      { $sort: { score: -1 } },
      { $limit: 100 },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          score: 1,
          accuracy: 1,
          timeSpent: 1,
          createdAt: 1,
          user: {
            _id: 1,
            name: 1,
            username: 1,
            profilePicture: 1,
          },
        },
      },
    ]);

    sendSuccess(res, 200, "Leaderboard retrieved successfully", {
      leaderboard,
    });
  } catch (error) {
    console.error("Error getting leaderboard:", error);
    sendError(res, 500, "Error retrieving leaderboard");
  }
};

/**
 * Get user's game progress
 * @route GET /api/games/progress
 * @access Private
 */
export const getUserGameProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's game stats
    const stats = await GameResult.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$gameType",
          gamesPlayed: { $sum: 1 },
          totalScore: { $sum: "$score" },
          averageAccuracy: { $avg: "$accuracy" },
          bestScore: { $max: "$score" },
        },
      },
    ]);

    // Get recent games
    const recentGames = await GameResult.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    sendSuccess(res, 200, "Game progress retrieved successfully", {
      stats,
      recentGames,
    });
  } catch (error) {
    console.error("Error getting user game progress:", error);
    sendError(res, 500, "Error retrieving game progress");
  }
};

/**
 * Get game content for a specific game type
 * @route GET /api/games/content/:gameType
 * @access Private
 */
export const getGameContent = async (req, res) => {
  try {
    const { gameType } = req.params;
    const { level = "beginner", count = 10, category, focus } = req.query;
    const userId = req.user.id;

    // Validate game type
    const validGameTypes = [
      "match-word",
      "sentence-scramble",
      "pronunciation-challenge",
      "conversation-quest",
    ];
    if (!validGameTypes.includes(gameType)) {
      return sendError(res, 400, "Invalid game type");
    }

    // Get recently used content to avoid repetition
    const recentlyUsed = getRecentlyUsedContent(gameType, userId);

    let content;
    switch (gameType) {
      case "match-word":
        content = getMatchWordContent(
          level,
          parseInt(count),
          recentlyUsed,
          category
        );
        break;
      case "sentence-scramble":
        content = getSentenceScrambleContent(
          level,
          parseInt(count),
          recentlyUsed,
          category
        );
        break;
      case "pronunciation-challenge":
        content = getPronunciationContent(
          level,
          parseInt(count),
          recentlyUsed,
          focus
        );
        break;
      case "conversation-quest":
        content = getConversationScenario(level, recentlyUsed, category);
        break;
      default:
        return sendError(res, 400, "Unsupported game type");
    }

    sendSuccess(res, 200, "Game content retrieved successfully", {
      gameType,
      level,
      content,
      contentCount: Array.isArray(content) ? content.length : 1,
    });
  } catch (error) {
    console.error("Error getting game content:", error);
    sendError(res, 500, "Error retrieving game content");
  }
};

/**
 * Get lesson-specific game content
 * @route GET /api/games/lesson-content/:gameType/:lessonId
 * @access Private
 */
export const getLessonGameContent = async (req, res) => {
  try {
    const { gameType, lessonId } = req.params;
    const { count = 10 } = req.query;
    const userId = req.user.id;

    // Validate game type
    const validGameTypes = [
      "match-word",
      "sentence-scramble",
      "pronunciation-challenge",
    ];
    if (!validGameTypes.includes(gameType)) {
      return sendError(res, 400, "Invalid game type");
    }

    // TODO: Implement lesson-specific content extraction
    // For now, return general content based on user level
    const user = await User.findById(userId);
    const userLevel = user?.preferences?.languageLevel || "beginner";

    const recentlyUsed = getRecentlyUsedContent(gameType, userId);

    let content;
    switch (gameType) {
      case "match-word":
        content = getMatchWordContent(userLevel, parseInt(count), recentlyUsed);
        break;
      case "sentence-scramble":
        content = getSentenceScrambleContent(
          userLevel,
          parseInt(count),
          recentlyUsed
        );
        break;
      case "pronunciation-challenge":
        content = getPronunciationContent(
          userLevel,
          parseInt(count),
          recentlyUsed
        );
        break;
    }

    sendSuccess(res, 200, "Lesson game content retrieved successfully", {
      gameType,
      lessonId,
      content,
      contentCount: content.length,
    });
  } catch (error) {
    console.error("Error getting lesson game content:", error);
    sendError(res, 500, "Error retrieving lesson game content");
  }
};
