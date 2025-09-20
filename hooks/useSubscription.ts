import { useUser } from '@clerk/clerk-expo';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { Platform, Linking } from 'react-native';
import StripeService, { SubscriptionTier } from '../services/StripeServices';

export interface UserSubscription {
  hasFreePlan: boolean;
  hasPremiumPlan: boolean;
  hasUnlimitedPlan: boolean;
  hasNumerologyAccess: boolean;
  hasLoveMatchAccess: boolean;
  hasTrustAssessmentAccess: boolean;
  tier: SubscriptionTier['id'];
  limits: {
    numerology: number;
    loveMatch: number;
    trustAssessment: number;
  };
  usage?: {
    numerology: number;
    loveMatch: number;
    trustAssessment: number;
  };
}

export function useSubscription() {
  const { user, isLoaded } = useUser();
  const [usageStats, setUsageStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch usage stats when user is loaded
  useEffect(() => {
    async function fetchUsageStats() {
      if (!user?.id) return;

      setLoading(true);
      try {
        const stats = await StripeService.getUsageStats(user.id);
        setUsageStats(stats);
      } catch (error) {
        console.error('Error fetching usage stats:', error);
      } finally {
        setLoading(false);
      }
    }

    if (isLoaded && user) {
      fetchUsageStats();
    }
  }, [user, isLoaded]);

  // Use Clerk's official has() method for subscription checking combined with StripeService
  const subscription = useMemo((): UserSubscription | null => {
    if (!isLoaded || !user) return null;

    try {
      // Check plans using Clerk's has() method (matching your Clerk dashboard plan keys)
      const hasFreePlan = user.has?.({ plan: 'free_user' }) ?? true; // Default to free (matches your Clerk dashboard)
      const hasPremiumPlan = user.has?.({ plan: 'pro' }) ?? false; // Matches your Clerk dashboard
      const hasUnlimitedPlan = user.has?.({ plan: 'unlimited' }) ?? false; // Matches your Clerk dashboard

      // Determine tier
      let tier: SubscriptionTier['id'] = 'free';
      if (hasUnlimitedPlan) tier = 'unlimited';
      else if (hasPremiumPlan) tier = 'premium';

      // Get tier limits from StripeService
      const tierInfo = StripeService.getSubscriptionTier(tier);

      // Check features using Clerk's has() method (matching your Clerk dashboard feature keys)
      const hasNumerologyAccess = user.has?.({ feature: 'numerology_access' }) ?? hasFreePlan;
      const hasLoveMatchAccess = user.has?.({ feature: 'love_match_access' }) ?? hasFreePlan;
      const hasTrustAssessmentAccess = user.has?.({ feature: 'trust_assessment_access' }) ?? hasFreePlan;

      return {
        hasFreePlan,
        hasPremiumPlan,
        hasUnlimitedPlan,
        hasNumerologyAccess,
        hasLoveMatchAccess,
        hasTrustAssessmentAccess,
        tier,
        limits: tierInfo.limits,
        usage: usageStats?.usage || { numerology: 0, loveMatch: 0, trustAssessment: 0 },
      };
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      // Fallback to free plan access when Clerk billing fails
      const freeTier = StripeService.getSubscriptionTier('free');
      return {
        hasFreePlan: true,
        hasPremiumPlan: false,
        hasUnlimitedPlan: false,
        hasNumerologyAccess: true, // Free users get basic access
        hasLoveMatchAccess: true,
        hasTrustAssessmentAccess: true,
        tier: 'free',
        limits: freeTier.limits,
        usage: { numerology: 0, loveMatch: 0, trustAssessment: 0 },
      };
    }
  }, [user, isLoaded, usageStats]);

  // Get current tier name
  const getCurrentTier = useCallback(() => {
    if (!subscription) return 'free';
    if (subscription.hasUnlimitedPlan) return 'unlimited';
    if (subscription.hasPremiumPlan) return 'premium';
    return 'free';
  }, [subscription]);

  // Check if user can access a specific feature (checks both permission and usage limits)
  const canUse = useCallback((feature: 'numerology' | 'loveMatch' | 'trustAssessment') => {
    if (!subscription) return false;

    const hasPermission = (() => {
      switch (feature) {
        case 'numerology':
          return subscription.hasNumerologyAccess;
        case 'loveMatch':
          return subscription.hasLoveMatchAccess;
        case 'trustAssessment':
          return subscription.hasTrustAssessmentAccess;
        default:
          return false;
      }
    })();

    if (!hasPermission) return false;

    // Check usage limits
    const limit = subscription.limits[feature];
    const used = subscription.usage?.[feature] || 0;

    // Unlimited access
    if (limit === -1) return true;

    // Check if under limit
    return used < limit;
  }, [subscription]);

  // Get remaining usage for a feature
  const getRemaining = useCallback((feature: 'numerology' | 'loveMatch' | 'trustAssessment') => {
    if (!subscription) return 0;

    const limit = subscription.limits[feature];
    const used = subscription.usage?.[feature] || 0;

    // Unlimited access
    if (limit === -1) return -1;

    return Math.max(0, limit - used);
  }, [subscription]);

  // Open pricing page - redirect to lovelock.it.com
  const openPricingPage = useCallback(async () => {
    if (!user) throw new Error('User not authenticated');

    try {
      const websiteUrl = 'https://lovelock.it.com';
      const pricingUrl = `${websiteUrl}/pricing?userId=${encodeURIComponent(user.id)}&email=${encodeURIComponent(user.emailAddresses[0]?.emailAddress || '')}&source=mobile`;

      const canOpen = await Linking.canOpenURL(pricingUrl);
      if (canOpen) {
        await Linking.openURL(pricingUrl);
      } else {
        throw new Error('Cannot open website URL');
      }
    } catch (error) {
      console.error('Error opening pricing page:', error);
      throw error;
    }
  }, [user]);

  return {
    subscription,
    getCurrentTier,
    canUse,
    getRemaining,
    openPricingPage,
    isLoaded,
    user,
    loading,
    usageStats
  };
}

// Helper hook for checking specific feature access
export function useFeatureAccess(feature: 'numerology' | 'loveMatch' | 'trustAssessment') {
  const { subscription, canUse, getRemaining } = useSubscription();

  const canAccess = canUse(feature);
  const remaining = getRemaining(feature);

  return {
    canAccess,
    subscription,
    hasAccess: canAccess,
    remaining,
    canUse: canAccess
  };
}