import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import SimpleAIService from '../services/SimpleAIService';
import GlassCard from '../components/ui/GlassCard';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ImprovedNumerologyReadingScreenProps {
  profile: any;
  lifePathInfo: any;
  predictions: any[];
  characterAnalysis: string;
  onBack: () => void;
  birthDate?: string;
  name?: string;
  userId?: string;
}

export default function ImprovedNumerologyReadingScreen({
  profile,
  lifePathInfo,
  predictions,
  characterAnalysis,
  onBack,
  birthDate,
  name,
  userId,
}: ImprovedNumerologyReadingScreenProps) {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const chatScrollRef = useRef<ScrollView>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Welcome message for chat
    if (showChat && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        text: `Hi ${name || 'there'}! I'm your personal numerology AI assistant. Ask me anything about your reading, love life, career, or any challenges you're facing. I'm here to help! ✨`,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [showChat, name, messages.length, fadeAnim]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const context = `
        User's Numerology Profile:
        - Name: ${name || 'Unknown'}
        - Birth Date: ${birthDate || 'Unknown'}
        - Life Path Number: ${profile?.lifePathNumber || 'Unknown'}
        - Destiny Number: ${profile?.destinyNumber || 'Unknown'}
        - Soul Urge Number: ${profile?.soulUrgeNumber || 'Unknown'}
        - Personality Number: ${profile?.personalityNumber || 'Unknown'}
        - Character Analysis: ${characterAnalysis || 'No analysis available'}
        
        Please provide helpful, empathetic guidance based on their numerology profile. Keep responses conversational and supportive.
      `;

      const aiResponse = await SimpleAIService.generateResponse(
        `${context}\n\nUser Question: ${userMessage.text}`,
        'numerology-chat'
      );

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse || "I'm sorry, I couldn't process that right now. Please try asking again!",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting right now. Please try again in a moment! 💫",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }

    // Scroll to bottom after a short delay
    setTimeout(() => {
      chatScrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isUser ? styles.userMessage : styles.botMessage
      ]}
    >
      <View style={[
        styles.messageBubble,
        message.isUser ? styles.userBubble : styles.botBubble
      ]}>
        {!message.isUser && (
          <View style={styles.botIcon}>
            <Ionicons name="sparkles" size={16} color="#667eea" />
          </View>
        )}
        <Text style={[
          styles.messageText,
          message.isUser ? styles.userMessageText : styles.botMessageText
        ]}>
          {message.text}
        </Text>
      </View>
    </View>
  );

  const getSimpleDescription = (number: number, type: string) => {
    const descriptions = {
      lifePath: {
        1: "You're a natural leader who loves to be first and start new things!",
        2: "You're a peacemaker who brings people together and creates harmony.",
        3: "You're creative and expressive, bringing joy and inspiration to others.",
        4: "You're practical and hardworking, building solid foundations for success.",
        5: "You're adventurous and free-spirited, always seeking new experiences.",
        6: "You're caring and nurturing, always looking out for family and friends.",
        7: "You're thoughtful and spiritual, seeking deeper meaning in life.",
        8: "You're ambitious and business-minded, great with money and success.",
        9: "You're compassionate and generous, wanting to help make the world better."
      }
    };

    return descriptions[type]?.[number] || "You have a unique and special energy!";
  };

  if (showChat) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <StatusBar barStyle="light-content" backgroundColor="#667eea" />
        
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.chatHeader}
        >
          <TouchableOpacity onPress={() => setShowChat(false)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.chatHeaderTitle}>AI Numerology Assistant</Text>
          <View style={styles.sparkleIcon}>
            <Ionicons name="sparkles" size={24} color="rgba(255,255,255,0.8)" />
          </View>
        </LinearGradient>

        <ScrollView
          ref={chatScrollRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#667eea" />
              <Text style={styles.loadingText}>Thinking...</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask me anything about your reading..."
            placeholderTextColor="#999"
            multiline
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            onPress={sendMessage}
            style={[styles.sendButton, { opacity: inputText.trim() ? 1 : 0.5 }]}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Numerology Reading</Text>
        <TouchableOpacity 
          onPress={() => setShowChat(true)} 
          style={styles.chatButton}
        >
          <Ionicons name="chatbubble-ellipses" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Profile Header */}
          <GlassCard style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.profileIcon}>
                <Ionicons name="person-circle" size={60} color="#667eea" />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{name || 'Your Reading'}</Text>
                <Text style={styles.profileDate}>{birthDate || 'Birth Date Unknown'}</Text>
              </View>
            </View>
          </GlassCard>

          {/* Core Numbers - Simplified */}
          <GlassCard style={styles.numbersCard}>
            <Text style={styles.sectionTitle}>🔮 Your Core Numbers</Text>
            
            <View style={styles.numberRow}>
              <View style={styles.numberItem}>
                <View style={styles.numberCircle}>
                  <Text style={styles.numberValue}>{profile?.lifePathNumber || '?'}</Text>
                </View>
                <Text style={styles.numberLabel}>Life Path</Text>
                <Text style={styles.numberDescription}>
                  {getSimpleDescription(profile?.lifePathNumber, 'lifePath')}
                </Text>
              </View>
            </View>

            <View style={styles.numberRow}>
              <View style={styles.numberItem}>
                <View style={styles.numberCircle}>
                  <Text style={styles.numberValue}>{profile?.destinyNumber || '?'}</Text>
                </View>
                <Text style={styles.numberLabel}>Destiny</Text>
                <Text style={styles.numberDescription}>
                  What you're meant to achieve in this lifetime
                </Text>
              </View>
            </View>

            <View style={styles.numberRow}>
              <View style={styles.numberItem}>
                <View style={styles.numberCircle}>
                  <Text style={styles.numberValue}>{profile?.soulUrgeNumber || '?'}</Text>
                </View>
                <Text style={styles.numberLabel}>Soul Urge</Text>
                <Text style={styles.numberDescription}>
                  Your heart's deepest desires and motivations
                </Text>
              </View>
            </View>
          </GlassCard>

          {/* Character Analysis - Simplified */}
          {characterAnalysis && (
            <GlassCard style={styles.analysisCard}>
              <Text style={styles.sectionTitle}>✨ Your Personality</Text>
              <Text style={styles.analysisText}>{characterAnalysis}</Text>
            </GlassCard>
          )}

          {/* Quick Insights */}
          <GlassCard style={styles.insightsCard}>
            <Text style={styles.sectionTitle}>💫 Quick Insights</Text>
            <View style={styles.insightItem}>
              <Ionicons name="heart" size={20} color="#E91E63" />
              <Text style={styles.insightText}>
                Great for love and relationships this month!
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Ionicons name="trending-up" size={20} color="#4CAF50" />
              <Text style={styles.insightText}>
                Career opportunities are coming your way
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Ionicons name="star" size={20} color="#FF9800" />
              <Text style={styles.insightText}>
                Lucky numbers: 3, 7, 12, 21
              </Text>
            </View>
          </GlassCard>

          {/* AI Chat Prompt */}
          <GlassCard style={styles.chatPromptCard}>
            <View style={styles.chatPromptContent}>
              <Ionicons name="chatbubble-ellipses" size={40} color="#667eea" />
              <Text style={styles.chatPromptTitle}>Have Questions?</Text>
              <Text style={styles.chatPromptText}>
                Chat with our AI assistant about your reading, relationships, career, or any challenges you're facing!
              </Text>
              <TouchableOpacity
                onPress={() => setShowChat(true)}
                style={styles.chatPromptButton}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.chatPromptButtonGradient}
                >
                  <Text style={styles.chatPromptButtonText}>Start Chat</Text>
                  <Ionicons name="arrow-forward" size={16} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9ff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: StatusBar.currentHeight || 44,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  chatButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileCard: {
    marginTop: 20,
    marginBottom: 15,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIcon: {
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  profileDate: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  numbersCard: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  numberRow: {
    marginBottom: 20,
  },
  numberItem: {
    alignItems: 'center',
  },
  numberCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  numberValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  numberLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 5,
  },
  numberDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
  },
  analysisCard: {
    marginBottom: 15,
  },
  analysisText: {
    fontSize: 16,
    color: '#2c3e50',
    lineHeight: 24,
  },
  insightsCard: {
    marginBottom: 15,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightText: {
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 12,
    flex: 1,
  },
  chatPromptCard: {
    marginBottom: 30,
  },
  chatPromptContent: {
    alignItems: 'center',
  },
  chatPromptTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 15,
    marginBottom: 10,
  },
  chatPromptText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  chatPromptButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  chatPromptButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  chatPromptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginRight: 8,
  },
  
  // Chat Styles
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: StatusBar.currentHeight || 44,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  chatHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  sparkleIcon: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  messageContainer: {
    marginBottom: 15,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  botMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 20,
    padding: 15,
  },
  userBubble: {
    backgroundColor: '#667eea',
  },
  botBubble: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e1e5e9',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  botIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: 'white',
  },
  botMessageText: {
    color: '#2c3e50',
    flex: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#667eea',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#667eea',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});