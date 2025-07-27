/**
 * User Level Service
 * Centralized service for getting user proficiency levels
 */

import User from "../models/User.js";
import { PROFICIENCY_LEVELS } from "../constants/appConstants.js";

/**
 * Get user's actual proficiency level from their preferences
 * @param {string} userId - User ID
 * @param {string} fallbackLevel - Fallback level if user level not found
 * @returns {Promise<string>} User's proficiency level
 */
export const getUserLevel = async (userId, fallbackLevel = PROFICIENCY_LEVELS.BEGINNER) => {
  try {
    if (!userId) {
      console.warn("No userId provided, using fallback level:", fallbackLevel);
      return fallbackLevel;
    }

    const user = await User.findById(userId).select('preferences.languageLevel');
    
    if (!user) {
      console.warn(`User ${userId} not found, using fallback level:`, fallbackLevel);
      return fallbackLevel;
    }

    const userLevel = user.preferences?.languageLevel;
    
    if (!userLevel || !Object.values(PROFICIENCY_LEVELS).includes(userLevel)) {
      console.warn(`Invalid user level "${userLevel}" for user ${userId}, using fallback:`, fallbackLevel);
      return fallbackLevel;
    }

    console.log(`✅ Retrieved user level for ${userId}:`, userLevel);
    return userLevel;
  } catch (error) {
    console.error("Error getting user level:", error);
    return fallbackLevel;
  }
};

/**
 * Validate proficiency level
 * @param {string} level - Level to validate
 * @returns {boolean} Whether level is valid
 */
export const isValidLevel = (level) => {
  return Object.values(PROFICIENCY_LEVELS).includes(level?.toLowerCase());
};

/**
 * Get user level with caching (for high-frequency calls)
 * @param {string} userId - User ID
 * @param {string} fallbackLevel - Fallback level
 * @returns {Promise<string>} User's proficiency level
 */
const userLevelCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const getUserLevelCached = async (userId, fallbackLevel = PROFICIENCY_LEVELS.BEGINNER) => {
  const cacheKey = userId;
  const cached = userLevelCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.level;
  }
  
  const level = await getUserLevel(userId, fallbackLevel);
  
  userLevelCache.set(cacheKey, {
    level,
    timestamp: Date.now()
  });
  
  return level;
};

/**
 * Clear user level cache (call when user updates their level)
 * @param {string} userId - User ID
 */
export const clearUserLevelCache = (userId) => {
  userLevelCache.delete(userId);
};

export default {
  getUserLevel,
  getUserLevelCached,
  isValidLevel,
  clearUserLevelCache
};
