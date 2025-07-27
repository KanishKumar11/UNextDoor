/**
 * Monitoring Routes
 * Provides endpoints for system monitoring, health checks, and performance metrics
 */

import express from "express";
import { systemMonitoring } from "../services/monitoringService.js";
import { authenticateToken } from "../middleware/auth.js";
import { sendSuccess, sendError } from "../utils/responseUtils.js";

const router = express.Router();

/**
 * Health check endpoint
 * GET /api/v1/monitoring/health
 */
router.get("/health", async (req, res) => {
  try {
    const healthData = await systemMonitoring.performHealthCheck();
    
    const statusCode = healthData.status === 'healthy' ? 200 : 
                      healthData.status === 'degraded' ? 200 : 503;
    
    return res.status(statusCode).json({
      status: healthData.status,
      timestamp: healthData.timestamp,
      uptime: healthData.uptime,
      services: healthData.services,
      metrics: healthData.metrics
    });
  } catch (error) {
    console.error("Health check error:", error);
    return res.status(503).json({
      status: 'critical',
      error: 'Health check failed',
      timestamp: Date.now()
    });
  }
});

/**
 * Detailed system metrics (admin only)
 * GET /api/v1/monitoring/metrics
 */
router.get("/metrics", authenticateToken, async (req, res) => {
  try {
    // TODO: Add admin role check
    const detailedStatus = systemMonitoring.getDetailedStatus();
    
    return sendSuccess(res, 200, "System metrics retrieved", {
      ...detailedStatus,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error("Error getting system metrics:", error);
    return sendError(res, 500, "Failed to get system metrics");
  }
});

/**
 * Performance summary
 * GET /api/v1/monitoring/performance
 */
router.get("/performance", authenticateToken, async (req, res) => {
  try {
    const healthMetrics = systemMonitoring.getHealthMetrics();
    
    return sendSuccess(res, 200, "Performance metrics retrieved", {
      performance: healthMetrics,
      timestamp: Date.now(),
      status: 'healthy' // TODO: Calculate based on thresholds
    });
  } catch (error) {
    console.error("Error getting performance metrics:", error);
    return sendError(res, 500, "Failed to get performance metrics");
  }
});

/**
 * Recent alerts
 * GET /api/v1/monitoring/alerts
 */
router.get("/alerts", authenticateToken, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const detailedStatus = systemMonitoring.getDetailedStatus();
    
    const recentAlerts = detailedStatus.alerts
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, parseInt(limit));
    
    return sendSuccess(res, 200, "Recent alerts retrieved", {
      alerts: recentAlerts,
      totalAlerts: detailedStatus.alerts.length,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error("Error getting alerts:", error);
    return sendError(res, 500, "Failed to get alerts");
  }
});

/**
 * Recent errors
 * GET /api/v1/monitoring/errors
 */
router.get("/errors", authenticateToken, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const detailedStatus = systemMonitoring.getDetailedStatus();
    
    const recentErrors = detailedStatus.errors
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, parseInt(limit));
    
    return sendSuccess(res, 200, "Recent errors retrieved", {
      errors: recentErrors,
      totalErrors: detailedStatus.errors.length,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error("Error getting errors:", error);
    return sendError(res, 500, "Failed to get errors");
  }
});

/**
 * System status dashboard data
 * GET /api/v1/monitoring/dashboard
 */
router.get("/dashboard", authenticateToken, async (req, res) => {
  try {
    const healthData = await systemMonitoring.performHealthCheck();
    const healthMetrics = systemMonitoring.getHealthMetrics();
    const detailedStatus = systemMonitoring.getDetailedStatus();
    
    // Calculate status indicators
    const indicators = {
      overall: healthData.status,
      api: healthMetrics.requests.errorRate < 5 ? 'healthy' : 'warning',
      ai: healthMetrics.ai.successRate > 95 ? 'healthy' : 'warning',
      cache: healthMetrics.ai.cacheHitRate > 70 ? 'healthy' : 'warning',
      memory: healthMetrics.memory.usage < 500 ? 'healthy' : 'warning'
    };
    
    // Recent activity summary
    const recentActivity = {
      requests: healthMetrics.requests.total,
      aiCalls: healthMetrics.ai.totalCalls,
      activeSessions: healthMetrics.webrtc.activeSessions,
      recentErrors: healthMetrics.recentErrors,
      alerts: healthMetrics.alerts
    };
    
    // Performance trends (simplified)
    const trends = {
      responseTime: {
        current: healthMetrics.requests.averageResponseTime,
        trend: 'stable' // TODO: Calculate actual trend
      },
      errorRate: {
        current: healthMetrics.requests.errorRate,
        trend: 'stable'
      },
      cacheHitRate: {
        current: healthMetrics.ai.cacheHitRate,
        trend: 'stable'
      }
    };
    
    return sendSuccess(res, 200, "Dashboard data retrieved", {
      status: healthData.status,
      indicators,
      metrics: healthMetrics,
      recentActivity,
      trends,
      uptime: healthData.uptime,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error("Error getting dashboard data:", error);
    return sendError(res, 500, "Failed to get dashboard data");
  }
});

/**
 * Reset metrics (admin only)
 * POST /api/v1/monitoring/reset
 */
router.post("/reset", authenticateToken, async (req, res) => {
  try {
    // TODO: Add admin role check
    
    // Reset specific metrics or all
    const { type = 'all' } = req.body;
    
    if (type === 'errors') {
      systemMonitoring.metrics.errors = [];
    } else if (type === 'alerts') {
      systemMonitoring.metrics.alerts = [];
    } else if (type === 'all') {
      // Reset counters but keep configuration
      systemMonitoring.metrics.requests = {
        total: 0,
        successful: 0,
        failed: 0,
        averageResponseTime: 0,
        responseTimes: []
      };
      systemMonitoring.metrics.ai = {
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        cacheHitRate: 0,
        averageTokens: 0,
        costEstimate: 0
      };
      systemMonitoring.metrics.errors = [];
      systemMonitoring.metrics.alerts = [];
    }
    
    return sendSuccess(res, 200, `Metrics reset: ${type}`, {
      type,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error("Error resetting metrics:", error);
    return sendError(res, 500, "Failed to reset metrics");
  }
});

/**
 * Update monitoring thresholds (admin only)
 * PUT /api/v1/monitoring/thresholds
 */
router.put("/thresholds", authenticateToken, async (req, res) => {
  try {
    // TODO: Add admin role check
    
    const { thresholds } = req.body;
    
    if (!thresholds || typeof thresholds !== 'object') {
      return sendError(res, 400, "Invalid thresholds data");
    }
    
    // Validate and update thresholds
    const validThresholds = ['responseTime', 'errorRate', 'memoryUsage', 'cacheHitRate', 'sessionFailureRate'];
    const updatedThresholds = {};
    
    for (const [key, value] of Object.entries(thresholds)) {
      if (validThresholds.includes(key) && typeof value === 'number' && value > 0) {
        systemMonitoring.thresholds[key] = value;
        updatedThresholds[key] = value;
      }
    }
    
    return sendSuccess(res, 200, "Thresholds updated", {
      updated: updatedThresholds,
      current: systemMonitoring.thresholds,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error("Error updating thresholds:", error);
    return sendError(res, 500, "Failed to update thresholds");
  }
});

/**
 * Export metrics for external monitoring
 * GET /api/v1/monitoring/export
 */
router.get("/export", authenticateToken, async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    const healthMetrics = systemMonitoring.getHealthMetrics();
    
    if (format === 'prometheus') {
      // Prometheus format
      let prometheusMetrics = '';
      prometheusMetrics += `# HELP api_requests_total Total number of API requests\n`;
      prometheusMetrics += `# TYPE api_requests_total counter\n`;
      prometheusMetrics += `api_requests_total ${healthMetrics.requests.total}\n\n`;
      
      prometheusMetrics += `# HELP api_request_duration_ms Average API request duration\n`;
      prometheusMetrics += `# TYPE api_request_duration_ms gauge\n`;
      prometheusMetrics += `api_request_duration_ms ${healthMetrics.requests.averageResponseTime}\n\n`;
      
      prometheusMetrics += `# HELP ai_calls_total Total number of AI calls\n`;
      prometheusMetrics += `# TYPE ai_calls_total counter\n`;
      prometheusMetrics += `ai_calls_total ${healthMetrics.ai.totalCalls}\n\n`;
      
      prometheusMetrics += `# HELP cache_hit_rate Cache hit rate percentage\n`;
      prometheusMetrics += `# TYPE cache_hit_rate gauge\n`;
      prometheusMetrics += `cache_hit_rate ${healthMetrics.ai.cacheHitRate}\n\n`;
      
      res.set('Content-Type', 'text/plain');
      return res.send(prometheusMetrics);
    } else {
      // JSON format
      return sendSuccess(res, 200, "Metrics exported", {
        metrics: healthMetrics,
        timestamp: Date.now(),
        format: 'json'
      });
    }
  } catch (error) {
    console.error("Error exporting metrics:", error);
    return sendError(res, 500, "Failed to export metrics");
  }
});

export default router;
