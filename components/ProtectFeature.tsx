import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSubscription } from '../hooks/useSubscription';

interface ProtectFeatureProps {
  feature: 'numerology' | 'loveMatch' | 'trustAssessment';
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onUpgradePress?: () => void;
}

/**
 * ProtectFeature component - Similar to Clerk's <Protect> component
 * Shows content only if user has access to the feature, otherwise shows fallback
 */
export function ProtectFeature({ 
  feature, 
  children, 
  fallback, 
  onUpgradePress 
}: ProtectFeatureProps) {
  const { subscription, canAccessFeature, getCurrentTier, openPricingPage } = useSubscription();

  const hasAccess = canAccessFeature(feature);
  const currentTier = getCurrentTier();

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const featureNames = {
    numerology: 'Numerology Reading',
    loveMatch: 'Love Match',
    trustAssessment: 'Trust Assessment'
  };

  const getUpgradeMessage = () => {
    if (currentTier === 'free') {
      return `Upgrade to Premium to access ${featureNames[feature]} features!`;
    }
    return `This feature requires a higher subscription tier.`;
  };

  // Default fallback UI
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.upgradeCard}
      >
        <Ionicons name="diamond" size={32} color="white" />
        <Text style={styles.title}>Premium Feature</Text>
        <Text style={styles.message}>{getUpgradeMessage()}</Text>
        
        <TouchableOpacity 
          style={styles.upgradeButton} 
          onPress={onUpgradePress || openPricingPage}
        >
          <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
        </TouchableOpacity>
        
        <Text style={styles.currentPlan}>Current: {currentTier} plan</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  upgradeCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 12,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 20,
  },
  upgradeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  currentPlan: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'capitalize',
  },
});