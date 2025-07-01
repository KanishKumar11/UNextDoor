import FeatureGatingService from '../services/featureGatingService.js';

/**
 * Middleware to check if user has access to a specific feature
 */
export const requireFeatureAccess = (featureName, options = {}) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          featureGating: {
            feature: featureName,
            hasAccess: false,
            reason: 'not_authenticated'
          }
        });
      }

      const access = await FeatureGatingService.hasFeatureAccess(userId, featureName);
      
      if (!access.hasAccess) {
        const response = {
          success: false,
          message: this.getAccessDeniedMessage(featureName, access.reason),
          featureGating: {
            feature: featureName,
            hasAccess: false,
            reason: access.reason,
            currentTier: access.tier,
            upgradeRequired: access.reason !== 'coming_soon'
          }
        };

        // Add upgrade suggestions if not coming soon
        if (access.reason !== 'coming_soon') {
          response.featureGating.upgradeSuggestions = 
            FeatureGatingService.getUpgradeSuggestions(access.tier, featureName);
        }

        return res.status(403).json(response);
      }

      // Store access info in request for use in route handlers
      req.featureAccess = access;
      next();

    } catch (error) {
      console.error('Feature gating middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking feature access',
        featureGating: {
          feature: featureName,
          hasAccess: false,
          reason: 'error'
        }
      });
    }
  };
};

/**
 * Middleware to check usage limits for a feature
 */
export const checkUsageLimit = (featureName, getCurrentUsage) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Get current usage (can be a function or a number)
      let currentUsage = 0;
      if (typeof getCurrentUsage === 'function') {
        currentUsage = await getCurrentUsage(req);
      } else if (typeof getCurrentUsage === 'number') {
        currentUsage = getCurrentUsage;
      }

      const limitCheck = await FeatureGatingService.checkUsageLimit(
        userId, 
        featureName, 
        currentUsage
      );

      if (!limitCheck.withinLimit) {
        const response = {
          success: false,
          message: this.getUsageLimitMessage(featureName, limitCheck),
          usageLimit: {
            feature: featureName,
            withinLimit: false,
            reason: limitCheck.reason,
            limit: limitCheck.limit,
            currentUsage: limitCheck.currentUsage
          }
        };

        // Add upgrade suggestions if limit exceeded
        if (limitCheck.reason === 'limit_exceeded') {
          const userInfo = await FeatureGatingService.getUserSubscriptionInfo(userId);
          response.usageLimit.upgradeSuggestions = 
            FeatureGatingService.getUpgradeSuggestions(userInfo.tier, featureName);
        }

        return res.status(429).json(response); // 429 Too Many Requests
      }

      // Store usage info in request
      req.usageLimit = limitCheck;
      next();

    } catch (error) {
      console.error('Usage limit middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking usage limit'
      });
    }
  };
};

/**
 * Middleware to inject user's subscription info into request
 */
export const injectSubscriptionInfo = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    
    if (userId) {
      req.subscriptionInfo = await FeatureGatingService.getUserSubscriptionInfo(userId);
    }
    
    next();
  } catch (error) {
    console.error('Subscription info injection error:', error);
    // Don't block the request, just continue without subscription info
    next();
  }
};

/**
 * Helper function to get access denied messages
 */
export function getAccessDeniedMessage(featureName, reason) {
  const messages = {
    coming_soon: `The ${featureName} feature is coming soon! Stay tuned for updates.`,
    no_access: `You need a subscription to access ${featureName}. Please upgrade your plan.`,
    unknown_feature: `Unknown feature: ${featureName}`,
    error: `Unable to verify access to ${featureName}. Please try again.`
  };
  
  return messages[reason] || `Access denied for ${featureName}`;
}

/**
 * Helper function to get usage limit messages
 */
export function getUsageLimitMessage(featureName, limitCheck) {
  const { reason, limit, currentUsage } = limitCheck;
  
  const messages = {
    limit_exceeded: `You've reached your ${featureName} limit (${currentUsage}/${limit}). Upgrade your plan for more access.`,
    no_access: `You don't have access to ${featureName}. Please upgrade your plan.`,
    error: `Unable to check ${featureName} usage. Please try again.`
  };
  
  return messages[reason] || `Usage limit reached for ${featureName}`;
}
