import { apiClient } from "../api/apiClient";
import { ENDPOINTS } from "../config/api";

/**
 * XP Service
 * Handles XP awarding and tracking
 */
class XPService {
  /**
   * Award XP for game completion
   * @param {string} gameType - Type of game (e.g., 'match-word')
   * @param {number} score - Game score (0-100)
   * @param {Object} gameData - Additional game data
   * @returns {Promise<Object>} Response data
   */
  async awardGameXP(gameType, score = 0, gameData = {}) {
    try {
      console.log(`🎮 Awarding XP for game: ${gameType}, score: ${score}`);

      const response = await apiClient.post(ENDPOINTS.XP.AWARD_GAME, {
        gameType,
        score,
        gameData,
      });

      console.log(`✅ Game XP awarded successfully:`, response.data);
      return response.data;
    } catch (error) {
      console.error("Error awarding game XP:", error);

      // Return a fallback response so the game doesn't break
      return {
        success: false,
        error: error.message,
        xpAwarded: 0,
      };
    }
  }

  /**
   * Award XP for lesson completion
   * @param {string} lessonId - Lesson ID
   * @param {string} level - Lesson level (beginner/intermediate/advanced)
   * @param {Object} lessonData - Additional lesson data
   * @returns {Promise<Object>} Response data
   */
  async awardLessonXP(lessonId, level = "beginner", lessonData = {}) {
    try {
      console.log(`📚 Awarding XP for lesson: ${lessonId}, level: ${level}`);

      const response = await apiClient.post(ENDPOINTS.XP.AWARD_LESSON, {
        lessonId,
        level,
        lessonData,
      });

      console.log(`✅ Lesson XP awarded successfully:`, response.data);
      return response.data;
    } catch (error) {
      console.error("Error awarding lesson XP:", error);

      return {
        success: false,
        error: error.message,
        xpAwarded: 0,
      };
    }
  }

  /**
   * Award XP for practice session
   * @param {string} practiceType - Type of practice
   * @param {number} duration - Duration in seconds
   * @param {Object} practiceData - Additional practice data
   * @returns {Promise<Object>} Response data
   */
  async awardPracticeXP(practiceType, duration = 0, practiceData = {}) {
    try {
      console.log(
        `🎯 Awarding XP for practice: ${practiceType}, duration: ${duration}s`
      );
      console.log(`🔗 API Endpoint: ${ENDPOINTS.XP.AWARD_PRACTICE}`);
      console.log(`📦 Request data:`, { practiceType, duration, practiceData });

      const response = await apiClient.post(ENDPOINTS.XP.AWARD_PRACTICE, {
        practiceType,
        duration,
        practiceData,
      });

      console.log(`✅ Practice XP awarded successfully:`, response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error awarding practice XP:", error);
      console.error("❌ Error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
      });

      return {
        success: false,
        error: error.message,
        xpAwarded: 0,
      };
    }
  }

  /**
   * Get XP summary for current user
   * @returns {Promise<Object>} XP summary data
   */
  async getXPSummary() {
    try {
      const response = await apiClient.get(ENDPOINTS.XP.SUMMARY);
      return response.data;
    } catch (error) {
      console.error("Error getting XP summary:", error);

      return {
        success: false,
        error: error.message,
        summary: {
          totalXP: 0,
          currentLevel: 1,
          levelProgress: 0,
          nextLevelXP: 100,
        },
      };
    }
  }
}

// Create singleton instance
export const xpService = new XPService();

export default xpService;
