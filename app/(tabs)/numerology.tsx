import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Share,
  Dimensions,
  Animated
} from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import NumerologyService from '../../services/NumerologyService';
import type { NumerologyProfile } from '../../services/NumerologyService';
import UniversalAIService, { AIProvider } from '../../services/UniversalAIService';
import { ProkeralaNumerologyService } from '../../services/ProkeralaNumerologyService';
import { supabase } from '../../lib/supabase-client';
import { useProfile } from '../../contexts/ProfileContext';
import { SubscriptionService } from '../../services/SubscriptionService';
import { NumerologyLoadingSkeleton } from '../../components/LoadingSkeletons';
import AILoadingIndicator from '../../components/AILoadingIndicator';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';
import { DesignSystem } from '../../constants/DesignSystem';
import { DatePicker, ShadcnButton, ShadcnInput } from '../../components/ui';
import GlassCard from '../../components/ui/GlassCard';
import Badge from '../../components/ui/Badge';
import ReadMoreText from '../../components/ReadMoreText';
import { StaticDataService } from '../../services/StaticDataService';

const { width: screenWidth } = Dimensions.get('window');

// Modern Numerology Card Component
const ModernNumerologyCard = ({ title, number, description, gradient, icon, onPress, style }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.modernCard, style]} activeOpacity={0.8}>
      <LinearGradient colors={gradient} style={styles.modernCardGradient}>
        <View style={styles.modernCardHeader}>
          <View style={styles.modernCardIconContainer}>
            <Ionicons name={icon} size={28} color="white" />
          </View>
          <View style={styles.modernCardNumber}>
            <Text style={styles.modernCardNumberText}>{number}</Text>
          </View>
        </View>
        <Text style={styles.modernCardTitle}>{title}</Text>
        <Text style={styles.modernCardDescription} numberOfLines={2}>{description}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Life Aspect Card Component
const LifeAspectCard = ({ aspect, icon, color, insights, expanded, onToggle }) => {
  return (
    <TouchableOpacity onPress={onToggle} style={styles.aspectCard} activeOpacity={0.9}>
      <LinearGradient colors={[color, `${color}CC`]} style={styles.aspectCardGradient}>
        <View style={styles.aspectHeader}>
          <View style={styles.aspectIconContainer}>
            <Ionicons name={icon} size={24} color="white" />
          </View>
          <Text style={styles.aspectTitle}>{aspect}</Text>
          <Ionicons 
            name={expanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="rgba(255,255,255,0.8)" 
          />
        </View>
        {expanded && (
          <View style={styles.aspectContent}>
            {insights.map((insight, index) => (
              <View key={index} style={styles.insightItem}>
                <View style={styles.insightBullet} />
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default function NumerologyScreen() {
  const { user } = useUser();
  const { profileData, updateProfileData } = useProfile();
  const [profile, setProfile] = useState<NumerologyProfile | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedAspect, setExpandedAspect] = useState<string | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRetryAttempt, setAiRetryAttempt] = useState(0);
  const [aiProgressMessage, setAiProgressMessage] = useState('');
  const [currentAiProvider, setCurrentAiProvider] = useState<AIProvider>(AIProvider.OPENAI);
  const [usageStats, setUsageStats] = useState<any>(null);
  const { showAlert, AlertComponent } = useCustomAlert();
  const [enhancedProfile, setEnhancedProfile] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<any>(null);

  // Global name synchronization
  useEffect(() => {
    const globalName = profileData?.full_name || user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
    if (globalName && globalName !== userName) {
      setUserName(globalName);
    }
  }, [profileData?.full_name, user?.fullName, user?.firstName, user?.lastName]);

  // Update profile when userName changes
  const updateGlobalName = async (newName: string) => {
    setUserName(newName);
    if (user?.id && newName.trim()) {
      try {
        console.log('🔄 Numerology: Updating profile name to:', newName.trim());
        const result = await updateProfileData({ full_name: newName.trim() });
        if (result) {
          console.log('✅ Numerology: Profile name updated successfully');
        } else {
          console.error('❌ Numerology: Profile name update failed');
        }
      } catch (error) {
        console.error('❌ Error updating profile name:', error);
      }
    }
  };

  // Load usage statistics
  useEffect(() => {
    const loadUsageStats = async () => {
      if (user?.id) {
        try {
          const stats = await SubscriptionService.getUsageStats(user.id);
          const resetDate = new Date(stats.numerology.resetsAt);
          const now = new Date();
          const daysUntilReset = Math.ceil((resetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          setUsageStats({
            numerologyUsage: stats.numerology.totalUsed,
            numerologyRemaining: stats.numerology.remaining,
            daysUntilReset: Math.max(0, daysUntilReset),
            isPremium: stats.isPremium
          });
        } catch (error) {
          console.error('Error loading usage stats:', error);
        }
      }
    };
    loadUsageStats();
  }, [user?.id]);

  // Auto-fill birth date from profile
  useEffect(() => {
    if (profileData?.birth_date) {
      let formattedBirthDate = profileData.birth_date;
      try {
        if (profileData.birth_date.includes('-') && profileData.birth_date.length === 10) {
          const [year, month, day] = profileData.birth_date.split('-');
          formattedBirthDate = `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
        }
      } catch (error) {
        console.log('Error formatting birth date:', error);
      }
      setBirthDate(formattedBirthDate);
    }
  }, [profileData?.birth_date]);

  // Initialize input mode if needed
  useEffect(() => {
    const globalName = profileData?.full_name || user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
    if (globalName && globalName !== '' && !profile) {
      setShowInput(true);
    }
  }, [user, profile, profileData]);

  // Redirect unknown users
  useEffect(() => {
    if (profile && !userName.trim() && !profileData?.full_name && !user?.fullName) {
      console.log('Unknown user detected, redirecting to input form');
      setProfile(null);
      setShowInput(true);
    }
  }, [profile, userName, profileData?.full_name, user?.fullName]);

  // Real-time usage stats updates
  useEffect(() => {
    if (!user?.id) return;

    const updateUsageStats = async () => {
      try {
        const stats = await SubscriptionService.getUsageStats(user.id);
        const resetDate = new Date(stats.numerology.resetsAt);
        const now = new Date();
        const daysUntilReset = Math.ceil((resetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        const newStats = {
          numerologyUsage: stats.numerology.totalUsed,
          numerologyRemaining: stats.numerology.remaining,
          daysUntilReset: Math.max(0, daysUntilReset),
          isPremium: stats.isPremium
        };

        setUsageStats(newStats);

        // Show upgrade prompts
        if (!stats.isPremium && stats.numerology.remaining === 1 && !profile) {
          showAlert({
            title: '⚠️ Last Free Reading!',
            message: `You have only 1 numerology reading remaining this month. After this, you'll need to wait ${daysUntilReset} days or upgrade to Premium for unlimited access.`,
            type: 'warning',
            buttons: [
              { text: 'Continue with Last Reading', style: 'cancel' },
              { 
                text: 'Upgrade to Premium ($4.99/mo)', 
                style: 'primary',
                onPress: async () => {
                  try {
                    const result = await SubscriptionService.purchasePremiumSubscription(
                      user.id,
                      user.primaryEmailAddress?.emailAddress || ''
                    );
                    if (result.success) {
                      showAlert({
                        title: '🎉 Welcome to Premium!',
                        message: 'You now have unlimited access to all numerology features!',
                        type: 'success'
                      });
                      updateUsageStats();
                    }
                  } catch (error) {
                    console.error('Upgrade error:', error);
                  }
                }
              }
            ]
          });
        }
      } catch (error) {
        console.error('Error updating usage stats:', error);
      }
    };

    updateUsageStats();
    const interval = setInterval(updateUsageStats, 30000);
    return () => clearInterval(interval);
  }, [user?.id, profile]);

  const calculateNumerologyWithProfile = async (fullName: string, date: string, profileData?: any) => {
    setLoading(true);
    try {
      if (profileData && (profileData.birth_location || profileData.birth_time)) {
        console.log('🔮 Using Prokerala API for enhanced numerology...');
        const prokeralaReading = await ProkeralaNumerologyService.getNumerologyReading(
          fullName,
          date,
          profileData?.birth_time,
          profileData?.birth_location
        );
        
        if (prokeralaReading) {
          const numerologyProfile = {
            lifePathNumber: prokeralaReading.life_path_number,
            destinyNumber: prokeralaReading.destiny_number,
            soulUrgeNumber: prokeralaReading.soul_urge_number,
            personalityNumber: prokeralaReading.personality_number,
            personalYearNumber: new Date().getFullYear() % 9 + 1,
            lifePathInfo: {
              title: 'Enhanced by Prokerala API',
              description: prokeralaReading.life_path_description,
              strengths: prokeralaReading.strengths,
              challenges: prokeralaReading.challenges,
              careerPaths: [prokeralaReading.career_guidance],
              relationships: prokeralaReading.relationship_guidance
            },
            characterAnalysis: (await UniversalAIService.generatePersonalizedCharacterAnalysis(
              {
                lifePathNumber: prokeralaReading.life_path_number,
                destinyNumber: prokeralaReading.destiny_number,
                soulUrgeNumber: prokeralaReading.soul_urge_number,
                personalityNumber: prokeralaReading.personality_number,
                personalYearNumber: new Date().getFullYear() % 9 + 1
              } as any,
              fullName
            )).content,
            predictions: (await UniversalAIService.generateAdvancedPrompt(`Generate personalized predictions for ${fullName} based on their numerology: Life Path ${prokeralaReading.life_path_number}, Destiny ${prokeralaReading.destiny_number}, Personal Year ${new Date().getFullYear() % 9 + 1}. Focus on: what this year holds, opportunities, personal development, relationships, career guidance. Keep under 150 words.`)).content,
            luckyNumbers: prokeralaReading.lucky_numbers,
            luckyColors: prokeralaReading.lucky_colors
          };

          setProfile(numerologyProfile as any);
          setEnhancedProfile(true);
          console.log('✨ Enhanced numerology profile generated with Prokerala API + AI!');
          setShowInput(false);
          setLoading(false);
          return;
        }
      }
      
      await calculateNumerology();
    } catch (error) {
      console.error('Enhanced numerology calculation error:', error);
      try {
        await calculateNumerology();
      } catch (fallbackError) {
        console.error('Fallback calculation also failed:', fallbackError);
        setLoading(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateNumerology = async () => {
    if (!birthDate) {
      Alert.alert('Error', 'Please enter your birth date');
      setLoading(false);
      return;
    }

    const datePattern = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/(19|20)\d{2}$/;
    if (!datePattern.test(birthDate)) {
      Alert.alert('Error', 'Please enter date in MM/DD/YYYY format');
      setLoading(false);
      return;
    }

    // Check usage limits
    if (user?.id) {
      const usageCheck = await SubscriptionService.canAccessFeature(user.id, 'numerology');
      if (!usageCheck.canUse) {
        setLoading(false);
        showAlert({
          title: '⚠️ Usage Limit Reached',
          message: usageCheck.message || 'You have reached your monthly limit.',
          type: 'warning',
          buttons: [
            { text: 'Later', style: 'cancel' },
            { 
              text: 'Upgrade to Premium ($4.99/month)', 
              style: 'primary',
              onPress: async () => {
                try {
                  const result = await SubscriptionService.purchasePremiumSubscription(user.id, user.primaryEmailAddress?.emailAddress || '');
                  if (result.success) {
                    showAlert({
                      title: '🎉 Welcome to Premium!',
                      message: 'Your subscription is now active. Enjoy unlimited access!',
                      type: 'success'
                    });
                    const stats = await SubscriptionService.getUsageStats(user.id);
                    const resetDate = new Date(stats.numerology.resetsAt);
                    const now = new Date();
                    const daysUntilReset = Math.ceil((resetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
                    setUsageStats({
                      numerologyUsage: stats.numerology.totalUsed,
                      numerologyRemaining: stats.numerology.remaining,
                      daysUntilReset: Math.max(0, daysUntilReset),
                      isPremium: stats.isPremium
                    });
                  }
                } catch (error) {
                  console.error('Upgrade error:', error);
                  showAlert({
                    title: 'Error',
                    message: 'Failed to process upgrade. Please try again.',
                    type: 'error'
                  });
                }
              }
            }
          ]
        });
        return;
      }
    }

    setLoading(true);
    try {
      const fullName = userName.trim() || profileData?.full_name || user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
      if (!fullName) {
        Alert.alert('Error', 'Please enter your full name');
        return;
      }

      const numerologyProfile = NumerologyService.generateProfile(fullName, birthDate);
      
      // Use static data immediately for fast display
      const staticInsights = StaticDataService.getStaticNumerologyInsights(numerologyProfile.lifePathNumber, fullName);
      const staticSinWarning = StaticDataService.getStaticDeadlySinWarning(numerologyProfile.lifePathNumber, fullName);
      const localPredictions = NumerologyService.generatePredictions(numerologyProfile);

      // Set profile with static data first - instant display
      setProfile({ 
        ...numerologyProfile, 
        characterAnalysis: staticInsights,
        predictions: localPredictions,
        deadlySinWarning: staticSinWarning
      });
      setShowInput(false);

      // Always try to enhance with AI in background (after showing static content)
      setTimeout(() => {
        // Show progressive loading indicator for AI enhancement
        console.log('🤖 Numerology: Enhancing content with AI...');
        
        Promise.allSettled([
          UniversalAIService.generatePersonalizedCharacterAnalysis(numerologyProfile, fullName),
          UniversalAIService.generateDeadlySinWarning(numerologyProfile, fullName),
          // Add more interesting predictions
          UniversalAIService.generateAdvancedPrompt(`
            Create fascinating numerology insights for ${fullName} (Life Path ${numerologyProfile.lifePathNumber}).
            Focus on:
            1. Hidden talents they haven't discovered
            2. Their soul mission in this lifetime
            3. Unique gifts they bring to the world
            Keep it inspiring and under 200 words. No asterisks or formatting.
          `)
        ]).then((results) => {
          const [characterResult, warningResult, insightsResult] = results;
          
          // Update content as AI results become available
          if (characterResult.status === 'fulfilled') {
            console.log('✨ Enhanced character analysis ready');
            setProfile(prev => ({
              ...prev,
              characterAnalysis: characterResult.value?.content || characterResult.value
            }));
          }
          
          if (warningResult.status === 'fulfilled') {
            console.log('✨ Enhanced spiritual warning ready');
            setProfile(prev => ({
              ...prev,
              deadlySinWarning: warningResult.value
            }));
          }
          
          if (insightsResult.status === 'fulfilled') {
            console.log('✨ Additional AI insights ready');
            const content = insightsResult.value?.content || insightsResult.value;
            setProfile(prev => ({
              ...prev,
              aiInsights: typeof content === 'string' ? content.replace(/\*/g, '') : ''
            }));
          }
        });
      }, 2000); // Wait 2 seconds to show static content first

      // Track usage
      if (user?.id) {
        await SubscriptionService.recordUsage(user.id, 'numerology', {
          reading_type: 'full_profile',
          user_name: fullName,
          birth_date: birthDate,
          life_path_number: numerologyProfile.lifePathNumber,
          destiny_number: numerologyProfile.destinyNumber,
          soul_urge_number: numerologyProfile.soulUrgeNumber,
          personality_number: numerologyProfile.personalityNumber
        });
        
        const stats = await SubscriptionService.getUsageStats(user.id);
        const resetDate = new Date(stats.numerology.resetsAt);
        const now = new Date();
        const daysUntilReset = Math.ceil((resetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        setUsageStats({
          numerologyUsage: stats.numerology.totalUsed,
          numerologyRemaining: stats.numerology.remaining,
          daysUntilReset: Math.max(0, daysUntilReset),
          isPremium: stats.isPremium
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to calculate numerology. Please check your information.');
      console.error('Numerology calculation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAIQuestion = async () => {
    if (!aiQuestion.trim() || !profile) return;
    
    setAiLoading(true);
    setAiRetryAttempt(0);
    setAiProgressMessage('');
    setAiResponse('');
    setCurrentAiProvider(AIProvider.OPENAI);
    
    try {
      const result = await UniversalAIService.answerNumerologyQuestion(profile, aiQuestion, {
        onRetry: (attempt, maxRetries, delayMs) => {
          setAiRetryAttempt(attempt);
        },
        onProgress: (message) => {
          setAiProgressMessage(message);
          
          // Update provider based on progress message
          if (message.toLowerCase().includes('oracle') || message.toLowerCase().includes('openai')) {
            setCurrentAiProvider(AIProvider.OPENAI);
          } else if (message.toLowerCase().includes('backup') || message.toLowerCase().includes('gemini')) {
            setCurrentAiProvider(AIProvider.GEMINI);
          }
        }
      });
      
      setAiResponse(result.content);
      setCurrentAiProvider(result.provider);
      setAiRetryAttempt(0);
      setAiProgressMessage('');
    } catch (error) {
      console.error('AI Question error:', error);
      setAiResponse('I apologize, but I\'m having trouble accessing my wisdom right now. Please try again in a moment.');
      setAiRetryAttempt(0);
      setAiProgressMessage('');
    }
    setAiLoading(false);
  };

  const resetCalculation = () => {
    setProfile(null);
    setShowInput(true);
    setBirthDate('');
    setLoading(false);
  };

  const shareReading = async () => {
    try {
      const shareText = `🔮 My Numerology Reading Results! 🔮

Life Path: ${profile.lifePathNumber} | Destiny: ${profile.destinyNumber} | Soul Urge: ${profile.soulUrgeNumber}

${profile.characterAnalysis?.substring(0, 150)}...

✨ Discover your own numerology with Lovelock - the mystical numerology app!

#Numerology #Spirituality #PersonalGrowth`;

      await Share.share({
        message: shareText,
        title: 'My Numerology Reading'
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  // Life aspects with comprehensive coverage
  const lifeAspects = useMemo(() => {
    if (!profile) return [];

    return [
      {
        title: "Love & Romance",
        icon: "heart",
        color: "#FF6B9D",
        insights: [
          profile.lifePathInfo?.relationships || "You seek authentic connections.",
          "Your magnetic energy attracts soulmate-level relationships.",
          "Deep emotional bonds form through honest communication.",
          "Trust your intuition when choosing romantic partners."
        ]
      },
      {
        title: "Career & Wealth",
        icon: "briefcase",
        color: "#4ECDC4",
        insights: profile.lifePathInfo?.careerPaths?.map(path => `${path} aligns with your natural talents`) || [
          "Follow your passion to find career fulfillment.",
          "Your leadership skills open doors to advancement.",
          "Financial success comes through authentic self-expression."
        ]
      },
      {
        title: "Health & Vitality",
        icon: "fitness",
        color: "#A8E6CF",
        insights: [
          "Balance physical activity with spiritual practices.",
          "Listen to your body's wisdom for optimal wellness.",
          "Stress management through meditation enhances vitality.",
          "Your life path supports natural healing abilities."
        ]
      },
      {
        title: "Family & Relationships",
        icon: "people",
        color: "#FFB347",
        insights: [
          "Family bonds strengthen through understanding.",
          "You naturally create harmony in group settings.",
          "Your wisdom guides family members through challenges.",
          "Nurturing relationships brings deep fulfillment."
        ]
      },
      {
        title: "Spiritual Growth",
        icon: "leaf",
        color: "#DDA0DD",
        insights: [
          "Your spiritual path involves service to others.",
          "Meditation and reflection accelerate your growth.",
          "Trust your intuitive gifts and inner knowing.",
          "Universal wisdom flows through your unique perspective."
        ]
      },
      {
        title: "Life Purpose & Mission",
        icon: "compass",
        color: "#87CEEB",
        insights: [
          profile.destinyInfo?.purpose || "Your purpose involves inspiring others.",
          profile.destinyInfo?.mission || "You're here to make a positive impact.",
          "Your unique talents serve the greater good.",
          "Alignment with purpose brings effortless success."
        ]
      }
    ];
  }, [profile]);

  if (showInput || !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView 
            style={styles.scrollView} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Simple Header */}
            <View style={styles.header}>
              <Ionicons name="calculator" size={48} color="#E91E63" />
              <Text style={styles.title}>Numerology Reading</Text>
              <Text style={styles.description}>
                Unlock the mysteries of your cosmic blueprint
              </Text>
            </View>

            <KeyboardAvoidingView 
              style={styles.inputSection}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
              <Text style={styles.inputLabel}>Your Information</Text>
              
              <View style={styles.inputContainer}>
                <ShadcnInput
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={userName}
                  onChangeText={updateGlobalName}
                  autoCapitalize="words"
                  leftIcon="person"
                  required
                />
              </View>

              <View style={styles.inputContainer}>
                <DatePicker
                  label="Birth Date"
                  value={birthDate ? (() => {
                    try {
                      const [month, day, year] = birthDate.split('/');
                      if (month && day && year) {
                        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                      }
                      return undefined;
                    } catch (error) {
                      console.log('Error parsing birth date:', error);
                      return undefined;
                    }
                  })() : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
                      setBirthDate(formattedDate);
                    }
                  }}
                  placeholder="MM/DD/YYYY"
                  maxDate={new Date()}
                />
              </View>

              <ShadcnButton
                onPress={() => {
                  if (!userName.trim()) {
                    Alert.alert('Error', 'Please enter your full name');
                    return;
                  }
                  if (!birthDate.trim()) {
                    Alert.alert('Error', 'Please enter your birth date');
                    return;
                  }
                  
                  if (profileData?.birth_location || profileData?.birth_time) {
                    calculateNumerologyWithProfile(userName, birthDate, profileData);
                  } else {
                    calculateNumerology();
                  }
                }}
                variant="default"
                size="lg"
                disabled={loading || !birthDate || !userName.trim()}
                loading={loading}
                startIcon="calculator"
                style={styles.calculateButton}
              >
                {loading ? 'Calculating Your Numbers...' : 'Reveal My Numbers'}
              </ShadcnButton>
            </KeyboardAvoidingView>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  if (loading) {
    return <NumerologyLoadingSkeleton />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Simple Header with Back Button */}
        <View style={styles.profileHeader}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={resetCalculation} style={styles.resetButton}>
              <Ionicons name="arrow-back" size={20} color="#E91E63" />
              <Text style={styles.resetButtonText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.profileTitle}>Your Numerology Profile</Text>
            <TouchableOpacity onPress={shareReading} style={styles.shareButton}>
              <Ionicons name="share-outline" size={20} color="#E91E63" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileSubtitle}>
            {userName || profileData?.full_name || 'Your Reading'}
          </Text>

          {/* Usage Stats */}
          {usageStats && !usageStats.isPremium && (
            <View style={[styles.modernUsageStats, 
              usageStats.numerologyRemaining <= 1 && styles.urgentUsageStats
            ]}>
              <View style={styles.usageStatsContent}>
                <Ionicons 
                  name={usageStats.numerologyRemaining <= 1 ? "warning" : "flash"} 
                  size={16} 
                  color={usageStats.numerologyRemaining <= 1 ? "#FF3B30" : "#FFD700"} 
                />
                <Text style={[styles.usageStatsText, 
                  usageStats.numerologyRemaining <= 1 && styles.urgentUsageText
                ]}>
                  {usageStats.numerologyRemaining === 0 
                    ? "No free readings remaining" 
                    : `${usageStats.numerologyRemaining} free reading${usageStats.numerologyRemaining === 1 ? '' : 's'} left`}
                </Text>
              </View>
            </View>
          )}

          {usageStats?.isPremium && (
            <View style={styles.premiumBadge}>
              <Ionicons name="diamond" size={16} color="#FFD700" />
              <Text style={styles.premiumText}>Premium - Unlimited Access</Text>
            </View>
          )}

          {/* Profile Header */}
          <View style={styles.modernProfileSection}>
            <View style={styles.modernAvatar}>
              <Text style={styles.avatarText}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.modernProfileName}>
              {userName || profileData?.full_name || 'Your Reading'}
            </Text>
            {enhancedProfile && (
              <Badge variant="cosmic" style={styles.enhancedBadge}>
                Enhanced Reading
              </Badge>
            )}
          </View>
        </View>

        {/* Your Numbers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Core Numbers</Text>
          
          <View style={styles.numbersGrid}>
            <View style={styles.numberCard}>
              <Text style={styles.numberValue}>{profile.lifePathNumber}</Text>
              <Text style={styles.numberLabel}>Life Path</Text>
            </View>
            
            <View style={styles.numberCard}>
              <Text style={styles.numberValue}>{profile.destinyNumber}</Text>
              <Text style={styles.numberLabel}>Destiny</Text>
            </View>
            
            <View style={styles.numberCard}>
              <Text style={styles.numberValue}>{profile.soulUrgeNumber}</Text>
              <Text style={styles.numberLabel}>Soul Urge</Text>
            </View>

            <View style={styles.numberCard}>
              <Text style={styles.numberValue}>{profile.personalityNumber}</Text>
              <Text style={styles.numberLabel}>Personality</Text>
            </View>
          </View>
        </View>

        {/* Life Aspects */}
        <View style={styles.lifeAspectsSection}>
          <Text style={styles.sectionTitle}>Life Aspects Analysis</Text>
          <Text style={styles.sectionSubtitle}>Comprehensive insights into all areas of your life</Text>
          
          {lifeAspects.map((aspect, index) => (
            <LifeAspectCard
              key={index}
              aspect={aspect.title}
              icon={aspect.icon}
              color={aspect.color}
              insights={aspect.insights}
              expanded={expandedAspect === aspect.title}
              onToggle={() => setExpandedAspect(expandedAspect === aspect.title ? null : aspect.title)}
            />
          ))}
        </View>

        {/* Character Analysis */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Character Analysis</Text>
            <TouchableOpacity onPress={() => setShowAIChat(true)} style={styles.aiChatButton}>
              <Ionicons name="chatbubble-ellipses" size={20} color="#E91E63" />
              <Text style={styles.aiChatButtonText}>Ask AI</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.analysisCard}>
            <ReadMoreText 
              text={profile.characterAnalysis} 
              maxLength={300}
              style={styles.analysisText}
            />
          </View>
        </View>

        {/* AI Enhanced Insights */}
        {profile.aiInsights && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>✨ Hidden Talents & Soul Mission</Text>
              <Badge variant="cosmic" style={styles.aiEnhancedBadge}>
                AI Enhanced
              </Badge>
            </View>
            <View style={styles.analysisCard}>
              <ReadMoreText 
                text={profile.aiInsights} 
                maxLength={250}
                style={styles.analysisText}
              />
            </View>
          </View>
        )}

        {/* Spiritual Warning */}
        {profile.deadlySinWarning && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Spiritual Guidance</Text>
            <View style={styles.warningCard}>
              <Text style={styles.warningSubtitle}>Beware of {profile.deadlySinWarning.sin}</Text>
              <Text style={styles.warningText}>{profile.deadlySinWarning.warning}</Text>
              <Text style={styles.consequencesText}>{profile.deadlySinWarning.consequences}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Number Detail Modal */}
      <Modal
        visible={!!selectedNumber}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedNumber(null)}
      >
        {selectedNumber && (
          <SafeAreaView style={styles.modalContainer}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.modalHeader}
            >
              <View style={styles.modalHeaderContent}>
                <TouchableOpacity onPress={() => setSelectedNumber(null)}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.modalTitleContainer}>
                  <Text style={styles.modalTitle}>{selectedNumber.type} {selectedNumber.number}</Text>
                  <Text style={styles.modalSubtitle}>{selectedNumber.info?.title}</Text>
                </View>
                <View style={{width: 24}} />
              </View>
            </LinearGradient>
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalDescription}>{selectedNumber.info?.description}</Text>
              {selectedNumber.info?.strengths && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Strengths</Text>
                  {selectedNumber.info.strengths.map((strength, index) => (
                    <Text key={index} style={styles.modalListItem}>• {strength}</Text>
                  ))}
                </View>
              )}
              {selectedNumber.info?.purpose && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Purpose</Text>
                  <Text style={styles.modalText}>{selectedNumber.info.purpose}</Text>
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      {/* AI Chat Modal */}
      <Modal
        visible={showAIChat}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.aiModalContainer}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.aiModalHeader}
          >
            <View style={styles.aiModalHeaderContent}>
              <TouchableOpacity onPress={() => setShowAIChat(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.aiModalTitle}>Ask Your Oracle</Text>
              <View style={{width: 24}} />
            </View>
            <Text style={styles.aiModalSubtitle}>Get personalized insights about your numbers</Text>
          </LinearGradient>

          <KeyboardAvoidingView 
            style={styles.aiModalContent}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView style={styles.aiChatArea}>
              {aiLoading ? (
                <AILoadingIndicator
                  retryAttempt={aiRetryAttempt}
                  maxRetries={4}
                  message={aiProgressMessage}
                  showEducationalContent={true}
                  analysisType="numerology"
                  aiProvider={currentAiProvider === AIProvider.OPENAI ? 'openai' : 'gemini'}
                />
              ) : aiResponse ? (
                <GlassCard intensity="light" tint="cosmic" style={styles.aiResponseCard}>
                  <View style={styles.aiResponseHeader}>
                    <Ionicons name="sparkles" size={20} color="#667eea" />
                    <Text style={styles.aiResponseTitle}>Oracle's Wisdom</Text>
                    <View style={styles.providerBadgeSmall}>
                      <Text style={styles.providerBadgeText}>
                        {currentAiProvider === AIProvider.OPENAI ? '🤖' : '✨'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.aiResponseText}>{aiResponse}</Text>
                </GlassCard>
              ) : (
                <View style={styles.aiPlaceholder}>
                  <Ionicons name="chatbubble-ellipses-outline" size={48} color="#8E8E93" />
                  <Text style={styles.aiPlaceholderText}>
                    Ask me about your life path, relationships, career, or spiritual growth!
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.aiInputContainer}>
              <TextInput
                style={styles.aiInput}
                placeholder="What would you like to know about your numbers?"
                placeholderTextColor="#8E8E93"
                value={aiQuestion}
                onChangeText={setAiQuestion}
                multiline
                maxLength={200}
              />
              <TouchableOpacity
                style={[styles.aiSendButton, (!aiQuestion.trim() || aiLoading) && styles.disabledButton]}
                onPress={handleAIQuestion}
                disabled={!aiQuestion.trim() || aiLoading}
              >
                {aiLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Ionicons name="send" size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
      
      {AlertComponent}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    flexGrow: 1,
  },
  
  // Simple Header Styles
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    marginTop: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Input Section
  inputSection: {
    paddingHorizontal: 20,
  },
  inputLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  enhanceCard: {
    marginBottom: 24,
    padding: 16,
  },
  enhanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  enhanceText: {
    color: DesignSystem.colors.accent.yellow,
    fontSize: 14,
    fontWeight: '500',
  },
  calculateButton: {
    marginTop: 24,
    backgroundColor: '#E91E63',
  },

  // Results Header
  modernResultsHeader: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  resultsTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modernBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modernActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Usage Stats
  modernUsageStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    padding: 12,
    borderRadius: 16,
    marginBottom: 20,
  },
  urgentUsageStats: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
  },
  usageStatsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  usageStatsText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
  },
  urgentUsageText: {
    color: '#FF3B30',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    padding: 12,
    borderRadius: 16,
    marginBottom: 20,
    gap: 8,
  },
  premiumText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
  },

  // Modern Profile Section
  modernProfileSection: {
    alignItems: 'center',
  },
  modernAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  modernProfileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  enhancedBadge: {
    marginTop: 8,
  },

  // Modern Numbers Section
  modernNumbersSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 20,
  },
  modernNumbersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  numberGridItem: {
    width: (screenWidth - 52) / 2,
  },

  // Modern Card Styles
  modernCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modernCardGradient: {
    padding: 20,
    minHeight: 120,
  },
  modernCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modernCardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modernCardNumber: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  modernCardNumberText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  modernCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 6,
  },
  modernCardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },

  // Life Aspects Section
  lifeAspectsSection: {
    padding: 20,
  },
  aspectCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  aspectCardGradient: {
    padding: 20,
  },
  aspectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aspectIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aspectTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  aspectContent: {
    marginTop: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  insightBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },
  insightText: {
    flex: 1,
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
  },

  // Analysis Section
  analysisSection: {
    padding: 20,
  },
  analysisCard: {
    padding: 24,
    backgroundColor: '#1C1C1E',
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  analysisTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
  },
  analysisText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },

  // Warning Section
  warningSection: {
    padding: 20,
  },
  warningCard: {
    padding: 24,
    backgroundColor: '#1C1C1E',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  warningSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    marginBottom: 12,
  },
  consequencesText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    fontStyle: 'italic',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitleContainer: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 12,
  },
  modalListItem: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
  },

  // AI Modal Styles
  aiModalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  aiModalHeader: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  aiModalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  aiModalSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  aiModalContent: {
    flex: 1,
    backgroundColor: '#000000',
  },
  aiChatArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  aiResponseCard: {
    padding: 20,
    marginVertical: 20,
  },
  aiResponseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  aiResponseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
    flex: 1,
  },
  providerBadgeSmall: {
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.3)',
  },
  providerBadgeText: {
    fontSize: 12,
    color: '#667eea',
  },
  aiResponseText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  aiPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  aiPlaceholderText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  aiInputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'flex-end',
    gap: 12,
  },
  aiInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  aiSendButton: {
    backgroundColor: '#667eea',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  
  // Simple Layout Styles (matching love/trust tabs)
  profileHeader: {
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  profileSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  resetButtonText: {
    color: '#E91E63',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  shareButton: {
    padding: 8,
  },
  section: {
    backgroundColor: '#1C1C1E',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
  },
  numbersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  numberCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
  },
  numberValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E91E63',
    marginBottom: 4,
  },
  numberLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  aiChatButtonText: {
    color: '#E91E63',
    fontSize: 12,
    fontWeight: '600',
  },
  aiEnhancedBadge: {
    alignSelf: 'flex-start',
  },
  warningCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
  },
  warningSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
    marginBottom: 8,
  },
  consequencesText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});