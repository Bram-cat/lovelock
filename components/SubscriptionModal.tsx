import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { DesignSystem } from '../constants/DesignSystem';
import StripeService, { SubscriptionTier, UserSubscription } from '../services/StripeServices';

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
  onSubscriptionChange?: (subscription: UserSubscription | null) => void;
}

export default function SubscriptionModal({
  visible,
  onClose,
  userId,
  userEmail,
  onSubscriptionChange,
}: SubscriptionModalProps) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [processingTier, setProcessingTier] = useState<SubscriptionTier['id'] | null>(null);

  const tiers = StripeService.getAllSubscriptionTiers();

  useEffect(() => {
    if (visible) {
      loadCurrentSubscription();
    }
  }, [visible]);

  const loadCurrentSubscription = async () => {
    try {
      const subscription = await StripeService.getUserSubscription(userId);
      setCurrentSubscription(subscription);
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  const handleUpgrade = async (tierId: 'premium' | 'unlimited') => {
    if (loading || processingTier) return;

    const tier = tiers.find(t => t.id === tierId);
    const tierName = tier?.name || tierId;

    setProcessingTier(tierId);

    try {
      Alert.alert(
        `✨ Upgrade to ${tierName}`,
        `To upgrade to ${tierName}, you'll be redirected to our secure web portal where you can manage your subscription.\n\nYour account will automatically sync once you complete the upgrade.`,
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {
              setProcessingTier(null);
            }
          },
          {
            text: "Continue to Web Portal",
            style: "default",
            onPress: async () => {
              try {
                if (!user) {
                  Alert.alert("Authentication Required", "Please sign in to manage your subscription.");
                  setProcessingTier(null);
                  return;
                }

                // Get the session token for authentication
                const session = await user.getActiveSession();
                const token = await session?.getToken();

                const websiteUrl = 'https://lovelock.it.com';
                const pricingUrl = `${websiteUrl}/pricing?tier=${tierId}&userId=${encodeURIComponent(user.id)}&email=${encodeURIComponent(user.emailAddresses[0]?.emailAddress || '')}&token=${encodeURIComponent(token || '')}&source=mobile`;

                const canOpen = await Linking.canOpenURL(pricingUrl);
                if (canOpen) {
                  await Linking.openURL(pricingUrl);
                  onClose(); // Close modal after successful redirect
                } else {
                  throw new Error('Cannot open website URL');
                }
              } catch (error) {
                console.error('Subscription modal redirect error:', error);
                Alert.alert(
                  "Redirect Failed",
                  "Unable to open the upgrade page. Please check your internet connection and try again.",
                  [{ text: "OK" }]
                );
              } finally {
                setProcessingTier(null);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error during upgrade process:', error);
      setProcessingTier(null);
    }
  };

  const handleCancel = async () => {
    if (!currentSubscription || loading) return;

    setLoading(true);
    try {
      const result = await StripeService.cancelSubscription(userId);
      if (result.success) {
        await loadCurrentSubscription();
        if (onSubscriptionChange) {
          onSubscriptionChange(null);
        }
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTierCard = (tier: SubscriptionTier) => {
    const isCurrentTier = currentSubscription?.tier === tier.id;
    const isFree = tier.id === 'free';
    const canUpgrade = !isCurrentTier && !isFree;
    const isProcessing = processingTier === tier.id;

    return (
      <View key={tier.id} style={[styles.tierCard, isCurrentTier && styles.currentTierCard]}>
        <View style={styles.tierHeader}>
          <Text style={styles.tierName}>{tier.name}</Text>
          {isCurrentTier && <Text style={styles.currentBadge}>Current Plan</Text>}
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {tier.price === 0 ? 'Free' : `$${tier.price.toFixed(2)}`}
          </Text>
          {tier.price > 0 && <Text style={styles.interval}>/{tier.interval}</Text>}
        </View>

        <View style={styles.featuresContainer}>
          {tier.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={16} color="#34C759" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {canUpgrade && (
          <TouchableOpacity
            style={[
              styles.upgradeButton,
              isProcessing && styles.upgradeButtonDisabled,
            ]}
            onPress={() => handleUpgrade(tier.id as 'premium' | 'unlimited')}
            disabled={isProcessing || loading}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.upgradeButtonText}>Upgrade to {tier.name}</Text>
            )}
          </TouchableOpacity>
        )}

        {isCurrentTier && tier.id !== 'free' && (
          <TouchableOpacity
            style={[styles.cancelButton, loading && styles.upgradeButtonDisabled]}
            onPress={handleCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Plan</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>
            Unlock the full power of Lovelock with our premium features
          </Text>

          {/* Web Billing Notice */}
          <View style={styles.webBillingNotice}>
            <Ionicons name="globe-outline" size={24} color="#667eea" />
            <View style={styles.noticeContent}>
              <Text style={styles.noticeTitle}>🌐 Web Billing Required</Text>
              <Text style={styles.noticeText}>
                Subscription upgrades are available through our web app. Visit our website on any browser to manage your subscription.
              </Text>
            </View>
          </View>

          <View style={styles.tiersContainer}>
            {tiers.map(renderTierCard)}
          </View>

          {currentSubscription && (
            <View style={styles.subscriptionInfo}>
              <Text style={styles.subscriptionTitle}>Subscription Details</Text>
              <Text style={styles.subscriptionText}>
                Status: {currentSubscription.status}
              </Text>
              <Text style={styles.subscriptionText}>
                Current Period: {currentSubscription.currentPeriodStart.toLocaleDateString()} - {currentSubscription.currentPeriodEnd.toLocaleDateString()}
              </Text>
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              All subscriptions are managed through Stripe and can be canceled at any time.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginVertical: 20,
    lineHeight: 22,
  },
  tiersContainer: {
    gap: 20,
    marginBottom: 40,
  },
  tierCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#2C2C2E',
  },
  currentTierCard: {
    borderColor: DesignSystem.colors.primary.solidPurple,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tierName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  currentBadge: {
    backgroundColor: DesignSystem.colors.primary.solidPurple,
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  interval: {
    fontSize: 16,
    color: '#8E8E93',
    marginLeft: 4,
  },
  featuresContainer: {
    gap: 12,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
  },
  upgradeButton: {
    backgroundColor: DesignSystem.colors.primary.solidPurple,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  upgradeButtonDisabled: {
    opacity: 0.6,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  subscriptionInfo: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  subscriptionText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  footer: {
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Web billing notice styles
  webBillingNotice: {
    flexDirection: 'row',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderColor: 'rgba(102, 126, 234, 0.3)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  noticeContent: {
    marginLeft: 12,
    flex: 1,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 18,
    opacity: 0.9,
  },
});