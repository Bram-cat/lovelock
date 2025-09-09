import { supabase } from '../lib/supabase-client';
import { StripeService } from './StripeService';
import { StripePaymentService } from './StripePaymentService';

export interface SubscriptionStatus {
  isPremium: boolean;
  subscriptionType: 'free' | 'premium';
  expiryDate?: string;
  startDate?: string;
  stripeSubscriptionId?: string;
}

export interface UsageCount {
  totalAIRequests: number;
  numerology: number;
  loveMatch: number;
  trustAssessment: number;
  lastResetDate: string;
}

export interface UsageStats {
  totalUsed: number;
  limit: number;
  remaining: number;
  resetsAt: string;
}

export class SubscriptionService {
  // Free tier limits - 5 total AI requests (lifetime, not per month)
  private static readonly FREE_AI_REQUESTS_LIMIT = 5;
  
  // Premium tier limits - 50 AI requests per month
  private static readonly PREMIUM_AI_REQUESTS_LIMIT = 50;
  
  // Subscription prices
  static readonly PREMIUM_MONTHLY_PRICE = 4.99;
  static readonly UNLIMITED_MONTHLY_PRICE = 9.99;
  
  // Special unlimited accounts (add your user IDs here)
  private static readonly UNLIMITED_ACCOUNTS = [
    'user_31yK29VRF1fXjDvXOe9yLCZr4IN', // Your actual user ID from logs
    'user_2qNQD9g8LjQWvVZfBJVo6xGhVNq', // Backup
    'vsbha@outlook.com', // Add your email as backup
  ];

  /**
   * Check if user has unlimited access (special accounts or premium)
   */
  private static hasUnlimitedAccess(userId: string, userEmail?: string): boolean {
    return this.UNLIMITED_ACCOUNTS.includes(userId) || 
           (userEmail && this.UNLIMITED_ACCOUNTS.includes(userEmail));
  }

  /**
   * Get current subscription status from Supabase
   */
  static async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    try {
      console.log('🔍 Getting subscription status for user:', userId);
      
      // Check if user has unlimited access first
      if (this.hasUnlimitedAccess(userId)) {
        return {
          isPremium: true,
          subscriptionType: 'premium',
          expiryDate: undefined,
          startDate: new Date().toISOString(),
          stripeSubscriptionId: undefined
        };
      }
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error getting subscription:', error);
        return { isPremium: false, subscriptionType: 'free' };
      }

      if (!data) {
        console.log('📋 No active subscription found, defaulting to free');
        return { isPremium: false, subscriptionType: 'free' };
      }

      // Check if subscription is still valid
      if (data.ends_at && new Date(data.ends_at) < new Date()) {
        console.log('⏰ Subscription expired, updating to inactive');
        await this.expireSubscription(userId, data.id);
        return { isPremium: false, subscriptionType: 'free' };
      }

      console.log('✅ Active premium subscription found');
      return {
        isPremium: data.subscription_type === 'premium',
        subscriptionType: data.subscription_type,
        expiryDate: data.ends_at,
        startDate: data.starts_at,
        stripeSubscriptionId: data.stripe_subscription_id
      };
    } catch (error) {
      console.error('💥 Unexpected error getting subscription status:', error);
      return { isPremium: false, subscriptionType: 'free' };
    }
  }

  /**
   * Create or update subscription status in Supabase
   */
  static async createSubscription(
    userId: string,
    subscriptionType: 'free' | 'premium',
    stripeSubscriptionId?: string,
    endsAt?: string
  ): Promise<void> {
    try {
      const startDate = new Date().toISOString();
      const endDate = endsAt || (subscriptionType === 'premium' ? 
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : 
        null);

      // First, deactivate any existing subscriptions
      await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', userId)
        .eq('status', 'active');

      // Create new subscription
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          subscription_type: subscriptionType,
          status: 'active',
          starts_at: startDate,
          ends_at: endDate,
          stripe_subscription_id: stripeSubscriptionId
        });

      if (error) {
        console.error('❌ Error creating subscription:', error);
        throw error;
      }

      console.log(`✅ Subscription created: ${subscriptionType} for user ${userId}`);
    } catch (error) {
      console.error('💥 Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Get current usage count from Supabase (all-time for free, monthly for premium/unlimited)
   */
  static async getUsageCount(userId: string, subscriptionType?: 'free' | 'premium' | 'unlimited'): Promise<UsageCount> {
    try {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59).toISOString();


      // For free users: get all-time usage. For premium/unlimited: get monthly usage
      let aiUsageQuery = supabase
        .from('ai_usage')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (subscriptionType !== 'free') {
        aiUsageQuery = aiUsageQuery
          .gte('created_at', startOfMonth)
          .lte('created_at', endOfMonth);
      }

      const aiUsageResult = await aiUsageQuery;

      // Get counts from each feature table for backward compatibility
      const [numerologyResult, loveMatchResult, trustResult] = await Promise.all([
        supabase
          .from('numerology_readings')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('created_at', startOfMonth)
          .lte('created_at', endOfMonth),
        supabase
          .from('love_matches')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('created_at', startOfMonth)
          .lte('created_at', endOfMonth),
        supabase
          .from('trust_assessments')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('created_at', startOfMonth)
          .lte('created_at', endOfMonth)
      ]);

      const usage: UsageCount = {
        totalAIRequests: aiUsageResult.count || 0,
        numerology: numerologyResult.count || 0,
        loveMatch: loveMatchResult.count || 0,
        trustAssessment: trustResult.count || 0,
        lastResetDate: startOfMonth
      };

      return usage;
    } catch (error) {
      console.error('💥 Error getting usage count:', error);
      return {
        totalAIRequests: 0,
        numerology: 0,
        loveMatch: 0,
        trustAssessment: 0,
        lastResetDate: new Date().toISOString()
      };
    }
  }

  /**
   * Record AI usage in Supabase
   */
  static async recordAIUsage(
    userId: string,
    feature: 'numerology' | 'loveMatch' | 'trustAssessment' | 'dailyInsights' | 'oracle' | 'celebrityMatch',
    provider: 'openai' | 'gemini',
    estimatedCost: number = 0.12,
    promptTokens: number = 0,
    completionTokens: number = 0
  ): Promise<void> {
    try {
      console.log(`📝 Recording AI usage for ${feature} by user:`, userId);
      
      // Record in AI usage table for tracking
      const aiUsageResult = await supabase
        .from('ai_usage')
        .insert({
          user_id: userId,
          feature_type: feature,
          ai_provider: provider,
          estimated_cost: estimatedCost,
          prompt_tokens: promptTokens,
          completion_tokens: completionTokens,
          total_tokens: promptTokens + completionTokens
        });

      if (aiUsageResult?.error) {
        console.error('❌ Error recording AI usage:', aiUsageResult.error);
        throw aiUsageResult.error;
      }

      console.log(`✅ AI usage recorded for ${feature}`);
    } catch (error) {
      console.error('💥 Error recording AI usage:', error);
      throw error;
    }
  }

  /**
   * Record feature usage in Supabase (backward compatibility)
   */
  static async recordUsage(
    userId: string,
    feature: 'numerology' | 'loveMatch' | 'trustAssessment',
    data: any
  ): Promise<void> {
    try {
      console.log(`📝 Recording ${feature} usage for user:`, userId);
      
      let insertResult;
      
      switch (feature) {
        case 'numerology':
          insertResult = await supabase
            .from('numerology_readings')
            .insert({
              user_id: userId,
              reading_type: data.reading_type || 'general',
              reading_data: data
            });
          break;
        case 'loveMatch':
          insertResult = await supabase
            .from('love_matches')
            .insert({
              user_id: userId,
              partner_name: data.partner_name || 'Unknown',
              partner_birth_date: data.partner_birth_date,
              compatibility_score: data.compatibility_score,
              match_details: data
            });
          break;
        case 'trustAssessment':
          insertResult = await supabase
            .from('trust_assessments')
            .insert({
              user_id: userId,
              assessment_data: data,
              trust_score: data.trust_score || 0
            });
          break;
      }

      if (insertResult?.error) {
        console.error(`❌ Error recording ${feature} usage:`, insertResult.error);
        throw insertResult.error;
      }

      console.log(`✅ ${feature} usage recorded successfully`);
    } catch (error) {
      console.error(`💥 Error recording ${feature} usage:`, error);
      throw error;
    }
  }

  /**
   * Check if user can make an AI request
   */
  static async canMakeAIRequest(
    userId: string
  ): Promise<{
    canUse: boolean;
    usageCount: number;
    limit: number;
    remaining: number;
    subscriptionType: 'free' | 'premium' | 'unlimited';
    message?: string;
  }> {
    try {
      // Check for unlimited access first
      if (this.hasUnlimitedAccess(userId)) {
        return {
          canUse: true,
          usageCount: 0,
          limit: -1, // Unlimited
          remaining: -1, // Unlimited
          subscriptionType: 'unlimited',
          message: 'Developer Account - Unlimited access'
        };
      }

      const subscription = await this.getSubscriptionStatus(userId);
      const subscriptionType = subscription.subscriptionType || 'free';
      const usage = await this.getUsageCount(userId, subscriptionType);
      
      const aiUsageCount = usage.totalAIRequests;
      
      // Unlimited tier
      if (subscription.subscriptionType === 'unlimited') {
        return {
          canUse: true,
          usageCount: aiUsageCount,
          limit: -1, // Unlimited
          remaining: -1, // Unlimited
          subscriptionType: 'unlimited',
          message: 'Unlimited - No limits'
        };
      }
      
      // Premium tier - 50 requests/month
      if (subscription.isPremium) {
        const canUse = aiUsageCount < this.PREMIUM_AI_REQUESTS_LIMIT;
        const remaining = Math.max(0, this.PREMIUM_AI_REQUESTS_LIMIT - aiUsageCount);
        
        let message;
        if (canUse) {
          if (remaining <= 5) {
            message = `⚠️ Only ${remaining} AI requests remaining! Upgrade to Unlimited for no limits.`;
          } else {
            message = `${remaining} AI requests remaining this month`;
          }
        } else {
          message = `🚫 Premium limit reached! You've used all ${this.PREMIUM_AI_REQUESTS_LIMIT} requests. Upgrade to Unlimited for no limits.`;
        }
        
        return {
          canUse,
          usageCount: aiUsageCount,
          limit: this.PREMIUM_AI_REQUESTS_LIMIT,
          remaining,
          subscriptionType: 'premium',
          message
        };
      }
      
      // Free tier - 5 requests total (lifetime)
      const canUse = aiUsageCount < this.FREE_AI_REQUESTS_LIMIT;
      const remaining = Math.max(0, this.FREE_AI_REQUESTS_LIMIT - aiUsageCount);
      
      let message;
      if (canUse) {
        if (remaining === 1) {
          message = `⚠️ Last free AI request remaining! Upgrade to Premium for 50 requests/month.`;
        } else if (remaining <= 2) {
          message = `⚠️ Only ${remaining} free AI requests remaining.`;
        } else {
          message = `${remaining} free AI requests remaining`;
        }
      } else {
        message = `🚫 Free AI limit reached! You've used all ${this.FREE_AI_REQUESTS_LIMIT} free requests. Upgrade to Premium for 50 requests/month or Unlimited for no limits.`;
      }
      
      return {
        canUse,
        usageCount: aiUsageCount,
        limit: this.FREE_AI_REQUESTS_LIMIT,
        remaining,
        subscriptionType: 'free',
        message
      };
    } catch (error) {
      console.error('💥 Error checking AI access:', error);
      return {
        canUse: false,
        usageCount: 0,
        limit: 0,
        remaining: 0,
        subscriptionType: 'free',
        message: 'Error checking access'
      };
    }
  }

  /**
   * Check if user can access a feature (backward compatibility)
   */
  static async canAccessFeature(
    userId: string,
    feature: 'numerology' | 'loveMatch' | 'trustAssessment'
  ): Promise<{
    canUse: boolean;
    usageCount: number;
    limit: number;
    remaining: number;
    isPremium: boolean;
    message?: string;
  }> {
    const aiAccess = await this.canMakeAIRequest(userId);
    
    return {
      canUse: aiAccess.canUse,
      usageCount: aiAccess.usageCount,
      limit: aiAccess.limit,
      remaining: aiAccess.remaining,
      isPremium: aiAccess.subscriptionType !== 'free',
      message: aiAccess.message
    };
  }

  /**
   * Get usage statistics for display
   */
  static async getUsageStats(userId: string): Promise<{
    numerology: UsageStats;
    loveMatch: UsageStats;
    trustAssessment: UsageStats;
    isPremium: boolean;
  }> {
    try {
      const [subscription, usage] = await Promise.all([
        this.getSubscriptionStatus(userId),
        this.getUsageCount(userId)
      ]);

      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      
      const createStats = (featureUsage: number): UsageStats => {
        if (subscription.isPremium) {
          return {
            totalUsed: featureUsage,
            limit: -1,
            remaining: -1,
            resetsAt: 'Never (Premium)'
          };
        }
        
        return {
          totalUsed: featureUsage,
          limit: this.FREE_LIMIT_PER_FEATURE,
          remaining: Math.max(0, this.FREE_LIMIT_PER_FEATURE - featureUsage),
          resetsAt: nextMonth.toISOString()
        };
      };

      return {
        numerology: createStats(usage.numerology),
        loveMatch: createStats(usage.loveMatch),
        trustAssessment: createStats(usage.trustAssessment),
        isPremium: subscription.isPremium
      };
    } catch (error) {
      console.error('💥 Error getting usage stats:', error);
      const emptyStats: UsageStats = {
        totalUsed: 0,
        limit: this.FREE_LIMIT_PER_FEATURE,
        remaining: this.FREE_LIMIT_PER_FEATURE,
        resetsAt: 'Error'
      };
      
      return {
        numerology: emptyStats,
        loveMatch: emptyStats,
        trustAssessment: emptyStats,
        isPremium: false
      };
    }
  }

  /**
   * Purchase premium subscription via Stripe with React Native integration
   */
  static async purchasePremiumSubscription(
    userId: string,
    customerEmail: string,
    customerName?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🚀 Initiating Stripe subscription for user:', userId);
      
      // Use the new StripePaymentService for React Native
      const result = await StripePaymentService.purchasePremiumSubscription(
        userId,
        customerEmail,
        customerName
      );
      
      if (!result.success) {
        return { success: false, error: result.error };
      }

      // For mock/testing purposes, immediately activate premium
      // In production, this should be handled by Stripe webhooks
      if (result.sessionId?.startsWith('mock_session_')) {
        console.log('Activating mock premium subscription');
        await this.activatePremiumSubscription(result.sessionId);
        return { success: true };
      }

      // In production, return success but don't activate yet
      // Activation happens via webhook when payment is confirmed
      return { success: true };
      
    } catch (error) {
      console.error('Error purchasing premium subscription:', error);
      return { success: false, error: 'Payment failed. Please try again.' };
    }
  }

  /**
   * Activate premium subscription (called after successful payment)
   */
  static async activatePremiumSubscription(
    userId: string,
    sessionId: string,
    subscriptionId?: string
  ): Promise<void> {
    try {
      console.log('🎯 Activating premium subscription for user:', userId);
      
      // Calculate expiry date (30 days from now)
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);
      
      await this.createSubscription(
        userId,
        'premium',
        subscriptionId,
        expiryDate.toISOString()
      );
      
      console.log('✅ Premium subscription activated until:', expiryDate);
    } catch (error) {
      console.error('💥 Error activating premium subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel premium subscription
   */
  static async cancelSubscription(userId: string): Promise<boolean> {
    try {
      const subscription = await this.getSubscriptionStatus(userId);
      
      if (subscription.stripeSubscriptionId) {
        const cancelled = await StripeService.cancelSubscription(subscription.stripeSubscriptionId);
        if (!cancelled) {
          return false;
        }
      }

      // Update subscription status to cancelled in database
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) {
        console.error('❌ Error cancelling subscription in database:', error);
        return false;
      }
      
      console.log('✅ Subscription cancelled, downgraded to free tier');
      return true;
    } catch (error) {
      console.error('💥 Error cancelling subscription:', error);
      return false;
    }
  }

  /**
   * Expire a subscription
   */
  private static async expireSubscription(userId: string, subscriptionId: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'expired' })
        .eq('id', subscriptionId);

      if (error) {
        console.error('❌ Error expiring subscription:', error);
      } else {
        console.log('✅ Subscription expired successfully');
      }
    } catch (error) {
      console.error('💥 Error in expireSubscription:', error);
    }
  }

  /**
   * Format remaining time until subscription expires
   */
  static getTimeUntilExpiry(expiryDate: string): string {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return 'Expired';
    } else if (diffDays === 1) {
      return '1 day left';
    } else if (diffDays < 30) {
      return `${diffDays} days left`;
    } else {
      const diffMonths = Math.floor(diffDays / 30);
      return diffMonths === 1 ? '1 month left' : `${diffMonths} months left`;
    }
  }
}