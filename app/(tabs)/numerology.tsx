import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DatePickerInput from "../../components/DatePickerInput";
import ThemedText from "../../components/ThemedText";
import { useTheme } from "../../contexts/ThemeContext";
import { Colors } from "../../constants/Colors";
import NumerologyReadingScreen from "../../screens/NumerologyReadingScreen";
import NumerologyService, {
  LifePathInfo,
  NumerologyProfile,
} from "../../services/NumerologyService";

// Removed question limits - all features are now free!

export default function NumerologyScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [profile, setProfile] = useState<NumerologyProfile | null>(null);
  const [lifePathInfo, setLifePathInfo] = useState<LifePathInfo | null>(null);
  const [predictions, setPredictions] = useState<string[]>([]);
  const [characterAnalysis, setCharacterAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReadingScreen, setShowReadingScreen] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);

  useEffect(() => {
    loadQuestionCount();
  }, []);

  const loadQuestionCount = async () => {
    try {
      const count = await AsyncStorage.getItem("numerology_question_count");
      setQuestionCount(count ? parseInt(count, 10) : 0);
    } catch (error) {
      console.error("Error loading question count:", error);
    }
  };

  const incrementQuestionCount = async () => {
    try {
      const newCount = questionCount + 1;
      await AsyncStorage.setItem("numerology_question_count", newCount.toString());
      setQuestionCount(newCount);
    } catch (error) {
      console.error("Error incrementing question count:", error);
    }
  };

  // Removed question limit check - unlimited questions for everyone!
  const checkQuestionLimit = () => {
    return true; // Always allow questions
  };

  const handleGenerateProfile = async () => {
    if (!name.trim() || !birthDate.trim()) {
      Alert.alert("Error", "Please enter both name and birth date.");
      return;
    }

    // Check question limit before proceeding
    if (!checkQuestionLimit()) {
      return;
    }

    setLoading(true);
    try {
      const generatedProfile = NumerologyService.generateProfile(
        name,
        birthDate
      );
      setProfile(generatedProfile);

      const lifePathData = NumerologyService.getLifePathInfo(
        generatedProfile.lifePathNumber
      );
      setLifePathInfo(lifePathData);

      const generatedPredictions =
        NumerologyService.generatePredictions(generatedProfile);
      setPredictions(generatedPredictions);

      const analysis = NumerologyService.generateCharacterAnalysis(
        generatedProfile.lifePathNumber,
        generatedProfile.destinyNumber,
        generatedProfile.soulUrgeNumber
      );
      setCharacterAnalysis(analysis);

      // Track question count for statistics
      await incrementQuestionCount();

      // Automatically show the reading screen
      setShowReadingScreen(true);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      Alert.alert(
        "Error",
        `Failed to generate numerology profile: ${errorMessage}. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  // Show reading screen if profile is generated
  if (showReadingScreen && profile) {
    return (
      <NumerologyReadingScreen
        profile={profile}
        lifePathInfo={lifePathInfo}
        predictions={predictions}
        characterAnalysis={characterAnalysis}
        onBack={() => setShowReadingScreen(false)}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={theme.gradient as [string, string, ...string[]]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Modern Header */}
            <View style={styles.headerContainer}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.push("/")}
              >
                <Ionicons name="arrow-back" size={24} color={theme.textOnPrimary} />
              </TouchableOpacity>

              <View style={styles.headerContent}>
                <View style={styles.titleContainer}>
                  <Ionicons
                    name="sparkles"
                    size={32}
                    color={theme.textOnPrimary}
                    style={styles.headerIcon}
                  />
                  <ThemedText type="onPrimary" style={styles.headerTitle}>Numerology</ThemedText>
                </View>
                <ThemedText type="onPrimary" style={styles.headerSubtitle}>
                  Unlock Your Cosmic Destiny
                </ThemedText>
              </View>
            </View>

            {/* Beautiful Card Container */}
            <View style={styles.cardContainer}>
              <LinearGradient
                colors={[
                  "rgba(255, 255, 255, 0.95)",
                  "rgba(255, 255, 255, 0.85)",
                ]}
                style={styles.card}
              >
                {/* Welcome Section */}
                <View style={styles.welcomeSection}>
                  <View style={styles.welcomeIconContainer}>
                    <LinearGradient
                      colors={["#667eea", "#764ba2"]}
                      style={styles.welcomeIconGradient}
                    >
                      <Ionicons name="star" size={24} color={theme.textOnPrimary} />
                    </LinearGradient>
                  </View>
                  <ThemedText type="title" style={styles.welcomeTitle}>
                    Discover Your Numbers
                  </ThemedText>
                  <ThemedText type="secondary" style={styles.welcomeText}>
                    Enter your details to reveal your cosmic blueprint and life
                    path
                  </ThemedText>
                </View>

                {/* Input Fields */}
                <View style={styles.inputSection}>
                  {/* Name Input */}
                  <View style={styles.inputGroup}>
                    <View style={styles.inputLabelContainer}>
                      <Ionicons
                        name="person-outline"
                        size={20}
                        color="#667eea"
                      />
                      <ThemedText type="secondary" style={styles.inputLabel}>
                        Your Full Name
                      </ThemedText>
                    </View>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Enter your complete name"
                        placeholderTextColor="rgba(102, 126, 234, 0.5)"
                        value={name}
                        onChangeText={setName}
                      />
                    </View>
                  </View>

                  {/* Birthday Input */}
                  <View style={styles.inputGroup}>
                    <View style={styles.inputLabelContainer}>
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color="#667eea"
                      />
                      <ThemedText type="secondary" style={styles.inputLabel}>
                        Your Birth Date
                      </ThemedText>
                    </View>
                    <View style={styles.datePickerContainer}>
                      <DatePickerInput
                        value={birthDate}
                        onDateChange={setBirthDate}
                        placeholder="Select your birth date"
                      />
                    </View>
                  </View>
                </View>

                {/* Generate Button */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[
                      styles.generateButton,
                      (!name || !birthDate) && styles.generateButtonDisabled,
                    ]}
                    onPress={handleGenerateProfile}
                    disabled={!name || !birthDate || loading}
                  >
                    <LinearGradient
                      colors={
                        !name || !birthDate
                          ? ["#ccc", "#999"]
                          : ["#667eea", "#764ba2"]
                      }
                      style={styles.generateButtonGradient}
                    >
                      <View style={styles.buttonContent}>
                        {loading ? (
                          <>
                            <ActivityIndicator
                              size="small"
                              color="#fff"
                              style={styles.buttonIcon}
                            />
                            <ThemedText type="onPrimary" style={styles.generateButtonText}>
                              Generating...
                            </ThemedText>
                          </>
                        ) : (
                          <>
                            <Ionicons
                              name="flash"
                              size={20}
                              color="#fff"
                              style={styles.buttonIcon}
                            />
                            <ThemedText type="onPrimary" style={styles.generateButtonText}>
                              Generate My Reading
                            </ThemedText>
                          </>
                        )}
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>

            {/* Decorative Elements */}
            <View style={styles.decorativeContainer}>
              <View style={styles.decorativeCircle1} />
              <View style={styles.decorativeCircle2} />
              <View style={styles.decorativeCircle3} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#667eea",
  },
  gradient: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  // Modern Header Styles
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 20,
    top: 60,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    alignItems: "center",
    marginTop: 20,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  headerIcon: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    fontStyle: "italic",
  },
  // Card Container Styles
  cardContainer: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  card: {
    borderRadius: 25,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  // Welcome Section Styles
  welcomeSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  welcomeIconContainer: {
    marginBottom: 15,
  },
  welcomeIconGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2d1b69",
    textAlign: "center",
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  // Input Section Styles
  inputSection: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 25,
  },
  inputLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 5,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#667eea",
    marginLeft: 8,
  },
  inputWrapper: {
    backgroundColor: "rgba(102, 126, 234, 0.05)",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "rgba(102, 126, 234, 0.2)",
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  textInput: {
    fontSize: 16,
    color: "#2d1b69",
    paddingVertical: 15,
    fontWeight: "500",
  },
  datePickerContainer: {
    backgroundColor: "rgba(102, 126, 234, 0.05)",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "rgba(102, 126, 234, 0.2)",
    overflow: "hidden",
  },
  // Button Styles
  buttonContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  generateButton: {
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#667eea",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 12,
    minWidth: 250,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    marginRight: 10,
  },
  generateButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  // Decorative Elements
  decorativeContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  decorativeCircle1: {
    position: "absolute",
    top: 100,
    right: -50,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  decorativeCircle2: {
    position: "absolute",
    bottom: 200,
    left: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  decorativeCircle3: {
    position: "absolute",
    top: 300,
    left: 50,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
});
