import AsyncStorage from "@react-native-async-storage/async-storage";
import { achievementsApi } from "../../../shared/services/api/index";

// 💾 CACHE CONFIGURATION
const CACHE_KEYS = {
  USER_ACHIEVEMENTS: "user_achievements",
  ALL_ACHIEVEMENTS: "all_achievements",
  LAST_FETCH: "achievements_last_fetch",
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Check if cached data is still valid
 * @param {string} cacheKey - Cache key to check
 * @returns {Promise<boolean>} Whether cache is valid
 */
const isCacheValid = async (cacheKey) => {
  try {
    const lastFetch = await AsyncStorage.getItem(`${cacheKey}_timestamp`);
    if (!lastFetch) return false;

    const now = Date.now();
    const fetchTime = parseInt(lastFetch, 10);
    return now - fetchTime < CACHE_DURATION;
  } catch (error) {
    console.warn("Cache validation error:", error);
    return false;
  }
};

/**
 * Get cached data
 * @param {string} cacheKey - Cache key
 * @returns {Promise<any>} Cached data or null
 */
const getCachedData = async (cacheKey) => {
  try {
    const isValid = await isCacheValid(cacheKey);
    if (!isValid) return null;

    const cachedData = await AsyncStorage.getItem(cacheKey);
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (error) {
    console.warn("Cache retrieval error:", error);
    return null;
  }
};

/**
 * Cache data
 * @param {string} cacheKey - Cache key
 * @param {any} data - Data to cache
 */
const cacheData = async (cacheKey, data) => {
  try {
    await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
    await AsyncStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
    console.log(`✅ Data cached successfully: ${cacheKey}`);
  } catch (error) {
    console.warn("Cache storage error:", error);
  }
};

/**
 * Get all achievements
 * @param {string} category - Optional category filter
 * @returns {Promise<Array>} Array of achievements
 */
export const getAchievements = async (category) => {
  try {
    const response = await achievementsApi.getAchievements(category);
    return response.data.achievements;
  } catch (error) {
    console.error("Error fetching achievements:", error);
    throw error;
  }
};

/**
 * Get achievements for the current user - PRODUCTION VERSION
 * @returns {Promise<Array>} Array of user achievements
 */
export const getUserAchievements = async () => {
  const startTime = Date.now();

  try {
    console.log("🔍 Fetching user achievements...");

    // Try cache first
    const cachedAchievements = await getCachedData(
      CACHE_KEYS.USER_ACHIEVEMENTS
    );
    if (cachedAchievements) {
      console.log(
        `📦 Using cached achievements: ${cachedAchievements.length} items`
      );
      return cachedAchievements;
    }

    console.log("🌐 Calling achievements API...");
    const response = await achievementsApi.getUserAchievements();
    console.log("📡 API Response received");

    const achievements = response?.data?.achievements || [];
    const duration = Date.now() - startTime;

    console.log(
      `✅ Retrieved ${achievements.length} user achievements in ${duration}ms`
    );

    // Validate achievement data structure
    const validAchievements = achievements.filter((achievement) => {
      const isValid =
        achievement &&
        typeof achievement.id === "string" &&
        typeof achievement.title === "string" &&
        typeof achievement.earned === "boolean";

      if (!isValid) {
        console.warn("⚠️ Invalid achievement data:", achievement);
      }

      return isValid;
    });

    if (validAchievements.length !== achievements.length) {
      console.warn(
        `⚠️ Filtered out ${
          achievements.length - validAchievements.length
        } invalid achievements`
      );
    }

    // Cache valid achievements
    if (validAchievements.length > 0) {
      await cacheData(CACHE_KEYS.USER_ACHIEVEMENTS, validAchievements);
      return validAchievements;
    }

    // If no achievements returned, try to initialize them (for new deployments)
    console.log("⚠️ No achievements found, attempting to initialize...");
    try {
      const initResult = await initializeAchievements();
      if (initResult.success) {
        console.log("✅ Achievements initialized, retrying fetch...");
        // Retry fetching achievements after initialization
        const retryResponse = await achievementsApi.getUserAchievements();
        const retryAchievements = retryResponse?.data?.achievements || [];

        if (retryAchievements.length > 0) {
          await cacheData(CACHE_KEYS.USER_ACHIEVEMENTS, retryAchievements);
          return retryAchievements;
        }
      }
    } catch (initError) {
      console.warn("⚠️ Failed to initialize achievements:", initError.message);
    }

    return validAchievements; // Return empty array if initialization fails
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(
      `❌ Error fetching user achievements after ${duration}ms:`,
      error
    );

    // Try stale cache as fallback
    try {
      const staleCache = await AsyncStorage.getItem(
        CACHE_KEYS.USER_ACHIEVEMENTS
      );
      if (staleCache) {
        const staleData = JSON.parse(staleCache);
        console.log("📦 Using stale cached data as fallback");
        return Array.isArray(staleData) ? staleData : [];
      }
    } catch (cacheError) {
      console.warn("Cache fallback failed:", cacheError);
    }

    // For authentication errors, return empty array instead of mock data
    if (error.message?.includes("Authentication") || error.status === 401) {
      console.log("🔐 Authentication required - returning empty array");
      return [];
    }

    // For other errors, return empty array (no more mock data)
    console.log("❌ API error - returning empty array");
    return [];
  }
};

// Mock achievements function removed - using real data only in production

/**
 * Get unviewed achievements for the current user - PRODUCTION VERSION
 * @returns {Promise<Array>} Array of unviewed achievements
 */
export const getUnviewedAchievements = async () => {
  try {
    console.log("🔍 Fetching unviewed achievements...");

    const response = await achievementsApi.getUnviewedAchievements();
    const achievements = response?.data?.achievements || [];

    console.log(`✅ Retrieved ${achievements.length} unviewed achievements`);
    return achievements;
  } catch (error) {
    console.error("❌ Error fetching unviewed achievements:", error);

    // For authentication errors, return empty array
    if (error.message?.includes("Authentication") || error.status === 401) {
      console.log("🔐 Authentication required - returning empty array");
      return [];
    }

    // For other errors, don't throw - return empty array
    console.log("❌ API error - returning empty array");
    return [];
  }
};

/**
 * Mark achievements as viewed - PRODUCTION VERSION
 * @param {Array} achievementIds - Array of achievement IDs to mark as viewed
 * @returns {Promise<Object>} Response data
 */
export const markAchievementsAsViewed = async (achievementIds) => {
  try {
    // Input validation
    if (!Array.isArray(achievementIds) || achievementIds.length === 0) {
      console.warn("⚠️ Invalid achievement IDs provided");
      return { success: false, error: "Achievement IDs array is required" };
    }

    console.log(
      `🔄 Marking ${achievementIds.length} achievements as viewed...`
    );

    const response = await achievementsApi.markAchievementsAsViewed(
      achievementIds
    );

    console.log("✅ Achievements marked as viewed");

    // Clear cache to force refresh
    await AsyncStorage.removeItem(CACHE_KEYS.USER_ACHIEVEMENTS);

    return response;
  } catch (error) {
    console.error("❌ Error marking achievements as viewed:", error);

    return {
      success: false,
      error: error.message || "Failed to mark achievements as viewed",
    };
  }
};

/**
 * Check and award achievements for the current user - PRODUCTION VERSION
 * @returns {Promise<Array>} Array of newly earned achievements
 */
export const checkAndAwardAchievements = async () => {
  try {
    console.log("🏆 Checking for new achievements...");

    const response = await achievementsApi.checkAndAwardAchievements();
    const newAchievements =
      response?.data?.achievements || response?.data?.newAchievements || [];

    if (newAchievements.length > 0) {
      console.log(`🎉 ${newAchievements.length} new achievements earned!`);
      // Clear cache to force refresh of user achievements
      await AsyncStorage.removeItem(CACHE_KEYS.USER_ACHIEVEMENTS);
    } else {
      console.log("📊 No new achievements earned");
    }

    return newAchievements;
  } catch (error) {
    console.error("❌ Error checking achievements:", error);

    // For authentication errors, return empty array
    if (error.message?.includes("Authentication") || error.status === 401) {
      console.log("🔐 Authentication required - returning empty array");
      return [];
    }

    // For other errors, don't throw - return empty array
    console.log("❌ API error - returning empty array");
    return [];
  }
};

/**
 * Clear all achievement caches - PRODUCTION UTILITY
 * @returns {Promise<boolean>} Success status
 */
export const clearAchievementCache = async () => {
  try {
    const cacheKeys = Object.values(CACHE_KEYS);
    await Promise.all(cacheKeys.map((key) => AsyncStorage.removeItem(key)));
    console.log("🧹 Achievement cache cleared successfully");
    return true;
  } catch (error) {
    console.error("❌ Failed to clear achievement cache:", error);
    return false;
  }
};

/**
 * Initialize achievements system (for development/first-time setup)
 * @returns {Promise<Object>} Initialization result
 */
export const initializeAchievements = async () => {
  try {
    console.log("🔧 Initializing achievements system...");

    const response = await achievementsApi.initializeAchievements();

    if (response?.data?.success) {
      console.log("✅ Achievements initialized successfully");
      // Clear cache to force refresh
      await clearAchievementCache();
      return { success: true, message: response.data.message };
    } else {
      console.error(
        "❌ Failed to initialize achievements:",
        response?.data?.error
      );
      return {
        success: false,
        error: response?.data?.error || "Initialization failed",
      };
    }
  } catch (error) {
    console.error("❌ Error initializing achievements:", error);
    return { success: false, error: error.message || "Initialization failed" };
  }
};
