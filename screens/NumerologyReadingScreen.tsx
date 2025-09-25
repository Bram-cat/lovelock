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
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="sparkles" size={20} color="#E91E63" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
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
        <TouchableOpacity style={styles.enhancedButton}>
          <Ionicons name="sparkles" size={20} color="white" />
          <Text style={styles.enhancedButtonText}>View Enhanced Reading with AI Chat</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>

        {/* Core Numbers Section */}
        <Text style={styles.sectionTitle}>Core Numbers</Text>

        {/* Life Path Card */}
        <View style={styles.numberCard}>
          <View style={styles.numberCardInner}>
            <View style={styles.numberLeft}>
              <Text style={styles.numberLabel}>Life Path</Text>
              <Text style={styles.numberDescription}>
                Your life's purpose and the path you're meant to walk
              </Text>
            </View>
            <View style={styles.numberBadge}>
              <Text style={styles.numberValue}>{profile.lifePathNumber}</Text>
            </View>
          </View>
        </View>

        {/* Destiny Card */}
        <View style={styles.numberCard}>
          <View style={styles.numberCardInner}>
            <View style={styles.numberLeft}>
              <Text style={styles.numberLabel}>Destiny</Text>
              <Text style={styles.numberDescription}>
                What you're destined to achieve in this lifetime
              </Text>
            </View>
            <View style={styles.numberBadge}>
              <Text style={styles.numberValue}>{profile.destinyNumber}</Text>
            </View>
          </View>
        </View>

        {/* Soul Urge Card */}
        <View style={styles.numberCard}>
          <View style={styles.numberCardInner}>
            <View style={styles.numberLeft}>
              <Text style={styles.numberLabel}>Soul Urge</Text>
              <Text style={styles.numberDescription}>
                Your heart's deepest desires and motivations
              </Text>
            </View>
            <View style={styles.numberBadge}>
              <Text style={styles.numberValue}>{profile.soulUrgeNumber}</Text>
            </View>
          </View>
        </View>

        {/* Expression Number Card */}
        {profile.expressionNumber && (
          <View style={styles.numberCard}>
            <View style={styles.numberCardInner}>
              <View style={styles.numberLeft}>
                <Text style={styles.numberLabel}>Expression</Text>
                <Text style={styles.numberDescription}>
                  How you express yourself to the world
                </Text>
              </View>
              <View style={styles.numberBadge}>
                <Text style={styles.numberValue}>{profile.expressionNumber}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Character Analysis Section */}
        <Text style={styles.sectionTitle}>Character Analysis</Text>
        <View style={styles.analysisCard}>
          <Text style={styles.analysisText}>{characterAnalysis}</Text>
        </View>

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
    backgroundColor: "#E91E63",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 8,
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
  numberCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(233, 30, 99, 0.2)",
  },
  numberCardInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  numberLeft: {
    flex: 1,
    paddingRight: 16,
  },
  numberLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  numberDescription: {
    fontSize: 14,
    color: "#999",
    lineHeight: 20,
  },
  numberBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E91E63",
    justifyContent: "center",
    alignItems: "center",
  },
  numberValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
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
});