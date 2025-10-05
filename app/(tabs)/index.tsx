import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCustomAlert } from "../../components/CustomAlert";
import NewBentoGrid from "../../components/NewBentoGrid";
import SubscriptionModal from "../../components/SubscriptionModal";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import GlassCard from "../../components/ui/GlassCard";
import ShadcnLoading from "../../components/ui/ShadcnLoading";
import { DesignSystem, gradients } from "../../constants/DesignSystem";
import { useProfile } from "../../contexts/ProfileContext";
import { useSubscription } from "../../hooks/useSubscription";
import {
  DailyInsight,
  DailyInsightsService,
} from "../../services/DailyInsightsService";
import SimpleAIService from "../../services/SimpleAIService";
import { SubscriptionService } from "../../services/SubscriptionService";
import {
  DailyVibeService,
  DailyVibe,
  AIInsight,
} from "../../services/DailyVibeService";

const { height, width } = Dimensions.get("window");

// Responsive breakpoints
const isSmallScreen = width < 375;
const isMediumScreen = width >= 375 && width < 414;
const isLargeScreen = width >= 414;

export default function HomeScreen() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const { profileData, loading: profileLoading } = useProfile();
  const { subscription, canUse, openPricingPage } = useSubscription();
  const router = useRouter();
  const [heartAnimation] = useState(new Animated.Value(1));
  const [sparkleAnimation] = useState(new Animated.Value(0));
  const [dailyInsight, setDailyInsight] = useState<DailyInsight | null>(null);
  const [dailyVibe, setDailyVibe] = useState<DailyVibe | null>(null);
  const [aiInsight, setAIInsight] = useState<AIInsight | null>(null);
  const [showDailyVibe, setShowDailyVibe] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiInsights, setAIInsights] = useState<string | null>(null);
  const [loadingAIInsights, setLoadingAIInsights] = useState(false);
  const [loadingDailyFeatures, setLoadingDailyFeatures] = useState(false);
  const [pulseAnimation] = useState(new Animated.Value(1));
  const [floatingAnimation] = useState(new Animated.Value(0));
  const scrollY = useRef(new Animated.Value(0)).current;
  const [currentQuote, setCurrentQuote] = useState(0);
  const [homeLoading, setHomeLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { showAlert, AlertComponent } = useCustomAlert();

  const userName = React.useMemo(() => {
    if (profileData?.full_name && !profileData.full_name.includes("Unknown")) {
      return profileData.full_name.split(" ")[0] || "Beautiful Soul";
    }
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.fullName && !user.fullName.includes("Unknown")) {
      return user.fullName.split(" ")[0] || "Beautiful Soul";
    }
    return "Beautiful Soul";
  }, [profileData?.full_name, user?.firstName, user?.fullName]);

  const sevenDeadlySinsQuotes = [
    {
      text: "Pride goes before destruction, and a haughty spirit before a fall.",
      author: "Proverbs 16:18",
      icon: "star",
    },
    {
      text: "Greed is a bottomless pit which exhausts the person in an endless effort to satisfy without satisfaction.",
      author: "Erich Fromm",
      icon: "diamond",
    },
    {
      text: "Anger is an acid that can do more harm to the vessel in which it is stored than to anything on which it is poured.",
      author: "Mark Twain",
      icon: "flame",
    },
    {
      text: "Envy is the art of counting the other fellow's blessings instead of your own.",
      author: "Harold Coffin",
      icon: "eye",
    },
    {
      text: "Gluttony is not a secret vice; it is a sign of moral laziness.",
      author: "Saint Thomas Aquinas",
      icon: "restaurant",
    },
    {
      text: "Sloth, like rust, consumes faster than labor wears, while the used key is always bright.",
      author: "Benjamin Franklin",
      icon: "bed",
    },
  ];

  // Load daily insights function - moved outside useEffect so it can be called by button
  const loadDailyInsights = async () => {
    if (profileData?.full_name && profileData?.birth_date) {
      try {
        const insights = await DailyInsightsService.getDailyInsights(
          profileData.full_name,
          profileData.birth_date
        );
        setDailyInsight(insights);
      } catch (error) {
        console.error("Failed to load daily insights:", error);
      }
    }
  };

  // Pull to refresh function with payment check
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Check payment status on refresh
      if (user?.id) {
        try {
          const subscriptionStatus =
            await SubscriptionService.getSubscriptionStatus(user.id);
        } catch (error) {
          // Payment check failed silently
        }
      }

      // Simulate some loading time for smooth UX
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Failed to refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Load daily features for premium users
  const loadDailyFeatures = async () => {
    if (!user?.id || !profileData?.full_name || !profileData?.birth_date) {
      return;
    }

    try {
      setLoadingDailyFeatures(true);

      // Check subscription status first
      const subscriptionStatus =
        await SubscriptionService.getSubscriptionStatus(user.id);

      if (subscriptionStatus.isPremium || subscriptionStatus.isUnlimited) {
        console.log("🌟 Loading daily features for premium user");

        // Generate daily vibe using Roxy API
        const dailyVibeData = await DailyVibeService.generateDailyVibe(
          profileData.full_name!.split(" ")[0] || "User",
          profileData.full_name!.split(" ").slice(1).join(" ") || "",
          profileData.birth_date!,
          user.id
        );

        if (dailyVibeData) {
          setDailyVibe(dailyVibeData);

          // Generate AI insight with daily vibe reference
          try {
            const numerologyProfile = {
              life_path_number: Math.floor(Math.random() * 9) + 1,
              strengths: ["Leadership", "Intuition"],
              challenges: ["Perfectionism", "Impatience"],
            };

            const aiInsightData = await DailyVibeService.generateAIInsight(
              dailyVibeData,
              numerologyProfile,
              profileData.full_name!.split(" ")[0] || "User"
            );

            setAIInsight(aiInsightData);
            console.log("✅ Daily features loaded successfully");
          } catch (error) {
            console.error("Error generating AI insight:", error);
          }
        }
      } else {
        console.log("ℹ️ Free user - daily features not loaded automatically");
      }
    } catch (error) {
      console.error("Error loading daily features:", error);
    } finally {
      setLoadingDailyFeatures(false);
    }
  };

  useEffect(() => {
    // Simulate initial loading
    const loadingTimer = setTimeout(() => {
      setHomeLoading(false);
    }, 2000);

    // Load daily features for premium users after profile is loaded
    if (profileData?.full_name && profileData?.birth_date && user?.id) {
      loadDailyFeatures();
    }

    return () => clearTimeout(loadingTimer);
  }, [profileData, user?.id]);

  useEffect(() => {
    // Animated heart beating effect
    const heartBeat = Animated.loop(
      Animated.sequence([
        Animated.timing(heartAnimation, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(heartAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    // Sparkle animation
    const sparkle = Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Pulse animation for action cards
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    // Floating animation
    const floating = Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnimation, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnimation, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );

    heartBeat.start();
    sparkle.start();
    pulse.start();
    floating.start();

    // Rotate quotes every 5 seconds
    const quoteInterval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % sevenDeadlySinsQuotes.length);
    }, 5000);

    return () => {
      heartBeat.stop();
      sparkle.stop();
      pulse.stop();
      floating.stop();
      clearInterval(quoteInterval);
    };
  }, []);

  // Show loading screen initially
  if (!isLoaded || homeLoading || profileLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        <View style={styles.loadingContainer}>
          <ShadcnLoading
            size="lg"
            variant="pulse"
            text="Welcome to Lovelock..."
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  const navigateToTab = (tabName: string) => {
    router.push(`/(tabs)/${tabName}`);
  };

  const getGreetingMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const hasProfile = profileData?.birth_date;

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, -100],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const generateAIInsights = async () => {
    if (!profileData?.full_name || !profileData?.birth_date) {
      return;
    }

    setLoadingAIInsights(true);
    try {
      // First try to get enhanced insights using Roxy data
      const nameParts = profileData.full_name!.split(" ");

      // Only get Roxy data if user explicitly requests enhanced insights
      let roxyData = null;
      // Comment out automatic Roxy API call for now
      // const roxyData = await RoxyNumerologyService.getNumerologyReading(
      //   firstName,
      //   lastName,
      //   profileData.birth_date!
      // );

      if (roxyData) {
        // Use optimized character analysis with Roxy data
        const analysis =
          await SimpleAIService.generateOptimizedCharacterAnalysis(
            profileData.full_name!,
            roxyData
          );
        setAIInsights(String(analysis || ""));
      } else {
        // Fallback to basic AI insights
        const prompt = `AI INSIGHTS for ${profileData.full_name} (${profileData.birth_date}):

Write 4 engaging paragraphs (50 words each):
🌟 Core personality & what makes them special
💪 Natural talents & superpowers
💕 Love style & relationship energy
🎯 Life purpose & spiritual path

Use "you" language. Be specific. Stay positive. Include emojis.`;

        const result = await SimpleAIService.generateResponse(
          prompt,
          "numerology"
        );
        setAIInsights(String(result.content || ""));
      }
    } catch (error) {
      console.error("Failed to generate AI insights:", error);
      setAIInsights(
        "✨ Your unique cosmic blueprint reveals a soul destined for greatness. Your natural gifts include intuitive wisdom and the ability to inspire others. In relationships, you bring authentic love and deep understanding. Your life purpose involves creating positive change and sharing your special talents with the world. 🌟"
      );
    } finally {
      setLoadingAIInsights(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#667eea"
            colors={["#667eea", "#764ba2"]}
            progressBackgroundColor="#1C1C1E"
          />
        }
      >
        {/* Hero Section */}
        <Animated.View
          style={[
            styles.heroSection,
            {
              transform: [{ translateY: headerTranslateY }],
              opacity: headerOpacity,
            },
          ]}
        >
          <LinearGradient
            colors={gradients.cosmic.colors as [string, string, ...string[]]}
            start={gradients.cosmic.start}
            end={gradients.cosmic.end}
            style={styles.heroGradient}
          >
            <View style={styles.sparkleContainer}>
              <Animated.View
                style={[
                  styles.sparkle,
                  {
                    opacity: sparkleAnimation,
                    top: 50,
                    left: 50,
                    transform: [
                      {
                        rotate: floatingAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0deg", "360deg"],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Ionicons name="sparkles" size={16} color="#FFD700" />
              </Animated.View>
              <Animated.View
                style={[
                  styles.sparkle,
                  {
                    opacity: sparkleAnimation,
                    top: 100,
                    right: 40,
                    transform: [
                      {
                        translateY: floatingAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -10],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Ionicons name="star" size={12} color="#E91E63" />
              </Animated.View>
              <Animated.View
                style={[
                  styles.sparkle,
                  {
                    opacity: sparkleAnimation,
                    bottom: 80,
                    left: 30,
                    transform: [
                      {
                        translateX: floatingAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 15],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Ionicons name="diamond" size={14} color="#34C759" />
              </Animated.View>
              <Animated.View
                style={[
                  styles.sparkle,
                  {
                    opacity: sparkleAnimation,
                    top: 200,
                    right: 80,
                    transform: [
                      {
                        scale: floatingAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.5, 1.2],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Ionicons name="flash" size={10} color="#00D4FF" />
              </Animated.View>
            </View>

            <Animated.View
              style={[
                styles.heartContainer,
                { transform: [{ scale: heartAnimation }] },
              ]}
            >
              <LinearGradient
                colors={["#FF6B9D", "#E91E63", "#C2185B"]}
                style={styles.heartGradient}
              >
                <Ionicons name="heart" size={64} color="#FFFFFF" />
              </LinearGradient>
            </Animated.View>

            <Animated.Text
              style={[
                styles.welcomeText,
                {
                  transform: [
                    {
                      translateY: floatingAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -5],
                      }),
                    },
                  ],
                },
              ]}
            >
              {getGreetingMessage()},
            </Animated.Text>
            <Animated.Text
              style={[
                styles.nameText,
                subscription?.hasPremiumPlan && styles.premiumNameText,
                { transform: [{ scale: pulseAnimation }] },
              ]}
            >
              {userName}
              {subscription?.hasPremiumPlan && (
                <Text style={styles.premiumIcon}> ✨</Text>
              )}
            </Animated.Text>

            <Text style={styles.tagline}>
              Your cosmic journey to love and self-discovery awaits
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* New Professional Bento Grid */}
        <NewBentoGrid
          navigateToTab={navigateToTab}
          canAccessFeature={(feature: string) => canUse(feature as any)}
          setShowSubscriptionModal={setShowSubscriptionModal}
          setShowDailyVibe={setShowDailyVibe}
          setShowAIInsights={setShowAIInsights}
          showAlert={showAlert}
          hasProfile={!!hasProfile}
          hasPremium={subscription?.hasPremiumPlan || false}
        />

        {/* Profile Status */}
        <View style={styles.profileStatus}>
          <Text style={styles.sectionTitle}>Your Cosmic Profile</Text>

          <TouchableOpacity
            onPress={() => navigateToTab("profile")}
            activeOpacity={0.8}
          >
            {hasProfile ? (
              <Card
                variant="gradient"
                gradientType="primary"
                style={styles.profileCard}
              >
                <View style={styles.profileCardContent}>
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={DesignSystem.colors.semantic.success}
                  />
                  <View style={styles.profileTextContainer}>
                    <Text style={styles.profileCardTitle}>
                      Profile Complete
                    </Text>
                    <Text style={styles.profileCardSubtitle}>
                      Birth Date:{" "}
                      {(() => {
                        try {
                          if (profileData?.birth_date) {
                            // Handle YYYY-MM-DD format from database
                            if (
                              profileData.birth_date.includes("-") &&
                              profileData.birth_date.length === 10
                            ) {
                              const [year, month, day] =
                                profileData.birth_date.split("-");
                              if (year && month && day) {
                                return `${month.padStart(2, "0")}/${day.padStart(2, "0")}/${year}`;
                              }
                            }

                            // Fallback to Date parsing for other formats
                            const date = new Date(profileData.birth_date);
                            if (!isNaN(date.getTime())) {
                              return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}/${date.getFullYear()}`;
                            }
                          }
                          return "Not set";
                        } catch {
                          return profileData?.birth_date || "Not set";
                        }
                      })()}
                    </Text>
                  </View>
                  <Badge variant="success" size="sm">
                    Complete
                  </Badge>
                </View>
              </Card>
            ) : (
              <GlassCard intensity="medium" style={styles.profileCard}>
                <View style={styles.profileCardContent}>
                  <Ionicons
                    name="information-circle-outline"
                    size={24}
                    color={DesignSystem.colors.semantic.warning}
                  />
                  <View style={styles.profileTextContainer}>
                    <Text style={styles.profileCardTitle}>
                      Complete Your Profile
                    </Text>
                    <Text style={styles.profileCardSubtitle}>
                      Add your birth details for accurate readings
                    </Text>
                  </View>
                  <Badge variant="warning" size="sm">
                    Incomplete
                  </Badge>
                </View>
              </GlassCard>
            )}
          </TouchableOpacity>
        </View>

        {/* Subscription Status - Only show for non-premium users */}
        {subscription && !subscription.hasPremiumPlan && (
          <View style={styles.subscriptionSection}>
            <TouchableOpacity
              style={styles.subscriptionCard}
              onPress={() => setShowSubscriptionModal(true)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#FFD700", "#FFA500"]}
                style={styles.subscriptionGradient}
              >
                <View style={styles.subscriptionContent}>
                  <Ionicons name="diamond" size={32} color="#000000" />
                  <View style={styles.subscriptionText}>
                    <Text style={styles.subscriptionTitle}>
                      Upgrade to Premium
                    </Text>
                    <Text style={styles.subscriptionSubtitle}>
                      Unlock unlimited readings & advanced insights
                    </Text>
                  </View>
                  <View style={styles.subscriptionPricing}>
                    <Text style={styles.subscriptionPrice}>$4.99</Text>
                    <Text style={styles.subscriptionPeriod}>/month</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Daily Inspiration */}
        <View style={styles.inspirationSection}>
          <Text style={styles.sectionTitle}>Cosmic Wisdom</Text>

          <Animated.View
            style={[
              {
                transform: [
                  {
                    translateY: floatingAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -5],
                    }),
                  },
                ],
              },
            ]}
          >
            <GlassCard
              intensity="strong"
              tint="cosmic"
              style={styles.inspirationCard}
            >
              <Animated.View
                style={{
                  transform: [
                    {
                      rotate: sparkleAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "10deg"],
                      }),
                    },
                  ],
                }}
              >
                <Ionicons
                  name={sevenDeadlySinsQuotes[currentQuote].icon as any}
                  size={24}
                  color="#FFFFFF"
                  style={styles.inspirationIcon}
                />
              </Animated.View>
              <Animated.Text
                key={currentQuote}
                style={[styles.inspirationText, { opacity: sparkleAnimation }]}
              >
                {sevenDeadlySinsQuotes[currentQuote].text}
              </Animated.Text>
              <Text style={styles.inspirationAuthor}>
                - {sevenDeadlySinsQuotes[currentQuote].author}
              </Text>

              {/* Quote indicators */}
              <View style={styles.quoteIndicators}>
                {sevenDeadlySinsQuotes.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.indicator,
                      currentQuote === index && styles.activeIndicator,
                    ]}
                    onPress={() => setCurrentQuote(index)}
                  />
                ))}
              </View>
            </GlassCard>
          </Animated.View>
        </View>

        <View style={styles.bottomPadding} />
      </Animated.ScrollView>

      {/* Daily Vibe Modal */}
      <Modal
        visible={showDailyVibe}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDailyVibe(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={["#a8edea", "#fed6e3"]}
              style={styles.modalHeader}
            >
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowDailyVibe(false)}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              <View style={styles.modalHeaderContent}>
                <Ionicons name="sunny" size={40} color="white" />
                <Text style={styles.modalTitle}>Daily Vibe</Text>
                <Text style={styles.modalDate}>
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </View>
            </LinearGradient>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {dailyVibe ? (
                <>
                  {/* Personal Day Number & Energy */}
                  <View style={styles.insightCard}>
                    <Text style={styles.insightLabel}>Personal Day Number</Text>
                    <Text style={styles.insightNumber}>
                      {dailyVibe.personalDayNumber}
                    </Text>
                    <Text style={styles.insightTheme}>
                      {dailyVibe.overallTheme}
                    </Text>
                  </View>

                  {/* Energy Level */}
                  <View style={styles.insightCard}>
                    <Text style={styles.insightLabel}>Energy Level</Text>
                    <View style={styles.energyBar}>
                      <View
                        style={[
                          styles.energyFill,
                          { width: `${dailyVibe.energyLevel}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.energyText}>
                      {dailyVibe.energyLevel}%
                    </Text>
                  </View>

                  {/* Spiritual Message */}
                  <View style={styles.insightCard}>
                    <Text style={styles.insightLabel}>
                      Today&apos;s Spiritual Message
                    </Text>
                    <Text style={styles.affirmationText}>
                      {dailyVibe.spiritualMessage}
                    </Text>
                  </View>

                  {/* Life Areas */}
                  <View style={styles.lifeAreasContainer}>
                    <View style={styles.lifeAreaCard}>
                      <Ionicons name="heart" size={20} color="#E91E63" />
                      <Text style={styles.lifeAreaLabel}>Love</Text>
                      <Text style={styles.lifeAreaText}>
                        {dailyVibe.loveInsight}
                      </Text>
                    </View>

                    <View style={styles.lifeAreaCard}>
                      <Ionicons name="briefcase" size={20} color="#2196F3" />
                      <Text style={styles.lifeAreaLabel}>Career</Text>
                      <Text style={styles.lifeAreaText}>
                        {dailyVibe.careerGuidance}
                      </Text>
                    </View>

                    <View style={styles.lifeAreaCard}>
                      <Ionicons name="fitness" size={20} color="#4CAF50" />
                      <Text style={styles.lifeAreaLabel}>Health</Text>
                      <Text style={styles.lifeAreaText}>
                        {dailyVibe.healthFocus}
                      </Text>
                    </View>
                  </View>

                  {/* Challenges & Opportunities */}
                  <View style={styles.lifeAreasContainer}>
                    <View style={styles.lifeAreaCard}>
                      <Ionicons name="warning" size={20} color="#FF9500" />
                      <Text style={styles.lifeAreaLabel}>Challenges</Text>
                      <Text style={styles.lifeAreaText}>
                        {dailyVibe.challenges.join(", ")}
                      </Text>
                    </View>

                    <View style={styles.lifeAreaCard}>
                      <Ionicons name="star" size={20} color="#FFD700" />
                      <Text style={styles.lifeAreaLabel}>Opportunities</Text>
                      <Text style={styles.lifeAreaText}>
                        {dailyVibe.opportunities.join(", ")}
                      </Text>
                    </View>
                  </View>

                  {/* Lucky Numbers & Colors */}
                  <View style={styles.luckyContainer}>
                    <View style={styles.luckySection}>
                      <Text style={styles.luckyLabel}>Lucky Numbers</Text>
                      <View style={styles.luckyNumbers}>
                        {dailyVibe.luckyNumbers.map((number, index) => (
                          <View key={index} style={styles.luckyNumber}>
                            <Text style={styles.luckyNumberText}>{number}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    <View style={styles.luckySection}>
                      <Text style={styles.luckyLabel}>Lucky Colors</Text>
                      <View style={styles.luckyColors}>
                        {dailyVibe.luckyColors.map((color, index) => (
                          <View key={index} style={styles.luckyColor}>
                            <Text style={styles.luckyColorText}>{color}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.noDataContainer}>
                  <Ionicons name="sparkles" size={48} color="#E91E63" />
                  <Text style={styles.noDataTitle}>Daily Insights</Text>
                  <Text style={styles.noDataText}>
                    {profileData?.full_name && profileData?.birth_date
                      ? "Tap below to get your personalized daily insights!"
                      : "Complete your profile with name and birth date to unlock daily insights."}
                  </Text>
                  {profileData?.full_name && profileData?.birth_date ? (
                    <TouchableOpacity
                      style={styles.profileButton}
                      onPress={loadDailyInsights}
                    >
                      <Text style={styles.profileButtonText}>
                        Get Daily Insights
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.profileButton}
                      onPress={() => {
                        setShowDailyVibe(false);
                        navigateToTab("profile");
                      }}
                    >
                      <Text style={styles.profileButtonText}>
                        Update Profile
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* AI Insights Modal */}
      <Modal
        visible={showAIInsights}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAIInsights(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={["#ffecd2", "#fcb69f"]}
              style={styles.modalHeader}
            >
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowAIInsights(false)}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              <View style={styles.modalHeaderContent}>
                <Ionicons name="sparkles" size={40} color="white" />
                <Text style={styles.modalTitle}>AI Insights</Text>
                <Text style={styles.modalDate}>Personalized Analysis</Text>
              </View>
            </LinearGradient>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {profileData?.full_name && profileData?.birth_date ? (
                <View style={styles.aiInsightsContainer}>
                  {aiInsight ? (
                    <View style={styles.insightsContent}>
                      {/* Improvement Area */}
                      <View style={styles.insightCard}>
                        <Text style={styles.insightLabel}>
                          Focus Area for Today
                        </Text>
                        <Text style={styles.insightNumber}>
                          {aiInsight.improvementArea}
                        </Text>
                      </View>

                      {/* Specific Guidance */}
                      <View style={styles.insightCard}>
                        <Text style={styles.insightLabel}>Guidance</Text>
                        <Text style={styles.insightText}>
                          {aiInsight.specificGuidance}
                        </Text>
                      </View>

                      {/* Action Steps */}
                      <View style={styles.insightCard}>
                        <Text style={styles.insightLabel}>Action Steps</Text>
                        {aiInsight.actionSteps.map((step, index) => (
                          <View key={index} style={styles.actionStep}>
                            <Text style={styles.actionStepNumber}>
                              {index + 1}
                            </Text>
                            <Text style={styles.actionStepText}>{step}</Text>
                          </View>
                        ))}
                      </View>

                      {/* Cosmic Wisdom */}
                      <View style={styles.insightCard}>
                        <Text style={styles.insightLabel}>Cosmic Wisdom</Text>
                        <Text style={styles.affirmationText}>
                          {aiInsight.cosmicWisdom}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={styles.refreshButton}
                        onPress={loadDailyFeatures}
                        disabled={loadingDailyFeatures}
                      >
                        <Ionicons name="refresh" size={16} color="#007AFF" />
                        <Text style={styles.refreshButtonText}>
                          Refresh Daily Insights
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : !loadingDailyFeatures ? (
                    <View style={styles.generateContainer}>
                      <Ionicons name="bulb" size={48} color="#FF9500" />
                      <Text style={styles.generateTitle}>
                        Generate Your AI Insights
                      </Text>
                      <Text style={styles.generateDescription}>
                        Get personalized insights powered by advanced AI
                        analysis of your numerological profile and todays cosmic
                        energy.
                      </Text>
                      <TouchableOpacity
                        style={styles.generateButton}
                        onPress={loadDailyFeatures}
                      >
                        <Ionicons name="sparkles" size={20} color="white" />
                        <Text style={styles.generateButtonText}>
                          Generate Insights
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.loadingInsights}>
                      <View style={styles.aiLoadingAnimation}>
                        <Ionicons name="sparkles" size={32} color="#FF9500" />
                      </View>
                      <Text style={styles.loadingTitle}>
                        Generating Your Insights
                      </Text>
                      <Text style={styles.loadingDescription}>
                        Our AI is analyzing your numerological profile and
                        creating personalized insights just for you...
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.noDataContainer}>
                  <Ionicons
                    name="information-circle"
                    size={48}
                    color="#8E8E93"
                  />
                  <Text style={styles.noDataTitle}>Complete Your Profile</Text>
                  <Text style={styles.noDataText}>
                    Add your birth date and full name to your profile to unlock
                    personalized AI insights.
                  </Text>
                  <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => {
                      setShowAIInsights(false);
                      navigateToTab("profile");
                    }}
                  >
                    <Text style={styles.profileButtonText}>Update Profile</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Subscription Modal */}
      <SubscriptionModal
        visible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        userId={user?.id || ""}
        userEmail={user?.primaryEmailAddress?.emailAddress || ""}
        onSubscriptionChange={(subscription) => {
          // Handle subscription change - reload usage stats, etc.
          // Subscription updated
        }}
      />

      {/* Custom Alert Component */}
      {AlertComponent}
    </SafeAreaView>
  );
}

HomeScreen.displayName = "HomeScreen";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    height: height * 0.4,
    position: "relative",
    marginBottom: 20,
  },
  heroGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  sparkleContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  sparkle: {
    position: "absolute",
  },
  heartContainer: {
    marginBottom: 20,
  },
  heartGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E91E63",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  welcomeText: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "300",
    opacity: 0.9,
  },
  nameText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
    textAlign: "center",
  },
  premiumNameText: {
    color: "#FFD700", // Gold color for premium users
    textShadowColor: "rgba(255, 215, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  premiumIcon: {
    fontSize: 24,
    color: "#FFD700",
  },
  tagline: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: "80%",
    fontStyle: "italic",
  },
  sectionTitle: {
    fontSize: DesignSystem.typography.sizes["2xl"],
    fontWeight: DesignSystem.typography.weights.bold,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.scale.lg,
    textAlign: "center",
  },
  // Bento Box Layout Styles
  bentoContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  bentoGrid: {
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  bentoCard: {
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bentoGradient: {
    padding: 20,
    position: "relative",
  },
  bentoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  bentoIndicator: {
    opacity: 0.8,
  },
  // Primary Card (Large - Numerology)
  bentoPrimary: {
    marginBottom: 16,
  },
  bentoContent: {
    marginBottom: 16,
  },
  bentoTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  bentoDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.85)",
    lineHeight: 20,
  },
  bentoFooter: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  bentoTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  bentoTagText: {
    fontSize: 10,
    color: "#FFD700",
    fontWeight: "600",
  },
  // Secondary Cards Row (Medium - Love & Trust)
  bentoSecondaryRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  bentoSecondary: {
    flex: 1,
  },
  bentoSecondaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  bentoSecondarySubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  // Tertiary Cards Row (Small - Profile, Daily, AI)
  bentoTertiaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  bentoTertiary: {
    flex: 1,
    height: 100,
  },
  bentoTertiaryTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 8,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bentoTertiarySubtitle: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 2,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },

  // New Responsive Bento Grid Styles
  responsiveBentoGrid: {
    gap: isSmallScreen ? 12 : 16,
    paddingHorizontal: isSmallScreen ? 16 : 20,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginBottom: 28,
    paddingHorizontal: 20,
    lineHeight: 22,
  },

  // Main Features Row
  mainFeaturesRow: {
    marginBottom: 16,
  },
  featuredCard: {
    height: isSmallScreen ? 120 : isLargeScreen ? 150 : 140,
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  cardBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFD700",
  },
  cardContent: {
    flex: 1,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: isSmallScreen ? 16 : isLargeScreen ? 19 : 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardDescription: {
    fontSize: isSmallScreen ? 12 : 13,
    color: "rgba(255, 255, 255, 0.85)",
    lineHeight: isSmallScreen ? 16 : 18,
  },
  cardAction: {
    alignSelf: "flex-end",
  },

  // Core Features Row
  coreFeatures: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  coreCard: {
    flex: 1,
    height: isSmallScreen ? 100 : 120,
  },
  coreCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 8,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  coreCardSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },

  // Quick Access Container (2x2 Grid)
  quickAccessContainer: {
    gap: 12,
    marginBottom: 16,
  },
  quickAccessRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  quickCard: {
    flex: 1,
    height: isSmallScreen ? 85 : 100,
  },
  profileCard: {
    flex: 1.5, // Make profile card 50% larger
    height: isSmallScreen ? 85 : 100,
    marginBottom: DesignSystem.spacing.scale.lg,
  },
  profileCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    gap: 8,
  },
  profileTextContent: {
    alignItems: "center",
  },
  profileCardTitle: {
    fontSize: DesignSystem.typography.sizes.lg,
    fontWeight: DesignSystem.typography.weights.semibold,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.scale.xs,
  },
  profileCardSubtitle: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginTop: 2,
  },
  quickCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 6,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  quickCardSubtitle: {
    fontSize: 10,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
    textAlign: "center",
  },
  profileStatus: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  profileTextContainer: {
    flex: 1,
  },
  inspirationSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  inspirationCard: {
    marginBottom: DesignSystem.spacing.scale.lg,
    alignItems: "center",
  },
  inspirationIcon: {
    marginBottom: 16,
  },
  inspirationText: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 12,
    fontStyle: "italic",
  },
  inspirationAuthor: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginBottom: 15,
  },
  quoteIndicators: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  activeIndicator: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    width: 20,
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  statCard: {
    alignItems: "center",
    minWidth: 90,
    marginBottom: 0,
  },
  statNumber: {
    fontSize: DesignSystem.typography.sizes["2xl"],
    fontWeight: DesignSystem.typography.weights.bold,
    color: DesignSystem.colors.text.primary,
    marginVertical: DesignSystem.spacing.scale.xs,
  },
  statLabel: {
    fontSize: DesignSystem.typography.sizes.xs,
    color: DesignSystem.colors.text.secondary,
    textAlign: "center",
    marginBottom: DesignSystem.spacing.scale.sm,
  },
  bottomPadding: {
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },

  // Daily Vibe Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    overflow: "hidden",
  },
  modalHeader: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 24,
    position: "relative",
  },
  modalCloseButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalHeaderContent: {
    alignItems: "center",
    paddingTop: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginTop: 12,
    marginBottom: 4,
  },
  modalDate: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  modalContent: {
    padding: 20,
    maxHeight: "75%",
  },
  insightCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  insightLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  insightNumber: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  insightTheme: {
    fontSize: 18,
    fontWeight: "500",
    color: "#666",
    textAlign: "center",
  },
  energyBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  energyFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 4,
  },
  energyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
    textAlign: "center",
  },
  insightText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  affirmationText: {
    fontSize: 18,
    lineHeight: 26,
    color: "#333",
    fontStyle: "italic",
    textAlign: "center",
  },
  lifeAreasContainer: {
    gap: 12,
    marginBottom: 16,
  },
  lifeAreaCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  lifeAreaLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    minWidth: 60,
  },
  lifeAreaText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#666",
    flex: 1,
  },
  luckyContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  luckySection: {
    flex: 1,
  },
  luckyLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 12,
    textAlign: "center",
  },
  luckyNumbers: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  luckyNumber: {
    width: 40,
    height: 40,
    backgroundColor: "#007AFF",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  luckyNumberText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
  },
  luckyColors: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  luckyColor: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#E91E63",
    borderRadius: 16,
  },
  luckyColorText: {
    fontSize: 12,
    fontWeight: "500",
    color: "white",
  },
  noDataContainer: {
    alignItems: "center",
    padding: 40,
  },
  noDataTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  noDataText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  profileButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  profileButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  bentoSubtitle: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
    textAlign: "center",
  },

  // AI Insights Modal Styles
  aiInsightsContainer: {
    flex: 1,
  },
  generateContainer: {
    alignItems: "center",
    padding: 32,
  },
  generateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  generateDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  generateButton: {
    backgroundColor: "#FF9500",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  generateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingInsights: {
    alignItems: "center",
    padding: 40,
  },
  aiLoadingAnimation: {
    marginBottom: 16,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  loadingDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  insightsContent: {
    padding: 8,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
    paddingVertical: 8,
  },
  refreshButtonText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
  },
  aiInsightsText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  actionStep: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 12,
  },
  actionStepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#007AFF",
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 24,
  },
  actionStepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
  },

  // Subscription Section Styles
  subscriptionSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  subscriptionCard: {
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  subscriptionGradient: {
    padding: 20,
  },
  subscriptionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  subscriptionText: {
    flex: 1,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
  },
  subscriptionSubtitle: {
    fontSize: 14,
    color: "#333333",
    opacity: 0.8,
  },
  subscriptionPricing: {
    alignItems: "flex-end",
  },
  subscriptionPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
  },
  subscriptionPeriod: {
    fontSize: 12,
    color: "#333333",
    opacity: 0.7,
  },

  // Modern Bento Grid Styles
  modernBentoGrid: {
    gap: isSmallScreen ? 14 : 18,
    paddingHorizontal: isSmallScreen ? 16 : 20,
  },

  // Hero Card Styles
  heroCard: {
    height: isSmallScreen ? 140 : isLargeScreen ? 180 : 160,
    marginBottom: 18,
  },
  heroCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  heroIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
  },
  heroBadgeText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "700",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  heroContent: {
    flex: 1,
    marginBottom: 18,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroDescription: {
    fontSize: 15,
    color: "#FFFFFF",
    lineHeight: 22,
    opacity: 0.95,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  heroAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroActionText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Primary Row Styles
  primaryRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 18,
  },
  primaryCard: {
    flex: 1,
    height: isSmallScreen ? 110 : 130,
  },
  primaryCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  primaryCardContent: {
    flex: 1,
  },
  primaryCardTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 6,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  primaryCardSubtitle: {
    fontSize: 12,
    color: "#FFFFFF",
    lineHeight: 16,
    opacity: 0.9,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },

  // Secondary Grid Styles
  secondaryGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  secondaryCard: {
    flex: 1,
    height: isSmallScreen ? 140 : 160,
  },
  secondaryCardContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
    minHeight: 140,
  },
  secondaryCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
    lineHeight: 16,
    maxWidth: "100%",
    flexShrink: 1,
  },

  // Enhanced Profile Card
  profileCardEnhanced: {
    flex: 1.2,
    height: isSmallScreen ? 100 : 120,
  },
  profileEnhancedContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  profileIconStatus: {
    alignItems: "center",
    justifyContent: "center",
  },
  profileTextEnhanced: {
    alignItems: "flex-start",
    flex: 1,
  },
  profileEnhancedTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  profileEnhancedSubtitle: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "500",
    opacity: 0.95,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
