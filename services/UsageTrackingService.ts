// Usage Tracking Service for Premium Subscription Management
import { supabase } from '../lib/supabase-client';

export interface UsageStats {
  userId: string;
  numerologyUsage: number;
  loveMatchUsage: number;
  trustAssessmentUsage: number;
  totalUsage: number;
  lastUsedDate: string;
  resetDate: string;
  isPremium: boolean;
}

export class UsageTrackingService {
  private static readonly FREE_USAGE_LIMIT = 5;
  private static readonly USAGE_RESET_DAYS = 30; // Reset every 30 days

  // Get user's current usage stats
  static async getUserUsage(userId: string): Promise<UsageStats | null> {
    try {
      const { data, error } = await supabase
        .from('user_usage')
        .select(`
          user_id,
          numerology_usage,
          love_match_usage,
          trust_assessment_usage,
          last_used_date,
          reset_date,
          created_at
        `)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching usage stats:', error);
        return null;
      }

      // Check if user is premium
      const { data: profileData } = await supabase
        .from('profiles')
        .select('wants_premium')
        .eq('user_id', userId)
        .single();

      const isPremium = profileData?.wants_premium || false;

      if (!data) {
        // Create initial usage record
        return await this.initializeUsage(userId, isPremium);
      }

      const totalUsage = (data.numerology_usage || 0) + (data.love_match_usage || 0) + (data.trust_assessment_usage || 0);

      return {
        userId: data.user_id,
        numerologyUsage: data.numerology_usage || 0,
        loveMatchUsage: data.love_match_usage || 0,
        trustAssessmentUsage: data.trust_assessment_usage || 0,
        totalUsage,
        lastUsedDate: data.last_used_date || new Date().toISOString(),
        resetDate: data.reset_date || new Date().toISOString(),
        isPremium
      };

    } catch (error) {
      console.error('Error in getUserUsage:', error);
      return null;
    }
  }

  // Initialize usage tracking for new user
  private static async initializeUsage(userId: string, isPremium: boolean): Promise<UsageStats> {
    const now = new Date();
    const resetDate = new Date(now.getTime() + (this.USAGE_RESET_DAYS * 24 * 60 * 60 * 1000));

    const initialUsage: UsageStats = {
      userId,
      numerologyUsage: 0,
      loveMatchUsage: 0,
      trustAssessmentUsage: 0,
      totalUsage: 0,
      lastUsedDate: now.toISOString(),
      resetDate: resetDate.toISOString(),
      isPremium
    };

    try {
      const { error } = await supabase
        .from('user_usage')
        .insert({
          user_id: userId,
          numerology_usage: 0,
          love_match_usage: 0,
          trust_assessment_usage: 0,
          last_used_date: now.toISOString(),
          reset_date: resetDate.toISOString()
        });

      if (error) {
        console.error('Error initializing usage:', error);
      }
    } catch (error) {
      console.error('Error in initializeUsage:', error);
    }

    return initialUsage;
  }

  // Check if user can use a specific feature
  static async canUseFeature(userId: string, featureType: 'numerology' | 'love_match' | 'trust_assessment'): Promise<{
    canUse: boolean;
    usageCount: number;
    remainingUses: number;
    isPremium: boolean;
    message?: string;
  }> {
    const usage = await this.getUserUsage(userId);
    
    if (!usage) {
      return {
        canUse: false,
        usageCount: 0,
        remainingUses: 0,
        isPremium: false,
        message: 'Unable to check usage. Please try again.'
      };
    }

    // Premium users have unlimited access
    if (usage.isPremium) {
      return {
        canUse: true,
        usageCount: 0,
        remainingUses: -1, // -1 indicates unlimited
        isPremium: true
      };
    }

    // Check if usage needs to be reset
    const now = new Date();
    const resetDate = new Date(usage.resetDate);
    if (now > resetDate) {
      await this.resetUsage(userId);
      return {
        canUse: true,
        usageCount: 0,
        remainingUses: this.FREE_USAGE_LIMIT,
        isPremium: false,
        message: 'Usage limit reset! You have 5 new uses this month.'
      };
    }

    const currentUsage = this.getFeatureUsage(usage, featureType);
    const canUse = currentUsage < this.FREE_USAGE_LIMIT;
    const remainingUses = Math.max(0, this.FREE_USAGE_LIMIT - currentUsage);

    return {
      canUse,
      usageCount: currentUsage,
      remainingUses,
      isPremium: false,
      message: canUse ? undefined : 'You\'ve reached your free usage limit. Upgrade to Premium for unlimited access!'
    };
  }

  // Track feature usage
  static async trackUsage(userId: string, featureType: 'numerology' | 'love_match' | 'trust_assessment'): Promise<boolean> {
    try {
      const canUseResult = await this.canUseFeature(userId, featureType);
      
      if (!canUseResult.canUse && !canUseResult.isPremium) {
        return false;
      }

      // Don't track usage for premium users
      if (canUseResult.isPremium) {
        return true;
      }

      const columnName = `${featureType}_usage`;
      
      const { error } = await supabase
        .from('user_usage')
        .update({
          [columnName]: supabase.raw(`${columnName} + 1`),
          last_used_date: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error tracking usage:', error);
        return false;
      }

      console.log(`✅ Usage tracked for ${featureType}: ${userId}`);
      return true;

    } catch (error) {
      console.error('Error in trackUsage:', error);
      return false;
    }
  }

  // Reset usage for a user
  private static async resetUsage(userId: string): Promise<void> {
    const now = new Date();
    const nextResetDate = new Date(now.getTime() + (this.USAGE_RESET_DAYS * 24 * 60 * 60 * 1000));

    try {
      const { error } = await supabase
        .from('user_usage')
        .update({
          numerology_usage: 0,
          love_match_usage: 0,
          trust_assessment_usage: 0,
          reset_date: nextResetDate.toISOString(),
          last_used_date: now.toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error resetting usage:', error);
      } else {
        console.log('✅ Usage reset for user:', userId);
      }
    } catch (error) {
      console.error('Error in resetUsage:', error);
    }
  }

  // Get usage count for specific feature
  private static getFeatureUsage(usage: UsageStats, featureType: 'numerology' | 'love_match' | 'trust_assessment'): number {
    switch (featureType) {
      case 'numerology':
        return usage.numerologyUsage;
      case 'love_match':
        return usage.loveMatchUsage;
      case 'trust_assessment':
        return usage.trustAssessmentUsage;
      default:
        return 0;
    }
  }

  // Get remaining days until usage reset
  static getDaysUntilReset(resetDate: string): number {
    const now = new Date();
    const reset = new Date(resetDate);
    const diffTime = reset.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  // Get premium upgrade message
  static getPremiumUpgradeMessage(featureType: 'numerology' | 'love_match' | 'trust_assessment', remainingDays: number): string {
    const featureNames = {
      numerology: 'Numerology Readings',
      love_match: 'Love Compatibility',
      trust_assessment: 'Trust Assessments'
    };

    return `🔓 Unlock unlimited ${featureNames[featureType]} with Premium! ${remainingDays > 0 ? `Free usage resets in ${remainingDays} days.` : 'Upgrade now for instant access!'}`;
  }
}