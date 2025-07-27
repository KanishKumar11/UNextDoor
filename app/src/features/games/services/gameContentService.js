/**
 * Game Content Service
 * Handles fetching game content from the backend with rich content support
 * Includes retry logic and comprehensive error handling
 */

import { apiClient } from "../../../shared/api/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Retry utility for API calls
 * @param {Function} fn - Function to retry
 * @param {number} retries - Number of retries
 * @param {number} delay - Delay between retries in ms
 */
const retryWithDelay = async (fn, retries = 2, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && !error.message.includes('API_ENDPOINT_NOT_FOUND')) {
      console.log(`🔄 Retrying API call... (${retries} attempts remaining)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithDelay(fn, retries - 1, delay * 1.5);
    }
    throw error;
  }
};

/**
 * Get available games list
 * @returns {Promise<Object>} Response with games list
 */
export const getAvailableGames = async () => {
  try {
    const response = await apiClient.get("/games");
    return response.data;
  } catch (error) {
    console.error("Error fetching available games:", error);
    throw error;
  }
};

/**
 * Get game content for a specific game type
 * @param {string} gameType - Type of game (match-word, sentence-scramble, etc.)
 * @param {Object} options - Content options
 * @param {string} options.level - User's proficiency level
 * @param {number} options.count - Number of items to fetch
 * @param {string} options.category - Optional category filter
 * @param {string} options.focus - Optional focus area (for pronunciation)
 * @returns {Promise<Object>} Response with game content
 */
export const getGameContent = async (gameType, options = {}) => {
  try {
    const { level = "beginner", count = 10, category, focus } = options;

    const params = new URLSearchParams({
      level,
      count: count.toString(),
    });

    if (category) params.append("category", category);
    if (focus) params.append("focus", focus);

    const endpoint = `/games/content/${gameType}?${params}`;

    console.log(`🔍 API Request Details:`);
    console.log(`   - Endpoint: ${endpoint}`);
    console.log(`   - Base URL: ${apiClient.defaults.baseURL}`);
    console.log(`   - Full URL: ${apiClient.defaults.baseURL}${endpoint}`);
    console.log(`   - Game Type: ${gameType}`);
    console.log(`   - Options:`, { level, count, category, focus });

    const response = await apiClient.get(endpoint);

    console.log(`✅ API Response Success:`, {
      status: response.status,
      contentCount: response.data?.data?.content?.length || 0
    });

    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching ${gameType} content:`, {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: `${error.config?.baseURL}${error.config?.url}`,
      headers: error.config?.headers,
      responseData: error.response?.data
    });

    // Differentiate error types for better handling
    if (error.response?.status === 404) {
      throw new Error(`API_ENDPOINT_NOT_FOUND: ${gameType} content endpoint not available`);
    } else if (error.response?.status === 401) {
      throw new Error(`API_AUTH_ERROR: Authentication required for ${gameType} content`);
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      throw new Error(`API_NETWORK_ERROR: Cannot connect to game content service`);
    } else {
      throw new Error(`API_SERVER_ERROR: Server error ${error.response?.status} for ${gameType} content`);
    }
  }
};

/**
 * Get lesson-specific game content
 * @param {string} gameType - Type of game
 * @param {string} lessonId - Lesson ID
 * @param {Object} options - Content options
 * @param {number} options.count - Number of items to fetch
 * @returns {Promise<Object>} Response with lesson-specific content
 */
export const getLessonGameContent = async (
  gameType,
  lessonId,
  options = {}
) => {
  try {
    const { count = 10 } = options;

    const params = new URLSearchParams({
      count: count.toString(),
    });

    const response = await apiClient.get(
      `/games/lesson-content/${gameType}/${lessonId}?${params}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching lesson ${lessonId} content for ${gameType}:`,
      error
    );
    throw error;
  }
};

/**
 * Save game results
 * @param {Object} gameData - Game result data
 * @param {string} gameData.gameType - Type of game
 * @param {string} gameData.lessonId - Lesson ID (optional)
 * @param {Object} gameData.results - Game results
 * @returns {Promise<Object>} Response with save confirmation
 */
export const saveGameResults = async (gameData) => {
  try {
    const response = await apiClient.post("/games/results", gameData);
    return response.data;
  } catch (error) {
    console.error("Error saving game results:", error);
    throw error;
  }
};

/**
 * Get user's game progress
 * @returns {Promise<Object>} Response with user's game statistics
 */
export const getUserGameProgress = async () => {
  try {
    const response = await apiClient.get("/games/progress");
    return response.data;
  } catch (error) {
    console.error("Error fetching user game progress:", error);
    throw error;
  }
};

/**
 * Get leaderboard for a specific game
 * @param {string} gameType - Type of game
 * @returns {Promise<Object>} Response with leaderboard data
 */
export const getGameLeaderboard = async (gameType) => {
  try {
    const response = await apiClient.get(`/games/leaderboard/${gameType}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${gameType} leaderboard:`, error);
    throw error;
  }
};

/**
 * Get Match Word Game content with smart selection and fallback
 * @param {Object} options - Content options
 * @returns {Promise<Array>} Array of word objects
 */
export const getMatchWordContent = async (options = {}) => {
  try {
    console.log(`🎮 Requesting Match Word content with options:`, options);
    const response = await getGameContent("match-word", options);

    if (response?.data?.content && Array.isArray(response.data.content)) {
      console.log(`✅ Successfully loaded ${response.data.content.length} words from API`);
      return response.data.content;
    } else {
      console.warn(`⚠️ API returned invalid content format:`, response?.data);
      throw new Error('Invalid content format from API');
    }
  } catch (error) {
    console.error(`❌ getMatchWordContent failed:`, error.message);

    // Re-throw with more context for the calling component to handle
    throw new Error(`MATCH_WORD_CONTENT_ERROR: ${error.message}`);
  }
};

/**
 * Get Sentence Scramble Game content
 * @param {Object} options - Content options
 * @returns {Promise<Array>} Array of sentence objects
 */
export const getSentenceScrambleContent = async (options = {}) => {
  const response = await getGameContent("sentence-scramble", options);
  return response.data.content;
};

/**
 * Get Pronunciation Challenge content
 * @param {Object} options - Content options
 * @returns {Promise<Array>} Array of phrase objects
 */
export const getPronunciationContent = async (options = {}) => {
  const response = await getGameContent("pronunciation-challenge", options);
  return response.data.content;
};

/**
 * Get Conversation Quest scenario
 * @param {Object} options - Content options
 * @returns {Promise<Object>} Scenario object
 */
export const getConversationScenario = async (options = {}) => {
  const response = await getGameContent("conversation-quest", options);
  return response.data.content;
};

/**
 * Track content usage to improve anti-repetition
 * This is handled automatically by the backend, but we can
 * provide client-side tracking for offline scenarios
 * @param {string} gameType - Type of game
 * @param {Array} usedContent - Content that was used
 */
export const trackContentUsage = async (gameType, usedContent) => {
  try {
    const storageKey = `${gameType}_recent_usage`;
    const maxItems = {
      "match-word": 50,
      "sentence-scramble": 25,
      "pronunciation-challenge": 25,
      "conversation-quest": 10,
    };

    const existingData = await AsyncStorage.getItem(storageKey);
    const existing = existingData ? JSON.parse(existingData) : [];
    const updated = [...usedContent, ...existing].slice(
      0,
      maxItems[gameType] || 25
    );
    await AsyncStorage.setItem(storageKey, JSON.stringify(updated));

    console.log(`📝 Tracked ${usedContent.length} items for ${gameType}`);
  } catch (error) {
    console.warn("Could not track content usage:", error);
  }
};

/**
 * Get content statistics for debugging
 * @returns {Object} Content statistics
 */
export const getContentStatistics = () => {
  // This would call the backend endpoint when implemented
  return {
    matchWord: { total: 225 },
    sentenceScramble: { total: 45 },
    pronunciationChallenge: { total: 40 },
    conversationQuest: { total: 13 },
  };
};

/**
 * Test API connectivity for debugging
 * @returns {Promise<Object>} Connection test results
 */
export const testApiConnection = async () => {
  try {
    console.log(`🔍 Testing API connection...`);
    console.log(`   Base URL: ${apiClient.defaults.baseURL}`);

    const response = await apiClient.get("/games");
    console.log(`✅ API Connection Test: SUCCESS`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Available Games: ${response.data?.data?.length || 0}`);

    return {
      success: true,
      status: response.status,
      gamesCount: response.data?.data?.length || 0
    };
  } catch (error) {
    console.error(`❌ API Connection Test: FAILED`);
    console.error(`   Error: ${error.message}`);
    console.error(`   Status: ${error.response?.status}`);

    return {
      success: false,
      error: error.message,
      status: error.response?.status
    };
  }
};

export default {
  getAvailableGames,
  getGameContent,
  getLessonGameContent,
  saveGameResults,
  getUserGameProgress,
  getGameLeaderboard,
  getMatchWordContent,
  getSentenceScrambleContent,
  getPronunciationContent,
  getConversationScenario,
  trackContentUsage,
  getContentStatistics,
  testApiConnection,
};
