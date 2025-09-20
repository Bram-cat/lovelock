import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSubscription } from '../hooks/useSubscription';

interface UsageLimitModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  feature: 'numerology' | 'loveMatch' | 'trustAssessment';
}

export function UsageLimitModal({ visible, onClose, onUpgrade, feature }: UsageLimitModalProps) {
  const { subscription, canUse, getRemaining } = useSubscription();

  const featureNames = {
    numerology: 'Numerology Reading',
    loveMatch: 'Love Match',
    trustAssessment: 'Trust Assessment'
  };

  const remaining = getRemaining(feature);
  const canAccess = canUse(feature);

  if (canAccess) {
    return null; // Don't show modal if user can access the feature
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.header}
          >
            <Ionicons name="diamond" size={32} color="white" />
            <Text style={styles.title}>Upgrade Required</Text>
          </LinearGradient>

          <View style={styles.content}>
            <Text style={styles.message}>
              You've reached your limit for {featureNames[feature]}!
            </Text>

            {subscription?.tier === 'free' && (
              <View style={styles.limitsInfo}>
                <Text style={styles.limitsText}>
                  Free users get {subscription.limits[feature]} {featureNames[feature].toLowerCase()}s per month
                </Text>
                <Text style={styles.upgradeText}>
                  Upgrade to Premium for {feature === 'numerology' ? '25' : feature === 'trustAssessment' ? '15' : '10'} per month or Unlimited for no limits!
                </Text>
              </View>
            )}

            <View style={styles.buttons}>
              <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
                <LinearGradient
                  colors={['#34C759', '#30A14E']}
                  style={styles.upgradeButtonGradient}
                >
                  <Ionicons name="arrow-up" size={16} color="white" />
                  <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Maybe Later</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 340,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  content: {
    padding: 24,
    paddingTop: 0,
  },
  message: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  limitsInfo: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  limitsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  upgradeText: {
    fontSize: 14,
    color: '#34C759',
    textAlign: 'center',
    fontWeight: '600',
  },
  buttons: {
    gap: 12,
  },
  upgradeButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  upgradeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
});