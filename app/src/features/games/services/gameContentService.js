/**
 * Game Content Service
 * Handles fetching game content from the backend with rich content support
 */

import { apiClient } from "../../../shared/api/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Get available games list
 * @returns {Promise<Object>} Response with games list
 */
export const getAvailableGames = async () => {
  try {
    const response = await apiClient.get("/api/games");
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

    const response = await apiClient.get(
      `/api/games/content/${gameType}?${params}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${gameType} content:`, error);
    throw error;
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
      `/api/games/lesson-content/${gameType}/${lessonId}?${params}`
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
    const response = await apiClient.post("/api/games/results", gameData);
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
    const response = await apiClient.get("/api/games/progress");
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
    const response = await apiClient.get(`/api/games/leaderboard/${gameType}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${gameType} leaderboard:`, error);
    throw error;
  }
};

/**
 * Get Match Word Game content with smart selection
 * @param {Object} options - Content options
 * @returns {Promise<Array>} Array of word objects
 */
export const getMatchWordContent = async (options = {}) => {
  const response = await getGameContent("match-word", options);
  return response.data.content;
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
};
