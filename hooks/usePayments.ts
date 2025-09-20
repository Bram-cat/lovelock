import { useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { Alert } from 'react-native';
import StripeService from '../services/StripeServices';
import * as Linking from 'expo-linking';

export function usePayments() {
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);

  const purchaseSubscription = async (tier: 'premium' | 'unlimited') => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to purchase a subscription');
      return;
    }

    setIsProcessing(true);

    try {
      const result = await StripeService.createCheckoutSession(
        user.id,
        user.emailAddresses[0]?.emailAddress || '',
        tier
      );

      if (result.success) {
        // Check if this requires web billing (Clerk B2C SaaS)
        if (result.requiresWebBilling && result.url) {
          // Show user-friendly guidance and redirect to website
          Alert.alert(
            '🌐 Redirecting to Secure Checkout',
            `You'll be redirected to our secure website to complete your ${tier === 'premium' ? 'Premium' : 'Unlimited'} subscription.\n\n✅ Your account is already linked\n✅ Secure payment processing\n✅ Return to app when done\n\nYour subscription will sync automatically!`,
            [
              {
                text: 'Cancel',
                style: 'cancel'
              },
              {
                text: 'Continue to Checkout',
                onPress: async () => {
                  try {
                    const supported = await Linking.canOpenURL(result.url!);
                    if (supported) {
                      await Linking.openURL(result.url!);
                    } else {
                      Alert.alert('Error', 'Unable to open the checkout page. Please try again.');
                    }
                  } catch (error) {
                    console.error('Error opening website:', error);
                    Alert.alert('Error', 'Unable to open the checkout page. Please try again.');
                  }
                }
              }
            ]
          );
          return { success: true, requiresWebBilling: true, url: result.url };
        }
        
        // Handle direct checkout URL if available
        if (result.url) {
          Alert.alert(
            'Redirecting to Checkout',
            `Opening ${tier} subscription checkout. Complete your payment and return to the app.`,
            [
              {
                text: 'Continue',
                onPress: async () => {
                  await Linking.openURL(result.url!);
                }
              }
            ]
          );
          return { success: true, url: result.url };
        }
      }
      
      // Handle errors
      throw new Error(result.error || 'Failed to process subscription request');
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert(
        'Payment Error',
        error instanceof Error ? error.message : 'Unable to process payment. Please try again.',
        [{ text: 'OK' }]
      );
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsProcessing(false);
    }
  };

  const openBillingPortal = async () => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to manage your subscription');
      return;
    }

    try {
      // For Clerk B2C SaaS billing, billing portal access should be handled through web app
      Alert.alert(
        '🌐 Web Portal Required',
        'Billing management is only available through our web app.\n\n📱 To manage your subscription:\n1. Visit our website on your computer or mobile browser\n2. Sign in with the same account\n3. Navigate to account settings\n\nYour subscription will sync automatically across all devices.',
        [{ text: 'Got it' }]
      );
    } catch (error) {
      console.error('Error with billing portal info:', error);
    }
  };

  const getSubscriptionPlans = () => {
    return [
      {
        id: 'premium',
        name: 'Premium',
        price: '$4.99/month',
        description: 'Perfect for regular users',
        features: [
          '50 numerology readings/month',
          '50 love matches/month', 
          '50 trust assessments/month',
          'Advanced AI insights',
          'Priority support'
        ],
        recommended: true
      },
      {
        id: 'unlimited',
        name: 'Unlimited',
        price: '$12.99/month',
        description: 'For power users',
        features: [
          'Unlimited numerology readings',
          'Unlimited love matches',
          'Unlimited trust assessments',
          'Premium AI insights',
          'Priority support',
          'Export capabilities',
          'Advanced analytics'
        ],
        recommended: false
      }
    ];
  };

  return {
    purchaseSubscription,
    openBillingPortal,
    getSubscriptionPlans,
    isProcessing,
    user
  };
}

// Hook for handling payment success/failure
export function usePaymentStatus() {
  const { user } = useUser();

  const handlePaymentSuccess = async (sessionId?: string) => {
    if (!user) return;

    try {
      // Refresh user data to get updated subscription info
      await user.reload();
      
      Alert.alert(
        'Payment Successful! 🎉',
        'Your subscription has been activated. You can now enjoy premium features!',
        [{ text: 'Great!' }]
      );
    } catch (error) {
      console.error('Error handling payment success:', error);
    }
  };

  const handlePaymentCancellation = () => {
    Alert.alert(
      'Payment Cancelled',
      'No charges were made. You can try again anytime.',
      [{ text: 'OK' }]
    );
  };

  const handlePaymentFailure = (error?: string) => {
    Alert.alert(
      'Payment Failed',
      error || 'There was an issue processing your payment. Please try again.',
      [{ text: 'OK' }]
    );
  };

  return {
    handlePaymentSuccess,
    handlePaymentCancellation,
    handlePaymentFailure
  };
}