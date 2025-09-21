import { useUser } from '@clerk/clerk-expo';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { Platform, Linking } from 'react-native';
import StripeService, { SubscriptionTier } from '../services/StripeServices';
import { SubscriptionService } from '../services/SubscriptionService';

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
  const [supabaseSubscription, setSupabaseSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch subscription and usage stats when user is loaded
  useEffect(() => {
    async function fetchSubscriptionData() {
      if (!user?.id) return;

      setLoading(true);
      try {
        // Fetch from both StripeService (for usage) and SubscriptionService (for subscription status)
        const [stats, subscription] = await Promise.all([
          StripeService.getUsageStats(user.id),
          SubscriptionService.getSubscriptionStatus(user.id)
        ]);

        setUsageStats(stats);
        setSupabaseSubscription(subscription);

      } catch (error) {
        console.error('Error fetching subscription data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (isLoaded && user) {
      fetchSubscriptionData();
    }
  }, [user, isLoaded]);

  // Use Supabase subscription data instead of Clerk billing
  const subscription = useMemo((): UserSubscription | null => {
    if (!isLoaded || !user) return null;

    try {
      // Use Supabase subscription status as the source of truth
      const isPremium = supabaseSubscription?.isPremium || false;
      const subscriptionType = supabaseSubscription?.subscriptionType || 'free';

      // Determine plan status based on Supabase data
      const hasFreePlan = subscriptionType === 'free';
      const hasPremiumPlan = subscriptionType === 'premium' || isPremium;
      const hasUnlimitedPlan = subscriptionType === 'unlimited';

      // Determine tier
      let tier: SubscriptionTier['id'] = 'free';
      if (hasUnlimitedPlan) tier = 'unlimited';
      else if (hasPremiumPlan) tier = 'premium';


      // Get tier limits from StripeService
      const tierInfo = StripeService.getSubscriptionTier(tier);

      // Premium and unlimited users have access to all features
      const hasFullAccess = hasPremiumPlan || hasUnlimitedPlan;

      return {
        hasFreePlan,
        hasPremiumPlan,
        hasUnlimitedPlan,
        hasNumerologyAccess: true, // All users have access, limits are enforced differently
        hasLoveMatchAccess: true,
        hasTrustAssessmentAccess: true,
        tier,
        limits: tierInfo.limits,
        usage: usageStats?.usage || { numerology: 0, loveMatch: 0, trustAssessment: 0 },
      };
    } catch (error) {
      console.error('Error processing subscription data:', error);
      // Fallback to free plan access
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
  }, [user, isLoaded, usageStats, supabaseSubscription]);

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
    canAccessFeature: canUse, // Alias for backwards compatibility
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