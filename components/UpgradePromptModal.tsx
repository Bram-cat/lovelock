import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface UpgradePromptModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  featureName: string;
  usedCount: number;
  limitCount: number;
}

export default function UpgradePromptModal({
  visible,
  onClose,
  title,
  message,
  featureName,
  usedCount,
  limitCount,
}: UpgradePromptModalProps) {

  const handleUpgrade = async (planType: 'premium' | 'unlimited') => {
    try {
      // In a real app, this would integrate with your payment system
      // For now, we'll redirect to the website
      const websiteUrl = 'https://lovelock.it.com';
      const canOpen = await Linking.canOpenURL(websiteUrl);
      if (canOpen) {
        await Linking.openURL(websiteUrl);
      }
    } catch (error) {
      console.error('Upgrade redirect error:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <LinearGradient
            colors={['#ff6b9d', '#c44569']}
            style={styles.modalHeader}
          >
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <Ionicons name="lock-closed" size={48} color="white" />
              <Text style={styles.modalTitle}>{title}</Text>
              <Text style={styles.usageInfo}>
                {usedCount} / {limitCount} used this month
              </Text>
            </View>
          </LinearGradient>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Message */}
            <Text style={styles.messageText}>{message}</Text>

            {/* Premium Plan */}
            <TouchableOpacity
              style={styles.planCard}
              onPress={() => handleUpgrade('premium')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.planGradient}
              >
                <View style={styles.planHeader}>
                  <View style={styles.planTitleContainer}>
                    <Ionicons name="diamond" size={24} color="#FFD700" />
                    <Text style={styles.planTitle}>Premium Plan</Text>
                  </View>
                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>$4.99</Text>
                    <Text style={styles.period}>/ month</Text>
                  </View>
                </View>

                <View style={styles.featuresContainer}>
                  <View style={styles.feature}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.featureText}>25 Numerology readings</Text>
                  </View>
                  <View style={styles.feature}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.featureText}>15 Love Match analyses</Text>
                  </View>
                  <View style={styles.feature}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.featureText}>10 Trust assessments</Text>
                  </View>
                  <View style={styles.feature}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.featureText}>Daily Vibe & AI insights</Text>
                  </View>
                  <View style={styles.feature}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.featureText}>Priority support</Text>
                  </View>
                </View>

                <View style={styles.upgradeButton}>
                  <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
                  <Ionicons name="arrow-forward" size={16} color="white" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Unlimited Plan */}
            <TouchableOpacity
              style={styles.planCard}
              onPress={() => handleUpgrade('unlimited')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#ffa726', '#fb8c00']}
                style={styles.planGradient}
              >
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>MOST POPULAR</Text>
                </View>

                <View style={styles.planHeader}>
                  <View style={styles.planTitleContainer}>
                    <Ionicons name="infinite" size={24} color="#FFD700" />
                    <Text style={styles.planTitle}>Unlimited Plan</Text>
                  </View>
                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>$12.99</Text>
                    <Text style={styles.period}>/ month</Text>
                  </View>
                </View>

                <View style={styles.featuresContainer}>
                  <View style={styles.feature}>
                    <Ionicons name="infinite" size={16} color="#4CAF50" />
                    <Text style={styles.featureText}>Unlimited everything</Text>
                  </View>
                  <View style={styles.feature}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.featureText}>All Premium features</Text>
                  </View>
                  <View style={styles.feature}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.featureText}>Advanced AI insights</Text>
                  </View>
                  <View style={styles.feature}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.featureText}>Exclusive content</Text>
                  </View>
                  <View style={styles.feature}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.featureText}>VIP support</Text>
                  </View>
                </View>

                <View style={styles.upgradeButton}>
                  <Text style={styles.upgradeButtonText}>Go Unlimited</Text>
                  <Ionicons name="arrow-forward" size={16} color="white" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Maybe Later Button */}
            <TouchableOpacity style={styles.maybeLaterButton} onPress={onClose}>
              <Text style={styles.maybeLaterText}>Maybe Later</Text>
            </TouchableOpacity>

            {/* Guarantee */}
            <View style={styles.guarantee}>
              <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
              <Text style={styles.guaranteeText}>
                30-day money-back guarantee • Cancel anytime
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#1C1C1E',
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
  closeButton: {
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
  headerContent: {
    alignItems: 'center',
    paddingTop: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  usageInfo: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  modalContent: {
    padding: 20,
    maxHeight: '75%',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  planCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  planGradient: {
    padding: 20,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingVertical: 6,
    alignItems: 'center',
  },
  popularText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  planTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  period: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  featuresContainer: {
    marginBottom: 20,
    gap: 8,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: 'white',
    flex: 1,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  maybeLaterButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  maybeLaterText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '500',
  },
  guarantee: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 20,
  },
  guaranteeText: {
    color: '#8E8E93',
    fontSize: 12,
    textAlign: 'center',
  },
});