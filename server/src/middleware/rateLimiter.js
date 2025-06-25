/**
 * Rate Limiter Middleware
 *
 * This middleware provides rate limiting functionality to protect API endpoints
 * from abuse and ensure fair usage.
 */

// In-memory store for rate limiting
// In a production environment, consider using Redis or a database
const rateLimitStore = new Map();

/**
 * Clean up expired rate limit entries
 */
const cleanupExpiredEntries = () => {
  const now = Date.now();

  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime <= now) {
      rateLimitStore.delete(key);
    }
  }
};

// Set up periodic cleanup
setInterval(cleanupExpiredEntries, 60 * 1000); // Run every minute

/**
 * Rate limiter middleware factory
 * @param {string} resource - Resource identifier
 * @param {number} limit - Maximum number of requests per hour
 * @returns {Function} Express middleware
 */
export const rateLimiter = (resource, limit = 1000) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id || "anonymous";
      const key = `${userId}:${resource}`;
      const now = Date.now();

      // Get or create rate limit entry
      let entry = rateLimitStore.get(key);

      if (!entry || entry.resetTime <= now) {
        // Create new entry if none exists or the previous one has expired
        entry = {
          count: 0,
          resetTime: now + 60 * 60 * 1000, // 1 hour from now
        };
      }

      // Check if limit exceeded
      if (entry.count >= limit) {
        const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

        res.set("Retry-After", retryAfter.toString());
        return res.status(429).json({
          error: "Rate limit exceeded",
          retryAfter,
          limit,
          resource,
        });
      }

      // Increment count and update store
      entry.count++;
      rateLimitStore.set(key, entry);

      // Set rate limit headers
      res.set("X-RateLimit-Limit", limit.toString());
      res.set("X-RateLimit-Remaining", (limit - entry.count).toString());
      res.set(
        "X-RateLimit-Reset",
        Math.ceil(entry.resetTime / 1000).toString()
      );

      next();
    } catch (error) {
      console.error("Rate limiter error:", error);
      next();
    }
  };
};
