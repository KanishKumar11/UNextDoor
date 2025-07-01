import { apiClient } from "../../../shared/api/apiClient";
import { ENDPOINTS } from "../../../shared/config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Game Service
 * Handles game-related API calls and local storage
 */
class GameService {
  /**
   * Save game results to the server and local storage
   * @param {string} gameType - Type of game (e.g., 'match-word', 'sentence-scramble')
   * @param {string} lessonId - ID of the lesson the game is for
   * @param {Object} results - Game results object
   * @returns {Promise<Object>} Response data
   */
  async saveGameResults(gameType, lessonId, results) {
    try {
      // Save to server if API endpoint exists
      try {
        const response = await apiClient.post(`${ENDPOINTS.GAMES.RESULTS}`, {
          gameType,
          lessonId,
          results,
        });

        // Save to local storage as well for offline access
        await this.saveResultsToLocalStorage(gameType, lessonId, results);

        return response.data;
      } catch (apiError) {
        console.warn("Error saving game results to server:", apiError);
        // Still save to local storage if API call fails
        await this.saveResultsToLocalStorage(gameType, lessonId, results);

        return { success: true, source: "local" };
      }
    } catch (error) {
      console.error("Error saving game results:", error);
      throw error;
    }
  }

  /**
   * Save game results to local storage
   * @param {string} gameType - Type of game
   * @param {string} lessonId - ID of the lesson
   * @param {Object} results - Game results object
   * @returns {Promise<void>}
   */
  async saveResultsToLocalStorage(gameType, lessonId, results) {
    try {
      // Create a unique key for this game result
      const key = `@game_results:${gameType}:${lessonId}`;

      // Get existing results for this game/lesson
      const existingResultsJson = await AsyncStorage.getItem(key);
      let existingResults = existingResultsJson
        ? JSON.parse(existingResultsJson)
        : [];

      // Add new result with timestamp
      const newResult = {
        ...results,
        timestamp: Date.now(),
      };

      // Add to results array (keep last 5 results)
      existingResults.unshift(newResult);
      if (existingResults.length > 5) {
        existingResults = existingResults.slice(0, 5);
      }

      // Save updated results
      await AsyncStorage.setItem(key, JSON.stringify(existingResults));

      // Also update best scores
      await this.updateBestScores(gameType, results);
    } catch (error) {
      console.error("Error saving results to local storage:", error);
    }
  }

  /**
   * Update best scores for a game type
   * @param {string} gameType - Type of game
   * @param {Object} results - Game results object
   * @returns {Promise<void>}
   */
  async updateBestScores(gameType, results) {
    try {
      const key = `@game_best_scores:${gameType}`;

      // Get existing best scores
      const bestScoresJson = await AsyncStorage.getItem(key);
      const bestScores = bestScoresJson
        ? JSON.parse(bestScoresJson)
        : {
            highestScore: 0,
            bestAccuracy: 0,
            fastestTime: Infinity,
          };

      // Update best scores if new results are better
      let updated = false;

      if (results.score > bestScores.highestScore) {
        bestScores.highestScore = results.score;
        updated = true;
      }

      if (results.accuracy > bestScores.bestAccuracy) {
        bestScores.bestAccuracy = results.accuracy;
        updated = true;
      }

      if (results.timeSpent < bestScores.fastestTime) {
        bestScores.fastestTime = results.timeSpent;
        updated = true;
      }

      // Save updated best scores if changed
      if (updated) {
        await AsyncStorage.setItem(key, JSON.stringify(bestScores));
      }
    } catch (error) {
      console.error("Error updating best scores:", error);
    }
  }

  /**
   * Get game results for a specific lesson
   * @param {string} gameType - Type of game
   * @param {string} lessonId - ID of the lesson
   * @returns {Promise<Array>} Array of game results
   */
  async getGameResults(gameType, lessonId) {
    try {
      // Try to get from server first
      try {
        const response = await apiClient.get(
          `${ENDPOINTS.GAMES.RESULTS}/${gameType}/${lessonId}`
        );
        return response.data.results;
      } catch (apiError) {
        console.warn("Error getting game results from server:", apiError);
        // Fall back to local storage
        return await this.getResultsFromLocalStorage(gameType, lessonId);
      }
    } catch (error) {
      console.error("Error getting game results:", error);
      return [];
    }
  }

  /**
   * Get game results from local storage
   * @param {string} gameType - Type of game
   * @param {string} lessonId - ID of the lesson
   * @returns {Promise<Array>} Array of game results
   */
  async getResultsFromLocalStorage(gameType, lessonId) {
    try {
      const key = `@game_results:${gameType}:${lessonId}`;
      const resultsJson = await AsyncStorage.getItem(key);
      return resultsJson ? JSON.parse(resultsJson) : [];
    } catch (error) {
      console.error("Error getting results from local storage:", error);
      return [];
    }
  }

  /**
   * Get best scores for a game type
   * @param {string} gameType - Type of game
   * @returns {Promise<Object>} Best scores object
   */
  async getBestScores(gameType) {
    try {
      const key = `@game_best_scores:${gameType}`;
      const bestScoresJson = await AsyncStorage.getItem(key);
      return bestScoresJson
        ? JSON.parse(bestScoresJson)
        : {
            highestScore: 0,
            bestAccuracy: 0,
            fastestTime: Infinity,
          };
    } catch (error) {
      console.error("Error getting best scores:", error);
      return {
        highestScore: 0,
        bestAccuracy: 0,
        fastestTime: Infinity,
      };
    }
  }

  /**
   * Get all available games
   * @returns {Promise<Array>} Array of game objects
   */
  async getAvailableGames() {
    // This could be fetched from the server in the future
    // For now, return a static list of games
    return [
      {
        id: "match-word",
        name: "Match the Word",
        description: "Match the Korean word to its English translation.",
        icon: "grid-outline",
        color: "#6FC953",
        difficulty: "beginner",
        available: true,
      },
      {
        id: "sentence-scramble",
        name: "Sentence Scramble",
        description:
          "Rearrange the words to form a grammatically correct Korean sentence.",
        icon: "shuffle-outline",
        color: "#3498db",
        difficulty: "intermediate",
        available: true,
      },
      {
        id: "pronunciation-challenge",
        name: "Pronunciation Challenge",
        description:
          "Record yourself speaking Korean and get feedback on your pronunciation.",
        icon: "mic-outline",
        color: "#9b59b6",
        difficulty: "all-levels",
        available: true,
      },
      {
        id: "listening-comprehension",
        name: "Listening Comprehension",
        description:
          "Listen to Korean audio and answer comprehension questions.",
        icon: "headset-outline",
        color: "#e74c3c",
        difficulty: "intermediate",
        available: false,
        comingSoon: true,
      },
      {
        id: "fill-in-blanks",
        name: "Fill in the Blanks",
        description:
          "Complete Korean sentences by filling in the missing words.",
        icon: "text-outline",
        color: "#f39c12",
        difficulty: "beginner",
        available: false,
        comingSoon: true,
      },
      {
        id: "conversation-practice",
        name: "Conversation Practice",
        description:
          "Practice real-world Korean conversations with AI feedback.",
        icon: "chatbubbles-outline",
        color: "#2ecc71",
        difficulty: "advanced",
        available: false,
        comingSoon: true,
      },
      {
        id: "writing-challenge",
        name: "Writing Challenge",
        description:
          "Write Korean sentences and get grammar and style feedback.",
        icon: "create-outline",
        color: "#8e44ad",
        difficulty: "advanced",
        available: false,
        comingSoon: true,
      },
      {
        id: "cultural-quiz",
        name: "Cultural Quiz",
        description: "Learn about Korean culture through interactive quizzes.",
        icon: "library-outline",
        color: "#34495e",
        difficulty: "all-levels",
        available: false,
        comingSoon: true,
      },
    ];
  }
}

// Create singleton instance
export const gameService = new GameService();

export default gameService;
