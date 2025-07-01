import AsyncStorage from "@react-native-async-storage/async-storage";
import { achievementsApi } from "../../../shared/services/api/index";

/**
 * Production-ready Achievement Service
 * Removes all mock data and implements proper error handling
 */

// Production cache configuration
const CACHE_CONFIG = {
  KEYS: {
    USER_ACHIEVEMENTS: "user_achievements_v2",
    ALL_ACHIEVEMENTS: "all_achievements_v2",
    LAST_SYNC: "achievements_last_sync_v2",
  },
  DURATION: 5 * 60 * 1000, // 5 minutes
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
};

// Production error classes
class AchievementServiceError extends Error {
  constructor(message, code = 'ACHIEVEMENT_SERVICE_ERROR') {
    super(message);
    this.name = 'AchievementServiceError';
    this.code = code;
  }
}

class NetworkError extends AchievementServiceError {
  constructor(message) {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

class AuthenticationError extends AchievementServiceError {
  constructor(message) {
    super(message, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

/**
 * Enhanced cache management with validation
 */
const cacheManager = {
  async set(key, data, customTTL = CACHE_CONFIG.DURATION) {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now(),
        ttl: customTTL,
        version: '2.0',
      };
      
      await AsyncStorage.setItem(key, JSON.stringify(cacheItem));
      console.log(`✅ Cached data for key: ${key}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to cache data for key ${key}:`, error);
      return false;
    }
  },

  async get(key) {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (!cached) return null;

      const cacheItem = JSON.parse(cached);
      
      // Validate cache structure
      if (!cacheItem.data || !cacheItem.timestamp) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      // Check expiry
      const ttl = cacheItem.ttl || CACHE_CONFIG.DURATION;
      const isExpired = Date.now() - cacheItem.timestamp > ttl;

      if (isExpired) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error(`❌ Failed to get cached data for key ${key}:`, error);
      return null;
    }
  },

  async clear() {
    try {
      const keys = Object.values(CACHE_CONFIG.KEYS);
      await Promise.all(keys.map(key => AsyncStorage.removeItem(key)));
      console.log("🧹 Achievement cache cleared");
      return true;
    } catch (error) {
      console.error("❌ Failed to clear cache:", error);
      return false;
    }
  }
};

/**
 * Retry mechanism with exponential backoff
 */
const retryWithBackoff = async (fn, maxRetries = CACHE_CONFIG.MAX_RETRIES) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) break;
      
      const delay = CACHE_CONFIG.RETRY_DELAY * Math.pow(2, attempt);
      console.log(`⏳ Retry attempt ${attempt + 1}/${maxRetries + 1} in ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Get all achievements with production-ready error handling
 * @param {string} category - Optional category filter
 * @returns {Promise<Array>} Array of achievements
 */
export const getAchievements = async (category) => {
  try {
    console.log(`🔍 Fetching achievements${category ? ` for category: ${category}` : ''}`);
    
    const response = await retryWithBackoff(() => 
      achievementsApi.getAchievements(category)
    );
    
    const achievements = response?.data?.achievements || [];
    console.log(`✅ Retrieved ${achievements.length} achievements`);
    
    // Cache the results
    if (achievements.length > 0) {
      await cacheManager.set(CACHE_CONFIG.KEYS.ALL_ACHIEVEMENTS, achievements);
    }
    
    return achievements;
  } catch (error) {
    console.error("❌ Error fetching achievements:", error);
    
    // Try cache as fallback
    const cachedAchievements = await cacheManager.get(CACHE_CONFIG.KEYS.ALL_ACHIEVEMENTS);
    if (cachedAchievements) {
      console.log("📦 Using cached achievements as fallback");
      return cachedAchievements;
    }
    
    // Determine error type and throw appropriate error
    if (error.message?.includes('Authentication') || error.status === 401) {
      throw new AuthenticationError('Authentication required to fetch achievements');
    } else if (error.message?.includes('Network') || !navigator.onLine) {
      throw new NetworkError('Network error while fetching achievements');
    } else {
      throw new AchievementServiceError(`Failed to fetch achievements: ${error.message}`);
    }
  }
};

/**
 * Get user achievements with comprehensive error handling
 * @returns {Promise<Array>} Array of user achievements
 */
export const getUserAchievements = async () => {
  const startTime = Date.now();
  
  try {
    console.log("🔍 Fetching user achievements...");
    
    // Try cache first
    const cachedAchievements = await cacheManager.get(CACHE_CONFIG.KEYS.USER_ACHIEVEMENTS);
    if (cachedAchievements) {
      console.log(`📦 Using cached achievements: ${cachedAchievements.length} items`);
      return cachedAchievements;
    }

    // Fetch from API with retry mechanism
    const response = await retryWithBackoff(() => 
      achievementsApi.getUserAchievements()
    );
    
    const achievements = response?.data?.achievements || [];
    const duration = Date.now() - startTime;
    
    console.log(`✅ Retrieved ${achievements.length} user achievements in ${duration}ms`);
    
    // Validate achievement data structure
    const validAchievements = achievements.filter(achievement => {
      const isValid = achievement && 
                     typeof achievement.id === 'string' && 
                     typeof achievement.title === 'string' &&
                     typeof achievement.earned === 'boolean';
      
      if (!isValid) {
        console.warn('⚠️ Invalid achievement data:', achievement);
      }
      
      return isValid;
    });
    
    if (validAchievements.length !== achievements.length) {
      console.warn(`⚠️ Filtered out ${achievements.length - validAchievements.length} invalid achievements`);
    }
    
    // Cache valid achievements
    if (validAchievements.length > 0) {
      await cacheManager.set(CACHE_CONFIG.KEYS.USER_ACHIEVEMENTS, validAchievements);
    }
    
    return validAchievements;
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Error fetching user achievements after ${duration}ms:`, error);
    
    // Try stale cache as last resort
    try {
      const staleCache = await AsyncStorage.getItem(CACHE_CONFIG.KEYS.USER_ACHIEVEMENTS);
      if (staleCache) {
        const staleData = JSON.parse(staleCache);
        console.log("📦 Using stale cached data as fallback");
        return staleData.data || staleData;
      }
    } catch (cacheError) {
      console.warn("Cache fallback failed:", cacheError);
    }
    
    // Determine error type and handle appropriately
    if (error.message?.includes('Authentication') || error.status === 401) {
      console.log("🔐 Authentication required - returning empty array");
      return [];
    } else if (error.message?.includes('Network') || !navigator.onLine) {
      throw new NetworkError('Network error while fetching user achievements');
    } else {
      throw new AchievementServiceError(`Failed to fetch user achievements: ${error.message}`);
    }
  }
};

/**
 * Get unviewed achievements
 * @returns {Promise<Array>} Array of unviewed achievements
 */
export const getUnviewedAchievements = async () => {
  try {
    console.log("🔍 Fetching unviewed achievements...");
    
    const response = await retryWithBackoff(() => 
      achievementsApi.getUnviewedAchievements()
    );
    
    const achievements = response?.data?.achievements || [];
    console.log(`✅ Retrieved ${achievements.length} unviewed achievements`);
    
    return achievements;
  } catch (error) {
    console.error("❌ Error fetching unviewed achievements:", error);
    
    if (error.message?.includes('Authentication') || error.status === 401) {
      console.log("🔐 Authentication required - returning empty array");
      return [];
    }
    
    throw new AchievementServiceError(`Failed to fetch unviewed achievements: ${error.message}`);
  }
};

/**
 * Mark achievements as viewed
 * @param {Array} achievementIds - Array of achievement IDs
 * @returns {Promise<Object>} Response data
 */
export const markAchievementsAsViewed = async (achievementIds) => {
  try {
    if (!Array.isArray(achievementIds) || achievementIds.length === 0) {
      throw new AchievementServiceError('Achievement IDs array is required');
    }
    
    console.log(`🔄 Marking ${achievementIds.length} achievements as viewed...`);
    
    const response = await retryWithBackoff(() => 
      achievementsApi.markAchievementsAsViewed(achievementIds)
    );
    
    console.log("✅ Achievements marked as viewed");
    
    // Clear cache to force refresh
    await cacheManager.clear();
    
    return response;
  } catch (error) {
    console.error("❌ Error marking achievements as viewed:", error);
    throw new AchievementServiceError(`Failed to mark achievements as viewed: ${error.message}`);
  }
};

/**
 * Check and award achievements
 * @returns {Promise<Array>} Array of newly earned achievements
 */
export const checkAndAwardAchievements = async () => {
  try {
    console.log("🏆 Checking for new achievements...");
    
    const response = await retryWithBackoff(() => 
      achievementsApi.checkAndAwardAchievements()
    );
    
    const newAchievements = response?.data?.achievements || response?.data?.newAchievements || [];
    
    if (newAchievements.length > 0) {
      console.log(`🎉 ${newAchievements.length} new achievements earned!`);
      // Clear cache to force refresh of user achievements
      await cacheManager.clear();
    } else {
      console.log("📊 No new achievements earned");
    }
    
    return newAchievements;
  } catch (error) {
    console.error("❌ Error checking achievements:", error);
    
    if (error.message?.includes('Authentication') || error.status === 401) {
      console.log("🔐 Authentication required - returning empty array");
      return [];
    }
    
    throw new AchievementServiceError(`Failed to check achievements: ${error.message}`);
  }
};

/**
 * Clear all achievement caches
 * @returns {Promise<boolean>} Success status
 */
export const clearAchievementCache = async () => {
  return await cacheManager.clear();
};

// Export error classes for use in components
export { AchievementServiceError, NetworkError, AuthenticationError };
