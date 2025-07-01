import Subscription from '../models/Subscription.js';
import User from '../models/User.js';

class FeatureGatingService {
  constructor() {
    // Define feature limits for each plan
    this.planFeatures = {
      free: {
        lessons: { limit: 5, unit: 'per month' },
        aiSessions: { limit: -1, unit: 'unlimited' }, // No AI session limit for free plan
        vocabulary: { limit: -1, unit: 'unlimited' }, // No vocabulary limit
        community: 'none',
        support: 'none',
        bonusContent: false,
        certification: false,
        additionalPerks: []
      },
      basic: {
        lessons: { limit: 10, unit: 'per month' },
        aiSessions: { limit: -1, unit: 'unlimited' },
        vocabulary: { limit: -1, unit: 'unlimited' },
        community: 'limited',
        support: '48h',
        bonusContent: false,
        certification: false,
        additionalPerks: ['monthly_newsletter']
      },
      standard: {
        lessons: { limit: 10, unit: 'per month' }, // 30 per quarter = 10 per month
        aiSessions: { limit: -1, unit: 'unlimited' },
        vocabulary: { limit: -1, unit: 'unlimited' },
        community: 'full',
        support: '24h',
        bonusContent: 'deep_dive',
        certification: 'module',
        additionalPerks: ['early_access', 'quarterly_qa']
      },
      pro: {
        lessons: { limit: 10, unit: 'per month' }, // 120 per year = 10 per month
        aiSessions: { limit: -1, unit: 'unlimited' },
        vocabulary: { limit: -1, unit: 'unlimited' },
        community: 'premium',
        support: 'live_chat',
        bonusContent: 'premium',
        certification: 'advanced',
        additionalPerks: ['early_access', 'discount_10percent', 'priority_support']
      }
    };

    // Features that are "coming soon" for all plans
    this.comingSoonFeatures = [
      'live_tutoring',
      'group_classes',
      'mobile_app',
      'offline_mode',
      'speech_recognition',
      'ai_conversation_partner',
      'custom_study_plans',
      'progress_analytics',
      'peer_matching',
      'cultural_content'
    ];
  }

  /**
   * Get user's subscription tier and features
   */
  async getUserSubscriptionInfo(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get current active subscription
      const subscription = await Subscription.findOne({
        userId,
        status: 'active',
        currentPeriodEnd: { $gt: new Date() }
      });

      let tier = 'free';
      let features = this.planFeatures.free;

      if (subscription) {
        // Map subscription planId to tier
        const tierMapping = {
          'basic_monthly': 'basic',
          'standard_quarterly': 'standard',
          'pro_yearly': 'pro'
        };

        tier = tierMapping[subscription.planId] || 'free';
        features = this.planFeatures[tier];
      }

      return {
        userId,
        tier,
        features,
        subscription,
        hasActiveSubscription: !!subscription
      };

    } catch (error) {
      console.error('Error getting user subscription info:', error);
      throw error;
    }
  }

  /**
   * Check if user has access to a specific feature
   */
  async hasFeatureAccess(userId, featureName) {
    try {
      const userInfo = await this.getUserSubscriptionInfo(userId);
      
      // Check if feature is coming soon
      if (this.comingSoonFeatures.includes(featureName)) {
        return {
          hasAccess: false,
          reason: 'coming_soon',
          tier: userInfo.tier
        };
      }

      // Check specific feature access
      const features = userInfo.features;
      
      switch (featureName) {
        case 'lessons':
          return {
            hasAccess: features.lessons.limit > 0,
            limit: features.lessons.limit,
            unit: features.lessons.unit,
            tier: userInfo.tier
          };

        case 'ai_sessions':
          return {
            hasAccess: features.aiSessions.limit !== 0,
            limit: features.aiSessions.limit,
            unit: features.aiSessions.unit,
            tier: userInfo.tier
          };

        case 'vocabulary':
          return {
            hasAccess: true, // No vocabulary limits for any tier
            limit: features.vocabulary.limit,
            unit: features.vocabulary.unit,
            tier: userInfo.tier
          };
          
        case 'community':
          return {
            hasAccess: features.community !== 'none',
            level: features.community,
            tier: userInfo.tier
          };
          
        case 'support':
          return {
            hasAccess: features.support !== 'none',
            level: features.support,
            tier: userInfo.tier
          };
          
        case 'bonus_content':
          return {
            hasAccess: !!features.bonusContent,
            level: features.bonusContent,
            tier: userInfo.tier
          };
          
        case 'certification':
          return {
            hasAccess: !!features.certification,
            level: features.certification,
            tier: userInfo.tier
          };
          
        default:
          return {
            hasAccess: false,
            reason: 'unknown_feature',
            tier: userInfo.tier
          };
      }
      
    } catch (error) {
      console.error('Error checking feature access:', error);
      return {
        hasAccess: false,
        reason: 'error',
        tier: 'free'
      };
    }
  }

  /**
   * Get features available for a specific tier (for upgrade prompts)
   */
  getFeaturesByTier(tier) {
    return this.planFeatures[tier] || this.planFeatures.free;
  }

  /**
   * Get upgrade suggestions based on desired feature
   */
  getUpgradeSuggestions(currentTier, desiredFeature) {
    const suggestions = [];
    
    // Check which tiers have the desired feature
    for (const [tier, features] of Object.entries(this.planFeatures)) {
      if (tier === currentTier) continue;
      
      let hasFeature = false;
      
      switch (desiredFeature) {
        case 'lessons':
          hasFeature = features.lessons.limit > this.planFeatures[currentTier].lessons.limit;
          break;
        case 'community':
          hasFeature = features.community !== 'none' && 
                      this.getCommunityLevel(features.community) > 
                      this.getCommunityLevel(this.planFeatures[currentTier].community);
          break;
        case 'support':
          hasFeature = features.support !== 'none' &&
                      this.getSupportLevel(features.support) >
                      this.getSupportLevel(this.planFeatures[currentTier].support);
          break;
        case 'bonus_content':
          hasFeature = !!features.bonusContent;
          break;
        case 'certification':
          hasFeature = !!features.certification;
          break;
      }
      
      if (hasFeature) {
        suggestions.push({
          tier,
          features,
          planId: this.getTierPlanId(tier)
        });
      }
    }
    
    return suggestions;
  }

  /**
   * Check if user has reached usage limit for a feature
   */
  async checkUsageLimit(userId, featureName, currentUsage) {
    try {
      const access = await this.hasFeatureAccess(userId, featureName);
      
      if (!access.hasAccess) {
        return {
          withinLimit: false,
          reason: access.reason || 'no_access',
          limit: access.limit,
          currentUsage
        };
      }
      
      if (access.limit && currentUsage >= access.limit) {
        return {
          withinLimit: false,
          reason: 'limit_exceeded',
          limit: access.limit,
          currentUsage
        };
      }
      
      return {
        withinLimit: true,
        limit: access.limit,
        currentUsage,
        remaining: access.limit ? access.limit - currentUsage : null
      };
      
    } catch (error) {
      console.error('Error checking usage limit:', error);
      return {
        withinLimit: false,
        reason: 'error',
        limit: 0,
        currentUsage
      };
    }
  }

  /**
   * Get all coming soon features
   */
  getComingSoonFeatures() {
    return this.comingSoonFeatures.map(feature => ({
      name: feature,
      displayName: this.getFeatureDisplayName(feature),
      description: this.getFeatureDescription(feature)
    }));
  }

  // Helper methods

  getCommunityLevel(community) {
    const levels = { 'none': 0, 'limited': 1, 'full': 2, 'premium': 3 };
    return levels[community] || 0;
  }

  getSupportLevel(support) {
    const levels = { 'none': 0, '48h': 1, '24h': 2, 'live_chat': 3 };
    return levels[support] || 0;
  }

  getTierPlanId(tier) {
    const mapping = {
      'basic': 'basic_monthly',
      'standard': 'standard_quarterly',
      'pro': 'pro_yearly'
    };
    return mapping[tier];
  }

  getFeatureDisplayName(feature) {
    const displayNames = {
      'live_tutoring': 'Live 1-on-1 Tutoring',
      'group_classes': 'Group Classes',
      'mobile_app': 'Mobile App',
      'offline_mode': 'Offline Mode',
      'speech_recognition': 'Speech Recognition',
      'ai_conversation_partner': 'AI Conversation Partner',
      'custom_study_plans': 'Custom Study Plans',
      'progress_analytics': 'Advanced Analytics',
      'peer_matching': 'Peer Matching',
      'cultural_content': 'Cultural Content'
    };
    return displayNames[feature] || feature;
  }

  getFeatureDescription(feature) {
    const descriptions = {
      'live_tutoring': 'Practice with native Korean speakers',
      'group_classes': 'Join interactive group learning sessions',
      'mobile_app': 'Learn on-the-go with our mobile app',
      'offline_mode': 'Download lessons for offline learning',
      'speech_recognition': 'Perfect your pronunciation with AI feedback',
      'ai_conversation_partner': 'Chat with AI in Korean',
      'custom_study_plans': 'Personalized learning paths',
      'progress_analytics': 'Detailed progress tracking and insights',
      'peer_matching': 'Connect with other learners',
      'cultural_content': 'Learn about Korean culture and customs'
    };
    return descriptions[feature] || 'Coming soon!';
  }
}

export default new FeatureGatingService();
