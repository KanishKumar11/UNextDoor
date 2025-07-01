import { API_BASE_URL } from '../../../shared/config/api';
import { getAuthToken } from '../../../shared/utils/authUtils';

/**
 * Tutor Service
 * Handles API calls related to the AI tutor
 */
class TutorService {
  /**
   * Get a conversation by ID
   * @param {string} id - Conversation ID
   * @returns {Promise<Object>} - Conversation data
   */
  async getConversation(id) {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        console.warn('No auth token, skipping get conversation');
        return null;
      }
      
      const response = await fetch(
        `${API_BASE_URL}/api/v1/tutor/conversation/${id}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.warn('Failed to get conversation:', response.status);
        throw new Error('Failed to get conversation');
      }
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw error;
    }
  }
  
  /**
   * Create a new conversation
   * @param {string} scenarioId - Scenario ID
   * @returns {Promise<Object>} - New conversation data
   */
  async createConversation(scenarioId) {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        console.warn('No auth token, skipping create conversation');
        throw new Error('Authentication required');
      }
      
      const response = await fetch(
        `${API_BASE_URL}/api/v1/tutor/conversation`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            scenarioId,
          }),
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.warn('Failed to create conversation:', response.status);
        throw new Error('Failed to create conversation');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }
  
  /**
   * Get all scenarios
   * @returns {Promise<Array>} - List of scenarios
   */
  async getScenarios() {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        console.warn('No auth token, using sample scenarios');
        return this.getSampleScenarios();
      }
      
      const response = await fetch(
        `${API_BASE_URL}/api/v1/tutor/scenarios`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.scenarios;
      } else {
        console.warn('Failed to get scenarios, using samples:', response.status);
        return this.getSampleScenarios();
      }
    } catch (error) {
      console.error('Error getting scenarios:', error);
      return this.getSampleScenarios();
    }
  }
  
  /**
   * Get sample scenarios for development
   * @returns {Array} - Sample scenarios
   */
  getSampleScenarios() {
    return [
      {
        id: 'scenario-1',
        title: 'Ordering Food',
        description: 'Practice ordering food at a restaurant',
        level: 'Beginner',
        category: 'Daily Life',
        imageUrl: 'https://example.com/food.jpg',
      },
      {
        id: 'scenario-2',
        title: 'Asking for Directions',
        description: 'Learn how to ask for and understand directions',
        level: 'Beginner',
        category: 'Travel',
        imageUrl: 'https://example.com/directions.jpg',
      },
      {
        id: 'scenario-3',
        title: 'Shopping for Clothes',
        description: 'Practice vocabulary for shopping and trying on clothes',
        level: 'Intermediate',
        category: 'Daily Life',
        imageUrl: 'https://example.com/shopping.jpg',
      },
    ];
  }
}

// Create singleton instance
export const tutorService = new TutorService();
