import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// Colors import removed as it's not needed with hardcoded values
import DatePickerInput from "../components/DatePickerInput";
import ThemedText from "../components/ThemedText";
import NumerologyService, {
  NumerologyProfile,
  LifePathInfo,
} from "../services/NumerologyService";

export default function NumerologyScreen() {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [question, setQuestion] = useState("");
  const [profile, setProfile] = useState<NumerologyProfile | null>(null);
  const [lifePathInfo, setLifePathInfo] = useState<LifePathInfo | null>(null);
  const [predictions, setPredictions] = useState<string[]>([]);
  const [aiAnswer, setAiAnswer] = useState("");
  const [activeTab, setActiveTab] = useState<"profile" | "predictions" | "ask">(
    "profile"
  );
  const [loading, setLoading] = useState(false);

  // Generate comprehensive numerology profile
  const handleGenerateProfile = async () => {
    if (!name.trim() || !birthDate.trim()) {
      Alert.alert("Error", "Please enter both name and birth date.");
      return;
    }

    setLoading(true);
    try {
      const userProfile = NumerologyService.generateProfile(
        name.trim(),
        birthDate
      );
      const lifePathData = NumerologyService.getLifePathInfo(
        userProfile.lifePathNumber
      );
      const userPredictions =
        NumerologyService.generatePredictions(userProfile);

      setProfile(userProfile);
      setLifePathInfo(lifePathData);
      setPredictions(userPredictions);
      setActiveTab("profile");
    } catch {
      Alert.alert(
        "Error",
        "Failed to generate numerology profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Ask AI a question
  const handleAskQuestion = async () => {
    if (!profile) {
      Alert.alert("Error", "Please generate your numerology profile first.");
      return;
    }

    if (!question.trim()) {
      Alert.alert("Error", "Please enter a question.");
      return;
    }

    setLoading(true);
    try {
      // Generate a simple AI-like response based on the profile and question
      const answer = `Based on your numerology profile (Life Path ${profile.lifePathNumber}), here's insight about "${question.trim()}": ${profile.characterAnalysis.substring(0, 200)}...`;
      setAiAnswer(answer);
    } catch {
      Alert.alert("Error", "Failed to get answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Reset all data
  const handleReset = () => {
    setName("");
    setBirthDate("");
    setQuestion("");
    setProfile(null);
    setLifePathInfo(null);
    setPredictions([]);
    setAiAnswer("");
    setActiveTab("profile");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <LinearGradient colors={["#d14fa7", "#f5c6ec"]} style={styles.header}>
            <ThemedText style={styles.title}>AI Numerology Oracle</ThemedText>
            <ThemedText style={styles.subtitle}>
              Discover your destiny through ancient wisdom
            </ThemedText>
            {profile && (
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleReset}
              >
                <Ionicons name="refresh" size={20} color="white" />
                <Text style={styles.resetText}>New Reading</Text>
              </TouchableOpacity>
            )}
          </LinearGradient>

          <View style={styles.content}>
            {!profile ? (
              // Input Section
              <View style={styles.inputSection}>
                <ThemedText style={styles.sectionTitle}>
                  Personal Information
                </ThemedText>

                <View style={styles.inputGroup}>
                  <ThemedText style={styles.label}>Full Name</ThemedText>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your full name"
                    placeholderTextColor="#999"
                  />
                </View>

                <DatePickerInput
                  value={birthDate}
                  onDateChange={setBirthDate}
                  placeholder="Select your birth date"
                  label="Birth Date"
                />

                <TouchableOpacity
                  style={[
                    styles.generateButton,
                    loading && styles.disabledButton,
                  ]}
                  onPress={handleGenerateProfile}
                  disabled={loading}
                >
                  {loading ? (
                    <Text style={styles.generateButtonText}>Generating...</Text>
                  ) : (
                    <>
                      <Ionicons
                        name="sparkles"
                        size={20}
                        color="white"
                        style={styles.buttonIcon}
                      />
                      <Text style={styles.generateButtonText}>
                        Generate AI Reading
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              // Results Section
              <>
                {/* Tab Navigation */}
                <View style={styles.tabContainer}>
                  <TouchableOpacity
                    style={[
                      styles.tab,
                      activeTab === "profile" && styles.activeTab,
                    ]}
                    onPress={() => setActiveTab("profile")}
                  >
                    <Ionicons
                      name="person"
                      size={18}
                      color={activeTab === "profile" ? "#d14fa7" : "#666"}
                    />
                    <Text
                      style={[
                        styles.tabText,
                        activeTab === "profile" && styles.activeTabText,
                      ]}
                    >
                      Profile
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.tab,
                      activeTab === "predictions" && styles.activeTab,
                    ]}
                    onPress={() => setActiveTab("predictions")}
                  >
                    <Ionicons
                      name="telescope"
                      size={18}
                      color={activeTab === "predictions" ? "#d14fa7" : "#666"}
                    />
                    <Text
                      style={[
                        styles.tabText,
                        activeTab === "predictions" && styles.activeTabText,
                      ]}
                    >
                      Predictions
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.tab,
                      activeTab === "ask" && styles.activeTab,
                    ]}
                    onPress={() => setActiveTab("ask")}
                  >
                    <Ionicons
                      name="chatbubbles"
                      size={18}
                      color={activeTab === "ask" ? "#d14fa7" : "#666"}
                    />
                    <Text
                      style={[
                        styles.tabText,
                        activeTab === "ask" && styles.activeTabText,
                      ]}
                    >
                      Ask AI
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Tab Content */}
                {activeTab === "profile" && (
                  <View style={styles.profileSection}>
                    <LinearGradient
                      colors={["#a259d9", "#d14fa7"]}
                      style={styles.profileCard}
                    >
                      <ThemedText style={styles.profileName}>{name}</ThemedText>
                      <ThemedText style={styles.birthDate}>
                        Born: {birthDate}
                      </ThemedText>

                      <View style={styles.numbersGrid}>
                        <View style={styles.numberItem}>
                          <Text style={styles.numberValue}>
                            {profile.lifePathNumber}
                          </Text>
                          <Text style={styles.numberLabel}>Life Path</Text>
                        </View>
                        <View style={styles.numberItem}>
                          <Text style={styles.numberValue}>
                            {profile.destinyNumber}
                          </Text>
                          <Text style={styles.numberLabel}>Destiny</Text>
                        </View>
                        <View style={styles.numberItem}>
                          <Text style={styles.numberValue}>
                            {profile.soulUrgeNumber}
                          </Text>
                          <Text style={styles.numberLabel}>Soul Urge</Text>
                        </View>
                        <View style={styles.numberItem}>
                          <Text style={styles.numberValue}>
                            {profile.personalityNumber}
                          </Text>
                          <Text style={styles.numberLabel}>Personality</Text>
                        </View>
                      </View>
                    </LinearGradient>

                    {lifePathInfo && (
                      <View style={styles.detailsCard}>
                        <ThemedText style={styles.detailsTitle}>
                          {lifePathInfo.title}
                        </ThemedText>
                        <ThemedText style={styles.detailsDescription}>
                          {lifePathInfo.description}
                        </ThemedText>

                        <View style={styles.traitsSection}>
                          <ThemedText style={styles.traitsTitle}>
                            Your Strengths
                          </ThemedText>
                          {lifePathInfo.strengths
                            .slice(0, 3)
                            .map((strength, index) => (
                              <Text key={index} style={styles.traitItem}>
                                • {strength}
                              </Text>
                            ))}
                        </View>

                        <View style={styles.traitsSection}>
                          <ThemedText style={styles.traitsTitle}>
                            Love Compatibility
                          </ThemedText>
                          <Text style={styles.compatibilityText}>
                            {lifePathInfo.loveCompatibility.join(", ")}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {activeTab === "predictions" && (
                  <View style={styles.predictionsSection}>
                    <ThemedText style={styles.sectionTitle}>
                      Your AI Predictions
                    </ThemedText>
                    {predictions.map((prediction, index) => (
                      <View key={index} style={styles.predictionCard}>
                        <Ionicons
                          name="star"
                          size={16}
                          color="#d14fa7"
                          style={styles.predictionIcon}
                        />
                        <Text style={styles.predictionText}>{prediction}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {activeTab === "ask" && (
                  <View style={styles.askSection}>
                    <ThemedText style={styles.sectionTitle}>
                      Ask the AI Oracle
                    </ThemedText>
                    <Text style={styles.askDescription}>
                      Ask me anything about your future, relationships, career,
                      or spiritual path.
                    </Text>

                    <View style={styles.questionGroup}>
                      <TextInput
                        style={styles.questionInput}
                        value={question}
                        onChangeText={setQuestion}
                        placeholder="What would you like to know about your future?"
                        placeholderTextColor="#999"
                        multiline
                        numberOfLines={3}
                      />

                      <TouchableOpacity
                        style={[
                          styles.askButton,
                          loading && styles.disabledButton,
                        ]}
                        onPress={handleAskQuestion}
                        disabled={loading}
                      >
                        {loading ? (
                          <Text style={styles.askButtonText}>
                            Consulting Oracle...
                          </Text>
                        ) : (
                          <>
                            <Ionicons
                              name="send"
                              size={16}
                              color="white"
                              style={styles.buttonIcon}
                            />
                            <Text style={styles.askButtonText}>Ask Oracle</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>

                    {aiAnswer && (
                      <View style={styles.answerCard}>
                        <View style={styles.answerHeader}>
                          <Ionicons name="sparkles" size={20} color="#d14fa7" />
                          <Text style={styles.answerTitle}>
                            Oracle's Answer
                          </Text>
                        </View>
                        <Text style={styles.answerText}>{aiAnswer}</Text>
                      </View>
                    )}
                  </View>
                )}
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5c6ec",
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    padding: 30,
    alignItems: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    position: "relative",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  resetButton: {
    position: "absolute",
    top: 40,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  resetText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  content: {
    padding: 20,
  },
  inputSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  generateButton: {
    backgroundColor: "#d14fa7",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonIcon: {
    marginRight: 8,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 4,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: "#f5c6ec",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginLeft: 4,
  },
  activeTabText: {
    color: "#d14fa7",
  },
  profileSection: {
    marginBottom: 20,
  },
  profileCard: {
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  birthDate: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 20,
  },
  numbersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },
  numberItem: {
    alignItems: "center",
    width: "48%",
    marginBottom: 15,
  },
  numberValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  numberLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  detailsCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  detailsTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#d14fa7",
    marginBottom: 10,
    textAlign: "center",
  },
  detailsDescription: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 20,
  },
  traitsSection: {
    marginBottom: 15,
  },
  traitsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#d14fa7",
    marginBottom: 8,
  },
  traitItem: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
    paddingLeft: 10,
  },
  compatibilityText: {
    fontSize: 14,
    color: "#555",
    fontStyle: "italic",
  },
  predictionsSection: {
    marginBottom: 20,
  },
  predictionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  predictionIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  predictionText: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
  askSection: {
    marginBottom: 20,
  },
  askDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  questionGroup: {
    marginBottom: 20,
  },
  questionInput: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    textAlignVertical: "top",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  askButton: {
    backgroundColor: "#d14fa7",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    alignSelf: "center",
  },
  askButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  answerCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  answerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  answerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#d14fa7",
    marginLeft: 8,
  },
  answerText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
});
