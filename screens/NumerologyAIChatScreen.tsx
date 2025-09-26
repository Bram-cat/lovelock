import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect, useRef } from "react";
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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import SimpleAIService from "../services/SimpleAIService";

interface NumerologyAIChatScreenProps {
  profile: any;
  lifePathInfo: any;
  predictions: any[];
  characterAnalysis: string;
  onBack: () => void;
  birthDate?: string;
  name?: string;
  userId?: string;
}

export default function NumerologyAIChatScreen({
  profile,
  lifePathInfo,
  predictions,
  characterAnalysis,
  onBack,
  birthDate,
  name,
  userId,
}: NumerologyAIChatScreenProps) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Array<{type: 'user' | 'ai', content: string, timestamp: Date}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  // Generate AI summary on mount
  useEffect(() => {
    generateNumerologySummary();
  }, []);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const generateNumerologySummary = async () => {
    setSummaryLoading(true);
    try {
      const summaryPrompt = `Create a personalized numerology summary for ${name || 'this person'} based on their profile:

Life Path Number: ${profile.lifePathNumber}
Destiny Number: ${profile.destinyNumber}
Soul Urge Number: ${profile.soulUrgeNumber}
Birth Date: ${birthDate}

Please provide a warm, insightful 3-paragraph summary covering:
1. Their core personality and life purpose
2. Their key strengths and natural talents
3. Important guidance for their spiritual journey

Keep it personal, encouraging, and mystical in tone.`;

      const result = await SimpleAIService.generateResponse(summaryPrompt, "numerology");

      setMessages([{
        type: 'ai',
        content: result.content || "Welcome to your personalized numerology insights! I'm here to help you understand your cosmic blueprint.",
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error("Error generating summary:", error);
      setMessages([{
        type: 'ai',
        content: "Welcome to your personalized numerology insights! I'm here to help you understand your cosmic blueprint and answer any questions about your numbers.",
        timestamp: new Date()
      }]);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    const userMessage = {
      type: 'user' as const,
      content: question.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setQuestion("");
    setIsLoading(true);

    try {
      const result = await SimpleAIService.answerNumerologyQuestion(profile, question.trim());

      const aiMessage = {
        type: 'ai' as const,
        content: result.content || "I'm having trouble connecting to the cosmos right now. Please try again.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error asking question:", error);
      const errorMessage = {
        type: 'ai' as const,
        content: "I'm having trouble connecting to the cosmos right now. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>AI Oracle</Text>
          <Text style={styles.headerSubtitle}>Cosmic Guidance</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="sparkles" size={20} color="#8B5CF6" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={90}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
        >
          {summaryLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8B5CF6" />
              <Text style={styles.loadingText}>Consulting the cosmic energies...</Text>
            </View>
          ) : (
            messages.map((message, index) => (
              <View
                key={index}
                style={[
                  styles.messageContainer,
                  message.type === 'user' ? styles.userMessage : styles.aiMessage
                ]}
              >
                <View style={styles.messageHeader}>
                  <View style={styles.messageAvatar}>
                    <Ionicons
                      name={message.type === 'user' ? "person" : "sparkles"}
                      size={16}
                      color="white"
                    />
                  </View>
                  <Text style={styles.messageAuthor}>
                    {message.type === 'user' ? 'You' : 'Oracle'}
                  </Text>
                  <Text style={styles.messageTime}>
                    {formatTime(message.timestamp)}
                  </Text>
                </View>
                <Text style={styles.messageText}>{message.content}</Text>
              </View>
            ))
          )}

          {isLoading && (
            <View style={[styles.messageContainer, styles.aiMessage]}>
              <View style={styles.messageHeader}>
                <View style={styles.messageAvatar}>
                  <Ionicons name="sparkles" size={16} color="white" />
                </View>
                <Text style={styles.messageAuthor}>Oracle</Text>
              </View>
              <View style={styles.typingIndicator}>
                <ActivityIndicator size="small" color="#8B5CF6" />
                <Text style={styles.typingText}>Channeling cosmic wisdom...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ask about your numbers, future, or relationships..."
              placeholderTextColor="#888"
              value={question}
              onChangeText={setQuestion}
              multiline
              maxLength={500}
              onSubmitEditing={handleAskQuestion}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!question.trim() || isLoading) && styles.sendButtonDisabled]}
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
        </View>
      </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
    borderBottomColor: "#1C1C1E",
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
  headerCenter: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#8B5CF6",
    fontWeight: "500",
  },
  headerActions: {
    width: 40,
    alignItems: "flex-end",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1C1C1E",
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messagesContent: {
    paddingVertical: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    color: "#8B5CF6",
    fontSize: 16,
    marginTop: 12,
    fontWeight: "500",
  },
  messageContainer: {
    marginBottom: 20,
    maxWidth: "85%",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#8B5CF6",
    borderRadius: 20,
    borderBottomRightRadius: 8,
    padding: 16,
  },
  aiMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    borderBottomLeftRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.2)",
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  messageAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  messageAuthor: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
    flex: 1,
  },
  messageTime: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.5)",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  typingText: {
    fontSize: 14,
    color: "#8B5CF6",
    fontStyle: "italic",
  },
  inputSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#000000",
    borderTopWidth: 1,
    borderTopColor: "#1C1C1E",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#1C1C1E",
    borderRadius: 24,
    padding: 8,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 120,
    minHeight: 44,
    fontWeight: "500",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
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
});