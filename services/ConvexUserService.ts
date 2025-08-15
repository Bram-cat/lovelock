import { ConvexReactClient } from "convex/react";
import { api } from "../../convex/_generated/api";

// Initialize Convex client
const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

export interface UserProfile {
  _id: string;
  userId: string;
  email: string;
  name: string;
  photoURL?: string;
  createdAt: number;
  lastLoginAt: number;
  preferences?: {
    notifications: boolean;
    theme: string;
  };
}

export interface UserPreferences {
  notifications: boolean;
  theme: string;
}

export class ConvexUserService {
  private static instance: ConvexUserService;

  static getInstance(): ConvexUserService {
    if (!ConvexUserService.instance) {
      ConvexUserService.instance = new ConvexUserService();
    }
    return ConvexUserService.instance;
  }

  // Create or update user profile
  async createOrUpdateUserProfile(
    email: string,
    name: string,
    photoURL?: string
  ): Promise<{ success: boolean; error?: string; profileId?: string }> {
    try {
      console.log('🔄 ConvexUserService: Creating/updating user profile...', { email, name });
      
      const profileId = await convex.mutation(api.userProfiles.createOrUpdateUserProfile, {
        email,
        name,
        photoURL,
      });

      console.log('✅ ConvexUserService: Profile created/updated successfully', { profileId });
      return {
        success: true,
        profileId,
      };
    } catch (error) {
      console.error('❌ ConvexUserService: Failed to create/update profile', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create/update profile',
      };
    }
  }

  // Get user profile
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      console.log('🔄 ConvexUserService: Getting user profile...');
      
      const profile = await convex.query(api.userProfiles.getUserProfile);
      
      console.log('✅ ConvexUserService: Retrieved user profile', profile);
      return profile;
    } catch (error) {
      console.error('❌ ConvexUserService: Failed to get user profile', error);
      return null;
    }
  }

  // Update user preferences
  async updateUserPreferences(
    preferences: UserPreferences
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔄 ConvexUserService: Updating user preferences...', preferences);
      
      await convex.mutation(api.userProfiles.updateUserPreferences, {
        preferences,
      });

      console.log('✅ ConvexUserService: Preferences updated successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ ConvexUserService: Failed to update preferences', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update preferences',
      };
    }
  }

  // Delete user profile and all related data
  async deleteUserProfile(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔄 ConvexUserService: Deleting user profile...');
      
      await convex.mutation(api.userProfiles.deleteUserProfile);

      console.log('✅ ConvexUserService: Profile deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ ConvexUserService: Failed to delete profile', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete profile',
      };
    }
  }

  // Sync Clerk user data with Convex
  async syncClerkUser(clerkUser: {
    id: string;
    email: string;
    name: string;
    photoURL?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔄 ConvexUserService: Syncing Clerk user with Convex...', clerkUser);
      
      const result = await this.createOrUpdateUserProfile(
        clerkUser.email,
        clerkUser.name,
        clerkUser.photoURL
      );

      if (result.success) {
        console.log('✅ ConvexUserService: Clerk user synced successfully');
        return { success: true };
      } else {
        return result;
      }
    } catch (error) {
      console.error('❌ ConvexUserService: Failed to sync Clerk user', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sync user data',
      };
    }
  }
}

// Export singleton instance
export const convexUserService = ConvexUserService.getInstance();
export default ConvexUserService;
