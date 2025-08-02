/**
 * Conversation Flow Management Service
 * Manages intelligent conversation flow, break suggestions, and practice triggers
 */

import {
  CONVERSATION_STATES,
  shouldSuggestBreak,
  getPracticeRecommendation,
  generateTransition,
  generatePersonalityResponse
} from "./aiPersonalityService.js";

/**
 * Conversation Flow Manager
 * Tracks and manages the flow of AI tutor conversations
 */
export class ConversationFlowManager {
  constructor() {
    this.sessions = new Map(); // userId -> session data
  }

  /**
   * Initialize or get conversation session
   * @param {string} userId - User ID
   * @param {Object} options - Session options
   * @returns {Object} Session data
   */
  getSession(userId, options = {}) {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, {
        userId,
        startTime: Date.now(),
        currentState: CONVERSATION_STATES.GREETING,
        messageCount: 0,
        mistakeCount: 0,
        lastBreakSuggestion: null,
        lastPracticeSession: null,
        userEngagement: 1.0,
        responseLatencies: [],
        recentMistakes: [],
        conversationMetrics: {
          duration: 0,
          mistakeRate: 0,
          responseLatency: 0,
          userEngagement: 1.0
        },
        ...options
      });
    }

    return this.sessions.get(userId);
  }

  /**
   * Update conversation metrics
   * @param {string} userId - User ID
   * @param {Object} metrics - New metrics
   */
  updateMetrics(userId, metrics) {
    const session = this.getSession(userId);

    // Update basic counters
    if (metrics.newMessage) session.messageCount++;
    if (metrics.mistake) {
      session.mistakeCount++;
      session.recentMistakes.push({
        type: metrics.mistake.type,
        content: metrics.mistake.content,
        timestamp: Date.now()
      });

      // Keep only last 10 mistakes
      if (session.recentMistakes.length > 10) {
        session.recentMistakes = session.recentMistakes.slice(-10);
      }
    }

    // Track response latency
    if (metrics.responseTime) {
      session.responseLatencies.push(metrics.responseTime);
      if (session.responseLatencies.length > 5) {
        session.responseLatencies = session.responseLatencies.slice(-5);
      }
    }

    // Update engagement score
    if (metrics.engagement !== undefined) {
      session.userEngagement = metrics.engagement;
    }

    // Calculate current metrics
    session.conversationMetrics = this.calculateMetrics(session);
  }

  /**
   * Calculate conversation metrics
   * @param {Object} session - Session data
   * @returns {Object} Calculated metrics
   */
  calculateMetrics(session) {
    const duration = Date.now() - session.startTime;
    const mistakeRate = session.messageCount > 0 ? session.mistakeCount / session.messageCount : 0;
    const avgResponseLatency = session.responseLatencies.length > 0
      ? session.responseLatencies.reduce((a, b) => a + b, 0) / session.responseLatencies.length
      : 0;

    return {
      duration,
      mistakeRate,
      responseLatency: avgResponseLatency,
      userEngagement: session.userEngagement
    };
  }

  /**
   * Check if break should be suggested
   * @param {string} userId - User ID
   * @returns {Object} Break suggestion result
   */
  checkBreakSuggestion(userId) {
    const session = this.getSession(userId);
    const metrics = session.conversationMetrics;

    // Don't suggest break if recently suggested
    const timeSinceLastBreak = session.lastBreakSuggestion
      ? Date.now() - session.lastBreakSuggestion
      : Infinity;

    if (timeSinceLastBreak < 5 * 60 * 1000) { // 5 minutes
      return { shouldSuggest: false, reason: "recent_suggestion" };
    }

    const shouldSuggest = shouldSuggestBreak(metrics);

    if (shouldSuggest) {
      session.lastBreakSuggestion = Date.now();
      return {
        shouldSuggest: true,
        reason: this.getBreakReason(metrics),
        suggestion: this.generateBreakSuggestion(metrics)
      };
    }

    return { shouldSuggest: false };
  }

  /**
   * Get reason for break suggestion
   * @param {Object} metrics - Conversation metrics
   * @returns {string} Break reason
   */
  getBreakReason(metrics) {
    if (metrics.duration > 15 * 60 * 1000) return "duration";
    if (metrics.mistakeRate > 0.4) return "mistake_rate";
    if (metrics.responseLatency > 10000) return "slow_responses";
    if (metrics.userEngagement < 0.3) return "low_engagement";
    return "general_fatigue";
  }

  /**
   * Generate break suggestion message
   * @param {Object} metrics - Conversation metrics
   * @returns {string} Break suggestion
   */
  generateBreakSuggestion(metrics) {
    const reason = this.getBreakReason(metrics);

    const suggestions = {
      duration: "You've been practicing for a while now. A quick 2-3 minute break might help you absorb what we've covered.",
      mistake_rate: "I notice you're working hard on some challenging points. A brief pause could help reset your focus.",
      slow_responses: "No rush at all! Want to take a moment to process what we've been practicing?",
      low_engagement: "Feel free to take a quick break if you need to recharge - I'll be here when you're ready.",
      general_fatigue: "Good time for a short mental break if you'd like. Sometimes stepping away helps things click."
    };

    return suggestions[reason] || suggestions.general_fatigue;
  }

  /**
   * Check if practice session should be triggered
   * @param {string} userId - User ID
   * @param {Object} userPerformance - User performance data
   * @returns {Object} Practice recommendation
   */
  checkPracticeRecommendation(userId, userPerformance) {
    const session = this.getSession(userId);

    // Don't suggest practice if recently done
    const timeSinceLastPractice = session.lastPracticeSession
      ? Date.now() - session.lastPracticeSession
      : Infinity;

    if (timeSinceLastPractice < 10 * 60 * 1000) { // 10 minutes
      return { shouldPractice: false, reason: "recent_practice" };
    }

    const recommendation = getPracticeRecommendation({
      ...userPerformance,
      recentMistakes: session.recentMistakes
    });

    if (recommendation.shouldPractice) {
      session.lastPracticeSession = Date.now();
    }

    return recommendation;
  }

  /**
   * Transition conversation state
   * @param {string} userId - User ID
   * @param {string} newState - New conversation state
   * @returns {Object} Transition result
   */
  transitionState(userId, newState) {
    const session = this.getSession(userId);
    const oldState = session.currentState;

    if (oldState === newState) {
      return { transitioned: false, message: null };
    }

    session.currentState = newState;
    const transitionMessage = generateTransition(oldState, newState);

    return {
      transitioned: true,
      fromState: oldState,
      toState: newState,
      message: transitionMessage
    };
  }

  /**
   * Generate response with personality and flow awareness
   * @param {string} userId - User ID
   * @param {string} responseType - Type of response
   * @param {Object} context - Response context
   * @returns {Object} Enhanced response
   */
  generateFlowAwareResponse(userId, responseType, context = {}) {
    const session = this.getSession(userId);

    // Check for flow management needs
    const breakCheck = this.checkBreakSuggestion(userId);
    const practiceCheck = this.checkPracticeRecommendation(userId, context.userPerformance || {});

    // Generate personality-consistent response
    const personalityResponse = generatePersonalityResponse(
      context,
      responseType,
      context.userProgress || {}
    );

    // Add flow management suggestions
    let flowSuggestions = [];

    if (breakCheck.shouldSuggest) {
      flowSuggestions.push({
        type: "break",
        message: breakCheck.suggestion,
        priority: "medium"
      });
    }

    if (practiceCheck.shouldPractice) {
      flowSuggestions.push({
        type: "practice",
        message: practiceCheck.suggestion,
        priority: "high"
      });
    }

    return {
      personalityResponse,
      flowSuggestions,
      currentState: session.currentState,
      metrics: session.conversationMetrics
    };
  }

  /**
   * End conversation session
   * @param {string} userId - User ID
   * @returns {Object} Session summary
   */
  endSession(userId) {
    const session = this.getSession(userId);
    const summary = {
      duration: Date.now() - session.startTime,
      messageCount: session.messageCount,
      mistakeCount: session.mistakeCount,
      finalMetrics: session.conversationMetrics,
      recentMistakes: session.recentMistakes
    };

    this.sessions.delete(userId);
    return summary;
  }

  /**
   * Get session status
   * @param {string} userId - User ID
   * @returns {Object} Current session status
   */
  getSessionStatus(userId) {
    const session = this.getSession(userId);
    return {
      currentState: session.currentState,
      duration: Date.now() - session.startTime,
      messageCount: session.messageCount,
      metrics: session.conversationMetrics
    };
  }
}

// Singleton instance
export const conversationFlowManager = new ConversationFlowManager();

/**
 * Check if response is too long or overwhelming for interactive conversation
 * @param {string} response - AI response to check
 * @returns {Object} Analysis of response length and suggestions
 */
export const analyzeResponsePacing = (response) => {
  const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const koreanPhrases = (response.match(/[가-힣]+/g) || []).length;
  const hasMultipleConcepts = koreanPhrases > 1;
  const tooLong = sentences.length > 5; // Increased from 2 to 5 sentences to allow longer responses

  return {
    sentenceCount: sentences.length,
    koreanPhraseCount: koreanPhrases,
    tooLong,
    hasMultipleConcepts,
    suggestions: {
      breakIntoSteps: tooLong || hasMultipleConcepts,
      addInteractivePrompt: !response.includes('?') && sentences.length > 3, // Increased threshold
      simplifyLanguage: koreanPhrases > 4 // Increased from 2 to 4 Korean phrases
    }
  };
};

/**
 * Middleware function to add flow management to AI responses
 * @param {string} userId - User ID
 * @param {string} aiResponse - Original AI response
 * @param {Object} context - Response context
 * @returns {string} Enhanced response with flow management
 */
export const enhanceResponseWithFlow = (userId, aiResponse, context = {}) => {
  const flowData = conversationFlowManager.generateFlowAwareResponse(
    userId,
    context.responseType || "acknowledgment",
    context
  );

  // Analyze response pacing
  const pacingAnalysis = analyzeResponsePacing(aiResponse);

  let enhancedResponse = aiResponse;

  // Add pacing guidance if response is too overwhelming
  if (pacingAnalysis.tooLong || pacingAnalysis.hasMultipleConcepts) {
    console.log(`⚠️ Response may be overwhelming: ${pacingAnalysis.sentenceCount} sentences, ${pacingAnalysis.koreanPhraseCount} Korean phrases`);

    // Add a note to encourage shorter responses in future
    conversationFlowManager.updateMetrics(userId, {
      responseComplexity: {
        sentences: pacingAnalysis.sentenceCount,
        koreanPhrases: pacingAnalysis.koreanPhraseCount,
        needsSimplification: true
      }
    });
  }

  // Add flow suggestions if any
  if (flowData.flowSuggestions.length > 0) {
    const highPrioritySuggestions = flowData.flowSuggestions
      .filter(s => s.priority === "high")
      .map(s => s.message);

    if (highPrioritySuggestions.length > 0) {
      enhancedResponse += "\n\n" + highPrioritySuggestions[0];
    }
  }

  return enhancedResponse;
};

export default {
  ConversationFlowManager,
  conversationFlowManager,
  enhanceResponseWithFlow
};
