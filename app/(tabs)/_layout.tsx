import { Tabs, Redirect } from "expo-router";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useUserSync } from "../../lib/user-sync";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { ProfileProvider, useProfile } from "../../contexts/ProfileContext";
import { AlertProvider, useAlert, setGlobalAlertInstance } from "../../contexts/AlertContext";
import { DesignSystem } from "../../constants/DesignSystem";
import OnboardingScreen from "../../components/OnboardingScreen";
import { StripeService } from "../../services/StripeService";

// Wrapper component that uses the profile context
function TabsWithOnboarding() {
  const { profileData, loading, markOnboardingCompleted } = useProfile();
  const { user } = useUser();
  const alertContext = useAlert();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Set global alert instance on mount
  React.useEffect(() => {
    setGlobalAlertInstance(alertContext);
  }, [alertContext]);

  useEffect(() => {
    // Show onboarding if profile exists but onboarding hasn't been completed
    if (!loading && profileData && !profileData.onboarding_completed) {
      setShowOnboarding(true);
    }
  }, [profileData, loading]);

  const handleOnboardingComplete = async () => {
    await markOnboardingCompleted();
    setShowOnboarding(false);
  };

  const handleUpgradeToPremium = async () => {
    try {
      if (!user) {
        alertContext.showError('Error', 'Please sign in to upgrade to premium');
        return;
      }

      const result = await StripeService.createCheckoutSession(
        user.id,
        user.emailAddresses[0]?.emailAddress || '',
        'subscription'
      );

      if (result.error) {
        alertContext.showError('Error', `Failed to create checkout session: ${result.error}`);
      } else if (result.url) {
        // Open Stripe checkout in browser
        await StripeService.redirectToCheckout(result.url);
        // Mark onboarding as completed after attempting to start checkout
        await markOnboardingCompleted();
        setShowOnboarding(false);
      }
    } catch (error) {
      alertContext.showError('Error', 'Something went wrong. Please try again.');
      console.error('Premium upgrade error:', error);
    }
  };

  return (
    <>
      <OnboardingScreen 
        visible={showOnboarding}
        onComplete={handleOnboardingComplete}
        onUpgradeToPremium={handleUpgradeToPremium}
      />
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: DesignSystem.colors.primary.solidPurple,
            tabBarInactiveTintColor: DesignSystem.colors.text.muted,
            tabBarStyle: {
              backgroundColor: 'rgba(0, 0, 0, 0.95)',
              borderTopColor: 'rgba(124, 58, 237, 0.3)',
              borderTopWidth: 1,
              height: DesignSystem.components.tabBar.height,
              paddingTop: DesignSystem.spacing.scale.sm,
              paddingBottom: DesignSystem.spacing.scale['3xl'],
              ...DesignSystem.shadows.glow,
              position: 'absolute' as const,
              backdropFilter: 'blur(20px)',
            },
            headerStyle: {
              backgroundColor: DesignSystem.colors.backgrounds.dark,
              borderBottomWidth: 0,
              shadowOpacity: 0,
            },
            headerTintColor: DesignSystem.colors.text.primary,
            headerTitleStyle: {
              fontSize: DesignSystem.typography.sizes.lg,
              fontWeight: DesignSystem.typography.weights.semibold,
            },
            tabBarLabelStyle: {
              fontSize: DesignSystem.components.tabBar.item.labelSize,
              fontWeight: DesignSystem.typography.weights.semibold,
              marginTop: DesignSystem.spacing.scale.xs,
            },
            tabBarIconStyle: {
              marginTop: DesignSystem.spacing.scale.xs,
            },
            tabBarItemStyle: {
              paddingVertical: DesignSystem.spacing.scale.sm,
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="numerology"
            options={{
              title: 'Numbers',
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? 'calculator' : 'calculator-outline'} size={24} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="love-match"
            options={{
              title: 'Love',
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? 'heart' : 'heart-outline'} size={24} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="trust-assessment"
            options={{
              title: 'Trust',
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? 'shield' : 'shield-outline'} size={24} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
              ),
            }}
          />
        </Tabs>
    </>
  );
}

export default function TabLayout() {
  // Sync user with Supabase when they access the tabs
  useUserSync();

  return (
    <>
      <SignedIn>
        <AlertProvider>
          <ProfileProvider>
            <TabsWithOnboarding />
          </ProfileProvider>
        </AlertProvider>
      </SignedIn>
      <SignedOut>
        <Redirect href="/(auth)/sign-in" />
      </SignedOut>
    </>
  );
}