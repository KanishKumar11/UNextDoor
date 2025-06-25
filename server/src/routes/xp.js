import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import xpService from "../services/xpService.js";
import { sendSuccess, sendError } from "../utils/responseUtils.js";

const router = express.Router();

/**
 * XP Routes
 * All routes require authentication
 */

/**
 * Award XP for practice session
 * @route POST /api/xp/practice
 * @access Private
 */
router.post("/practice", authenticate, async (req, res) => {
  try {
    const { practiceType, duration, lessonId } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!practiceType) {
      return sendError(res, 400, "Practice type is required");
    }

    // Award practice XP
    const result = await xpService.awardPracticeXP(
      userId,
      practiceType,
      duration || 0,
      { lessonId }
    );

    if (result.error) {
      return sendError(res, 500, result.error);
    }

    sendSuccess(res, 200, "Practice XP awarded successfully", result);
  } catch (error) {
    console.error("Error awarding practice XP:", error);
    sendError(res, 500, "Error awarding practice XP");
  }
});

/**
 * Award XP for game completion
 * @route POST /api/xp/game
 * @access Private
 */
router.post("/game", authenticate, async (req, res) => {
  try {
    const { gameType, score, gameData } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!gameType || score === undefined) {
      return sendError(res, 400, "Game type and score are required");
    }

    // Award game XP
    const result = await xpService.awardGameXP(
      userId,
      gameType,
      score,
      gameData || {}
    );

    if (result.error) {
      return sendError(res, 500, result.error);
    }

    sendSuccess(res, 200, "Game XP awarded successfully", result);
  } catch (error) {
    console.error("Error awarding game XP:", error);
    sendError(res, 500, "Error awarding game XP");
  }
});

/**
 * Award XP for daily challenge completion
 * @route POST /api/xp/daily-challenge
 * @access Private
 */
router.post("/daily-challenge", authenticate, async (req, res) => {
  try {
    const { challengeType, challengeData } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!challengeType) {
      return sendError(res, 400, "Challenge type is required");
    }

    // Award daily challenge XP
    const result = await xpService.awardDailyChallengeXP(
      userId,
      challengeType,
      challengeData || {}
    );

    if (result.error) {
      return sendError(res, 500, result.error);
    }

    sendSuccess(res, 200, "Daily challenge XP awarded successfully", result);
  } catch (error) {
    console.error("Error awarding daily challenge XP:", error);
    sendError(res, 500, "Error awarding daily challenge XP");
  }
});

/**
 * Get user XP summary
 * @route GET /api/xp/summary
 * @access Private
 */
router.get("/summary", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get XP summary
    const result = await xpService.getXPSummary(userId);

    if (result.error) {
      return sendError(res, 500, result.error);
    }

    sendSuccess(res, 200, "XP summary retrieved successfully", result.summary);
  } catch (error) {
    console.error("Error getting XP summary:", error);
    sendError(res, 500, "Error retrieving XP summary");
  }
});

/**
 * Get XP rewards configuration
 * @route GET /api/xp/rewards
 * @access Private
 */
router.get("/rewards", authenticate, async (req, res) => {
  try {
    sendSuccess(res, 200, "XP rewards configuration retrieved successfully", {
      rewards: xpService.XP_REWARDS,
    });
  } catch (error) {
    console.error("Error getting XP rewards configuration:", error);
    sendError(res, 500, "Error retrieving XP rewards configuration");
  }
});

export default router;
