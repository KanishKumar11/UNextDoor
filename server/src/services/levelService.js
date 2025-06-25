import Level from '../models/Level.js';
import UserProgress from '../models/UserProgress.js';
import { levels } from '../data/levels.js';

/**
 * Initialize levels in the database
 * @returns {Promise<Object>} Result object
 */
export const initializeLevels = async () => {
  try {
    // Check if levels already exist
    const existingLevels = await Level.countDocuments();
    
    if (existingLevels > 0) {
      return { success: true, message: 'Levels already initialized' };
    }
    
    // Insert all levels
    await Level.insertMany(levels);
    
    return { success: true, message: 'Levels initialized successfully' };
  } catch (error) {
    console.error('Error initializing levels:', error);
    return { error: 'Failed to initialize levels' };
  }
};

/**
 * Get all levels
 * @returns {Promise<Object>} Result object with levels
 */
export const getAllLevels = async () => {
  try {
    const levels = await Level.find({ isActive: true }).sort({ level: 1 });
    
    return { success: true, levels };
  } catch (error) {
    console.error('Error getting levels:', error);
    return { error: 'Failed to get levels' };
  }
};

/**
 * Get user's current level
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result object with level details
 */
export const getUserLevel = async (userId) => {
  try {
    // Get user progress
    const userProgress = await UserProgress.findOne({ userId });
    
    if (!userProgress) {
      return { error: 'User progress not found' };
    }
    
    // Get level details
    const levelDetails = await userProgress.getLevelDetails();
    
    return {
      success: true,
      levelDetails,
    };
  } catch (error) {
    console.error('Error getting user level:', error);
    return { error: 'Failed to get user level' };
  }
};

/**
 * Add XP to user
 * @param {string} userId - User ID
 * @param {number} xpAmount - Amount of XP to add
 * @param {string} source - Source of XP (e.g., 'lesson', 'conversation', 'game')
 * @returns {Promise<Object>} Result object with updated level details
 */
export const addXpToUser = async (userId, xpAmount, source = 'general') => {
  try {
    if (!xpAmount || xpAmount <= 0) {
      return { error: 'Invalid XP amount' };
    }
    
    // Get user progress
    let userProgress = await UserProgress.findOne({ userId });
    
    if (!userProgress) {
      return { error: 'User progress not found' };
    }
    
    // Get current level before adding XP
    const currentLevel = userProgress.currentLevel;
    
    // Add XP
    await userProgress.addXp(xpAmount);
    await userProgress.save();
    
    // Get updated level details
    const levelDetails = await userProgress.getLevelDetails();
    
    // Check if user leveled up
    const leveledUp = levelDetails.currentLevel > currentLevel;
    
    // If user leveled up, get rewards
    let rewards = [];
    if (leveledUp && levelDetails.currentLevel) {
      const newLevel = await Level.findOne({ level: levelDetails.currentLevel });
      if (newLevel && newLevel.rewards) {
        rewards = newLevel.rewards;
      }
    }
    
    return {
      success: true,
      levelDetails,
      leveledUp,
      rewards,
      xpAdded: xpAmount,
      source,
    };
  } catch (error) {
    console.error('Error adding XP to user:', error);
    return { error: 'Failed to add XP to user' };
  }
};

/**
 * Get leaderboard based on XP
 * @param {number} limit - Maximum number of users to return
 * @returns {Promise<Object>} Result object with leaderboard
 */
export const getLeaderboard = async (limit = 10) => {
  try {
    const leaderboard = await UserProgress.find()
      .sort({ xpPoints: -1 })
      .limit(limit)
      .populate('userId', 'username displayName profilePicture')
      .select('userId xpPoints currentLevel levelProgress');
    
    return {
      success: true,
      leaderboard: leaderboard.map(entry => ({
        userId: entry.userId._id,
        username: entry.userId.username,
        displayName: entry.userId.displayName,
        profilePicture: entry.userId.profilePicture,
        xpPoints: entry.xpPoints,
        level: entry.currentLevel,
        levelProgress: entry.levelProgress,
      })),
    };
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return { error: 'Failed to get leaderboard' };
  }
};
