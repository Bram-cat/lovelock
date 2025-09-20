import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { usePayments } from "../hooks/usePayments";
import { useSubscription } from "../hooks/useSubscription";

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PaymentModal({
  visible,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const { user } = useUser();
  const { purchaseSubscription, getSubscriptionPlans, isProcessing } = usePayments();
  const { subscription, openBillingPortal } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<'premium' | 'unlimited'>('premium');

  const plans = getSubscriptionPlans();

  const handlePurchase = async (tier: 'premium' | 'unlimited') => {
    const result = await purchaseSubscription(tier);
    
    if (result?.success) {
      // Payment checkout opened successfully
      // User will complete payment in browser and return to app
      onSuccess?.();
      onClose();
    }
  };

  const handleManageSubscription = async () => {
    await openBillingPortal();
    onClose();
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
            colors={["#667eea", "#764ba2"]}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Ionicons name="diamond" size={32} color="white" />
              <Text style={styles.title}>
                {subscription?.tier !== 'free' ? 'Manage Subscription' : 'Choose Your Plan'}
              </Text>
              <Text style={styles.description}>
                {subscription?.tier !== 'free' 
                  ? `Current: ${subscription.tier} subscription`
                  : 'Unlock unlimited access to all features'
                }
              </Text>
            </View>
          </LinearGradient>

          {/* Content */}
          <ScrollView style={styles.content}>
            {/* Current Subscription Status */}
            {subscription?.tier !== 'free' && (
              <View style={styles.currentSubscriptionContainer}>
                <View style={styles.currentSubscriptionInfo}>
                  <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                  <Text style={styles.currentSubscriptionText}>
                    {subscription.tier.toUpperCase()} Plan Active
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.manageButton}
                  onPress={handleManageSubscription}
                >
                  <Text style={styles.manageButtonText}>Manage</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Plans */}
            <View style={styles.plansContainer}>
              {plans.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  style={[
                    styles.planCard,
                    plan.recommended && styles.recommendedPlan,
                    subscription?.tier === plan.id && styles.activePlan
                  ]}
                  onPress={() => handlePurchase(plan.id as 'premium' | 'unlimited')}
                  disabled={isProcessing || subscription?.tier === plan.id}
                >
                  {plan.recommended && (
                    <View style={styles.recommendedBadge}>
                      <Text style={styles.recommendedText}>RECOMMENDED</Text>
                    </View>
                  )}
                  
                  <View style={styles.planHeader}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planPrice}>{plan.price}</Text>
                    <Text style={styles.planDescription}>{plan.description}</Text>
                  </View>

                  <View style={styles.planFeatures}>
                    {plan.features.map((feature, index) => (
                      <View key={index} style={styles.planFeatureItem}>
                        <Ionicons name="checkmark" size={16} color="#34C759" />
                        <Text style={styles.planFeatureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.planButtonContainer}>
                    {subscription?.tier === plan.id ? (
                      <View style={styles.activePlanButton}>
                        <Ionicons name="checkmark-circle" size={20} color="white" />
                        <Text style={styles.activePlanButtonText}>Current Plan</Text>
                      </View>
                    ) : (
                      <LinearGradient
                        colors={plan.recommended ? ["#34C759", "#30A14E"] : ["#667eea", "#764ba2"]}
                        style={styles.planButton}
                      >
                        {isProcessing ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <>
                            <Ionicons name="arrow-forward" size={16} color="white" />
                            <Text style={styles.planButtonText}>
                              {subscription?.tier !== 'free' ? 'Switch Plan' : 'Subscribe Now'}
                            </Text>
                          </>
                        )}
                      </LinearGradient>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Security Notice */}
            <View style={styles.securityNotice}>
              <Ionicons name="shield-checkmark" size={16} color="#34C759" />
              <Text style={styles.securityText}>
                Secure payment powered by Stripe & Clerk
              </Text>
            </View>

            {/* Terms */}
            <Text style={styles.termsText}>
              By subscribing, you agree to our Terms of Service and Privacy
              Policy. Your subscription will automatically renew monthly until cancelled.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

PaymentModal.displayName = "PaymentModal";

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    overflow: "hidden",
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 24,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    alignItems: "center",
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginTop: 12,
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  content: {
    padding: 24,
  },
  currentSubscriptionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f0f9ff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#34C759",
  },
  currentSubscriptionInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  currentSubscriptionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D1B69",
    marginLeft: 8,
  },
  manageButton: {
    backgroundColor: "#667eea",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  manageButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  plansContainer: {
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#e5e5e5",
    position: "relative",
  },
  recommendedPlan: {
    borderColor: "#34C759",
    backgroundColor: "#f9fff9",
  },
  activePlan: {
    borderColor: "#667eea",
    backgroundColor: "#f0f4ff",
  },
  recommendedBadge: {
    position: "absolute",
    top: -8,
    left: 20,
    backgroundColor: "#34C759",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  planHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  planName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2D1B69",
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#34C759",
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  planFeatures: {
    marginBottom: 20,
  },
  planFeatureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  planFeatureText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
    flex: 1,
  },
  planButtonContainer: {
    alignItems: "center",
  },
  planButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 120,
  },
  planButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 4,
  },
  activePlanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#667eea",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 120,
  },
  activePlanButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 4,
  },
  securityNotice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  securityText: {
    fontSize: 14,
    color: "#34C759",
    marginLeft: 6,
    fontWeight: "500",
  },
  termsText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    lineHeight: 16,
  },
});
