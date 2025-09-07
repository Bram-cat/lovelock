import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface PremiumSubscriptionCardProps {
  onUpgradePress: () => void;
  usageStats?: {
    numerologyRemaining: number;
    loveMatchRemaining: number;
    trustAssessmentRemaining: number;
    daysUntilReset: number;
  } | null;
}

export default function PremiumSubscriptionCard({ onUpgradePress, usageStats }: PremiumSubscriptionCardProps) {
  const hasUsageStats = usageStats && (
    usageStats.numerologyRemaining < 5 || 
    usageStats.loveMatchRemaining < 5 || 
    usageStats.trustAssessmentRemaining < 5
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFD700', '#FFA500', '#FF6B6B']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="diamond" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>Premium Unlock</Text>
              <Text style={styles.subtitle}>Unlimited Readings & AI Insights</Text>
            </View>
          </View>

          {/* Usage Warning */}
          {hasUsageStats && (
            <View style={styles.usageWarning}>
              <Ionicons name="warning" size={16} color="#FF6B6B" />
              <Text style={styles.warningText}>
                You're running low on free readings!
              </Text>
            </View>
          )}

          {/* Features */}
          <View style={styles.features}>
            <View style={styles.featureRow}>
              <Ionicons name="infinite" size={16} color="rgba(255,255,255,0.9)" />
              <Text style={styles.featureText}>Unlimited Numerology Readings</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="heart" size={16} color="rgba(255,255,255,0.9)" />
              <Text style={styles.featureText}>Unlimited Love Compatibility</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="shield-checkmark" size={16} color="rgba(255,255,255,0.9)" />
              <Text style={styles.featureText}>Unlimited Trust Assessments</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="chatbubble-ellipses" size={16} color="rgba(255,255,255,0.9)" />
              <Text style={styles.featureText}>AI-Powered Personalized Insights</Text>
            </View>
          </View>

          {/* Upgrade Button */}
          <TouchableOpacity style={styles.upgradeButton} onPress={onUpgradePress}>
            <LinearGradient
              colors={['#FFFFFF', '#F8F9FF']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Upgrade to Premium</Text>
              <Ionicons name="arrow-forward" size={18} color="#FF6B6B" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Usage Stats */}
          {usageStats && (
            <View style={styles.usageStats}>
              <Text style={styles.usageTitle}>Free Usage Remaining:</Text>
              <View style={styles.usageGrid}>
                <View style={styles.usageItem}>
                  <Text style={styles.usageNumber}>{usageStats.numerologyRemaining}</Text>
                  <Text style={styles.usageLabel}>Numbers</Text>
                </View>
                <View style={styles.usageItem}>
                  <Text style={styles.usageNumber}>{usageStats.loveMatchRemaining}</Text>
                  <Text style={styles.usageLabel}>Love</Text>
                </View>
                <View style={styles.usageItem}>
                  <Text style={styles.usageNumber}>{usageStats.trustAssessmentRemaining}</Text>
                  <Text style={styles.usageLabel}>Trust</Text>
                </View>
              </View>
              <Text style={styles.resetInfo}>
                Resets in {usageStats.daysUntilReset} days
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  gradient: {
    padding: 16,
  },
  content: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  usageWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    flex: 1,
  },
  features: {
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  upgradeButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  usageStats: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  usageTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  usageGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  usageItem: {
    alignItems: 'center',
  },
  usageNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  usageLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  resetInfo: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});