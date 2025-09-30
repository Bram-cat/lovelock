import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Animated,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  showUsageLimitAlert,
  useCustomAlert,
} from "../../components/CustomAlert";
import { NumerologyLoadingSkeleton } from "../../components/LoadingSkeletons";
import { DatePicker, ShadcnButton, ShadcnInput } from "../../components/ui";
import UpgradePromptModal from "../../components/UpgradePromptModal";
import { DesignSystem } from "../../constants/DesignSystem";
import { useProfile } from "../../contexts/ProfileContext";
import { useSubscription } from "../../hooks/useSubscription";
import NumerologyReadingScreen from "../../screens/NumerologyReadingScreen";
import NumerologyService from "../../services/NumerologyService";
import { OnboardingService } from "../../services/OnboardingService";
import { RoxyNumerologyService } from "../../services/ProkeralaNumerologyService";
import { SimpleAIService } from "../../services/SimpleAIService";
import { SubscriptionService } from "../../services/SubscriptionService";

export default function NumerologyScreen() {
  const { user } = useUser();
  const { profileData } = useProfile();
  const { showAlert, AlertComponent } = useCustomAlert();
  const { subscription, canUse, openPricingPage } = useSubscription();

  const [showInput, setShowInput] = useState(false);
  const [birthDate, setBirthDate] = useState("");
  const [fullName, setFullName] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [lifePathInfo, setLifePathInfo] = useState<any>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [characterAnalysis, setCharacterAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradePromptConfig, setUpgradePromptConfig] = useState<any>(null);
  const [userIsEditing, setUserIsEditing] = useState(false);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.95))[0];

  const displayName = useMemo(() => {
    if (profileData?.full_name) return profileData.full_name.split(" ")[0];
    if (user?.firstName) return user.firstName;
    if (user?.fullName) return user.fullName.split(" ")[0];
    return "Beautiful Soul";
  }, [profileData?.full_name, user?.firstName, user?.fullName]);

  useEffect(() => {
    // Only auto-populate from database if user is not actively editing
    if (userIsEditing) return;

    const name =
      profileData?.full_name ||
      user?.fullName ||
      `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
    if (name && name !== "") {
      setFullName(name);
      if (!profile) setShowInput(true);
    }

    if (profileData?.birth_date) {
      let formattedDate = profileData.birth_date;
      if (
        profileData.birth_date.includes("-") &&
        profileData.birth_date.length === 10
      ) {
        const [year, month, day] = profileData.birth_date.split("-");
        formattedDate = `${month.padStart(2, "0")}/${day.padStart(2, "0")}/${year}`;
      }
      setBirthDate(formattedDate);
    }
  }, [user, profileData, profile, userIsEditing]);

  useEffect(() => {
    if (profile) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 8,
        }),
      ]).start();
    }
  }, [profile]);

  // Show feature introduction for new users
  useEffect(() => {
    const showIntroduction = async () => {
      if (user?.id && showInput && !profile) {
        try {
          const { shouldShow, alertConfig } =
            await OnboardingService.getFeatureIntro(user.id, "numerology");
          if (shouldShow && alertConfig) {
            showAlert(alertConfig);
          }
        } catch (error) {
          // Silent error handling for production
        }
      }
    };

    showIntroduction();
  }, [user?.id, showInput, profile]);

  const generateNumerology = async () => {
    // Check usage limits first
    if (!canUse("numerology")) {
      showAlert({
        type: "limit",
        title: "🔮 Numerology Limit Reached",
        message: `You've used all your numerology readings for this month.\n\nUpgrade to Premium for 25 readings per month, or upgrade to Unlimited for unlimited access!`,
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

    if (!fullName.trim()) {
      showAlert({
        type: "error",
        title: "Name Required",
        message:
          "Please enter your full name to generate your numerology reading",
      });
      return;
    }

    if (!birthDate) {
      showAlert({
        type: "error",
        title: "Birth Date Required",
        message: "Please enter your birth date to calculate your numbers",
      });
      return;
    }

    const datePattern =
      /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/(19|20)\d{2}$/;
    if (!datePattern.test(birthDate)) {
      showAlert({
        type: "warning",
        title: "Invalid Date Format",
        message:
          "Please enter your birth date in MM/DD/YYYY format (e.g., 03/15/1990)",
      });
      return;
    }

    // Check usage limits first
    if (user?.id) {
      try {
        const usageCheck = await SubscriptionService.checkUsageLimitWithPrompt(
          user.id,
          "numerology"
        );

        if (!usageCheck.canUse) {
          showUsageLimitAlert(
            showAlert,
            "numerology",
            usageCheck.promptConfig?.usedCount || 0,
            usageCheck.promptConfig?.limitCount || 3,
            () => {
              // Open pricing page or handle upgrade
              console.log("Upgrade to premium clicked");
            }
          );
          return;
        }
      } catch (error) {
        console.error("Error checking usage limits:", error);
        showAlert({
          type: "error",
          title: "Connection Error",
          message:
            "Unable to verify usage limits. Please check your connection and try again.",
        });
        return;
      }
    }

    setLoading(true);

    try {
      const [month, day, year] = birthDate.split("/").map(Number);

      // STEP 1: Generate basic profile immediately
      const basicNumerologyProfile = NumerologyService.generateProfile(
        fullName,
        birthDate
      );

      const lifePathDetails = NumerologyService.getLifePathInfo(
        basicNumerologyProfile.lifePathNumber
      );

      const predictionsData = [
        {
          category: "Love & Relationships",
          timeframe: "This Month",
          predictions: [
            lifePathDetails.loveCompatibility ||
              "Your love life is influenced by your life path number.",
          ],
        },
        {
          category: "Career & Finance",
          timeframe: "Next 3 Months",
          predictions: [
            lifePathDetails.careerPaths?.[0] ||
              "Your career path aligns with your numerological profile.",
          ],
        },
        {
          category: "Personal Growth",
          timeframe: "This Year",
          predictions: [
            lifePathDetails.lifeApproach ||
              "Focus on personal development and growth.",
          ],
        },
      ];

      // Show basic profile immediately with user input data
      const initialProfile = {
        ...basicNumerologyProfile,
        name: fullName, // Use user input name
        birthDate: birthDate, // Use user input birth date
      };

      setProfile(initialProfile);
      setLifePathInfo(lifePathDetails);
      setPredictions(predictionsData);
      setCharacterAnalysis("Generating your personalized insights...");
      setShowInput(false);
      setLoading(false); // Stop loading immediately

      // STEP 2: Get Roxy API data in background and update immediately when available
      RoxyNumerologyService.getNumerologyReading(
        fullName.split(" ")[0] || "",
        fullName.split(" ").slice(1).join(" ") || "",
        birthDate,
        ""
      )
        .then((roxyProfile) => {
          if (roxyProfile) {
            console.log("✅ Roxy API data received, updating profile...");
            // Create enhanced profile with Roxy data immediately
            const enhancedProfile = {
              ...basicNumerologyProfile,
              // Override with Roxy API numbers if available
              lifePathNumber:
                roxyProfile.life_path_number ||
                basicNumerologyProfile.lifePathNumber,
              destinyNumber:
                roxyProfile.destiny_number ||
                basicNumerologyProfile.destinyNumber,
              soulUrgeNumber:
                roxyProfile.soul_urge_number ||
                basicNumerologyProfile.soulUrgeNumber,
              name: fullName, // Use user input name
              birthDate: birthDate, // Use user input birth date
              roxyInsights: {
                strengths: Array.isArray(roxyProfile.strengths)
                  ? roxyProfile.strengths
                  : [],
                challenges: Array.isArray(roxyProfile.challenges)
                  ? roxyProfile.challenges
                  : [],
                career: roxyProfile.career_guidance || "",
                relationship: roxyProfile.relationship_guidance || "",
                spiritual: roxyProfile.spiritual_guidance || "",
                luckyNumbers: Array.isArray(roxyProfile.lucky_numbers)
                  ? roxyProfile.lucky_numbers
                  : [],
                luckyColors: Array.isArray(roxyProfile.lucky_colors)
                  ? roxyProfile.lucky_colors
                  : [],
                lifePathDescription: roxyProfile.life_path_description || "",
                personalYear:
                  roxyProfile.personality_number ||
                  (new Date().getFullYear() % 9) + 1,
              },
            };

            // Update profile with Roxy data immediately
            setProfile(enhancedProfile);

            // Update life path info with Roxy numbers
            const updatedLifePathDetails = NumerologyService.getLifePathInfo(
              roxyProfile.life_path_number ||
                basicNumerologyProfile.lifePathNumber
            );
            setLifePathInfo(updatedLifePathDetails);
          }
        })
        .catch((error) => {
          console.log("🔄 Roxy API unavailable, keeping basic profile");
        });

      // STEP 3: Generate AI analysis in background
      SimpleAIService.generateAllNumerologyInsights(
        fullName,
        basicNumerologyProfile,
        "character-only"
      )
        .then((analysis) => {
          setCharacterAnalysis(analysis.characterAnalysis);
        })
        .catch((error) => {
          console.log("AI analysis failed, using static content");
          setCharacterAnalysis(
            "Your numerological profile reveals unique insights about your personality and life path. Each number in your chart represents different aspects of your character and destiny."
          );
        });

      // Track usage after successful generation
      if (user?.id) {
        try {
          await SubscriptionService.trackUsage(user.id, "numerology", {
            readingType: "full_numerology",
            fullName,
            birthDate,
            lifePathNumber: basicNumerologyProfile.lifePathNumber,
            destinyNumber: basicNumerologyProfile.destinyNumber,
            soulUrgeNumber: basicNumerologyProfile.soulUrgeNumber,
            timestamp: new Date().toISOString(),
          });
          console.log("✅ Numerology usage tracked successfully");
        } catch (error) {
          console.error("Error tracking numerology usage:", error);
        }
      }
    } catch (error) {
      console.error("Error generating numerology:", error);
      showAlert({
        type: "error",
        title: "Generation Failed",
        message:
          "We couldn't generate your numerology reading right now. Please check your information and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetReading = () => {
    setProfile(null);
    setLifePathInfo(null);
    setPredictions([]);
    setCharacterAnalysis("");
    setShowInput(true);
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.95);
    setUserIsEditing(false);
  };

  const handleNameChange = (newName: string) => {
    setUserIsEditing(true);
    setFullName(newName);
    // Clear profile if user changes name significantly
    if (profile && newName.trim() !== profile.name.trim()) {
      resetReading();
    }
  };

  const handleBirthDateChange = (date: Date | undefined) => {
    setUserIsEditing(true);
    if (date) {
      const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}/${date.getFullYear()}`;
      setBirthDate(formattedDate);
      // Clear profile if user changes birth date
      if (profile && profile.birthDate !== formattedDate) {
        resetReading();
      }
    } else {
      setBirthDate("");
      if (profile) {
        resetReading();
      }
    }
  };

  const showAIChatScreen = () => {
    if (profile && lifePathInfo) {
      router.push({
        pathname: "/ai-chat",
        params: {
          profile: JSON.stringify(profile),
          lifePathInfo: JSON.stringify(lifePathInfo),
          predictions: JSON.stringify(predictions),
          characterAnalysis: characterAnalysis,
          birthDate: birthDate,
          name: fullName,
          userId: user?.id || "",
        },
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await generateNumerology();
    setRefreshing(false);
  };

  if (loading) {
    return <NumerologyLoadingSkeleton />;
  }

  if (profile && lifePathInfo) {
    return (
      <NumerologyReadingScreen
        profile={profile}
        lifePathInfo={lifePathInfo}
        predictions={predictions}
        characterAnalysis={characterAnalysis}
        onBack={resetReading}
        onShowAIChat={showAIChatScreen}
        birthDate={birthDate}
        name={fullName}
        userId={user?.id}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Alert component is now available via useCustomAlert hook */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#9b59b6"
          />
        }
      >
        <View style={styles.header}>
          <Ionicons
            name="sparkles"
            size={48}
            color={DesignSystem.colors.primary.solidPurple}
          />
          <Text style={styles.title}>Numerology Reading</Text>
          <Text style={styles.description}>
            Discover your life path, destiny, and soul purpose through the
            ancient wisdom of numbers
          </Text>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Your Information</Text>

          <View style={styles.inputContainer}>
            <ShadcnInput
              label="Full Name"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={handleNameChange}
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <DatePicker
              label="Birth Date (MM/DD/YYYY)"
              value={
                birthDate
                  ? (() => {
                      try {
                        // Handle MM/DD/YYYY format
                        if (birthDate.includes("/")) {
                          const [month, day, year] = birthDate.split("/");
                          return new Date(
                            parseInt(year),
                            parseInt(month) - 1,
                            parseInt(day)
                          );
                        }
                        // Handle YYYY-MM-DD format
                        if (birthDate.includes("-")) {
                          const [year, month, day] = birthDate.split("-");
                          return new Date(
                            parseInt(year),
                            parseInt(month) - 1,
                            parseInt(day)
                          );
                        }
                        return new Date(birthDate);
                      } catch {
                        return undefined;
                      }
                    })()
                  : undefined
              }
              onSelect={handleBirthDateChange}
              placeholder="Select your birth date"
            />
          </View>

          {/* Usage Limit Warning */}
          {!canUse("numerology") && (
            <View style={styles.limitWarningContainer}>
              <Ionicons name="lock-closed" size={20} color="#FF6B9D" />
              <Text style={styles.limitWarningText}>
                You&apos;ve reached your numerology reading limit for this
                month. Upgrade to Premium for 25 readings per month!
              </Text>
            </View>
          )}

          <ShadcnButton
            onPress={generateNumerology}
            disabled={
              loading || !fullName.trim() || !birthDate || !canUse("numerology")
            }
            loading={loading}
            variant="default"
            size="lg"
            endIcon="arrow-forward"
            style={StyleSheet.flatten([
              styles.generateButton,
              !canUse("numerology") && styles.limitExceededButton,
            ])}
          >
            {loading
              ? "Generating..."
              : !canUse("numerology")
                ? "Limit Reached"
                : "Generate Reading"}
          </ShadcnButton>
        </View>
      </ScrollView>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 32,
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
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
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
  generateButton: {
    marginTop: 16,
  },
  limitExceededButton: {
    backgroundColor: "#666666",
    borderColor: "#666666",
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
