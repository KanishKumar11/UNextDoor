/**
 * Analytics Routes
 * Provides endpoints for conversation analytics and metrics
 */

import express from "express";
import { conversationAnalytics } from "../services/conversationAnalyticsService.js";
import { authenticateToken } from "../middleware/auth.js";
import { sendSuccess, sendError } from "../utils/responseUtils.js";
import Conversation from "../models/Conversation.js";

const router = express.Router();

/**
 * Get user analytics
 * GET /api/v1/analytics/user
 */
router.get("/user", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeframe = 30, limit = 50 } = req.query;
    
    const analytics = await conversationAnalytics.getUserAnalytics(userId, {
      timeframe: parseInt(timeframe),
      limit: parseInt(limit)
    });
    
    return sendSuccess(res, 200, "User analytics retrieved", analytics);
  } catch (error) {
    console.error("Error getting user analytics:", error);
    return sendError(res, 500, "Failed to get user analytics");
  }
});

/**
 * Get system analytics (admin only)
 * GET /api/v1/analytics/system
 */
router.get("/system", authenticateToken, async (req, res) => {
  try {
    // TODO: Add admin role check
    const systemAnalytics = conversationAnalytics.getSystemAnalytics();
    
    return sendSuccess(res, 200, "System analytics retrieved", systemAnalytics);
  } catch (error) {
    console.error("Error getting system analytics:", error);
    return sendError(res, 500, "Failed to get system analytics");
  }
});

/**
 * Get conversation analytics by ID
 * GET /api/v1/analytics/conversation/:id
 */
router.get("/conversation/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const conversation = await Conversation.findOne({
      _id: id,
      userId,
      analytics: { $exists: true }
    });
    
    if (!conversation) {
      return sendError(res, 404, "Conversation not found or no analytics available");
    }
    
    return sendSuccess(res, 200, "Conversation analytics retrieved", {
      conversationId: id,
      analytics: conversation.analytics,
      basicInfo: {
        title: conversation.title,
        createdAt: conversation.createdAt,
        duration: conversation.duration,
        messageCount: conversation.messages.length
      }
    });
  } catch (error) {
    console.error("Error getting conversation analytics:", error);
    return sendError(res, 500, "Failed to get conversation analytics");
  }
});

/**
 * Get learning progress analytics
 * GET /api/v1/analytics/learning-progress
 */
router.get("/learning-progress", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeframe = 30 } = req.query;
    const startDate = new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000);
    
    const conversations = await Conversation.find({
      userId,
      createdAt: { $gte: startDate },
      analytics: { $exists: true }
    }).sort({ createdAt: 1 });
    
    if (conversations.length === 0) {
      return sendSuccess(res, 200, "No learning progress data available", {
        message: "Start having conversations to see your progress!"
      });
    }
    
    // Calculate progress trends
    const progressData = conversations.map(conv => ({
      date: conv.createdAt.toISOString().split('T')[0],
      qualityScore: conv.analytics.qualityScore || 0,
      engagementScore: conv.analytics.engagementScore || 0,
      vocabularyLearned: conv.analytics.learningOutcomes?.conceptsLearned?.length || 0,
      mistakesCorrected: conv.analytics.conversationFlow?.practiceSessionsTriggered || 0
    }));
    
    // Group by date and calculate daily averages
    const dailyProgress = progressData.reduce((acc, session) => {
      if (!acc[session.date]) {
        acc[session.date] = {
          date: session.date,
          sessions: 0,
          totalQuality: 0,
          totalEngagement: 0,
          totalVocabulary: 0,
          totalCorrections: 0
        };
      }
      
      acc[session.date].sessions++;
      acc[session.date].totalQuality += session.qualityScore;
      acc[session.date].totalEngagement += session.engagementScore;
      acc[session.date].totalVocabulary += session.vocabularyLearned;
      acc[session.date].totalCorrections += session.mistakesCorrected;
      
      return acc;
    }, {});
    
    const progressTrend = Object.values(dailyProgress).map(day => ({
      date: day.date,
      averageQuality: Math.round((day.totalQuality / day.sessions) * 10) / 10,
      averageEngagement: Math.round((day.totalEngagement / day.sessions) * 100) / 100,
      vocabularyPerSession: Math.round((day.totalVocabulary / day.sessions) * 10) / 10,
      correctionsPerSession: Math.round((day.totalCorrections / day.sessions) * 10) / 10,
      sessionCount: day.sessions
    }));
    
    // Calculate overall trends
    const firstWeek = progressTrend.slice(0, 7);
    const lastWeek = progressTrend.slice(-7);
    
    const trends = {
      qualityImprovement: lastWeek.length > 0 && firstWeek.length > 0 
        ? (lastWeek.reduce((sum, day) => sum + day.averageQuality, 0) / lastWeek.length) -
          (firstWeek.reduce((sum, day) => sum + day.averageQuality, 0) / firstWeek.length)
        : 0,
      engagementImprovement: lastWeek.length > 0 && firstWeek.length > 0
        ? (lastWeek.reduce((sum, day) => sum + day.averageEngagement, 0) / lastWeek.length) -
          (firstWeek.reduce((sum, day) => sum + day.averageEngagement, 0) / firstWeek.length)
        : 0
    };
    
    return sendSuccess(res, 200, "Learning progress retrieved", {
      timeframe,
      totalSessions: conversations.length,
      progressTrend,
      trends: {
        qualityImprovement: Math.round(trends.qualityImprovement * 10) / 10,
        engagementImprovement: Math.round(trends.engagementImprovement * 100) / 100
      },
      summary: {
        averageQuality: Math.round(progressData.reduce((sum, s) => sum + s.qualityScore, 0) / progressData.length * 10) / 10,
        averageEngagement: Math.round(progressData.reduce((sum, s) => sum + s.engagementScore, 0) / progressData.length * 100) / 100,
        totalVocabularyLearned: progressData.reduce((sum, s) => sum + s.vocabularyLearned, 0),
        totalCorrections: progressData.reduce((sum, s) => sum + s.mistakesCorrected, 0)
      }
    });
  } catch (error) {
    console.error("Error getting learning progress:", error);
    return sendError(res, 500, "Failed to get learning progress");
  }
});

/**
 * Get model usage statistics
 * GET /api/v1/analytics/model-usage
 */
router.get("/model-usage", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeframe = 30 } = req.query;
    const startDate = new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000);
    
    const conversations = await Conversation.find({
      userId,
      createdAt: { $gte: startDate },
      analytics: { $exists: true }
    });
    
    if (conversations.length === 0) {
      return sendSuccess(res, 200, "No model usage data available", {
        message: "No conversations found in the specified timeframe"
      });
    }
    
    // Aggregate model usage
    const modelUsage = {};
    let totalCacheHits = 0;
    let totalCacheMisses = 0;
    
    conversations.forEach(conv => {
      if (conv.analytics.modelUsage) {
        Object.entries(conv.analytics.modelUsage).forEach(([model, count]) => {
          modelUsage[model] = (modelUsage[model] || 0) + count;
        });
      }
      
      if (conv.analytics.cachePerformance) {
        totalCacheHits += conv.analytics.cachePerformance.hits || 0;
        totalCacheMisses += conv.analytics.cachePerformance.misses || 0;
      }
    });
    
    const totalRequests = totalCacheHits + totalCacheMisses;
    const cacheHitRate = totalRequests > 0 ? (totalCacheHits / totalRequests) * 100 : 0;
    
    return sendSuccess(res, 200, "Model usage statistics retrieved", {
      timeframe,
      modelUsage,
      cachePerformance: {
        hits: totalCacheHits,
        misses: totalCacheMisses,
        hitRate: Math.round(cacheHitRate * 10) / 10,
        totalRequests
      },
      costSavings: {
        estimatedSavings: Math.round(totalCacheHits * 0.001 * 100) / 100, // Rough estimate
        message: "Estimated cost savings from caching"
      }
    });
  } catch (error) {
    console.error("Error getting model usage:", error);
    return sendError(res, 500, "Failed to get model usage statistics");
  }
});

/**
 * Get conversation quality insights
 * GET /api/v1/analytics/quality-insights
 */
router.get("/quality-insights", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeframe = 30 } = req.query;
    const startDate = new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000);
    
    const conversations = await Conversation.find({
      userId,
      createdAt: { $gte: startDate },
      analytics: { $exists: true }
    });
    
    if (conversations.length === 0) {
      return sendSuccess(res, 200, "No quality insights available", {
        message: "Start having conversations to get quality insights!"
      });
    }
    
    // Analyze quality patterns
    const qualityScores = conversations.map(conv => conv.analytics.qualityScore || 0);
    const engagementScores = conversations.map(conv => conv.analytics.engagementScore || 0);
    
    const insights = {
      averageQuality: Math.round(qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length * 10) / 10,
      averageEngagement: Math.round(engagementScores.reduce((a, b) => a + b, 0) / engagementScores.length * 100) / 100,
      qualityDistribution: {
        excellent: qualityScores.filter(score => score >= 90).length,
        good: qualityScores.filter(score => score >= 70 && score < 90).length,
        fair: qualityScores.filter(score => score >= 50 && score < 70).length,
        needsImprovement: qualityScores.filter(score => score < 50).length
      },
      recommendations: []
    };
    
    // Generate recommendations
    if (insights.averageQuality < 70) {
      insights.recommendations.push("Focus on reducing mistakes and asking for clarification when needed");
    }
    
    if (insights.averageEngagement < 0.7) {
      insights.recommendations.push("Try to respond more quickly and engage more actively in conversations");
    }
    
    const recentSessions = conversations.slice(-5);
    const recentQuality = recentSessions.reduce((sum, conv) => sum + (conv.analytics.qualityScore || 0), 0) / recentSessions.length;
    
    if (recentQuality > insights.averageQuality + 10) {
      insights.recommendations.push("Great improvement! Keep up the consistent practice");
    }
    
    return sendSuccess(res, 200, "Quality insights retrieved", insights);
  } catch (error) {
    console.error("Error getting quality insights:", error);
    return sendError(res, 500, "Failed to get quality insights");
  }
});

export default router;
