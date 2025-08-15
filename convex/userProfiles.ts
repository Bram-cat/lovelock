import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create or update user profile
export const createOrUpdateUserProfile = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    photoURL: v.optional(v.string()),
  },
  handler: async (ctx, { email, name, photoURL }) => {
    // Get Clerk user ID from the authentication context
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const userId = identity.subject;

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("userProfiles")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (existingProfile) {
      // Update existing profile
      await ctx.db.patch(existingProfile._id, {
        email,
        name,
        photoURL,
        lastLoginAt: Date.now(),
      });
      return existingProfile._id;
    } else {
      // Create new profile
      const profileId = await ctx.db.insert("userProfiles", {
        userId: userId,
        email,
        name,
        photoURL,
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
        preferences: {
          notifications: true,
          theme: "light",
        },
      });
      return profileId;
    }
  },
});

// Get user profile
export const getUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    
    const userId = identity.subject;

    const profile = await ctx.db
      .query("userProfiles")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    return profile;
  },
});

// Update user preferences
export const updateUserPreferences = mutation({
  args: {
    preferences: v.object({
      notifications: v.boolean(),
      theme: v.string(),
    }),
  },
  handler: async (ctx, { preferences }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const userId = identity.subject;

    const profile = await ctx.db
      .query("userProfiles")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!profile) {
      throw new Error("Profile not found");
    }

    await ctx.db.patch(profile._id, {
      preferences,
    });

    return { success: true };
  },
});

// Delete user profile
export const deleteUserProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const userId = identity.subject;

    const profile = await ctx.db
      .query("userProfiles")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (profile) {
      await ctx.db.delete(profile._id);
    }

    // Also delete related data
    const subscriptions = await ctx.db
      .query("subscriptions")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    for (const subscription of subscriptions) {
      await ctx.db.delete(subscription._id);
    }

    const readings = await ctx.db
      .query("numerologyReadings")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    for (const reading of readings) {
      await ctx.db.delete(reading._id);
    }

    const sessions = await ctx.db
      .query("entertainmentSessions")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }

    return { success: true };
  },
});
