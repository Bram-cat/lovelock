import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Define subscription plans
export const SUBSCRIPTION_PLANS = {
  basic: {
    name: 'Basic Plan',
    price: 4.99,
    period: 'month',
    features: ['10 Numerology questions/month', 'Basic compatibility', 'Email support']
  },
  premium: {
    name: 'Premium Plan', 
    price: 9.99,
    period: 'month',
    features: ['Unlimited questions', 'Advanced analysis', 'Priority support']
  },
  lifetime: {
    name: 'Lifetime Access',
    price: 49.99, 
    period: 'lifetime',
    features: ['Everything in Premium', 'Lifetime access', 'No recurring payments']
  }
};

// Create a subscription with Clerk billing
export const createSubscription = mutation({
  args: {
    planId: v.string(),
    userId: v.string(),
    email: v.string(),
  },
  handler: async (ctx, { planId, userId, email }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const clerkUserId = identity.subject;

    const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];
    if (!plan) {
      throw new Error("Invalid plan");
    }

    // Create an active subscription record (demo mode)
    const subscriptionId = await ctx.db.insert("subscriptions", {
      userId: clerkUserId,
      planId,
      planName: plan.name,
      price: plan.price,
      period: plan.period,
      status: "active", // Set to active for demo
      createdAt: Date.now(),
      amount: plan.price,
      currency: "USD",
      checkoutUrl: "", // Not needed for demo
    });

    return {
      subscriptionId,
      success: true,
      message: "Subscription activated successfully!",
    };
  },
});

// Get user's current subscription
export const getUserSubscription = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    const userId = identity.subject;

    const subscription = await ctx.db
      .query("subscriptions")
      .filter((q) => q.eq(q.field("userId"), userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    return subscription;
  },
});

// Cancel subscription
export const cancelSubscription = mutation({
  args: {
    subscriptionId: v.id("subscriptions"),
  },
  handler: async (ctx, { subscriptionId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    const subscription = await ctx.db.get(subscriptionId);
    if (!subscription || subscription.userId !== userId) {
      throw new Error("Subscription not found");
    }

    await ctx.db.patch(subscriptionId, {
      status: "cancelled",
      cancelledAt: Date.now(),
    });

    return { success: true };
  },
});

// Check if user has active subscription
export const hasActiveSubscription = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }
    const userId = identity.subject;

    const subscription = await ctx.db
      .query("subscriptions")
      .filter((q) => q.eq(q.field("userId"), userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!subscription) {
      return false;
    }

    // Check if subscription is still valid
    if (subscription.expiresAt && subscription.expiresAt < Date.now()) {
      // Mark as expired (using mutation context)
      return false;
    }

    return true;
  },
});

// Get subscription analytics (for admin)
export const getSubscriptionAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    const subscriptions = await ctx.db.query("subscriptions").collect();
    
    const analytics = {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: subscriptions.filter(s => s.status === "active").length,
      totalRevenue: subscriptions.reduce((sum, s) => sum + s.price, 0),
      planBreakdown: Object.keys(SUBSCRIPTION_PLANS).reduce((acc, planId) => {
        acc[planId] = subscriptions.filter(s => s.planId === planId).length;
        return acc;
      }, {} as Record<string, number>),
    };

    return analytics;
  },
});
