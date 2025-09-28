import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { supabase } from '../lib/supabase-client';
import { ProfileSymbolService } from '../services/ProfileSymbolService';

interface ProfileData {
  user_id: string;
  email: string;
  full_name: string;
  birth_date?: string | null;
  birth_time?: string | null;
  birth_location?: string | null;
  wants_premium?: boolean;
  wants_notifications?: boolean;
  agreed_to_terms?: boolean;
  onboarding_completed?: boolean;
}

interface ProfileContextType {
  profileData: ProfileData | null;
  loading: boolean;
  updateProfile: (updates: Partial<ProfileData>) => Promise<boolean>;
  updateProfileData: (updates: Partial<ProfileData>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  markOnboardingCompleted: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user?.id || !isLoaded) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfileData(data);
      } else {
        // Create initial profile if doesn't exist
        const newProfile: Partial<ProfileData> = {
          user_id: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          full_name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Beautiful Soul'
        };
        
        const { data: created, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (!createError && created) {
          setProfileData(created);
        }
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<ProfileData>): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      // Prepare the data for upsert - ensure full_name update is preserved
      const currentFullName = updates.full_name || profileData?.full_name || user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim();
      
      const profileUpdate = {
        user_id: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        full_name: currentFullName,
        ...updates,
        updated_at: new Date().toISOString()
      };

      console.log('🔄 Attempting to upsert profile:', profileUpdate);

      // Use upsert to either insert or update
      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileUpdate, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Update profile error:', error);
        console.error('📋 Profile data that failed:', profileUpdate);
        return false;
      }

      console.log('✅ Profile updated successfully:', data);

      // Calculate symbols automatically if birth_date or full_name changed
      if (updates.birth_date || updates.full_name) {
        console.log('🔮 Profile contains birth data, calculating symbols...');
        try {
          await ProfileSymbolService.calculateAndSaveSymbols(
            user.id,
            data.birth_date || updates.birth_date || '',
            data.full_name || updates.full_name || ''
          );
        } catch (symbolError) {
          console.log('Symbol calculation failed, but profile update succeeded:', symbolError);
        }
      }

      setProfileData(data);
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  const refreshProfile = async () => {
    setLoading(true);
    await fetchProfile();
  };

  const markOnboardingCompleted = async () => {
    if (!user?.id) return;
    
    try {
      await updateProfile({ onboarding_completed: true });
    } catch (error) {
      console.error('Error marking onboarding as completed:', error);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      fetchProfile();
    }
  }, [user, isLoaded]);

  // Alias for compatibility with numerology tab
  const updateProfileData = updateProfile;

  return (
    <ProfileContext.Provider value={{
      profileData,
      loading,
      updateProfile,
      updateProfileData,
      refreshProfile,
      markOnboardingCompleted
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}