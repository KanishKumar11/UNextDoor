/**
 * Response Cache Service
 * Implements intelligent caching for AI responses to reduce costs and improve performance
 */

import crypto from "crypto";
import { createClient } from "redis";
import config from "../config/index.js";

/**
 * Response Cache Manager
 * Handles caching of AI responses with intelligent cache key generation
 */
class ResponseCacheManager {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.fallbackCache = new Map(); // In-memory fallback
    this.maxFallbackSize = 1000;
  }

  /**
   * Initialize Redis connection
   */
  async initialize() {
    try {
      if (config.redis?.url) {
        this.client = createClient({
          url: config.redis.url,
          retry_strategy: (options) => {
            if (options.error && options.error.code === 'ECONNREFUSED') {
              console.log('Redis connection refused, using fallback cache');
              return undefined; // Don't retry
            }
            return Math.min(options.attempt * 100, 3000);
          }
        });

        this.client.on('error', (err) => {
          console.warn('Redis client error:', err.message);
          this.isConnected = false;
        });

        this.client.on('connect', () => {
          console.log('✅ Redis cache connected');
          this.isConnected = true;
        });

        await this.client.connect();
      } else {
        console.log('⚠️ No Redis URL configured, using in-memory cache');
      }
    } catch (error) {
      console.warn('Redis initialization failed, using fallback cache:', error.message);
      this.isConnected = false;
    }
  }

  /**
   * Generate cache key for AI response
   * @param {Object} params - Cache key parameters
   * @returns {string} Cache key
   */
  generateCacheKey(params) {
    const {
      useCase,
      userLevel,
      scenarioId,
      promptHash,
      modelUsed,
      messageContext = ""
    } = params;

    // Create a deterministic hash of the context
    const contextString = `${useCase}:${userLevel}:${scenarioId || 'general'}:${promptHash}:${modelUsed}:${messageContext}`;
    const hash = crypto.createHash('sha256').update(contextString).digest('hex').substring(0, 16);
    
    return `ai_response:${hash}`;
  }

  /**
   * Generate hash for prompt content
   * @param {string} prompt - Prompt content
   * @returns {string} Prompt hash
   */
  generatePromptHash(prompt) {
    // Remove dynamic elements that shouldn't affect caching
    const normalizedPrompt = prompt
      .replace(/\d{4}-\d{2}-\d{2}/g, 'DATE') // Remove dates
      .replace(/\d{2}:\d{2}/g, 'TIME') // Remove times
      .replace(/user \w+/gi, 'user ID') // Remove user IDs
      .trim();
    
    return crypto.createHash('md5').update(normalizedPrompt).digest('hex').substring(0, 12);
  }

  /**
   * Check if response should be cached
   * @param {string} useCase - Use case type
   * @param {Object} options - Additional options
   * @returns {boolean} Whether to cache
   */
  shouldCache(useCase, options = {}) {
    // Don't cache personalized or real-time responses
    const noCacheUseCases = [
      'realtime_conversation',
      'personalized_feedback',
      'user_specific_analysis'
    ];

    if (noCacheUseCases.includes(useCase)) {
      return false;
    }

    // Don't cache if response contains user-specific data
    if (options.containsUserData) {
      return false;
    }

    // Cache educational content, grammar analysis, etc.
    const cacheableUseCases = [
      'educational_chat',
      'grammar_analysis',
      'pronunciation_feedback',
      'vocabulary_analysis',
      'simple_response',
      'greeting'
    ];

    return cacheableUseCases.includes(useCase);
  }

  /**
   * Get cached response
   * @param {string} cacheKey - Cache key
   * @returns {Promise<Object|null>} Cached response or null
   */
  async get(cacheKey) {
    try {
      if (this.isConnected && this.client) {
        const cached = await this.client.get(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          console.log(`🎯 Cache HIT: ${cacheKey}`);
          return {
            ...parsed,
            fromCache: true,
            cacheHit: true
          };
        }
      } else {
        // Fallback to in-memory cache
        const cached = this.fallbackCache.get(cacheKey);
        if (cached && cached.expiresAt > Date.now()) {
          console.log(`🎯 Fallback cache HIT: ${cacheKey}`);
          return {
            ...cached.data,
            fromCache: true,
            cacheHit: true
          };
        }
      }

      console.log(`❌ Cache MISS: ${cacheKey}`);
      return null;
    } catch (error) {
      console.warn('Cache get error:', error.message);
      return null;
    }
  }

  /**
   * Set cached response
   * @param {string} cacheKey - Cache key
   * @param {Object} response - Response to cache
   * @param {number} ttl - Time to live in seconds
   */
  async set(cacheKey, response, ttl = 3600) {
    try {
      const cacheData = {
        response: response.completion || response,
        modelUsed: response.modelUsed,
        useCase: response.useCase,
        timestamp: Date.now(),
        ttl
      };

      if (this.isConnected && this.client) {
        await this.client.setEx(cacheKey, ttl, JSON.stringify(cacheData));
        console.log(`💾 Cached response: ${cacheKey} (TTL: ${ttl}s)`);
      } else {
        // Fallback to in-memory cache
        this.fallbackCache.set(cacheKey, {
          data: cacheData,
          expiresAt: Date.now() + (ttl * 1000)
        });

        // Limit fallback cache size
        if (this.fallbackCache.size > this.maxFallbackSize) {
          const firstKey = this.fallbackCache.keys().next().value;
          this.fallbackCache.delete(firstKey);
        }

        console.log(`💾 Fallback cached: ${cacheKey} (TTL: ${ttl}s)`);
      }
    } catch (error) {
      console.warn('Cache set error:', error.message);
    }
  }

  /**
   * Get cache statistics
   * @returns {Promise<Object>} Cache statistics
   */
  async getStats() {
    try {
      if (this.isConnected && this.client) {
        const info = await this.client.info('memory');
        const keyCount = await this.client.dbSize();
        
        return {
          type: 'redis',
          connected: true,
          keyCount,
          memoryInfo: info
        };
      } else {
        return {
          type: 'fallback',
          connected: false,
          keyCount: this.fallbackCache.size,
          maxSize: this.maxFallbackSize
        };
      }
    } catch (error) {
      return {
        type: 'error',
        connected: false,
        error: error.message
      };
    }
  }

  /**
   * Clear cache (for testing or maintenance)
   * @param {string} pattern - Pattern to match keys (optional)
   */
  async clear(pattern = null) {
    try {
      if (this.isConnected && this.client) {
        if (pattern) {
          const keys = await this.client.keys(pattern);
          if (keys.length > 0) {
            await this.client.del(keys);
            console.log(`🗑️ Cleared ${keys.length} cached responses matching: ${pattern}`);
          }
        } else {
          await this.client.flushDb();
          console.log('🗑️ Cleared all cached responses');
        }
      } else {
        if (pattern) {
          for (const key of this.fallbackCache.keys()) {
            if (key.includes(pattern)) {
              this.fallbackCache.delete(key);
            }
          }
        } else {
          this.fallbackCache.clear();
        }
        console.log('🗑️ Cleared fallback cache');
      }
    } catch (error) {
      console.warn('Cache clear error:', error.message);
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect() {
    try {
      if (this.client) {
        await this.client.disconnect();
        console.log('Redis cache disconnected');
      }
    } catch (error) {
      console.warn('Redis disconnect error:', error.message);
    }
  }
}

// Singleton instance
export const responseCacheManager = new ResponseCacheManager();

/**
 * Middleware function to add caching to AI model service
 * @param {Function} originalFunction - Original AI completion function
 * @returns {Function} Wrapped function with caching
 */
export function withResponseCache(originalFunction) {
  return async function(openaiClient, useCase, messages, user = null, options = {}) {
    // Check if we should cache this request
    if (!responseCacheManager.shouldCache(useCase, options)) {
      return await originalFunction(openaiClient, useCase, messages, user, options);
    }

    // Generate cache key
    const promptContent = messages.map(m => m.content).join('\n');
    const promptHash = responseCacheManager.generatePromptHash(promptContent);
    const userLevel = user?.preferences?.languageLevel || 'beginner';
    
    const cacheKey = responseCacheManager.generateCacheKey({
      useCase,
      userLevel,
      scenarioId: options.scenarioId,
      promptHash,
      modelUsed: options.model || 'gpt-4o-mini',
      messageContext: promptContent.substring(0, 100) // First 100 chars for context
    });

    // Try to get from cache
    const cached = await responseCacheManager.get(cacheKey);
    if (cached) {
      return {
        success: true,
        completion: cached.response,
        modelUsed: cached.modelUsed,
        useCase: cached.useCase,
        userTier: user?.subscriptionTier || 'free',
        fromCache: true,
        cacheHit: true
      };
    }

    // Execute original function
    const result = await originalFunction(openaiClient, useCase, messages, user, options);

    // Cache the result if successful
    if (result.success && !result.fallbackUsed) {
      const ttl = getCacheTTL(useCase);
      await responseCacheManager.set(cacheKey, result, ttl);
    }

    return {
      ...result,
      fromCache: false,
      cacheHit: false
    };
  };
}

/**
 * Get cache TTL based on use case
 * @param {string} useCase - Use case type
 * @returns {number} TTL in seconds
 */
function getCacheTTL(useCase) {
  const ttlMap = {
    'educational_chat': 3600, // 1 hour
    'grammar_analysis': 7200, // 2 hours
    'pronunciation_feedback': 3600, // 1 hour
    'vocabulary_analysis': 7200, // 2 hours
    'simple_response': 1800, // 30 minutes
    'greeting': 1800 // 30 minutes
  };

  return ttlMap[useCase] || 3600; // Default 1 hour
}

export default {
  ResponseCacheManager,
  responseCacheManager,
  withResponseCache,
  getCacheTTL
};
