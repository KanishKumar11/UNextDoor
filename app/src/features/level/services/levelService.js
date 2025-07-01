import { API_BASE_URL } from "../../../shared/config/api";
import { getAuthToken } from "../../../shared/utils/authUtils";

/**
 * Level service
 * Handles API calls related to user levels and XP
 */
class LevelService {
  /**
   * Get all levels
   * @returns {Promise<Object>} - Result object
   */
  async getAllLevels() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/levels`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.warn("Failed to get levels:", response.status);
        return { success: false, error: "Failed to get levels" };
      }
    } catch (error) {
      console.error("Error getting levels:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's current level
   * @returns {Promise<Object>} - Result object
   */
  async getUserLevel() {
    try {
      const token = await getAuthToken();

      if (!token) {
        console.warn("No auth token, skipping get user level");
        return { success: false, error: "Not authenticated" };
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/levels/user`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.warn("Failed to get user level:", response.status);
        return { success: false, error: "Failed to get user level" };
      }
    } catch (error) {
      console.error("Error getting user level:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Add XP to user
   * @param {number} xpAmount - Amount of XP to add
   * @param {string} source - Source of XP (e.g., 'lesson', 'conversation', 'game')
   * @returns {Promise<Object>} - Result object
   */
  async addXp(xpAmount, source = "general") {
    try {
      const token = await getAuthToken();

      if (!token) {
        console.warn("No auth token, skipping add XP");
        return { success: false, error: "Not authenticated" };
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/levels/xp`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          xpAmount,
          source,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.warn("Failed to add XP:", response.status);
        return { success: false, error: "Failed to add XP" };
      }
    } catch (error) {
      console.error("Error adding XP:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get leaderboard
   * @param {number} limit - Maximum number of users to return
   * @returns {Promise<Object>} - Result object
   */
  async getLeaderboard(limit = 10) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/levels/leaderboard?limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.warn("Failed to get leaderboard:", response.status);
        return { success: false, error: "Failed to get leaderboard" };
      }
    } catch (error) {
      console.error("Error getting leaderboard:", error);
      return { success: false, error: error.message };
    }
  }
}

export const levelService = new LevelService();
