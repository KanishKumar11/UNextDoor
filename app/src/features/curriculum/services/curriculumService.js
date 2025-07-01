import { apiClient } from "../../../shared/api/apiClient";
import { ENDPOINTS } from "../../../shared/config/api";

/**
 * Service for interacting with the curriculum API
 */
class CurriculumService {
  /**
   * Get all curriculum levels
   * @returns {Promise<Object>} Response data with levels
   */
  async getCurriculumLevels() {
    try {
      const response = await apiClient.get(ENDPOINTS.CURRICULUM.LEVELS);
      return response.data;
    } catch (error) {
      console.error("Error getting curriculum levels:", error);
      throw error;
    }
  }

  /**
   * Get modules for a specific level
   * @param {string} levelId - Level ID
   * @returns {Promise<Object>} Response data with level and modules
   */
  async getLevelModules(levelId) {
    try {
      const response = await apiClient.get(
        `${ENDPOINTS.CURRICULUM.LEVELS}/${levelId}/modules`
      );
      return response.data;
    } catch (error) {
      console.error(`Error getting modules for level ${levelId}:`, error);
      throw error;
    }
  }

  /**
   * Get a specific module with its lessons
   * @param {string} moduleId - Module ID
   * @returns {Promise<Object>} Response data with module
   */
  async getModule(moduleId) {
    try {
      const response = await apiClient.get(
        `${ENDPOINTS.CURRICULUM.MODULES}/${moduleId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error getting module ${moduleId}:`, error);
      throw error;
    }
  }

  /**
   * Get a specific lesson
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<Object>} Response data with lesson
   */
  async getLesson(lessonId) {
    try {
      const response = await apiClient.get(
        `${ENDPOINTS.CURRICULUM.LESSONS}/${lessonId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error getting lesson ${lessonId}:`, error);
      throw error;
    }
  }

  /**
   * Get user curriculum progress
   * @param {boolean} bustCache - Whether to bust cache for fresh data
   * @returns {Promise<Object>} Response data with progress
   */
  async getUserProgress(bustCache = false) {
    try {
      let url = ENDPOINTS.CURRICULUM.PROGRESS;

      // Add cache-busting parameter if requested
      if (bustCache) {
        const timestamp = Date.now();
        url += `?_t=${timestamp}&_bust=true`;
        console.log(
          "🔄 Cache-busting getUserProgress with timestamp:",
          timestamp
        );
      }

      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error("Error getting user progress:", error);
      throw error;
    }
  }

  /**
   * Refresh user progress by clearing cache and fetching fresh data
   * @returns {Promise<Object>} Response data with fresh progress
   */
  async refreshUserProgress() {
    try {
      console.log(
        "🔄 Refreshing user progress - clearing cache and fetching fresh data"
      );

      // Force cache bust by adding timestamp and bust parameter
      const timestamp = Date.now();
      const url = `${ENDPOINTS.CURRICULUM.PROGRESS}?_t=${timestamp}&_bust=true&_refresh=true`;

      const response = await apiClient.get(url);
      console.log("✅ User progress refreshed successfully");

      return response.data;
    } catch (error) {
      console.error("❌ Error refreshing user progress:", error);
      throw error;
    }
  }

  /**
   * Update section progress
   * @param {string} lessonId - Lesson ID
   * @param {string} sectionId - Section ID (introduction, vocabulary, grammar, practice)
   * @param {boolean} completed - Whether the section is completed
   * @param {number} timeSpent - Time spent in section (seconds)
   * @returns {Promise<Object>} Response data with updated progress
   */
  async updateSectionProgress(
    lessonId,
    sectionId,
    completed = false,
    timeSpent = 0
  ) {
    try {
      console.log(`📝 Frontend: Updating section progress`, {
        lessonId,
        sectionId,
        completed,
        timeSpent,
      });

      const response = await apiClient.post(
        `${ENDPOINTS.CURRICULUM.LESSONS}/${lessonId}/sections/${sectionId}/progress`,
        {
          completed,
          timeSpent,
        }
      );

      console.log(`✅ Section progress updated successfully:`, response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating section progress:", error);
      throw error;
    }
  }

  /**
   * Update lesson progress
   * @param {string} lessonId - Lesson ID
   * @param {boolean} completed - Whether the lesson is completed
   * @param {number} score - Lesson score
   * @param {number} xpEarned - XP earned
   * @param {string} completedSection - Completed section ID
   * @returns {Promise<Object>} Response data with updated progress
   */
  async updateLessonProgress(
    lessonId,
    completed = false,
    score = 0,
    xpEarned = 0,
    completedSection = null
  ) {
    try {
      const response = await apiClient.post(
        `${ENDPOINTS.CURRICULUM.LESSONS}/${lessonId}/progress`,
        {
          completed,
          score,
          xpEarned,
          completedSection,
        }
      );

      // Check for achievements after updating progress
      try {
        // Import directly to avoid using hooks outside components
        const achievementService = await import(
          "../../achievements/services/achievementService"
        );
        await achievementService.checkAndAwardAchievements();
      } catch (achievementError) {
        console.error("Error checking achievements:", achievementError);
        // Continue even if achievement checking fails
      }

      return response.data;
    } catch (error) {
      console.error(`Error updating progress for lesson ${lessonId}:`, error);
      throw error;
    }
  }

  /**
   * Set current lesson
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<Object>} Response data with updated current curriculum
   */
  async setCurrentLesson(lessonId) {
    try {
      const response = await apiClient.post(
        `${ENDPOINTS.CURRICULUM.LESSONS}/${lessonId}/current`
      );

      // Check for achievements after setting current lesson
      try {
        // Import directly to avoid using hooks outside components
        const achievementService = await import(
          "../../achievements/services/achievementService"
        );
        await achievementService.checkAndAwardAchievements();
      } catch (achievementError) {
        console.error("Error checking achievements:", achievementError);
        // Continue even if achievement checking fails
      }

      return response.data;
    } catch (error) {
      console.error(`Error setting current lesson ${lessonId}:`, error);
      throw error;
    }
  }

  /**
   * Record practice session
   * @param {number} duration - Session duration in seconds
   * @param {string} activityType - Type of activity (conversation, vocabulary, etc.)
   * @param {number} performance - Performance score (0-100)
   * @returns {Promise<Object>} Response data with session and progress
   */
  async recordPracticeSession(duration, activityType, performance = 0) {
    try {
      const response = await apiClient.post(ENDPOINTS.TUTOR.PRACTICE_SESSION, {
        duration,
        activityType,
        performance,
      });

      // Check for achievements after recording practice session
      try {
        // Check if user is authenticated before calling achievement service
        const { getAuthToken } = await import(
          "../../../shared/utils/authUtils"
        );
        const token = await getAuthToken();

        if (token) {
          // Import directly to avoid using hooks outside components
          const achievementService = await import(
            "../../achievements/services/achievementService"
          );
          await achievementService.checkAndAwardAchievements();
        } else {
          console.log("Skipping achievement check - user not authenticated");
        }
      } catch (achievementError) {
        console.error("Error checking achievements:", achievementError);
        // Continue even if achievement checking fails
      }

      return response.data;
    } catch (error) {
      console.error(`Error recording practice session:`, error);
      throw error;
    }
  }
}

// Create singleton instance
export const curriculumService = new CurriculumService();

export default curriculumService;
