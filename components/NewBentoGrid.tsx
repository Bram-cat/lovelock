import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface NewBentoGridProps {
  navigateToTab: (tab: string) => void;
  canAccessFeature: (feature: string) => boolean;
  setShowSubscriptionModal: (show: boolean) => void;
  setShowDailyVibe: (show: boolean) => void;
  setShowAIInsights: (show: boolean) => void;
  showAlert: (config: any) => void;
  hasProfile: boolean;
}

export default function NewBentoGrid({
  navigateToTab,
  canAccessFeature,
  setShowSubscriptionModal,
  setShowDailyVibe,
  setShowAIInsights,
  showAlert,
  hasProfile,
}: NewBentoGridProps) {
  return (
    <View style={styles.newBentoContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.newSectionTitle}>Your Cosmic Dashboard</Text>
        <Text style={styles.newSectionSubtitle}>
          Discover your destiny through numbers, love, and intuition
        </Text>
      </View>

      {/* New Modern Bento Grid Layout */}
      <View style={styles.newBentoGrid}>
        {/* Primary Features Row */}
        <View style={styles.primaryRow}>
          {/* Main Numerology Card */}
          <TouchableOpacity
            style={styles.primaryCard}
            onPress={() => navigateToTab("numerology")}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.newCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconWrapper}>
                    <Ionicons name="calculator" size={28} color="#FFFFFF" />
                  </View>
                  <View style={styles.popularBadge}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={styles.popularText}>Popular</Text>
                  </View>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>Numerology Reading</Text>
                  <Text style={styles.cardDescription}>
                    Discover your life path and destiny numbers
                  </Text>
                </View>
                <View style={styles.cardFooter}>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Love & Trust Column */}
          <View style={styles.secondaryColumn}>
            <TouchableOpacity
              style={styles.smallCard}
              onPress={() => navigateToTab("love-match")}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#ff6b9d', '#c44569']}
                style={styles.smallCardGradient}
              >
                <Ionicons name="heart" size={24} color="#FFFFFF" />
                <Text style={styles.smallCardText}>Love Match</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.smallCard}
              onPress={() => navigateToTab("trust-assessment")}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#4facfe', '#00f2fe']}
                style={styles.smallCardGradient}
              >
                <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
                <Text style={styles.smallCardText}>Trust Check</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Premium Features Row */}
        <View style={styles.premiumRow}>
          <TouchableOpacity
            style={styles.premiumCard}
            onPress={() => {
              if (!canAccessFeature("numerology")) {
                showAlert({
                  title: "🌟 Premium Feature",
                  message: "Daily Vibe insights are available for Premium members!\n\nUpgrade to unlock personalized daily cosmic guidance.",
                  type: "info",
                  buttons: [
                    { text: "Maybe Later", style: "cancel" },
                    { text: "Upgrade Now", style: "primary", onPress: () => setShowSubscriptionModal(true) },
                  ],
                });
                return;
              }
              setShowDailyVibe(true);
            }}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#ffa726', '#fb8c00']}
              style={styles.premiumCardGradient}
            >
              <View style={styles.premiumContent}>
                <Ionicons name="sunny" size={20} color="#FFFFFF" />
                <Text style={styles.premiumText}>Daily Vibe</Text>
                {!canAccessFeature("numerology") && (
                  <Ionicons name="lock-closed" size={14} color="#FFFFFF" />
                )}
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.premiumCard}
            onPress={() => {
              if (!canAccessFeature("numerology")) {
                showAlert({
                  title: "🤖 Premium AI Feature",
                  message: "AI Insights provide deep personalized analysis for Premium members!\n\nUnlock advanced AI-powered cosmic understanding.",
                  type: "info",
                  buttons: [
                    { text: "Maybe Later", style: "cancel" },
                    { text: "Upgrade Now", style: "primary", onPress: () => setShowSubscriptionModal(true) },
                  ],
                });
                return;
              }
              setShowAIInsights(true);
            }}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#a855f7', '#8b5cf6']}
              style={styles.premiumCardGradient}
            >
              <View style={styles.premiumContent}>
                <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                <Text style={styles.premiumText}>AI Insights</Text>
                {!canAccessFeature("numerology") && (
                  <Ionicons name="lock-closed" size={14} color="#FFFFFF" />
                )}
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.premiumCard}
            onPress={() => navigateToTab("profile")}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={hasProfile ? ['#10b981', '#059669'] : ['#ef4444', '#dc2626']}
              style={styles.premiumCardGradient}
            >
              <View style={styles.premiumContent}>
                <Ionicons
                  name={hasProfile ? "checkmark-circle" : "person-add"}
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.premiumText}>
                  {hasProfile ? "Profile ✓" : "Setup"}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  newBentoContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionHeader: {
    marginBottom: 24,
    alignItems: 'center',
  },
  newSectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  newSectionSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  newBentoGrid: {
    gap: 16,
  },
  primaryRow: {
    flexDirection: 'row',
    gap: 16,
  },
  primaryCard: {
    flex: 2,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
  },
  newCardGradient: {
    flex: 1,
    padding: 20,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  popularText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    marginVertical: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  cardFooter: {
    alignSelf: 'flex-end',
  },
  secondaryColumn: {
    flex: 1,
    gap: 16,
  },
  smallCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  smallCardGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  smallCardText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  premiumRow: {
    flexDirection: 'row',
    gap: 12,
  },
  premiumCard: {
    flex: 1,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
  },
  premiumCardGradient: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumContent: {
    alignItems: 'center',
    gap: 6,
  },
  premiumText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});