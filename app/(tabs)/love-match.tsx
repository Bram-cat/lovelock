import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCustomAlert, showUsageLimitAlert } from "../../components/CustomAlert";
import { LoveMatchLoadingSkeleton } from "../../components/LoadingSkeletons";
import ReadMoreText from "../../components/ReadMoreText";
import { DatePicker, ShadcnButton, ShadcnInput } from "../../components/ui";
import { DesignSystem } from "../../constants/DesignSystem";
import { useProfile } from "../../contexts/ProfileContext";
import {
  CelebrityMatch,
  CelebrityMatchService,
  IncompatibleNumbers,
} from "../../services/CelebrityMatchService";
import {
  DeadlySinWarning,
  LoveMatchProfile,
  LoveMatchService,
} from "../../services/LoveMatchService";
import NumerologyService from "../../services/NumerologyService";
import { RoxyNumerologyService } from "../../services/ProkeralaNumerologyService";
import { SimpleAIService } from "../../services/SimpleAIService";
import { StaticDataService } from "../../services/StaticDataService";
import { SubscriptionService } from "../../services/SubscriptionService";
import { useSubscription } from "../../hooks/useSubscription";
import { UsageTrackingService } from "../../services/UsageTrackingService";
import UpgradePromptModal from "../../components/UpgradePromptModal";
import { OnboardingService } from "../../services/OnboardingService";

// Type guard for DeadlySinWarning
const isDeadlySinWarning = (obj: any): obj is DeadlySinWarning => {
  return (
    obj &&
    typeof obj.sin === "string" &&
    typeof obj.warning === "string" &&
    typeof obj.consequences === "string"
  );
};

export default function LoveMatchScreen() {
  const { user } = useUser();
  const { profileData } = useProfile();
  const { subscription, canUse, openPricingPage } = useSubscription();
  const [profile, setProfile] = useState<LoveMatchProfile | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [birthDate, setBirthDate] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showingStaticData, setShowingStaticData] = useState(false);
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [aiLoadingStates, setAiLoadingStates] = useState({
    deadlySin: false,
    insights: false,
    celebrities: false,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [userIsEditing, setUserIsEditing] = useState(false);

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
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradePromptConfig, setUpgradePromptConfig] = useState<any>(null);
  const { showAlert, AlertComponent } = useCustomAlert();

  // Load usage statistics
  useEffect(() => {
    const loadUsageStats = async () => {
      if (user?.id) {
        try {
          const stats = await SubscriptionService.getUsageStats(user.id);

          setUsageStats({
            loveMatchUsage: stats.loveMatch.used,
            loveMatchRemaining: stats.loveMatch.limit - stats.loveMatch.used,
            daysUntilReset: 30, // Default reset period
            isPremium: false,
          });
        } catch (error) {
          // Silent error handling for production
        }
      }
    };
    loadUsageStats();
  }, [user?.id]);

  useEffect(() => {
    // Only auto-populate from database if user is not actively editing
    if (userIsEditing) return;

    // Auto-show input if user has name but no profile yet
    const profileFullName =
      profileData?.full_name ||
      user?.fullName ||
      `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
    if (profileFullName && profileFullName !== "" && !profile) {
      setShowInput(true);
    }

    // Global name synchronization
    if (profileFullName && profileFullName !== fullName) {
      setFullName(profileFullName);
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
  }, [user, profile, profileData, fullName, userIsEditing]);

  // Force update birthday when profile data changes (only if user is not editing)
  useEffect(() => {
    if (userIsEditing) return;

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
  }, [profileData?.birth_date, userIsEditing]); // Watch specifically for birth_date changes

  // Show feature introduction for new users
  useEffect(() => {
    const showIntroduction = async () => {
      if (user?.id && showInput && !profile) {
        try {
          const { shouldShow, alertConfig } = await OnboardingService.getFeatureIntro(user.id, 'loveMatch');
          if (shouldShow && alertConfig) {
            showAlert(alertConfig);
          }
        } catch (error) {
          console.error('Error showing love match introduction:', error);
        }
      }
    };

    showIntroduction();
  }, [user?.id, showInput, profile]);

  // Reset loading state when switching to input mode
  useEffect(() => {
    if (showInput) {
      setLoading(false);
    }
  }, [showInput]);

  // Pull to refresh function
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Reset the profile if exists
      if (profile) {
        setProfile(null);
        setShowInput(true);
      }
      
      // Simulate some loading time for smooth UX
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Failed to refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const generateLoveMatch = async () => {
    // Check usage limits first
    if (!canUse("loveMatch")) {
      showAlert({
        type: "limit",
        title: "💕 Love Match Limit Reached",
        message: `You've used all your love match readings for this month.\n\nUpgrade to Premium for 15 matches per month, or upgrade to Unlimited for unlimited access!`,
        buttons: [
          {
            text: "Maybe Later",
            style: "cancel",
          },
          {
            text: "Upgrade Now",
            style: "upgrade",
            onPress: openPricingPage,
          },
        ],
      });
      return;
    }

    const fullUserName = fullName.trim();

    if (!fullUserName) {
      showAlert({
        type: "error",
        title: "Name Required",
        message: "Please enter your full name to find your love matches"
      });
      return;
    }

    if (!birthDate) {
      showAlert({
        type: "error",
        title: "Birth Date Required",
        message: "Please enter your birth date to calculate compatibility"
      });
      return;
    }

    // Validate date format
    const datePattern =
      /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/(19|20)\d{2}$/;
    if (!datePattern.test(birthDate)) {
      showAlert({
        type: "warning",
        title: "Invalid Date Format",
        message: "Please enter your birth date in MM/DD/YYYY format (e.g., 03/15/1990)"
      });
      return;
    }

    // Track love match usage
    if (user?.id) {
      UsageTrackingService.trackLoveMatchUsage(user.id, {
        name: fullUserName,
        birthDate: birthDate,
        timestamp: new Date().toISOString(),
      });
    }

    // Check usage limits first
    if (user?.id) {
      try {
        const usageCheck = await SubscriptionService.checkUsageLimitWithPrompt(user.id, 'love_match');

        if (!usageCheck.canUse) {
          showUsageLimitAlert(
            showAlert,
            'love_match',
            usageCheck.promptConfig?.usedCount || 0,
            usageCheck.promptConfig?.limitCount || 2,
            () => {
              // Open pricing page or handle upgrade
              console.log('Upgrade to premium clicked');
            }
          );
          return;
        }
      } catch (error) {
        console.error('Error checking usage limits:', error);
        showAlert({
          type: "error",
          title: "Connection Error",
          message: "Unable to verify usage limits. Please check your connection and try again."
        });
        return;
      }
    }

    setLoading(true);

    try {
      // STEP 1: Show basic love match immediately (< 100ms)
      const quickProfile = NumerologyService.generateProfile(
        fullUserName,
        birthDate
      );
      const basicLoveMatch = LoveMatchService.generateBasicProfile(
        fullUserName,
        birthDate,
        quickProfile.lifePathNumber
      );

      // Set basic profile first - instant display
      setProfile({
        ...basicLoveMatch,
        aiLoveInsights: "Analyzing your love compatibility...",
        deadlySinWarning: undefined,
      });
      setShowInput(false);
      setLoading(false); // Stop loading immediately

      // STEP 2: Get enhanced Roxy API data in background
      setBackgroundLoading(true);
      RoxyNumerologyService.getNumerologyReading(
        fullUserName.split(" ")[0] || "",
        fullUserName.split(" ").slice(1).join(" ") || "",
        birthDate
      )
        .then((prokeralaData) => {
          if (prokeralaData) {
            // Update with professional data when available, including updated numerology numbers
            setProfile((prev) =>
              prev
                ? {
                    ...prev,
                    lifePathNumber:
                      prokeralaData.life_path_number || prev.lifePathNumber,
                    destinyNumber:
                      prokeralaData.destiny_number || prev.destinyNumber,
                    soulUrgeNumber:
                      prokeralaData.soul_urge_number || prev.soulUrgeNumber,
                    aiLoveInsights:
                      prokeralaData.relationship_guidance ||
                      prev.aiLoveInsights,
                    prokeralaInsights: {
                      strengths: prokeralaData.strengths,
                      challenges: prokeralaData.challenges,
                      compatibility: prokeralaData.relationship_guidance,
                      luckyNumbers: prokeralaData.lucky_numbers,
                      luckyColors: prokeralaData.lucky_colors,
                    },
                  }
                : null
            );
          }
        })
        .catch((error) => {
          // Fallback to static data
          const staticData = StaticDataService.getStaticLoveProfile(
            quickProfile.lifePathNumber,
            fullUserName
          );
          setProfile((prev) =>
            prev
              ? {
                  ...prev,
                  aiLoveInsights: staticData.aiLoveInsights,
                  deadlySinWarning: staticData.deadlySinWarning,
                }
              : null
          );
        })
        .finally(() => {
          setBackgroundLoading(false);
        });

      // STEP 3: Minimal AI processing (only deadly sins warning)
      setTimeout(async () => {
        setAiLoadingStates({
          deadlySin: true,
          insights: false,
          celebrities: true,
        });

        // Load minimal AI and celebrity data in background
        Promise.allSettled([
          // Only deadly sins warning (always generate)
          Promise.race([
            SimpleAIService.generateDeadlySinWarning(quickProfile),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("AI timeout")), 5000)
            ),
          ]),

          // Celebrity matches (just 2 - male and female)
          CelebrityMatchService.findCelebrityMatchesByGender(
            quickProfile.lifePathNumber,
            quickProfile.destinyNumber,
            quickProfile.soulUrgeNumber,
            fullUserName
          ),
        ])
          .then((results) => {
            console.log("🚀 Minimal background data loaded");

            const [deadlySinResult, celebritiesResult] = results;

            // Update profile with deadly sin warning
            if (deadlySinResult?.status === "fulfilled") {
              const warningData = deadlySinResult.value;
              if (isDeadlySinWarning(warningData)) {
                setProfile((prev) =>
                  prev
                    ? {
                        ...prev,
                        deadlySinWarning: warningData,
                      }
                    : null
                );
              } else {
                console.error(
                  "Invalid deadly sin warning structure:",
                  warningData
                );
              }
              setAiLoadingStates((prev) => ({ ...prev, deadlySin: false }));
            } else {
              console.log("⚠️ Deadly sin warning failed, using static version");
              // Use static fallback for deadly sins warning
              const staticWarning = StaticDataService.getStaticDeadlySinWarning(
                quickProfile.lifePathNumber,
                fullUserName
              );
              setProfile((prev) =>
                prev
                  ? {
                      ...prev,
                      deadlySinWarning: staticWarning,
                    }
                  : null
              );
              setAiLoadingStates((prev) => ({ ...prev, deadlySin: false }));
            }

            // Update celebrity matches (just 2)
            if (celebritiesResult?.status === "fulfilled") {
              setCelebrityMatches(celebritiesResult.value);
              setAllCelebrityMatches(celebritiesResult.value);
              setAiLoadingStates((prev) => ({ ...prev, celebrities: false }));
            }

            // Get incompatible numbers
            const incompatibles = CelebrityMatchService.getIncompatibleNumbers(
              quickProfile.lifePathNumber,
              quickProfile.destinyNumber,
              quickProfile.soulUrgeNumber
            );
            setIncompatibleNumbers(incompatibles);

            setBackgroundLoading(false);
          })
          .catch((error) => {
            console.error("Minimal background loading error:", error);
            setBackgroundLoading(false);
          });

        // Track usage after successful generation
        if (user?.id) {
          try {
            await SubscriptionService.trackUsage(user.id, 'love_match', {
              readingType: 'love_match_analysis',
              fullName: fullUserName,
              birthDate,
              lifePathNumber: basicLoveMatch.lifePathNumber || quickProfile.lifePathNumber,
              destinyNumber: basicLoveMatch.destinyNumber || quickProfile.destinyNumber,
              soulUrgeNumber: basicLoveMatch.soulUrgeNumber || quickProfile.soulUrgeNumber,
              compatiblePartners: basicLoveMatch.compatiblePartners?.length || 0,
              timestamp: new Date().toISOString()
            });
            console.log('✅ Love Match usage tracked successfully');
          } catch (error) {
            console.error('Error tracking love match usage:', error);
          }
        }
      }, 1000); // End setTimeout
    } catch (error) {
      setLoading(false);
      setShowingStaticData(false);
      setBackgroundLoading(false);
      showAlert({
        type: "error",
        title: "Love Match Failed",
        message: "We couldn't generate your love match profile right now. Please check your information and try again."
      });
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
    setUserIsEditing(false);
  };

  const handleNameChange = (newName: string) => {
    setUserIsEditing(true);
    setFullName(newName);
    // Clear profile if user changes name significantly
    if (profile && newName.trim() !== profile.name?.trim()) {
      resetCalculation();
    }
  };

  const handleBirthDateChange = (date: Date | undefined) => {
    setUserIsEditing(true);
    if (date) {
      const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}/${date.getFullYear()}`;
      setBirthDate(formattedDate);
      // Clear profile if user changes birth date
      if (profile && profile.birthDate !== formattedDate) {
        resetCalculation();
      }
    } else {
      setBirthDate('');
      if (profile) {
        resetCalculation();
      }
    }
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
                label="Your Full Name"
                placeholder="Enter your full name"
                value={fullName}
                onChangeText={handleNameChange}
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
                onSelect={handleBirthDateChange}
                placeholder="MM/DD/YYYY"
                maxDate={new Date()}
              />
            </View>

            {/* Usage Limit Warning */}
            {!canUse("loveMatch") && (
              <View style={styles.limitWarningContainer}>
                <Ionicons name="lock-closed" size={20} color="#FF6B9D" />
                <Text style={styles.limitWarningText}>
                  You've reached your love match limit for this month.
                  Upgrade to Premium for 15 matches per month!
                </Text>
              </View>
            )}

            <ShadcnButton
              onPress={generateLoveMatch}
              variant="default"
              size="lg"
              disabled={loading || !fullName.trim() || !birthDate || !canUse("loveMatch")}
              loading={loading}
              startIcon="heart"
              style={StyleSheet.flatten([
                styles.calculateButton,
                !canUse("loveMatch") && styles.limitExceededButton
              ])}
            >
              {loading
                ? "Finding Matches..."
                : !canUse("loveMatch")
                  ? "Limit Reached"
                  : "Find My Love Match"
              }
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
                    to face specific relationship patterns. We are creating
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
              One male and one female celebrity who match your cosmic energy
            </Text>

            {aiLoadingStates.celebrities && celebrityMatches.length === 0 && (
              <View style={styles.aiLoadingCard}>
                <View style={styles.aiLoadingHeader}>
                  <Text style={styles.aiLoadingText}>
                    ✨ Finding your celebrity soulmates...
                  </Text>
                  <Text style={styles.aiLoadingSubtext}>
                    Did you know? Life Path {profile.lifePathNumber} shares
                    cosmic energy with many famous personalities! We are
                    scanning our database of over 500 celebrities to find your
                    perfect matches based on numerological compatibility
                    algorithms.
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

            {celebrityMatches.map((celebrity, index) => (
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
            ))}
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

      {/* Upgrade Prompt Modal */}
      {upgradePromptConfig && (
        <UpgradePromptModal
          visible={showUpgradePrompt}
          onClose={() => setShowUpgradePrompt(false)}
          title={upgradePromptConfig.title}
          message={upgradePromptConfig.message}
          featureName={upgradePromptConfig.featureName}
          usedCount={upgradePromptConfig.usedCount}
          limitCount={upgradePromptConfig.limitCount}
        />
      )}
    </SafeAreaView>
  );
}

LoveMatchScreen.displayName = "LoveMatchScreen";

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
  limitExceededButton: {
    backgroundColor: "#666666",
    borderColor: "#666666",
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
  limitWarningContainer: {
    backgroundColor: "rgba(255, 107, 157, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 157, 0.3)",
  },
  limitWarningText: {
    color: "#FF6B9D",
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
});
