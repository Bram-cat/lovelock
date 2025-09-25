import { Linking } from 'react-native';
import { supabase } from '../lib/supabase-client';

export interface SubscriptionTier {
  id: 'free' | 'premium' | 'unlimited';
  name: string;
  price: number;
  currency: string;
  interval: 'month';
  limits: {
    numerology: number;
    loveMatch: number;
    trustAssessment: number;
  };
  features: string[];
  stripePriceId?: string;
}

export interface UserSubscription {
  userId: string;
  tier: SubscriptionTier['id'];
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  usage: {
    numerology: number;
    loveMatch: number;
    trustAssessment: number;
  };
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export class StripeService {
  private static readonly STRIPE_PUBLIC_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  private static readonly STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  private static readonly BACKEND_URL = process.env.STRIPE_BACKEND_URL || 'https://api.lovelock.it.com';

  // Use Clerk's built-in billing instead of custom backend
  private static readonly USE_CLERK_BILLING = true;

  // Subscription tier definitions
  static readonly SUBSCRIPTION_TIERS: Record<SubscriptionTier['id'], SubscriptionTier> = {
    free: {
      id: 'free',
      name: 'Free',
      price: 0,
      currency: 'usd',
      interval: 'month',
      limits: {
        numerology: 3,
        loveMatch: 3,
        trustAssessment: 3,
      },
      features: [
        '3 numerology readings per month',
        '3 love matches per month',
        '3 trust assessments per month',
        'Basic insights',
      ],
    },
    premium: {
      id: 'premium',
      name: 'Premium',
      price: 4.99,
      currency: 'cad', // Updated to CAD based on your Stripe dashboard
      interval: 'month',
      limits: {
        numerology: 25,
        loveMatch: 10,
        trustAssessment: 15,
      },
      features: [
        '25 numerology readings per month',
        '10 love matches per month',
        '15 trust assessments per month',
        'Advanced AI insights',
        'Priority support',
        'Detailed reports',
      ],
      stripePriceId: process.env.EXPO_PUBLIC_STRIPE_PREMIUM_PRICE_ID,
    },
    unlimited: {
      id: 'unlimited',
      name: 'Unlimited',
      price: 12.99,
      currency: 'cad', // Updated to CAD based on your Stripe dashboard
      interval: 'month',
      limits: {
        numerology: -1, // -1 means unlimited
        loveMatch: -1,
        trustAssessment: -1,
      },
      features: [
        'Unlimited numerology readings',
        'Unlimited love matches',
        'Unlimited trust assessments',
        'Premium AI insights',
        'Priority support',
        'Detailed reports',
        'Export capabilities',
        'Advanced analytics',
      ],
      stripePriceId: process.env.EXPO_PUBLIC_STRIPE_UNLIMITED_PRICE_ID,
    },
  };

  /**
   * Get subscription tier information
   */
  static getSubscriptionTier(tierId: SubscriptionTier['id']): SubscriptionTier {
    return this.SUBSCRIPTION_TIERS[tierId];
  }

  /**
   * Get all available subscription tiers
   */
  static getAllSubscriptionTiers(): SubscriptionTier[] {
    return Object.values(this.SUBSCRIPTION_TIERS);
  }

  /**
   * Create a checkout session for subscription - SIMPLIFIED with Clerk Billing
   */
  static async createCheckoutSession(
    userId: string,
    userEmail: string,
    tierIdSelected: 'premium' | 'unlimited'
  ): Promise<{ success: boolean; url?: string; error?: string; requiresWebBilling?: boolean; websiteUrl?: string }> {
    try {
      const tier = this.SUBSCRIPTION_TIERS[tierIdSelected];
      
      if (!tier.stripePriceId) {
        return { 
          success: false, 
          error: `No Stripe price ID configured for ${tier.name} tier`
        };
      }

      if (this.USE_CLERK_BILLING) {
        // For Clerk B2C SaaS billing, use secure authentication flow
        // Note: This method should be deprecated in favor of direct SecureAuthService usage
        const websiteUrl = 'https://lovelock.it.com';

        return {
          success: true,
          requiresWebBilling: true,
          url: `${websiteUrl}/pricing`, // Fallback URL without sensitive parameters
          websiteUrl: websiteUrl,
          error: 'This method should use SecureAuthService for secure authentication'
        };
      } else {
        // COMPLEX: Use custom backend (your original code)
        const response = await fetch(`${this.BACKEND_URL}/stripe/create-checkout-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId: tier.stripePriceId,
            userId,
            userEmail,
            successUrl: 'lovelock://subscription-success',
            cancelUrl: 'lovelock://subscription-cancel',
          }),
        });

        const data = await response.json();

        if (data.success && data.url) {
          const supported = await Linking.canOpenURL(data.url);
          if (supported) {
            await Linking.openURL(data.url);
            return { success: true, url: data.url };
          } else {
            return { 
              success: false, 
              error: 'Cannot open Stripe checkout URL'
            };
          }
        } else {
          return { 
            success: false, 
            error: data.error || 'Failed to create checkout session'
          };
        }
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get user's current subscription from Supabase
   */
  static async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      console.log("🔍 StripeService: Getting subscription for user:", userId);

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("❌ StripeService: Error getting subscription:", error);
        return null;
      }

      if (!data) {
        console.log("📋 StripeService: No active subscription found, defaulting to free");
        return null;
      }

      // Check if subscription is still valid
      if (data.ends_at && new Date(data.ends_at) < new Date()) {
        console.log("⏰ StripeService: Subscription expired");
        return null;
      }

      // Map subscription_type to tier
      let tier: SubscriptionTier['id'] = "free";
      if (data.is_unlimited) {
        tier = "unlimited";
      } else if (data.is_premium) {
        tier = "premium";
      } else if (data.subscription_type === "premium") {
        tier = "premium";
      } else if (data.subscription_type === "unlimited") {
        tier = "unlimited";
      }

      // Get usage counts from individual tables
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const [numerologyResult, loveMatchResult, trustResult] = await Promise.all([
        supabase
          .from("numerology_readings")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .gte("created_at", startOfMonth)
          .lte("created_at", endOfMonth),
        supabase
          .from("love_matches")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .gte("created_at", startOfMonth)
          .lte("created_at", endOfMonth),
        supabase
          .from("trust_assessments")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .gte("created_at", startOfMonth)
          .lte("created_at", endOfMonth),
      ]);

      console.log("✅ StripeService: Active subscription found:", tier);
      return {
        userId: data.user_id,
        tier,
        status: data.status as any,
        currentPeriodStart: new Date(data.starts_at),
        currentPeriodEnd: new Date(data.ends_at || Date.now() + 30 * 24 * 60 * 60 * 1000),
        usage: {
          numerology: numerologyResult.count || 0,
          loveMatch: loveMatchResult.count || 0,
          trustAssessment: trustResult.count || 0,
        },
        stripeCustomerId: data.stripe_customer_id,
        stripeSubscriptionId: data.stripe_subscription_id,
      };
    } catch (error) {
      console.error("💥 StripeService: Unexpected error getting subscription:", error);
      return null;
    }
  }

  /**
   * Cancel user's subscription in Supabase
   */
  static async cancelSubscription(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("🔄 StripeService: Cancelling subscription for user:", userId);

      const { error } = await supabase
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("user_id", userId)
        .eq("status", "active");

      if (error) {
        console.error("❌ StripeService: Error cancelling subscription:", error);
        return { success: false, error: error.message };
      }

      console.log("✅ StripeService: Subscription cancelled successfully");
      return { success: true };
    } catch (error) {
      console.error('💥 StripeService: Error canceling subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check if user can access a feature based on their subscription and usage
   */
  static async canAccessFeature(
    userId: string,
    feature: 'numerology' | 'loveMatch' | 'trustAssessment'
  ): Promise<{ canUse: boolean; remaining: number; tier: SubscriptionTier['id']; message?: string }> {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      if (!subscription) {
        // User has no subscription, default to free tier
        const freeTier = this.SUBSCRIPTION_TIERS.free;
        const used = 0; // Default usage for new users
        const limit = freeTier.limits[feature];
        const remaining = Math.max(0, limit - used);
        
        return {
          canUse: remaining > 0,
          remaining,
          tier: 'free',
          message: remaining === 0 ? `You've reached your monthly limit of ${limit} ${feature} requests. Upgrade to Premium for more!` : undefined,
        };
      }

      const tier = this.SUBSCRIPTION_TIERS[subscription.tier];
      const used = subscription.usage[feature] || 0;
      const limit = tier.limits[feature];

      // Unlimited access
      if (limit === -1) {
        return {
          canUse: true,
          remaining: -1,
          tier: subscription.tier,
        };
      }

      const remaining = Math.max(0, limit - used);
      
      return {
        canUse: remaining > 0,
        remaining,
        tier: subscription.tier,
        message: remaining === 0 ? `You've reached your monthly limit of ${limit} ${feature} requests. Upgrade for more access!` : undefined,
      };
    } catch (error) {
      console.error('Error checking feature access:', error);
      // Default to free tier with no usage on error
      return {
        canUse: true,
        remaining: this.SUBSCRIPTION_TIERS.free.limits[feature],
        tier: 'free',
      };
    }
  }

  /**
   * Record feature usage in Supabase
   */
  static async recordUsage(
    userId: string,
    feature: 'numerology' | 'loveMatch' | 'trustAssessment',
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`📝 StripeService: Recording ${feature} usage for user:`, userId);

      // Record usage in the appropriate feature table
      let insertResult;
      switch (feature) {
        case "numerology":
          insertResult = await supabase.from("numerology_readings").insert({
            user_id: userId,
            reading_type: metadata?.reading_type || "general",
            reading_data: metadata || {},
          });
          break;
        case "loveMatch":
          insertResult = await supabase.from("love_matches").insert({
            user_id: userId,
            partner_name: metadata?.partner_name || "Unknown",
            partner_birth_date: metadata?.partner_birth_date,
            compatibility_score: metadata?.compatibility_score || 0,
            match_details: metadata || {},
          });
          break;
        case "trustAssessment":
          insertResult = await supabase.from("trust_assessments").insert({
            user_id: userId,
            assessment_data: metadata || {},
            trust_score: metadata?.trust_score || 0,
          });
          break;
      }

      if (insertResult?.error) {
        console.error(`❌ StripeService: Error recording ${feature} usage:`, insertResult.error);
        return { success: false, error: insertResult.error.message };
      }

      console.log(`✅ StripeService: ${feature} usage recorded successfully`);
      return { success: true };
    } catch (error) {
      console.error('💥 StripeService: Error recording usage:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get usage statistics for user
   */
  static async getUsageStats(userId: string): Promise<{
    tier: SubscriptionTier['id'];
    usage: { numerology: number; loveMatch: number; trustAssessment: number };
    limits: { numerology: number; loveMatch: number; trustAssessment: number };
    periodEnd: Date;
  } | null> {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      if (!subscription) {
        const freeTier = this.SUBSCRIPTION_TIERS.free;
        return {
          tier: 'free',
          usage: { numerology: 0, loveMatch: 0, trustAssessment: 0 },
          limits: freeTier.limits,
          periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        };
      }

      const tier = this.SUBSCRIPTION_TIERS[subscription.tier];
      
      return {
        tier: subscription.tier,
        usage: subscription.usage,
        limits: tier.limits,
        periodEnd: subscription.currentPeriodEnd,
      };
    } catch (error) {
      console.error('Error fetching usage stats:', error);
      return null;
    }
  }

  /**
   * Create direct purchase link (alternative to checkout session)
   */
  static createDirectPurchaseLink(tierIdSelected: 'premium' | 'unlimited', userId?: string): string {
    const tier = this.SUBSCRIPTION_TIERS[tierIdSelected];
    
    if (tierIdSelected === 'premium') {
      // Use the existing Stripe payment link from .env
      const baseUrl = process.env.STRIPE_PAYMENT_URL || 'https://buy.stripe.com/00w14maCh2ww7yp7Eafbq00';
      return userId ? `${baseUrl}?client_reference_id=${userId}` : baseUrl;
    }
    
    // For unlimited, you'd need to create a payment link in Stripe dashboard
    return `https://buy.stripe.com/unlimited-tier?client_reference_id=${userId || ''}`;
  }

  /**
   * Restore purchases (for users who already have active subscriptions)
   */
  static async restorePurchases(userId: string): Promise<{ success: boolean; subscription?: UserSubscription; error?: string }> {
    try {
      console.log("🔄 StripeService: Restoring purchases for user:", userId);

      const subscription = await this.getUserSubscription(userId);

      if (subscription) {
        console.log("✅ StripeService: Active subscription found during restore");
        return {
          success: true,
          subscription,
        };
      }

      console.log("📋 StripeService: No active subscription found to restore");
      return {
        success: true,
        subscription: undefined,
      };
    } catch (error) {
      console.error('💥 StripeService: Error restoring purchases:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export default StripeService;