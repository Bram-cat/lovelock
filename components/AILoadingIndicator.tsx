import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface AILoadingIndicatorProps {
  /** Current retry attempt */
  retryAttempt?: number;
  /** Maximum retry attempts */
  maxRetries?: number;
  /** Estimated time remaining in ms */
  estimatedTime?: number;
  /** Custom loading message */
  message?: string;
  /** Show educational content */
  showEducationalContent?: boolean;
  /** Type of AI analysis being performed */
  analysisType?: 'numerology' | 'love-match' | 'trust-assessment' | 'general';
  /** Current AI provider being used */
  aiProvider?: 'gemini' | 'openai' | 'fallback';
}

const educationalContent = {
  numerology: [
    "✨ Did you know? Your Life Path Number reveals your soul's journey and purpose.",
    "🔮 Numerology has been practiced for over 2,500 years, dating back to ancient civilizations.",
    "💫 Each number from 1-9 carries unique vibrations and characteristics.",
    "🌟 Master Numbers (11, 22, 33) are considered especially powerful in numerology.",
    "🧮 Your Destiny Number shows your life's mission and what you're meant to achieve.",
  ],
  'love-match': [
    "💕 Love compatibility goes beyond sun signs - numbers reveal deeper connections.",
    "💝 Numerology can predict relationship challenges and strengths.",
    "💖 Life Path compatibility shows how well two souls align on their journeys.",
    "💘 Some number combinations create natural harmony, while others bring growth challenges.",
    "💓 Your Soul Urge Number reveals what you truly desire in love.",
  ],
  'trust-assessment': [
    "🛡️ Trust is built through consistent actions and emotional safety.",
    "🔐 Numerology can reveal potential trust patterns in relationships.",
    "🤝 Understanding personality numbers helps predict trustworthiness.",
    "💎 Trust assessments consider both logical and intuitive factors.",
    "🌈 Every relationship has unique trust dynamics based on individual numbers.",
  ],
  general: [
    "🤖 Our AI analyzes thousands of numerological patterns to create your reading.",
    "⚡ Advanced algorithms combine traditional numerology with modern insights.",
    "🎯 Each response is personalized based on your unique number combination.",
    "🌟 AI-powered readings provide deeper insights than static interpretations.",
    "🔄 Sometimes the universe needs a moment to align the perfect response.",
  ]
};

export const AILoadingIndicator: React.FC<AILoadingIndicatorProps> = ({
  retryAttempt = 0,
  maxRetries = 4,
  estimatedTime = 5000,
  message,
  showEducationalContent = true,
  analysisType = 'general',
  aiProvider = 'gemini'
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const [currentTip, setCurrentTip] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const tips = educationalContent[analysisType] || educationalContent.general;

  useEffect(() => {
    // Pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    // Rotation animation
    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );

    // Shimmer animation for shadow effect
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Float animation
    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    rotate.start();
    shimmer.start();
    float.start();

    return () => {
      pulse.stop();
      rotate.stop();
      shimmer.stop();
      float.stop();
    };
  }, []);

  useEffect(() => {
    if (!showEducationalContent) return;

    // Rotate tips every 4 seconds
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 4000);

    // Track time elapsed
    const timeInterval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1000);
    }, 1000);

    return () => {
      clearInterval(tipInterval);
      clearInterval(timeInterval);
    };
  }, [tips.length, showEducationalContent]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const floatTranslate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const getStatusMessage = () => {
    if (message) return message;
    
    const providerName = aiProvider === 'openai' ? 'Oracle' : 
                        aiProvider === 'fallback' ? 'backup AI' : 'Oracle';
    
    if (retryAttempt > 0) {
      return `Reconnecting with ${providerName}... (${retryAttempt}/${maxRetries})`;
    }
    
    if (timeElapsed > 10000) {
      return "The universe is aligning your perfect response...";
    }
    
    return `${providerName} is analyzing your cosmic blueprint...`;
  };

  const getEstimatedTimeDisplay = () => {
    if (retryAttempt > 0) {
      // Exponential backoff calculation
      const retryDelay = Math.round((2000 * Math.pow(2, retryAttempt - 1) + Math.random() * 1000) / 1000);
      return `~${retryDelay}s remaining`;
    }
    
    const remainingTime = Math.max(0, Math.round((estimatedTime - timeElapsed) / 1000));
    return remainingTime > 0 ? `~${remainingTime}s remaining` : "Almost ready...";
  };

  return (
    <View style={styles.container}>
      {/* Main loading indicator with shadow effect */}
      <View style={styles.loadingSection}>
        <Animated.View 
          style={[
            styles.shadowContainer,
            { 
              opacity: shimmerOpacity,
              transform: [{ translateY: floatTranslate }]
            }
          ]}
        >
          <LinearGradient
            colors={['rgba(64, 224, 208, 0.1)', 'rgba(147, 112, 219, 0.2)', 'rgba(255, 105, 180, 0.1)']}
            style={styles.shadowGradient}
          />
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.iconContainer, 
            { 
              transform: [
                { scale: pulseAnim },
                { rotate: rotateInterpolate },
                { translateY: floatAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -5]
                })}
              ]
            }
          ]}
        >
          <LinearGradient
            colors={['#FF6B9D', '#9575CD', '#40E0D0']}
            style={styles.iconGradient}
          >
            <Ionicons name="sparkles" size={32} color="#FFFFFF" />
          </LinearGradient>
        </Animated.View>
        
        <Text style={styles.statusText}>{getStatusMessage()}</Text>
        <Text style={styles.timeText}>{getEstimatedTimeDisplay()}</Text>
        
        {/* Provider indicator */}
        <View style={styles.providerBadge}>
          <Text style={styles.providerText}>
            {aiProvider === 'openai' ? '🔮 Oracle' : 
             aiProvider === 'fallback' ? '🔄 Backup AI' : '🔮 Oracle'}
          </Text>
        </View>
        
        {retryAttempt > 0 && (
          <View style={styles.retryIndicator}>
            <Text style={styles.retryText}>
              🔄 Gemini API rate limited, retrying... (attempt {retryAttempt}/{maxRetries})
            </Text>
          </View>
        )}
      </View>

      {/* Educational content section */}
      {showEducationalContent && (
        <Animated.View 
          style={[
            styles.educationSection,
            { 
              opacity: shimmerOpacity,
              transform: [{ translateY: floatTranslate }]
            }
          ]}
        >
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.1)']}
            style={styles.educationCard}
          >
            <Animated.Text 
              key={currentTip}
              style={[
                styles.tipText,
                { 
                  opacity: shimmerAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.7, 1, 0.7]
                  })
                }
              ]}
            >
              {tips[currentTip]}
            </Animated.Text>
            
            {/* Tip indicators */}
            <View style={styles.tipIndicators}>
              {tips.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    currentTip === index && styles.activeIndicator
                  ]}
                />
              ))}
            </View>
          </LinearGradient>
        </Animated.View>
      )}

      {/* Shimmer skeleton for content placeholder */}
      <View style={styles.contentPlaceholder}>
        <Text style={styles.placeholderTitle}>Your AI Response Will Appear Here</Text>
        <View style={styles.skeletonLines}>
          {[...Array(4)].map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.skeletonLine,
                { 
                  opacity: shimmerOpacity,
                  width: index === 3 ? '60%' : '100%'
                }
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    gap: 24,
  },
  loadingSection: {
    alignItems: 'center',
    gap: 12,
    position: 'relative',
  },
  shadowContainer: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    top: -10,
  },
  shadowGradient: {
    flex: 1,
    borderRadius: 60,
  },
  iconContainer: {
    zIndex: 1,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9575CD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 8,
  },
  timeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  providerBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  providerText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  retryIndicator: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
  },
  retryText: {
    color: '#FFC107',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  educationSection: {
    width: '100%',
    maxWidth: 350,
  },
  educationCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tipText: {
    fontSize: 15,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  tipIndicators: {
    flexDirection: 'row',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    width: 20,
  },
  contentPlaceholder: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  placeholderTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
    textAlign: 'center',
  },
  skeletonLines: {
    width: '100%',
    gap: 12,
  },
  skeletonLine: {
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
});

export default AILoadingIndicator;