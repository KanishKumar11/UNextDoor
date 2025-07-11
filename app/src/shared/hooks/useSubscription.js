import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../features/auth/context/AuthContext';
import { SubscriptionService } from '../services/subscriptionService';

export const useSubscription = () => {
  const { getToken, isAuthenticated, isInitialized } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [features, setFeatures] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('🔍 [useSubscription] Hook initialized, isAuthenticated:', isAuthenticated, 'isInitialized:', isInitialized);

  const fetchSubscriptionData = useCallback(async () => {
    console.log('🔍 [useSubscription] fetchSubscriptionData called, isAuthenticated:', isAuthenticated);

    if (!isAuthenticated || !isInitialized) {
      console.log('❌ [useSubscription] Not authenticated or not initialized, skipping fetch');
      setLoading(false);
      return;
    }

    // Get the actual token
    const token = await getToken();
    console.log('🔍 [useSubscription] Retrieved token:', !!token);

    if (!token) {
      console.log('❌ [useSubscription] No token available, skipping fetch');
      setLoading(false);
      return;
    }

    console.log('✅ [useSubscription] Token exists, proceeding with fetch');

    try {
      setError(null);

      // Fetch current subscription
      const subscriptionData = await SubscriptionService.getCurrentSubscription();
      console.log('🔍 [useSubscription] Raw subscription data:', JSON.stringify(subscriptionData, null, 2));

      // Fetch user features and usage
      const featuresData = await SubscriptionService.getUserFeatures();
      console.log('🔍 [useSubscription] Raw features data:', JSON.stringify(featuresData, null, 2));

      if (subscriptionData.success) {
        console.log('✅ [useSubscription] Setting subscription data:', subscriptionData.data);
        setSubscription(subscriptionData.data);
      } else {
        console.log('❌ [useSubscription] Subscription data not successful:', subscriptionData);
      }

      if (featuresData.success) {
        console.log('✅ [useSubscription] Setting features data:', featuresData.data);
        setFeatures(featuresData.data);
      } else {
        console.log('❌ [useSubscription] Features data not successful:', featuresData);
      }

    } catch (err) {
      console.error('❌ [useSubscription] Error fetching subscription data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isInitialized, getToken]);

  const refreshSubscription = useCallback(() => {
    setLoading(true);
    fetchSubscriptionData();
  }, [fetchSubscriptionData]);

  // Get current plan information
  const getCurrentPlan = useCallback(() => {
    console.log('🔍 [getCurrentPlan] subscription state:', subscription);
    console.log('🔍 [getCurrentPlan] subscription?.subscription:', subscription?.subscription);

    if (!subscription?.subscription) {
      console.log('❌ [getCurrentPlan] No subscription found, returning Free plan');
      return {
        id: 'free',
        name: 'Free',
        tier: 'free',
        isActive: false,
        price: 0,
        interval: null,
      };
    }

    const sub = subscription.subscription;
    console.log('🔍 [getCurrentPlan] Processing subscription:', sub);
    console.log('🔍 [getCurrentPlan] planId:', sub.planId);

    let tier = 'free';
    let name = 'Free';

    if (sub.planId === 'basic_monthly') {
      tier = 'basic';
      name = 'Basic';
      console.log('✅ [getCurrentPlan] Matched basic_monthly plan');
    } else if (sub.planId === 'standard_quarterly') {
      tier = 'standard';
      name = 'Standard';
      console.log('✅ [getCurrentPlan] Matched standard_quarterly plan');
    } else if (sub.planId === 'pro_yearly') {
      tier = 'pro';
      name = 'Pro';
      console.log('✅ [getCurrentPlan] Matched pro_yearly plan');
    } else {
      console.log('❌ [getCurrentPlan] Unknown planId:', sub.planId, '- defaulting to Free');
    }

    const result = {
      id: sub.planId,
      name,
      tier,
      isActive: subscription.hasActiveSubscription,
      price: sub.amount,
      interval: sub.interval,
      intervalCount: sub.intervalCount,
      currentPeriodEnd: sub.currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      autoRenewal: sub.autoRenewal,
      nextRenewalDate: sub.nextRenewalDate,
      reminderSent: sub.reminderSent,
      isRecurring: sub.isRecurring,
      subscriptionId: sub.subscriptionId, // Razorpay subscription ID
    };

    console.log('🎯 [getCurrentPlan] Final result:', result);
    return result;
  }, [subscription]);

  // Get usage information
  const getUsage = useCallback(() => {
    if (!features) {
      return {
        lessons: { current: 0, limit: 5, remaining: 5 },
        aiSessions: { current: 0, limit: 15, remaining: 15 },
        vocabulary: { current: 0, limit: -1, remaining: -1 },
      };
    }

    const lessonUsage = features.usage.lessons || {};
    const currentPlan = getCurrentPlan();

    // AI sessions usage (simulated for now - TODO: Implement actual tracking)
    const aiSessionsLimit = -1; // No AI session limits for any plan
    const aiSessionsCurrent = 0; // TODO: Implement AI sessions tracking

    return {
      lessons: {
        current: lessonUsage.currentCount || 0,
        limit: currentPlan.tier === 'free' ? 5 : -1,
        remaining: currentPlan.tier === 'free' 
          ? Math.max(0, 5 - (lessonUsage.currentCount || 0))
          : -1,
      },
      aiSessions: {
        current: aiSessionsCurrent,
        limit: aiSessionsLimit,
        remaining: aiSessionsLimit === -1 ? -1 : Math.max(0, aiSessionsLimit - aiSessionsCurrent),
      },
      vocabulary: {
        current: 0, // No vocabulary limits for any plan
        limit: -1,
        remaining: -1,
      },
    };
  }, [features, getCurrentPlan]);

  // Check if user can access a feature
  const canAccess = useCallback((featureName) => {
    if (!features?.features?.available) {
      return false;
    }

    const feature = features.features.available[featureName];
    return feature?.hasAccess || false;
  }, [features]);

  // Check if user has reached usage limit
  const hasReachedLimit = useCallback((featureName) => {
    const usage = getUsage();
    const featureUsage = usage[featureName];
    
    if (!featureUsage || featureUsage.limit === -1) {
      return false; // Unlimited
    }

    return featureUsage.current >= featureUsage.limit;
  }, [getUsage]);

  useEffect(() => {
    console.log('🔍 [useSubscription] useEffect triggered, isAuthenticated:', isAuthenticated, 'isInitialized:', isInitialized);
    if (isAuthenticated && isInitialized) {
      console.log('✅ [useSubscription] Authenticated and initialized, calling fetchSubscriptionData');
      fetchSubscriptionData();
    } else {
      console.log('❌ [useSubscription] Not ready yet, waiting...');
    }
  }, [isAuthenticated, isInitialized, fetchSubscriptionData]);

  return {
    subscription: subscription?.subscription,
    hasActiveSubscription: subscription?.hasActiveSubscription || false,
    currentPlan: getCurrentPlan(),
    usage: getUsage(),
    features,
    loading,
    error,
    canAccess,
    hasReachedLimit,
    refreshSubscription,
  };
};
