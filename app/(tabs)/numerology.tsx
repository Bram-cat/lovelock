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
import { LinearGradient } from "expo-linear-gradient";
import NumerologyService from "../../services/NumerologyService";
import { ProkeralaNumerologyService } from "../../services/ProkeralaNumerologyService";
import SimpleAIService from "../../services/SimpleAIService";
import { StaticDataService } from "../../services/StaticDataService";
import UsageTrackingService from "../../services/UsageTrackingService";
import { useProfile } from "../../contexts/ProfileContext";
import { DesignSystem } from "../../constants/DesignSystem";
import { SubscriptionService } from "../../services/SubscriptionService";
import { useCustomAlert } from "../../components/CustomAlert";
import { DatePicker, ShadcnButton, ShadcnInput } from "../../components/ui";
import GlassCard from "../../components/ui/GlassCard";
import Badge from "../../components/ui/Badge";
import ReadMoreText from "../../components/ReadMoreText";

interface NumerologyProfile {
  lifePathNumber: number;
  destinyNumber: number;
  soulUrgeNumber: number;
  personalityNumber: number;
  characterAnalysis: string;
  predictions: string[];
  prokeralaInsights?: {
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
  deadlySinWarning?: string;
}

export default function NumerologyScreen() {
  const { user } = useUser();
  const { profileData } = useProfile();
  const [profile, setProfile] = useState<NumerologyProfile | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [birthDate, setBirthDate] = useState("");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const [prokeralaLoading, setProkeralaLoading] = useState(false);
  const [aiLoadingStates, setAiLoadingStates] = useState({
    characterAnalysis: false,
    deadlySinWarning: false,
  });
  const [usageStats, setUsageStats] = useState<any>(null);
  const { showAlert, AlertComponent } = useCustomAlert();

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

  // Load usage statistics
  useEffect(() => {
    const loadUsageStats = async () => {
      if (user?.id) {
        const stats = await SubscriptionService.getUsageStats(user.id);
        setUsageStats(stats);
      }
    };
    loadUsageStats();
  }, [user?.id]);

  // Auto-generate if user has profile data
  useEffect(() => {
    if (profileData?.full_name && profileData?.birth_date && !profile) {
      const autoName = profileData.full_name;
      const autoBirthDate = profileData.birth_date;
      setUserName(autoName);
      setBirthDate(autoBirthDate);
      handleGenerate(autoName, autoBirthDate);
    }
  }, [profileData, profile]);

  const handleGenerate = async (name?: string, birthDateParam?: string) => {
    const fullName = name || userName.trim();
    const dateToUse = birthDateParam || birthDate;

    if (!fullName || !dateToUse) {
      Alert.alert("Error", "Please enter your full name and birth date");
      return;
    }

    setLoading(true);
    setShowInput(false);

    try {
      // STEP 1: Get ProKerala data immediately
      setProkeralaLoading(true);
      let prokeralaData = null;

      try {
        const prokeralaResponse = await Promise.race([
          ProkeralaNumerologyService.getNumerologyReading(fullName, dateToUse),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("API timeout")), 3000)
          ),
        ]);

        if (prokeralaResponse && prokeralaResponse.success && prokeralaResponse.data) {
          prokeralaData = prokeralaResponse.data;
        }
      } catch (error) {
        console.log("ProKerala API failed:", error);
      }

      setProkeralaLoading(false);

      // Create base numerology profile
      const baseProfile = NumerologyService.generateProfile(fullName, dateToUse);
      
      const enhancedProfile: NumerologyProfile = {
        ...baseProfile,
        lifePathNumber: prokeralaData?.life_path_number || baseProfile.lifePathNumber,
        destinyNumber: prokeralaData?.destiny_number || baseProfile.destinyNumber,
        soulUrgeNumber: prokeralaData?.soul_urge_number || baseProfile.soulUrgeNumber,
        personalityNumber: prokeralaData?.personality_number || baseProfile.personalityNumber,
        characterAnalysis: prokeralaData?.life_path_description || "Loading AI analysis...",
        predictions: NumerologyService.generatePredictions(baseProfile),
        prokeralaInsights: prokeralaData ? {
          strengths: Array.isArray(prokeralaData.strengths) ? prokeralaData.strengths : [],
          challenges: Array.isArray(prokeralaData.challenges) ? prokeralaData.challenges : [],
          career: prokeralaData.career_guidance || "",
          relationship: prokeralaData.relationship_guidance || "",
          spiritual: prokeralaData.spiritual_guidance || "",
          luckyNumbers: Array.isArray(prokeralaData.lucky_numbers) ? prokeralaData.lucky_numbers : [],
          luckyColors: Array.isArray(prokeralaData.lucky_colors) ? prokeralaData.lucky_colors : [],
          lifePathDescription: prokeralaData.life_path_description || "",
          personalYear: prokeralaData.personal_year_number || (new Date().getFullYear() % 9) + 1,
        } : null,
      };

      // Display initial profile
      setProfile(enhancedProfile);
      setLoading(false);

      // Track usage
      if (user?.id) {
        UsageTrackingService.trackNumerologyUsage(user.id, {
          name: fullName,
          birthDate: dateToUse,
          lifePathNumber: enhancedProfile.lifePathNumber,
          source: prokeralaData ? "prokerala" : "local",
        });
      }

      // STEP 2: Start AI processing for character analysis and deadly sin warning
      setTimeout(async () => {
        // Character Analysis
        if (prokeralaData) {
          setAiLoadingStates(prev => ({ ...prev, characterAnalysis: true }));
          
          try {
            const aiAnalysis = await SimpleAIService.generateOptimizedCharacterAnalysis(
              fullName, 
              enhancedProfile
            );
            
            setProfile(prev => ({
              ...prev!,
              characterAnalysis: aiAnalysis,
            }));
          } catch (error) {
            console.log("AI character analysis failed:", error);
          } finally {
            setAiLoadingStates(prev => ({ ...prev, characterAnalysis: false }));
          }
        }

        // Deadly Sin Warning
        setAiLoadingStates(prev => ({ ...prev, deadlySinWarning: true }));
        
        try {
          const deadlySinWarning = await SimpleAIService.generateDeadlySinWarning(enhancedProfile);
          
          setProfile(prev => ({
            ...prev!,
            deadlySinWarning,
          }));
        } catch (error) {
          // Fallback to static warning
          const staticWarning = StaticDataService.getStaticDeadlySinWarning(
            enhancedProfile.lifePathNumber,
            fullName
          );
          setProfile(prev => ({
            ...prev!,
            deadlySinWarning: staticWarning,
          }));
        } finally {
          setAiLoadingStates(prev => ({ ...prev, deadlySinWarning: false }));
        }
      }, 1000);

    } catch (error) {
      console.error("Error generating numerology:", error);
      Alert.alert("Error", "Failed to generate numerology reading. Please try again.");
      setLoading(false);
      setProkeralaLoading(false);
    }
  };

  const renderShimmerLine = (width = "100%") => (
    <Animated.View
      style={[
        styles.shimmerLine,
        { width },
        {
          opacity: shimmerAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 0.8],
          }),
        },
      ]}
    />
  );

  const renderNumerologyCard = (title: string, number: number, description: string) => (
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
        <LinearGradient
          colors={["#1a1a2e", "#16213e", "#0f3460"]}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <Animated.View style={styles.loadingHeart}>
              <Ionicons name="calculator" size={48} color="#FF6B9D" />
            </Animated.View>
            <Text style={styles.loadingText}>Calculating your cosmic numbers...</Text>
            <Text style={styles.loadingSubtext}>Unlocking the secrets of your numerology</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={["#1a1a2e", "#16213e", "#0f3460"]}
          style={styles.gradient}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardContainer}
          >
            <ScrollView contentContainerStyle={styles.inputContainer}>
              <View style={styles.headerContainer}>
                <Ionicons name="calculator" size={64} color="#FF6B9D" />
                <Text style={styles.title}>Numerology Reading</Text>
                <Text style={styles.subtitle}>
                  Discover the hidden meanings in your numbers
                </Text>
              </View>

              <GlassCard style={styles.inputCard}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <ShadcnInput
                  placeholder="Enter your full name"
                  value={userName}
                  onChangeText={setUserName}
                  style={styles.input}
                />

                <Text style={styles.inputLabel}>Birth Date</Text>
                <DatePicker
                  value={birthDate}
                  onChange={setBirthDate}
                  placeholder="Select your birth date"
                />

                <ShadcnButton
                  variant="primary"
                  size="lg"
                  onPress={() => handleGenerate()}
                  style={styles.generateButton}
                >
                  Generate My Reading
                </ShadcnButton>
              </GlassCard>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
        <AlertComponent />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#1a1a2e", "#16213e", "#0f3460"]}
        style={styles.gradient}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setProfile(null)}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Your Numerology</Text>
          </View>

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
              <Ionicons name="person" size={20} color="#FF6B9D" /> Character Analysis
            </Text>
            <GlassCard style={styles.analysisCard}>
              {aiLoadingStates.characterAnalysis ? (
                <View style={styles.shimmerContainer}>
                  <Text style={styles.loadingTitle}>🤖 AI is analyzing your character...</Text>
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
              <Ionicons name="warning" size={20} color="#FF4444" /> Deadly Sin Warning
            </Text>
            <GlassCard style={[styles.warningCard, { borderColor: "#FF4444" }]}>
              {aiLoadingStates.deadlySinWarning ? (
                <View style={styles.shimmerContainer}>
                  <Text style={styles.loadingTitle}>⚠️ Generating your warning...</Text>
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
                    {profile.deadlySinWarning || "Your warning is being prepared..."}
                  </Text>
                </>
              )}
            </GlassCard>
          </View>

          {/* ProKerala Insights */}
          {profile.prokeralaInsights && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="star" size={20} color="#FFD700" /> Professional Insights
              </Text>
              
              {profile.prokeralaInsights.strengths.length > 0 && (
                <GlassCard style={styles.insightCard}>
                  <Text style={styles.insightTitle}>✨ Your Strengths</Text>
                  {profile.prokeralaInsights.strengths.map((strength, index) => (
                    <Text key={index} style={styles.insightText}>• {strength}</Text>
                  ))}
                </GlassCard>
              )}

              {profile.prokeralaInsights.challenges.length > 0 && (
                <GlassCard style={styles.insightCard}>
                  <Text style={styles.insightTitle}>🔮 Your Challenges</Text>
                  {profile.prokeralaInsights.challenges.map((challenge, index) => (
                    <Text key={index} style={styles.insightText}>• {challenge}</Text>
                  ))}
                </GlassCard>
              )}

              {profile.prokeralaInsights.career && (
                <GlassCard style={styles.insightCard}>
                  <Text style={styles.insightTitle}>💼 Career Guidance</Text>
                  <Text style={styles.insightText}>{profile.prokeralaInsights.career}</Text>
                </GlassCard>
              )}

              {profile.prokeralaInsights.relationship && (
                <GlassCard style={styles.insightCard}>
                  <Text style={styles.insightTitle}>💕 Relationship Guidance</Text>
                  <Text style={styles.insightText}>{profile.prokeralaInsights.relationship}</Text>
                </GlassCard>
              )}

              {profile.prokeralaInsights.luckyNumbers.length > 0 && (
                <GlassCard style={styles.insightCard}>
                  <Text style={styles.insightTitle}>🍀 Lucky Numbers</Text>
                  <View style={styles.luckyNumbersContainer}>
                    {profile.prokeralaInsights.luckyNumbers.map((number, index) => (
                      <Badge key={index} variant="primary" style={styles.luckyNumber}>
                        {number}
                      </Badge>
                    ))}
                  </View>
                </GlassCard>
              )}

              {profile.prokeralaInsights.luckyColors.length > 0 && (
                <GlassCard style={styles.insightCard}>
                  <Text style={styles.insightTitle}>🎨 Lucky Colors</Text>
                  <View style={styles.luckyColorsContainer}>
                    {profile.prokeralaInsights.luckyColors.map((color, index) => (
                      <Badge key={index} variant="secondary" style={styles.luckyColor}>
                        {color}
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
              <Ionicons name="telescope" size={20} color="#34C759" /> Your Predictions
            </Text>
            {profile.predictions.map((prediction, index) => (
              <GlassCard key={index} style={styles.predictionCard}>
                <Text style={styles.predictionText}>{prediction}</Text>
              </GlassCard>
            ))}
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </LinearGradient>
      <AlertComponent />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  gradient: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingHeart: {
    marginBottom: 20,
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  loadingSubtext: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    textAlign: "center",
  },
  inputContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 16,
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
  },
  inputCard: {
    padding: 24,
  },
  inputLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    marginBottom: 16,
  },
  generateButton: {
    marginTop: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  numberCard: {
    padding: 20,
    marginBottom: 12,
  },
  numberHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  numberTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  numberBadge: {
    backgroundColor: "#FF6B9D",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  numberValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  numberDescription: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    lineHeight: 20,
  },
  analysisCard: {
    padding: 20,
  },
  warningCard: {
    padding: 20,
    borderWidth: 2,
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  warningTitle: {
    color: "#FF4444",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  warningText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 16,
    lineHeight: 24,
  },
  insightCard: {
    padding: 20,
    marginBottom: 12,
  },
  insightTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  insightText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
  luckyNumbersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  luckyNumber: {
    minWidth: 40,
  },
  luckyColorsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  luckyColor: {
    minWidth: 60,
  },
  predictionCard: {
    padding: 16,
    marginBottom: 8,
  },
  predictionText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 15,
    lineHeight: 22,
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
  loadingTitle: {
    color: "#FF6B9D",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  bottomPadding: {
    height: 40,
  },
  analysisText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 16,
    lineHeight: 24,
  },
  readMoreText: {
    color: "#FF6B9D",
    fontSize: 14,
    fontWeight: "600",
  },
});