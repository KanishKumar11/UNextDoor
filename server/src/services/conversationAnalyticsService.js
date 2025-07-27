/**
 * Conversation Analytics Service
 * Tracks conversation quality metrics, model usage, and learning effectiveness
 */

import Conversation from "../models/Conversation.js";
import UserProgress from "../models/UserProgress.js";
import { responseCacheManager } from "./responseCacheService.js";

/**
 * Conversation Analytics Manager
 * Provides comprehensive analytics for AI tutor conversations
 */
class ConversationAnalyticsManager {
  constructor() {
    this.metrics = new Map(); // sessionId -> metrics
    this.aggregatedStats = {
      totalConversations: 0,
      totalMessages: 0,
      averageSessionDuration: 0,
      cacheHitRate: 0,
      modelUsageStats: {},
      qualityMetrics: {}
    };
  }

  /**
   * Initialize conversation metrics tracking
   * @param {string} sessionId - Session ID
   * @param {Object} sessionData - Initial session data
   */
  initializeSession(sessionId, sessionData) {
    const metrics = {
      sessionId,
      userId: sessionData.userId,
      startTime: Date.now(),
      endTime: null,
      messageCount: 0,
      userMessages: 0,
      aiMessages: 0,
      averageResponseTime: 0,
      responseTimes: [],
      qualityScores: [],
      engagementScore: 1.0,
      mistakeCount: 0,
      correctionCount: 0,
      vocabularyIntroduced: 0,
      grammarPointsCovered: 0,
      cacheHits: 0,
      cacheMisses: 0,
      modelUsage: {},
      conversationFlow: {
        breaksSuggested: 0,
        breaksAccepted: 0,
        practiceSessionsTriggered: 0,
        stateTransitions: []
      },
      learningOutcomes: {
        conceptsLearned: [],
        skillsImproved: [],
        weaknessesIdentified: []
      }
    };

    this.metrics.set(sessionId, metrics);
    console.log(`📊 Analytics initialized for session: ${sessionId}`);
  }

  /**
   * Track message exchange
   * @param {string} sessionId - Session ID
   * @param {Object} messageData - Message data
   */
  trackMessage(sessionId, messageData) {
    const metrics = this.metrics.get(sessionId);
    if (!metrics) return;

    metrics.messageCount++;

    if (messageData.role === 'user') {
      metrics.userMessages++;

      // Track response time if available
      if (messageData.responseTime) {
        metrics.responseTimes.push(messageData.responseTime);
        metrics.averageResponseTime = metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length;
      }
    } else if (messageData.role === 'assistant') {
      metrics.aiMessages++;

      // Track model usage
      if (messageData.modelUsed) {
        metrics.modelUsage[messageData.modelUsed] = (metrics.modelUsage[messageData.modelUsed] || 0) + 1;
      }

      // Track cache performance
      if (messageData.fromCache) {
        metrics.cacheHits++;
      } else {
        metrics.cacheMisses++;
      }
    }

    console.log(`📈 Message tracked for session ${sessionId}: ${messageData.role}`);
  }

  /**
   * Track learning event
   * @param {string} sessionId - Session ID
   * @param {Object} learningEvent - Learning event data
   */
  trackLearningEvent(sessionId, learningEvent) {
    const metrics = this.metrics.get(sessionId);
    if (!metrics) return;

    const { type, data } = learningEvent;

    switch (type) {
      case 'mistake':
        metrics.mistakeCount++;
        if (data.corrected) {
          metrics.correctionCount++;
        }
        break;

      case 'vocabulary_introduced':
        metrics.vocabularyIntroduced++;
        metrics.learningOutcomes.conceptsLearned.push(data.word);
        break;

      case 'grammar_point':
        metrics.grammarPointsCovered++;
        metrics.learningOutcomes.conceptsLearned.push(data.concept);
        break;

      case 'skill_improvement':
        metrics.learningOutcomes.skillsImproved.push(data.skill);
        break;

      case 'weakness_identified':
        metrics.learningOutcomes.weaknessesIdentified.push(data.weakness);
        break;
    }

    console.log(`🎯 Learning event tracked: ${type} for session ${sessionId}`);
  }

  /**
   * Track conversation flow event
   * @param {string} sessionId - Session ID
   * @param {Object} flowEvent - Flow event data
   */
  trackFlowEvent(sessionId, flowEvent) {
    const metrics = this.metrics.get(sessionId);
    if (!metrics) return;

    const { type, data } = flowEvent;

    switch (type) {
      case 'break_suggested':
        metrics.conversationFlow.breaksSuggested++;
        break;

      case 'break_accepted':
        metrics.conversationFlow.breaksAccepted++;
        break;

      case 'practice_triggered':
        metrics.conversationFlow.practiceSessionsTriggered++;
        break;

      case 'state_transition':
        metrics.conversationFlow.stateTransitions.push({
          from: data.fromState,
          to: data.toState,
          timestamp: Date.now()
        });
        break;
    }

    console.log(`🔄 Flow event tracked: ${type} for session ${sessionId}`);
  }

  /**
   * Calculate conversation quality score
   * @param {Object} metrics - Session metrics
   * @returns {number} Quality score (0-100)
   */
  calculateQualityScore(metrics) {
    let score = 100;

    // Deduct for high mistake rate
    const mistakeRate = metrics.mistakeCount / Math.max(metrics.userMessages, 1);
    score -= mistakeRate * 30;

    // Deduct for poor engagement (slow responses)
    if (metrics.averageResponseTime > 10000) { // 10 seconds
      score -= 20;
    }

    // Add for learning outcomes
    score += Math.min(metrics.vocabularyIntroduced * 2, 20);
    score += Math.min(metrics.grammarPointsCovered * 3, 15);

    // Add for corrections made
    const correctionRate = metrics.correctionCount / Math.max(metrics.mistakeCount, 1);
    score += correctionRate * 10;

    // Add for conversation flow management
    if (metrics.conversationFlow.breaksSuggested > 0) {
      const breakAcceptanceRate = metrics.conversationFlow.breaksAccepted / metrics.conversationFlow.breaksSuggested;
      score += breakAcceptanceRate * 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * End session and calculate final metrics
   * @param {string} sessionId - Session ID
   * @returns {Object} Final session analytics
   */
  async endSession(sessionId) {
    const metrics = this.metrics.get(sessionId);
    if (!metrics) return null;

    metrics.endTime = Date.now();
    const duration = metrics.endTime - metrics.startTime;

    // Calculate final quality score
    const qualityScore = this.calculateQualityScore(metrics);
    metrics.qualityScores.push(qualityScore);

    // Calculate engagement score
    const engagementFactors = [
      metrics.messageCount > 5 ? 1 : 0.5, // Message volume
      metrics.averageResponseTime < 5000 ? 1 : 0.7, // Response speed
      metrics.correctionCount > 0 ? 1 : 0.8, // Learning engagement
      duration > 5 * 60 * 1000 ? 1 : 0.6 // Session duration
    ];

    metrics.engagementScore = engagementFactors.reduce((a, b) => a + b, 0) / engagementFactors.length;

    // Save analytics to database
    await this.saveSessionAnalytics(sessionId, metrics);

    // Update aggregated stats
    this.updateAggregatedStats(metrics);

    // Clean up
    this.metrics.delete(sessionId);

    console.log(`📊 Session analytics completed: ${sessionId} (Quality: ${qualityScore.toFixed(1)})`);

    return {
      sessionId,
      duration,
      qualityScore,
      engagementScore: metrics.engagementScore,
      messageCount: metrics.messageCount,
      learningOutcomes: metrics.learningOutcomes,
      conversationFlow: metrics.conversationFlow,
      modelUsage: metrics.modelUsage,
      cachePerformance: {
        hits: metrics.cacheHits,
        misses: metrics.cacheMisses,
        hitRate: metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses) || 0
      }
    };
  }

  /**
   * Save session analytics to database
   * @param {string} sessionId - Session ID
   * @param {Object} metrics - Session metrics
   */
  async saveSessionAnalytics(sessionId, metrics) {
    try {
      // Update conversation with analytics
      await Conversation.findByIdAndUpdate(sessionId, {
        $set: {
          analytics: {
            qualityScore: this.calculateQualityScore(metrics),
            engagementScore: metrics.engagementScore,
            messageCount: metrics.messageCount,
            duration: metrics.endTime - metrics.startTime,
            learningOutcomes: metrics.learningOutcomes,
            conversationFlow: metrics.conversationFlow,
            modelUsage: metrics.modelUsage,
            cachePerformance: {
              hits: metrics.cacheHits,
              misses: metrics.cacheMisses,
              hitRate: metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses) || 0
            }
          }
        }
      });

      console.log(`💾 Analytics saved for session: ${sessionId}`);
    } catch (error) {
      console.error("Error saving session analytics:", error);
    }
  }

  /**
   * Update aggregated statistics
   * @param {Object} metrics - Session metrics
   */
  updateAggregatedStats(metrics) {
    this.aggregatedStats.totalConversations++;
    this.aggregatedStats.totalMessages += metrics.messageCount;

    // Update average session duration
    const totalDuration = this.aggregatedStats.averageSessionDuration * (this.aggregatedStats.totalConversations - 1);
    const newDuration = metrics.endTime - metrics.startTime;
    this.aggregatedStats.averageSessionDuration = (totalDuration + newDuration) / this.aggregatedStats.totalConversations;

    // Update cache hit rate
    const totalCacheRequests = metrics.cacheHits + metrics.cacheMisses;
    if (totalCacheRequests > 0) {
      const sessionHitRate = metrics.cacheHits / totalCacheRequests;
      this.aggregatedStats.cacheHitRate = (this.aggregatedStats.cacheHitRate + sessionHitRate) / 2;
    }

    // Update model usage stats
    Object.entries(metrics.modelUsage).forEach(([model, count]) => {
      this.aggregatedStats.modelUsageStats[model] = (this.aggregatedStats.modelUsageStats[model] || 0) + count;
    });
  }

  /**
   * Get analytics for a specific user
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} User analytics
   */
  async getUserAnalytics(userId, options = {}) {
    try {
      const { timeframe = 30, limit = 50 } = options;
      const startDate = new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000);

      const conversations = await Conversation.find({
        userId,
        createdAt: { $gte: startDate },
        analytics: { $exists: true }
      })
        .sort({ createdAt: -1 })
        .limit(limit);

      if (conversations.length === 0) {
        return { message: "No analytics data available" };
      }

      // Calculate user-specific metrics
      const totalSessions = conversations.length;
      const averageQuality = conversations.reduce((sum, conv) => sum + (conv.analytics.qualityScore || 0), 0) / totalSessions;
      const averageEngagement = conversations.reduce((sum, conv) => sum + (conv.analytics.engagementScore || 0), 0) / totalSessions;
      const totalMessages = conversations.reduce((sum, conv) => sum + (conv.analytics.messageCount || 0), 0);
      const averageDuration = conversations.reduce((sum, conv) => sum + (conv.analytics.duration || 0), 0) / totalSessions;

      return {
        userId,
        timeframe,
        totalSessions,
        averageQuality: Math.round(averageQuality * 10) / 10,
        averageEngagement: Math.round(averageEngagement * 100) / 100,
        totalMessages,
        averageDuration: Math.round(averageDuration / 1000), // Convert to seconds
        recentSessions: conversations.slice(0, 10).map(conv => ({
          id: conv._id,
          date: conv.createdAt,
          qualityScore: conv.analytics.qualityScore,
          engagementScore: conv.analytics.engagementScore,
          duration: Math.round(conv.analytics.duration / 1000),
          messageCount: conv.analytics.messageCount
        }))
      };
    } catch (error) {
      console.error("Error getting user analytics:", error);
      throw error;
    }
  }

  /**
   * Get system-wide analytics
   * @returns {Object} System analytics
   */
  getSystemAnalytics() {
    return {
      ...this.aggregatedStats,
      activeSessions: this.metrics.size,
      timestamp: new Date().toISOString()
    };
  }
}

// Singleton instance
export const conversationAnalytics = new ConversationAnalyticsManager();

/**
 * Middleware to automatically track analytics
 * @param {string} sessionId - Session ID
 * @param {Object} messageData - Message data
 */
export const trackMessageAnalytics = (sessionId, messageData) => {
  conversationAnalytics.trackMessage(sessionId, messageData);

  // Auto-detect learning events from message content
  if (messageData.role === 'assistant' && messageData.content) {
    const content = messageData.content.toLowerCase();

    // Detect vocabulary introduction
    if (content.includes('새로운 단어') || content.includes('new word') || content.includes('vocabulary')) {
      conversationAnalytics.trackLearningEvent(sessionId, {
        type: 'vocabulary_introduced',
        data: { detected: true }
      });
    }

    // Detect grammar explanations
    if (content.includes('문법') || content.includes('grammar') || content.includes('particle')) {
      conversationAnalytics.trackLearningEvent(sessionId, {
        type: 'grammar_point',
        data: { detected: true }
      });
    }

    // Detect corrections
    if (content.includes('correction') || content.includes('actually') || content.includes('should be')) {
      conversationAnalytics.trackLearningEvent(sessionId, {
        type: 'mistake',
        data: { corrected: true }
      });
    }
  }
};

export default {
  ConversationAnalyticsManager,
  conversationAnalytics,
  trackMessageAnalytics
};
