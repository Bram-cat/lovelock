import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  Modal
} from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useProfile } from '../../contexts/ProfileContext';
import { DesignSystem, gradients } from '../../constants/DesignSystem';
import Card from '../../components/ui/Card';
import GlassCard from '../../components/ui/GlassCard';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ShadcnLoading from '../../components/ui/ShadcnLoading';
import { DailyAffirmationService, DailyAffirmation } from '../../services/DailyAffirmationService';
import { DailyInsightsService, DailyInsight } from '../../services/DailyInsightsService';
import SimpleAIService from '../../services/SimpleAIService';
import PremiumSubscriptionCard from '../../components/PremiumSubscriptionCard';
import { SubscriptionService } from '../../services/SubscriptionService';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const { user } = useUser();
  const { profileData, loading: profileLoading } = useProfile();
  const router = useRouter();
  const [heartAnimation] = useState(new Animated.Value(1));
  const [sparkleAnimation] = useState(new Animated.Value(0));
  const [todaysAffirmation, setTodaysAffirmation] = useState<DailyAffirmation | null>(null);
  const [dailyInsight, setDailyInsight] = useState<DailyInsight | null>(null);
  const [showDailyVibe, setShowDailyVibe] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiInsights, setAIInsights] = useState<string | null>(null);
  const [loadingAIInsights, setLoadingAIInsights] = useState(false);
  const [pulseAnimation] = useState(new Animated.Value(1));
  const [floatingAnimation] = useState(new Animated.Value(0));
  const scrollY = useRef(new Animated.Value(0)).current;
  const [currentQuote, setCurrentQuote] = useState(0);
  const [homeLoading, setHomeLoading] = useState(true);
  const [usageStats, setUsageStats] = useState<any>(null);
  const { showAlert, AlertComponent } = useCustomAlert();
  
  const sevenDeadlySinsQuotes = [
    {
      text: "Pride goes before destruction, and a haughty spirit before a fall.",
      author: "Proverbs 16:18",
      icon: "star"
    },
    {
      text: "Greed is a bottomless pit which exhausts the person in an endless effort to satisfy without satisfaction.",
      author: "Erich Fromm",
      icon: "diamond"
    },
    {
      text: "Anger is an acid that can do more harm to the vessel in which it is stored than to anything on which it is poured.",
      author: "Mark Twain",
      icon: "flame"
    },
    {
      text: "Envy is the art of counting the other fellow's blessings instead of your own.",
      author: "Harold Coffin",
      icon: "eye"
    },
    {
      text: "Gluttony is not a secret vice; it is a sign of moral laziness.",
      author: "Saint Thomas Aquinas",
      icon: "restaurant"
    },
    {
      text: "Lust is the source of all our actions, and humanity.",
      author: "Marquis de Sade",
      icon: "heart-dislike"
    },
    {
      text: "Sloth, like rust, consumes faster than labor wears, while the used key is always bright.",
      author: "Benjamin Franklin",
      icon: "bed"
    }
  ];

  useEffect(() => {
    // Simulate initial loading
    const loadingTimer = setTimeout(() => {
      setHomeLoading(false);
    }, 2000);

    // Load today's affirmation
    setTodaysAffirmation(DailyAffirmationService.getTodaysAffirmation());
    
    // Load daily insights if user has profile data
    const loadDailyInsights = async () => {
      if (profileData?.full_name && profileData?.birth_date) {
        try {
          const insights = await DailyInsightsService.getDailyInsights(
            profileData.full_name,
            profileData.birth_date
          );
          setDailyInsight(insights);
        } catch (error) {
          console.error('Failed to load daily insights:', error);
        }
      }
    };
    
    loadDailyInsights();

    return () => clearTimeout(loadingTimer);
  }, [profileData]);

  // Load usage statistics for premium card
  useEffect(() => {
    const loadUsageStats = async () => {
      if (user?.id) {
        const stats = await SubscriptionService.getUsageStats(user.id);
        if (stats) {
          const daysUntilReset = Math.ceil((new Date(stats.numerology.resetsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          setUsageStats({
            numerologyRemaining: stats.numerology.remaining,
            loveMatchRemaining: stats.loveMatch.remaining,
            trustAssessmentRemaining: stats.trustAssessment.remaining,
            daysUntilReset: Math.max(0, daysUntilReset),
            isPremium: stats.isPremium
          });
        }
      }
    };

    loadUsageStats();
  }, [user?.id]);

  useEffect(() => {
    // Animated heart beating effect
    const heartBeat = Animated.loop(
      Animated.sequence([
        Animated.timing(heartAnimation, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(heartAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    
    // Sparkle animation
    const sparkle = Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Pulse animation for action cards
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

    heartBeat.start();
    sparkle.start();
    pulse.start();
    floating.start();

    // Rotate quotes every 5 seconds
    const quoteInterval = setInterval(() => {
      setCurrentQuote(prev => (prev + 1) % sevenDeadlySinsQuotes.length);
    }, 5000);

    return () => {
      heartBeat.stop();
      sparkle.stop();
      pulse.stop();
      floating.stop();
      clearInterval(quoteInterval);
    };
  }, []);

  const navigateToTab = (tabName: string) => {
    router.push(`/(tabs)/${tabName}`);
  };

  const getGreetingMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const userName = profileData?.full_name?.split(' ')[0] || user?.firstName || user?.fullName?.split(' ')[0] || 'Beautiful Soul';
  const hasProfile = profileData?.birth_date;

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, -100],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const handlePremiumUpgrade = async () => {
    if (!user?.id) {
      showAlert({
        title: 'Authentication Required',
        message: 'Please sign in to upgrade to Premium.',
        type: 'warning'
      });
      return;
    }

    try {
      console.log('💳 Initiating premium upgrade for user:', user.id);
      const result = await SubscriptionService.purchasePremiumSubscription(
        user.id, 
        user.primaryEmailAddress?.emailAddress || ''
      );
      
      if (result.success) {
        showAlert({
          title: '🎉 Welcome to Premium!',
          message: 'Your premium subscription is now active! Enjoy unlimited access to all features.',
          type: 'success',
          buttons: [
            { 
              text: 'Explore Features', 
              style: 'primary',
              onPress: () => {
                // Refresh usage stats
                loadUsageStats();
              }
            }
          ]
        });
      } else {
        showAlert({
          title: 'Payment Error',
          message: result.error || 'Unable to process payment. Please try again.',
          type: 'error',
          buttons: [
            { text: 'Try Again', style: 'primary', onPress: handlePremiumUpgrade },
            { text: 'Cancel', style: 'cancel' }
          ]
        });
      }
    } catch (error) {
      console.error('💥 Premium upgrade error:', error);
      showAlert({
        title: 'Upgrade Failed',
        message: 'Something went wrong during the upgrade. Please check your connection and try again.',
        type: 'error',
        buttons: [
          { text: 'Retry', style: 'primary', onPress: handlePremiumUpgrade },
          { text: 'Cancel', style: 'cancel' }
        ]
      });
    }
  };

  const handlePremiumFeatureRedirect = (featureName: string) => {
    showAlert({
      title: '🌟 Premium Feature',
      message: `${featureName} is exclusively available for Premium members!\n\n🚀 Unlock Premium Benefits:\n\n✨ Unlimited daily insights\n🤖 Advanced AI analysis\n📊 Detailed compatibility reports\n🔮 Exclusive numerology features\n💰 Just $4.99/month`,
      type: 'info',
      icon: 'diamond',
      iconColor: '#FFD700',
      buttons: [
        { text: 'Maybe Later', style: 'cancel' },
        { 
          text: 'Upgrade Now ($4.99/month)', 
          style: 'primary',
          onPress: handlePremiumUpgrade
        }
      ]
    });
  };

  const generateAIInsights = async () => {
    if (!profileData?.full_name || !profileData?.birth_date) {
      return;
    }

    setLoadingAIInsights(true);
    try {
      const currentDate = new Date().toDateString();
      const prompt = `Generate personalized AI insights for ${profileData.full_name} born on ${profileData.birth_date}.

Current date: ${currentDate}

Provide a comprehensive, personalized analysis that includes:

1. **Personality Overview**: Deep insights into their core personality traits based on their numerological profile
2. **Current Life Phase**: What phase of life they're in and what it means for their growth
3. **Opportunities & Challenges**: Specific opportunities to focus on and challenges to be aware of
4. **Relationship Dynamics**: How they connect with others and what they bring to relationships
5. **Career & Life Purpose**: Their natural talents and potential career paths that align with their purpose
6. **Personal Growth Areas**: Specific areas for development and self-improvement
7. **Spiritual Journey**: Their connection to spirituality and inner wisdom

Make it:
- Highly personalized and specific to their birth date and name
- Encouraging yet realistic
- Actionable with concrete insights
- Written in a warm, supportive tone
- Include specific recommendations for their current life situation

Format with clear sections and use emojis to make it visually appealing.`;

      const result = await SimpleAIService.generateResponse(prompt, 'numerology');
      setAIInsights(result.content);
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
      setAIInsights('Unable to generate insights at this time. Please try again later.');
    } finally {
      setLoadingAIInsights(false);
    }
  };

  // Show loading screen initially
  if (homeLoading || profileLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={styles.loadingContainer}>
          <ShadcnLoading 
            size="lg" 
            variant="pulse" 
            text="Welcome to Lovelock..."
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Animated.ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Section */}
        <Animated.View
          style={[
            styles.heroSection,
            {
              transform: [{ translateY: headerTranslateY }],
              opacity: headerOpacity
            }
          ]}
        >
          <LinearGradient
            {...gradients.cosmic}
            style={styles.heroGradient}
          >
            <View style={styles.sparkleContainer}>
              <Animated.View 
                style={[
                  styles.sparkle, 
                  { 
                    opacity: sparkleAnimation, 
                    top: 50, 
                    left: 50,
                    transform: [{ rotate: floatingAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg']
                    })}]
                  }
                ]}
              >
                <Ionicons name="sparkles" size={16} color="#FFD700" />
              </Animated.View>
              <Animated.View 
                style={[
                  styles.sparkle, 
                  { 
                    opacity: sparkleAnimation, 
                    top: 100, 
                    right: 40,
                    transform: [{ translateY: floatingAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -10]
                    })}]
                  }
                ]}
              >
                <Ionicons name="star" size={12} color="#E91E63" />
              </Animated.View>
              <Animated.View 
                style={[
                  styles.sparkle, 
                  { 
                    opacity: sparkleAnimation, 
                    bottom: 80, 
                    left: 30,
                    transform: [{ translateX: floatingAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 15]
                    })}]
                  }
                ]}
              >
                <Ionicons name="diamond" size={14} color="#34C759" />
              </Animated.View>
              <Animated.View 
                style={[
                  styles.sparkle, 
                  { 
                    opacity: sparkleAnimation, 
                    top: 200, 
                    right: 80,
                    transform: [{ scale: floatingAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1.2]
                    })}]
                  }
                ]}
              >
                <Ionicons name="flash" size={10} color="#00D4FF" />
              </Animated.View>
            </View>
            
            <Animated.View 
              style={[styles.heartContainer, { transform: [{ scale: heartAnimation }] }]}
            >
              <LinearGradient
                colors={['#FF6B9D', '#E91E63', '#C2185B']}
                style={styles.heartGradient}
              >
                <Ionicons name="heart" size={64} color="#FFFFFF" />
              </LinearGradient>
            </Animated.View>
            
            <Animated.Text 
              style={[
                styles.welcomeText,
                { transform: [{ translateY: floatingAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -5]
                })}]}
              ]}
            >
              {getGreetingMessage()},
            </Animated.Text>
            <Animated.Text 
              style={[
                styles.nameText,
                usageStats?.isPremium && styles.premiumNameText,
                { transform: [{ scale: pulseAnimation }] }
              ]}
            >
              {userName}
              {usageStats?.isPremium && (
                <Text style={styles.premiumIcon}> ✨</Text>
              )}
            </Animated.Text>
            
            <Text style={styles.tagline}>
              Your cosmic journey to love and self-discovery awaits
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Bento Box Quick Insights */}
        <View style={styles.bentoContainer}>
          <Animated.Text 
            style={[
              styles.sectionTitle,
              { transform: [{ scale: pulseAnimation }] }
            ]}
          >
            Quick Insights
          </Animated.Text>
          
          <View style={styles.bentoGrid}>
            {/* Large Primary Card - Numerology */}
            <Animated.View
              style={[
                styles.bentoPrimary,
                {
                  transform: [{ translateY: floatingAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -2]
                  })}]
                }
              ]}
            >
              <TouchableOpacity 
                style={styles.bentoCard}
                onPress={() => navigateToTab('numerology')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.bentoGradient}
                >
                  <View style={styles.bentoHeader}>
                    <Animated.View
                      style={{
                        transform: [{ rotate: sparkleAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '15deg']
                        })}]
                      }}
                    >
                      <Ionicons name="calculator" size={32} color="#FFFFFF" />
                    </Animated.View>
                    <View style={styles.bentoIndicator}>
                      <Ionicons name="arrow-forward-circle" size={20} color="rgba(255,255,255,0.9)" />
                    </View>
                  </View>
                  <View style={styles.bentoContent}>
                    <Text style={styles.bentoTitle}>Numerology Reading</Text>
                    <Text style={styles.bentoDescription}>
                      Discover your life path, destiny, and soul urge numbers
                    </Text>
                  </View>
                  <View style={styles.bentoFooter}>
                    <View style={styles.bentoTag}>
                      <Ionicons name="star" size={12} color="#FFD700" />
                      <Text style={styles.bentoTagText}>Most Popular</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Secondary Cards Row */}
            <View style={styles.bentoSecondaryRow}>
              {/* Love Match Card */}
              <Animated.View
                style={[
                  styles.bentoSecondary,
                  {
                    transform: [{ translateY: floatingAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 2]
                    })}]
                  }
                ]}
              >
                <TouchableOpacity 
                  style={styles.bentoCard}
                  onPress={() => navigateToTab('love-match')}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#f093fb', '#f5576c']}
                    style={styles.bentoGradient}
                  >
                    <View style={styles.bentoHeader}>
                      <Animated.View
                        style={{
                          transform: [{ scale: heartAnimation }]
                        }}
                      >
                        <Ionicons name="heart" size={24} color="#FFFFFF" />
                      </Animated.View>
                      <View style={styles.bentoIndicator}>
                        <Ionicons name="arrow-forward-circle" size={16} color="rgba(255,255,255,0.9)" />
                      </View>
                    </View>
                    <Text style={styles.bentoSecondaryTitle}>Love Match</Text>
                    <Text style={styles.bentoSecondarySubtitle}>Find compatibility</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* Trust Assessment Card */}
              <Animated.View
                style={[
                  styles.bentoSecondary,
                  {
                    transform: [{ translateY: floatingAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -1]
                    })}]
                  }
                ]}
              >
                <TouchableOpacity 
                  style={styles.bentoCard}
                  onPress={() => navigateToTab('trust-assessment')}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#4facfe', '#00f2fe']}
                    style={styles.bentoGradient}
                  >
                    <View style={styles.bentoHeader}>
                      <Animated.View
                        style={{
                          transform: [{ rotate: pulseAnimation.interpolate({
                            inputRange: [1, 1.05],
                            outputRange: ['0deg', '5deg']
                          })}]
                        }}
                      >
                        <Ionicons name="shield" size={24} color="#FFFFFF" />
                      </Animated.View>
                      <View style={styles.bentoIndicator}>
                        <Ionicons name="arrow-forward-circle" size={16} color="rgba(255,255,255,0.9)" />
                      </View>
                    </View>
                    <Text style={styles.bentoSecondaryTitle}>Trust Assessment</Text>
                    <Text style={styles.bentoSecondarySubtitle}>Analyze trust</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Tertiary Cards Row */}
            <View style={styles.bentoTertiaryRow}>
              {/* Profile Card */}
              <Animated.View
                style={[
                  styles.bentoTertiary,
                  {
                    transform: [{ translateY: floatingAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1]
                    })}]
                  }
                ]}
              >
                <TouchableOpacity 
                  style={styles.bentoCard}
                  onPress={() => navigateToTab('profile')}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#43e97b', '#38f9d7']}
                    style={styles.bentoGradient}
                  >
                    <Animated.View
                      style={{
                        transform: [{ scale: sparkleAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.1]
                        })}]
                      }}
                    >
                      <Ionicons name="person" size={20} color="#FFFFFF" />
                    </Animated.View>
                    <Text style={styles.bentoTertiaryTitle}>Profile</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* Daily Affirmation Card */}
              <Animated.View
                style={[
                  styles.bentoTertiary,
                  {
                    transform: [{ translateY: floatingAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -1]
                    })}]
                  }
                ]}
              >
                <TouchableOpacity 
                  style={styles.bentoCard}
                  activeOpacity={0.8}
                  onPress={() => setShowDailyVibe(true)}
                >
                  <LinearGradient
                    colors={['#a8edea', '#fed6e3']}
                    style={styles.bentoGradient}
                  >
                    <Ionicons name="sunny" size={20} color="#FFFFFF" />
                    <Text style={styles.bentoTertiaryTitle}>Daily Vibe</Text>
                    {dailyInsight && (
                      <Text style={styles.bentoSubtitle}>{dailyInsight.overallTheme}</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* AI Insights Card */}
              <Animated.View
                style={[
                  styles.bentoTertiary,
                  {
                    transform: [{ translateY: floatingAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.5]
                    })}]
                  }
                ]}
              >
                <TouchableOpacity 
                  style={styles.bentoCard}
                  activeOpacity={0.8}
                  onPress={() => setShowAIInsights(true)}
                >
                  <LinearGradient
                    colors={['#ffecd2', '#fcb69f']}
                    style={styles.bentoGradient}
                  >
                    <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                    <Text style={styles.bentoTertiaryTitle}>AI Insights</Text>
                    <Text style={styles.bentoSubtitle}>Personalized Analysis</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </View>

        {/* Premium Subscription Card - Only show for non-premium users */}
        {!usageStats?.isPremium && (
          <PremiumSubscriptionCard 
            onUpgradePress={handlePremiumUpgrade}
            usageStats={usageStats}
          />
        )}

        {/* Profile Status */}
        <View style={styles.profileStatus}>
          <Text style={styles.sectionTitle}>Your Cosmic Profile</Text>
          
          <TouchableOpacity 
            onPress={() => navigateToTab('profile')}
            activeOpacity={0.8}
          >
            {hasProfile ? (
              <Card variant="gradient" gradientType="primary" style={styles.profileCard}>
                <View style={styles.profileCardContent}>
                  <Ionicons 
                    name="checkmark-circle" 
                    size={24} 
                    color={DesignSystem.colors.semantic.success} 
                  />
                  <View style={styles.profileTextContainer}>
                    <Text style={styles.profileCardTitle}>
                      Profile Complete
                    </Text>
                    <Text style={styles.profileCardSubtitle}>
                      Birth Date: {(() => {
                        try {
                          if (profileData?.birth_date) {
                            // Handle YYYY-MM-DD format from database
                            if (profileData.birth_date.includes('-') && profileData.birth_date.length === 10) {
                              const [year, month, day] = profileData.birth_date.split('-');
                              if (year && month && day) {
                                return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
                              }
                            }
                            
                            // Fallback to Date parsing for other formats
                            const date = new Date(profileData.birth_date);
                            if (!isNaN(date.getTime())) {
                              return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
                            }
                          }
                          return 'Not set';
                        } catch (error) {
                          return profileData?.birth_date || 'Not set';
                        }
                      })()}
                    </Text>
                  </View>
                  <Badge variant="success" size="sm">
                    Complete
                  </Badge>
                </View>
              </Card>
            ) : (
              <GlassCard intensity="medium" style={styles.profileCard}>
                <View style={styles.profileCardContent}>
                  <Ionicons 
                    name="information-circle-outline" 
                    size={24} 
                    color={DesignSystem.colors.semantic.warning} 
                  />
                  <View style={styles.profileTextContainer}>
                    <Text style={styles.profileCardTitle}>
                      Complete Your Profile
                    </Text>
                    <Text style={styles.profileCardSubtitle}>
                      Add your birth details for accurate readings
                    </Text>
                  </View>
                  <Badge variant="warning" size="sm">
                    Incomplete
                  </Badge>
                </View>
              </GlassCard>
            )}
          </TouchableOpacity>
        </View>

        {/* Daily Inspiration */}
        <View style={styles.inspirationSection}>
          <Text style={styles.sectionTitle}>Cosmic Wisdom</Text>
          
          <Animated.View
            style={[
              { transform: [{ translateY: floatingAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -5]
              })}]}
            ]}
          >
            <GlassCard intensity="strong" tint="cosmic" style={styles.inspirationCard}>
              <Animated.View
                style={{
                  transform: [{ rotate: sparkleAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '10deg']
                  })}]
                }}
              >
                <Ionicons 
                  name={sevenDeadlySinsQuotes[currentQuote].icon as any} 
                  size={24} 
                  color="#FFFFFF" 
                  style={styles.inspirationIcon} 
                />
              </Animated.View>
              <Animated.Text 
                key={currentQuote}
                style={[
                  styles.inspirationText,
                  { opacity: sparkleAnimation }
                ]}
              >
                "{sevenDeadlySinsQuotes[currentQuote].text}"
              </Animated.Text>
              <Text style={styles.inspirationAuthor}>- {sevenDeadlySinsQuotes[currentQuote].author}</Text>
              
              {/* Quote indicators */}
              <View style={styles.quoteIndicators}>
                {sevenDeadlySinsQuotes.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.indicator,
                      currentQuote === index && styles.activeIndicator
                    ]}
                    onPress={() => setCurrentQuote(index)}
                  />
                ))}
              </View>
            </GlassCard>
          </Animated.View>
        </View>

        <View style={styles.bottomPadding} />
      </Animated.ScrollView>

      {/* Daily Vibe Modal */}
      <Modal
        visible={showDailyVibe}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDailyVibe(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#a8edea', '#fed6e3']}
              style={styles.modalHeader}
            >
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowDailyVibe(false)}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              <View style={styles.modalHeaderContent}>
                <Ionicons name="sunny" size={40} color="white" />
                <Text style={styles.modalTitle}>Daily Vibe</Text>
                <Text style={styles.modalDate}>
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
              </View>
            </LinearGradient>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {dailyInsight ? (
                <>
                  {/* Personal Day Number & Energy */}
                  <View style={styles.insightCard}>
                    <Text style={styles.insightLabel}>Personal Day Number</Text>
                    <Text style={styles.insightNumber}>{dailyInsight.personalDayNumber}</Text>
                    <Text style={styles.insightTheme}>{dailyInsight.overallTheme}</Text>
                  </View>

                  {/* Energy Level */}
                  <View style={styles.insightCard}>
                    <Text style={styles.insightLabel}>Energy Level</Text>
                    <View style={styles.energyBar}>
                      <View 
                        style={[
                          styles.energyFill, 
                          { width: `${dailyInsight.energyLevel}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.energyText}>{dailyInsight.energyLevel}%</Text>
                  </View>

                  {/* Daily Advice */}
                  <View style={styles.insightCard}>
                    <Text style={styles.insightLabel}>Today's Guidance</Text>
                    <Text style={styles.insightText}>{dailyInsight.advice}</Text>
                  </View>

                  {/* Affirmation */}
                  <View style={styles.insightCard}>
                    <Text style={styles.insightLabel}>Affirmation</Text>
                    <Text style={styles.affirmationText}>"{dailyInsight.affirmation}"</Text>
                  </View>

                  {/* Life Areas */}
                  <View style={styles.lifeAreasContainer}>
                    <View style={styles.lifeAreaCard}>
                      <Ionicons name="heart" size={20} color="#E91E63" />
                      <Text style={styles.lifeAreaLabel}>Love</Text>
                      <Text style={styles.lifeAreaText}>{dailyInsight.love}</Text>
                    </View>
                    
                    <View style={styles.lifeAreaCard}>
                      <Ionicons name="briefcase" size={20} color="#2196F3" />
                      <Text style={styles.lifeAreaLabel}>Career</Text>
                      <Text style={styles.lifeAreaText}>{dailyInsight.career}</Text>
                    </View>
                    
                    <View style={styles.lifeAreaCard}>
                      <Ionicons name="fitness" size={20} color="#4CAF50" />
                      <Text style={styles.lifeAreaLabel}>Health</Text>
                      <Text style={styles.lifeAreaText}>{dailyInsight.health}</Text>
                    </View>
                    
                    <View style={styles.lifeAreaCard}>
                      <Ionicons name="sparkles" size={20} color="#9C27B0" />
                      <Text style={styles.lifeAreaLabel}>Spiritual</Text>
                      <Text style={styles.lifeAreaText}>{dailyInsight.spiritual}</Text>
                    </View>
                  </View>

                  {/* Lucky Numbers & Colors */}
                  <View style={styles.luckyContainer}>
                    <View style={styles.luckySection}>
                      <Text style={styles.luckyLabel}>Lucky Numbers</Text>
                      <View style={styles.luckyNumbers}>
                        {dailyInsight.luckyNumbers.map((number, index) => (
                          <View key={index} style={styles.luckyNumber}>
                            <Text style={styles.luckyNumberText}>{number}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    
                    <View style={styles.luckySection}>
                      <Text style={styles.luckyLabel}>Lucky Colors</Text>
                      <View style={styles.luckyColors}>
                        {dailyInsight.luckyColors.map((color, index) => (
                          <View key={index} style={styles.luckyColor}>
                            <Text style={styles.luckyColorText}>{color}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.noDataContainer}>
                  <Ionicons name="information-circle" size={48} color="#8E8E93" />
                  <Text style={styles.noDataTitle}>Complete Your Profile</Text>
                  <Text style={styles.noDataText}>
                    Add your birth date and full name to your profile to unlock personalized daily insights.
                  </Text>
                  <TouchableOpacity 
                    style={styles.profileButton}
                    onPress={() => {
                      setShowDailyVibe(false);
                      navigateToTab('profile');
                    }}
                  >
                    <Text style={styles.profileButtonText}>Update Profile</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* AI Insights Modal */}
      <Modal
        visible={showAIInsights}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAIInsights(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#ffecd2', '#fcb69f']}
              style={styles.modalHeader}
            >
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowAIInsights(false)}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              <View style={styles.modalHeaderContent}>
                <Ionicons name="sparkles" size={40} color="white" />
                <Text style={styles.modalTitle}>AI Insights</Text>
                <Text style={styles.modalDate}>Personalized Analysis</Text>
              </View>
            </LinearGradient>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {profileData?.full_name && profileData?.birth_date ? (
                <View style={styles.aiInsightsContainer}>
                  {!aiInsights && !loadingAIInsights ? (
                    <View style={styles.generateContainer}>
                      <Ionicons name="bulb" size={48} color="#FF9500" />
                      <Text style={styles.generateTitle}>Generate Your AI Insights</Text>
                      <Text style={styles.generateDescription}>
                        Get personalized insights powered by advanced AI analysis of your numerological profile, personality traits, and life path.
                      </Text>
                      <TouchableOpacity
                        style={styles.generateButton}
                        onPress={generateAIInsights}
                      >
                        <Ionicons name="sparkles" size={20} color="white" />
                        <Text style={styles.generateButtonText}>Generate Insights</Text>
                      </TouchableOpacity>
                    </View>
                  ) : loadingAIInsights ? (
                    <View style={styles.loadingInsights}>
                      <View style={styles.aiLoadingAnimation}>
                        <Ionicons name="sparkles" size={32} color="#FF9500" />
                      </View>
                      <Text style={styles.loadingTitle}>Generating Your Insights</Text>
                      <Text style={styles.loadingDescription}>
                        Our AI is analyzing your numerological profile and creating personalized insights just for you...
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.insightsContent}>
                      <TouchableOpacity
                        style={styles.refreshButton}
                        onPress={generateAIInsights}
                        disabled={loadingAIInsights}
                      >
                        <Ionicons name="refresh" size={16} color="#007AFF" />
                        <Text style={styles.refreshButtonText}>Refresh Insights</Text>
                      </TouchableOpacity>
                      <Text style={styles.aiInsightsText}>{aiInsights}</Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.noDataContainer}>
                  <Ionicons name="information-circle" size={48} color="#8E8E93" />
                  <Text style={styles.noDataTitle}>Complete Your Profile</Text>
                  <Text style={styles.noDataText}>
                    Add your birth date and full name to your profile to unlock personalized AI insights.
                  </Text>
                  <TouchableOpacity 
                    style={styles.profileButton}
                    onPress={() => {
                      setShowAIInsights(false);
                      navigateToTab('profile');
                    }}
                  >
                    <Text style={styles.profileButtonText}>Update Profile</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Custom Alert Component */}
      {AlertComponent}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    height: height * 0.4,
    position: 'relative',
    marginBottom: 20,
  },
  heroGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  sparkleContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  sparkle: {
    position: 'absolute',
  },
  heartContainer: {
    marginBottom: 20,
  },
  heartGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E91E63',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  welcomeText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '300',
    opacity: 0.9,
  },
  nameText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  premiumNameText: {
    color: '#FFD700', // Gold color for premium users
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  premiumIcon: {
    fontSize: 24,
    color: '#FFD700',
  },
  tagline: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '80%',
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: DesignSystem.typography.sizes['2xl'],
    fontWeight: DesignSystem.typography.weights.bold,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.scale.lg,
    textAlign: 'center',
  },
  // Bento Box Layout Styles
  bentoContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  bentoGrid: {
    gap: 12,
  },
  bentoCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bentoGradient: {
    padding: 20,
    position: 'relative',
  },
  bentoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bentoIndicator: {
    opacity: 0.8,
  },
  // Primary Card (Large - Numerology)
  bentoPrimary: {
    marginBottom: 12,
  },
  bentoContent: {
    marginBottom: 16,
  },
  bentoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  bentoDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 20,
  },
  bentoFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  bentoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  bentoTagText: {
    fontSize: 10,
    color: '#FFD700',
    fontWeight: '600',
  },
  // Secondary Cards Row (Medium - Love & Trust)
  bentoSecondaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  bentoSecondary: {
    flex: 1,
  },
  bentoSecondaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bentoSecondarySubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  // Tertiary Cards Row (Small - Profile, Daily, AI)
  bentoTertiaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bentoTertiary: {
    flex: 1,
    height: 80,
  },
  bentoTertiaryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 6,
    textAlign: 'center',
  },
  profileStatus: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  profileCard: {
    marginBottom: DesignSystem.spacing.scale.lg,
  },
  profileCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.scale.lg,
  },
  profileTextContainer: {
    flex: 1,
  },
  profileCardTitle: {
    fontSize: DesignSystem.typography.sizes.lg,
    fontWeight: DesignSystem.typography.weights.semibold,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.scale.xs,
  },
  profileCardSubtitle: {
    fontSize: DesignSystem.typography.sizes.sm,
    color: DesignSystem.colors.text.secondary,
  },
  inspirationSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  inspirationCard: {
    marginBottom: DesignSystem.spacing.scale.lg,
    alignItems: 'center',
  },
  inspirationIcon: {
    marginBottom: 16,
  },
  inspirationText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  inspirationAuthor: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 15,
  },
  quoteIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
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
  statsSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statCard: {
    alignItems: 'center',
    minWidth: 90,
    marginBottom: 0,
  },
  statNumber: {
    fontSize: DesignSystem.typography.sizes['2xl'],
    fontWeight: DesignSystem.typography.weights.bold,
    color: DesignSystem.colors.text.primary,
    marginVertical: DesignSystem.spacing.scale.xs,
  },
  statLabel: {
    fontSize: DesignSystem.typography.sizes.xs,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.scale.sm,
  },
  bottomPadding: {
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },

  // Daily Vibe Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 24,
    position: 'relative',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeaderContent: {
    alignItems: 'center',
    paddingTop: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 12,
    marginBottom: 4,
  },
  modalDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  modalContent: {
    padding: 20,
    maxHeight: '75%',
  },
  insightCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  insightLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  insightNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  insightTheme: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  energyBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  energyFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  energyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    textAlign: 'center',
  },
  insightText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  affirmationText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#333',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  lifeAreasContainer: {
    gap: 12,
    marginBottom: 16,
  },
  lifeAreaCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  lifeAreaLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    minWidth: 60,
  },
  lifeAreaText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    flex: 1,
  },
  luckyContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  luckySection: {
    flex: 1,
  },
  luckyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  luckyNumbers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  luckyNumber: {
    width: 40,
    height: 40,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  luckyNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  luckyColors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  luckyColor: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E91E63',
    borderRadius: 16,
  },
  luckyColorText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noDataTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  noDataText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  profileButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  profileButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bentoSubtitle: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    textAlign: 'center',
  },

  // AI Insights Modal Styles
  aiInsightsContainer: {
    flex: 1,
  },
  generateContainer: {
    alignItems: 'center',
    padding: 32,
  },
  generateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  generateDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  generateButton: {
    backgroundColor: '#FF9500',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingInsights: {
    alignItems: 'center',
    padding: 40,
  },
  aiLoadingAnimation: {
    marginBottom: 16,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  insightsContent: {
    padding: 8,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
    paddingVertical: 8,
  },
  refreshButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  aiInsightsText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
});