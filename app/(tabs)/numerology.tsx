import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
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
import ReadMoreText from "../../components/ReadMoreText";
import { DatePicker, ShadcnButton, ShadcnInput } from "../../components/ui";
import Badge from "../../components/ui/Badge";
import GlassCard from "../../components/ui/GlassCard";
import { DesignSystem } from "../../constants/DesignSystem";
import { useProfile } from "../../contexts/ProfileContext";
import NumerologyService from "../../services/NumerologyService";
import { RoxyNumerologyService } from "../../services/ProkeralaNumerologyService";
import SimpleAIService from "../../services/SimpleAIService";
import { StaticDataService } from "../../services/StaticDataService";
import { SubscriptionService } from "../../services/SubscriptionService";
import UsageTrackingService from "../../services/UsageTrackingService";
import ImprovedNumerologyReadingScreen from "../../screens/ImprovedNumerologyReadingScreen";

interface PredictionCategory {
  category: string;
  timeframe: string;
  predictions: string[];
}

interface NumerologyProfile {
  lifePathNumber: number;
  destinyNumber: number;
  soulUrgeNumber: number;
  personalityNumber: number;
  characterAnalysis: string;
  predictions: PredictionCategory[];
  roxyInsights?: {
    strengths: string[];
    challenges: string[];
    career: string;
    relationship: string;
    spiritual: string;
    luckyNumbers: number[];
    luckyColors: string[];
    lifePathDescription: string;
    personalYear: number;
  } | null;
  aiInsights?: string;
  deadlySinWarning?: { sin: string; warning: string; consequences: string };
}

export default function NumerologyScreen() {
  const { user } = useUser();
  const { profileData } = useProfile();
  const [profile, setProfile] = useState<NumerologyProfile | null>(null);
  // const [showInput, setShowInput] = useState(false);
  const [showImprovedReading, setShowImprovedReading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [loading, setLoading] = useState(false);
  // const [roxyLoading, setRoxyLoading] = useState(false);
  const [aiLoadingStates, setAiLoadingStates] = useState({
    characterAnalysis: false,
    deadlySinWarning: false,
  });
  const [refreshing, setRefreshing] = useState(false);
  const { AlertComponent } = useCustomAlert();

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

    if (aiLoadingStates.characterAnalysis || aiLoadingStates.deadlySinWarning) {
      startShimmer();
    }
  }, [aiLoadingStates, shimmerAnimation]);


  // Auto-fill form if user has profile data (but don't auto-generate)
  useEffect(() => {
    console.log("Numerology - Profile data:", {
      full_name: profileData?.full_name,
      birth_date: profileData?.birth_date,
      birth_time: profileData?.birth_time,
    });

    if (profileData?.full_name) {
      setFullName(profileData.full_name);
    }

    if (profileData?.birth_date) {
      // Handle different birth date formats
      let formattedBirthDate = profileData.birth_date;

      // If it's in YYYY-MM-DD format, convert to MM/DD/YYYY
      if (
        formattedBirthDate.includes("-") &&
        formattedBirthDate.length === 10
      ) {
        const [year, month, day] = formattedBirthDate.split("-");
        formattedBirthDate = `${month.padStart(2, "0")}/${day.padStart(2, "0")}/${year}`;
      }

      setBirthDate(formattedBirthDate);
      console.log("Numerology - Setting birth date:", formattedBirthDate);
    }

    if (profileData?.birth_time) {
      setBirthTime(profileData.birth_time);
      console.log("Numerology - Setting birth time:", profileData.birth_time);
    }
  }, [profileData]);

  // Pull to refresh function
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Reset the profile if exists
      if (profile) {
        setProfile(null);
      }

      // Simulate some loading time for smooth UX
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Failed to refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Enhanced AI analysis function
  const enhanceWithAI = async () => {
    if (!profile?.roxyInsights && (!fullName.trim() || !birthDate)) {
      Alert.alert(
        "Missing Information",
        "Please generate your numerology reading first to unlock AI character analysis."
      );
      return;
    }

    setAiLoadingStates((prev) => ({
      ...prev,
      characterAnalysis: true,
    }));

    try {
      let aiInsights = "";

      if (profile?.roxyInsights) {
        // Use Roxy data for enhanced analysis
        aiInsights = await SimpleAIService.generateOptimizedCharacterAnalysis(
          fullName.trim(),
          profile.roxyInsights
        );
      } else {
        // Fallback AI analysis
        const prompt = `Create a detailed character analysis for ${fullName.trim()} born on ${birthDate}:

Write 4 engaging paragraphs (45-55 words each):

1. **Core Essence**: Natural personality, inner drive, and what makes them magnetic to others.
2. **Hidden Shadows**: Challenging traits, blind spots, or patterns that hold them back.
3. **Love & Relationships**: How they love, what they need from partners, relationship patterns.
4. **Life Mission**: Deeper purpose, what they're here to learn/teach, and how to fulfill potential.

Use "you" voice. Be specific and insightful.`;

        const result = await SimpleAIService.generateResponse(
          prompt,
          "numerology"
        );
        aiInsights = result.content;
      }

      // Update profile with AI insights
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              aiInsights: String(aiInsights || ""),
            }
          : null
      );
    } catch (error) {
      console.error("AI enhancement error:", error);
      Alert.alert("Error", "Failed to generate AI analysis. Please try again.");
    } finally {
      setAiLoadingStates((prev) => ({
        ...prev,
        characterAnalysis: false,
      }));
    }
  };

  const handleGenerate = async (
    fullNameParam?: string,
    birthDateParam?: string
  ) => {
    const fullNameToUse = fullNameParam || fullName.trim();
    const dateToUse = birthDateParam || birthDate;

    if (!fullNameToUse || !dateToUse) {
      Alert.alert("Error", "Please enter your full name and birth date");
      return;
    }

    setLoading(true);
    // setShowInput(false);

    try {
      // STEP 1: Get Roxy API data immediately
      // setRoxyLoading(true);
      let roxyData: any = null;

      try {
        const nameParts = fullNameToUse.split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        const roxyResponse = await Promise.race([
          RoxyNumerologyService.getNumerologyReading(
            firstName,
            lastName,
            dateToUse,
            birthTime
          ),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("API timeout")), 5000)
          ),
        ]);

        if (roxyResponse) {
          roxyData = roxyResponse;
        }
      } catch (error) {
        console.log("Roxy API failed:", error);
      }

      // setRoxyLoading(false);

      // Create base numerology profile
      const baseProfile = NumerologyService.generateProfile(
        fullNameToUse,
        dateToUse
      );

      const enhancedProfile: NumerologyProfile = {
        ...baseProfile,
        lifePathNumber:
          roxyData?.life_path_number || baseProfile.lifePathNumber,
        destinyNumber: roxyData?.destiny_number || baseProfile.destinyNumber,
        soulUrgeNumber:
          roxyData?.soul_urge_number || baseProfile.soulUrgeNumber,
        personalityNumber:
          roxyData?.personality_number || baseProfile.personalityNumber,
        characterAnalysis:
          roxyData?.life_path_description || "Loading AI analysis...",
        predictions: NumerologyService.generatePredictions(baseProfile),
        roxyInsights: roxyData
          ? {
              strengths: Array.isArray(roxyData.strengths)
                ? roxyData.strengths
                : [],
              challenges: Array.isArray(roxyData.challenges)
                ? roxyData.challenges
                : [],
              career: roxyData.career_guidance || "",
              relationship: roxyData.relationship_guidance || "",
              spiritual: roxyData.spiritual_guidance || "",
              luckyNumbers: Array.isArray(roxyData.lucky_numbers)
                ? roxyData.lucky_numbers
                : [],
              luckyColors: Array.isArray(roxyData.lucky_colors)
                ? roxyData.lucky_colors
                : [],
              lifePathDescription: roxyData.life_path_description || "",
              personalYear:
                roxyData.personal_year_number ||
                (new Date().getFullYear() % 9) + 1,
            }
          : null,
      };

      // Display initial profile
      setProfile(enhancedProfile);
      setLoading(false);

      // Track usage
      if (user?.id) {
        UsageTrackingService.trackNumerologyUsage(user.id, {
          name: fullNameToUse,
          birthDate: dateToUse,
          lifePathNumber: enhancedProfile.lifePathNumber,
          source: roxyData ? "roxy" : "local",
        });
      }

      // STEP 2: Start AI processing for character analysis and deadly sin warning
      setTimeout(async () => {
        // Character Analysis
        if (roxyData) {
          setAiLoadingStates((prev) => ({ ...prev, characterAnalysis: true }));

          try {
            const aiAnalysis =
              await SimpleAIService.generateOptimizedCharacterAnalysis(
                fullNameToUse,
                enhancedProfile
              );

            setProfile((prev) => ({
              ...prev!,
              characterAnalysis: aiAnalysis,
            }));
          } catch (error) {
            console.log("AI character analysis failed:", error);
          } finally {
            setAiLoadingStates((prev) => ({
              ...prev,
              characterAnalysis: false,
            }));
          }
        }

        // Deadly Sin Warning
        setAiLoadingStates((prev) => ({ ...prev, deadlySinWarning: true }));

        try {
          // Create a compatible profile object for the service
          const compatibleProfile = {
            lifePathNumber: enhancedProfile.lifePathNumber,
            destinyNumber: enhancedProfile.destinyNumber,
            soulUrgeNumber: enhancedProfile.soulUrgeNumber,
            personalityNumber: enhancedProfile.personalityNumber,
            birthdayNumber: 0, // Default values for missing fields
            personalYearNumber: (new Date().getFullYear() % 9) + 1,
            lifePathInfo: null as any,
            destinyInfo: null as any,
            soulUrgeInfo: null as any,
            personalityInfo: null as any,
            birthdayInfo: null as any,
            characterAnalysis: enhancedProfile.characterAnalysis,
            predictions: enhancedProfile.predictions,
            calculations: null as any,
          };
          const deadlySinWarning =
            await SimpleAIService.generateDeadlySinWarning(
              compatibleProfile as any
            );

          setProfile((prev) => ({
            ...prev!,
            deadlySinWarning,
          }));
        } catch {
          // Fallback to static warning
          const staticWarning = StaticDataService.getStaticDeadlySinWarning(
            enhancedProfile.lifePathNumber,
            fullNameToUse
          );
          setProfile((prev) => ({
            ...prev!,
            deadlySinWarning: staticWarning,
          }));
        } finally {
          setAiLoadingStates((prev) => ({ ...prev, deadlySinWarning: false }));
        }
      }, 1000);
    } catch (error) {
      console.error("Error generating numerology:", error);
      Alert.alert(
        "Error",
        "Failed to generate numerology reading. Please try again."
      );
      setLoading(false);
      // setRoxyLoading(false);
    }
  };

  const renderShimmerLine = (width = "100%") => (
    <Animated.View
      style={[
        styles.shimmerLine,
        { width: width as any },
        {
          opacity: shimmerAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 0.8],
          }),
        },
      ]}
    />
  );

  const renderNumerologyCard = (
    title: string,
    number: number,
    description: string
  ) => (
    <GlassCard key={title} style={styles.numberCard}>
      <View style={styles.numberHeader}>
        <Text style={styles.numberTitle}>{title}</Text>
        <View style={styles.numberBadge}>
          <Text style={styles.numberValue}>{number}</Text>
        </View>
      </View>
      <Text style={styles.numberDescription}>{description}</Text>
    </GlassCard>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Animated.View style={styles.loadingHeart}>
            <Ionicons name="calculator" size={48} color="#FF6B9D" />
          </Animated.View>
          <Text style={styles.loadingText}>
            Calculating your cosmic numbers...
          </Text>
          <Text style={styles.loadingSubtext}>
            Unlocking the secrets of your numerology
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Ionicons
              name="calculator"
              size={48}
              color={DesignSystem.colors.primary.solidPurple}
            />
            <Text style={styles.title}>Numerology Reading</Text>
            <Text style={styles.description}>
              Discover the hidden meanings in your numbers
            </Text>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Your Information</Text>

            <View style={styles.inputContainer}>
              <ShadcnInput
                label="Your Full Name"
                placeholder="Enter your full name"
                value={fullName}
                onChangeText={setFullName}
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
                        } catch {
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

            <View style={styles.inputContainer}>
              <ShadcnInput
                label="Birth Time (Optional)"
                placeholder="HH:MM (e.g., 14:30)"
                value={birthTime}
                onChangeText={setBirthTime}
                leftIcon="time"
              />
            </View>

            <ShadcnButton
              variant="default"
              size="lg"
              onPress={() => handleGenerate()}
              startIcon="calculator"
              style={styles.proceedButton}
            >
              Generate My Reading
            </ShadcnButton>
          </View>
        </ScrollView>
        {AlertComponent}
      </SafeAreaView>
    );
  }

  // Show improved reading screen if requested
  if (showImprovedReading && profile) {
    return (
      <ImprovedNumerologyReadingScreen
        profile={profile}
        lifePathInfo={null}
        predictions={profile.predictions || []}
        characterAnalysis={
          profile.aiInsights ||
          "Your unique numerological profile reveals fascinating insights about your personality and life path."
        }
        onBack={() => setShowImprovedReading(false)}
        birthDate={birthDate}
        name={fullName}
        userId={user?.id}
      />
    );
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
            <Text style={styles.profileTitle}>Your Numerology Profile</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                onPress={() => setShowImprovedReading(true)}
                style={[
                  styles.resetButton,
                  {
                    backgroundColor: DesignSystem.colors.primary.cosmic,
                    marginRight: 10,
                  },
                ]}
              >
                <Ionicons name="sparkles" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setProfile(null);
                  // setShowInput(true);
                }}
                style={styles.resetButton}
              >
                <Ionicons
                  name="refresh"
                  size={20}
                  color={DesignSystem.colors.primary.cosmic}
                />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.profileSubtitle}>
            {fullName} • Born {birthDate}
          </Text>
        </View>

        {/* Enhanced Reading Button */}
        <TouchableOpacity
          onPress={() => setShowImprovedReading(true)}
          style={styles.enhancedReadingButton}
        >
          <Text style={styles.enhancedReadingButtonText}>
            ✨ View Enhanced Reading with AI Chat
          </Text>
          <Ionicons name="arrow-forward" size={16} color="white" />
        </TouchableOpacity>

        {/* Core Numbers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Core Numbers</Text>
          {renderNumerologyCard(
            "Life Path",
            profile.lifePathNumber,
            "Your life's purpose and the path you're meant to walk"
          )}
          {renderNumerologyCard(
            "Destiny",
            profile.destinyNumber,
            "What you're destined to achieve in this lifetime"
          )}
          {renderNumerologyCard(
            "Soul Urge",
            profile.soulUrgeNumber,
            "Your heart's deepest desires and motivations"
          )}
          {renderNumerologyCard(
            "Personality",
            profile.personalityNumber,
            "How others perceive you and your outer personality"
          )}
        </View>

        {/* Character Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="person" size={20} color="#FF6B9D" /> Character
            Analysis
          </Text>
          <GlassCard style={styles.analysisCard}>
            {aiLoadingStates.characterAnalysis ? (
              <View style={styles.shimmerContainer}>
                <Text style={styles.loadingTitle}>
                  🤖 AI is analyzing your character...
                </Text>
                {renderShimmerLine("95%")}
                {renderShimmerLine("80%")}
                {renderShimmerLine("90%")}
                {renderShimmerLine("70%")}
              </View>
            ) : (
              <ReadMoreText
                text={profile.characterAnalysis}
                style={styles.analysisText}
                readMoreStyle={styles.readMoreText}
              />
            )}
          </GlassCard>
        </View>

        {/* Deadly Sin Warning */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="warning" size={20} color="#FF4444" /> Deadly Sin
            Warning
          </Text>
          <GlassCard style={styles.warningCard}>
            {aiLoadingStates.deadlySinWarning ? (
              <View style={styles.shimmerContainer}>
                <Text style={styles.loadingTitle}>
                  ⚠️ Generating your warning...
                </Text>
                {renderShimmerLine("90%")}
                {renderShimmerLine("75%")}
                {renderShimmerLine("85%")}
              </View>
            ) : (
              <>
                <View style={styles.warningHeader}>
                  <Ionicons name="skull" size={24} color="#FF4444" />
                  <Text style={styles.warningTitle}>Beware Your Shadow</Text>
                </View>
                <Text style={styles.warningText}>
                  {profile.deadlySinWarning?.warning ||
                    "Your warning is being prepared..."}
                </Text>
              </>
            )}
          </GlassCard>
        </View>

        {/* Roxy API Insights */}
        {profile.roxyInsights && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="star" size={20} color="#FFD700" /> Professional
              Insights
            </Text>

            {profile.roxyInsights.strengths.length > 0 && (
              <GlassCard style={styles.insightCard}>
                <Text style={styles.insightTitle}>✨ Your Strengths</Text>
                {profile.roxyInsights.strengths.map((strength, index) => (
                  <Text key={index} style={styles.insightText}>
                    • {String(strength || "")}
                  </Text>
                ))}
              </GlassCard>
            )}

            {profile.roxyInsights.challenges.length > 0 && (
              <GlassCard style={styles.insightCard}>
                <Text style={styles.insightTitle}>🔮 Your Challenges</Text>
                {profile.roxyInsights.challenges.map((challenge, index) => (
                  <Text key={index} style={styles.insightText}>
                    • {String(challenge || "")}
                  </Text>
                ))}
              </GlassCard>
            )}

            {profile.roxyInsights.career && (
              <GlassCard style={styles.insightCard}>
                <Text style={styles.insightTitle}>💼 Career Guidance</Text>
                <Text style={styles.insightText}>
                  {String(profile.roxyInsights.career || "")}
                </Text>
              </GlassCard>
            )}

            {profile.roxyInsights.relationship && (
              <GlassCard style={styles.insightCard}>
                <Text style={styles.insightTitle}>
                  💕 Relationship Guidance
                </Text>
                <Text style={styles.insightText}>
                  {String(profile.roxyInsights.relationship || "")}
                </Text>
              </GlassCard>
            )}

            {profile.roxyInsights.luckyNumbers.length > 0 && (
              <GlassCard style={styles.insightCard}>
                <Text style={styles.insightTitle}>🍀 Lucky Numbers</Text>
                <View style={styles.luckyNumbersContainer}>
                  {profile.roxyInsights.luckyNumbers.map((number, index) => (
                    <Badge
                      key={index}
                      variant="default"
                      style={styles.luckyNumber}
                    >
                      {String(number || "")}
                    </Badge>
                  ))}
                </View>
              </GlassCard>
            )}

            {profile.roxyInsights.luckyColors.length > 0 && (
              <GlassCard style={styles.insightCard}>
                <Text style={styles.insightTitle}>🎨 Lucky Colors</Text>
                <View style={styles.luckyColorsContainer}>
                  {profile.roxyInsights.luckyColors.map((color, index) => (
                    <Badge
                      key={index}
                      variant="success"
                      style={styles.luckyColor}
                    >
                      {String(color || "")}
                    </Badge>
                  ))}
                </View>
              </GlassCard>
            )}
          </View>
        )}

        {/* Predictions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="telescope" size={20} color="#34C759" /> Your
            Predictions
          </Text>
          {profile.predictions.map((predictionCategory, index) => (
            <GlassCard key={index} style={styles.predictionCard}>
              <Text style={styles.insightTitle}>
                {predictionCategory.category} - {predictionCategory.timeframe}
              </Text>
              {predictionCategory.predictions.map((prediction: string, pIndex: number) => (
                <Text key={pIndex} style={styles.predictionText}>
                  • {prediction}
                </Text>
              ))}
            </GlassCard>
          ))}
        </View>

        {/* AI Character Analysis Enhancement */}
        {profile.aiInsights && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="sparkles" size={20} color="#FF9500" /> AI
              Character Analysis
            </Text>
            <GlassCard style={styles.insightCard}>
              <ReadMoreText
                text={profile.aiInsights}
                maxLength={500}
                style={styles.analysisText}
              />
            </GlassCard>
          </View>
        )}

        {/* AI Enhancement Button */}
        {!aiLoadingStates.characterAnalysis && !profile.aiInsights && (
          <View style={styles.section}>
            <GlassCard style={styles.enhancementCard}>
              <View style={styles.enhancementContent}>
                <Ionicons name="sparkles" size={32} color="#FF9500" />
                <Text style={styles.enhancementTitle}>
                  Unlock AI Character Analysis
                </Text>
                <Text style={styles.enhancementDescription}>
                  Get deeper insights into your personality, relationships, and
                  life purpose with AI-powered analysis
                </Text>
                <TouchableOpacity
                  style={styles.enhancementButton}
                  onPress={enhanceWithAI}
                >
                  <Ionicons name="star" size={20} color="#FFFFFF" />
                  <Text style={styles.enhancementButtonText}>
                    Enhance with AI
                  </Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          </View>
        )}

        {/* AI Loading */}
        {aiLoadingStates.characterAnalysis && (
          <View style={styles.section}>
            <GlassCard style={styles.insightCard}>
              <View style={styles.aiLoadingContainer}>
                <Animated.View
                  style={[
                    styles.shimmer,
                    {
                      opacity: shimmerAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 1],
                      }),
                    },
                  ]}
                >
                  <Ionicons name="sparkles" size={32} color="#FF9500" />
                </Animated.View>
                <Text style={styles.aiLoadingText}>
                  AI is analyzing your character...
                </Text>
                <Text style={styles.aiLoadingSubtext}>
                  Creating personalized insights just for you
                </Text>
              </View>
            </GlassCard>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
      {AlertComponent}
    </SafeAreaView>
  );
}

NumerologyScreen.displayName = "NumerologyScreen";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.backgrounds.dark,
  },
  scrollView: {
    flex: 1, // Added to force style refresh
  },
  scrollContent: {
    paddingBottom: DesignSystem.spacing.scale["6xl"],
  },
  keyboardContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: DesignSystem.spacing.scale.xl,
    backgroundColor: DesignSystem.colors.backgrounds.dark,
  },
  loadingHeart: {
    marginBottom: DesignSystem.spacing.scale.xl,
  },
  loadingText: {
    color: DesignSystem.colors.text.primary,
    fontSize: DesignSystem.typography.sizes.lg,
    fontWeight: DesignSystem.typography.weights.semibold,
    textAlign: "center",
    marginBottom: DesignSystem.spacing.scale.sm,
  },
  loadingSubtext: {
    color: DesignSystem.colors.text.secondary,
    fontSize: DesignSystem.typography.sizes.sm,
    textAlign: "center",
  },
  inputContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: DesignSystem.spacing.scale.xl,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: DesignSystem.spacing.scale["5xl"],
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    color: DesignSystem.colors.text.secondary,
    fontSize: DesignSystem.typography.sizes.base,
    textAlign: "center",
    marginTop: DesignSystem.spacing.scale.sm,
  },
  inputCard: {
    padding: DesignSystem.spacing.scale["2xl"],
  },
  inputLabel: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 24,
  },
  input: {
    marginBottom: DesignSystem.spacing.scale.lg,
  },
  generateButton: {
    marginTop: DesignSystem.spacing.scale["2xl"],
  },
  proceedButton: {
    marginTop: DesignSystem.spacing.scale["2xl"],
  },
  header: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
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
  profileHeader: {
    paddingHorizontal: DesignSystem.spacing.scale.xl,
    paddingTop: DesignSystem.spacing.scale.xl,
    paddingBottom: DesignSystem.spacing.scale.lg,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: DesignSystem.spacing.scale.sm,
  },
  profileTitle: {
    color: DesignSystem.colors.text.primary,
    fontSize: DesignSystem.typography.sizes["2xl"],
    fontWeight: DesignSystem.typography.weights.bold,
  },
  resetButton: {
    padding: DesignSystem.spacing.scale.sm,
    borderRadius: DesignSystem.borderRadius.md,
    backgroundColor: DesignSystem.colors.backgrounds.cardGlass,
  },
  profileSubtitle: {
    color: DesignSystem.colors.text.secondary,
    fontSize: DesignSystem.typography.sizes.sm,
  },
  section: {
    paddingHorizontal: DesignSystem.spacing.scale.xl,
    marginBottom: DesignSystem.spacing.scale["2xl"],
  },
  sectionTitle: {
    color: DesignSystem.colors.text.primary,
    fontSize: DesignSystem.typography.sizes.xl,
    fontWeight: DesignSystem.typography.weights.bold,
    marginBottom: DesignSystem.spacing.scale.lg,
    flexDirection: "row",
    alignItems: "center",
  },
  numberCard: {
    padding: DesignSystem.spacing.scale.xl,
    marginBottom: DesignSystem.spacing.scale.md,
  },
  numberHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: DesignSystem.spacing.scale.md,
  },
  numberTitle: {
    color: DesignSystem.colors.text.primary,
    fontSize: DesignSystem.typography.sizes.lg,
    fontWeight: DesignSystem.typography.weights.semibold,
  },
  numberBadge: {
    backgroundColor: DesignSystem.colors.primary.cosmic,
    borderRadius: DesignSystem.borderRadius.xl,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  numberValue: {
    color: DesignSystem.colors.text.primary,
    fontSize: DesignSystem.typography.sizes.lg,
    fontWeight: DesignSystem.typography.weights.bold,
  },
  numberDescription: {
    color: DesignSystem.colors.text.secondary,
    fontSize: DesignSystem.typography.sizes.sm,
    lineHeight: DesignSystem.typography.sizes.xl,
  },
  analysisCard: {
    padding: DesignSystem.spacing.scale.xl,
  },
  warningCard: {
    padding: DesignSystem.spacing.scale.xl,
    borderWidth: 2,
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: DesignSystem.spacing.scale.md,
  },
  warningTitle: {
    color: DesignSystem.colors.semantic.error,
    fontSize: DesignSystem.typography.sizes.lg,
    fontWeight: DesignSystem.typography.weights.bold,
    marginLeft: DesignSystem.spacing.scale.sm,
  },
  warningText: {
    color: DesignSystem.colors.text.primary,
    fontSize: DesignSystem.typography.sizes.base,
    lineHeight: DesignSystem.typography.sizes["2xl"],
  },
  insightCard: {
    padding: DesignSystem.spacing.scale.xl,
    marginBottom: DesignSystem.spacing.scale.md,
  },
  insightTitle: {
    color: DesignSystem.colors.text.primary,
    fontSize: DesignSystem.typography.sizes.lg,
    fontWeight: DesignSystem.typography.weights.semibold,
    marginBottom: DesignSystem.spacing.scale.md,
  },
  insightText: {
    color: DesignSystem.colors.text.secondary,
    fontSize: DesignSystem.typography.sizes.sm + 1,
    lineHeight: 22,
    marginBottom: DesignSystem.spacing.scale.xs,
  },
  luckyNumbersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: DesignSystem.spacing.scale.sm,
  },
  luckyNumber: {
    minWidth: 40,
  },
  luckyColorsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: DesignSystem.spacing.scale.sm,
  },
  luckyColor: {
    minWidth: 60,
  },
  predictionCard: {
    padding: DesignSystem.spacing.scale.lg,
    marginBottom: DesignSystem.spacing.scale.sm,
  },
  predictionText: {
    color: DesignSystem.colors.text.primary,
    fontSize: DesignSystem.typography.sizes.sm + 1,
    lineHeight: 22,
  },
  shimmerContainer: {
    gap: DesignSystem.spacing.scale.sm,
  },
  shimmerLine: {
    height: DesignSystem.spacing.scale.lg,
    backgroundColor: DesignSystem.colors.backgrounds.darkGray,
    borderRadius: DesignSystem.borderRadius.sm,
    marginBottom: DesignSystem.spacing.scale.sm,
    overflow: "hidden",
  },
  loadingTitle: {
    color: DesignSystem.colors.primary.cosmic,
    fontSize: DesignSystem.typography.sizes.base,
    fontWeight: DesignSystem.typography.weights.semibold,
    marginBottom: DesignSystem.spacing.scale.md,
  },
  bottomPadding: {
    height: DesignSystem.spacing.scale["4xl"],
  },
  analysisText: {
    color: DesignSystem.colors.text.primary,
    fontSize: DesignSystem.typography.sizes.base,
    lineHeight: DesignSystem.typography.sizes["2xl"],
  },
  readMoreText: {
    color: DesignSystem.colors.primary.cosmic,
    fontSize: DesignSystem.typography.sizes.sm,
    fontWeight: DesignSystem.typography.weights.semibold,
  },
  enhancementCard: {
    padding: 24,
    alignItems: "center",
  },
  enhancementContent: {
    alignItems: "center",
  },
  enhancementTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  enhancementDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  enhancementButton: {
    backgroundColor: "#FF9500",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  enhancementButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  aiLoadingContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  shimmer: {
    marginBottom: 16,
  },
  aiLoadingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 4,
  },
  aiLoadingSubtext: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  enhancedReadingButton: {
    backgroundColor: DesignSystem.colors.primary.cosmic,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: DesignSystem.colors.primary.cosmic,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  enhancedReadingButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
});
