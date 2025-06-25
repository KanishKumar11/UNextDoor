import * as levelService from '../services/levelService.js';
import { sendSuccess, sendError } from '../utils/responseUtils.js';

/**
 * Initialize levels
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const initializeLevels = async (req, res) => {
  try {
    const result = await levelService.initializeLevels();
    
    if (result.error) {
      return sendError(res, 400, result.error);
    }
    
    return sendSuccess(res, 200, result.message);
  } catch (error) {
    console.error('Error initializing levels:', error);
    return sendError(res, 500, 'Server error');
  }
};

/**
 * Get all levels
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllLevels = async (req, res) => {
  try {
    const result = await levelService.getAllLevels();
    
    if (result.error) {
      return sendError(res, 400, result.error);
    }
    
    return sendSuccess(res, 200, 'Levels retrieved successfully', {
      levels: result.levels,
    });
  } catch (error) {
    console.error('Error getting levels:', error);
    return sendError(res, 500, 'Server error');
  }
};

/**
 * Get user's current level
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserLevel = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await levelService.getUserLevel(userId);
    
    if (result.error) {
      return sendError(res, 400, result.error);
    }
    
    return sendSuccess(res, 200, 'User level retrieved successfully', {
      levelDetails: result.levelDetails,
    });
  } catch (error) {
    console.error('Error getting user level:', error);
    return sendError(res, 500, 'Server error');
  }
};

/**
 * Add XP to user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const addXpToUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { xpAmount, source } = req.body;
    
    if (!xpAmount || isNaN(xpAmount) || xpAmount <= 0) {
      return sendError(res, 400, 'Invalid XP amount');
    }
    
    const result = await levelService.addXpToUser(userId, xpAmount, source);
    
    if (result.error) {
      return sendError(res, 400, result.error);
    }
    
    return sendSuccess(res, 200, 'XP added successfully', {
      levelDetails: result.levelDetails,
      leveledUp: result.leveledUp,
      rewards: result.rewards,
      xpAdded: result.xpAdded,
      source: result.source,
    });
  } catch (error) {
    console.error('Error adding XP to user:', error);
    return sendError(res, 500, 'Server error');
  }
};

/**
 * Get leaderboard
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await levelService.getLeaderboard(limit);
    
    if (result.error) {
      return sendError(res, 400, result.error);
    }
    
    return sendSuccess(res, 200, 'Leaderboard retrieved successfully', {
      leaderboard: result.leaderboard,
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return sendError(res, 500, 'Server error');
  }
};
