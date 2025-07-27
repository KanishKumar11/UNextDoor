/**
 * Cache Management Routes
 * Provides endpoints for cache statistics and management
 */

import express from "express";
import { responseCacheManager } from "../services/responseCacheService.js";
import { authenticateToken } from "../middleware/auth.js";
import { sendSuccess, sendError } from "../utils/responseUtils.js";

const router = express.Router();

/**
 * Get cache statistics
 * GET /api/v1/cache/stats
 */
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const stats = await responseCacheManager.getStats();
    
    return sendSuccess(res, 200, "Cache statistics retrieved", {
      cache: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error getting cache stats:", error);
    return sendError(res, 500, "Failed to get cache statistics");
  }
});

/**
 * Clear cache (admin only)
 * DELETE /api/v1/cache/clear
 */
router.delete("/clear", authenticateToken, async (req, res) => {
  try {
    // Check if user is admin (you may want to add admin role check)
    const { pattern } = req.query;
    
    await responseCacheManager.clear(pattern);
    
    return sendSuccess(res, 200, "Cache cleared successfully", {
      pattern: pattern || "all",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error clearing cache:", error);
    return sendError(res, 500, "Failed to clear cache");
  }
});

/**
 * Get cache health check
 * GET /api/v1/cache/health
 */
router.get("/health", async (req, res) => {
  try {
    const stats = await responseCacheManager.getStats();
    
    const health = {
      status: stats.connected ? "healthy" : "degraded",
      type: stats.type,
      connected: stats.connected,
      timestamp: new Date().toISOString()
    };
    
    if (stats.type === "redis") {
      health.keyCount = stats.keyCount;
    } else if (stats.type === "fallback") {
      health.keyCount = stats.keyCount;
      health.maxSize = stats.maxSize;
      health.usage = `${stats.keyCount}/${stats.maxSize}`;
    }
    
    return sendSuccess(res, 200, "Cache health check", health);
  } catch (error) {
    console.error("Error checking cache health:", error);
    return sendError(res, 500, "Cache health check failed");
  }
});

/**
 * Test cache functionality
 * POST /api/v1/cache/test
 */
router.post("/test", authenticateToken, async (req, res) => {
  try {
    const testKey = `test:${Date.now()}`;
    const testData = { message: "Cache test", timestamp: Date.now() };
    
    // Test set
    await responseCacheManager.set(testKey, testData, 60); // 1 minute TTL
    
    // Test get
    const retrieved = await responseCacheManager.get(testKey);
    
    const testResult = {
      setSuccess: true,
      getSuccess: retrieved !== null,
      dataMatches: retrieved && retrieved.response.message === testData.message,
      cacheType: (await responseCacheManager.getStats()).type
    };
    
    // Clean up test data
    await responseCacheManager.clear(`test:*`);
    
    return sendSuccess(res, 200, "Cache test completed", testResult);
  } catch (error) {
    console.error("Error testing cache:", error);
    return sendError(res, 500, "Cache test failed");
  }
});

export default router;
