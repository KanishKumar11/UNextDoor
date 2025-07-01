import UserProgress from '../models/UserProgress.js';
import Subscription from '../models/Subscription.js';

class LessonUsageService {
  /**
   * Get user's lesson count for current subscription period
   */
  async getUserLessonCount(userId, subscriptionInfo = null) {
    try {
      if (!subscriptionInfo) {
        const FeatureGatingService = await import('./featureGatingService.js');
        subscriptionInfo = await FeatureGatingService.default.getUserSubscriptionInfo(userId);
      }

      // If no active subscription, treat as free tier
      if (!subscriptionInfo.hasActiveSubscription) {
        // For free users, count lessons from the current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        const currentCount = await UserProgress.countDocuments({
          userId,
          'lessons.startedAt': { 
            $gte: startOfMonth, 
            $lte: endOfMonth 
          }
        });

        return {
          currentCount,
          limit: 5, // Free tier gets 5 lessons per month
          period: 'monthly',
          resetDate: endOfMonth,
          periodStart: startOfMonth,
          periodEnd: endOfMonth
        };
      }

      const subscription = subscriptionInfo.subscription;
      const periodStart = subscription.currentPeriodStart;
      const periodEnd = subscription.currentPeriodEnd;

      // Count lessons accessed in current period
      const currentCount = await UserProgress.countDocuments({
        userId,
        'lessons.startedAt': { 
          $gte: periodStart, 
          $lte: periodEnd 
        }
      });

      // Get limit based on subscription tier
      const limits = {
        basic: 10,
        standard: 10, // 30 per quarter = 10 per month
        pro: 10 // 120 per year = 10 per month
      };

      const limit = limits[subscriptionInfo.tier] || 0;

      return {
        currentCount,
        limit,
        period: subscription.planId,
        resetDate: subscription.currentPeriodEnd,
        periodStart,
        periodEnd
      };

    } catch (error) {
      console.error('Error getting user lesson count:', error);
      return {
        currentCount: 0,
        limit: 0,
        period: 'error',
        resetDate: null
      };
    }
  }

  /**
   * Check if user can access a new lesson
   */
  async canAccessLesson(userId, lessonId) {
    try {
      const FeatureGatingService = await import('./featureGatingService.js');
      const subscriptionInfo = await FeatureGatingService.default.getUserSubscriptionInfo(userId);

      // Check if user has lesson feature access
      const featureAccess = await FeatureGatingService.default.hasFeatureAccess(userId, 'lessons');
      
      if (!featureAccess.hasAccess) {
        return {
          canAccess: false,
          reason: featureAccess.reason,
          tier: subscriptionInfo.tier
        };
      }

      // Check if lesson was already accessed (don't count against limit)
      const alreadyAccessed = await this.hasUserAccessedLesson(userId, lessonId);
      if (alreadyAccessed) {
        return {
          canAccess: true,
          reason: 'already_accessed',
          tier: subscriptionInfo.tier
        };
      }

      // Check usage limits for new lessons
      const usageInfo = await this.getUserLessonCount(userId, subscriptionInfo);
      
      if (usageInfo.limit > 0 && usageInfo.currentCount >= usageInfo.limit) {
        return {
          canAccess: false,
          reason: 'limit_exceeded',
          tier: subscriptionInfo.tier,
          currentCount: usageInfo.currentCount,
          limit: usageInfo.limit,
          resetDate: usageInfo.resetDate
        };
      }

      return {
        canAccess: true,
        reason: 'within_limit',
        tier: subscriptionInfo.tier,
        currentCount: usageInfo.currentCount,
        limit: usageInfo.limit
      };

    } catch (error) {
      console.error('Error checking lesson access:', error);
      return {
        canAccess: false,
        reason: 'error',
        tier: 'free'
      };
    }
  }

  /**
   * Check if user has previously accessed a lesson
   */
  async hasUserAccessedLesson(userId, lessonId) {
    try {
      const userProgress = await UserProgress.findOne({
        userId,
        'lessons.lessonId': lessonId
      });

      return !!userProgress;
    } catch (error) {
      console.error('Error checking lesson access history:', error);
      return false;
    }
  }

  /**
   * Record lesson access (to be called when user starts a lesson)
   */
  async recordLessonAccess(userId, lessonId) {
    try {
      // Check if already recorded
      const alreadyRecorded = await this.hasUserAccessedLesson(userId, lessonId);
      if (alreadyRecorded) {
        return { recorded: true, reason: 'already_recorded' };
      }

      // Find or create user progress
      let userProgress = await UserProgress.findOne({ userId });
      
      if (!userProgress) {
        userProgress = new UserProgress({
          userId,
          lessons: [],
          overallProgress: 0
        });
      }

      // Add lesson to progress
      userProgress.lessons.push({
        lessonId,
        startedAt: new Date(),
        status: 'started',
        sections: []
      });

      await userProgress.save();

      return { recorded: true, reason: 'new_record' };

    } catch (error) {
      console.error('Error recording lesson access:', error);
      return { recorded: false, reason: 'error' };
    }
  }

  /**
   * Get lesson usage statistics for admin
   */
  async getLessonUsageStats(options = {}) {
    try {
      const { 
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        endDate = new Date(),
        tierFilter = null
      } = options;

      // Aggregate lesson usage by subscription tier
      const pipeline = [
        {
          $match: {
            'lessons.startedAt': { $gte: startDate, $lte: endDate }
          }
        },
        {
          $unwind: '$lessons'
        },
        {
          $match: {
            'lessons.startedAt': { $gte: startDate, $lte: endDate }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $group: {
            _id: {
              tier: '$user.subscriptionTier',
              date: { $dateToString: { format: '%Y-%m-%d', date: '$lessons.startedAt' } }
            },
            lessonCount: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' }
          }
        },
        {
          $project: {
            tier: '$_id.tier',
            date: '$_id.date',
            lessonCount: 1,
            uniqueUserCount: { $size: '$uniqueUsers' }
          }
        },
        {
          $sort: { date: -1, tier: 1 }
        }
      ];

      if (tierFilter) {
        pipeline.splice(3, 0, {
          $match: { 'user.subscriptionTier': tierFilter }
        });
      }

      const stats = await UserProgress.aggregate(pipeline);

      return {
        success: true,
        data: stats,
        period: { startDate, endDate },
        tierFilter
      };

    } catch (error) {
      console.error('Error getting lesson usage stats:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get user's lesson history
   */
  async getUserLessonHistory(userId, options = {}) {
    try {
      const { 
        limit = 50,
        offset = 0,
        includeProgress = true
      } = options;

      const userProgress = await UserProgress.findOne({ userId });
      
      if (!userProgress) {
        return {
          lessons: [],
          totalCount: 0,
          hasMore: false
        };
      }

      const sortedLessons = userProgress.lessons
        .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
        .slice(offset, offset + limit);

      const totalCount = userProgress.lessons.length;

      return {
        lessons: sortedLessons,
        totalCount,
        hasMore: offset + limit < totalCount
      };

    } catch (error) {
      console.error('Error getting user lesson history:', error);
      return {
        lessons: [],
        totalCount: 0,
        hasMore: false
      };
    }
  }
}

export default new LessonUsageService();
