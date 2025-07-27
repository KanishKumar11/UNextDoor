# AI Tutor Enhanced API Documentation

## Overview

This document covers the new API endpoints added as part of the AI Tutor enhancement project, including response caching, analytics, and monitoring capabilities.

## Base URL
```
Production: https://your-domain.com/api/v1
Development: http://localhost:5001/api/v1
```

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🗄️ Cache Management API

### Health Check
**GET** `/cache/health`

Check cache service health status.

**Response:**
```json
{
  "success": true,
  "message": "Cache health check",
  "data": {
    "status": "healthy",
    "type": "redis",
    "connected": true,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Cache Statistics
**GET** `/cache/stats` 🔒 *Requires Authentication*

Get detailed cache performance statistics.

**Response:**
```json
{
  "success": true,
  "message": "Cache statistics retrieved",
  "data": {
    "cache": {
      "type": "redis",
      "connected": true,
      "keyCount": 1250,
      "memoryInfo": "..."
    },
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Clear Cache
**DELETE** `/cache/clear` 🔒 *Requires Authentication*

Clear cache entries (admin only).

**Query Parameters:**
- `pattern` (optional): Pattern to match keys (e.g., "ai_response:*")

**Response:**
```json
{
  "success": true,
  "message": "Cache cleared successfully",
  "data": {
    "pattern": "ai_response:*",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## 📊 Analytics API

### User Analytics
**GET** `/analytics/user` 🔒 *Requires Authentication*

Get analytics summary for the authenticated user.

**Query Parameters:**
- `timeframe` (optional): Days to look back (default: 30)
- `limit` (optional): Max sessions to include (default: 50)

**Response:**
```json
{
  "success": true,
  "message": "User analytics retrieved",
  "data": {
    "userId": "user123",
    "timeframe": 30,
    "totalSessions": 15,
    "averageQuality": 78.5,
    "averageEngagement": 0.85,
    "totalMessages": 450,
    "averageDuration": 420,
    "recentSessions": [
      {
        "id": "conv123",
        "date": "2024-01-15T10:00:00.000Z",
        "qualityScore": 82,
        "engagementScore": 0.9,
        "duration": 480,
        "messageCount": 35
      }
    ]
  }
}
```

### Learning Progress
**GET** `/analytics/learning-progress` 🔒 *Requires Authentication*

Get detailed learning progress trends.

**Query Parameters:**
- `timeframe` (optional): Days to look back (default: 30)

**Response:**
```json
{
  "success": true,
  "message": "Learning progress retrieved",
  "data": {
    "timeframe": 30,
    "totalSessions": 15,
    "progressTrend": [
      {
        "date": "2024-01-15",
        "averageQuality": 78.5,
        "averageEngagement": 0.85,
        "vocabularyPerSession": 3.2,
        "correctionsPerSession": 1.5,
        "sessionCount": 2
      }
    ],
    "trends": {
      "qualityImprovement": 5.2,
      "engagementImprovement": 0.1
    },
    "summary": {
      "averageQuality": 78.5,
      "averageEngagement": 0.85,
      "totalVocabularyLearned": 48,
      "totalCorrections": 23
    }
  }
}
```

### Quality Insights
**GET** `/analytics/quality-insights` 🔒 *Requires Authentication*

Get conversation quality insights and recommendations.

**Response:**
```json
{
  "success": true,
  "message": "Quality insights retrieved",
  "data": {
    "averageQuality": 78.5,
    "averageEngagement": 0.85,
    "qualityDistribution": {
      "excellent": 3,
      "good": 8,
      "fair": 3,
      "needsImprovement": 1
    },
    "recommendations": [
      "Focus on reducing mistakes and asking for clarification when needed",
      "Try to respond more quickly and engage more actively in conversations"
    ]
  }
}
```

### Model Usage Statistics
**GET** `/analytics/model-usage` 🔒 *Requires Authentication*

Get AI model usage and cost statistics.

**Response:**
```json
{
  "success": true,
  "message": "Model usage statistics retrieved",
  "data": {
    "timeframe": 30,
    "modelUsage": {
      "gpt-4o-mini": 245,
      "gpt-4o": 67
    },
    "cachePerformance": {
      "hits": 156,
      "misses": 156,
      "hitRate": 50.0,
      "totalRequests": 312
    },
    "costSavings": {
      "estimatedSavings": 0.16,
      "message": "Estimated cost savings from caching"
    }
  }
}
```

### Conversation Analytics
**GET** `/analytics/conversation/:id` 🔒 *Requires Authentication*

Get analytics for a specific conversation.

**Response:**
```json
{
  "success": true,
  "message": "Conversation analytics retrieved",
  "data": {
    "conversationId": "conv123",
    "analytics": {
      "qualityScore": 82,
      "engagementScore": 0.9,
      "messageCount": 35,
      "duration": 480000,
      "learningOutcomes": {
        "conceptsLearned": ["안녕하세요", "감사합니다"],
        "skillsImproved": ["pronunciation"],
        "weaknessesIdentified": ["grammar"]
      }
    },
    "basicInfo": {
      "title": "Korean Conversation Practice",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "duration": 480,
      "messageCount": 35
    }
  }
}
```

---

## 📈 Monitoring API

### Health Check
**GET** `/monitoring/health`

Get system health status (public endpoint).

**Response:**
```json
{
  "status": "healthy",
  "timestamp": 1642248600000,
  "uptime": 86400000,
  "services": {
    "cache": {
      "status": "healthy",
      "type": "redis",
      "connected": true
    },
    "analytics": {
      "status": "healthy",
      "activeSessions": 5
    },
    "webrtc": {
      "status": "healthy",
      "activeSessions": 3
    }
  },
  "metrics": {
    "requests": {
      "total": 1250,
      "errorRate": 2.4,
      "averageResponseTime": 145
    },
    "ai": {
      "totalCalls": 456,
      "successRate": 98.5,
      "cacheHitRate": 65.2,
      "estimatedCost": 12.45
    }
  }
}
```

### Performance Metrics
**GET** `/monitoring/performance` 🔒 *Requires Authentication*

Get detailed performance metrics.

**Response:**
```json
{
  "success": true,
  "message": "Performance metrics retrieved",
  "data": {
    "performance": {
      "requests": {
        "total": 1250,
        "errorRate": 2.4,
        "averageResponseTime": 145
      },
      "ai": {
        "totalCalls": 456,
        "successRate": 98.5,
        "cacheHitRate": 65.2,
        "estimatedCost": 12.45
      },
      "webrtc": {
        "activeSessions": 3,
        "totalSessions": 89,
        "averageDuration": 420
      },
      "memory": {
        "usage": 245.6,
        "heapUsed": 189.2
      }
    },
    "timestamp": "2024-01-15T10:30:00.000Z",
    "status": "healthy"
  }
}
```

### System Dashboard
**GET** `/monitoring/dashboard` 🔒 *Requires Authentication*

Get comprehensive dashboard data.

**Response:**
```json
{
  "success": true,
  "message": "Dashboard data retrieved",
  "data": {
    "status": "healthy",
    "indicators": {
      "overall": "healthy",
      "api": "healthy",
      "ai": "healthy",
      "cache": "healthy",
      "memory": "healthy"
    },
    "recentActivity": {
      "requests": 1250,
      "aiCalls": 456,
      "activeSessions": 3,
      "recentErrors": 2,
      "alerts": 0
    },
    "trends": {
      "responseTime": {
        "current": 145,
        "trend": "stable"
      },
      "errorRate": {
        "current": 2.4,
        "trend": "stable"
      },
      "cacheHitRate": {
        "current": 65.2,
        "trend": "stable"
      }
    }
  }
}
```

### Recent Alerts
**GET** `/monitoring/alerts` 🔒 *Requires Authentication*

Get recent system alerts.

**Query Parameters:**
- `limit` (optional): Max alerts to return (default: 20)

**Response:**
```json
{
  "success": true,
  "message": "Recent alerts retrieved",
  "data": {
    "alerts": [
      {
        "id": "alert123",
        "type": "slow_request",
        "message": "Slow request detected: /api/v1/analytics/user took 5200ms",
        "severity": "warning",
        "timestamp": 1642248600000
      }
    ],
    "totalAlerts": 1,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Common HTTP Status Codes

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error
- `503` - Service Unavailable (health check failed)

---

## Rate Limiting

API endpoints are rate limited:
- **Public endpoints**: 100 requests per minute
- **Authenticated endpoints**: 1000 requests per minute
- **Admin endpoints**: 500 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642248660
```

---

## Caching Strategy

The system implements intelligent caching:

### Cached Content
- Educational responses (1 hour TTL)
- Grammar analysis (2 hours TTL)
- Vocabulary analysis (2 hours TTL)
- Simple responses (30 minutes TTL)

### Non-Cached Content
- Real-time conversations
- Personalized feedback
- User-specific analysis
- Authentication responses

### Cache Keys
Cache keys follow the pattern:
```
ai_response:{hash}
```

Where `{hash}` is generated from:
- Use case type
- User level
- Scenario ID (if applicable)
- Prompt content hash
- Model used

---

## WebSocket Events (Real-time Features)

For real-time conversation features:

### Connection
```javascript
const socket = io('ws://localhost:5001');
```

### Events
- `realtime:conversation-updated` - Conversation state changes
- `realtime:audio` - Audio data
- `realtime:transcript` - Transcript updates
- `realtime:session-ended` - Session completion

---

## SDK Examples

### JavaScript/Node.js
```javascript
const API_BASE = 'http://localhost:5001/api/v1';

// Get user analytics
async function getUserAnalytics(token, timeframe = 30) {
  const response = await fetch(`${API_BASE}/analytics/user?timeframe=${timeframe}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}

// Check system health
async function checkHealth() {
  const response = await fetch(`${API_BASE}/monitoring/health`);
  return response.json();
}
```

### React Native
```javascript
import analyticsService from './services/analyticsService';

// Get dashboard analytics
const dashboardData = await analyticsService.getDashboardAnalytics();

// Get learning progress
const progress = await analyticsService.getLearningProgress(7); // Last 7 days
```

---

## Production Deployment Notes

### Environment Variables Required
```bash
# Core
OPENAI_API_KEY=your_openai_key
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret_32_chars_min

# Redis (for caching)
REDIS_URL=redis://localhost:6379
# OR
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Optional
NODE_ENV=production
PORT=5001
```

### Health Check Endpoints
- **Application**: `GET /health`
- **Cache**: `GET /api/v1/cache/health`
- **Monitoring**: `GET /api/v1/monitoring/health`

### Monitoring Integration
The API supports Prometheus metrics export:
```
GET /api/v1/monitoring/export?format=prometheus
```

---

*Last updated: January 2024*
*API Version: 1.0.0*
