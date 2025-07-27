/**
 * AI Model Selection Service
 * Centralized service for selecting the optimal AI model based on use case and user tier
 */

import config from "../config/index.js";
import { responseCacheManager, withResponseCache } from "./responseCacheService.js";
import { systemMonitoring } from "./monitoringService.js";

/**
 * Available AI models with their characteristics
 */
export const AI_MODELS = {
  // Real-time conversations (no choice - OpenAI requirement)
  REALTIME: "gpt-4o-realtime-preview-2025-06-03",

  // Educational conversations (primary use case)
  EDUCATION: "gpt-4o-mini", // 60x cheaper, 3x faster, 90% quality

  // Complex analysis and feedback
  ANALYSIS: "gpt-4o", // Premium model for detailed analysis

  // Simple responses and confirmations
  SIMPLE: "gpt-4o-mini",

  // Text-to-speech
  TTS: "tts-1-hd",
  TTS_FAST: "tts-1",

  // Speech-to-text
  STT: "whisper-1"
};

/**
 * Use case categories for model selection
 */
export const USE_CASES = {
  REALTIME_CONVERSATION: "realtime_conversation",
  EDUCATIONAL_CHAT: "educational_chat",
  GRAMMAR_ANALYSIS: "grammar_analysis",
  PRONUNCIATION_FEEDBACK: "pronunciation_feedback",
  CONVERSATION_FEEDBACK: "conversation_feedback",
  SIMPLE_RESPONSE: "simple_response",
  GREETING: "greeting",
  TEXT_TO_SPEECH: "text_to_speech",
  SPEECH_TO_TEXT: "speech_to_text"
};

/**
 * User subscription tiers
 */
export const USER_TIERS = {
  FREE: "free",
  PREMIUM: "premium",
  ENTERPRISE: "enterprise"
};

/**
 * Model selection strategy based on use case and user tier
 * @param {string} useCase - The use case from USE_CASES
 * @param {string} userTier - User's subscription tier
 * @param {Object} options - Additional options
 * @returns {string} Selected model name
 */
export const selectModel = (useCase, userTier = USER_TIERS.FREE, options = {}) => {
  // Real-time conversations must use the realtime model
  if (useCase === USE_CASES.REALTIME_CONVERSATION) {
    return AI_MODELS.REALTIME;
  }

  // Text-to-speech model selection
  if (useCase === USE_CASES.TEXT_TO_SPEECH) {
    return userTier === USER_TIERS.PREMIUM ? AI_MODELS.TTS : AI_MODELS.TTS_FAST;
  }

  // Speech-to-text (only one option)
  if (useCase === USE_CASES.SPEECH_TO_TEXT) {
    return AI_MODELS.STT;
  }

  // Complex analysis cases - use premium model for better quality
  const complexUseCases = [
    USE_CASES.GRAMMAR_ANALYSIS,
    USE_CASES.PRONUNCIATION_FEEDBACK,
    USE_CASES.CONVERSATION_FEEDBACK
  ];

  if (complexUseCases.includes(useCase)) {
    // Premium users always get the best model for analysis
    if (userTier === USER_TIERS.PREMIUM || userTier === USER_TIERS.ENTERPRISE) {
      return AI_MODELS.ANALYSIS;
    }
    // Free users get the education model for analysis (still good quality)
    return AI_MODELS.EDUCATION;
  }

  // Simple responses - always use the fast model
  if (useCase === USE_CASES.SIMPLE_RESPONSE || useCase === USE_CASES.GREETING) {
    return AI_MODELS.SIMPLE;
  }

  // Educational conversations - primary use case
  if (useCase === USE_CASES.EDUCATIONAL_CHAT) {
    return AI_MODELS.EDUCATION;
  }

  // Default to education model for unknown use cases
  console.warn(`Unknown use case: ${useCase}, defaulting to education model`);
  return AI_MODELS.EDUCATION;
};

/**
 * Get model configuration including temperature and max tokens
 * @param {string} model - Model name
 * @param {string} useCase - Use case
 * @returns {Object} Model configuration
 */
export const getModelConfig = (model, useCase) => {
  const baseConfig = {
    model,
    temperature: 0.7,
    max_tokens: 500
  };

  // Adjust configuration based on use case
  switch (useCase) {
    case USE_CASES.GRAMMAR_ANALYSIS:
    case USE_CASES.PRONUNCIATION_FEEDBACK:
      return {
        ...baseConfig,
        temperature: 0.3, // More deterministic for analysis
        max_tokens: 300
      };

    case USE_CASES.SIMPLE_RESPONSE:
    case USE_CASES.GREETING:
      return {
        ...baseConfig,
        temperature: 0.5,
        max_tokens: 150
      };

    case USE_CASES.EDUCATIONAL_CHAT:
      return {
        ...baseConfig,
        temperature: 0.7,
        max_tokens: 400
      };

    case USE_CASES.CONVERSATION_FEEDBACK:
      return {
        ...baseConfig,
        temperature: 0.4,
        max_tokens: 600
      };

    default:
      return baseConfig;
  }
};

/**
 * Get user's subscription tier from user object
 * @param {Object} user - User object
 * @returns {string} User tier
 */
export const getUserTier = (user) => {
  if (!user) return USER_TIERS.FREE;

  const subscriptionTier = user.subscriptionTier?.toLowerCase();

  if (subscriptionTier === 'premium' || subscriptionTier === 'pro') {
    return USER_TIERS.PREMIUM;
  }

  if (subscriptionTier === 'enterprise') {
    return USER_TIERS.ENTERPRISE;
  }

  return USER_TIERS.FREE;
};

/**
 * Create OpenAI completion with optimal model selection (without caching)
 * @param {Object} openaiClient - OpenAI client instance
 * @param {string} useCase - Use case for model selection
 * @param {Array} messages - Messages array
 * @param {Object} user - User object for tier detection
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} OpenAI completion response
 */
export const createOptimizedCompletionBase = async (
  openaiClient,
  useCase,
  messages,
  user = null,
  options = {}
) => {
  const userTier = getUserTier(user);
  const selectedModel = selectModel(useCase, userTier, options);
  const modelConfig = getModelConfig(selectedModel, useCase);

  console.log(`🤖 Using model: ${selectedModel} for use case: ${useCase} (user tier: ${userTier})`);

  try {
    const completion = await openaiClient.chat.completions.create({
      ...modelConfig,
      messages,
      ...options // Allow overriding default config
    });

    // Track AI usage for monitoring
    systemMonitoring.trackAIUsage({
      success: true,
      tokens: completion.usage?.total_tokens || 0,
      model: selectedModel,
      cost: estimateTokenCost(completion.usage?.total_tokens || 0, selectedModel),
      fromCache: false
    });

    return {
      success: true,
      completion,
      modelUsed: selectedModel,
      useCase,
      userTier
    };
  } catch (error) {
    console.error(`Error with model ${selectedModel}:`, error);

    // Track AI failure for monitoring
    systemMonitoring.trackAIUsage({
      success: false,
      model: selectedModel,
      fromCache: false
    });

    // Fallback to education model if premium model fails
    if (selectedModel === AI_MODELS.ANALYSIS) {
      console.log("Falling back to education model...");
      const fallbackConfig = getModelConfig(AI_MODELS.EDUCATION, useCase);

      try {
        const fallbackCompletion = await openaiClient.chat.completions.create({
          ...fallbackConfig,
          messages,
          ...options
        });

        // Track successful fallback
        systemMonitoring.trackAIUsage({
          success: true,
          tokens: fallbackCompletion.usage?.total_tokens || 0,
          model: AI_MODELS.EDUCATION,
          cost: estimateTokenCost(fallbackCompletion.usage?.total_tokens || 0, AI_MODELS.EDUCATION),
          fromCache: false
        });

        return {
          success: true,
          completion: fallbackCompletion,
          modelUsed: AI_MODELS.EDUCATION,
          useCase,
          userTier,
          fallbackUsed: true
        };
      } catch (fallbackError) {
        // Track fallback failure
        systemMonitoring.trackAIUsage({
          success: false,
          model: AI_MODELS.EDUCATION,
          fromCache: false
        });
        throw fallbackError;
      }
    }

    throw error;
  }
};

/**
 * Estimate token cost based on model and token count
 * @param {number} tokens - Number of tokens
 * @param {string} model - Model name
 * @returns {number} Estimated cost in USD
 */
function estimateTokenCost(tokens, model) {
  // Rough cost estimates per 1K tokens (as of 2024)
  const costPer1K = {
    [AI_MODELS.SIMPLE]: 0.0005,     // gpt-4o-mini
    [AI_MODELS.EDUCATION]: 0.0025,  // gpt-4o
    [AI_MODELS.ANALYSIS]: 0.0025,   // gpt-4o
    [AI_MODELS.REALTIME]: 0.006     // gpt-4o-realtime
  };

  const rate = costPer1K[model] || 0.0025; // Default to gpt-4o rate
  return (tokens / 1000) * rate;
}

/**
 * Create OpenAI completion with optimal model selection and caching
 * @param {Object} openaiClient - OpenAI client instance
 * @param {string} useCase - Use case for model selection
 * @param {Array} messages - Messages array
 * @param {Object} user - User object for tier detection
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} OpenAI completion response
 */
export const createOptimizedCompletion = withResponseCache(createOptimizedCompletionBase);

/**
 * Log model usage for analytics
 * @param {string} userId - User ID
 * @param {string} model - Model used
 * @param {string} useCase - Use case
 * @param {number} tokensUsed - Tokens consumed
 */
export const logModelUsage = (userId, model, useCase, tokensUsed = 0) => {
  console.log(`📊 Model usage: ${model} | Use case: ${useCase} | User: ${userId} | Tokens: ${tokensUsed}`);

  // TODO: Implement proper analytics logging
  // This could be sent to your analytics service
};

export default {
  AI_MODELS,
  USE_CASES,
  USER_TIERS,
  selectModel,
  getModelConfig,
  getUserTier,
  createOptimizedCompletion,
  logModelUsage
};
