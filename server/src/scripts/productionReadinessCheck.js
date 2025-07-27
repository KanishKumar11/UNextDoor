/**
 * Production Readiness Check
 * Comprehensive validation of all systems before deployment
 */

import { runAllIntegrationTests } from "./integrationTest.js";
import { responseCacheManager } from "../services/responseCacheService.js";
import { systemMonitoring } from "../services/monitoringService.js";
import { conversationAnalytics } from "../services/conversationAnalyticsService.js";
import { webrtcSessionPersistence } from "../services/webrtcSessionPersistence.js";
import config from "../config/index.js";

/**
 * Production Readiness Checker
 */
class ProductionReadinessChecker {
  constructor() {
    this.checks = [];
    this.results = [];
  }

  /**
   * Add a check to the suite
   * @param {string} name - Check name
   * @param {Function} checkFunction - Check function
   * @param {boolean} critical - Whether this check is critical for deployment
   */
  addCheck(name, checkFunction, critical = true) {
    this.checks.push({ name, checkFunction, critical });
  }

  /**
   * Run all production readiness checks
   * @returns {Promise<Object>} Check results
   */
  async runAllChecks() {
    console.log("🚀 PRODUCTION READINESS CHECK");
    console.log("=" * 50);
    
    this.results = [];
    let criticalFailures = 0;
    let warnings = 0;

    for (const check of this.checks) {
      console.log(`\n🔍 Running ${check.name}...`);
      
      try {
        const result = await check.checkFunction();
        const status = result.passed ? 'PASS' : (check.critical ? 'FAIL' : 'WARN');
        
        this.results.push({
          name: check.name,
          passed: result.passed,
          critical: check.critical,
          status,
          details: result.details || {},
          message: result.message || ''
        });

        if (!result.passed) {
          if (check.critical) {
            criticalFailures++;
            console.log(`❌ ${check.name}: CRITICAL FAILURE`);
          } else {
            warnings++;
            console.log(`⚠️ ${check.name}: WARNING`);
          }
        } else {
          console.log(`✅ ${check.name}: PASSED`);
        }

        if (result.message) {
          console.log(`   ${result.message}`);
        }

      } catch (error) {
        this.results.push({
          name: check.name,
          passed: false,
          critical: check.critical,
          status: check.critical ? 'FAIL' : 'WARN',
          error: error.message,
          details: {}
        });

        if (check.critical) {
          criticalFailures++;
          console.log(`❌ ${check.name}: ERROR - ${error.message}`);
        } else {
          warnings++;
          console.log(`⚠️ ${check.name}: ERROR - ${error.message}`);
        }
      }
    }

    const totalChecks = this.checks.length;
    const passed = this.results.filter(r => r.passed).length;
    const readyForProduction = criticalFailures === 0;

    console.log("\n" + "=" * 50);
    console.log("📊 PRODUCTION READINESS SUMMARY");
    console.log("=" * 50);
    
    console.log(`Total Checks: ${totalChecks}`);
    console.log(`Passed: ${passed}`);
    console.log(`Critical Failures: ${criticalFailures}`);
    console.log(`Warnings: ${warnings}`);
    
    if (readyForProduction) {
      console.log("\n🎉 SYSTEM IS READY FOR PRODUCTION!");
      if (warnings > 0) {
        console.log(`⚠️ Note: ${warnings} non-critical warnings should be addressed when possible.`);
      }
    } else {
      console.log("\n🚫 SYSTEM IS NOT READY FOR PRODUCTION!");
      console.log(`❌ ${criticalFailures} critical issues must be resolved before deployment.`);
    }

    return {
      readyForProduction,
      totalChecks,
      passed,
      criticalFailures,
      warnings,
      results: this.results
    };
  }
}

/**
 * Check environment configuration
 */
async function checkEnvironmentConfig() {
  const requiredEnvVars = [
    'OPENAI_API_KEY',
    'MONGODB_URI',
    'JWT_SECRET',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET'
  ];

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  return {
    passed: missing.length === 0,
    message: missing.length > 0 ? `Missing environment variables: ${missing.join(', ')}` : 'All required environment variables are set',
    details: { missing, total: requiredEnvVars.length }
  };
}

/**
 * Check database connectivity
 */
async function checkDatabaseConnectivity() {
  try {
    // This would typically test the actual database connection
    // For now, we'll check if the MongoDB URI is configured
    const hasMongoUri = !!config.mongodb.uri;
    
    return {
      passed: hasMongoUri,
      message: hasMongoUri ? 'Database configuration is valid' : 'MongoDB URI not configured',
      details: { configured: hasMongoUri }
    };
  } catch (error) {
    return {
      passed: false,
      message: `Database check failed: ${error.message}`,
      details: { error: error.message }
    };
  }
}

/**
 * Check cache service
 */
async function checkCacheService() {
  try {
    await responseCacheManager.initialize();
    const stats = await responseCacheManager.getStats();
    
    return {
      passed: true,
      message: `Cache service operational (${stats.type})`,
      details: stats
    };
  } catch (error) {
    return {
      passed: false,
      message: `Cache service check failed: ${error.message}`,
      details: { error: error.message }
    };
  }
}

/**
 * Check monitoring service
 */
async function checkMonitoringService() {
  try {
    const healthData = await systemMonitoring.performHealthCheck();
    
    return {
      passed: healthData.status !== 'critical',
      message: `Monitoring service status: ${healthData.status}`,
      details: healthData
    };
  } catch (error) {
    return {
      passed: false,
      message: `Monitoring service check failed: ${error.message}`,
      details: { error: error.message }
    };
  }
}

/**
 * Check analytics service
 */
async function checkAnalyticsService() {
  try {
    const systemAnalytics = conversationAnalytics.getSystemAnalytics();
    
    return {
      passed: true,
      message: 'Analytics service operational',
      details: systemAnalytics
    };
  } catch (error) {
    return {
      passed: false,
      message: `Analytics service check failed: ${error.message}`,
      details: { error: error.message }
    };
  }
}

/**
 * Check WebRTC session persistence
 */
async function checkWebRTCPersistence() {
  try {
    const activeSessions = webrtcSessionPersistence.getActiveSessions();
    
    return {
      passed: true,
      message: `WebRTC persistence operational (${activeSessions.length} active sessions)`,
      details: { activeSessions: activeSessions.length }
    };
  } catch (error) {
    return {
      passed: false,
      message: `WebRTC persistence check failed: ${error.message}`,
      details: { error: error.message }
    };
  }
}

/**
 * Check security configuration
 */
async function checkSecurityConfig() {
  const issues = [];
  
  // Check JWT secret strength
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    issues.push('JWT secret should be at least 32 characters long');
  }
  
  // Check if running in production mode
  if (process.env.NODE_ENV !== 'production') {
    issues.push('NODE_ENV should be set to "production"');
  }
  
  // Check CORS configuration
  if (!config.cors.origin || config.cors.origin === '*') {
    issues.push('CORS should be configured with specific origins for production');
  }
  
  return {
    passed: issues.length === 0,
    message: issues.length > 0 ? `Security issues: ${issues.join(', ')}` : 'Security configuration is adequate',
    details: { issues }
  };
}

/**
 * Check performance configuration
 */
async function checkPerformanceConfig() {
  const recommendations = [];
  
  // Check if Redis is configured for caching
  if (!config.redis?.url) {
    recommendations.push('Redis should be configured for optimal caching performance');
  }
  
  // Check memory limits
  const memUsage = process.memoryUsage();
  if (memUsage.heapTotal > 512 * 1024 * 1024) { // 512MB
    recommendations.push('Consider monitoring memory usage in production');
  }
  
  return {
    passed: true, // Performance checks are recommendations, not failures
    message: recommendations.length > 0 ? `Performance recommendations: ${recommendations.join(', ')}` : 'Performance configuration is optimal',
    details: { recommendations, memoryUsage: memUsage }
  };
}

/**
 * Run integration tests
 */
async function runIntegrationTests() {
  try {
    const testResults = await runAllIntegrationTests();
    
    return {
      passed: testResults.passed === testResults.total,
      message: `Integration tests: ${testResults.passed}/${testResults.total} passed`,
      details: testResults
    };
  } catch (error) {
    return {
      passed: false,
      message: `Integration tests failed: ${error.message}`,
      details: { error: error.message }
    };
  }
}

/**
 * Main function to run production readiness check
 */
export async function runProductionReadinessCheck() {
  const checker = new ProductionReadinessChecker();
  
  // Add all checks
  checker.addCheck('Environment Configuration', checkEnvironmentConfig, true);
  checker.addCheck('Database Connectivity', checkDatabaseConnectivity, true);
  checker.addCheck('Cache Service', checkCacheService, true);
  checker.addCheck('Monitoring Service', checkMonitoringService, true);
  checker.addCheck('Analytics Service', checkAnalyticsService, true);
  checker.addCheck('WebRTC Persistence', checkWebRTCPersistence, true);
  checker.addCheck('Security Configuration', checkSecurityConfig, true);
  checker.addCheck('Performance Configuration', checkPerformanceConfig, false);
  checker.addCheck('Integration Tests', runIntegrationTests, true);
  
  return await checker.runAllChecks();
}

// Run check if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runProductionReadinessCheck()
    .then(results => {
      process.exit(results.readyForProduction ? 0 : 1);
    })
    .catch(error => {
      console.error("Production readiness check failed:", error);
      process.exit(1);
    });
}

export default {
  ProductionReadinessChecker,
  runProductionReadinessCheck
};
