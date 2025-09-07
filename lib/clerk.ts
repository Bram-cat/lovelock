import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { TokenCache } from '@clerk/clerk-expo/dist/cache';

// Token cache implementation for Clerk
const createTokenCache = (): TokenCache => {
  return {
    async getToken(key: string) {
      try {
        const item = await SecureStore.getItemAsync(key);
        if (item) {
          console.log(`🔐 Retrieved token for ${key} from SecureStore`);
        } else {
          console.log(`🔐 No token found for ${key}`);
        }
        return item;
      } catch (error) {
        console.error(`🔐 Error retrieving token for ${key}:`, error);
        return null;
      }
    },
    async saveToken(key: string, value: string) {
      try {
        await SecureStore.setItemAsync(key, value);
        console.log(`🔐 Saved token for ${key} to SecureStore`);
      } catch (error) {
        console.error(`🔐 Error saving token for ${key}:`, error);
      }
    },
  };
};

export const tokenCache = Platform.OS !== 'web' ? createTokenCache() : undefined;

export const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Please check your environment variables.'
  );
}

console.log('🔧 Clerk publishable key:', publishableKey?.substring(0, 20) + '...');