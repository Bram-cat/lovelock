import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/clerk-expo';
import { useMemo } from 'react';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

console.log('🔧 Supabase URL:', supabaseUrl);
console.log('🔧 Supabase Anon Key:', supabaseAnonKey.substring(0, 20) + '...');

// Default Supabase client for unauthenticated operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Custom hook to create authenticated Supabase client
export function useSupabaseClient() {
  const { getToken } = useAuth();

  return useMemo(() => {
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        // Custom fetch function that includes Clerk token
        fetch: async (url, options = {}) => {
          try {
            // Try to get Clerk token, but don't require 'supabase' template
            const clerkToken = await getToken();
            
            const headers = new Headers(options?.headers);
            if (clerkToken) {
              headers.set('Authorization', `Bearer ${clerkToken}`);
              console.log('🔐 Added Clerk token to Supabase request');
            } else {
              console.log('⚠️ No Clerk token available for Supabase request');
            }

            return fetch(url, {
              ...options,
              headers,
            });
          } catch (error) {
            console.error('🔴 Error getting Clerk token for Supabase:', error);
            return fetch(url, options);
          }
        },
      },
      auth: {
        // Disable Supabase auth since we're using Clerk
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  }, [getToken]);
}