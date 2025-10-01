import { Ionicons } from "@expo/vector-icons";
import React, { useState, useRef } from "react";
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
  Share,
  Alert,
} from "react-native";
import SimpleAIService from "../services/SimpleAIService";

const { width } = Dimensions.get('window');

interface NumerologyReadingScreenProps {
  profile: any;
  lifePathInfo: any;
  predictions: any[];
  characterAnalysis: string;
  onBack: () => void;
  onShowAIChat?: () => void;
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
  onShowAIChat,
  birthDate,
  name,
  userId,
}: NumerologyReadingScreenProps) {
  const [question, setQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAiResponse, setShowAiResponse] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const aiSectionRef = useRef<View>(null);

  const scrollToAISection = () => {
    if (aiSectionRef.current && scrollViewRef.current) {
      aiSectionRef.current.measureLayout(
        scrollViewRef.current as any,
        (x, y) => {
          scrollViewRef.current?.scrollTo({ y: y - 100, animated: true });
        },
        () => {}
      );
    }
  };

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

  const handleShare = async () => {
    try {
      const shareMessage = `✨ My Numerology Reading ✨\n\n` +
        `🌟 Life Path ${profile.lifePathNumber}: ${lifePathInfo?.title || 'The Seeker'}\n\n` +
        `${characterAnalysis?.substring(0, 200)}...\n\n` +
        `Discover your cosmic blueprint with Lovelock! 💫`;

      await Share.share({
        message: shareMessage,
        title: "My Numerology Reading",
      });
    } catch (error) {
      Alert.alert("Error", "Unable to share at this time");
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
          <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
            <Ionicons name="share-social" size={20} color="#10B981" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={onShowAIChat}>
            <Ionicons name="sparkles" size={20} color="#8B5CF6" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={onBack}>
            <Ionicons name="refresh" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
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
          onPress={onShowAIChat}
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


            {/* Personal Year */}
            {profile.roxyInsights.personalYear && (
              <View style={[styles.bentoCard, styles.personalYearCard]}>
                <View style={styles.bentoCardHeader}>
                  <Text style={styles.bentoTitle}>📅 Personal Year {profile.roxyInsights.personalYear}</Text>
                  <View style={styles.personalYearBadge}>
                    <Text style={styles.personalYearBadgeText}>{profile.roxyInsights.personalYear}</Text>
                  </View>
                </View>
                <Text style={styles.bentoDescription}>
                  Your current Personal Year reveals the cosmic energy and themes that will influence your journey throughout 2025.
                  This number guides your opportunities, challenges, and spiritual growth for the year.
                </Text>
                <View style={styles.personalYearDetails}>
                  <Text style={styles.personalYearTheme}>✨ Year Theme: Transformation & Growth</Text>
                  <Text style={styles.personalYearEnergy}>🌟 Energy Level: High Creative Flow</Text>
                </View>
              </View>
            )}
          </>
        )}


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
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 8,
    letterSpacing: -0.7,
    lineHeight: 32,
  },
  profileSubtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#A1A1AA",
    letterSpacing: 0.2,
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
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 20,
    marginTop: 32,
    letterSpacing: -0.5,
    lineHeight: 28,
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
    fontSize: 36,
    fontWeight: "800",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.6)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: -1,
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
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 12,
    textShadowColor: "rgba(0, 0, 0, 0.6)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: -0.3,
    lineHeight: 26,
  },
  bentoDescription: {
    fontSize: 15,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.95)",
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  bentoDescriptionSmall: {
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 18,
    letterSpacing: 0.1,
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
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  analysisText: {
    fontSize: 17,
    lineHeight: 26,
    color: "#FFFFFF",
    fontWeight: "500",
    letterSpacing: 0.2,
    textAlign: "left",
  },
  aiCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  aiHeaderText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  aiSubtext: {
    fontSize: 15,
    fontWeight: "500",
    color: "#A1A1AA",
    marginBottom: 20,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#2C2C2E",
    borderRadius: 20,
    padding: 6,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.4)",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
    margin: 4,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: "#666",
    opacity: 0.5,
  },
  responseContainer: {
    backgroundColor: "#2C2C2E",
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  responseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  responseTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#8B5CF6",
    letterSpacing: -0.2,
  },
  responseText: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
    color: "#F4F4F5",
    letterSpacing: 0.1,
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
  personalYearCard: {
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    backgroundColor: "#f093fb",
    minHeight: 140,
    marginBottom: 16,
    padding: 24,
  },
  personalYearBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 'auto',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  personalYearBadgeText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  personalYearDetails: {
    marginTop: 12,
    gap: 8,
  },
  personalYearTheme: {
    color: "rgba(255, 255, 255, 0.95)",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  personalYearEnergy: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  numberCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  numberCardInner: {
    flex: 1,
  },
  numberLeft: {
    flex: 1,
  },
  numberLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 12,
    letterSpacing: -0.3,
  },
});