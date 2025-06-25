import { sendSuccess, sendError } from "../utils/responseUtils.js";
import * as achievementService from "../services/achievementService.js";

/**
 * Get all achievements
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAchievements = async (req, res) => {
  try {
    const { category } = req.query;
    
    const result = await achievementService.getAchievements({ category });
    
    if (result.error) {
      return sendError(res, 400, result.error);
    }
    
    return sendSuccess(res, 200, "Achievements retrieved successfully", {
      achievements: result.achievements,
    });
  } catch (error) {
    console.error("Controller error getting achievements:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Get user achievements
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserAchievements = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await achievementService.getUserAchievements(userId);
    
    if (result.error) {
      return sendError(res, 400, result.error);
    }
    
    return sendSuccess(res, 200, "User achievements retrieved successfully", {
      achievements: result.achievements,
    });
  } catch (error) {
    console.error("Controller error getting user achievements:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Get unviewed achievements for the current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUnviewedAchievements = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await achievementService.getUnviewedAchievements(userId);
    
    if (result.error) {
      return sendError(res, 400, result.error);
    }
    
    return sendSuccess(res, 200, "Unviewed achievements retrieved successfully", {
      achievements: result.achievements,
    });
  } catch (error) {
    console.error("Controller error getting unviewed achievements:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Mark achievements as viewed
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const markAchievementsAsViewed = async (req, res) => {
  try {
    const userId = req.user.id;
    const { achievementIds } = req.body;
    
    if (!achievementIds || !Array.isArray(achievementIds) || achievementIds.length === 0) {
      return sendError(res, 400, "Achievement IDs are required");
    }
    
    const result = await achievementService.markAchievementsAsViewed(
      userId,
      achievementIds
    );
    
    if (result.error) {
      return sendError(res, 400, result.error);
    }
    
    return sendSuccess(res, 200, result.message);
  } catch (error) {
    console.error("Controller error marking achievements as viewed:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Check and award achievements for the current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const checkAndAwardAchievements = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await achievementService.checkAndAwardAchievements(userId);
    
    if (result.error) {
      return sendError(res, 400, result.error);
    }
    
    return sendSuccess(res, 200, "Achievements checked and awarded", {
      newAchievements: result.achievements,
    });
  } catch (error) {
    console.error("Controller error checking and awarding achievements:", error);
    return sendError(res, 500, "Server error");
  }
};
