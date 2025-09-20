import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { Redirect, Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import OnboardingScreen from "../../components/OnboardingScreen";
import { DesignSystem } from "../../constants/DesignSystem";
import {
  AlertProvider,
  setGlobalAlertInstance,
  useAlert,
} from "../../contexts/AlertContext";
import { ProfileProvider, useProfile } from "../../contexts/ProfileContext";
import { useUserSync } from "../../lib/user-sync";
import { SubscriptionService } from "../../services/SubscriptionService";
import { useDeepLinking } from "../../hooks/useDeepLinking";

// Wrapper component that uses the profile context
function TabsWithOnboarding() {
  const { profileData, loading, markOnboardingCompleted, refreshProfile } = useProfile();
  const { user } = useUser();
  const alertContext = useAlert();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<{isPremium: boolean} | null>(null);

  // Initialize deep linking for payment callbacks
  useDeepLinking();

  // Set global alert instance on mount
  React.useEffect(() => {
    setGlobalAlertInstance(alertContext);
  }, [alertContext]);

  // Payment status is now handled by the Clerk subscription hook
  // No need for separate payment status checking
  React.useEffect(() => {
    // Default to free plan - subscription status is handled by useSubscription hook
    setPaymentStatus({ isPremium: false });
  }, [user?.id]);

  useEffect(() => {
    // Temporarily disable onboarding to fix navigation issues
    // Show onboarding if profile exists but onboarding hasn't been completed
    // if (!loading && profileData && !profileData.onboarding_completed) {
    //   setShowOnboarding(true);
    // }
  }, [profileData, loading]);

  const handleOnboardingComplete = async () => {
    await markOnboardingCompleted();
    setShowOnboarding(false);
  };

  const handleUpgradeToPremium = async () => {
    try {
      if (!user) {
        alertContext.showError("Error", "Please sign in to upgrade to premium");
        return;
      }

      // For Clerk B2C SaaS billing, direct users to use the pricing page
      alertContext.showError(
        "🌐 Web Upgrade Required",
        "Premium upgrades are available through our web app.\n\nTo upgrade:\n1. Visit our website\n2. Sign in with the same account\n3. Choose your plan\n\nYour subscription will sync automatically!"
      );
      
      // Complete onboarding anyway
      await markOnboardingCompleted();
      setShowOnboarding(false);
    } catch (error) {
      alertContext.showError(
        "Error",
        "Something went wrong. Please try again."
      );
      console.error("Premium upgrade error:", error);
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
        tabBar={({ state, descriptors, navigation }) => (
          <BlurView
            intensity={95}
            tint="dark"
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: "rgba(0, 0, 0, 0.95)",
              borderTopWidth: 0.5,
              borderTopColor: "rgba(255, 255, 255, 0.1)",
              paddingTop: 8,
              paddingBottom: 34,
              paddingHorizontal: 0,
            }}
          >
            <BottomTabBar
              state={state}
              descriptors={descriptors}
              navigation={navigation}
              insets={{ top: 0, right: 0, bottom: 0, left: 0 }}
            />
          </BlurView>
        )}
        screenOptions={{
          tabBarActiveTintColor: "#FFFFFF",
          tabBarInactiveTintColor: "rgba(255, 255, 255, 0.5)",
          tabBarStyle: {
            backgroundColor: "transparent",
            borderTopWidth: 0,
            height: 80,
            paddingTop: 0,
            paddingBottom: 0,
            position: "absolute" as const,
          },
          headerStyle: {
            backgroundColor: "#000000",
            borderBottomWidth: 0,
            shadowOpacity: 0,
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: "700",
            color: "#FFFFFF",
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "500",
            marginTop: 4,
            letterSpacing: 0.2,
          },
          tabBarIconStyle: {
            marginBottom: 0,
          },
          tabBarItemStyle: {
            paddingVertical: 8,
            marginHorizontal: 0,
            position: 'relative',
            height: 60,
            justifyContent: 'center',
            alignItems: 'center',
          },
          tabBarBackground: () => null,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                {focused && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -12,
                      left: -20,
                      right: -20,
                      bottom: -12,
                      borderRadius: 20,
                      backgroundColor: 'rgba(147, 51, 234, 0.15)',
                      borderWidth: 1,
                      borderColor: 'rgba(147, 51, 234, 0.3)',
                    }}
                  />
                )}
                <Ionicons
                  name={focused ? "home" : "home-outline"}
                  size={focused ? 26 : 24}
                  color={focused ? "#9333EA" : "rgba(255, 255, 255, 0.5)"}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="numerology"
          options={{
            title: "Numbers",
            tabBarIcon: ({ color, focused }) => (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                {focused && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -12,
                      left: -20,
                      right: -20,
                      bottom: -12,
                      borderRadius: 20,
                      backgroundColor: 'rgba(147, 51, 234, 0.15)',
                      borderWidth: 1,
                      borderColor: 'rgba(147, 51, 234, 0.3)',
                    }}
                  />
                )}
                <Ionicons
                  name={focused ? "calculator" : "calculator-outline"}
                  size={focused ? 26 : 24}
                  color={focused ? "#9333EA" : "rgba(255, 255, 255, 0.5)"}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="love-match"
          options={{
            title: "Love",
            tabBarIcon: ({ color, focused }) => (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                {focused && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -12,
                      left: -20,
                      right: -20,
                      bottom: -12,
                      borderRadius: 20,
                      backgroundColor: 'rgba(147, 51, 234, 0.15)',
                      borderWidth: 1,
                      borderColor: 'rgba(147, 51, 234, 0.3)',
                    }}
                  />
                )}
                <Ionicons
                  name={focused ? "heart" : "heart-outline"}
                  size={focused ? 26 : 24}
                  color={focused ? "#9333EA" : "rgba(255, 255, 255, 0.5)"}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="trust-assessment"
          options={{
            title: "Trust",
            tabBarIcon: ({ color, focused }) => (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                {focused && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -12,
                      left: -20,
                      right: -20,
                      bottom: -12,
                      borderRadius: 20,
                      backgroundColor: 'rgba(147, 51, 234, 0.15)',
                      borderWidth: 1,
                      borderColor: 'rgba(147, 51, 234, 0.3)',
                    }}
                  />
                )}
                <Ionicons
                  name={focused ? "shield-checkmark" : "shield-outline"}
                  size={focused ? 26 : 24}
                  color={focused ? "#9333EA" : "rgba(255, 255, 255, 0.5)"}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                {focused && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -12,
                      left: -20,
                      right: -20,
                      bottom: -12,
                      borderRadius: 20,
                      backgroundColor: 'rgba(147, 51, 234, 0.15)',
                      borderWidth: 1,
                      borderColor: 'rgba(147, 51, 234, 0.3)',
                    }}
                  />
                )}
                <Ionicons
                  name={focused ? "person" : "person-outline"}
                  size={focused ? 26 : 24}
                  color={focused ? "#9333EA" : "rgba(255, 255, 255, 0.5)"}
                />
              </View>
            ),
          }}
        />
      </Tabs>
    </>
  );
}

TabsWithOnboarding.displayName = "TabsWithOnboarding";

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

TabLayout.displayName = "TabLayout";
