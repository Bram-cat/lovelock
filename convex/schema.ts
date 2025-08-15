import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User subscriptions table
  subscriptions: defineTable({
    userId: v.string(),
    planId: v.string(),
    planName: v.string(),
    price: v.number(),
    period: v.string(), // 'month' | 'lifetime'
    status: v.string(), // 'active' | 'cancelled' | 'expired' | 'pending'
    paymentMethod: v.optional(v.string()),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()),
    cancelledAt: v.optional(v.number()),
    amount: v.number(), // Payment amount
    currency: v.string(), // Payment currency
    checkoutUrl: v.optional(v.string()), // Clerk billing portal URL
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_user_status", ["userId", "status"]),

  // User profiles table
  userProfiles: defineTable({
    userId: v.string(), // Clerk user ID
    email: v.string(),
    name: v.string(),
    photoURL: v.optional(v.string()),
    createdAt: v.number(),
    lastLoginAt: v.number(),
    preferences: v.optional(v.object({
      notifications: v.boolean(),
      theme: v.string(),
    })),
  })
    .index("by_user", ["userId"])
    .index("by_email", ["email"]),

  // Numerology readings history
  numerologyReadings: defineTable({
    userId: v.string(),
    type: v.string(), // 'compatibility' | 'personal' | 'name_analysis'
    input: v.object({
      name1: v.optional(v.string()),
      name2: v.optional(v.string()),
      birthDate1: v.optional(v.string()),
      birthDate2: v.optional(v.string()),
    }),
    result: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_type", ["userId", "type"]),

  // AI Entertainment sessions
  entertainmentSessions: defineTable({
    userId: v.string(),
    type: v.string(), // 'chat' | 'game' | 'story'
    content: v.string(),
    response: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_type", ["userId", "type"]),
});
