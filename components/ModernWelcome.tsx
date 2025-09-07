import React, { useState, useEffect } from "react";
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  Animated,
  Image
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { router } from "expo-router";

const { width, height } = Dimensions.get('window');

interface WelcomeStep {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  gradient: string[];
  features: string[];
  image?: string;
}

const WELCOME_STEPS: WelcomeStep[] = [
  {
    id: 1,
    title: "Welcome to Lovelock",
    subtitle: "Your Personal Cosmic Guide",
    description: "Discover the ancient wisdom of numerology and astrology to unlock deeper insights about yourself and your relationships.",
    icon: "heart",
    gradient: ["#667eea", "#764ba2"],
    features: [
      "Professional numerology readings",
      "Love compatibility analysis",
      "Daily personalized insights",
      "Celebrity match comparisons"
    ],
    image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: 2,
    title: "Discover Your Numbers",
    subtitle: "Unlock Your Life's Blueprint",
    description: "Your birth date holds the key to understanding your life path, destiny, and soul purpose through the power of numerology.",
    icon: "calculator",
    gradient: ["#f093fb", "#f5576c"],
    features: [
      "Life Path number analysis",
      "Destiny & Soul Urge numbers",
      "Professional Prokerala API data",
      "Detailed personality insights"
    ],
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: 3,
    title: "Find Your Perfect Match",
    subtitle: "Love Through the Stars",
    description: "Explore compatibility with potential partners using advanced numerological calculations and discover your ideal relationship dynamics.",
    icon: "people",
    gradient: ["#4facfe", "#00f2fe"],
    features: [
      "Advanced compatibility scoring",
      "Celebrity couple comparisons",
      "Relationship guidance",
      "Perfect match predictions"
    ],
    image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=300&fit=crop&crop=center"
  }
];

export default function ModernWelcome() {
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(0));
  const { theme } = useTheme();

  useEffect(() => {
    // Animate content on step change
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: currentStep * -width,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < WELCOME_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.replace("/auth");
    }
  };

  const handleSkip = () => {
    router.replace("/auth");
  };

  const renderStep = (step: WelcomeStep, index: number) => (
    <View key={step.id} style={[styles.stepContainer, { width }]}>
      <LinearGradient colors={step.gradient} style={styles.stepGradient}>
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder}>
            <LinearGradient 
              colors={[`${step.gradient[0]}40`, `${step.gradient[1]}40`]}
              style={styles.imageBackground}
            >
              <Ionicons name={step.icon as any} size={80} color="white" />
            </LinearGradient>
          </View>
        </View>

        {/* Content */}
        <BlurView intensity={20} tint="light" style={styles.contentBlur}>
          <View style={styles.contentContainer}>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
            <Text style={styles.stepDescription}>{step.description}</Text>

            {/* Features List */}
            <View style={styles.featuresContainer}>
              {step.features.map((feature, idx) => (
                <View key={idx} style={styles.featureItem}>
                  <View style={styles.featureIcon}>
                    <Ionicons name="checkmark-circle" size={20} color={step.gradient[0]} />
                  </View>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        </BlurView>
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Progress Indicator */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        
        <View style={styles.progressContainer}>
          {WELCOME_STEPS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                {
                  backgroundColor: index === currentStep ? '#fff' : 'rgba(255,255,255,0.3)',
                  transform: [{ scale: index === currentStep ? 1.2 : 1 }]
                }
              ]}
            />
          ))}
        </View>
        
        <View style={styles.placeholder} />
      </View>

      {/* Steps Container */}
      <Animated.View style={[styles.stepsWrapper, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            styles.stepsContainer,
            {
              width: width * WELCOME_STEPS.length,
              transform: [{ translateX: slideAnim }]
            }
          ]}
        >
          {WELCOME_STEPS.map((step, index) => renderStep(step, index))}
        </Animated.View>
      </Animated.View>

      {/* Bottom Navigation */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={WELCOME_STEPS[currentStep].gradient}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === WELCOME_STEPS.length - 1 ? "Get Started" : "Continue"}
            </Text>
            <Ionicons 
              name="arrow-forward" 
              size={20} 
              color="white" 
              style={styles.nextIcon}
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    zIndex: 10,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  placeholder: {
    width: 60,
  },
  stepsWrapper: {
    flex: 1,
  },
  stepsContainer: {
    flexDirection: 'row',
    height: '100%',
  },
  stepContainer: {
    flex: 1,
  },
  stepGradient: {
    flex: 1,
    justifyContent: 'space-between',
  },
  imageContainer: {
    height: height * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentBlur: {
    flex: 1,
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 140,
  },
  contentContainer: {
    padding: 32,
  },
  stepTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  stepSubtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  stepDescription: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    fontWeight: '400',
  },
  featuresContainer: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    fontWeight: '500',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
  },
  nextButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  nextIcon: {
    marginLeft: 8,
  },
});
