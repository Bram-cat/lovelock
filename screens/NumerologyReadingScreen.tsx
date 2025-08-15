import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";

import ThemedText from "../components/ThemedText";
import GeminiAIService from "../services/GeminiAIService";

interface NumerologyReadingScreenProps {
  profile: any;
  lifePathInfo: any;
  predictions: any[];
  characterAnalysis: string;
  onBack: () => void;
}

export default function NumerologyReadingScreen({
  profile,
  lifePathInfo,
  predictions,
  characterAnalysis,
  onBack,
}: NumerologyReadingScreenProps) {
  const [question, setQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAiSection, setShowAiSection] = useState(false);

  const handleAskQuestion = async () => {
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await GeminiAIService.answerNumerologyQuestion(
        profile,
        question
      );
      setAiResponse(response);
      setShowAiSection(true);
    } catch (error) {
      console.error("Error getting AI response:", error);
      setAiResponse(
        "I apologize, but I am unable to provide a response at this moment. Please try again later."
      );
      setShowAiSection(true);
    } finally {
      setIsLoading(false);
    }
  };
  const getCategoryColors = (category: string): [string, string] => {
    const colorMap: { [key: string]: [string, string] } = {
      "Love & Relationships": ["#ff6b9d", "#e85a8a"],
      "Career & Success": ["#4ecdc4", "#44a08d"],
      "Health & Wellness": ["#96e6a1", "#7dd87f"],
      "Spiritual Growth": ["#a8e6cf", "#88d8a3"],
      "Financial Abundance": ["#ffd93d", "#ffcd3c"],
      "Personal Year Insights": ["#667eea", "#764ba2"],
      "Relationship Compatibility": ["#f093fb", "#f5576c"],
    };
    return colorMap[category] || ["#f47ca3", "#e85a8a"];
  };

  const getCategoryIcon = (category: string): any => {
    const iconMap: { [key: string]: any } = {
      "Love & Relationships": "heart",
      "Career & Success": "briefcase",
      "Health & Wellness": "fitness",
      "Spiritual Growth": "leaf",
      "Financial Abundance": "cash",
      "Personal Year Insights": "calendar",
      "Relationship Compatibility": "people",
    };
    return iconMap[category] || "star";
  };

  const getPredictionData = (prediction: any, index: number) => {
    if (typeof prediction === "object" && prediction.category) {
      return {
        category: prediction.category,
        icon: prediction.icon || getCategoryIcon(prediction.category),
        predictions: Array.isArray(prediction.predictions)
          ? prediction.predictions
          : [prediction.predictions || "No prediction available"],
        timeframe: prediction.timeframe || "Soon",
      };
    }

    const categories = [
      "Love & Relationships",
      "Career & Success",
      "Health & Wellness",
      "Spiritual Growth",
      "Financial Abundance",
    ];
    const predictionText =
      typeof prediction === "string" ? prediction : "No prediction available";

    let category = categories[index % categories.length];
    if (
      predictionText.toLowerCase().includes("love") ||
      predictionText.toLowerCase().includes("relationship")
    ) {
      category = "Love & Relationships";
    } else if (
      predictionText.toLowerCase().includes("career") ||
      predictionText.toLowerCase().includes("work")
    ) {
      category = "Career & Success";
    } else if (
      predictionText.toLowerCase().includes("health") ||
      predictionText.toLowerCase().includes("wellness")
    ) {
      category = "Health & Wellness";
    } else if (
      predictionText.toLowerCase().includes("spiritual") ||
      predictionText.toLowerCase().includes("soul")
    ) {
      category = "Spiritual Growth";
    } else if (
      predictionText.toLowerCase().includes("money") ||
      predictionText.toLowerCase().includes("financial")
    ) {
      category = "Financial Abundance";
    }

    return {
      category,
      icon: getCategoryIcon(category),
      predictions: [predictionText],
      timeframe: "Soon",
    };
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />

      {/* Header */}
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <ThemedText style={styles.headerTitle}>
            Your Cosmic Blueprint
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Discover your numerological insights
          </ThemedText>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Life Path Overview */}
        <View style={styles.cardContainer}>
          <LinearGradient
            colors={["#f093fb", "#f5576c"]}
            style={styles.cardHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="star" size={24} color="white" />
            </View>
            <View style={styles.cardHeaderText}>
              <ThemedText style={styles.cardTitle}>
                Life Path {profile?.lifePathNumber}
              </ThemedText>
              <ThemedText style={styles.cardSubtitle}>
                Your Soul&apos;s Journey
              </ThemedText>
            </View>
          </LinearGradient>
          <View style={styles.cardContent}>
            <ThemedText style={styles.cardDescription}>
              {lifePathInfo?.description || 
                "Your unique path is being revealed..."}
            </ThemedText>
          </View>
        </View>

        {/* Core Numbers */}
        <View style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.sectionTitle}>
              Your Core Numbers
            </ThemedText>
          </View>
          <View style={styles.numbersGrid}>
            {/* Destiny Number */}
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              style={styles.numberCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons
                name="compass"
                size={20}
                color="white"
                style={styles.numberIcon}
              />
              <ThemedText style={styles.numberValue}>
                {profile?.destinyNumber || "?"}
              </ThemedText>
              <ThemedText style={styles.numberLabel}>Destiny</ThemedText>
            </LinearGradient>

            {/* Soul Urge Number */}
            <LinearGradient
              colors={["#ff6b9d", "#e85a8a"]}
              style={styles.numberCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons
                name="heart"
                size={20}
                color="white"
                style={styles.numberIcon}
              />
              <ThemedText style={styles.numberValue}>
                {profile?.soulUrgeNumber || "?"}
              </ThemedText>
              <ThemedText style={styles.numberLabel}>Soul Urge</ThemedText>
            </LinearGradient>

            {/* Personality Number */}
            <LinearGradient
              colors={["#4ecdc4", "#44a08d"]}
              style={styles.numberCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons
                name="person"
                size={20}
                color="white"
                style={styles.numberIcon}
              />
              <ThemedText style={styles.numberValue}>
                {profile?.personalityNumber || "?"}
              </ThemedText>
              <ThemedText style={styles.numberLabel}>Personality</ThemedText>
            </LinearGradient>

            {/* Expression Number */}
            <LinearGradient
              colors={["#96e6a1", "#7dd87f"]}
              style={styles.numberCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons
                name="sparkles"
                size={20}
                color="white"
                style={styles.numberIcon}
              />
              <ThemedText style={styles.numberValue}>
                {profile?.expressionNumber || "?"}
              </ThemedText>
              <ThemedText style={styles.numberLabel}>Expression</ThemedText>
            </LinearGradient>
          </View>
        </View>

        {/* Predictions */}
        {predictions && predictions.length > 0 && (
          <View style={styles.cardContainer}>
            <View style={styles.cardHeader}>
              <ThemedText style={styles.sectionTitle}>
                Your Cosmic Insights
              </ThemedText>
            </View>
            {predictions.map((prediction, index) => {
              const predictionData = getPredictionData(prediction, index);
              const [startColor, endColor] = getCategoryColors(
                predictionData.category
              );

              return (
                <View key={index} style={styles.predictionCard}>
                  <LinearGradient
                    colors={[startColor, endColor]}
                    style={styles.predictionHeader}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Ionicons
                      name={predictionData.icon}
                      size={20}
                      color="white"
                      style={styles.predictionIcon}
                    />
                    <ThemedText style={styles.predictionCategory}>
                      {predictionData.category}
                    </ThemedText>
                    <ThemedText style={styles.predictionTimeframe}>
                      {predictionData.timeframe}
                    </ThemedText>
                  </LinearGradient>
                  <View style={styles.predictionContent}>
                    {predictionData.predictions.map(
                      (pred: string, predIndex: number) => (
                        <ThemedText
                          key={predIndex}
                          style={styles.predictionText}
                        >
                          {pred}
                        </ThemedText>
                      )
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Character Analysis */}
        {characterAnalysis && (
          <View style={styles.cardContainer}>
            <LinearGradient
              colors={["#a8e6cf", "#88d8a3"]}
              style={styles.cardHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="leaf" size={24} color="white" />
              </View>
              <View style={styles.cardHeaderText}>
                <ThemedText style={styles.cardTitle}>
                  Character Analysis
                </ThemedText>
                <ThemedText style={styles.cardSubtitle}>
                  Your Inner Nature
                </ThemedText>
              </View>
            </LinearGradient>
            <View style={styles.cardContent}>
              <ThemedText style={styles.cardDescription}>
                {characterAnalysis}
              </ThemedText>
            </View>
          </View>
        )}

        {/* AI Q&A Section */}
        <View style={styles.cardContainer}>
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            style={styles.cardHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="sparkles" size={24} color="white" />
            </View>
            <View style={styles.cardHeaderText}>
              <ThemedText style={styles.cardTitle}>
                Ask About Your Future
              </ThemedText>
              <ThemedText style={styles.cardSubtitle}>
                Get personalized insights
              </ThemedText>
            </View>
          </LinearGradient>

          <View style={styles.cardContent}>
            <View style={styles.questionInputContainer}>
              <TextInput
                style={styles.questionInput}
                placeholder="Ask about your love life, career, or future..."
                placeholderTextColor="#999"
                value={question}
                onChangeText={setQuestion}
                multiline
                maxLength={200}
              />
              <TouchableOpacity
                style={[
                  styles.askButton,
                  (!question.trim() || isLoading) && styles.askButtonDisabled,
                ]}
                onPress={handleAskQuestion}
                disabled={!question.trim() || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="send" size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>

            {showAiSection && aiResponse && (
              <View style={styles.aiResponseContainer}>
                <LinearGradient
                  colors={["#f093fb", "#f5576c"]}
                  style={styles.aiResponseHeader}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons
                    name="star"
                    size={16}
                    color="white"
                    style={styles.aiResponseIcon}
                  />
                  <ThemedText style={styles.aiResponseTitle}>
                    Cosmic Insight
                  </ThemedText>
                </LinearGradient>
                <View style={styles.aiResponseContent}>
                  <ThemedText style={styles.aiResponseText}>
                    {aiResponse}
                  </ThemedText>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9ff",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  titleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  cardContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  cardContent: {
    padding: 16,
  },
  cardDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  numbersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 12,
  },
  numberCard: {
    width: "47%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    minHeight: 100,
    justifyContent: "center",
  },
  numberIcon: {
    marginBottom: 8,
  },
  numberValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  numberLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  predictionCard: {
    backgroundColor: "#f8f9ff",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  predictionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  predictionIcon: {
    marginRight: 8,
  },
  predictionCategory: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  predictionTimeframe: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  predictionContent: {
    padding: 12,
  },
  predictionText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#555",
    marginBottom: 4,
  },
  bottomSpacing: {
    height: 40,
  },
  questionInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  questionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#f8f9ff",
    maxHeight: 100,
    marginRight: 12,
  },
  askButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  askButtonDisabled: {
    backgroundColor: "#ccc",
    shadowOpacity: 0,
    elevation: 0,
  },
  aiResponseContainer: {
    backgroundColor: "#f8f9ff",
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
  },
  aiResponseHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  aiResponseIcon: {
    marginRight: 8,
  },
  aiResponseTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  aiResponseContent: {
    padding: 16,
  },
  aiResponseText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#333",
  },
});
