import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ShadcnButton } from './ui';
import GlassCard from './ui/GlassCard';
import { DesignSystem } from '../constants/DesignSystem';

const { width, height } = Dimensions.get('window');

interface OnboardingScreenProps {
  visible: boolean;
  onComplete: () => void;
  onUpgradeToPremium?: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  visible,
  onComplete,
  onUpgradeToPremium
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const onboardingSteps = [
    {
      title: "Welcome to Lovelock",
      subtitle: "Discover the mystical power of numerology",
      icon: "heart" as keyof typeof Ionicons.glyphMap,
      description: "Unlock the secrets of your relationships, personality, and life path through the ancient wisdom of numbers.",
      features: ["Personal numerology readings", "Love compatibility analysis", "Trust assessment tools"]
    },
    {
      title: "Numerology Readings",
      subtitle: "Discover your life path numbers",
      icon: "calculator" as keyof typeof Ionicons.glyphMap,
      description: "Get personalized numerology insights based on your birth date and name to understand your true potential.",
      features: ["Life Path Number", "Expression Number", "Soul Urge Number"]
    },
    {
      title: "Love Compatibility",
      subtitle: "Find your perfect match",
      icon: "heart-circle" as keyof typeof Ionicons.glyphMap,
      description: "Discover how compatible you are with your partner using ancient numerological principles.",
      features: ["Compatibility scores", "Relationship insights", "Love predictions"]
    },
    {
      title: "Trust Assessment",
      subtitle: "Build stronger relationships",
      icon: "shield-checkmark" as keyof typeof Ionicons.glyphMap,
      description: "Understand the trust dynamics in your relationships and learn how to strengthen emotional bonds.",
      features: ["Trust compatibility", "Communication insights", "Relationship advice"]
    },
    {
      title: "Unlock Premium Features",
      subtitle: "Get the full Lovelock experience",
      icon: "star" as keyof typeof Ionicons.glyphMap,
      description: "Upgrade to Premium for unlimited readings, advanced insights, and personalized guidance.",
      features: ["Unlimited readings", "Advanced AI insights", "Priority support"],
      isPremium: true
    }
  ];

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleUpgrade = () => {
    onUpgradeToPremium?.();
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <LinearGradient
        colors={['#000000', '#1a0b2e', '#000000']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Skip Button */}
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Ionicons 
                  name={currentStepData.icon} 
                  size={48} 
                  color="#E91E63" 
                />
              </View>
            </View>

            {/* Title and Subtitle */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{currentStepData.title}</Text>
              <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
            </View>

            {/* Description */}
            <GlassCard intensity="medium" tint="cosmic" style={styles.descriptionCard}>
              <Text style={styles.description}>
                {currentStepData.description}
              </Text>
            </GlassCard>

            {/* Features List */}
            <View style={styles.featuresContainer}>
              {currentStepData.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <View style={styles.featureIcon}>
                    <Ionicons name="checkmark-circle" size={20} color="#E91E63" />
                  </View>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            {/* Premium Pricing (only on last step) */}
            {currentStepData.isPremium && (
              <GlassCard intensity="light" tint="romantic" style={styles.pricingCard}>
                <View style={styles.pricingHeader}>
                  <Text style={styles.pricingTitle}>Premium Plan</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.priceAmount}>$4.99</Text>
                    <Text style={styles.pricePeriod}>/month</Text>
                  </View>
                </View>
                <Text style={styles.pricingDescription}>
                  Start your journey with unlimited access to all features. Cancel anytime.
                </Text>
                
                <ShadcnButton
                  variant="default"
                  size="lg"
                  onPress={handleUpgrade}
                  style={styles.upgradeButton}
                >
                  <Text style={styles.upgradeButtonText}>Start Premium Trial</Text>
                </ShadcnButton>
              </GlassCard>
            )}
          </ScrollView>

          {/* Bottom Navigation */}
          <View style={styles.bottomContainer}>
            {/* Progress Dots */}
            <View style={styles.progressContainer}>
              {onboardingSteps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    index === currentStep && styles.progressDotActive
                  ]}
                />
              ))}
            </View>

            {/* Continue Button */}
            <ShadcnButton
              variant={currentStepData.isPremium ? "outline" : "default"}
              size="lg"
              onPress={handleNext}
              style={styles.continueButton}
            >
              <Text style={[
                styles.continueButtonText,
                currentStepData.isPremium && styles.continueButtonTextOutline
              ]}>
                {currentStep === onboardingSteps.length - 1 
                  ? "Continue with Free Plan" 
                  : "Continue"
                }
              </Text>
            </ShadcnButton>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  skipButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  skipText: {
    color: '#a1a1aa',
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(233, 30, 99, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(233, 30, 99, 0.3)',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#a1a1aa',
    textAlign: 'center',
  },
  descriptionCard: {
    marginBottom: 30,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  description: {
    fontSize: 16,
    color: '#d4d4d8',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    marginBottom: 30,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  featureIcon: {
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#f4f4f5',
    flex: 1,
  },
  pricingCard: {
    marginBottom: 20,
    padding: 24,
    alignItems: 'center',
  },
  pricingHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  pricingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E91E63',
  },
  pricePeriod: {
    fontSize: 18,
    color: '#a1a1aa',
    marginLeft: 4,
  },
  pricingDescription: {
    fontSize: 14,
    color: '#d4d4d8',
    textAlign: 'center',
    marginBottom: 20,
  },
  upgradeButton: {
    width: '100%',
    backgroundColor: '#E91E63',
  },
  upgradeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3f3f46',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: '#E91E63',
    width: 24,
    borderRadius: 12,
  },
  continueButton: {
    width: '100%',
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButtonTextOutline: {
    color: '#E91E63',
  },
});

export default OnboardingScreen;