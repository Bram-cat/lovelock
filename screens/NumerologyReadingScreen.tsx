import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  ActivityIndicator,
  Text,
  Dimensions,
} from "react-native";
import SimpleAIService from "../services/SimpleAIService";

const { width } = Dimensions.get('window');

interface NumerologyReadingScreenProps {
  profile: any;
  lifePathInfo: any;
  predictions: any[];
  characterAnalysis: string;
  onBack: () => void;
  birthDate?: string;
  name?: string;
  userId?: string;
}

export default function NumerologyReadingScreen({
  profile,
  lifePathInfo,
  predictions,
  characterAnalysis,
  onBack,
  birthDate,
  name,
  userId,
}: NumerologyReadingScreenProps) {
  const [question, setQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAiResponse, setShowAiResponse] = useState(false);

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    setShowAiResponse(true);

    try {
      const result = await SimpleAIService.answerNumerologyQuestion(profile, question);
      setAiResponse(result.content);
    } catch (error) {
      setAiResponse("I'm having trouble connecting to the cosmos right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text style={styles.backText}>Numbers</Text>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={() => {
            // Scroll to AI Assistant section
            console.log("Navigate to AI Chat");
          }}>
            <Ionicons name="sparkles" size={20} color="#E91E63" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={onBack}>
            <Ionicons name="refresh" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Text style={styles.profileTitle}>Your Numerology Profile</Text>
          <Text style={styles.profileSubtitle}>{name} • Born {birthDate}</Text>
        </View>

        {/* Enhanced Reading Button */}
        <TouchableOpacity
          style={styles.enhancedButton}
          onPress={() => {
            // Auto-scroll to AI Assistant section would go here
            console.log("Scrolling to AI Assistant");
          }}
        >
          <Ionicons name="sparkles" size={20} color="white" />
          <Text style={styles.enhancedButtonText}>View Enhanced Reading with AI Chat</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>

        {/* Core Numbers Section */}
        <Text style={styles.sectionTitle}>Core Numbers</Text>

        {/* Bento Grid Layout */}
        <View style={styles.bentoGrid}>
          {/* Life Path Card - Large */}
          <View style={[styles.bentoCard, styles.bentoCardLarge, styles.lifePathCard]}>
            <View style={styles.bentoCardHeader}>
              <Text style={styles.bentoNumber}>{profile.lifePathNumber}</Text>
              <View style={styles.bentoIcon}>
                <Text style={styles.bentoIconText}>🌟</Text>
              </View>
            </View>
            <Text style={styles.bentoTitle}>Life Path</Text>
            <Text style={styles.bentoDescription}>
              Your life's purpose and the path you're meant to walk
            </Text>
          </View>

          <View style={styles.bentoRow}>
            {/* Destiny Card - Medium */}
            <View style={[styles.bentoCard, styles.bentoCardMedium, styles.destinyCard]}>
              <View style={styles.bentoCardHeader}>
                <Text style={styles.bentoNumber}>{profile.destinyNumber}</Text>
                <View style={styles.bentoIcon}>
                  <Text style={styles.bentoIconText}>🎯</Text>
                </View>
              </View>
              <Text style={styles.bentoTitle}>Destiny</Text>
              <Text style={styles.bentoDescriptionSmall}>
                What you're destined to achieve
              </Text>
            </View>

            {/* Soul Urge Card - Medium */}
            <View style={[styles.bentoCard, styles.bentoCardMedium, styles.soulUrgeCard]}>
              <View style={styles.bentoCardHeader}>
                <Text style={styles.bentoNumber}>{profile.soulUrgeNumber}</Text>
                <View style={styles.bentoIcon}>
                  <Text style={styles.bentoIconText}>💫</Text>
                </View>
              </View>
              <Text style={styles.bentoTitle}>Soul Urge</Text>
              <Text style={styles.bentoDescriptionSmall}>
                Your heart's deepest desires
              </Text>
            </View>
          </View>

          {/* Expression Number Card - If exists */}
          {profile.expressionNumber && (
            <View style={[styles.bentoCard, styles.bentoCardSmall, styles.expressionCard]}>
              <View style={styles.bentoCardHeader}>
                <Text style={styles.bentoNumber}>{profile.expressionNumber}</Text>
                <View style={styles.bentoIcon}>
                  <Text style={styles.bentoIconText}>🎭</Text>
                </View>
              </View>
              <Text style={styles.bentoTitle}>Expression</Text>
              <Text style={styles.bentoDescriptionSmall}>
                How you express yourself
              </Text>
            </View>
          )}
        </View>

        {/* Character Analysis Section */}
        <Text style={styles.sectionTitle}>Character Analysis</Text>
        <View style={styles.analysisCard}>
          <Text style={styles.analysisText}>{characterAnalysis}</Text>
        </View>

        {/* Roxy API Insights */}
        {profile.roxyInsights && (
          <>
            <Text style={styles.sectionTitle}>Professional Insights</Text>

            {/* Strengths */}
            {profile.roxyInsights.strengths && profile.roxyInsights.strengths.length > 0 && (
              <View style={[styles.bentoCard, styles.strengthsCard]}>
                <View style={styles.bentoCardHeader}>
                  <Text style={styles.bentoTitle}>✨ Your Strengths</Text>
                </View>
                {profile.roxyInsights.strengths.map((strength: string, index: number) => (
                  <Text key={index} style={styles.bentoDescription}>• {strength}</Text>
                ))}
              </View>
            )}

            {/* Challenges */}
            {profile.roxyInsights.challenges && profile.roxyInsights.challenges.length > 0 && (
              <View style={[styles.bentoCard, styles.challengesCard]}>
                <View style={styles.bentoCardHeader}>
                  <Text style={styles.bentoTitle}>🔮 Your Challenges</Text>
                </View>
                {profile.roxyInsights.challenges.map((challenge: string, index: number) => (
                  <Text key={index} style={styles.bentoDescription}>• {challenge}</Text>
                ))}
              </View>
            )}

            {/* Career Guidance */}
            {profile.roxyInsights.career && (
              <View style={[styles.bentoCard, styles.careerCard]}>
                <View style={styles.bentoCardHeader}>
                  <Text style={styles.bentoTitle}>💼 Career Guidance</Text>
                </View>
                <Text style={styles.bentoDescription}>{profile.roxyInsights.career}</Text>
              </View>
            )}

            {/* Relationship Guidance */}
            {profile.roxyInsights.relationship && (
              <View style={[styles.bentoCard, styles.relationshipCard]}>
                <View style={styles.bentoCardHeader}>
                  <Text style={styles.bentoTitle}>💕 Relationship Guidance</Text>
                </View>
                <Text style={styles.bentoDescription}>{profile.roxyInsights.relationship}</Text>
              </View>
            )}

            {/* Spiritual Guidance */}
            {profile.roxyInsights.spiritual && (
              <View style={[styles.bentoCard, styles.spiritualCard]}>
                <View style={styles.bentoCardHeader}>
                  <Text style={styles.bentoTitle}>🙏 Spiritual Guidance</Text>
                </View>
                <Text style={styles.bentoDescription}>{profile.roxyInsights.spiritual}</Text>
              </View>
            )}

            {/* Lucky Numbers */}
            {profile.roxyInsights.luckyNumbers && profile.roxyInsights.luckyNumbers.length > 0 && (
              <View style={styles.numberCard}>
                <View style={styles.numberCardInner}>
                  <View style={styles.numberLeft}>
                    <Text style={styles.numberLabel}>🍀 Lucky Numbers</Text>
                    <View style={styles.luckyNumbersContainer}>
                      {profile.roxyInsights.luckyNumbers.map((number: number, index: number) => (
                        <View key={index} style={styles.luckyNumberBadge}>
                          <Text style={styles.luckyNumberText}>{number}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Lucky Colors */}
            {profile.roxyInsights.luckyColors && profile.roxyInsights.luckyColors.length > 0 && (
              <View style={styles.numberCard}>
                <View style={styles.numberCardInner}>
                  <View style={styles.numberLeft}>
                    <Text style={styles.numberLabel}>🎨 Lucky Colors</Text>
                    <View style={styles.luckyColorsContainer}>
                      {profile.roxyInsights.luckyColors.map((color: string, index: number) => (
                        <View key={index} style={styles.luckyColorBadge}>
                          <Text style={styles.luckyColorText}>{color}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Personal Year */}
            {profile.roxyInsights.personalYear && (
              <View style={styles.numberCard}>
                <View style={styles.numberCardInner}>
                  <View style={styles.numberLeft}>
                    <Text style={styles.numberLabel}>📅 Personal Year</Text>
                    <Text style={styles.insightText}>You are currently in Personal Year {profile.roxyInsights.personalYear}</Text>
                  </View>
                  <View style={styles.numberBadge}>
                    <Text style={styles.numberValue}>{profile.roxyInsights.personalYear}</Text>
                  </View>
                </View>
              </View>
            )}
          </>
        )}

        {/* AI Assistant Section */}
        <Text style={styles.sectionTitle}>AI Numerology Assistant</Text>
        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <Ionicons name="chatbubble-ellipses" size={24} color="#E91E63" />
            <Text style={styles.aiHeaderText}>Ask Your Personal Oracle</Text>
          </View>

          <Text style={styles.aiSubtext}>
            Get instant cosmic guidance tailored to you
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="What would you like to know about your future?"
              placeholderTextColor="#666"
              value={question}
              onChangeText={setQuestion}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, (!question.trim() || isLoading) && styles.sendButtonDisabled]}
              onPress={handleAskQuestion}
              disabled={!question.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="send" size={18} color="white" />
              )}
            </TouchableOpacity>
          </View>

          {showAiResponse && aiResponse && (
            <View style={styles.responseContainer}>
              <View style={styles.responseHeader}>
                <Ionicons name="star" size={16} color="#E91E63" />
                <Text style={styles.responseTitle}>Cosmic Insight</Text>
              </View>
              <Text style={styles.responseText}>{aiResponse}</Text>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#000000",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1C1C1E",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  profileHeader: {
    marginTop: 20,
    marginBottom: 20,
  },
  profileTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  profileSubtitle: {
    fontSize: 14,
    color: "#999",
  },
  enhancedButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8B5CF6",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 8,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  enhancedButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
    marginTop: 8,
  },
  // Bento Grid Styles
  bentoGrid: {
    gap: 16,
    marginBottom: 24,
  },
  bentoRow: {
    flexDirection: "row",
    gap: 16,
  },
  bentoCard: {
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  bentoCardLarge: {
    width: "100%",
    minHeight: 160,
    marginBottom: 16,
  },
  bentoCardMedium: {
    flex: 1,
    minHeight: 140,
  },
  bentoCardSmall: {
    width: "100%",
    minHeight: 120,
    marginTop: 16,
  },
  bentoCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  bentoNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  bentoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(10px)",
  },
  bentoIconText: {
    fontSize: 24,
  },
  bentoTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bentoDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
  },
  bentoDescriptionSmall: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 16,
  },
  // Individual Card Colors
  lifePathCard: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    backgroundColor: "#667eea",
  },
  destinyCard: {
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    backgroundColor: "#f093fb",
  },
  soulUrgeCard: {
    background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    backgroundColor: "#4facfe",
  },
  expressionCard: {
    background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    backgroundColor: "#43e97b",
  },
  strengthsCard: {
    backgroundColor: "#10B981",
    marginBottom: 16,
  },
  challengesCard: {
    backgroundColor: "#F59E0B",
    marginBottom: 16,
  },
  careerCard: {
    backgroundColor: "#3B82F6",
    marginBottom: 16,
  },
  relationshipCard: {
    backgroundColor: "#EC4899",
    marginBottom: 16,
  },
  spiritualCard: {
    backgroundColor: "#8B5CF6",
    marginBottom: 16,
  },
  analysisCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(233, 30, 99, 0.2)",
  },
  analysisText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#E0E0E0",
  },
  aiCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(233, 30, 99, 0.2)",
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  aiHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  aiSubtext: {
    fontSize: 14,
    color: "#999",
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#2C2C2E",
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: "rgba(233, 30, 99, 0.3)",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "white",
    padding: 12,
    maxHeight: 100,
    minHeight: 48,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#E91E63",
    justifyContent: "center",
    alignItems: "center",
    margin: 4,
  },
  sendButtonDisabled: {
    backgroundColor: "#666",
    opacity: 0.5,
  },
  responseContainer: {
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "rgba(233, 30, 99, 0.2)",
  },
  responseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  responseTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E91E63",
  },
  responseText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#E0E0E0",
  },
  bottomSpacing: {
    height: 200,
    backgroundColor: "transparent",
  },
  insightText: {
    fontSize: 14,
    color: "#999",
    lineHeight: 20,
    marginBottom: 4,
  },
  luckyNumbersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  luckyNumberBadge: {
    backgroundColor: "#F59E0B",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 40,
    alignItems: "center",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  luckyNumberText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  luckyColorsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  luckyColorBadge: {
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#8B5CF6",
  },
  luckyColorText: {
    color: "#8B5CF6",
    fontSize: 14,
    fontWeight: "500",
  },
});