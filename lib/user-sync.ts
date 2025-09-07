import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { useSupabaseClient } from './supabase-client';

interface UserProfile {
  user_id: string;  // Clerk user ID - MUST be VARCHAR/TEXT in Supabase, NOT UUID!
  email: string;
  full_name: string;
  birth_date?: string;
  birth_time?: string;
  birth_location?: string;
  wants_premium?: boolean;
  wants_notifications?: boolean;
  agreed_to_terms?: boolean;
  created_at?: string;
  updated_at?: string;
}

export function useUserSync() {
  const { user, isLoaded } = useUser();
  const supabase = useSupabaseClient();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const syncUserProfile = async () => {
      try {
        console.log('👤 Syncing user profile to Supabase:', user.id);

        // Convert Clerk user ID to a format compatible with UUID if needed
        const userId = user.id;
        console.log('👤 Clerk User ID format:', userId, typeof userId);

        const profileData: Partial<UserProfile> = {
          user_id: userId,  // Clerk user ID as string
          email: user.emailAddresses[0]?.emailAddress || '',
          full_name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
          updated_at: new Date().toISOString(),
        };

        console.log('👤 Profile data to sync:', profileData);

        // First, try to get existing profile
        const { data: existingProfile, error: selectError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)  // Query by user_id to match schema
          .single();

        if (selectError && selectError.code !== 'PGRST116') {
          if (selectError.code === '22P02') {
            console.error('🔴 DATABASE SCHEMA ERROR: user_id field is UUID but Clerk sends strings!');
            console.error('🔴 FIX: Change user_id column from UUID to VARCHAR in Supabase');
            console.error('🔴 SQL: ALTER TABLE profiles ALTER COLUMN user_id TYPE VARCHAR USING user_id::text;');
          }
          console.error('🔴 Error checking existing profile:', selectError);
          return;
        }

        if (existingProfile) {
          // Update existing profile but preserve user-set names
          console.log('👤 Updating existing profile');
          
          // Only update full_name if it's currently 'Unknown User' or empty
          const shouldUpdateName = !existingProfile.full_name || 
                                 existingProfile.full_name === 'Unknown User' || 
                                 existingProfile.full_name.trim() === '';
          
          const updateData = {
            email: profileData.email,
            updated_at: profileData.updated_at,
            ...(shouldUpdateName && { full_name: profileData.full_name })
          };

          const { error: updateError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('user_id', user.id);

          if (updateError) {
            console.error('🔴 Error updating profile:', updateError);
          } else {
            console.log('✅ Profile updated successfully', shouldUpdateName ? 'with name update' : 'preserving existing name');
          }
        } else {
          // Create new profile
          console.log('👤 Creating new profile');
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([{
              ...profileData,
              created_at: new Date().toISOString(),
            }]);

          if (insertError) {
            console.error('🔴 Error creating profile:', insertError);
          } else {
            console.log('✅ Profile created successfully');
          }
        }
      } catch (error) {
        console.error('🔴 User sync error:', error);
      }
    };

    // Sync profile on component mount and when user data changes
    syncUserProfile();
  }, [user, isLoaded, supabase]);
}