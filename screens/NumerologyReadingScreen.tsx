import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useEffect, useRef } from "react";
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
  Text,
  Share,
  Alert,
  Animated,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get('window');

import ThemedText from "../components/ThemedText";
import SimpleAIService from "../services/SimpleAIService";
import { AstrologyService } from "../services/AstrologyService";
import { LifeInsightsService } from "../services/LifeInsightsService";
import { CelebrityNumerologyService } from "../services/CelebrityNumerologyService";
import { UsageTrackingService } from "../services/UsageTrackingService";
import { SubscriptionService } from "../services/SubscriptionService";

// Component for highlighting engaging keywords in readings
const HighlightedText = ({ text, style }: { text: string; style: any }) => {
  const highlightWords = [
    // Character traits that draw readers in
    'extraordinary', 'remarkable', 'fascinating', 'unique', 'special', 'gifted', 'talented', 'powerful',
    'magnetic', 'charismatic', 'captivating', 'mysterious', 'enchanting', 'alluring', 'compelling',
    
    // Personality descriptors
    'compassionate', 'intuitive', 'creative', 'analytical', 'empathetic', 'confident', 'ambitious',
    'nurturing', 'independent', 'loyal', 'adventurous', 'passionate', 'wise', 'generous',
    'determined', 'innovative', 'harmonious', 'authentic', 'resilient', 'visionary',
    'introspective', 'optimistic', 'diplomatic', 'pioneering', 'spontaneous', 'gentle',
    'strong-willed', 'perceptive', 'idealistic', 'practical', 'sensitive', 'bold', 'thoughtful',
    'versatile', 'steady', 'dynamic', 'expressive', 'balanced', 'focused',
    
    // Emotional engagement words
    'destiny', 'breakthrough', 'transformation', 'awakening', 'revelation', 'discovery', 'potential',
    'opportunity', 'success', 'abundance', 'prosperity', 'fulfillment', 'happiness', 'joy',
    'love', 'soulmate', 'connection', 'harmony', 'peace', 'strength', 'courage', 'wisdom',
    'growth', 'evolution', 'journey', 'path', 'purpose', 'mission', 'calling', 'gift',
    'miracle', 'blessing', 'fortune', 'luck', 'serendipity', 'synchronicity', 'magic',
    
    // Action and achievement words
    'achieve', 'manifest', 'create', 'build', 'attract', 'magnetize', 'inspire', 'influence',
    'lead', 'guide', 'heal', 'transform', 'elevate', 'empower', 'unlock', 'reveal',
    'master', 'excel', 'thrive', 'flourish', 'shine', 'radiate', 'glow', 'sparkle'
  ];

  const parts = text.split(new RegExp(`\\b(${highlightWords.join('|')})\\b`, 'gi'));
  
  return (
    <Text style={style}>
      {parts.map((part, index) => {
        const isHighlighted = highlightWords.some(word => 
          word.toLowerCase() === part.toLowerCase()
        );
        return (
          <Text
            key={index}
            style={isHighlighted ? styles.highlightedWord : null}
          >
            {part}
          </Text>
        );
      })}
    </Text>
  );
};

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
  const [showAiSection, setShowAiSection] = useState(false);
  const [dailyInsight, setDailyInsight] = useState("");
  const [zodiacSign, setZodiacSign] = useState("");
  const [dailyHoroscope, setDailyHoroscope] = useState("");
  const [oraclePredictions, setOraclePredictions] = useState("");
  const [deadlySinWarning, setDeadlySinWarning] = useState<{sin: string; warning: string; consequences: string} | null>(null);
  const [nearFuturePredictions, setNearFuturePredictions] = useState("");
  const [loadingDeadlySin, setLoadingDeadlySin] = useState(false);
  const [loadingFuturePredictions, setLoadingFuturePredictions] = useState(false);
  const [usageStats, setUsageStats] = useState<{
    canUse: boolean;
    usageCount: number;
    remainingUses: number;
    isPremium: boolean;
    message?: string;
  } | null>(null);

  // Animation values
  const [sparkleAnimation] = useState(new Animated.Value(0));
  const [pulseAnimation] = useState(new Animated.Value(1));
  const [floatingAnimation] = useState(new Animated.Value(0));
  const [heartAnimation] = useState(new Animated.Value(1));
  const [rotateAnimation] = useState(new Animated.Value(0));
  const scrollY = useRef(new Animated.Value(0)).current;
  const [magicParticles] = useState(new Animated.Value(0));
  const [glowAnimation] = useState(new Animated.Value(0));
  const [cardEntranceAnimations] = useState(
    Array.from({ length: 10 }, () => new Animated.Value(0))
  );

  // Start animations on component mount
  useEffect(() => {
    // Sparkle animation - twinkling effect
    const sparkle = Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    // Pulse animation for interactive elements
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    // Floating animation
    const floating = Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnimation, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnimation, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );

    // Heart beat animation
    const heartBeat = Animated.loop(
      Animated.sequence([
        Animated.timing(heartAnimation, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(heartAnimation, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );

    // Rotation animation
    const rotate = Animated.loop(
      Animated.timing(rotateAnimation, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    );

    // Magic particles animation
    const particles = Animated.loop(
      Animated.sequence([
        Animated.timing(magicParticles, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(magicParticles, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Glow animation
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnimation, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnimation, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    );

    // Stagger card entrance animations
    const cardAnimations = cardEntranceAnimations.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 600,
        delay: index * 150,
        useNativeDriver: true,
      })
    );

    // Start all animations
    sparkle.start();
    pulse.start();
    floating.start();
    heartBeat.start();
    rotate.start();
    particles.start();
    glow.start();
    
    Animated.stagger(150, cardAnimations).start();

    return () => {
      sparkle.stop();
      pulse.stop();
      floating.stop();
      heartBeat.stop();
      rotate.stop();
      particles.stop();
      glow.stop();
      cardAnimations.forEach(anim => anim.stop());
    };
  }, []);

  // Load usage stats for the user
  React.useEffect(() => {
    const loadUsageStats = async () => {
      if (userId) {
        try {
          // Use SubscriptionService which has the correct premium logic
          const canUse = await SubscriptionService.canAccessFeature(userId, 'numerology');
          const stats = await SubscriptionService.getUsageStats(userId);
          
          setUsageStats({
            canUse: canUse.canUse,
            usageCount: stats.numerology.totalUsed,
            remainingUses: stats.numerology.remaining,
            isPremium: stats.isPremium,
            message: canUse.message
          });
        } catch (error) {
          console.error("Error loading usage stats:", error);
        }
      }
    };

    loadUsageStats();
    
    // Set up interval to refresh usage stats every 3 seconds
    const interval = setInterval(loadUsageStats, 3000);
    
    return () => clearInterval(interval);
  }, [userId]);

  // Redirect unknown users back to numbers tab
  React.useEffect(() => {
    if (!name || name.trim() === '' || name.toLowerCase() === 'unknown user') {
      console.log('Unknown user detected, redirecting to numbers tab');
      onBack();
      return;
    }
  }, [name, onBack]);

  // Generate daily insight and fetch horoscope on component mount
  React.useEffect(() => {
    const generateInsights = async () => {
      // Track numerology usage
      if (userId) {
        UsageTrackingService.trackNumerologyUsage(userId, {
          name,
          lifePathNumber: profile?.lifePathNumber,
          timestamp: new Date().toISOString()
        });
      }

      try {
        // Generate AI daily insight
        const dailyResult = await UniversalAIService.generateAdvancedPrompt(`Generate a daily insight for someone with Life Path ${profile.lifePathNumber}. Keep it brief and inspiring.`);
        setDailyInsight(dailyResult.content);

        // Add brief delay between AI calls
        await new Promise(resolve => setTimeout(resolve, 500));

        // Generate Oracle predictions based on life path
        const predictionsResult = await SimpleAIService.generateResponse(`As Oracle, provide 3 specific predictions for ${name} with Life Path ${profile.lifePathNumber}. Focus on:
        1. Love & relationships in the next 3 months
        2. Career opportunities this year
        3. Spiritual growth insights
        
        Format each prediction with the timeframe and be specific to their life path number. Keep each prediction under 40 words.`, 'oracle');
        setOraclePredictions(predictionsResult.content);
      } catch (error) {
        console.error("Error generating daily insight:", error);
        // Set fallback content
        setDailyInsight("The cosmos holds great potential for you today. Trust in your natural abilities and stay open to opportunities.");
        setOraclePredictions("The universe has wonderful plans for your journey. Your Life Path reveals great potential for love, success, and spiritual growth.");
      }

      // Generate deadly sin warning based on numerology profile
      console.log('🔮 Checking deadly sin conditions:', { name: !!name, profile: !!profile, lifePathNumber: profile?.lifePathNumber });
      if (name && profile && profile.lifePathNumber) {
        try {
          setLoadingDeadlySin(true);
          console.log('🔮 Generating deadly sin warning for:', name, 'with profile:', profile);
          
          // Add brief delay before deadly sin call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const sinResult = await SimpleAIService.generateDeadlySinWarning(profile);
          console.log('✅ Deadly sin warning generated:', sinResult);
          
          setDeadlySinWarning({
            sin: sinResult.sin,
            warning: sinResult.warning,
            consequences: sinResult.consequences
          });
        } catch (error) {
          console.error("Error generating deadly sin warning:", error);
          // Provide fallback based on life path number
          const lifePathSins = {
            1: { sin: "Pride", warning: "Your natural leadership can turn into arrogance.", consequences: "Pride may alienate others and block genuine connections." },
            2: { sin: "Envy", warning: "Your sensitivity can lead to jealousy of others' success.", consequences: "Envy can poison relationships and create unnecessary conflicts." },
            3: { sin: "Vanity", warning: "Your creative nature may seek excessive admiration.", consequences: "Vanity can make you appear shallow and self-centered." },
            4: { sin: "Sloth", warning: "Your methodical nature can become rigid stubbornness.", consequences: "Spiritual laziness may prevent personal growth." },
            5: { sin: "Gluttony", warning: "Your adventurous spirit may lead to overindulgence.", consequences: "Excess in experiences can overwhelm your true purpose." },
            6: { sin: "Wrath", warning: "Your caring nature can turn into controlling anger.", consequences: "Anger may damage the relationships you're trying to protect." },
            7: { sin: "Greed", warning: "Your wisdom-seeking can become hoarding of knowledge.", consequences: "Greed for knowledge without sharing creates isolation." },
            8: { sin: "Greed", warning: "Your ambition may turn into materialistic obsession.", consequences: "Material greed can corrupt your natural leadership abilities." },
            9: { sin: "Pride", warning: "Your humanitarian nature can become self-righteous.", consequences: "Spiritual pride may prevent you from truly serving others." }
          };
          
          const fallback = lifePathSins[profile.lifePathNumber as keyof typeof lifePathSins] || lifePathSins[1];
          setDeadlySinWarning(fallback);
        } finally {
          setLoadingDeadlySin(false);
        }
      }

      // Generate near future predictions
      console.log('🔮 Starting future predictions generation');
      try {
        setLoadingFuturePredictions(true);
        
        // Add brief delay before future predictions call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const futureResult = await SimpleAIService.generateResponse(`As Oracle, provide detailed predictions for ${name} with Life Path ${profile.lifePathNumber} about what might happen in their life in the near future (next 6-12 months). Focus on:
        
        1. Major life changes or transformations coming
        2. Opportunities they should watch for
        3. Challenges they may face and how to overcome them
        4. Relationships and love developments
        5. Career and financial prospects
        6. Personal growth and spiritual development
        
        Be specific to their Life Path ${profile.lifePathNumber} characteristics and provide actionable insights. Keep the tone mystical yet practical. Limit to 200 words.`, 'oracle');
        setNearFuturePredictions(futureResult.content);
      } catch (error) {
        console.error("Error generating future predictions:", error);
        // Provide Life Path-specific fallback
        const lifePathPredictions = {
          1: "Your leadership abilities will be tested and strengthened. New opportunities for independence await. Focus on self-confidence while building meaningful partnerships.",
          2: "Cooperation and diplomacy will be key themes. Expect important partnerships to form. Your intuitive abilities will guide you to the right decisions.",
          3: "Creative projects will flourish. Communication and self-expression will open new doors. Social connections will play a vital role in your success.",
          4: "Hard work and persistence will pay off significantly. Building solid foundations will be crucial. Financial stability is on the horizon.",
          5: "Adventures and changes are coming. Freedom and variety will feature prominently. Travel or relocation may be in your future.",
          6: "Family and relationships will require your attention. Healing and nurturing others will bring fulfillment. Home and community connections grow stronger.",
          7: "Spiritual growth and inner wisdom will expand. Research and learning lead to breakthroughs. Solitude will provide important insights.",
          8: "Business and financial success are highlighted. Leadership roles and material achievements await. Authority and recognition will come.",
          9: "Humanitarian work and service to others will be fulfilling. Completion of important life cycles brings wisdom. Teaching and inspiring others features prominently."
        };
        const fallback = lifePathPredictions[profile.lifePathNumber as keyof typeof lifePathPredictions] || "The cosmos has wonderful plans for your journey ahead. Stay open to the possibilities that await.";
        setNearFuturePredictions(fallback);
      } finally {
        setLoadingFuturePredictions(false);
      }

      // Get zodiac information and horoscope if birthDate is available
      if (birthDate) {
        try {
          const sign = AstrologyService.getZodiacSign(birthDate);
          setZodiacSign(sign);
          
          // Fetch daily horoscope from Aztro API
          const horoscope = await AstrologyService.getDailyHoroscope(sign);
          if (horoscope) {
            setDailyHoroscope(horoscope.description);
          }
        } catch (error) {
          console.error("Failed to fetch horoscope:", error);
        }
      }
    };
    
    console.log('🎯 useEffect conditions check:', { profile: !!profile, name: !!name });
    if (profile && name) {
      console.log('🎯 Conditions met, calling generateInsights');
      generateInsights();
    } else {
      console.log('🎯 Conditions not met, skipping generateInsights');
    }
  }, [profile, birthDate, name]);

  const handleAskQuestion = async () => {
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const result = await SimpleAIService.answerNumerologyQuestion(
        profile,
        question
      );
      const response = result.content;
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

  const handleShareReading = async () => {
    try {
      const shareContent = `🌟 My Numerology Reading 🌟

Life Path: ${profile?.lifePathNumber} - ${lifePathInfo?.title}
Destiny: ${profile?.destinyNumber}
Soul Urge: ${profile?.soulUrgeNumber}

✨ Today's Insight: ${dailyInsight || 'Discover your cosmic potential!'}

Get your personalized numerology reading at Lovelock! 💫`;

      await Share.share({
        message: shareContent,
        title: 'My Numerology Reading',
      });
    } catch (error) {
      console.error('Error sharing:', error);
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
        predictions: Array.isArray(prediction.insights)
          ? prediction.insights
          : Array.isArray(prediction.predictions)
          ? prediction.predictions
          : [prediction.predictions || prediction.insights || "No prediction available"],
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

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  // Animated background particles
  const AnimatedBackgroundParticles = () => (
    <View style={styles.particlesContainer}>
      {Array.from({ length: 20 }).map((_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              left: (index * 30) % width,
              top: (index * 50) % 800,
              opacity: sparkleAnimation.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.1, 0.8, 0.1],
              }),
              transform: [
                {
                  scale: magicParticles.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.5, 1.2, 0.5],
                  }),
                },
                {
                  rotate: rotateAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <Ionicons
            name={['sparkles', 'star', 'diamond', 'heart'][index % 4] as any}
            size={8 + (index % 3) * 2}
            color={['#FFD700', '#FF6B9D', '#667eea', '#4ECDC4'][index % 4]}
          />
        </Animated.View>
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      {/* Animated Background */}
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb', '#f5576c']}
        style={styles.animatedBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Magic Particles */}
      <AnimatedBackgroundParticles />

      {/* Enhanced Animated Header */}
      <Animated.View style={{ opacity: headerOpacity }}>
        <LinearGradient
          colors={["#667eea", "#764ba2", "#f093fb"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Floating sparkles in header */}
          <Animated.View style={[
            styles.headerSparkle,
            {
              right: 80,
              top: 60,
              opacity: sparkleAnimation,
              transform: [{
                scale: floatingAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1.2],
                })
              }]
            }
          ]}>
            <Ionicons name="sparkles" size={16} color="rgba(255,255,255,0.8)" />
          </Animated.View>
          
          <Animated.View style={[
            styles.headerSparkle,
            {
              right: 120,
              top: 80,
              opacity: sparkleAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
              transform: [{
                rotate: rotateAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '180deg'],
                })
              }]
            }
          ]}>
            <Ionicons name="star" size={12} color="rgba(255,215,0,0.9)" />
          </Animated.View>

          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Animated.View style={{
              transform: [{ scale: pulseAnimation }]
            }}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </Animated.View>
            <ThemedText style={styles.backButtonText}>Numbers</ThemedText>
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            <Animated.View style={{
              transform: [{
                translateY: floatingAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -3],
                })
              }]
            }}>
              <ThemedText style={styles.headerTitle}>
                ✨ Your Cosmic Blueprint ✨
              </ThemedText>
              <ThemedText style={styles.headerSubtitle}>
                Discover your numerological insights
              </ThemedText>
            </Animated.View>
          </View>
          
          <View style={styles.headerActions}>
            <Animated.View style={{
              transform: [{ scale: pulseAnimation }]
            }}>
              <TouchableOpacity style={styles.actionButton} onPress={handleShareReading}>
                <Ionicons name="share-outline" size={20} color="white" />
              </TouchableOpacity>
            </Animated.View>
            
            <Animated.View style={[
              styles.magicOrb,
              {
                opacity: glowAnimation,
                transform: [{
                  scale: glowAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.3],
                  })
                }]
              }
            ]}>
              <Ionicons name="diamond" size={16} color="#FFD700" />
            </Animated.View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Usage Counter */}
      {usageStats && !usageStats.isPremium && (
        <View style={[styles.usageContainer, usageStats.remainingUses <= 1 && styles.urgentUsageContainer]}>
          <View style={styles.usageInfo}>
            <Ionicons 
              name={usageStats.remainingUses <= 1 ? "warning" : "flash"} 
              size={16} 
              color={usageStats.remainingUses <= 1 ? "#FF3B30" : "#FFD700"} 
            />
            <ThemedText style={[styles.usageText, usageStats.remainingUses <= 1 && styles.urgentUsageText]}>
              {usageStats.remainingUses === 0 
                ? "No free readings remaining" 
                : `${usageStats.remainingUses} free reading${usageStats.remainingUses === 1 ? '' : 's'} left`}
            </ThemedText>
          </View>
          {usageStats.remainingUses <= 2 && (
            <TouchableOpacity style={styles.upgradeButton}>
              <Ionicons name="diamond" size={12} color="#FFFFFF" />
              <ThemedText style={styles.upgradeButtonText}>Upgrade for Unlimited</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      )}

      {usageStats?.isPremium && (
        <View style={styles.premiumBadgeContainer}>
          <View style={styles.premiumBadge}>
            <Ionicons name="diamond" size={16} color="#FFD700" />
            <ThemedText style={styles.premiumText}>Premium - Unlimited Readings</ThemedText>
          </View>
        </View>
      )}

      <Animated.ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Life Path Overview with Enhanced Animation */}
        <Animated.View style={[
          styles.cardContainer,
          {
            opacity: cardEntranceAnimations[0],
            transform: [{
              translateY: cardEntranceAnimations[0].interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              })
            }, {
              scale: cardEntranceAnimations[0].interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              })
            }]
          }
        ]}>
          <LinearGradient
            colors={["#f093fb", "#f5576c", "#ff6b9d"]}
            style={styles.cardHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {/* Floating magical elements */}
            <Animated.View style={[
              styles.floatingIcon,
              {
                right: 20,
                top: 10,
                opacity: sparkleAnimation,
                transform: [{
                  rotate: rotateAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  })
                }]
              }
            ]}>
              <Ionicons name="sparkles" size={14} color="rgba(255,255,255,0.8)" />
            </Animated.View>

            <Animated.View style={[
              styles.iconContainer,
              {
                transform: [{ scale: heartAnimation }]
              }
            ]}>
              <Ionicons name="star" size={24} color="white" />
              
              {/* Pulsing glow effect */}
              <Animated.View style={[
                styles.glowEffect,
                {
                  opacity: glowAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 0.8],
                  }),
                  transform: [{
                    scale: glowAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.5],
                    })
                  }]
                }
              ]} />
            </Animated.View>
            
            <View style={styles.cardHeaderText}>
              <Animated.View style={{
                transform: [{
                  translateX: floatingAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 2],
                  })
                }]
              }}>
                <ThemedText style={styles.cardTitle}>
                  ✨ Life Path {profile?.lifePathNumber} ✨
                </ThemedText>
                <ThemedText style={styles.cardSubtitle}>
                  🌌 Your Soul's Journey 🌌
                </ThemedText>
              </Animated.View>
            </View>
            
            {/* Magic number badge */}
            <Animated.View style={[
              styles.magicBadge,
              {
                opacity: pulseAnimation,
                transform: [{ scale: pulseAnimation }]
              }
            ]}>
              <ThemedText style={styles.magicBadgeText}>{profile?.lifePathNumber}</ThemedText>
            </Animated.View>
          </LinearGradient>
          <View style={styles.cardContent}>
            <HighlightedText 
              text={lifePathInfo?.description || "Your unique path is being revealed..."}
              style={styles.cardDescription}
            />
            {lifePathInfo?.strengths && (
              <View style={styles.traitsContainer}>
                <View style={styles.traitSection}>
                  <Ionicons name="checkmark-circle" size={16} color="#4ecdc4" />
                  <ThemedText style={styles.traitLabel}>Strengths:</ThemedText>
                  <HighlightedText 
                    text={lifePathInfo.strengths.join(', ')}
                    style={styles.traitText}
                  />
                </View>
              </View>
            )}
            {lifePathInfo?.challenges && (
              <View style={styles.traitSection}>
                <Ionicons name="arrow-up-circle" size={16} color="#6c7ce7" />
                <ThemedText style={styles.traitLabel}>Growth Areas:</ThemedText>
                <HighlightedText 
                  text={lifePathInfo.challenges.join(', ')}
                  style={styles.traitText}
                />
              </View>
            )}
          </View>
        </Animated.View>

        {/* Core Numbers with Enhanced Magic */}
        <Animated.View style={[
          styles.cardContainer,
          {
            opacity: cardEntranceAnimations[1],
            transform: [{
              translateY: cardEntranceAnimations[1].interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              })
            }, {
              scale: cardEntranceAnimations[1].interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              })
            }]
          }
        ]}>
          <View style={styles.cardHeader}>
            <Animated.View style={{
              transform: [{
                scale: pulseAnimation.interpolate({
                  inputRange: [1, 1.05],
                  outputRange: [1, 1.02],
                })
              }]
            }}>
              <ThemedText style={styles.sectionTitle}>
                🔮 Your Core Numbers 🔮
              </ThemedText>
            </Animated.View>
            
            {/* Floating mystical elements */}
            <Animated.View style={[
              styles.mysticalElement,
              {
                right: 10,
                top: 5,
                opacity: sparkleAnimation,
                transform: [{
                  rotate: rotateAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  })
                }]
              }
            ]}>
              <Ionicons name="diamond" size={12} color="#FFD700" />
            </Animated.View>
          </View>
          <View style={styles.numbersGrid}>
            {/* Destiny Number - Enhanced with Animation */}
            <Animated.View style={{
              transform: [{ scale: pulseAnimation }],
              opacity: cardEntranceAnimations[2],
            }}>
              <LinearGradient
                colors={["#667eea", "#764ba2", "#8b5cf6"]}
                style={styles.numberCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Animated.View style={{
                  transform: [{ rotate: floatingAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '15deg'],
                  })}]
                }}>
                  <Ionicons
                    name="compass"
                    size={20}
                    color="white"
                    style={styles.numberIcon}
                  />
                </Animated.View>
                
                <Animated.View style={{
                  transform: [{ scale: heartAnimation }]
                }}>
                  <ThemedText style={styles.numberValue}>
                    {profile?.destinyNumber || "?"}
                  </ThemedText>
                </Animated.View>
                
                <ThemedText style={styles.numberLabel}>🧿 Destiny</ThemedText>
                
                {/* Sparkle effect */}
                <Animated.View style={[
                  styles.cardSparkle,
                  {
                    opacity: sparkleAnimation,
                    transform: [{ scale: sparkleAnimation }]
                  }
                ]}>
                  <Ionicons name="sparkles" size={10} color="rgba(255,255,255,0.8)" />
                </Animated.View>
              </LinearGradient>
            </Animated.View>

            {/* Soul Urge Number - Enhanced with Animation */}
            <Animated.View style={{
              transform: [{ scale: heartAnimation }],
              opacity: cardEntranceAnimations[3],
            }}>
              <LinearGradient
                colors={["#ff6b9d", "#e85a8a", "#f093fb"]}
                style={styles.numberCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Animated.View style={{
                  transform: [{ scale: heartAnimation.interpolate({
                    inputRange: [1, 1.2],
                    outputRange: [1, 1.1],
                  })}]
                }}>
                  <Ionicons
                    name="heart"
                    size={20}
                    color="white"
                    style={styles.numberIcon}
                  />
                </Animated.View>
                
                <Animated.View style={{
                  transform: [{ scale: pulseAnimation }]
                }}>
                  <ThemedText style={styles.numberValue}>
                    {profile?.soulUrgeNumber || "?"}
                  </ThemedText>
                </Animated.View>
                
                <ThemedText style={styles.numberLabel}>❤️ Soul Urge</ThemedText>
                
                {/* Heart effect */}
                <Animated.View style={[
                  styles.cardSparkle,
                  { right: 5 },
                  {
                    opacity: heartAnimation.interpolate({
                      inputRange: [1, 1.2],
                      outputRange: [0.3, 0.8],
                    }),
                    transform: [{ scale: heartAnimation }]
                  }
                ]}>
                  <Ionicons name="heart" size={8} color="rgba(255,255,255,0.9)" />
                </Animated.View>
              </LinearGradient>
            </Animated.View>

            {/* Personality Number - Enhanced with Animation */}
            <Animated.View style={{
              transform: [{ 
                rotate: floatingAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '2deg'],
                })
              }],
              opacity: cardEntranceAnimations[4],
            }}>
              <LinearGradient
                colors={["#4ecdc4", "#44a08d", "#96e6a1"]}
                style={styles.numberCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Animated.View style={{
                  transform: [{ 
                    scale: floatingAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.05],
                    })
                  }]
                }}>
                  <Ionicons
                    name="person"
                    size={20}
                    color="white"
                    style={styles.numberIcon}
                  />
                </Animated.View>
                
                <Animated.View style={{
                  transform: [{ scale: pulseAnimation }]
                }}>
                  <ThemedText style={styles.numberValue}>
                    {profile?.personalityNumber || "?"}
                  </ThemedText>
                </Animated.View>
                
                <ThemedText style={styles.numberLabel}>🎭 Personality</ThemedText>
                
                {/* Wave effect */}
                <Animated.View style={[
                  styles.cardSparkle,
                  { left: 5, bottom: 5 },
                  {
                    opacity: floatingAnimation,
                    transform: [{
                      rotate: floatingAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '180deg'],
                      })
                    }]
                  }
                ]}>
                  <Ionicons name="water" size={8} color="rgba(255,255,255,0.7)" />
                </Animated.View>
              </LinearGradient>
            </Animated.View>

            {/* Expression Number - Enhanced with Animation */}
            <Animated.View style={{
              transform: [{ scale: sparkleAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.98, 1.02],
              })}],
              opacity: cardEntranceAnimations[5],
            }}>
              <LinearGradient
                colors={["#96e6a1", "#7dd87f", "#a8e6cf"]}
                style={styles.numberCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Animated.View style={{
                  transform: [{
                    rotate: rotateAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    })
                  }]
                }}>
                  <Ionicons
                    name="sparkles"
                    size={20}
                    color="white"
                    style={styles.numberIcon}
                  />
                </Animated.View>
                
                <Animated.View style={{
                  transform: [{ scale: sparkleAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1.1],
                  })}]
                }}>
                  <ThemedText style={styles.numberValue}>
                    {profile?.expressionNumber || "?"}
                  </ThemedText>
                </Animated.View>
                
                <ThemedText style={styles.numberLabel}>✨ Expression</ThemedText>
                
                {/* Multiple sparkles */}
                {[0, 1, 2].map((index) => (
                  <Animated.View key={index} style={[
                    styles.cardSparkle,
                    {
                      right: 5 + index * 8,
                      top: 8 + index * 6,
                      opacity: sparkleAnimation.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.2, 1, 0.2],
                      }),
                      transform: [{
                        scale: sparkleAnimation.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0.5, 1.2, 0.5],
                        })
                      }]
                    }
                  ]}>
                    <Ionicons name="star" size={4 + index} color="rgba(255,255,255,0.9)" />
                  </Animated.View>
                ))}
              </LinearGradient>
            </Animated.View>
          </View>
        </Animated.View>

        {/* Famous People Section with Magical Enhancement */}
        <Animated.View style={[
          styles.cardContainer,
          {
            opacity: cardEntranceAnimations[6],
            transform: [{
              translateY: cardEntranceAnimations[6].interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              })
            }, {
              scale: cardEntranceAnimations[6].interpolate({
                inputRange: [0, 1],
                outputRange: [0.95, 1],
              })
            }]
          }
        ]}>
          <LinearGradient
            colors={["#ffd93d", "#ffcd3c", "#f39c12"]}
            style={styles.cardHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {/* Floating star elements */}
            <Animated.View style={[
              styles.floatingIcon,
              {
                right: 15,
                top: 8,
                opacity: sparkleAnimation,
                transform: [{
                  rotate: rotateAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  })
                }]
              }
            ]}>
              <Ionicons name="star" size={12} color="rgba(255,255,255,0.9)" />
            </Animated.View>
            
            <Animated.View style={[
              styles.floatingIcon,
              {
                right: 40,
                top: 15,
                opacity: sparkleAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.3],
                }),
                transform: [{
                  scale: floatingAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.1],
                  })
                }]
              }
            ]}>
              <Ionicons name="diamond" size={10} color="rgba(255,255,255,0.8)" />
            </Animated.View>

            <Animated.View style={[
              styles.iconContainer,
              {
                transform: [{ scale: pulseAnimation }]
              }
            ]}>
              <Ionicons name="star-outline" size={24} color="white" />
            </Animated.View>
            
            <View style={styles.cardHeaderText}>
              <Animated.View style={{
                transform: [{
                  translateY: floatingAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -2],
                  })
                }]
              }}>
                <ThemedText style={styles.cardTitle}>
                  🌟 Famous Life Path {profile?.lifePathNumber}s 🌟
                </ThemedText>
                <ThemedText style={styles.cardSubtitle}>
                  ✨ You share your path with these remarkable souls ✨
                </ThemedText>
              </Animated.View>
            </View>
            
            {/* Crown icon for royalty */}
            <Animated.View style={[
              styles.royalCrown,
              {
                opacity: glowAnimation,
                transform: [{ scale: glowAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1.1],
                })}]
              }
            ]}>
              <Ionicons name="ribbon" size={18} color="#FFD700" />
            </Animated.View>
          </LinearGradient>
          <View style={styles.cardContent}>
            {CelebrityNumerologyService.getRandomCelebrities(profile?.lifePathNumber || 1, 3).map((celebrity, index) => (
              <View key={index} style={styles.celebrityCard}>
                <View style={styles.celebrityHeader}>
                  <View style={styles.celebrityInfo}>
                    <ThemedText style={styles.celebrityName}>{celebrity.name}</ThemedText>
                    <ThemedText style={styles.celebrityProfession}>{celebrity.profession}</ThemedText>
                    <ThemedText style={styles.celebrityBirthDate}>Born: {celebrity.birthDate}</ThemedText>
                  </View>
                  <View style={styles.celebrityNumber}>
                    <ThemedText style={styles.celebrityNumberText}>{celebrity.lifePathNumber}</ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.celebrityAchievements}>{celebrity.achievements}</ThemedText>
                {celebrity.quote && (
                  <View style={styles.celebrityQuote}>
                    <Ionicons name="quote" size={16} color="#ffd93d" />
                    <ThemedText style={styles.celebrityQuoteText}>"{celebrity.quote}"</ThemedText>
                  </View>
                )}
              </View>
            ))}
            
            {/* Life Path Stats */}
            <View style={styles.lifePathStats}>
              <ThemedText style={styles.statsTitle}>Life Path {profile?.lifePathNumber} Insights</ThemedText>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Ionicons name="people" size={20} color="#ffd93d" />
                  <ThemedText style={styles.statNumber}>
                    {CelebrityNumerologyService.getLifePathStats(profile?.lifePathNumber || 1).totalCelebrities}+
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>Famous People</ThemedText>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="briefcase" size={20} color="#ffd93d" />
                  <ThemedText style={styles.statValue}>
                    {CelebrityNumerologyService.getLifePathStats(profile?.lifePathNumber || 1).topProfessions[0] || "Leaders"}
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>Top Field</ThemedText>
                </View>
              </View>
              
              <View style={styles.commonTraits}>
                <ThemedText style={styles.traitsTitle}>Common Traits You Share</ThemedText>
                <View style={styles.traitsContainer}>
                  {CelebrityNumerologyService.getLifePathStats(profile?.lifePathNumber || 1).commonTraits.map((trait, index) => (
                    <View key={index} style={styles.traitChip}>
                      <ThemedText style={styles.traitText}>{trait}</ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

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
                        <View key={predIndex} style={styles.predictionItem}>
                          <Ionicons name="chevron-forward" size={14} color="#6c7ce7" />
                          <HighlightedText
                            text={pred}
                            style={styles.predictionText}
                          />
                        </View>
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
                <Ionicons name="person-circle" size={24} color="white" />
              </View>
              <View style={styles.cardHeaderText}>
                <ThemedText style={styles.cardTitle}>
                  Your Character Analysis
                </ThemedText>
                <ThemedText style={styles.cardSubtitle}>
                  Deep insights into your inner nature
                </ThemedText>
              </View>
            </LinearGradient>
            <View style={styles.cardContent}>
              <View style={styles.characterAnalysisContent}>
                {(() => {
                  // Clean up the text first
                  let cleanText = characterAnalysis
                    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove **text**
                    .replace(/\*([^*]+)\*/g, '$1') // Remove *text*
                    .replace(/\*{2,}/g, '') // Remove multiple asterisks
                    .replace(/\*/g, '') // Remove any remaining single asterisks
                    .trim();

                  // Try different parsing methods
                  let sections = [];
                  
                  // Method 1: Split by numbered sections (1. 2. 3.)
                  const numberedSections = cleanText.split(/\d+\.\s*/).filter(section => section.trim());
                  if (numberedSections.length > 1) {
                    sections = numberedSections;
                  }
                  // Method 2: Split by double line breaks
                  else if (cleanText.includes('\n\n')) {
                    sections = cleanText.split('\n\n').filter(section => section.trim());
                  }
                  // Method 3: Split by common section headers
                  else if (cleanText.match(/(Core Personality|Natural Talents|Life Purpose|How Others|Areas for)/i)) {
                    sections = cleanText.split(/(?=(?:Core Personality|Natural Talents|Life Purpose|How Others|Areas for))/i).filter(section => section.trim());
                  }
                  // Method 4: Fallback - use the whole text as one section
                  else {
                    sections = [cleanText];
                  }

                  return sections.map((section, index) => {
                    const cleanSection = section.trim();
                    if (!cleanSection) return null;
                    
                    // Try to extract title and content
                    const parts = cleanSection.split(':');
                    let title = '';
                    let content = cleanSection;
                    
                    if (parts.length > 1) {
                      title = parts[0]?.trim();
                      content = parts.slice(1).join(':').trim();
                    } else {
                      // Try to extract title from first line
                      const lines = cleanSection.split('\n');
                      if (lines.length > 1 && lines[0].length < 100) {
                        title = lines[0].trim();
                        content = lines.slice(1).join('\n').trim();
                      }
                    }
                    
                    const getSectionIcon = (idx: number) => {
                      const icons = ["diamond", "star", "heart", "leaf", "bulb", "trophy"];
                      return icons[idx] || "star";
                    };
                    
                    const getSectionColor = (idx: number) => {
                      const colors = ["#a8e6cf", "#ff6b9d", "#667eea", "#ffd93d", "#4ecdc4", "#f093fb"];
                      return colors[idx] || "#a8e6cf";
                    };
                    
                    return (
                      <View key={index} style={[styles.analysisSection, { borderLeftColor: getSectionColor(index) }]}>
                        {title && (
                          <View style={styles.analysisTitleContainer}>
                            <View style={[styles.analysisIconContainer, { backgroundColor: getSectionColor(index) }]}>
                              <Ionicons 
                                name={getSectionIcon(index)} 
                                size={18} 
                                color="white" 
                              />
                            </View>
                            <ThemedText style={[styles.analysisTitle, { color: getSectionColor(index) }]}>{title}</ThemedText>
                          </View>
                        )}
                        {content && (
                          <View style={styles.analysisContentContainer}>
                            <HighlightedText 
                              text={content}
                              style={styles.analysisContent}
                            />
                          </View>
                        )}
                      </View>
                    );
                  });
                })()}
              </View>
            </View>
          </View>
        )}

        {/* Daily Insight Card */}
        {dailyInsight && (
          <View style={styles.dailyInsightContainer}>
            <LinearGradient
              colors={["#ff6b9d", "#f093fb"]}
              style={styles.dailyInsightHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="sunny" size={24} color="white" />
              </View>
              <View style={styles.cardHeaderText}>
                <ThemedText style={styles.cardTitle}>
                  Today's Cosmic Insight
                </ThemedText>
                <ThemedText style={styles.cardSubtitle}>
                  Your personal guidance for today
                </ThemedText>
              </View>
            </LinearGradient>
            <View style={styles.cardContent}>
              <HighlightedText 
                text={dailyInsight}
                style={styles.dailyInsightText}
              />
              <TouchableOpacity 
                style={styles.shareInsightButton}
                onPress={() => Share.share({
                  message: `✨ Today's Insight: ${dailyInsight}\n\nGet your personalized numerology reading at Lovelock! 🌟`,
                  title: 'My Daily Numerology Insight'
                })}
              >
                <Ionicons name="share-social" size={16} color="#6c7ce7" />
                <ThemedText style={styles.shareInsightText}>Share This Insight</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Oracle Predictions Card */}
        {oraclePredictions && (
          <View style={styles.oraclePredictionsContainer}>
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              style={styles.oraclePredictionsHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="eye" size={24} color="white" />
              </View>
              <View style={styles.cardHeaderText}>
                <ThemedText style={styles.cardTitle}>
                  Oracle's Predictions
                </ThemedText>
                <ThemedText style={styles.cardSubtitle}>
                  Your personalized future insights
                </ThemedText>
              </View>
            </LinearGradient>
            <View style={styles.cardContent}>
              <HighlightedText 
                text={oraclePredictions}
                style={styles.oraclePredictionsText}
              />
              <TouchableOpacity 
                style={styles.shareInsightButton}
                onPress={() => Share.share({
                  message: `🔮 Oracle's Predictions: ${oraclePredictions}\n\nGet your personalized numerology reading at Lovelock! 🌟`,
                  title: 'My Oracle Predictions'
                })}
              >
                <Ionicons name="share-social" size={16} color="#6c7ce7" />
                <ThemedText style={styles.shareInsightText}>Share These Predictions</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Deadly Sin Warning Card */}
        {(loadingDeadlySin || deadlySinWarning) && (
          <View style={styles.deadlySinContainer}>
          <LinearGradient
            colors={["#ff3b30", "#e74c3c"]}
            style={styles.deadlySinHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="warning" size={24} color="white" />
            </View>
            <View style={styles.cardHeaderText}>
              <ThemedText style={styles.cardTitle}>
                Spiritual Warning
              </ThemedText>
              <ThemedText style={styles.cardSubtitle}>
                Your shadow to be aware of
              </ThemedText>
            </View>
          </LinearGradient>
          <View style={styles.cardContent}>
            {loadingDeadlySin ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ff3b30" />
                <ThemedText style={styles.loadingText}>Oracle is analyzing your spiritual challenges...</ThemedText>
              </View>
            ) : deadlySinWarning ? (
              <View style={styles.deadlySinContent}>
                <View style={styles.sinBadge}>
                  <ThemedText style={styles.sinTitle}>Beware of {deadlySinWarning.sin}</ThemedText>
                </View>
                <ThemedText style={styles.sinWarning}>{deadlySinWarning.warning}</ThemedText>
                <View style={styles.consequencesBox}>
                  <ThemedText style={styles.consequencesLabel}>Potential Impact:</ThemedText>
                  <ThemedText style={styles.consequencesText}>{deadlySinWarning.consequences}</ThemedText>
                </View>
              </View>
            ) : null}
          </View>
        </View>
        )}

        {/* Near Future Predictions Card */}
        {(loadingFuturePredictions || nearFuturePredictions) && (
          <View style={styles.futurePredictionsContainer}>
          <LinearGradient
            colors={["#9b59b6", "#8e44ad"]}
            style={styles.futurePredictionsHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="telescope" size={24} color="white" />
            </View>
            <View style={styles.cardHeaderText}>
              <ThemedText style={styles.cardTitle}>
                Your Near Future
              </ThemedText>
              <ThemedText style={styles.cardSubtitle}>
                What the cosmos reveals for you
              </ThemedText>
            </View>
          </LinearGradient>
          <View style={styles.cardContent}>
            {loadingFuturePredictions ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#9b59b6" />
                <ThemedText style={styles.loadingText}>Oracle is gazing into your future...</ThemedText>
              </View>
            ) : nearFuturePredictions ? (
              <View>
                <HighlightedText 
                  text={nearFuturePredictions}
                  style={styles.futurePredictionsText}
                />
                <TouchableOpacity 
                  style={styles.shareInsightButton}
                  onPress={() => Share.share({
                    message: `🔮 My Future Predictions: ${nearFuturePredictions}\n\nGet your personalized numerology reading at Lovelock! 🌟`,
                    title: 'My Future Predictions'
                  })}
                >
                  <Ionicons name="share-social" size={16} color="#6c7ce7" />
                  <ThemedText style={styles.shareInsightText}>Share These Predictions</ThemedText>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </View>
        )}

        {/* Zodiac Sign & Daily Horoscope Section */}
        {zodiacSign && (
          <View style={styles.zodiacContainer}>
            <LinearGradient
              colors={["#f39c12", "#e67e22"]}
              style={styles.zodiacHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="star" size={24} color="white" />
              </View>
              <View style={styles.cardHeaderText}>
                <ThemedText style={styles.cardTitle}>
                  Your Zodiac Sign
                </ThemedText>
                <ThemedText style={styles.cardSubtitle}>
                  {AstrologyService.getZodiacInfo(zodiacSign)?.name} {AstrologyService.getZodiacInfo(zodiacSign)?.symbol}
                </ThemedText>
              </View>
            </LinearGradient>
            <View style={styles.cardContent}>
              {/* Zodiac Info */}
              <View style={styles.zodiacInfo}>
                <View style={styles.zodiacInfoItem}>
                  <ThemedText style={styles.zodiacLabel}>Element:</ThemedText>
                  <ThemedText style={styles.zodiacValue}>{AstrologyService.getZodiacInfo(zodiacSign)?.element}</ThemedText>
                </View>
                <View style={styles.zodiacInfoItem}>
                  <ThemedText style={styles.zodiacLabel}>Dates:</ThemedText>
                  <ThemedText style={styles.zodiacValue}>{AstrologyService.getZodiacInfo(zodiacSign)?.dates}</ThemedText>
                </View>
              </View>

              {/* Traits */}
              <View style={styles.traitsSection}>
                <ThemedText style={styles.traitsTitle}>Key Traits</ThemedText>
                <View style={styles.traitsGrid}>
                  {AstrologyService.getZodiacInfo(zodiacSign)?.traits.slice(0, 6).map((trait, index) => (
                    <View key={index} style={styles.traitChip}>
                      <ThemedText style={styles.traitText}>{trait}</ThemedText>
                    </View>
                  ))}
                </View>
              </View>

              {/* Daily Horoscope */}
              {dailyHoroscope && (
                <View style={styles.horoscopeSection}>
                  <ThemedText style={styles.horoscopeTitle}>Today&apos;s Horoscope</ThemedText>
                  <ThemedText style={styles.horoscopeText}>{dailyHoroscope}</ThemedText>
                </View>
              )}
            </View>
          </View>
        )}

        {/* AI Q&A Section */}
        <View style={styles.aiCardContainer}>
          <LinearGradient
            colors={["#6c7ce7", "#8b5cf6"]}
            style={styles.aiCardHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.aiIconContainer}>
              <Ionicons name="chatbubble-ellipses" size={26} color="white" />
            </View>
            <View style={styles.aiHeaderText}>
              <ThemedText style={styles.aiCardTitle}>
                Ask Your Personal Oracle
              </ThemedText>
              <ThemedText style={styles.aiCardSubtitle}>
                Get instant cosmic guidance tailored to you
              </ThemedText>
            </View>
          </LinearGradient>

          <View style={styles.aiCardContent}>
            <View style={styles.aiQuestionSuggestions}>
              <ThemedText style={styles.suggestionsTitle}>
                Try asking about:
              </ThemedText>
              <View style={styles.suggestionChips}>
                <TouchableOpacity 
                  style={styles.suggestionChip}
                  onPress={() => setQuestion("What does my future hold in love?")}
                >
                  <ThemedText style={styles.suggestionChipText}>Love & Romance</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.suggestionChip}
                  onPress={() => setQuestion("What career path aligns with my numbers?")}
                >
                  <ThemedText style={styles.suggestionChipText}>Career Path</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.suggestionChip}
                  onPress={() => setQuestion("What challenges should I prepare for?")}
                >
                  <ThemedText style={styles.suggestionChipText}>Life Challenges</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.aiQuestionInputContainer}>
              <TextInput
                style={styles.aiQuestionInput}
                placeholder="What would you like to know about your future?"
                placeholderTextColor="#888"
                value={question}
                onChangeText={setQuestion}
                multiline
                maxLength={200}
              />
              <TouchableOpacity
                style={[
                  styles.aiAskButton,
                  (!question.trim() || isLoading) && styles.aiAskButtonDisabled,
                ]}
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
                  <HighlightedText 
                    text={aiResponse}
                    style={styles.aiResponseText}
                  />
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </Animated.ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9ff",
    position: 'relative',
  },
  // New animated background styles
  animatedBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    opacity: 0.8,
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    pointerEvents: 'none',
    zIndex: 0,
  },
  particle: {
    position: 'absolute',
    zIndex: 1,
  },
  // Header enhancements
  headerSparkle: {
    position: 'absolute',
    zIndex: 2,
  },
  magicOrb: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,215,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  // Card enhancements
  floatingIcon: {
    position: 'absolute',
    zIndex: 2,
  },
  glowEffect: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.3)',
    top: -5,
    left: -5,
  },
  magicBadge: {
    position: 'absolute',
    right: 15,
    top: '50%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,215,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  magicBadgeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  // Number card enhancements
  cardSparkle: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  mysticalElement: {
    position: 'absolute',
  },
  royalCrown: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -9 }],
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 15,
  },
  backButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  titleContainer: {
    flex: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
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
    paddingBottom: 40,
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
    marginLeft: 8,
    flex: 1,
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
  // New styles for enhanced features
  highlightedWord: {
    backgroundColor: "rgba(108, 124, 231, 0.15)",
    borderRadius: 4,
    paddingHorizontal: 3,
    paddingVertical: 1,
    fontWeight: "600",
    color: "#6c7ce7",
  },
  traitsContainer: {
    marginTop: 15,
  },
  traitSection: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    padding: 12,
    borderRadius: 10,
  },
  traitLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
    marginRight: 8,
  },
  traitText: {
    fontSize: 14,
    color: "#555",
    flex: 1,
    lineHeight: 18,
  },
  predictionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  bottomSpacing: {
    height: 150,
    backgroundColor: "transparent",
  },
  // Usage Counter Styles
  usageContainer: {
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FFD700",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  urgentUsageContainer: {
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderLeftColor: "#FF3B30",
  },
  usageInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  usageText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFD700",
    marginLeft: 8,
  },
  urgentUsageText: {
    color: "#FF3B30",
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#667eea",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 12,
  },
  upgradeButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 4,
  },
  premiumBadgeContainer: {
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 8,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.4)",
  },
  premiumText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFD700",
    marginLeft: 6,
  },
  // Enhanced AI Section Styles
  aiCardContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    marginBottom: 24,
    marginHorizontal: 4,
    shadowColor: "#6c7ce7",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  aiCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  aiIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  aiHeaderText: {
    flex: 1,
  },
  aiCardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  aiCardSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 18,
  },
  aiCardContent: {
    padding: 20,
  },
  aiQuestionSuggestions: {
    marginBottom: 20,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  suggestionChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: "rgba(108, 124, 231, 0.1)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(108, 124, 231, 0.2)",
  },
  suggestionChipText: {
    fontSize: 13,
    color: "#6c7ce7",
    fontWeight: "500",
  },
  aiQuestionInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#f8f9ff",
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: "rgba(108, 124, 231, 0.2)",
  },
  aiQuestionInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    padding: 16,
    maxHeight: 100,
    minHeight: 48,
  },
  aiAskButton: {
    backgroundColor: "#6c7ce7",
    borderRadius: 12,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    margin: 4,
  },
  aiAskButtonDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
  // Daily Insight Styles
  dailyInsightContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#ff6b9d",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    overflow: "hidden",
  },
  dailyInsightHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  dailyInsightText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    marginBottom: 16,
    fontStyle: "italic",
  },
  shareInsightButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(108, 124, 231, 0.1)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(108, 124, 231, 0.2)",
  },
  shareInsightText: {
    fontSize: 14,
    color: "#6c7ce7",
    fontWeight: "600",
    marginLeft: 6,
  },
  
  // Zodiac section styles
  zodiacContainer: {
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 20,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    overflow: "hidden",
  },
  zodiacHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  zodiacInfo: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(243, 156, 18, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  zodiacInfoItem: {
    alignItems: "center",
  },
  zodiacLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  zodiacValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2d1b69",
  },
  traitsSection: {
    marginBottom: 16,
  },
  traitsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2d1b69",
    marginBottom: 12,
  },
  traitsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  traitChip: {
    backgroundColor: "#f39c12",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  traitText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  horoscopeSection: {
    backgroundColor: "rgba(243, 156, 18, 0.1)",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#f39c12",
  },
  horoscopeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2d1b69",
    marginBottom: 8,
  },
  horoscopeText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    fontStyle: "italic",
  },
  
  // Celebrity section styles
  celebrityCard: {
    backgroundColor: "rgba(255, 217, 61, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#ffd93d",
  },
  celebrityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  celebrityInfo: {
    flex: 1,
  },
  celebrityName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2d1b69",
    marginBottom: 4,
  },
  celebrityProfession: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  celebrityBirthDate: {
    fontSize: 12,
    color: "#888",
  },
  celebrityNumber: {
    backgroundColor: "#ffd93d",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  celebrityNumberText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  celebrityAchievements: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginBottom: 12,
  },
  celebrityQuote: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255, 217, 61, 0.15)",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  celebrityQuoteText: {
    fontSize: 13,
    color: "#333",
    fontStyle: "italic",
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  lifePathStats: {
    backgroundColor: "rgba(255, 217, 61, 0.05)",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2d1b69",
    marginBottom: 16,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2d1b69",
    marginTop: 8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2d1b69",
    marginTop: 8,
    marginBottom: 4,
    textAlign: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  commonTraits: {
    marginTop: 8,
  },
  // Oracle Predictions Styles
  oraclePredictionsContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    overflow: "hidden",
  },
  oraclePredictionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  oraclePredictionsText: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
  },
  
  // Deadly Sin Warning Styles
  deadlySinContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#ff3b30",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    overflow: "hidden",
  },
  deadlySinHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  deadlySinContent: {
    alignItems: "center",
  },
  sinBadge: {
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#ff3b30",
  },
  sinTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff3b30",
    textAlign: "center",
  },
  sinWarning: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  consequencesBox: {
    backgroundColor: "rgba(255, 59, 48, 0.05)",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#ff3b30",
    width: "100%",
  },
  consequencesLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ff3b30",
    marginBottom: 8,
  },
  consequencesText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  
  // Future Predictions Styles
  futurePredictionsContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#9b59b6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    overflow: "hidden",
  },
  futurePredictionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  futurePredictionsText: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
    marginBottom: 16,
  },
  
  // Loading Styles
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 16,
    fontStyle: "italic",
  },
  
  // Enhanced Character Analysis Styles
  characterAnalysisContent: {
    gap: 20,
  },
  analysisSection: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  analysisTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  analysisIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  analysisContentContainer: {
    paddingLeft: 4,
  },
  analysisContent: {
    fontSize: 16,
    color: "#444",
    lineHeight: 24,
    letterSpacing: 0.3,
  },
});
