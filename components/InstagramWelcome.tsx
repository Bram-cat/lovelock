import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface WelcomeFeature {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
}

const features: WelcomeFeature[] = [
  {
    icon: 'heart',
    title: 'Love Compatibility',
    description: 'Discover your perfect match through numerology',
    color: '#E91E63',
  },
  {
    icon: 'star',
    title: 'Personal Insights',
    description: 'Unlock hidden secrets about your personality',
    color: '#FF9800',
  },
  {
    icon: 'telescope',
    title: 'Future Predictions',
    description: 'See what the numbers reveal about your path',
    color: '#2196F3',
  },
];

export default function InstagramWelcome() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeTitle}>Welcome to Lovelock!</Text>
          <Text style={styles.welcomeSubtitle}>
            Your journey of self-discovery begins here
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={[styles.iconContainer, { backgroundColor: `${feature.color}15` }]}>
                <Ionicons name={feature.icon} size={40} color={feature.color} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>

          <Text style={styles.skipText}>
            Ready to explore the mysteries of numbers?
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#262626',
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#8E8E8E',
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#262626',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 15,
    color: '#8E8E8E',
    lineHeight: 20,
  },
  bottomSection: {
    marginTop: 32,
  },
  getStartedButton: {
    backgroundColor: '#1877F2',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#1877F2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  getStartedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  skipText: {
    fontSize: 14,
    color: '#8E8E8E',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
