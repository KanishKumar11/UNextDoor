/**
 * Production Monitoring Service
 * Comprehensive monitoring, error tracking, and performance optimization
 */

import { responseCacheManager } from "./responseCacheService.js";
import { conversationAnalytics } from "./conversationAnalyticsService.js";
import { webrtcSessionPersistence } from "./webrtcSessionPersistence.js";

/**
 * System Monitoring Manager
 * Tracks system health, performance metrics, and error rates
 */
class SystemMonitoringManager {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        averageResponseTime: 0,
        responseTimes: []
      },
      ai: {
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        cacheHitRate: 0,
        averageTokens: 0,
        costEstimate: 0
      },
      webrtc: {
        activeSessions: 0,
        totalSessions: 0,
        averageSessionDuration: 0,
        connectionFailures: 0
      },
      database: {
        connections: 0,
        queries: 0,
        slowQueries: 0,
        errors: 0
      },
      memory: {
        usage: 0,
        heapUsed: 0,
        heapTotal: 0
      },
      errors: [],
      alerts: []
    };

    this.thresholds = {
      responseTime: 5000, // 5 seconds
      errorRate: 0.05, // 5%
      memoryUsage: 0.85, // 85%
      cacheHitRate: 0.7, // 70%
      sessionFailureRate: 0.1 // 10%
    };

    this.startTime = Date.now();
    this.lastHealthCheck = Date.now();

    // Start monitoring intervals
    this.startMonitoring();
  }

  /**
   * Start monitoring intervals
   */
  startMonitoring() {
    // Health check every 30 seconds
    setInterval(() => {
      this.performHealthCheck();
    }, 30 * 1000);

    // Memory monitoring every 60 seconds
    setInterval(() => {
      this.updateMemoryMetrics();
    }, 60 * 1000);

    // Cleanup old metrics every 5 minutes
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 5 * 60 * 1000);

    console.log("📊 System monitoring started");
  }

  /**
   * Track API request
   * @param {Object} requestData - Request data
   */
  trackRequest(requestData) {
    const { success, responseTime, endpoint, error } = requestData;

    this.metrics.requests.total++;

    if (success) {
      this.metrics.requests.successful++;
    } else {
      this.metrics.requests.failed++;
      this.trackError({
        type: 'api_request',
        endpoint,
        error: error?.message || 'Unknown error',
        timestamp: Date.now()
      });
    }

    if (responseTime) {
      this.metrics.requests.responseTimes.push(responseTime);

      // Keep only last 100 response times
      if (this.metrics.requests.responseTimes.length > 100) {
        this.metrics.requests.responseTimes = this.metrics.requests.responseTimes.slice(-100);
      }

      // Update average
      this.metrics.requests.averageResponseTime =
        this.metrics.requests.responseTimes.reduce((a, b) => a + b, 0) /
        this.metrics.requests.responseTimes.length;
    }

    // Check for slow requests
    if (responseTime > this.thresholds.responseTime) {
      this.createAlert({
        type: 'slow_request',
        message: `Slow request detected: ${endpoint} took ${responseTime}ms`,
        severity: 'warning',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Track AI model usage
   * @param {Object} aiData - AI usage data
   */
  trackAIUsage(aiData) {
    const { success, tokens, model, cost, fromCache } = aiData;

    this.metrics.ai.totalCalls++;

    if (success) {
      this.metrics.ai.successfulCalls++;
    } else {
      this.metrics.ai.failedCalls++;
    }

    if (tokens) {
      this.metrics.ai.averageTokens =
        (this.metrics.ai.averageTokens * (this.metrics.ai.totalCalls - 1) + tokens) /
        this.metrics.ai.totalCalls;
    }

    if (cost) {
      this.metrics.ai.costEstimate += cost;
    }

    // Update cache hit rate
    if (fromCache !== undefined) {
      const totalRequests = this.metrics.ai.totalCalls;
      const cacheHits = fromCache ? 1 : 0;
      this.metrics.ai.cacheHitRate =
        (this.metrics.ai.cacheHitRate * (totalRequests - 1) + cacheHits) / totalRequests;
    }
  }

  /**
   * Track WebRTC session
   * @param {Object} sessionData - Session data
   */
  trackWebRTCSession(sessionData) {
    const { event, duration, success } = sessionData;

    switch (event) {
      case 'session_started':
        this.metrics.webrtc.activeSessions++;
        this.metrics.webrtc.totalSessions++;
        break;

      case 'session_ended':
        this.metrics.webrtc.activeSessions = Math.max(0, this.metrics.webrtc.activeSessions - 1);

        if (duration) {
          this.metrics.webrtc.averageSessionDuration =
            (this.metrics.webrtc.averageSessionDuration * (this.metrics.webrtc.totalSessions - 1) + duration) /
            this.metrics.webrtc.totalSessions;
        }
        break;

      case 'connection_failed':
        this.metrics.webrtc.connectionFailures++;
        this.trackError({
          type: 'webrtc_connection',
          error: 'Connection failed',
          timestamp: Date.now()
        });
        break;
    }
  }

  /**
   * Track database operation
   * @param {Object} dbData - Database operation data
   */
  trackDatabaseOperation(dbData) {
    const { type, duration, success, error } = dbData;

    this.metrics.database.queries++;

    if (!success) {
      this.metrics.database.errors++;
      this.trackError({
        type: 'database',
        operation: type,
        error: error?.message || 'Database error',
        timestamp: Date.now()
      });
    }

    // Track slow queries (>1 second)
    if (duration > 1000) {
      this.metrics.database.slowQueries++;
      this.createAlert({
        type: 'slow_query',
        message: `Slow database query: ${type} took ${duration}ms`,
        severity: 'warning',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Track error
   * @param {Object} errorData - Error data
   */
  trackError(errorData) {
    this.metrics.errors.push({
      ...errorData,
      id: Date.now() + Math.random()
    });

    // Keep only last 50 errors
    if (this.metrics.errors.length > 50) {
      this.metrics.errors = this.metrics.errors.slice(-50);
    }

    // Check error rate
    const recentErrors = this.metrics.errors.filter(
      error => Date.now() - error.timestamp < 5 * 60 * 1000 // Last 5 minutes
    );

    const errorRate = recentErrors.length / Math.max(this.metrics.requests.total, 1);

    if (errorRate > this.thresholds.errorRate) {
      this.createAlert({
        type: 'high_error_rate',
        message: `High error rate detected: ${(errorRate * 100).toFixed(1)}%`,
        severity: 'critical',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Create alert
   * @param {Object} alertData - Alert data
   */
  createAlert(alertData) {
    this.metrics.alerts.push({
      ...alertData,
      id: Date.now() + Math.random()
    });

    // Keep only last 20 alerts
    if (this.metrics.alerts.length > 20) {
      this.metrics.alerts = this.metrics.alerts.slice(-20);
    }

    // Log critical alerts
    if (alertData.severity === 'critical') {
      console.error(`🚨 CRITICAL ALERT: ${alertData.message}`);
    } else {
      console.warn(`⚠️ WARNING: ${alertData.message}`);
    }
  }

  /**
   * Update memory metrics
   */
  updateMemoryMetrics() {
    const memUsage = process.memoryUsage();

    this.metrics.memory = {
      usage: memUsage.rss / 1024 / 1024, // MB
      heapUsed: memUsage.heapUsed / 1024 / 1024, // MB
      heapTotal: memUsage.heapTotal / 1024 / 1024 // MB
    };

    // Check memory usage
    const memoryUsagePercent = memUsage.heapUsed / memUsage.heapTotal;

    if (memoryUsagePercent > this.thresholds.memoryUsage) {
      this.createAlert({
        type: 'high_memory_usage',
        message: `High memory usage: ${(memoryUsagePercent * 100).toFixed(1)}%`,
        severity: 'warning',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck() {
    const healthData = {
      timestamp: Date.now(),
      uptime: Date.now() - this.startTime,
      status: 'healthy',
      services: {},
      metrics: this.getHealthMetrics()
    };

    try {
      // Check cache service
      const cacheStats = await responseCacheManager.getStats();
      healthData.services.cache = {
        status: cacheStats.connected ? 'healthy' : 'degraded',
        type: cacheStats.type,
        connected: cacheStats.connected
      };

      // Check analytics service
      const systemAnalytics = conversationAnalytics.getSystemAnalytics();
      healthData.services.analytics = {
        status: 'healthy',
        activeSessions: systemAnalytics.activeSessions
      };

      // Check WebRTC sessions
      const activeSessions = webrtcSessionPersistence.getActiveSessions();
      healthData.services.webrtc = {
        status: 'healthy',
        activeSessions: activeSessions.length
      };

      // Overall health assessment
      const unhealthyServices = Object.values(healthData.services)
        .filter(service => service.status !== 'healthy').length;

      if (unhealthyServices > 0) {
        healthData.status = unhealthyServices > 1 ? 'critical' : 'degraded';
      }

    } catch (error) {
      healthData.status = 'critical';
      healthData.error = error.message;

      this.trackError({
        type: 'health_check',
        error: error.message,
        timestamp: Date.now()
      });
    }

    this.lastHealthCheck = Date.now();

    // Log health status
    if (healthData.status !== 'healthy') {
      console.warn(`🏥 Health check: ${healthData.status.toUpperCase()}`);
    }

    return healthData;
  }

  /**
   * Get health metrics summary
   * @returns {Object} Health metrics
   */
  getHealthMetrics() {
    const errorRate = this.metrics.requests.total > 0
      ? this.metrics.requests.failed / this.metrics.requests.total
      : 0;

    const aiSuccessRate = this.metrics.ai.totalCalls > 0
      ? this.metrics.ai.successfulCalls / this.metrics.ai.totalCalls
      : 1;

    return {
      requests: {
        total: this.metrics.requests.total,
        errorRate: Math.round(errorRate * 1000) / 10, // Percentage with 1 decimal
        averageResponseTime: Math.round(this.metrics.requests.averageResponseTime)
      },
      ai: {
        totalCalls: this.metrics.ai.totalCalls,
        successRate: Math.round(aiSuccessRate * 1000) / 10,
        cacheHitRate: Math.round(this.metrics.ai.cacheHitRate * 1000) / 10,
        estimatedCost: Math.round(this.metrics.ai.costEstimate * 100) / 100
      },
      webrtc: {
        activeSessions: this.metrics.webrtc.activeSessions,
        totalSessions: this.metrics.webrtc.totalSessions,
        averageDuration: Math.round(this.metrics.webrtc.averageSessionDuration / 1000) // seconds
      },
      memory: {
        usage: Math.round(this.metrics.memory.usage * 10) / 10,
        heapUsed: Math.round(this.metrics.memory.heapUsed * 10) / 10
      },
      alerts: this.metrics.alerts.length,
      recentErrors: this.metrics.errors.filter(
        error => Date.now() - error.timestamp < 5 * 60 * 1000
      ).length
    };
  }

  /**
   * Get detailed system status
   * @returns {Object} Detailed status
   */
  getDetailedStatus() {
    return {
      ...this.metrics,
      uptime: Date.now() - this.startTime,
      lastHealthCheck: this.lastHealthCheck,
      thresholds: this.thresholds
    };
  }

  /**
   * Clean up old metrics
   */
  cleanupOldMetrics() {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

    // Clean old errors
    this.metrics.errors = this.metrics.errors.filter(
      error => error.timestamp > fiveMinutesAgo
    );

    // Clean old alerts
    this.metrics.alerts = this.metrics.alerts.filter(
      alert => alert.timestamp > fiveMinutesAgo
    );

    console.log("🧹 Cleaned up old monitoring metrics");
  }
}

// Singleton instance
export const systemMonitoring = new SystemMonitoringManager();

/**
 * Express middleware for request monitoring
 */
export const requestMonitoringMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // Override res.end to capture response
  const originalEnd = res.end;
  res.end = function (...args) {
    const responseTime = Date.now() - startTime;

    systemMonitoring.trackRequest({
      success: res.statusCode < 400,
      responseTime,
      endpoint: req.path,
      method: req.method,
      statusCode: res.statusCode
    });

    originalEnd.apply(this, args);
  };

  next();
};

/**
 * Enhanced error handler with monitoring
 * @param {Error} error - Error object
 * @param {Object} context - Error context
 */
export const handleErrorWithMonitoring = (error, context = {}) => {
  systemMonitoring.trackError({
    type: context.type || 'application',
    error: error.message,
    stack: error.stack,
    context,
    timestamp: Date.now()
  });

  console.error(`💥 Error tracked: ${error.message}`, context);
};

/**
 * Performance monitoring decorator
 * @param {Function} fn - Function to monitor
 * @param {string} name - Function name for monitoring
 * @returns {Function} Monitored function
 */
export const withPerformanceMonitoring = (fn, name) => {
  return async function (...args) {
    const startTime = Date.now();

    try {
      const result = await fn.apply(this, args);
      const duration = Date.now() - startTime;

      systemMonitoring.trackRequest({
        success: true,
        responseTime: duration,
        endpoint: name,
        method: 'FUNCTION'
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      systemMonitoring.trackRequest({
        success: false,
        responseTime: duration,
        endpoint: name,
        method: 'FUNCTION',
        error
      });

      throw error;
    }
  };
};

export default {
  SystemMonitoringManager,
  systemMonitoring,
  requestMonitoringMiddleware,
  handleErrorWithMonitoring,
  withPerformanceMonitoring
};
