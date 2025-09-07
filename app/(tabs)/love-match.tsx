import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import {
  LoveMatchService,
  LoveMatchProfile,
} from "../../services/LoveMatchService";
import {
  CelebrityMatchService,
  CelebrityMatch,
  IncompatibleNumbers,
} from "../../services/CelebrityMatchService";
import NumerologyService from "../../services/NumerologyService";
import { ProkeralaNumerologyService } from "../../services/ProkeralaNumerologyService";
import SimpleAIService from "../../services/SimpleAIService";
import { StaticDataService } from "../../services/StaticDataService";
import { useProfile } from "../../contexts/ProfileContext";
import { DesignSystem } from "../../constants/DesignSystem";
import { SubscriptionService } from "../../services/SubscriptionService";
import { useCustomAlert } from "../../components/CustomAlert";
import { DatePicker, ShadcnButton, ShadcnInput } from "../../components/ui";
import GlassCard from "../../components/ui/GlassCard";
import Badge from "../../components/ui/Badge";
import { LoveMatchLoadingSkeleton } from "../../components/LoadingSkeletons";
import ReadMoreText from "../../components/ReadMoreText";

export default function LoveMatchScreen() {
  const { user } = useUser();
  const { profileData } = useProfile();
  const [profile, setProfile] = useState<LoveMatchProfile | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [birthDate, setBirthDate] = useState("");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showingStaticData, setShowingStaticData] = useState(false);
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [aiLoadingStates, setAiLoadingStates] = useState({
    deadlySin: false,
    insights: false,
    celebrities: false,
  });

  // Shimmer animation
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startShimmer = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnimation, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnimation, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    if (
      aiLoadingStates.deadlySin ||
      aiLoadingStates.insights ||
      aiLoadingStates.celebrities
    ) {
      startShimmer();
    }
  }, [aiLoadingStates, shimmerAnimation]);
  const [expandedPartner, setExpandedPartner] = useState<number | null>(null);
  const [celebrityMatches, setCelebrityMatches] = useState<CelebrityMatch[]>(
    []
  );
  const [allCelebrityMatches, setAllCelebrityMatches] = useState<
    CelebrityMatch[]
  >([]);
  const [showAllCelebrities, setShowAllCelebrities] = useState(false);
  const [incompatibleNumbers, setIncompatibleNumbers] =
    useState<IncompatibleNumbers | null>(null);
  const [usageStats, setUsageStats] = useState<any>(null);
  const { showAlert, AlertComponent } = useCustomAlert();

  // Load usage statistics
  useEffect(() => {
    const loadUsageStats = async () => {
      if (user?.id) {
        try {
          const stats = await SubscriptionService.getUsageStats(user.id);
          const resetDate = new Date(stats.loveMatch.resetsAt);
          const now = new Date();
          const daysUntilReset = Math.ceil(
            (resetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );

          setUsageStats({
            loveMatchUsage: stats.loveMatch.totalUsed,
            loveMatchRemaining: stats.loveMatch.remaining,
            daysUntilReset: Math.max(0, daysUntilReset),
            isPremium: stats.isPremium,
          });
        } catch (error) {
          console.error("Error loading usage stats:", error);
        }
      }
    };
    loadUsageStats();
  }, [user?.id]);

  useEffect(() => {
    // Auto-show input if user has name but no profile yet
    const fullName =
      profileData?.full_name ||
      user?.fullName ||
      `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
    if (fullName && fullName !== "" && !profile) {
      setShowInput(true);
    }

    // Global name synchronization
    if (fullName && fullName !== userName) {
      setUserName(fullName);
    }

    // Auto-fill birth date from profile if available
    // Update birthDate whenever profileData.birth_date changes
    if (profileData?.birth_date) {
      console.log(
        "💖 Love Match: Auto-filling birth date from profile:",
        profileData.birth_date
      );
      // Convert YYYY-MM-DD format to MM/DD/YYYY format if needed
      let formattedBirthDate = profileData.birth_date;
      try {
        if (
          profileData.birth_date.includes("-") &&
          profileData.birth_date.length === 10
        ) {
          // This is likely YYYY-MM-DD format from database
          const [year, month, day] = profileData.birth_date.split("-");
          formattedBirthDate = `${month.padStart(2, "0")}/${day.padStart(2, "0")}/${year}`;
          console.log(
            "💖 Love Match: Converted to MM/DD/YYYY format:",
            formattedBirthDate
          );
        } else if (profileData.birth_date.includes("/")) {
          // Already in MM/DD/YYYY format, use as-is
          console.log("💖 Love Match: Birth date already in MM/DD/YYYY format");
        }
      } catch (error) {
        console.log("Error formatting birth date:", error);
      }
      setBirthDate(formattedBirthDate);
    }
  }, [user, profile, profileData, userName]);

  // Force update birthday when profile data changes
  useEffect(() => {
    if (profileData?.birth_date) {
      console.log(
        "🔄 Love Match: Profile birth_date changed, updating local state:",
        profileData.birth_date
      );
      let formattedBirthDate = profileData.birth_date;
      try {
        if (
          profileData.birth_date.includes("-") &&
          profileData.birth_date.length === 10
        ) {
          const [year, month, day] = profileData.birth_date.split("-");
          formattedBirthDate = `${month.padStart(2, "0")}/${day.padStart(2, "0")}/${year}`;
        }
      } catch (error) {
        console.log("Error formatting birth date:", error);
      }
      setBirthDate(formattedBirthDate);
    }
  }, [profileData?.birth_date]); // Watch specifically for birth_date changes

  // Reset loading state when switching to input mode
  useEffect(() => {
    if (showInput) {
      setLoading(false);
    }
  }, [showInput]);

  const generateLoveMatch = async () => {
    if (!userName.trim()) {
      Alert.alert("Error", "Please enter your full name");
      return;
    }

    if (!birthDate) {
      Alert.alert("Error", "Please enter your birth date");
      return;
    }

    // Validate date format
    const datePattern =
      /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/(19|20)\d{2}$/;
    if (!datePattern.test(birthDate)) {
      Alert.alert("Error", "Please enter date in MM/DD/YYYY format");
      return;
    }

    // Check usage limits
    if (user?.id) {
      const usageCheck = await SubscriptionService.canAccessFeature(
        user.id,
        "loveMatch"
      );
      if (!usageCheck.canUse) {
        setLoading(false); // Reset loading state
        showAlert({
          title: "⚠️ Usage Limit Reached",
          message: usageCheck.message || "You have reached your monthly limit.",
          type: "warning",
          buttons: [
            { text: "Later", style: "cancel" },
            {
              text: "Upgrade to Premium ($4.99/month)",
              style: "primary",
              onPress: async () => {
                try {
                  const result =
                    await SubscriptionService.purchasePremiumSubscription(
                      user.id,
                      user.primaryEmailAddress?.emailAddress || ""
                    );
                  if (result.success) {
                    showAlert({
                      title: "🎉 Welcome to Premium!",
                      message:
                        "Your subscription is now active. Enjoy unlimited access!",
                      type: "success",
                    });
                    // Reload usage stats
                    const stats = await SubscriptionService.getUsageStats(
                      user.id
                    );
                    const resetDate = new Date(stats.loveMatch.resetsAt);
                    const now = new Date();
                    const daysUntilReset = Math.ceil(
                      (resetDate.getTime() - now.getTime()) /
                        (1000 * 60 * 60 * 24)
                    );

                    setUsageStats({
                      loveMatchUsage: stats.loveMatch.totalUsed,
                      loveMatchRemaining: stats.loveMatch.remaining,
                      daysUntilReset: Math.max(0, daysUntilReset),
                      isPremium: stats.isPremium,
                    });
                  } else {
                    showAlert({
                      title: "Payment Error",
                      message:
                        result.error ||
                        "Unable to process payment. Please try again.",
                      type: "error",
                    });
                  }
                } catch (error) {
                  console.error("Error purchasing premium:", error);
                  showAlert({
                    title: "Error",
                    message: "Something went wrong. Please try again.",
                    type: "error",
                  });
                }
              },
            },
          ],
        });
        return;
      }
    }

    setLoading(true);
    setShowingStaticData(false);
    setBackgroundLoading(false);

    // Set up timeout to show static data if API takes too long
    const staticDataTimeout = setTimeout(() => {
      if (loading) {
        console.log("⚡ Loading timeout reached, showing static data first");
        setShowingStaticData(true);
        setLoading(false);
        setBackgroundLoading(true);

        // Get quick static profile
        const quickProfile = NumerologyService.generateProfile(
          userName,
          birthDate
        );
        const staticData = StaticDataService.getStaticLoveProfile(
          quickProfile.lifePathNumber,
          userName
        );

        // Show basic love match profile immediately
        const quickLoveMatch = LoveMatchService.generateBasicProfile(
          userName,
          birthDate,
          quickProfile.lifePathNumber
        );

        setProfile({
          ...quickLoveMatch,
          deadlySinWarning: staticData.deadlySinWarning,
          aiLoveInsights: staticData.aiLoveInsights,
        });
        setShowInput(false);
      }
    }, 5000); // 5 second timeout

    try {
      // Clear timeout if we complete quickly
      const clearTimeoutIfNeeded = () => {
        if (staticDataTimeout) {
          clearTimeout(staticDataTimeout);
        }
      };
      console.log(
        "💖 Love Match: Attempting to use Prokerala API for enhanced accuracy"
      );

      // Try to get enhanced numerology reading from Prokerala API first
      let numerologyProfile;

      try {
        // Add timeout to Prokerala API call
        const prokeralaPromise =
          ProkeralaNumerologyService.getNumerologyReading(userName, birthDate);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("API timeout")), 3000)
        );

        const prokeralaReading = await Promise.race([
          prokeralaPromise,
          timeoutPromise,
        ]);

        if (prokeralaReading && typeof prokeralaReading === "object") {
          console.log("✨ Love Match: Using enhanced Prokerala API data");
          const profile = NumerologyService.generateProfile(
            userName,
            birthDate
          );
          numerologyProfile = {
            lifePathNumber:
              prokeralaReading.life_path_number || profile.lifePathNumber,
            destinyNumber:
              prokeralaReading.destiny_number || profile.destinyNumber,
            soulUrgeNumber:
              prokeralaReading.soul_urge_number || profile.soulUrgeNumber,
            personalityNumber:
              prokeralaReading.personality_number || profile.personalityNumber,
            personalYearNumber: profile.personalYearNumber,
          };
        } else {
          throw new Error("Invalid Prokerala API response");
        }
      } catch (error) {
        console.log(
          "⚠️ Love Match: Prokerala API failed, using local calculation:",
          error.message
        );
        // Fallback to local calculation
        numerologyProfile = NumerologyService.generateProfile(
          userName,
          birthDate
        );
      }

      // Generate love match profile (local calculation - fast)
      const loveMatchProfile = await LoveMatchService.generateLoveMatchProfile(
        userName,
        birthDate,
        numerologyProfile.lifePathNumber,
        numerologyProfile.destinyNumber,
        numerologyProfile.soulUrgeNumber,
        numerologyProfile.personalityNumber
      );

      // Get static data immediately (under 1 second)
      const staticData = StaticDataService.getStaticLoveProfile(
        numerologyProfile.lifePathNumber,
        userName
      );

      // Clear timeout since we completed successfully
      clearTimeoutIfNeeded();

      // Set profile with static data first - instant display
      setProfile({
        ...loveMatchProfile,
        deadlySinWarning: staticData.deadlySinWarning,
        aiLoveInsights: staticData.aiLoveInsights,
      });
      setShowInput(false);
      setShowingStaticData(false);
      setLoading(false);

      // Start background loading for complex data immediately
      setBackgroundLoading(true);
      setAiLoadingStates({
        deadlySin: true,
        insights: true,
        celebrities: true,
      });

      // Load complex data in background - immediate load without random delay
      Promise.allSettled([
        // AI enhancement for premium users only (faster loading)
        ...(usageStats?.isPremium
          ? [
              Promise.race([
                SimpleAIService.generateDeadlySinWarning(
                  numerologyProfile
                ),
                new Promise((_, reject) =>
                  setTimeout(() => reject(new Error("AI timeout")), 5000)
                ),
              ]),
              Promise.race([
                SimpleAIService.generateResponse(
                  `Create a brief personalized love insight for ${userName} (Life Path ${numerologyProfile.lifePathNumber}). Keep under 100 words, no formatting.`, 'love'
                ),
                new Promise((_, reject) =>
                  setTimeout(() => reject(new Error("AI timeout")), 5000)
                ),
              ]),
            ]
          : []),

        // Celebrity matches (always load)
        CelebrityMatchService.findCelebrityMatches(
          numerologyProfile.lifePathNumber,
          numerologyProfile.destinyNumber,
          numerologyProfile.soulUrgeNumber,
          userName,
          2
        ),

        // All celebrity matches for show more
        CelebrityMatchService.findCelebrityMatches(
          numerologyProfile.lifePathNumber,
          numerologyProfile.destinyNumber,
          numerologyProfile.soulUrgeNumber,
          userName,
          10
        ),
      ])
        .then((results) => {
          console.log("🚀 Background data loaded");

          let deadlySinResult,
            insightsResult,
            initialCelebritiesResult,
            allCelebritiesResult;

          if (usageStats?.isPremium) {
            [
              deadlySinResult,
              insightsResult,
              initialCelebritiesResult,
              allCelebritiesResult,
            ] = results;
          } else {
            [initialCelebritiesResult, allCelebritiesResult] = results;
          }

          // Update profile with AI enhancements if available
          if (deadlySinResult?.status === "fulfilled") {
            setProfile((prev) =>
              prev
                ? {
                    ...prev,
                    deadlySinWarning: deadlySinResult.value,
                  }
                : null
            );
            setAiLoadingStates((prev) => ({ ...prev, deadlySin: false }));
          } else if (deadlySinResult?.status === "rejected") {
            console.log("⚠️ Deadly sin warning failed, keeping static version");
            setAiLoadingStates((prev) => ({ ...prev, deadlySin: false }));
          }

          if (insightsResult?.status === "fulfilled") {
            // Extract content from UniversalAIService response
            const content =
              insightsResult.value?.content || insightsResult.value;
            setProfile((prev) =>
              prev
                ? {
                    ...prev,
                    aiLoveInsights:
                      typeof content === "string"
                        ? content.replace(/\*/g, "")
                        : "",
                  }
                : null
            );
            setAiLoadingStates((prev) => ({ ...prev, insights: false }));
          } else if (insightsResult?.status === "rejected") {
            console.log("⚠️ AI insights failed, keeping static version");
            setAiLoadingStates((prev) => ({ ...prev, insights: false }));
          }

          // Update celebrity matches
          if (initialCelebritiesResult?.status === "fulfilled") {
            setCelebrityMatches(initialCelebritiesResult.value);
            setAiLoadingStates((prev) => ({ ...prev, celebrities: false }));
          }
          if (allCelebritiesResult?.status === "fulfilled") {
            setAllCelebrityMatches(allCelebritiesResult.value);
          }

          // Get incompatible numbers
          const incompatibles = CelebrityMatchService.getIncompatibleNumbers(
            numerologyProfile.lifePathNumber,
            numerologyProfile.destinyNumber,
            numerologyProfile.soulUrgeNumber
          );
          setIncompatibleNumbers(incompatibles);

          setBackgroundLoading(false);
        })
        .catch((error) => {
          console.error("Background loading error:", error);
          setBackgroundLoading(false);
        });

      // Track usage by recording in database (in background)
      if (user?.id) {
        const fullName =
          userName ||
          profileData?.full_name ||
          user?.fullName ||
          `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
        Promise.all([
          SubscriptionService.recordUsage(user.id, "loveMatch", {
            user_name: fullName,
            birth_date: birthDate,
            life_path_number:
              loveMatchProfile.userLifePath || numerologyProfile.lifePathNumber,
            compatible_partners:
              loveMatchProfile.compatiblePartners?.length || 0,
            celebrity_matches: 0, // Will be updated when celebrities load
          }),
          SubscriptionService.getUsageStats(user.id),
        ])
          .then(([_, stats]) => {
            const resetDate = new Date(stats.loveMatch.resetsAt);
            const now = new Date();
            const daysUntilReset = Math.ceil(
              (resetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            );

            setUsageStats({
              loveMatchUsage: stats.loveMatch.totalUsed,
              loveMatchRemaining: stats.loveMatch.remaining,
              daysUntilReset: Math.max(0, daysUntilReset),
              isPremium: stats.isPremium,
            });
          })
          .catch((error) => {
            console.error("Error tracking usage:", error);
          });
      }
    } catch (error) {
      clearTimeoutIfNeeded();
      setLoading(false);
      setShowingStaticData(false);
      setBackgroundLoading(false);
      Alert.alert(
        "Error",
        "Failed to generate love match profile. Please check your information."
      );
      console.error("Love match calculation error:", error);
    }
  };

  const resetCalculation = () => {
    setProfile(null);
    setShowInput(true);
    setBirthDate("");
    setExpandedPartner(null);
    setCelebrityMatches([]);
    setAllCelebrityMatches([]);
    setShowAllCelebrities(false);
    setIncompatibleNumbers(null);
    setLoading(false); // Reset loading state
  };

  const togglePartner = (index: number) => {
    setExpandedPartner(expandedPartner === index ? null : index);
  };

  if (showInput || !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Ionicons
              name="heart"
              size={48}
              color={DesignSystem.colors.primary.solidPurple}
            />
            <Text style={styles.title}>Love Match Analysis</Text>
            <Text style={styles.description}>
              Discover your perfect romantic compatibility through numerology
            </Text>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Your Information</Text>

            <View style={styles.inputContainer}>
              <ShadcnInput
                label="Full Name"
                placeholder="Enter your full name"
                value={userName}
                onChangeText={setUserName}
                autoCapitalize="words"
                leftIcon="person"
                required
              />
            </View>

            <View style={styles.inputContainer}>
              <DatePicker
                label="Birth Date (MM/DD/YYYY)"
                value={
                  birthDate
                    ? (() => {
                        try {
                          const [month, day, year] = birthDate.split("/");
                          if (month && day && year) {
                            return new Date(
                              parseInt(year),
                              parseInt(month) - 1,
                              parseInt(day)
                            );
                          }
                          return undefined;
                        } catch (error) {
                          console.log("Error parsing birth date:", error);
                          return undefined;
                        }
                      })()
                    : undefined
                }
                onSelect={(date) => {
                  if (date) {
                    const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}/${date.getFullYear()}`;
                    setBirthDate(formattedDate);
                  }
                }}
                placeholder="MM/DD/YYYY"
                maxDate={new Date()}
              />
            </View>

            <ShadcnButton
              onPress={generateLoveMatch}
              variant="default"
              size="lg"
              disabled={loading}
              loading={loading}
              startIcon="heart"
              style={styles.calculateButton}
            >
              {loading ? "Finding Matches..." : "Find My Love Match"}
            </ShadcnButton>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (loading) {
    return <LoveMatchLoadingSkeleton />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.profileHeader}>
          <View style={styles.headerTop}>
            <Text style={styles.profileTitle}>Your Love Profile</Text>
            <View style={styles.headerActions}>
              {backgroundLoading && (
                <View style={styles.backgroundLoadingIndicator}>
                  <Ionicons name="sync" size={16} color="#E91E63" />
                  <Text style={styles.loadingText}>Loading details...</Text>
                </View>
              )}
              <TouchableOpacity
                onPress={resetCalculation}
                style={styles.resetButton}
              >
                <Ionicons name="refresh" size={20} color="#E91E63" />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.profileSubtitle}>
            {profile.name} • {profile.zodiacSign}
          </Text>

          {/* Usage Stats for Free Users */}
          {usageStats && !usageStats.isPremium && (
            <View style={styles.usageStatsContainer}>
              <View style={styles.usageStatsBadge}>
                <Ionicons name="heart" size={16} color="#FF69B4" />
                <Text style={styles.usageStatsText}>
                  {usageStats.loveMatchRemaining} of 5 free love matches
                  remaining
                </Text>
              </View>
              {usageStats.loveMatchRemaining <= 1 && (
                <Text style={styles.usageWarningText}>
                  Resets in {usageStats.daysUntilReset} days • Upgrade for
                  unlimited access
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Your Numbers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Love Numbers</Text>

          <View style={styles.numbersGrid}>
            <View style={styles.numberCard}>
              <Text style={styles.numberValue}>{profile.lifePathNumber}</Text>
              <Text style={styles.numberLabel}>Life Path</Text>
            </View>

            <View style={styles.numberCard}>
              <Text style={styles.numberValue}>{profile.destinyNumber}</Text>
              <Text style={styles.numberLabel}>Destiny</Text>
            </View>

            <View style={styles.numberCard}>
              <Text style={styles.numberValue}>{profile.soulUrgeNumber}</Text>
              <Text style={styles.numberLabel}>Soul Urge</Text>
            </View>
          </View>
        </View>

        {/* Relationship Style */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Relationship Style</Text>
          <View style={styles.analysisCard}>
            <ReadMoreText
              text={profile.relationshipStyle}
              maxLength={200}
              style={styles.analysisText}
            />
          </View>
        </View>

        {/* Deadly Sin Warning */}
        {(profile.deadlySinWarning || aiLoadingStates.deadlySin) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Love Warning</Text>
            {aiLoadingStates.deadlySin ? (
              <View style={styles.aiLoadingCard}>
                <View style={styles.aiLoadingHeader}>
                  <View style={styles.shimmerLine} />
                  <Text style={styles.aiLoadingText}>
                    🤖 AI is analyzing your love challenges...
                  </Text>
                  <Text style={styles.aiLoadingSubtext}>
                    Did you know? Your Life Path {profile.lifePathNumber} tends
                    to face specific relationship patterns. We're creating
                    personalized insights based on thousands of numerological
                    profiles.
                  </Text>
                </View>
                <View style={styles.shimmerContainer}>
                  <View style={[styles.shimmerLine, { width: "90%" }]} />
                  <View style={[styles.shimmerLine, { width: "75%" }]} />
                  <View style={[styles.shimmerLine, { width: "85%" }]} />
                </View>
              </View>
            ) : profile.deadlySinWarning ? (
              <View style={styles.deadlySinCard}>
                <View style={styles.deadlySinHeader}>
                  <Text style={styles.deadlySinTitle}>
                    Guard Against {profile.deadlySinWarning.sin} in Love
                  </Text>
                </View>
                <Text style={styles.deadlySinWarning}>
                  {profile.deadlySinWarning.warning}
                </Text>
                <View style={styles.consequencesContainer}>
                  <Text style={styles.consequencesLabel}>
                    Impact on Relationships:
                  </Text>
                  <Text style={styles.consequencesText}>
                    {profile.deadlySinWarning.consequences}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        )}

        {/* AI Love Insights */}
        {(profile.aiLoveInsights || aiLoadingStates.insights) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              💝 Personalized Love Insights
            </Text>
            {aiLoadingStates.insights ? (
              <View style={styles.aiLoadingCard}>
                <View style={styles.aiLoadingHeader}>
                  <Text style={styles.aiLoadingText}>
                    🎯 Crafting your unique love profile...
                  </Text>
                  <Text style={styles.aiLoadingSubtext}>
                    Fun fact: People with your numerological combination often
                    attract partners born in
                    {profile.lifePathNumber <= 3
                      ? " spring months"
                      : profile.lifePathNumber <= 6
                        ? " summer months"
                        : profile.lifePathNumber <= 9
                          ? " fall months"
                          : " winter months"}
                    . Our AI is analyzing cosmic patterns just for you!
                  </Text>
                </View>
                <View style={styles.shimmerContainer}>
                  <View style={[styles.shimmerLine, { width: "95%" }]} />
                  <View style={[styles.shimmerLine, { width: "80%" }]} />
                  <View style={[styles.shimmerLine, { width: "90%" }]} />
                  <View style={[styles.shimmerLine, { width: "70%" }]} />
                </View>
              </View>
            ) : profile.aiLoveInsights ? (
              <View style={styles.aiInsightsCard}>
                <ReadMoreText
                  text={profile.aiLoveInsights}
                  maxLength={250}
                  style={styles.aiInsightsText}
                />
              </View>
            ) : null}
          </View>
        )}

        {/* Ideal Traits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What You Seek in Love</Text>
          <View style={styles.traitsContainer}>
            {profile.idealTraits.map((trait, index) => (
              <View key={index} style={styles.traitTag}>
                <Text style={styles.traitText}>{trait}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Compatible Partners */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Compatible Partners</Text>

          {profile.compatiblePartners.map((partner, index) => (
            <TouchableOpacity
              key={index}
              style={styles.partnerCard}
              onPress={() => togglePartner(index)}
            >
              <View style={styles.partnerHeader}>
                <View style={styles.partnerInfo}>
                  <View style={styles.partnerNumbers}>
                    <Text style={styles.partnerNumber}>
                      {partner.lifePathNumber}
                    </Text>
                    <Text style={styles.partnerNumber}>
                      {partner.destinyNumber}
                    </Text>
                    <Text style={styles.partnerNumber}>
                      {partner.soulUrgeNumber}
                    </Text>
                  </View>
                  <View style={styles.compatibilityScore}>
                    <Text style={styles.scoreText}>
                      {partner.compatibilityScore}%
                    </Text>
                    <Text style={styles.scoreLabel}>Match</Text>
                  </View>
                </View>
                <Ionicons
                  name={
                    expandedPartner === index ? "chevron-up" : "chevron-down"
                  }
                  size={20}
                  color="#8E8E93"
                />
              </View>

              {expandedPartner === index && (
                <View style={styles.expandedPartner}>
                  <Text style={styles.partnerDescription}>
                    {partner.description}
                  </Text>

                  <View style={styles.partnerSection}>
                    <Text style={styles.partnerSectionTitle}>
                      Relationship Strengths
                    </Text>
                    {partner.strengths.map((strength, idx) => (
                      <Text key={idx} style={styles.partnerListItem}>
                        • {strength}
                      </Text>
                    ))}
                  </View>

                  <View style={styles.partnerSection}>
                    <Text style={styles.partnerSectionTitle}>
                      Potential Challenges
                    </Text>
                    {partner.challenges.map((challenge, idx) => (
                      <Text key={idx} style={styles.partnerListItem}>
                        • {challenge}
                      </Text>
                    ))}
                  </View>

                  {partner.sampleBirthDates.length > 0 && (
                    <View style={styles.partnerSection}>
                      <Text style={styles.partnerSectionTitle}>
                        Sample Birth Dates
                      </Text>
                      <View style={styles.birthDatesContainer}>
                        {partner.sampleBirthDates
                          .slice(0, 4)
                          .map((date, idx) => (
                            <View key={idx} style={styles.dateTag}>
                              <Text style={styles.dateText}>{date}</Text>
                            </View>
                          ))}
                      </View>
                    </View>
                  )}

                  {partner.famousCouples.length > 0 && (
                    <View style={styles.partnerSection}>
                      <Text style={styles.partnerSectionTitle}>
                        Famous Examples
                      </Text>
                      {partner.famousCouples.map((couple, idx) => (
                        <View key={idx} style={styles.coupleCard}>
                          <Text style={styles.coupleNames}>
                            {couple.person1} & {couple.person2}
                          </Text>
                          <Text style={styles.coupleStory}>{couple.story}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Celebrity Matches */}
        {(celebrityMatches.length > 0 || aiLoadingStates.celebrities) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌟 Celebrity Compatibility</Text>
            <Text style={styles.sectionSubtitle}>
              Famous personalities who share your cosmic energy
            </Text>

            {aiLoadingStates.celebrities && celebrityMatches.length === 0 && (
              <View style={styles.aiLoadingCard}>
                <View style={styles.aiLoadingHeader}>
                  <Text style={styles.aiLoadingText}>
                    ✨ Finding your celebrity soulmates...
                  </Text>
                  <Text style={styles.aiLoadingSubtext}>
                    Did you know? Life Path {profile.lifePathNumber} shares
                    cosmic energy with many famous personalities! We're scanning
                    our database of over 500 celebrities to find your perfect
                    matches based on numerological compatibility algorithms.
                  </Text>
                </View>
                <View style={styles.celebrityLoadingContainer}>
                  {[1, 2].map((_, index) => (
                    <View key={index} style={styles.celebrityLoadingSkeleton}>
                      <View style={styles.shimmerCircle} />
                      <View style={styles.celebrityLoadingText}>
                        <View style={[styles.shimmerLine, { width: "60%" }]} />
                        <View style={[styles.shimmerLine, { width: "40%" }]} />
                      </View>
                      <View style={styles.shimmerScore} />
                    </View>
                  ))}
                </View>
              </View>
            )}

            {(showAllCelebrities ? allCelebrityMatches : celebrityMatches).map(
              (celebrity, index) => (
                <View key={index} style={styles.celebrityCard}>
                  <View style={styles.celebrityHeader}>
                    <View style={styles.celebrityInfo}>
                      <Text style={styles.celebrityName}>{celebrity.name}</Text>
                      <Text style={styles.celebrityProfession}>
                        {celebrity.profession}
                      </Text>
                      <View style={styles.celebrityNumbers}>
                        <View style={styles.celebrityNumber}>
                          <Text style={styles.celebrityNumberValue}>
                            {celebrity.lifePathNumber}
                          </Text>
                          <Text style={styles.celebrityNumberLabel}>
                            Life Path
                          </Text>
                        </View>
                        <Text style={styles.celebrityBirthDate}>
                          {celebrity.birthDate}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.celebrityScore}>
                      <Text style={styles.celebrityScoreValue}>
                        {celebrity.compatibilityScore}%
                      </Text>
                      <Text style={styles.celebrityScoreLabel}>Match</Text>
                    </View>
                  </View>
                  <View style={styles.celebrityReason}>
                    <Text style={styles.celebrityReasonText}>
                      {celebrity.matchReason}
                    </Text>
                  </View>
                </View>
              )
            )}

            {/* Show More Button at Bottom */}
            {allCelebrityMatches.length > 2 && (
              <TouchableOpacity
                onPress={() => {
                  console.log(
                    "🔄 Show All Celebrities toggled:",
                    !showAllCelebrities
                  );
                  console.log(
                    "📊 Celebrity matches count:",
                    celebrityMatches.length
                  );
                  console.log(
                    "📊 All celebrity matches count:",
                    allCelebrityMatches.length
                  );
                  setShowAllCelebrities(!showAllCelebrities);
                }}
                style={styles.showMoreButtonBottom}
              >
                <Text style={styles.showMoreText}>
                  {showAllCelebrities
                    ? "▲ Show Less"
                    : `▼ Show ${allCelebrityMatches.length - celebrityMatches.length} More Celebrities`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Numbers to Avoid */}
        {incompatibleNumbers && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              ⚠️ Numbers to Be Cautious Of
            </Text>
            <Text style={styles.sectionSubtitle}>
              Understanding potential challenges in compatibility
            </Text>

            <View style={styles.incompatibleCard}>
              <View style={styles.incompatibleSection}>
                <Text style={styles.incompatibleTitle}>
                  Life Path Numbers to Watch
                </Text>
                <View style={styles.numbersRow}>
                  {incompatibleNumbers.lifePathNumbers.map((number, index) => (
                    <View key={index} style={styles.warningNumber}>
                      <Text style={styles.warningNumberText}>{number}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.incompatibleSection}>
                <Text style={styles.incompatibleTitle}>
                  Destiny Numbers to Watch
                </Text>
                <View style={styles.numbersRow}>
                  {incompatibleNumbers.destinyNumbers.map((number, index) => (
                    <View key={index} style={styles.warningNumber}>
                      <Text style={styles.warningNumberText}>{number}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.incompatibleSection}>
                <Text style={styles.incompatibleTitle}>
                  Soul Urge Numbers to Watch
                </Text>
                <View style={styles.numbersRow}>
                  {incompatibleNumbers.soulUrgeNumbers.map((number, index) => (
                    <View key={index} style={styles.warningNumber}>
                      <Text style={styles.warningNumberText}>{number}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.reasonsSection}>
                <Text style={styles.reasonsTitle}>
                  Why These Numbers May Challenge You:
                </Text>
                {incompatibleNumbers.reasons.map((reason, index) => (
                  <Text key={index} style={styles.reasonText}>
                    • {reason}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Custom Alert Component */}
      {AlertComponent}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140, // Extra space for tab navigator on mobile
    flexGrow: 1,
  },
  header: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 22,
  },
  inputSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  inputLabel: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  nameCard: {
    marginBottom: 0,
    padding: DesignSystem.spacing.scale.lg,
  },
  nameDisplay: {
    fontSize: DesignSystem.typography.sizes.base,
    color: DesignSystem.colors.text.primary,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  calculateButton: {
    marginTop: DesignSystem.spacing.scale["2xl"],
  },
  disabledButton: {
    opacity: 0.6,
  },
  calculateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  profileHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backgroundLoadingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(233, 30, 99, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  loadingText: {
    fontSize: 10,
    color: "#E91E63",
    fontWeight: "500",
  },
  profileTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  resetButton: {
    padding: 8,
  },
  profileSubtitle: {
    fontSize: 16,
    color: "#8E8E93",
  },
  usageStatsContainer: {
    marginTop: 16,
    alignItems: "center",
    gap: 4,
  },
  usageStatsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 105, 180, 0.2)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  usageStatsText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF69B4",
  },
  usageWarningText: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  numbersGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  numberCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: 16,
    width: "30%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  numberValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#E91E63",
    marginBottom: 4,
  },
  numberLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8E8E93",
    textAlign: "center",
  },
  analysisCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  analysisText: {
    fontSize: 16,
    color: "#FFFFFF",
    lineHeight: 24,
  },
  traitsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  traitTag: {
    backgroundColor: "#E91E63",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  traitText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  partnerCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2C2C2E",
    overflow: "hidden",
  },
  partnerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  partnerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  partnerNumbers: {
    flexDirection: "row",
    marginRight: 16,
  },
  partnerNumber: {
    backgroundColor: "#2C2C2E",
    color: "#E91E63",
    fontSize: 16,
    fontWeight: "bold",
    width: 32,
    height: 32,
    textAlign: "center",
    textAlignVertical: "center",
    borderRadius: 16,
    marginRight: 4,
    lineHeight: 32,
  },
  compatibilityScore: {
    alignItems: "center",
    marginLeft: "auto",
  },
  scoreText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E91E63",
  },
  scoreLabel: {
    fontSize: 12,
    color: "#8E8E93",
  },
  expandedPartner: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: "#2C2C2E",
  },
  partnerDescription: {
    fontSize: 16,
    color: "#FFFFFF",
    lineHeight: 24,
    marginBottom: 16,
  },
  partnerSection: {
    marginBottom: 16,
  },
  partnerSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E91E63",
    marginBottom: 8,
  },
  partnerListItem: {
    fontSize: 15,
    color: "#FFFFFF",
    marginBottom: 4,
    lineHeight: 20,
  },
  birthDatesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dateTag: {
    backgroundColor: "#2C2C2E",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dateText: {
    color: "#FFFFFF",
    fontSize: 12,
  },
  coupleCard: {
    backgroundColor: "#2C2C2E",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  coupleNames: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  coupleStory: {
    fontSize: 13,
    color: "#8E8E93",
    lineHeight: 18,
  },
  deadlySinCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: "#FF3B30",
  },
  deadlySinHeader: {
    marginBottom: 12,
  },
  deadlySinTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF3B30",
    textAlign: "center",
  },
  deadlySinWarning: {
    fontSize: 16,
    color: "#FFFFFF",
    lineHeight: 24,
    marginBottom: 16,
    textAlign: "center",
  },
  consequencesContainer: {
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderRadius: 8,
    padding: 12,
  },
  consequencesLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF3B30",
    marginBottom: 6,
  },
  consequencesText: {
    fontSize: 14,
    color: "#FFFFFF",
    lineHeight: 20,
  },

  // AI Love Insights Styles
  aiInsightsCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: "#667eea",
  },
  aiInsightsText: {
    fontSize: 15,
    color: "#FFFFFF",
    lineHeight: 22,
    textAlign: "left",
  },

  // Celebrity Matches Styles
  showMoreText: {
    color: "#E91E63",
    fontSize: 14,
    fontWeight: "600",
  },
  showMoreButtonBottom: {
    backgroundColor: "rgba(233, 30, 99, 0.1)",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: "rgba(233, 30, 99, 0.3)",
    alignItems: "center",
    marginTop: 16,
    borderStyle: "dashed",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 16,
    fontStyle: "italic",
  },
  celebrityCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2C2C2E",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  celebrityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  celebrityInfo: {
    flex: 1,
  },
  celebrityName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  celebrityProfession: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 8,
  },
  celebrityNumbers: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  celebrityNumber: {
    alignItems: "center",
  },
  celebrityNumberValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E91E63",
  },
  celebrityNumberLabel: {
    fontSize: 10,
    color: "#8E8E93",
  },
  celebrityBirthDate: {
    fontSize: 12,
    color: "#8E8E93",
  },
  celebrityScore: {
    alignItems: "center",
    backgroundColor: "rgba(233, 30, 99, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  celebrityScoreValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E91E63",
  },
  celebrityScoreLabel: {
    fontSize: 10,
    color: "#E91E63",
    fontWeight: "500",
  },
  celebrityReason: {
    backgroundColor: "rgba(233, 30, 99, 0.05)",
    borderRadius: 8,
    padding: 12,
  },
  celebrityReasonText: {
    fontSize: 14,
    color: "#FFFFFF",
    lineHeight: 20,
    fontStyle: "italic",
  },

  // Incompatible Numbers Styles
  incompatibleCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: "#FF3B30",
  },
  incompatibleSection: {
    marginBottom: 16,
  },
  incompatibleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF3B30",
    marginBottom: 8,
  },
  numbersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  warningNumber: {
    backgroundColor: "rgba(255, 59, 48, 0.2)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 59, 48, 0.4)",
  },
  warningNumberText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF3B30",
  },
  reasonsSection: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 59, 48, 0.2)",
  },
  reasonsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  reasonText: {
    fontSize: 13,
    color: "#8E8E93",
    lineHeight: 18,
    marginBottom: 4,
  },

  // AI Loading States
  aiLoadingCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  aiLoadingHeader: {
    marginBottom: 16,
  },
  aiLoadingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#667eea",
    marginBottom: 8,
  },
  aiLoadingSubtext: {
    fontSize: 14,
    color: "#8E8E93",
    lineHeight: 20,
    fontStyle: "italic",
  },
  shimmerContainer: {
    gap: 8,
  },
  shimmerLine: {
    height: 16,
    backgroundColor: "#2C2C2E",
    borderRadius: 8,
    marginBottom: 8,
    overflow: "hidden",
  },
  shimmerCircle: {
    width: 50,
    height: 50,
    backgroundColor: "#2C2C2E",
    borderRadius: 25,
  },
  shimmerScore: {
    width: 60,
    height: 40,
    backgroundColor: "#2C2C2E",
    borderRadius: 8,
  },
  celebrityLoadingContainer: {
    gap: 12,
  },
  celebrityLoadingSkeleton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  celebrityLoadingText: {
    flex: 1,
    marginLeft: 12,
    gap: 6,
  },
});
