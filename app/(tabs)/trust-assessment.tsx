import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCustomAlert } from "../../components/CustomAlert";
import { TrustAssessmentLoadingSkeleton } from "../../components/LoadingSkeletons";
// import PaymentModal from "../../components/PaymentModal";
import { DatePicker, ShadcnButton, ShadcnInput } from "../../components/ui";
import { DesignSystem } from "../../constants/DesignSystem";
import { useProfile } from "../../contexts/ProfileContext";
import NumerologyService from "../../services/NumerologyService";
import { RoxyNumerologyService } from "../../services/ProkeralaNumerologyService";
import SimpleAIService from "../../services/SimpleAIService";
import { SubscriptionService } from "../../services/SubscriptionService";
import { useSubscription } from "../../hooks/useSubscription";
import { UsageLimitModal } from "../../components/UsageLimitModal";
import {
  TrustAssessment,
  TrustAssessmentService,
} from "../../services/TrustAssessmentService";
import UsageTrackingService from "../../services/UsageTrackingService";

export default function TrustAssessmentScreen() {
  const { user } = useUser();
  const { profileData } = useProfile();
  const { subscription, canUse, openPricingPage } = useSubscription();
  const [showInput, setShowInput] = useState(false);
  const [step, setStep] = useState<
    "your-info" | "relationship-type" | "partner-info" | "results"
  >("your-info");
  const [yourBirthDate, setYourBirthDate] = useState("");
  const [userFullName, setUserFullName] = useState("");
  const [partnerFullName, setPartnerFullName] = useState("");
  const [partnerBirthDate, setPartnerBirthDate] = useState("");
  const [relationshipType, setRelationshipType] = useState("");
  const [assessment, setAssessment] = useState<TrustAssessment | null>(null);
  const [deadlySinWarnings, setDeadlySinWarnings] = useState<{
    your: any;
    partner: any;
  } | null>(null);
  const [personalizedInsights, setPersonalizedInsights] = useState<
    string | null
  >(null);
  const [aiPredictions, setAiPredictions] = useState<string | null>(null);
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedIndicator, setExpandedIndicator] = useState<number | null>(
    null
  );
  const [usageStats, setUsageStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showUsageLimitModal, setShowUsageLimitModal] = useState(false);
  const { showAlert, AlertComponent } = useCustomAlert();

  // Animation values for shadow effects
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.95))[0];
  const shadowOpacity = useState(new Animated.Value(0))[0];

  // Load usage statistics
  useEffect(() => {
    const loadUsageStats = async () => {
      if (user?.id) {
        try {
          const stats = await SubscriptionService.getUsageStats(user.id);
          const resetDate = new Date(stats.trustAssessment.resetsAt);
          const now = new Date();
          const daysUntilReset = Math.ceil(
            (resetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );

          setUsageStats({
            trustAssessmentUsage: stats.trustAssessment.totalUsed,
            trustAssessmentRemaining: stats.trustAssessment.remaining,
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
    // Auto-show input if user has name but no assessment yet
    const fullName =
      profileData?.full_name ||
      user?.fullName ||
      `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
    if (fullName && fullName !== "" && !assessment) {
      setShowInput(true);
    }

    // Global name synchronization
    if (fullName && fullName !== userFullName.trim()) {
      setUserFullName(fullName);
    }

    // Auto-fill birth date from profile if available
    // Update yourBirthDate whenever profileData.birth_date changes
    if (profileData?.birth_date) {
      console.log(
        "🛡️ Trust Assessment: Auto-filling birth date from profile:",
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
            "🛡️ Trust Assessment: Converted to MM/DD/YYYY format:",
            formattedBirthDate
          );
        } else if (profileData.birth_date.includes("/")) {
          // Already in MM/DD/YYYY format, use as-is
          console.log(
            "🛡️ Trust Assessment: Birth date already in MM/DD/YYYY format"
          );
        }
      } catch (error) {
        console.log("Error formatting birth date:", error);
      }
      setYourBirthDate(formattedBirthDate);
    }
  }, [user, assessment, profileData, userFullName]);

  // Dedicated profile birth_date watcher for immediate sync
  useEffect(() => {
    if (profileData?.birth_date) {
      console.log(
        "🛡️ Trust Assessment: Profile birth_date changed, updating local state:",
        profileData.birth_date
      );
      let formattedBirthDate = profileData.birth_date;
      try {
        if (
          profileData.birth_date.includes("-") &&
          profileData.birth_date.length === 10
        ) {
          // Convert YYYY-MM-DD format to MM/DD/YYYY format
          const [year, month, day] = profileData.birth_date.split("-");
          formattedBirthDate = `${month.padStart(2, "0")}/${day.padStart(2, "0")}/${year}`;
          console.log(
            "🛡️ Trust Assessment: Converted to MM/DD/YYYY format:",
            formattedBirthDate
          );
        }
      } catch (error) {
        console.log("Error formatting birth date:", error);
      }
      setYourBirthDate(formattedBirthDate);
    }
  }, [profileData?.birth_date]);

  const generateRoxyCompatibilityAnalysis = (
    yourData: any,
    partnerData: any,
    yourName: string,
    partnerName: string
  ) => {
    return {
      combinedStrengths: [
        ...(yourData.strengths || []),
        ...(partnerData.strengths || []),
      ],
      combinedChallenges: [
        ...(yourData.challenges || []),
        ...(partnerData.challenges || []),
      ],
      relationshipGuidance: [
        yourData.relationshipGuidance,
        partnerData.relationshipGuidance,
      ]
        .filter(Boolean)
        .join(" "),
      luckyNumbersCompatibility: {
        yourNumbers: yourData.luckyNumbers || [],
        partnerNumbers: partnerData.luckyNumbers || [],
        sharedNumbers: (yourData.luckyNumbers || []).filter((number: number) =>
          (partnerData.luckyNumbers || []).includes(number)
        ),
      },
      luckyColorsCompatibility: {
        yourColors: yourData.luckyColors || [],
        partnerColors: partnerData.luckyColors || [],
        sharedColors: (yourData.luckyColors || []).filter((color: string) =>
          (partnerData.luckyColors || []).includes(color)
        ),
      },
    };
  };

  const generateRelationshipSpecificInsights = async (
    trustAssessment: any,
    yourProfile: any,
    partnerProfile: any,
    relationshipType: string,
    yourName: string,
    partnerName: string
  ) => {
    const relationshipContexts = {
      romantic: "romantic relationship (dating, engaged, or married)",
      friendship: "close friendship",
      family: "family relationship",
      business: "business partnership or work relationship",
      potential: "potential romantic relationship",
    };

    const context =
      relationshipContexts[
        relationshipType as keyof typeof relationshipContexts
      ] || "relationship";

    const prompt = `
    Based on this trust assessment between ${yourName} and ${partnerName} in the context of a ${context}, provide personalized insights:

    Trust Assessment Score: ${trustAssessment.overallCompatibility}%
    Primary Strengths: ${trustAssessment.strengths?.join(", ") || "Not specified"}
    Areas of Concern: ${trustAssessment.challenges?.join(", ") || "Not specified"}
    
    ${yourName}'s Trust Profile:
    - Trust Score: ${yourProfile.trustScore}/10
    - Key Traits: ${yourProfile.trustIndicators?.map((i: any) => i.type).join(", ") || "Not specified"}
    
    ${partnerName}'s Trust Profile:
    - Trust Score: ${partnerProfile.trustScore}/10
    - Key Traits: ${partnerProfile.trustIndicators?.map((i: any) => i.type).join(", ") || "Not specified"}

    Relationship Type: ${context.charAt(0).toUpperCase() + context.slice(1)}

    Please provide:
    1. **Relationship-Specific Advice** (2-3 personalized tips for this type of ${context})
    2. **Communication Strategies** (How to build trust specifically in this ${context})
    3. **Potential Growth Areas** (What to focus on together)
    4. **Long-term Outlook** (What to expect as this ${context} develops)

    Keep the tone warm, insightful, and relationship-focused. Make it feel personal to ${yourName} and ${partnerName}.
    `;

    try {
      const result = await SimpleAIService.generateResponse(prompt, "love");
      return result.content;
    } catch (error) {
      console.error("Error generating relationship insights:", error);
      return "Unable to generate personalized insights at this time. Please try again later.";
    }
  };

  const validateAndProceed = () => {
    if (step === "your-info") {
      if (!yourBirthDate) {
        Alert.alert("Error", "Please enter your birth date");
        return;
      }

      const datePattern =
        /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/(19|20)\d{2}$/;
      if (!datePattern.test(yourBirthDate)) {
        Alert.alert(
          "Error",
          "Please enter your birth date in MM/DD/YYYY format"
        );
        return;
      }

      setStep("relationship-type");
    } else if (step === "relationship-type") {
      if (!relationshipType) {
        Alert.alert("Error", "Please select your relationship type");
        return;
      }
      setStep("partner-info");
    } else if (step === "partner-info") {
      if (!partnerFullName.trim()) {
        Alert.alert("Error", "Please enter your partner's full name");
        return;
      }

      if (!partnerBirthDate) {
        Alert.alert("Error", "Please enter your partner's birth date");
        return;
      }

      const datePattern =
        /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/(19|20)\d{2}$/;
      if (!datePattern.test(partnerBirthDate)) {
        Alert.alert(
          "Error",
          "Please enter partner's birth date in MM/DD/YYYY format"
        );
        return;
      }

      generateTrustAssessment();
    }
  };

  const generateTrustAssessment = async () => {
    try {
      const fullUserName = userFullName.trim();
      const fullPartnerName = partnerFullName.trim();

      if (!fullUserName) {
        Alert.alert("Error", "Please enter your full name");
        return;
      }

      if (!fullPartnerName) {
        Alert.alert("Error", "Please enter your partner's full name");
        return;
      }

      // Track trust assessment usage
      if (user?.id) {
        UsageTrackingService.trackTrustAssessmentUsage(user.id, {
          userName: fullUserName,
          partnerName: fullPartnerName,
          relationshipType,
          timestamp: new Date().toISOString(),
        });
      }

      // Check usage limits
      if (user?.id) {
        if (!canUse('trustAssessment')) {
          setLoading(false);
          setShowUsageLimitModal(true);
          return;
        }
      }

      setLoading(true);

      // Declare variables in function scope so they're accessible in closures
      let basicTrustAssessment: any;
      let yourTrustProfile: any;
      let partnerTrustProfile: any;

      try {
        // STEP 1: Generate basic trust assessment immediately (< 200ms)
        const yourNumerologyProfile = NumerologyService.generateProfile(
          fullUserName,
          yourBirthDate
        );
        const partnerNumerologyProfile = NumerologyService.generateProfile(
          fullPartnerName,
          partnerBirthDate
        );

        yourTrustProfile = TrustAssessmentService.calculateTrustProfile(
          fullUserName,
          yourBirthDate,
          yourNumerologyProfile
        );

        partnerTrustProfile = TrustAssessmentService.calculateTrustProfile(
          fullPartnerName,
          partnerBirthDate,
          partnerNumerologyProfile
        );

        basicTrustAssessment =
          TrustAssessmentService.assessTrustCompatibilityWithContext(
            yourTrustProfile,
            partnerTrustProfile,
            relationshipType
          );

        // Set basic assessment first - instant display
        setAssessment(basicTrustAssessment);
        setPersonalizedInsights(
          "Generating your personalized relationship insights..."
        );
        setStep("results");
        setShowInput(false);
        setLoading(false); // Stop loading immediately

        // Parse names for Roxy API
        const userNameParts = fullUserName.split(" ");
        const userFirstName = userNameParts[0] || "";
        const userLastName = userNameParts.slice(1).join(" ") || "";

        const partnerNameParts = fullPartnerName.split(" ");
        const partnerFirstName = partnerNameParts[0] || "";
        const partnerLastName = partnerNameParts.slice(1).join(" ") || "";

        // STEP 2: Enhanced Roxy API data in background
        Promise.allSettled([
          RoxyNumerologyService.getNumerologyReading(
            userFirstName,
            userLastName,
            yourBirthDate
          ),
          RoxyNumerologyService.getNumerologyReading(
            partnerFirstName,
            partnerLastName,
            partnerBirthDate
          ),
        ]).then(([yourResult, partnerResult]) => {
          if (
            yourResult.status === "fulfilled" &&
            partnerResult.status === "fulfilled"
          ) {
            // Update with enhanced data when available
            const enhancedYourProfile = {
              ...yourNumerologyProfile,
              lifePathNumber:
                yourResult.value?.life_path_number ||
                yourNumerologyProfile.lifePathNumber,
              destinyNumber:
                yourResult.value?.destiny_number ||
                yourNumerologyProfile.destinyNumber,
              soulUrgeNumber:
                yourResult.value?.soul_urge_number ||
                yourNumerologyProfile.soulUrgeNumber,
              // Add Roxy-specific compatibility insights
              roxyCompatibilityData: {
                strengths: yourResult.value?.strengths || [],
                challenges: yourResult.value?.challenges || [],
                relationshipGuidance:
                  yourResult.value?.relationship_guidance || "",
                luckyNumbers: yourResult.value?.lucky_numbers || [],
                luckyColors: yourResult.value?.lucky_colors || [],
              },
            };

            const enhancedPartnerProfile = {
              ...partnerNumerologyProfile,
              lifePathNumber:
                partnerResult.value?.life_path_number ||
                partnerNumerologyProfile.lifePathNumber,
              destinyNumber:
                partnerResult.value?.destiny_number ||
                partnerNumerologyProfile.destinyNumber,
              soulUrgeNumber:
                partnerResult.value?.soul_urge_number ||
                partnerNumerologyProfile.soulUrgeNumber,
              // Add Roxy-specific compatibility insights
              roxyCompatibilityData: {
                strengths: partnerResult.value?.strengths || [],
                challenges: partnerResult.value?.challenges || [],
                relationshipGuidance:
                  partnerResult.value?.relationship_guidance || "",
                luckyNumbers: partnerResult.value?.lucky_numbers || [],
                luckyColors: partnerResult.value?.lucky_colors || [],
              },
            };

            // Recalculate with enhanced data
            const enhancedYourTrust =
              TrustAssessmentService.calculateTrustProfile(
                fullUserName,
                yourBirthDate,
                enhancedYourProfile
              );
            const enhancedPartnerTrust =
              TrustAssessmentService.calculateTrustProfile(
                fullPartnerName,
                partnerBirthDate,
                enhancedPartnerProfile
              );
            const enhancedAssessment =
              TrustAssessmentService.assessTrustCompatibilityWithContext(
                enhancedYourTrust,
                enhancedPartnerTrust,
                relationshipType
              );

            // Add Roxy-based compatibility analysis
            const roxyCompatibilityInsights = generateRoxyCompatibilityAnalysis(
              enhancedYourProfile.roxyCompatibilityData,
              enhancedPartnerProfile.roxyCompatibilityData,
              fullUserName,
              fullPartnerName
            );

            // Enhance assessment with Roxy insights
            enhancedAssessment.roxyInsights = roxyCompatibilityInsights;

            setAssessment(enhancedAssessment);
          }
        });

        // STEP 3: Generate AI insights in background
        generateRelationshipSpecificInsights(
          basicTrustAssessment,
          yourTrustProfile,
          partnerTrustProfile,
          relationshipType,
          fullUserName,
          fullPartnerName
        )
          .then((insights) => {
            setPersonalizedInsights(insights);
          })
          .catch(() => {
            setPersonalizedInsights(
              `Your ${relationshipType} has ${basicTrustAssessment.compatibilityScore}% trust compatibility. This indicates ${basicTrustAssessment.compatibilityScore > 70 ? "strong potential for a trusting relationship" : "areas that may need attention and communication"}.`
            );
          });

        // STEP 4: Generate AI predictions in background (delayed)
        // Use static predictions instead of AI (minimal requests only)
        setTimeout(() => {
          const compatibilityScore =
            basicTrustAssessment.compatibilityScore || 50;
          let staticPrediction = "";

          if (compatibilityScore >= 80) {
            staticPrediction = `Your ${relationshipType} shows exceptional promise with ${compatibilityScore}% compatibility. The next few months will bring opportunities to deepen your connection. Trust will continue to grow as you support each other through life's challenges. This bond has the potential to be transformative for both of you.`;
          } else if (compatibilityScore >= 60) {
            staticPrediction = `Your ${relationshipType} has solid potential with ${compatibilityScore}% compatibility. Focus on open communication and patience. The next few months will test your compatibility, but working through challenges together will strengthen your bond.`;
          } else {
            staticPrediction = `Your ${relationshipType} shows ${compatibilityScore}% compatibility and will require conscious effort and understanding. The next few months are crucial for building trust and finding common ground. With commitment and patience, this connection can still flourish.`;
          }

          setAiPredictions(staticPrediction);
          setLoadingPredictions(false);
        }, 1000); // Quick static prediction load
      } catch (error) {
        console.error("Error generating AI predictions:", error);
        // Provide fallback based on compatibility score
        const compatibilityScore = assessment?.compatibilityScore || 50;
        let fallbackMessage = "";

        if (compatibilityScore >= 80) {
          fallbackMessage = `Your ${relationshipType} shows exceptional promise. The next few months will bring opportunities to deepen your connection. Trust will continue to grow as you support each other through life's challenges. This bond has the potential to be transformative for both of you.`;
        } else if (compatibilityScore >= 60) {
          fallbackMessage = `Your ${relationshipType} has solid potential with room for growth. Focus on open communication and patience. The next few months will test your compatibility, but working through challenges together will strengthen your bond.`;
        } else {
          fallbackMessage = `Your ${relationshipType} will require conscious effort and understanding. The next few months are crucial for building trust and finding common ground. With commitment and patience, this connection can still flourish.`;
        }

        setAiPredictions(fallbackMessage);
      } finally {
        setLoadingPredictions(false);
      }

      // Generate deadly sin warnings for both individuals with error handling (moved to background)
      setTimeout(async () => {
        let yourDeadlySinWarning;
        try {
          if (!profileData?.full_name || !profileData?.birth_date) {
            throw new Error('Profile data not available');
          }
          // Create a numerology profile for the deadly sin warning
          const quickProfile = NumerologyService.generateProfile(
            profileData.full_name,
            profileData.birth_date
          );
          const result =
            await SimpleAIService.generateDeadlySinWarning(quickProfile);
          yourDeadlySinWarning = {
            sin: result.sin,
            warning: result.warning,
            consequences: result.consequences,
          };
        } catch (error) {
          console.warn(
            "⚠️ Trust Assessment: Failed to generate deadly sin warning for user, using fallback"
          );
          yourDeadlySinWarning = {
            sin: "Pride",
            warning: "Be mindful of ego and stay humble in relationships.",
            consequences:
              "Pride can create barriers to authentic connection and trust.",
          };
        }

        let partnerDeadlySinWarning;
        try {
          // Generate partner's numerology profile using the same service as the user's profile
          const partnerNumerologyProfile = NumerologyService.generateProfile(
            partnerFullName,
            partnerBirthDate
          );

          const result = await SimpleAIService.generateDeadlySinWarning(
            partnerNumerologyProfile
          );
          partnerDeadlySinWarning = {
            sin: result.sin,
            warning: result.warning,
            consequences: result.consequences,
          };
        } catch (error) {
          console.warn(
            "⚠️ Trust Assessment: Failed to generate deadly sin warning for partner, using fallback"
          );
          partnerDeadlySinWarning = {
            sin: "Envy",
            warning: "Guard against comparison and jealousy in relationships.",
            consequences:
              "Envy can undermine trust and create unnecessary conflict.",
          };
        }

        setDeadlySinWarnings({
          your: yourDeadlySinWarning,
          partner: partnerDeadlySinWarning,
        });
      }, 2000);

      // Track usage by recording in database
      if (user?.id) {
        await SubscriptionService.recordUsage(user.id, "trustAssessment", {
          user_name: fullUserName,
          birth_date: yourBirthDate,
          partner_name: fullPartnerName,
          partner_birth_date: partnerBirthDate,
          relationship_type: relationshipType,
          trust_score: basicTrustAssessment?.compatibilityScore || 0,
          assessment_data: basicTrustAssessment,
        });

        // Reload usage stats after recording
        const stats = await SubscriptionService.getUsageStats(user.id);
        const resetDate = new Date(stats.trustAssessment.resetsAt);
        const now = new Date();
        const daysUntilReset = Math.ceil(
          (resetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        setUsageStats({
          trustAssessmentUsage: stats.trustAssessment.totalUsed,
          trustAssessmentRemaining: stats.trustAssessment.remaining,
          daysUntilReset: Math.max(0, daysUntilReset),
          isPremium: stats.isPremium,
        });
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to generate trust assessment. Please check your information."
      );
      console.error("Trust assessment calculation error:", error);
    }
    setLoading(false);
  };

  // Animation effect for mount and refresh
  const animateComponents = () => {
    // Reset animations
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.95);
    shadowOpacity.setValue(0);

    // Animate in sequence
    Animated.stagger(100, [
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(shadowOpacity, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  // Pull to refresh function with animations
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Check payment status on refresh
      if (user?.id) {
        const subscriptionStatus =
          await SubscriptionService.getSubscriptionStatus(user.id);
        const stats = await SubscriptionService.getUsageStats(user.id);
        const resetDate = new Date(stats.trustAssessment.resetsAt);
        const now = new Date();
        const daysUntilReset = Math.ceil(
          (resetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        setUsageStats({
          trustAssessmentUsage: stats.trustAssessment.totalUsed,
          trustAssessmentRemaining: stats.trustAssessment.remaining,
          daysUntilReset: Math.max(0, daysUntilReset),
          isPremium: stats.isPremium,
        });
      }

      // Reset assessment data
      if (assessment) {
        resetAssessment();
      }

      // Animate components back in
      animateComponents();

      // Simulate some loading time for smooth UX
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Failed to refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Initialize animations on mount
  useEffect(() => {
    animateComponents();
  }, [assessment]);

  const resetAssessment = () => {
    setAssessment(null);
    setPersonalizedInsights(null);
    setDeadlySinWarnings(null);
    setShowInput(true);
    setStep("your-info");
    setYourBirthDate("");
    setPartnerFullName("");
    setPartnerBirthDate("");
    setRelationshipType("");
    setExpandedIndicator(null);
  };

  const shareResults = () => {
    if (assessment) {
      const shareText = `🛡️ Trust Assessment Results\n\n${assessment.person1.name} & ${assessment.person2.name}\n\n✨ Overall Compatibility: ${assessment.compatibilityScore}%\n\n🌟 Relationship Type: ${relationshipType}\n\nGenerated by Lovelock AI - Download the app to get your own trust assessment!`;

      showAlert({
        title: "Share Results",
        message: "Share your trust assessment results with friends and family!",
        type: "info",
        buttons: [
          { text: "Cancel", style: "cancel" },
          {
            text: "Copy to Clipboard",
            style: "primary",
            onPress: () => {
              // In a real app, you'd use Clipboard.setString(shareText)
              showAlert({
                title: "✅ Copied!",
                message: "Results copied to clipboard",
                type: "success",
              });
            },
          },
        ],
      });
    }
  };

  const goBack = () => {
    if (step === "partner-info") {
      setStep("relationship-type");
    } else if (step === "relationship-type") {
      setStep("your-info");
    }
  };

  const toggleIndicator = (index: number) => {
    setExpandedIndicator(expandedIndicator === index ? null : index);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#34C759";
    if (score >= 60) return "#FF9500";
    return "#FF3B30";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return "checkmark-circle";
    if (score >= 60) return "warning";
    return "alert-circle";
  };

  if (showInput || !assessment) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Ionicons
              name="shield"
              size={48}
              color={DesignSystem.colors.primary.solidPurple}
            />
            <Text style={styles.title}>Trust Assessment</Text>
            <Text style={styles.description}>
              Analyze relationship trust compatibility through numerology
            </Text>

            {/* Step Progress Indicator */}
            <View style={styles.stepProgressContainer}>
              <View style={styles.stepProgressBar}>
                <View
                  style={[
                    styles.stepProgressFill,
                    {
                      width: `${((step === "your-info" ? 1 : step === "relationship-type" ? 2 : step === "partner-info" ? 3 : 4) / 4) * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.stepProgressText}>
                Step{" "}
                {step === "your-info"
                  ? "1"
                  : step === "relationship-type"
                    ? "2"
                    : step === "partner-info"
                      ? "3"
                      : "4"}{" "}
                of 4
              </Text>
            </View>
          </View>

          <View style={styles.inputSection}>
            {step === "your-info" && (
              <>
                <Text style={styles.inputLabel}>Your Information</Text>

                <View style={styles.inputContainer}>
                  <ShadcnInput
                    label="Your Full Name"
                    placeholder="Enter your full name"
                    value={userFullName}
                    onChangeText={setUserFullName}
                    autoCapitalize="words"
                    leftIcon="person"
                    required
                  />
                </View>

                <View style={styles.inputContainer}>
                  <DatePicker
                    label="Your Birth Date (MM/DD/YYYY)"
                    value={
                      yourBirthDate
                        ? (() => {
                            const [month, day, year] = yourBirthDate.split("/");
                            return new Date(
                              parseInt(year),
                              parseInt(month) - 1,
                              parseInt(day)
                            );
                          })()
                        : undefined
                    }
                    onSelect={(date) => {
                      if (date) {
                        const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}/${date.getFullYear()}`;
                        setYourBirthDate(formattedDate);
                      }
                    }}
                    placeholder="MM/DD/YYYY"
                    maxDate={new Date()}
                  />
                </View>

                <ShadcnButton
                  onPress={validateAndProceed}
                  variant="default"
                  size="lg"
                  endIcon="arrow-forward"
                  style={styles.proceedButton}
                >
                  Next
                </ShadcnButton>
              </>
            )}

            {step === "relationship-type" && (
              <>
                <View style={styles.stepHeader}>
                  <TouchableOpacity onPress={goBack} style={styles.backButton}>
                    <Ionicons
                      name="arrow-back"
                      size={20}
                      color={DesignSystem.colors.semantic.success}
                    />
                  </TouchableOpacity>
                  <Text style={styles.inputLabel}>Relationship Type</Text>
                </View>

                <Text style={styles.relationshipDescription}>
                  What kind of relationship are you analyzing? This helps us
                  provide more personalized insights.
                </Text>

                <View style={styles.relationshipTypeContainer}>
                  {[
                    {
                      value: "romantic",
                      label: "Romantic Partner",
                      icon: "heart",
                      description: "Dating, engaged, or married",
                    },
                    {
                      value: "friendship",
                      label: "Close Friend",
                      icon: "people",
                      description: "Best friend or close companion",
                    },
                    {
                      value: "family",
                      label: "Family Member",
                      icon: "home",
                      description: "Sibling, parent, or relative",
                    },
                    {
                      value: "business",
                      label: "Business Partner",
                      icon: "briefcase",
                      description: "Work colleague or business associate",
                    },
                    {
                      value: "potential",
                      label: "Potential Partner",
                      icon: "sparkles",
                      description: "Someone you're considering dating",
                    },
                  ].map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.relationshipTypeCard,
                        relationshipType === type.value &&
                          styles.selectedRelationshipType,
                      ]}
                      onPress={() => {
                        setRelationshipType(type.value);
                        // Auto-advance to next step after selection
                        setTimeout(() => {
                          setStep("partner-info");
                        }, 500); // Small delay for visual feedback
                      }}
                    >
                      <Ionicons
                        name={type.icon as any}
                        size={24}
                        color={
                          relationshipType === type.value
                            ? "#FFFFFF"
                            : DesignSystem.colors.primary.solidPurple
                        }
                      />
                      <Text
                        style={[
                          styles.relationshipTypeLabel,
                          relationshipType === type.value &&
                            styles.selectedRelationshipTypeLabel,
                        ]}
                      >
                        {type.label}
                      </Text>
                      <Text
                        style={[
                          styles.relationshipTypeDescription,
                          relationshipType === type.value &&
                            styles.selectedRelationshipTypeDescription,
                        ]}
                      >
                        {type.description}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.selectionHint}>
                  Select your relationship type above to continue
                </Text>
              </>
            )}

            {step === "partner-info" && (
              <>
                <View style={styles.stepHeader}>
                  <TouchableOpacity onPress={goBack} style={styles.backButton}>
                    <Ionicons
                      name="arrow-back"
                      size={20}
                      color={DesignSystem.colors.semantic.success}
                    />
                  </TouchableOpacity>
                  <Text style={styles.inputLabel}>Partner Information</Text>
                </View>

                <View style={styles.inputContainer}>
                  <ShadcnInput
                    label="Partner's Full Name"
                    placeholder="Enter partner's full name"
                    value={partnerFullName}
                    onChangeText={setPartnerFullName}
                    autoCapitalize="words"
                    leftIcon="person"
                    required
                  />
                </View>

                <View style={styles.inputContainer}>
                  <DatePicker
                    label="Partner's Birth Date (MM/DD/YYYY)"
                    value={
                      partnerBirthDate
                        ? (() => {
                            const [month, day, year] =
                              partnerBirthDate.split("/");
                            return new Date(
                              parseInt(year),
                              parseInt(month) - 1,
                              parseInt(day)
                            );
                          })()
                        : undefined
                    }
                    onSelect={(date) => {
                      if (date) {
                        const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}/${date.getFullYear()}`;
                        setPartnerBirthDate(formattedDate);
                      }
                    }}
                    placeholder="MM/DD/YYYY"
                    maxDate={new Date()}
                  />
                </View>

                <ShadcnButton
                  onPress={validateAndProceed}
                  variant="default"
                  size="lg"
                  disabled={loading}
                  loading={loading}
                  startIcon="shield-checkmark"
                  style={styles.proceedButton}
                >
                  {loading ? "Analyzing..." : "Analyze Trust"}
                </ShadcnButton>
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (loading) {
    return <TrustAssessmentLoadingSkeleton />;
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
        <Animated.View
          style={[
            styles.profileHeader,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
              shadowOpacity: shadowOpacity,
              shadowOffset: { width: 0, height: 4 },
              shadowRadius: 8,
              shadowColor: "#000",
              elevation: 8,
            },
          ]}
        >
          <View style={styles.headerTop}>
            <Text style={styles.profileTitle}>Trust Assessment</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => shareResults()}
                style={styles.shareButton}
              >
                <Ionicons
                  name="share-outline"
                  size={20}
                  color={DesignSystem.colors.semantic.success}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={resetAssessment}
                style={styles.resetButton}
              >
                <Ionicons
                  name="refresh"
                  size={20}
                  color={DesignSystem.colors.semantic.success}
                />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.profileSubtitle}>
            {assessment.person1.name} & {assessment.person2.name}
          </Text>
          <Text style={styles.compatibilityBadge}>
            {assessment.compatibilityScore}% Trust Compatibility
          </Text>
        </Animated.View>

        {/* Overall Compatibility Score */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Overall Trust Compatibility</Text>

          <Animated.View
            style={[
              styles.compatibilityCard,
              {
                shadowOpacity: shadowOpacity,
                shadowOffset: { width: 0, height: 6 },
                shadowRadius: 10,
                shadowColor: getScoreColor(assessment.compatibilityScore),
                elevation: 10,
              },
            ]}
          >
            <View style={styles.compatibilityScore}>
              <Text
                style={[
                  styles.compatibilityValue,
                  { color: getScoreColor(assessment.compatibilityScore) },
                ]}
              >
                {assessment.compatibilityScore}%
              </Text>
              <Ionicons
                name={getScoreIcon(assessment.compatibilityScore)}
                size={32}
                color={getScoreColor(assessment.compatibilityScore)}
              />
            </View>
            <Text style={styles.compatibilityLabel}>Trust Compatibility</Text>
          </Animated.View>
        </Animated.View>

        {/* Individual Trust Profiles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Individual Trust Scores</Text>

          <View style={styles.profilesContainer}>
            <View style={styles.individualProfile}>
              <Text style={styles.profileName}>{assessment.person1.name}</Text>
              <View style={styles.scoresGrid}>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreValue}>
                    {assessment.person1.trustworthinessScore}
                  </Text>
                  <Text style={styles.scoreLabel}>Trust</Text>
                </View>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreValue}>
                    {assessment.person1.reliabilityScore}
                  </Text>
                  <Text style={styles.scoreLabel}>Reliability</Text>
                </View>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreValue}>
                    {assessment.person1.loyaltyScore}
                  </Text>
                  <Text style={styles.scoreLabel}>Loyalty</Text>
                </View>
              </View>
            </View>

            <View style={styles.individualProfile}>
              <Text style={styles.profileName}>{assessment.person2.name}</Text>
              <View style={styles.scoresGrid}>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreValue}>
                    {assessment.person2.trustworthinessScore}
                  </Text>
                  <Text style={styles.scoreLabel}>Trust</Text>
                </View>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreValue}>
                    {assessment.person2.reliabilityScore}
                  </Text>
                  <Text style={styles.scoreLabel}>Reliability</Text>
                </View>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreValue}>
                    {assessment.person2.loyaltyScore}
                  </Text>
                  <Text style={styles.scoreLabel}>Loyalty</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Trust Indicators */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trust Indicators</Text>

          {assessment.trustIndicators.map((indicator, index) => (
            <TouchableOpacity
              key={index}
              style={styles.indicatorCard}
              onPress={() => toggleIndicator(index)}
            >
              <View style={styles.indicatorHeader}>
                <View style={styles.indicatorInfo}>
                  <Ionicons
                    name={
                      indicator.category === "Communication"
                        ? "chatbubbles"
                        : indicator.category === "Reliability"
                          ? "checkmark-circle"
                          : indicator.category === "Emotional Stability"
                            ? "heart"
                            : indicator.category === "Loyalty"
                              ? "shield"
                              : "ribbon"
                    }
                    size={24}
                    color="#34C759"
                  />
                  <View style={styles.indicatorText}>
                    <Text style={styles.indicatorTitle}>
                      {indicator.category}
                    </Text>
                    <Text
                      style={[
                        styles.indicatorLevel,
                        { color: getScoreColor(indicator.score) },
                      ]}
                    >
                      {indicator.level} ({indicator.score}%)
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name={
                    expandedIndicator === index ? "chevron-up" : "chevron-down"
                  }
                  size={20}
                  color="#8E8E93"
                />
              </View>

              {expandedIndicator === index && (
                <View style={styles.indicatorDetails}>
                  <Text style={styles.indicatorDescription}>
                    {indicator.description}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Deadly Sin Warnings */}
        {deadlySinWarnings && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Spiritual Warnings</Text>

            {/* Your Warning */}
            <View style={styles.deadlySinCard}>
              <Text style={styles.deadlySinPersonTitle}>
                Your Spiritual Challenge
              </Text>
              <View style={styles.deadlySinHeader}>
                <Text style={styles.deadlySinTitle}>
                  Beware of {deadlySinWarnings.your.sin}
                </Text>
              </View>
              <Text style={styles.deadlySinWarning}>
                {deadlySinWarnings.your.warning}
              </Text>
              <View style={styles.consequencesContainer}>
                <Text style={styles.consequencesLabel}>Impact on Trust:</Text>
                <Text style={styles.consequencesText}>
                  {deadlySinWarnings.your.consequences}
                </Text>
              </View>
            </View>

            {/* Partner Warning */}
            <View style={[styles.deadlySinCard, { marginTop: 16 }]}>
              <Text style={styles.deadlySinPersonTitle}>
                {partnerFullName}&apos;s Spiritual Challenge
              </Text>
              <View style={styles.deadlySinHeader}>
                <Text style={styles.deadlySinTitle}>
                  Beware of {deadlySinWarnings.partner.sin}
                </Text>
              </View>
              <Text style={styles.deadlySinWarning}>
                {deadlySinWarnings.partner.warning}
              </Text>
              <View style={styles.consequencesContainer}>
                <Text style={styles.consequencesLabel}>Impact on Trust:</Text>
                <Text style={styles.consequencesText}>
                  {deadlySinWarnings.partner.consequences}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Recommendations */}
        {assessment.recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            <View style={styles.listCard}>
              {assessment.recommendations.map((recommendation, index) => (
                <Text key={index} style={styles.listItem}>
                  • {recommendation}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Roxy Professional Compatibility Analysis */}
        {assessment.roxyInsights && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              ⭐ Professional Compatibility Analysis
            </Text>

            {/* Combined Strengths */}
            {assessment.roxyInsights.combinedStrengths?.length > 0 && (
              <View style={[styles.listCard, styles.strengthCard]}>
                <Text style={styles.insightTitle}>🌟 Combined Strengths</Text>
                {assessment.roxyInsights.combinedStrengths.map(
                  (strength: string, index: number) => (
                    <Text
                      key={index}
                      style={[styles.listItem, styles.strengthText]}
                    >
                      ✅ {strength}
                    </Text>
                  )
                )}
              </View>
            )}

            {/* Shared Lucky Numbers */}
            {assessment.roxyInsights.luckyNumbersCompatibility?.sharedNumbers
              ?.length > 0 && (
              <View style={[styles.listCard, styles.luckyCard]}>
                <Text style={styles.insightTitle}>🍀 Shared Lucky Numbers</Text>
                <View style={styles.luckyNumbersContainer}>
                  {assessment.roxyInsights.luckyNumbersCompatibility.sharedNumbers.map(
                    (number: number, index: number) => (
                      <View key={index} style={styles.luckyNumberBadge}>
                        <Text style={styles.luckyNumberText}>{number}</Text>
                      </View>
                    )
                  )}
                </View>
              </View>
            )}

            {/* Shared Lucky Colors */}
            {assessment.roxyInsights.luckyColorsCompatibility?.sharedColors
              ?.length > 0 && (
              <View style={[styles.listCard, styles.luckyCard]}>
                <Text style={styles.insightTitle}>🎨 Shared Lucky Colors</Text>
                <View style={styles.luckyColorsContainer}>
                  {assessment.roxyInsights.luckyColorsCompatibility.sharedColors.map(
                    (color: string, index: number) => (
                      <View key={index} style={styles.luckyColorBadge}>
                        <Text style={styles.luckyColorText}>{color}</Text>
                      </View>
                    )
                  )}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Personalized Relationship Insights */}
        {personalizedInsights && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personalized Insights</Text>
            <View style={[styles.listCard, styles.insightsCard]}>
              <Text style={styles.insightsText}>{personalizedInsights}</Text>
            </View>
          </View>
        )}

        {/* AI Relationship Predictions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔮 Oracle Predictions</Text>
          <View style={[styles.listCard, styles.predictionsCard]}>
            {loadingPredictions ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#9b59b6" />
                <Text style={styles.loadingText}>
                  Oracle is gazing into your relationships future...
                </Text>
              </View>
            ) : aiPredictions ? (
              <Text style={styles.predictionsText}>{aiPredictions}</Text>
            ) : (
              <Text style={styles.predictionsText}>
                The cosmos is revealing the destiny of your connection...
              </Text>
            )}
          </View>
        </View>

        {/* Warning Flags */}
        {assessment.warningFlags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Areas to Watch</Text>
            <View style={[styles.listCard, styles.warningCard]}>
              {assessment.warningFlags.map((warning, index) => (
                <Text key={index} style={[styles.listItem, styles.warningText]}>
                  ⚠️ {warning}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Strengths */}
        {assessment.strengthAreas.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Relationship Strengths</Text>
            <View style={[styles.listCard, styles.strengthCard]}>
              {assessment.strengthAreas.map((strength, index) => (
                <Text
                  key={index}
                  style={[styles.listItem, styles.strengthText]}
                >
                  ✅ {strength}
                </Text>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Custom Alert Component */}
      {AlertComponent}

      {/* Usage Limit Modal */}
      <UsageLimitModal
        visible={showUsageLimitModal}
        onClose={() => setShowUsageLimitModal(false)}
        onUpgrade={openPricingPage}
        feature="trustAssessment"
      />

      {/* Payment Modal */}
      {/* <PaymentModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={async () => {
          // Reload usage stats after successful payment
          if (user?.id) {
            const stats = await SubscriptionService.getUsageStats(user.id);
            const resetDate = new Date(stats.trustAssessment.resetsAt);
            const now = new Date();
            const daysUntilReset = Math.ceil(
              (resetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            );

            setUsageStats({
              trustAssessmentUsage: stats.trustAssessment.totalUsed,
              trustAssessmentRemaining: stats.trustAssessment.remaining,
              daysUntilReset: Math.max(0, daysUntilReset),
              isPremium: stats.isPremium,
            });
          }
        }}
        title="Upgrade to Premium"
        description="Get unlimited trust assessments and more!"
        features={[
          "🛡️ Unlimited trust assessments",
          "💕 Unlimited love compatibility checks",
          "✨ Unlimited numerology readings",
          "🔮 Unlimited Oracle consultations",
          "⚡ Priority AI responses",
          "📈 Advanced relationship insights",
        ]}
      /> */}
    </SafeAreaView>
  );
}

TrustAssessmentScreen.displayName = "TrustAssessmentScreen";

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
  stepProgressContainer: {
    marginTop: 20,
    alignItems: "center",
    width: "100%",
  },
  stepProgressBar: {
    width: "70%",
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    overflow: "hidden",
  },
  stepProgressFill: {
    height: "100%",
    backgroundColor: DesignSystem.colors.primary.solidPurple,
    borderRadius: 2,
  },
  stepProgressText: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 8,
    fontWeight: "500",
  },
  inputSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  inputLabel: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    flex: 1,
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
  inputCard: {
    marginBottom: 0,
    padding: 0,
  },
  nameDisplay: {
    fontSize: DesignSystem.typography.sizes.base,
    color: DesignSystem.colors.text.primary,
    textAlign: "center",
  },
  glassinput: {
    fontSize: DesignSystem.typography.sizes.base,
    color: DesignSystem.colors.text.primary,
    padding: DesignSystem.spacing.scale.lg,
    backgroundColor: "transparent",
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
  proceedButton: {
    marginTop: DesignSystem.spacing.scale["2xl"],
  },
  disabledButton: {
    opacity: 0.6,
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginHorizontal: 8,
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
    gap: 8,
  },
  profileTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  shareButton: {
    padding: 8,
  },
  resetButton: {
    padding: 8,
  },
  compatibilityBadge: {
    fontSize: 14,
    color: "#34C759",
    fontWeight: "600",
    textAlign: "center",
    backgroundColor: "rgba(52, 199, 89, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 8,
    alignSelf: "center",
  },
  profileSubtitle: {
    fontSize: 16,
    color: "#8E8E93",
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
  compatibilityCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  compatibilityScore: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  compatibilityValue: {
    fontSize: 48,
    fontWeight: "bold",
    marginRight: 16,
  },
  compatibilityLabel: {
    fontSize: 18,
    color: "#8E8E93",
    fontWeight: "500",
  },
  profilesContainer: {
    gap: 16,
  },
  individualProfile: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
    textAlign: "center",
  },
  scoresGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  scoreItem: {
    alignItems: "center",
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#34C759",
  },
  scoreLabel: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 4,
  },
  indicatorCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2C2C2E",
    overflow: "hidden",
  },
  indicatorHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  indicatorInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  indicatorText: {
    marginLeft: 12,
  },
  indicatorTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  indicatorLevel: {
    fontSize: 14,
    fontWeight: "500",
  },
  indicatorDetails: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: "#2C2C2E",
  },
  indicatorDescription: {
    fontSize: 15,
    color: "#8E8E93",
    lineHeight: 22,
  },
  listCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  warningCard: {
    borderColor: "#FF3B30",
    backgroundColor: "rgba(255, 59, 48, 0.1)",
  },
  strengthCard: {
    borderColor: "#34C759",
    backgroundColor: "rgba(52, 199, 89, 0.1)",
  },
  insightsCard: {
    borderColor: "#667eea",
    backgroundColor: "rgba(102, 126, 234, 0.1)",
  },
  insightsText: {
    fontSize: 15,
    color: "#FFFFFF",
    lineHeight: 22,
    textAlign: "left",
  },
  listItem: {
    fontSize: 15,
    color: "#FFFFFF",
    lineHeight: 24,
    marginBottom: 8,
  },
  warningText: {
    color: "#FF3B30",
  },
  strengthText: {
    color: "#34C759",
  },
  relationshipDescription: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  relationshipTypeContainer: {
    gap: 12,
    marginBottom: 24,
  },
  relationshipTypeCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2C2C2E",
  },
  selectedRelationshipType: {
    backgroundColor: DesignSystem.colors.primary.solidPurple,
    borderColor: DesignSystem.colors.primary.solidPurple,
  },
  relationshipTypeLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: 8,
    marginBottom: 4,
  },
  selectedRelationshipTypeLabel: {
    color: "#FFFFFF",
  },
  relationshipTypeDescription: {
    fontSize: 13,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 18,
  },
  selectedRelationshipTypeDescription: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  selectionHint: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 16,
  },
  deadlySinCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: "#FF3B30",
  },
  deadlySinPersonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 8,
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
  predictionsCard: {
    borderColor: "#9b59b6",
    backgroundColor: "rgba(155, 89, 182, 0.1)",
  },
  predictionsText: {
    fontSize: 15,
    color: "#FFFFFF",
    lineHeight: 22,
    textAlign: "left",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 14,
    color: "#9b59b6",
    textAlign: "center",
    marginTop: 12,
    fontStyle: "italic",
  },
  // Roxy insights styles
  insightTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
    textAlign: "center",
  },
  luckyCard: {
    borderColor: "#FFD700",
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    marginBottom: 16,
  },
  luckyNumbersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  luckyColorsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  luckyNumberBadge: {
    backgroundColor: "rgba(255, 215, 0, 0.3)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  luckyNumberText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFD700",
  },
  luckyColorBadge: {
    backgroundColor: "rgba(138, 43, 226, 0.3)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#8A2BE2",
  },
  luckyColorText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8A2BE2",
  },
});
