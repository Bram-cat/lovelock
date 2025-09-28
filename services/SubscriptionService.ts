// Subscription Service - Check user subscription status and track usage
import { supabase } from '../lib/supabase-client';

export interface SubscriptionStatus {
  isPremium: boolean;
  isUnlimited: boolean;
  isActive: boolean;
  subscriptionType: string;
  endsAt: string | null;
  daysRemaining: number;
}

export interface UsageStats {
  numerology: { used: number; limit: number };
  loveMatch: { used: number; limit: number };
  trustAssessment: { used: number; limit: number };
}

export class SubscriptionService {
  // Check if user has active subscription
  static async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    try {
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
        return this.getFreeUserStatus();
      }

      if (!subscription) {
        return this.getFreeUserStatus();
      }

      const now = new Date();
      const endsAt = new Date(subscription.ends_at);
      const daysRemaining = Math.max(0, Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

      return {
        isPremium: subscription.is_premium || false,
        isUnlimited: subscription.is_unlimited || false,
        isActive: now < endsAt,
        subscriptionType: subscription.subscription_type || 'free',
        endsAt: subscription.ends_at,
        daysRemaining
      };
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return this.getFreeUserStatus();
    }
  }

  private static getFreeUserStatus(): SubscriptionStatus {
    return {
      isPremium: false,
      isUnlimited: false,
      isActive: false,
      subscriptionType: 'free',
      endsAt: null,
      daysRemaining: 0
    };
  }

  // Get usage statistics for current month
  static async getUsageStats(userId: string): Promise<UsageStats> {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      // Get numerology readings count
      const { count: numerologyCount } = await supabase
        .from('numerology_readings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString());

      // Get love matches count
      const { count: loveMatchCount } = await supabase
        .from('love_matches')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString());

      // Get trust assessments count
      const { count: trustCount } = await supabase
        .from('trust_assessments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString());

      // Get subscription status to determine limits
      const subscription = await this.getSubscriptionStatus(userId);

      // Determine limits based on subscription tier (Unlimited takes priority over Premium)
      let limits;
      if (subscription.isUnlimited) {
        limits = { numerology: 999, loveMatch: 999, trustAssessment: 999 };
      } else if (subscription.isPremium) {
        limits = { numerology: 25, loveMatch: 15, trustAssessment: 10 };
      } else {
        limits = { numerology: 3, loveMatch: 2, trustAssessment: 1 };
      }

      return {
        numerology: { used: numerologyCount || 0, limit: limits.numerology },
        loveMatch: { used: loveMatchCount || 0, limit: limits.loveMatch },
        trustAssessment: { used: trustCount || 0, limit: limits.trustAssessment }
      };
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return {
        numerology: { used: 0, limit: 3 },
        loveMatch: { used: 0, limit: 2 },
        trustAssessment: { used: 0, limit: 1 }
      };
    }
  }

  // Track feature usage
  static async trackUsage(userId: string, feature: 'numerology' | 'love_match' | 'trust_assessment', data: any): Promise<boolean> {
    try {
      // Validate required parameters
      if (!userId || !feature || !data) {
        console.error('Missing required parameters for trackUsage');
        return false;
      }

      const subscription = await this.getSubscriptionStatus(userId);
      const usage = await this.getUsageStats(userId);

      // Check if user has reached their limit
      if (!subscription.isUnlimited) {
        const featureUsage = usage[feature === 'love_match' ? 'loveMatch' : feature === 'trust_assessment' ? 'trustAssessment' : 'numerology'];
        if (featureUsage.used >= featureUsage.limit) {
          console.log(`User ${userId} has reached ${feature} limit`);
          return false;
        }
      }

      // Record usage based on feature type
      let tableName = '';
      let recordData = {};

      switch (feature) {
        case 'numerology':
          tableName = 'numerology_readings';
          recordData = {
            user_id: userId,
            reading_type: data.readingType || 'standard',
            reading_data: data
          };
          break;
        case 'love_match':
          tableName = 'love_matches';
          recordData = {
            user_id: userId,
            partner_name: data.partnerName || 'Self Analysis',
            partner_birth_date: data.partnerBirthDate || null,
            compatibility_score: data.compatibilityScore || 0,
            match_details: data
          };
          break;
        case 'trust_assessment':
          tableName = 'trust_assessments';
          recordData = {
            user_id: userId,
            assessment_data: data,
            trust_score: data.trustScore || data.compatibilityScore || 0
          };
          break;
      }

      console.log(`📊 Tracking ${feature} usage for user ${userId}:`, recordData);

      const { error } = await supabase
        .from(tableName)
        .insert(recordData);

      if (error) {
        console.error(`❌ Error tracking ${feature} usage:`, error);
        console.error('Record data that failed:', recordData);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Error tracking ${feature} usage:`, error);
      return false;
    }
  }

  // Check if user can use a feature
  static async canUseFeature(userId: string, feature: 'numerology' | 'love_match' | 'trust_assessment'): Promise<boolean> {
    try {
      const subscription = await this.getSubscriptionStatus(userId);

      if (!subscription.isActive && subscription.subscriptionType === 'free') {
        // Free users have limited access
        const usage = await this.getUsageStats(userId);
        const featureUsage = usage[feature === 'love_match' ? 'loveMatch' : feature === 'trust_assessment' ? 'trustAssessment' : 'numerology'];
        return featureUsage.used < featureUsage.limit;
      }

      return subscription.isActive;
    } catch (error) {
      console.error('Error checking feature access:', error);
      return false;
    }
  }

  // Check if user has exceeded their limit and return subscription prompt
  static async checkUsageLimitWithPrompt(userId: string, feature: 'numerology' | 'love_match' | 'trust_assessment'): Promise<{
    canUse: boolean;
    showUpgradePrompt: boolean;
    promptConfig?: {
      title: string;
      message: string;
      featureName: string;
      usedCount: number;
      limitCount: number;
    }
  }> {
    try {
      const subscription = await this.getSubscriptionStatus(userId);
      const usage = await this.getUsageStats(userId);

      // If user has active premium or unlimited, they can use the feature
      if (subscription.isPremium || subscription.isUnlimited) {
        return { canUse: true, showUpgradePrompt: false };
      }

      // Check free user limits
      const featureUsage = usage[feature === 'love_match' ? 'loveMatch' : feature === 'trust_assessment' ? 'trustAssessment' : 'numerology'];
      const featureNames = {
        'numerology': 'Numerology Reading',
        'love_match': 'Love Match Analysis',
        'trust_assessment': 'Trust Assessment'
      };

      if (featureUsage.used >= featureUsage.limit) {
        return {
          canUse: false,
          showUpgradePrompt: true,
          promptConfig: {
            title: `${featureNames[feature]} Limit Reached`,
            message: `You've used all ${featureUsage.limit} of your free ${featureNames[feature].toLowerCase()} readings this month.\n\nUpgrade to continue accessing premium features:`,
            featureName: featureNames[feature],
            usedCount: featureUsage.used,
            limitCount: featureUsage.limit
          }
        };
      }

      return { canUse: true, showUpgradePrompt: false };

    } catch (error) {
      console.error('Error checking usage limit:', error);
      return { canUse: false, showUpgradePrompt: false };
    }
  }

  // Reset usage for new billing cycle or plan changes
  static async resetUsageCycle(userId: string, reason: 'billing_cycle' | 'plan_change' = 'billing_cycle'): Promise<boolean> {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      console.log(`🔄 Resetting usage cycle for user ${userId} - reason: ${reason}`);

      // Clear all usage data for the current month
      const deletePromises = [
        supabase
          .from('numerology_readings')
          .delete()
          .eq('user_id', userId)
          .gte('created_at', startOfMonth.toISOString()),

        supabase
          .from('love_match_readings')
          .delete()
          .eq('user_id', userId)
          .gte('created_at', startOfMonth.toISOString()),

        supabase
          .from('trust_assessments')
          .delete()
          .eq('user_id', userId)
          .gte('created_at', startOfMonth.toISOString())
      ];

      await Promise.all(deletePromises);

      // Log the reset event
      await supabase
        .from('usage_resets')
        .insert({
          user_id: userId,
          reset_reason: reason,
          reset_date: new Date().toISOString(),
          reset_month: startOfMonth.toISOString()
        });

      console.log(`✅ Usage cycle reset completed for user ${userId}`);
      return true;

    } catch (error) {
      console.error('Error resetting usage cycle:', error);
      return false;
    }
  }

  // Check if billing cycle should reset (call this periodically or on app start)
  static async checkAndResetBillingCycle(userId: string): Promise<boolean> {
    try {
      // Get the last reset date
      const { data: lastReset } = await supabase
        .from('usage_resets')
        .select('reset_date, reset_month')
        .eq('user_id', userId)
        .order('reset_date', { ascending: false })
        .limit(1)
        .single();

      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // If no reset record exists or it's a new month, reset the cycle
      if (!lastReset || new Date(lastReset.reset_month) < currentMonth) {
        return await this.resetUsageCycle(userId, 'billing_cycle');
      }

      return false; // No reset needed
    } catch (error) {
      console.error('Error checking billing cycle:', error);
      return false;
    }
  }

  // Reset usage for ALL users - run this monthly via cron job or scheduled function
  static async resetAllUsersMonthly(): Promise<void> {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      console.log(`🔄 Starting monthly reset for all users - ${startOfMonth.toISOString()}`);

      // Get all users who have usage data
      const { data: usersWithUsage } = await supabase
        .from('numerology_readings')
        .select('user_id')
        .gte('created_at', startOfMonth.toISOString());

      if (usersWithUsage) {
        const uniqueUserIds = [...new Set(usersWithUsage.map(u => u.user_id))];

        // Clear usage data for all users
        const deletePromises = [
          supabase
            .from('numerology_readings')
            .delete()
            .gte('created_at', startOfMonth.toISOString()),

          supabase
            .from('love_match_readings')
            .delete()
            .gte('created_at', startOfMonth.toISOString()),

          supabase
            .from('trust_assessments')
            .delete()
            .gte('created_at', startOfMonth.toISOString())
        ];

        await Promise.all(deletePromises);

        // Log the monthly reset for all users
        const resetRecords = uniqueUserIds.map(userId => ({
          user_id: userId,
          reset_reason: 'monthly_automatic',
          reset_date: new Date().toISOString(),
          reset_month: startOfMonth.toISOString()
        }));

        if (resetRecords.length > 0) {
          await supabase
            .from('usage_resets')
            .insert(resetRecords);
        }

        console.log(`✅ Monthly reset completed for ${uniqueUserIds.length} users`);
      }

    } catch (error) {
      console.error('Error in monthly reset for all users:', error);
    }
  }
}