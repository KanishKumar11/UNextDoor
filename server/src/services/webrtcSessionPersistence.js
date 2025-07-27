/**
 * WebRTC Session Persistence Service
 * Connects WebRTC real-time sessions to database storage and enables session recovery
 */

import Conversation from "../models/Conversation.js";
import { conversationFlowManager } from "./conversationFlowService.js";
import { responseCacheManager } from "./responseCacheService.js";
import { conversationAnalytics } from "./conversationAnalyticsService.js";

/**
 * WebRTC Session Persistence Manager
 * Handles saving and recovering WebRTC conversation sessions
 */
class WebRTCSessionPersistenceManager {
  constructor() {
    this.activeSessions = new Map(); // sessionId -> session data
    this.userSessions = new Map(); // userId -> sessionId
  }

  /**
   * Create or resume a persistent WebRTC session
   * @param {string} userId - User ID
   * @param {Object} sessionOptions - Session configuration
   * @returns {Promise<Object>} Session data
   */
  async createOrResumeSession(userId, sessionOptions = {}) {
    try {
      console.log(`🔄 Creating/resuming WebRTC session for user: ${userId}`);

      // Check for existing active session
      const existingSessionId = this.userSessions.get(userId);
      if (existingSessionId && this.activeSessions.has(existingSessionId)) {
        console.log(`♻️ Resuming existing session: ${existingSessionId}`);
        return this.activeSessions.get(existingSessionId);
      }

      // Look for recent incomplete conversation in database
      const recentConversation = await this.findRecentIncompleteConversation(userId, sessionOptions);

      let conversation;
      let isResumed = false;

      if (recentConversation) {
        conversation = recentConversation;
        isResumed = true;
        console.log(`📂 Resuming conversation: ${conversation._id}`);
      } else {
        // Create new conversation
        conversation = await this.createNewConversation(userId, sessionOptions);
        console.log(`🆕 Created new conversation: ${conversation._id}`);
      }

      // Create session data
      const sessionData = {
        sessionId: conversation._id.toString(),
        conversationId: conversation._id.toString(),
        userId,
        startTime: isResumed ? conversation.createdAt : new Date(),
        lastActivity: new Date(),
        isResumed,
        messageCount: conversation.messages.length,
        status: 'active',
        scenarioId: sessionOptions.scenarioId,
        level: sessionOptions.level || conversation.level,
        options: sessionOptions
      };

      // Store in memory
      this.activeSessions.set(sessionData.sessionId, sessionData);
      this.userSessions.set(userId, sessionData.sessionId);

      // Initialize conversation flow manager
      conversationFlowManager.getSession(userId, {
        conversationId: conversation._id.toString(),
        isResumed,
        messageCount: conversation.messages.length
      });

      // Initialize analytics tracking
      conversationAnalytics.initializeSession(sessionData.sessionId, sessionData);

      return sessionData;
    } catch (error) {
      console.error("Error creating/resuming WebRTC session:", error);
      throw error;
    }
  }

  /**
   * Find recent incomplete conversation for user
   * @param {string} userId - User ID
   * @param {Object} sessionOptions - Session options
   * @returns {Promise<Object|null>} Recent conversation or null
   */
  async findRecentIncompleteConversation(userId, sessionOptions) {
    try {
      const cutoffTime = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago

      const query = {
        userId,
        status: { $in: ['active', 'paused'] },
        lastMessageAt: { $gte: cutoffTime }
      };

      // If scenario-based, look for same scenario
      if (sessionOptions.scenarioId) {
        query.scenarioId = sessionOptions.scenarioId;
      }

      const conversation = await Conversation.findOne(query)
        .sort({ lastMessageAt: -1 })
        .limit(1);

      return conversation;
    } catch (error) {
      console.error("Error finding recent conversation:", error);
      return null;
    }
  }

  /**
   * Create new conversation for WebRTC session
   * @param {string} userId - User ID
   * @param {Object} sessionOptions - Session options
   * @returns {Promise<Object>} New conversation
   */
  async createNewConversation(userId, sessionOptions) {
    const conversation = new Conversation({
      userId,
      title: this.generateConversationTitle(sessionOptions),
      level: sessionOptions.level || "beginner",
      scenarioId: sessionOptions.scenarioId,
      isLessonBased: sessionOptions.isLessonBased || false,
      lessonDetails: sessionOptions.lessonDetails || "",
      type: 'webrtc_realtime',
      status: 'active',
      messages: [],
      createdAt: new Date(),
      lastMessageAt: new Date()
    });

    await conversation.save();
    return conversation;
  }

  /**
   * Generate conversation title based on session options
   * @param {Object} sessionOptions - Session options
   * @returns {string} Conversation title
   */
  generateConversationTitle(sessionOptions) {
    if (sessionOptions.isLessonBased && sessionOptions.lessonDetails) {
      return `Lesson: ${sessionOptions.lessonDetails}`;
    }

    if (sessionOptions.scenarioId) {
      return `Scenario Practice: ${sessionOptions.scenarioId}`;
    }

    const now = new Date();
    return `Conversation - ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
  }

  /**
   * Save message to persistent conversation
   * @param {string} sessionId - Session ID
   * @param {Object} message - Message data
   * @returns {Promise<boolean>} Success status
   */
  async saveMessage(sessionId, message) {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        console.warn(`Session not found: ${sessionId}`);
        return false;
      }

      // Update conversation in database
      const conversation = await Conversation.findById(session.conversationId);
      if (!conversation) {
        console.warn(`Conversation not found: ${session.conversationId}`);
        return false;
      }

      // Add message to conversation
      conversation.messages.push({
        role: message.role,
        content: message.content,
        timestamp: new Date(),
        audioTranscript: message.audioTranscript,
        metadata: message.metadata || {}
      });

      conversation.lastMessageAt = new Date();
      await conversation.save();

      // Update session data
      session.messageCount = conversation.messages.length;
      session.lastActivity = new Date();

      // Update conversation flow metrics
      if (message.role === 'user') {
        conversationFlowManager.updateMetrics(session.userId, {
          newMessage: true,
          responseTime: message.responseTime
        });
      }

      console.log(`💾 Saved message to conversation: ${session.conversationId}`);
      return true;
    } catch (error) {
      console.error("Error saving message:", error);
      return false;
    }
  }

  /**
   * Update session status
   * @param {string} sessionId - Session ID
   * @param {string} status - New status
   * @returns {Promise<boolean>} Success status
   */
  async updateSessionStatus(sessionId, status) {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        return false;
      }

      session.status = status;
      session.lastActivity = new Date();

      // Update conversation status in database
      await Conversation.findByIdAndUpdate(session.conversationId, {
        status: status === 'ended' ? 'completed' : status,
        lastMessageAt: new Date()
      });

      console.log(`📊 Updated session status: ${sessionId} -> ${status}`);
      return true;
    } catch (error) {
      console.error("Error updating session status:", error);
      return false;
    }
  }

  /**
   * End WebRTC session and save final state
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Session summary
   */
  async endSession(sessionId) {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        console.warn(`Session not found for ending: ${sessionId}`);
        return null;
      }

      // Calculate session duration
      const duration = Date.now() - new Date(session.startTime).getTime();

      // Update conversation with final data
      const conversation = await Conversation.findById(session.conversationId);
      if (conversation) {
        conversation.status = 'completed';
        conversation.duration = Math.floor(duration / 1000); // Duration in seconds
        conversation.lastMessageAt = new Date();

        // Add session metadata
        conversation.metadata = {
          ...conversation.metadata,
          sessionType: 'webrtc_realtime',
          totalMessages: session.messageCount,
          wasResumed: session.isResumed
        };

        await conversation.save();
      }

      // Get conversation flow summary
      const flowSummary = conversationFlowManager.endSession(session.userId);

      // End analytics session and get final metrics
      const analyticsData = await conversationAnalytics.endSession(sessionId);

      // Create session summary
      const summary = {
        sessionId,
        conversationId: session.conversationId,
        userId: session.userId,
        duration,
        messageCount: session.messageCount,
        isResumed: session.isResumed,
        flowMetrics: flowSummary,
        analytics: analyticsData,
        endTime: new Date()
      };

      // Clean up memory
      this.activeSessions.delete(sessionId);
      this.userSessions.delete(session.userId);

      console.log(`🏁 Ended WebRTC session: ${sessionId} (${Math.floor(duration / 1000)}s)`);
      return summary;
    } catch (error) {
      console.error("Error ending session:", error);
      return null;
    }
  }

  /**
   * Get session data
   * @param {string} sessionId - Session ID
   * @returns {Object|null} Session data
   */
  getSession(sessionId) {
    return this.activeSessions.get(sessionId) || null;
  }

  /**
   * Get session by user ID
   * @param {string} userId - User ID
   * @returns {Object|null} Session data
   */
  getSessionByUserId(userId) {
    const sessionId = this.userSessions.get(userId);
    return sessionId ? this.activeSessions.get(sessionId) : null;
  }

  /**
   * Get all active sessions
   * @returns {Array} Array of active sessions
   */
  getActiveSessions() {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Clean up inactive sessions
   * @param {number} maxInactiveTime - Max inactive time in milliseconds
   */
  async cleanupInactiveSessions(maxInactiveTime = 30 * 60 * 1000) { // 30 minutes
    const now = Date.now();
    const sessionsToCleanup = [];

    for (const [sessionId, session] of this.activeSessions.entries()) {
      const inactiveTime = now - new Date(session.lastActivity).getTime();
      if (inactiveTime > maxInactiveTime) {
        sessionsToCleanup.push(sessionId);
      }
    }

    for (const sessionId of sessionsToCleanup) {
      console.log(`🧹 Cleaning up inactive session: ${sessionId}`);
      await this.endSession(sessionId);
    }

    if (sessionsToCleanup.length > 0) {
      console.log(`🧹 Cleaned up ${sessionsToCleanup.length} inactive sessions`);
    }
  }
}

// Singleton instance
export const webrtcSessionPersistence = new WebRTCSessionPersistenceManager();

// Start cleanup interval
setInterval(() => {
  webrtcSessionPersistence.cleanupInactiveSessions();
}, 10 * 60 * 1000); // Check every 10 minutes

export default {
  WebRTCSessionPersistenceManager,
  webrtcSessionPersistence
};
