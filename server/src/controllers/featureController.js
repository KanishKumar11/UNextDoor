import FeatureGatingService from '../services/featureGatingService.js';
import LessonUsageService from '../services/lessonUsageService.js';

class FeatureController {
  /**
   * Get user's subscription info and feature access
   */
  async getUserFeatures(req, res) {
    try {
      const userId = req.user.id;
      
      const subscriptionInfo = await FeatureGatingService.getUserSubscriptionInfo(userId);
      const lessonUsage = await LessonUsageService.getUserLessonCount(userId, subscriptionInfo);
      
      // Get feature access for each major feature
      const featureAccess = {
        lessons: await FeatureGatingService.hasFeatureAccess(userId, 'lessons'),
        community: await FeatureGatingService.hasFeatureAccess(userId, 'community'),
        support: await FeatureGatingService.hasFeatureAccess(userId, 'support'),
        bonusContent: await FeatureGatingService.hasFeatureAccess(userId, 'bonus_content'),
        certification: await FeatureGatingService.hasFeatureAccess(userId, 'certification')
      };

      const comingSoonFeatures = FeatureGatingService.getComingSoonFeatures();

      res.json({
        success: true,
        data: {
          user: {
            id: userId,
            tier: subscriptionInfo.tier,
            hasActiveSubscription: subscriptionInfo.hasActiveSubscription
          },
          subscription: subscriptionInfo.subscription,
          features: {
            available: featureAccess,
            comingSoon: comingSoonFeatures
          },
          usage: {
            lessons: lessonUsage
          },
          planFeatures: FeatureGatingService.getFeaturesByTier(subscriptionInfo.tier)
        }
      });

    } catch (error) {
      console.error('Get user features error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user features'
      });
    }
  }

  /**
   * Check specific feature access
   */
  async checkFeatureAccess(req, res) {
    try {
      const { feature } = req.params;
      const userId = req.user.id;

      const access = await FeatureGatingService.hasFeatureAccess(userId, feature);
      
      let upgradeOptions = [];
      if (!access.hasAccess && access.reason !== 'coming_soon') {
        const subscriptionInfo = await FeatureGatingService.getUserSubscriptionInfo(userId);
        upgradeOptions = FeatureGatingService.getUpgradeSuggestions(subscriptionInfo.tier, feature);
      }

      res.json({
        success: true,
        data: {
          feature,
          hasAccess: access.hasAccess,
          reason: access.reason,
          currentTier: access.tier,
          upgradeOptions
        }
      });

    } catch (error) {
      console.error('Check feature access error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check feature access'
      });
    }
  }

  /**
   * Get lesson usage and limits
   */
  async getLessonUsage(req, res) {
    try {
      const userId = req.user.id;
      
      const usageInfo = await LessonUsageService.getUserLessonCount(userId);
      const canAccess = await LessonUsageService.canAccessLesson(userId, 'general');

      res.json({
        success: true,
        data: {
          currentCount: usageInfo.currentCount,
          limit: usageInfo.limit,
          remaining: Math.max(0, usageInfo.limit - usageInfo.currentCount),
          period: usageInfo.period,
          resetDate: usageInfo.resetDate,
          canAccessNewLesson: canAccess.canAccess,
          accessReason: canAccess.reason
        }
      });

    } catch (error) {
      console.error('Get lesson usage error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch lesson usage'
      });
    }
  }

  /**
   * Get upgrade suggestions for current user
   */
  async getUpgradeOptions(req, res) {
    try {
      const userId = req.user.id;
      const subscriptionInfo = await FeatureGatingService.getUserSubscriptionInfo(userId);

      const allPlans = [
        {
          id: 'basic_monthly',
          name: 'Basic',
          description: 'Perfect for getting started',
          price: 149,
          currency: 'INR',
          interval: 'month',
          features: FeatureGatingService.getFeaturesByTier('basic')
        },
        {
          id: 'standard_quarterly',
          name: 'Standard',
          description: 'Most popular choice',
          price: 399,
          currency: 'INR',
          interval: 'quarter',
          features: FeatureGatingService.getFeaturesByTier('standard'),
          popular: true
        },
        {
          id: 'pro_yearly',
          name: 'Pro',
          description: 'Ultimate learning experience',
          price: 999,
          currency: 'INR',
          interval: 'year',
          features: FeatureGatingService.getFeaturesByTier('pro')
        }
      ];

      // Filter out current plan if user has subscription
      const availablePlans = allPlans.filter(plan => {
        if (!subscriptionInfo.hasActiveSubscription) return true;
        return plan.id !== subscriptionInfo.subscription.planId;
      });

      res.json({
        success: true,
        data: {
          currentTier: subscriptionInfo.tier,
          currentPlan: subscriptionInfo.subscription?.planId || null,
          availablePlans,
          recommendedAction: this.getRecommendedAction(subscriptionInfo)
        }
      });

    } catch (error) {
      console.error('Get upgrade options error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch upgrade options'
      });
    }
  }

  /**
   * Get feature comparison for upgrade UI
   */
  async getFeatureComparison(req, res) {
    try {
      const features = [
        {
          name: 'Monthly Lessons',
          key: 'lessons',
          free: '0',
          basic: '10',
          standard: '10',
          pro: '10'
        },
        {
          name: 'Community Access',
          key: 'community',
          free: 'None',
          basic: 'Limited (read-only)',
          standard: 'Full access + study groups',
          pro: 'Full access + exclusive channels'
        },
        {
          name: 'Support Response',
          key: 'support',
          free: 'None',
          basic: 'Email (48h)',
          standard: 'Priority email (24h)',
          pro: 'Live chat + email (same day)'
        },
        {
          name: 'Bonus Content',
          key: 'bonusContent',
          free: '❌',
          basic: '❌',
          standard: '1 Deep Dive/month',
          pro: 'Deep Dive + webinars + library'
        },
        {
          name: 'Certification',
          key: 'certification',
          free: '❌',
          basic: '❌',
          standard: 'Module certificates',
          pro: 'Module + Advanced Pro cert'
        },
        {
          name: 'Early Access',
          key: 'earlyAccess',
          free: '❌',
          basic: 'Newsletter only',
          standard: '✅ Lessons',
          pro: '✅ Features + 10% discounts'
        }
      ];

      const comingSoonFeatures = FeatureGatingService.getComingSoonFeatures();

      res.json({
        success: true,
        data: {
          features,
          comingSoon: comingSoonFeatures,
          pricing: {
            basic: { price: 149, period: 'month', savings: null },
            standard: { price: 399, period: '3 months', savings: '₹48 vs monthly' },
            pro: { price: 999, period: '12 months', savings: '₹789 vs monthly' }
          }
        }
      });

    } catch (error) {
      console.error('Get feature comparison error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch feature comparison'
      });
    }
  }

  /**
   * Get coming soon features
   */
  async getComingSoonFeatures(req, res) {
    try {
      const comingSoonFeatures = FeatureGatingService.getComingSoonFeatures();
      
      res.json({
        success: true,
        data: {
          features: comingSoonFeatures,
          message: 'These exciting features are in development and will be available soon!'
        }
      });

    } catch (error) {
      console.error('Get coming soon features error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch coming soon features'
      });
    }
  }

  // Helper methods

  getRecommendedAction(subscriptionInfo) {
    if (!subscriptionInfo.hasActiveSubscription) {
      return {
        action: 'subscribe',
        plan: 'standard_quarterly',
        reason: 'Most popular plan with great value'
      };
    }

    if (subscriptionInfo.tier === 'basic') {
      return {
        action: 'upgrade',
        plan: 'standard_quarterly',
        reason: 'Get study groups and priority support'
      };
    }

    if (subscriptionInfo.tier === 'standard') {
      return {
        action: 'upgrade',
        plan: 'pro_yearly',
        reason: 'Unlock live chat support and exclusive content'
      };
    }

    return {
      action: 'none',
      plan: null,
      reason: 'You have the best plan available!'
    };
  }
}

export default new FeatureController();
