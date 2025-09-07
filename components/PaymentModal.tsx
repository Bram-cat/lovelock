import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '@clerk/clerk-expo';
import { StripePaymentService } from '../services/StripePaymentService';

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
  price?: string;
  features?: string[];
}

export default function PaymentModal({
  visible,
  onClose,
  onSuccess,
  title = 'Upgrade to Premium',
  description = 'Unlock unlimited access to all features',
  price = '$4.99/month',
  features = [
    '✨ Unlimited numerology readings',
    '🔮 Unlimited Oracle consultations',
    '💕 Unlimited love compatibility checks',
    '🛡️ Unlimited trust assessments',
    '🎯 Priority AI responses',
    '📈 Advanced insights & predictions'
  ]
}: PaymentModalProps) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  const handlePurchase = async () => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to continue');
      return;
    }

    setLoading(true);
    setProcessingStep('Preparing payment...');

    try {
      const result = await StripePaymentService.purchasePremiumSubscription(
        user.id,
        user.primaryEmailAddress?.emailAddress || '',
        user.fullName || undefined
      );

      if (result.success) {
        setProcessingStep('Payment completed!');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1000);
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert(
        'Payment Failed',
        error instanceof Error ? error.message : 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setProcessingStep('');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Ionicons name="diamond" size={32} color="white" />
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.description}>{description}</Text>
            </View>
          </LinearGradient>

          {/* Content */}
          <View style={styles.content}>
            {/* Price */}
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{price}</Text>
              <Text style={styles.priceSubtext}>Cancel anytime</Text>
            </View>

            {/* Features */}
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>What's included:</Text>
              {features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            {/* Payment Button */}
            <TouchableOpacity
              style={[styles.paymentButton, loading && styles.paymentButtonDisabled]}
              onPress={handlePurchase}
              disabled={loading}
            >
              <LinearGradient
                colors={loading ? ['#ccc', '#999'] : ['#34C759', '#30A14E']}
                style={styles.paymentButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={styles.loadingText}>{processingStep}</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Ionicons name="card" size={20} color="white" />
                    <Text style={styles.paymentButtonText}>Subscribe Now</Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Security Notice */}
            <View style={styles.securityNotice}>
              <Ionicons name="shield-checkmark" size={16} color="#34C759" />
              <Text style={styles.securityText}>
                Secure payment powered by Stripe
              </Text>
            </View>

            {/* Terms */}
            <Text style={styles.termsText}>
              By subscribing, you agree to our Terms of Service and Privacy Policy. 
              Your subscription will automatically renew monthly at {price} until cancelled.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 12,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  content: {
    padding: 24,
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2D1B69',
    marginBottom: 4,
  },
  priceSubtext: {
    fontSize: 14,
    color: '#666',
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D1B69',
    marginBottom: 16,
  },
  featureItem: {
    paddingVertical: 8,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  paymentButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  paymentButtonDisabled: {
    opacity: 0.7,
  },
  paymentButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 8,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  securityText: {
    fontSize: 14,
    color: '#34C759',
    marginLeft: 6,
    fontWeight: '500',
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
});