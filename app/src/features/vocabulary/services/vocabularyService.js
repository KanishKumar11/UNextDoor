import { API_BASE_URL } from "../../../shared/config/api";
import { getAuthToken } from "../../../shared/utils/authUtils";

/**
 * Vocabulary Service
 * Handles API calls related to vocabulary and word games
 */
class VocabularyService {
  /**
   * Get word pairs for the Match the Word game
   * @param {string} category - Word category
   * @param {string} difficulty - Game difficulty
   * @returns {Promise<Array>} - Array of word pairs
   */
  async getWordPairs(category = "general", difficulty = "beginner") {
    try {
      // In a production app, this would call the API
      // For now, we'll use sample data

      // If we have a token, try to fetch from API
      const token = await getAuthToken();

      if (token) {
        try {
          const response = await fetch(
            `${API_BASE_URL}/api/v1/vocabulary/pairs?category=${category}&difficulty=${difficulty}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            return data.wordPairs;
          }
        } catch (err) {
          console.warn("API call failed, using sample data:", err);
          // Fall back to sample data
        }
      }

      // Use sample data based on category and difficulty
      return this.getSampleWordPairs(category, difficulty);
    } catch (error) {
      console.error("Error getting word pairs:", error);
      throw error;
    }
  }

  /**
   * Save game result
   * @param {string} category - Word category
   * @param {string} difficulty - Game difficulty
   * @param {number} score - Game score
   * @returns {Promise<Object>} - Result object
   */
  async saveGameResult(category, difficulty, score) {
    try {
      const token = await getAuthToken();

      if (!token) {
        console.warn("No auth token, skipping save game result");
        return { success: false, error: "Not authenticated" };
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/vocabulary/game-results`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            category,
            difficulty,
            score,
            gameType: "match-word",
            completedAt: new Date().toISOString(),
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.warn("Failed to save game result:", response.status);
        return { success: false, error: "Failed to save result" };
      }
    } catch (error) {
      console.error("Error saving game result:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Save word results from a game
   * @param {string} gameType - Type of game (e.g., 'match-word')
   * @param {Array} wordResults - Array of word results with wordData and isCorrect
   * @returns {Promise<Object>} - Result object
   */
  async saveWordResults(gameType, wordResults) {
    try {
      const token = await getAuthToken();

      if (!token) {
        console.warn("No auth token, skipping save word results");
        return { success: false, error: "Not authenticated" };
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/vocabulary/game-results`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            gameType,
            wordResults,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.warn("Failed to save word results:", response.status);
        return { success: false, error: "Failed to save results" };
      }
    } catch (error) {
      console.error("Error saving word results:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get vocabulary mastery for the current user
   * @returns {Promise<Object>} - Vocabulary mastery object
   */
  async getVocabularyMastery() {
    try {
      const token = await getAuthToken();

      if (!token) {
        console.warn("No auth token, skipping get vocabulary mastery");
        return { success: false, error: "Not authenticated" };
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/vocabulary/mastery`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.warn("Failed to get vocabulary mastery:", response.status);
        return { success: false, error: "Failed to get mastery" };
      }
    } catch (error) {
      console.error("Error getting vocabulary mastery:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get vocabulary statistics for the current user
   * @returns {Promise<Object>} - Vocabulary statistics object
   */
  async getVocabularyStatistics() {
    try {
      const token = await getAuthToken();

      if (!token) {
        console.warn("No auth token, skipping get vocabulary statistics");
        return { success: false, error: "Not authenticated" };
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/vocabulary/statistics`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.warn("Failed to get vocabulary statistics:", response.status);
        return { success: false, error: "Failed to get statistics" };
      }
    } catch (error) {
      console.error("Error getting vocabulary statistics:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get words due for review
   * @param {number} limit - Maximum number of words to return
   * @returns {Promise<Object>} - Words due for review
   */
  async getWordsForReview(limit = 10) {
    try {
      const token = await getAuthToken();

      if (!token) {
        console.warn("No auth token, skipping get words for review");
        return { success: false, error: "Not authenticated" };
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/vocabulary/review?limit=${limit}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.warn("Failed to get words for review:", response.status);
        return { success: false, error: "Failed to get words for review" };
      }
    } catch (error) {
      console.error("Error getting words for review:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's vocabulary progress
   * @returns {Promise<Object>} - Progress data
   */
  async getVocabularyProgress() {
    try {
      const token = await getAuthToken();

      if (!token) {
        console.warn("No auth token, skipping get vocabulary progress");
        return { success: false, error: "Not authenticated" };
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/vocabulary/progress`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.warn("Failed to get vocabulary progress:", response.status);
        return { success: false, error: "Failed to get progress" };
      }
    } catch (error) {
      console.error("Error getting vocabulary progress:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get sample word pairs for development
   * @param {string} category - Word category
   * @param {string} difficulty - Game difficulty
   * @returns {Array} - Array of word pairs
   */
  getSampleWordPairs(category, difficulty) {
    // Sample word pairs organized by category and difficulty
    const sampleData = {
      general: {
        beginner: [
          { korean: "안녕하세요", english: "Hello" },
          { korean: "감사합니다", english: "Thank you" },
          { korean: "네", english: "Yes" },
          { korean: "아니요", english: "No" },
          { korean: "이름", english: "Name" },
          { korean: "물", english: "Water" },
        ],
        intermediate: [
          { korean: "행복하다", english: "Happy" },
          { korean: "슬프다", english: "Sad" },
          { korean: "화나다", english: "Angry" },
          { korean: "피곤하다", english: "Tired" },
          { korean: "배고프다", english: "Hungry" },
          { korean: "목마르다", english: "Thirsty" },
        ],
        advanced: [
          { korean: "성취하다", english: "Achieve" },
          { korean: "발전하다", english: "Develop" },
          { korean: "고려하다", english: "Consider" },
          { korean: "분석하다", english: "Analyze" },
          { korean: "해결하다", english: "Solve" },
          { korean: "설명하다", english: "Explain" },
        ],
      },
      food: {
        beginner: [
          { korean: "밥", english: "Rice" },
          { korean: "김치", english: "Kimchi" },
          { korean: "물", english: "Water" },
          { korean: "차", english: "Tea" },
          { korean: "커피", english: "Coffee" },
          { korean: "과일", english: "Fruit" },
        ],
        intermediate: [
          { korean: "불고기", english: "Bulgogi" },
          { korean: "비빔밥", english: "Bibimbap" },
          { korean: "떡볶이", english: "Tteokbokki" },
          { korean: "김밥", english: "Kimbap" },
          { korean: "삼겹살", english: "Samgyeopsal" },
          { korean: "된장찌개", english: "Doenjang Jjigae" },
        ],
        advanced: [
          { korean: "식욕을 돋우다", english: "Stimulate appetite" },
          { korean: "요리하다", english: "Cook" },
          { korean: "맛있게 먹다", english: "Enjoy a meal" },
          { korean: "음식을 나누다", english: "Share food" },
          { korean: "식사 예절", english: "Table manners" },
          { korean: "건배하다", english: "Toast (drinks)" },
        ],
      },
      travel: {
        beginner: [
          { korean: "호텔", english: "Hotel" },
          { korean: "공항", english: "Airport" },
          { korean: "기차", english: "Train" },
          { korean: "버스", english: "Bus" },
          { korean: "택시", english: "Taxi" },
          { korean: "여권", english: "Passport" },
        ],
        intermediate: [
          { korean: "예약하다", english: "Reserve" },
          { korean: "체크인", english: "Check-in" },
          { korean: "체크아웃", english: "Check-out" },
          { korean: "관광", english: "Sightseeing" },
          { korean: "길을 잃다", english: "Get lost" },
          { korean: "사진을 찍다", english: "Take a photo" },
        ],
        advanced: [
          { korean: "여행 계획을 세우다", english: "Make travel plans" },
          { korean: "문화 체험", english: "Cultural experience" },
          { korean: "현지인처럼 여행하다", english: "Travel like a local" },
          { korean: "배낭여행", english: "Backpacking" },
          { korean: "여행 일정", english: "Travel itinerary" },
          { korean: "환전하다", english: "Exchange currency" },
        ],
      },
    };

    // Get word pairs for the specified category and difficulty
    // Default to general/beginner if not found
    const categoryData = sampleData[category] || sampleData.general;
    return categoryData[difficulty] || categoryData.beginner;
  }
}

// Create singleton instance
export const vocabularyService = new VocabularyService();
