import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { Redirect, Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import OnboardingScreen from "../../components/OnboardingScreen";
import CustomAlert, { useCustomAlert } from "../../components/CustomAlert";
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
import { OnboardingService } from "../../services/OnboardingService";

// Wrapper component that uses the profile context
function TabsWithOnboarding() {
  const { profileData, loading, markOnboardingCompleted, refreshProfile } = useProfile();
  const { user } = useUser();
  const alertContext = useAlert();
  const { showAlert, AlertComponent } = useCustomAlert();
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
    // Show welcome message for new users and check billing cycle
    const showWelcomeForNewUsers = async () => {
      if (!loading && user?.id && profileData) {
        try {
          // Check and reset billing cycle if needed
          await SubscriptionService.checkAndResetBillingCycle(user.id);

          // Show welcome message for new users using CustomAlert
          const { shouldShow, alertConfig } = await OnboardingService.getWelcomeMessage(user.id);
          if (shouldShow && alertConfig) {
            showAlert(alertConfig);
          }
        } catch (error) {
          console.error('Error showing welcome message:', error);
        }
      }
    };

    showWelcomeForNewUsers();

    // Temporarily disable old onboarding to fix navigation issues
    // Show onboarding if profile exists but onboarding hasn't been completed
    // if (!loading && profileData && !profileData.onboarding_completed) {
    //   setShowOnboarding(true);
    // }
  }, [profileData, loading, user?.id]);

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
      {AlertComponent}
      <Tabs
        tabBar={({ state, descriptors, navigation }) => (
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: "#000000",
              borderTopWidth: 1,
              borderTopColor: "rgba(255, 255, 255, 0.1)",
              paddingTop: 8,
              paddingBottom: 34,
              paddingHorizontal: 0,
              height: 80,
            }}
          >
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: 'center',
              height: 50,
            }}>
              {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const label = options.tabBarLabel !== undefined
                  ? options.tabBarLabel
                  : options.title !== undefined
                  ? options.title
                  : route.name;

                const isFocused = state.index === index;

                const onPress = () => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });

                  if (!isFocused && !event.defaultPrevented) {
                    navigation.navigate(route.name);
                  }
                };

                return (
                  <TouchableOpacity
                    key={route.key}
                    onPress={onPress}
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 6,
                      position: 'relative',
                    }}
                  >
                    {isFocused && (
                      <View style={{
                        position: 'absolute',
                        top: -2,
                        left: 12,
                        right: 12,
                        height: 3,
                        backgroundColor: '#9333EA',
                        borderRadius: 2,
                      }} />
                    )}
                    <View style={{ alignItems: 'center' }}>
                      {options.tabBarIcon && options.tabBarIcon({
                        focused: isFocused,
                        color: isFocused ? '#9333EA' : 'rgba(255, 255, 255, 0.6)',
                        size: 24,
                      })}
                      <Text style={{
                        color: isFocused ? '#9333EA' : 'rgba(255, 255, 255, 0.6)',
                        fontSize: 11,
                        fontWeight: '500',
                        marginTop: 4,
                      }}>
                        {label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
        screenOptions={{
          tabBarActiveTintColor: "#9333EA",
          tabBarInactiveTintColor: "rgba(255, 255, 255, 0.4)",
          tabBarStyle: {
            backgroundColor: "transparent",
            borderTopWidth: 0,
            height: 85,
            paddingTop: 0,
            paddingBottom: 0,
            position: "absolute" as const,
          },
          headerStyle: {
            backgroundColor: "#000000",
            borderBottomWidth: 1,
            borderBottomColor: "rgba(147, 51, 234, 0.1)",
            shadowColor: "#9333EA",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontSize: 22,
            fontWeight: "700",
            color: "#FFFFFF",
            letterSpacing: 0.5,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
            marginTop: 6,
            letterSpacing: 0.3,
          },
          tabBarIconStyle: {
            marginBottom: 2,
          },
          tabBarItemStyle: {
            paddingVertical: 8,
            marginHorizontal: 6,
            position: 'relative',
            height: 60,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 18,
            overflow: 'hidden',
          },
          tabBarBackground: () => null,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="numerology"
          options={{
            title: "Numbers",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "calculator" : "calculator-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="love-match"
          options={{
            title: "Love",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "heart" : "heart-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="trust-assessment"
          options={{
            title: "Trust",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "shield-checkmark" : "shield-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={24}
                color={color}
              />
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
