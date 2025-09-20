import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

/**
 * Hook to handle deep links from the website back to the app
 * Handles payment success/failure callbacks
 */
export function useDeepLinking() {
  const router = useRouter();

  useEffect(() => {
    // Handle initial URL if app was opened from a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Handle deep links while app is running
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  const handleDeepLink = (url: string) => {
    try {
      const { hostname, pathname, queryParams } = Linking.parse(url);

      console.log('Deep link received:', { hostname, pathname, queryParams });

      // Handle payment success from website
      if (pathname === '/payment-success') {
        const { tier, sessionId } = queryParams as { tier?: string; sessionId?: string };

        Alert.alert(
          '🎉 Payment Successful!',
          `Your ${tier === 'premium' ? 'Premium' : 'Unlimited'} subscription is now active!\n\nEnjoy your enhanced cosmic experience!`,
          [
            {
              text: 'Start Exploring',
              onPress: () => {
                // Navigate to home and refresh subscription status
                router.push('/(tabs)/');
              }
            }
          ]
        );
      }

      // Handle payment cancellation from website
      else if (pathname === '/payment-cancelled') {
        Alert.alert(
          'Payment Cancelled',
          'No charges were made. You can upgrade anytime from your profile.',
          [
            {
              text: 'OK',
              onPress: () => {
                router.push('/(tabs)/profile');
              }
            }
          ]
        );
      }

      // Handle payment failure from website
      else if (pathname === '/payment-failed') {
        const { error } = queryParams as { error?: string };

        Alert.alert(
          'Payment Failed',
          error || 'There was an issue processing your payment. Please try again.',
          [
            {
              text: 'Try Again',
              onPress: () => {
                router.push('/(tabs)/profile');
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error handling deep link:', error);
    }
  };

  return {
    handleDeepLink
  };
}