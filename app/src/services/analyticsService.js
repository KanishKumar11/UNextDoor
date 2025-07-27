/**
 * Analytics Service for React Native
 * Provides access to conversation analytics and learning progress data
 */

import { API_BASE_URL } from '../config/api';
import { getAuthToken } from './authService';

/**
 * Analytics API Service
 */
class AnalyticsService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/analytics`;
  }

  /**
   * Get authenticated headers
   * @returns {Object} Headers with auth token
   */
  async getHeaders() {
    const token = await getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Get user analytics summary
   * @param {Object} options - Query options
   * @returns {Promise<Object>} User analytics data
   */
  async getUserAnalytics(options = {}) {
    try {
      const { timeframe = 30, limit = 50 } = options;
      const headers = await this.getHeaders();
      
      const response = await fetch(
        `${this.baseURL}/user?timeframe=${timeframe}&limit=${limit}`,
        { headers }
      );
      
      if (!response.ok) {
        throw new Error(`Analytics request failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      throw error;
    }
  }

  /**
   * Get learning progress trends
   * @param {number} timeframe - Days to look back
   * @returns {Promise<Object>} Learning progress data
   */
  async getLearningProgress(timeframe = 30) {
    try {
      const headers = await this.getHeaders();
      
      const response = await fetch(
        `${this.baseURL}/learning-progress?timeframe=${timeframe}`,
        { headers }
      );
      
      if (!response.ok) {
        throw new Error(`Learning progress request failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching learning progress:', error);
      throw error;
    }
  }

  /**
   * Get conversation quality insights
   * @param {number} timeframe - Days to look back
   * @returns {Promise<Object>} Quality insights
   */
  async getQualityInsights(timeframe = 30) {
    try {
      const headers = await this.getHeaders();
      
      const response = await fetch(
        `${this.baseURL}/quality-insights?timeframe=${timeframe}`,
        { headers }
      );
      
      if (!response.ok) {
        throw new Error(`Quality insights request failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching quality insights:', error);
      throw error;
    }
  }

  /**
   * Get model usage statistics
   * @param {number} timeframe - Days to look back
   * @returns {Promise<Object>} Model usage data
   */
  async getModelUsage(timeframe = 30) {
    try {
      const headers = await this.getHeaders();
      
      const response = await fetch(
        `${this.baseURL}/model-usage?timeframe=${timeframe}`,
        { headers }
      );
      
      if (!response.ok) {
        throw new Error(`Model usage request failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching model usage:', error);
      throw error;
    }
  }

  /**
   * Get analytics for specific conversation
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<Object>} Conversation analytics
   */
  async getConversationAnalytics(conversationId) {
    try {
      const headers = await this.getHeaders();
      
      const response = await fetch(
        `${this.baseURL}/conversation/${conversationId}`,
        { headers }
      );
      
      if (!response.ok) {
        throw new Error(`Conversation analytics request failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching conversation analytics:', error);
      throw error;
    }
  }

  /**
   * Format analytics data for display
   * @param {Object} analyticsData - Raw analytics data
   * @returns {Object} Formatted data
   */
  formatAnalyticsForDisplay(analyticsData) {
    if (!analyticsData) return null;

    return {
      // Summary metrics
      summary: {
        totalSessions: analyticsData.totalSessions || 0,
        averageQuality: this.formatScore(analyticsData.averageQuality),
        averageEngagement: this.formatPercentage(analyticsData.averageEngagement),
        totalMessages: analyticsData.totalMessages || 0,
        averageDuration: this.formatDuration(analyticsData.averageDuration)
      },

      // Recent sessions
      recentSessions: (analyticsData.recentSessions || []).map(session => ({
        id: session.id,
        date: this.formatDate(session.date),
        quality: this.formatScore(session.qualityScore),
        engagement: this.formatPercentage(session.engagementScore),
        duration: this.formatDuration(session.duration),
        messages: session.messageCount
      })),

      // Progress trends (if available)
      trends: analyticsData.trends ? {
        qualityImprovement: this.formatTrend(analyticsData.trends.qualityImprovement),
        engagementImprovement: this.formatTrend(analyticsData.trends.engagementImprovement)
      } : null
    };
  }

  /**
   * Format score (0-100)
   * @param {number} score - Raw score
   * @returns {string} Formatted score
   */
  formatScore(score) {
    if (typeof score !== 'number') return 'N/A';
    return `${Math.round(score * 10) / 10}/100`;
  }

  /**
   * Format percentage (0-1 to 0-100%)
   * @param {number} value - Raw value
   * @returns {string} Formatted percentage
   */
  formatPercentage(value) {
    if (typeof value !== 'number') return 'N/A';
    return `${Math.round(value * 100)}%`;
  }

  /**
   * Format duration in seconds to readable format
   * @param {number} seconds - Duration in seconds
   * @returns {string} Formatted duration
   */
  formatDuration(seconds) {
    if (typeof seconds !== 'number') return 'N/A';
    
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  }

  /**
   * Format date for display
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date
   */
  formatDate(date) {
    if (!date) return 'N/A';
    
    const dateObj = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - dateObj);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return dateObj.toLocaleDateString();
    }
  }

  /**
   * Format trend value
   * @param {number} trend - Trend value
   * @returns {Object} Formatted trend
   */
  formatTrend(trend) {
    if (typeof trend !== 'number') {
      return { direction: 'stable', value: 'N/A', color: '#666' };
    }
    
    const absValue = Math.abs(trend);
    const direction = trend > 0.1 ? 'up' : trend < -0.1 ? 'down' : 'stable';
    const color = direction === 'up' ? '#6FC935' : direction === 'down' ? '#FF6B6B' : '#666';
    
    return {
      direction,
      value: direction === 'stable' ? 'Stable' : `${trend > 0 ? '+' : ''}${trend.toFixed(1)}`,
      color
    };
  }

  /**
   * Get analytics summary for dashboard
   * @returns {Promise<Object>} Dashboard analytics
   */
  async getDashboardAnalytics() {
    try {
      const [userAnalytics, learningProgress, qualityInsights] = await Promise.all([
        this.getUserAnalytics({ timeframe: 7 }), // Last 7 days
        this.getLearningProgress(7),
        this.getQualityInsights(7)
      ]);

      return {
        user: this.formatAnalyticsForDisplay(userAnalytics),
        progress: learningProgress,
        quality: qualityInsights,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      // Return fallback data
      return {
        user: null,
        progress: null,
        quality: null,
        error: error.message,
        lastUpdated: new Date().toISOString()
      };
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
export default analyticsService;
