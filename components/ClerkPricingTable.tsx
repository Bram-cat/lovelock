import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSubscription } from '../hooks/useSubscription';

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  clerkPlanId: string; // This will be the plan ID from Clerk Dashboard
}

interface ClerkPricingTableProps {
  onPlanSelect: (planId: string) => void;
  loading?: boolean;
}

/**
 * PricingTable component - Similar to Clerk's <PricingTable /> component
 * This will eventually be replaced by Clerk's official component when available for React Native
 */
export function ClerkPricingTable({ onPlanSelect, loading = false }: ClerkPricingTableProps) {
  const { subscription, getCurrentTier } = useSubscription();
  
  const currentTier = getCurrentTier();

  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: '$0/month',
      description: 'Perfect for trying out our features',
      clerkPlanId: 'free', // This should match your Clerk plan ID
      features: [
        '3 numerology readings/month',
        '2 love matches/month',
        '1 trust assessment/month',
        'Basic insights'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$4.99/month',
      description: 'Perfect for regular users',
      clerkPlanId: 'premium', // This should match your Clerk plan ID
      popular: true,
      features: [
        '50 numerology readings/month',
        '50 love matches/month',
        '50 trust assessments/month',
        'Advanced AI insights',
        'Priority support',
        'Detailed reports'
      ]
    },
    {
      id: 'unlimited',
      name: 'Unlimited',
      price: '$12.99/month',
      description: 'For power users',
      clerkPlanId: 'unlimited', // This should match your Clerk plan ID
      features: [
        'Unlimited numerology readings',
        'Unlimited love matches',
        'Unlimited trust assessments',
        'Premium AI insights',
        'Priority support',
        'Export capabilities',
        'Advanced analytics'
      ]
    }
  ];

  const isCurrentPlan = (planId: string) => {
    return currentTier === planId;
  };

  const handlePlanSelect = (plan: PricingPlan) => {
    if (isCurrentPlan(plan.id) || loading) return;
    onPlanSelect(plan.clerkPlanId);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>Upgrade anytime, cancel anytime</Text>
      </View>

      <View style={styles.plansContainer}>
        {plans.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planCard,
              plan.popular && styles.popularPlan,
              isCurrentPlan(plan.id) && styles.currentPlan
            ]}
            onPress={() => handlePlanSelect(plan)}
            disabled={isCurrentPlan(plan.id) || loading}
          >
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>MOST POPULAR</Text>
              </View>
            )}

            <View style={styles.planHeader}>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planPrice}>{plan.price}</Text>
              <Text style={styles.planDescription}>{plan.description}</Text>
            </View>

            <View style={styles.planFeatures}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <Ionicons name="checkmark" size={16} color="#34C759" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            <View style={styles.planButton}>
              {isCurrentPlan(plan.id) ? (
                <View style={styles.currentPlanButton}>
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text style={styles.currentPlanButtonText}>Current Plan</Text>
                </View>
              ) : (
                <LinearGradient
                  colors={plan.popular ? ['#34C759', '#30A14E'] : ['#667eea', '#764ba2']}
                  style={styles.selectButton}
                >
                  <Text style={styles.selectButtonText}>
                    {plan.id === 'free' ? 'Downgrade' : 'Select Plan'}
                  </Text>
                </LinearGradient>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <View style={styles.securityInfo}>
          <Ionicons name="shield-checkmark" size={16} color="#34C759" />
          <Text style={styles.securityText}>Secure billing powered by Clerk + Stripe</Text>
        </View>
        <Text style={styles.footerText}>
          All plans include a 30-day money-back guarantee
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D1B69',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  plansContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  planCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    position: 'relative',
  },
  popularPlan: {
    borderColor: '#34C759',
    backgroundColor: '#f9fff9',
    transform: [{ scale: 1.02 }],
  },
  currentPlan: {
    borderColor: '#667eea',
    backgroundColor: '#f0f4ff',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: 20,
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  popularText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D1B69',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#34C759',
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  planFeatures: {
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  planButton: {
    alignItems: 'center',
  },
  selectButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 140,
    alignItems: 'center',
  },
  selectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  currentPlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 140,
    justifyContent: 'center',
  },
  currentPlanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  securityText: {
    fontSize: 14,
    color: '#34C759',
    marginLeft: 6,
    fontWeight: '500',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});