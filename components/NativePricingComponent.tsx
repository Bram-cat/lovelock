import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSubscription } from '../hooks/useSubscription';

export function NativePricingComponent() {
  const { subscription, getCurrentTier, openPricingPage } = useSubscription();
  
  const currentTier = getCurrentTier();

  const plans = [
    {
      id: 'pro', // Matches your Clerk dashboard plan key
      name: 'Premium',
      price: '$4.99',
      period: '/month',
      description: 'Perfect for regular users',
      popular: true,
      features: [
        '50 numerology readings/month',
        '50 love matches/month', 
        '50 trust assessments/month',
        'Advanced AI insights',
        'Priority support',
        'Detailed reports'
      ],
      colors: ['#34C759', '#30A14E']
    },
    {
      id: 'unlimited', // Matches your Clerk dashboard plan key
      name: 'Unlimited',
      price: '$12.99',
      period: '/month',
      description: 'For power users',
      popular: false,
      features: [
        'Unlimited numerology readings',
        'Unlimited love matches',
        'Unlimited trust assessments',
        'Premium AI insights',
        'Priority support',
        'Export capabilities',
        'Advanced analytics'
      ],
      colors: ['#667eea', '#764ba2']
    }
  ];

  const handleUpgrade = async () => {
    try {
      await openPricingPage();
    } catch (error) {
      Alert.alert(
        '🌐 Web Upgrade Required',
        'Subscription upgrades are currently only available through our web version.\n\n📱 To upgrade:\n1. Visit our website on your computer or mobile browser\n2. Sign in with the same account\n3. Navigate to the pricing page\n\nYour subscription will sync automatically across all devices once upgraded.',
        [
          { text: 'Got it', style: 'default' }
        ]
      );
    }
  };

  const isCurrentPlan = (planId: string) => {
    return (planId === 'pro' && subscription?.hasPremiumPlan) ||
           (planId === 'unlimited' && subscription?.hasUnlimitedPlan);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Ionicons name="diamond" size={40} color="#667eea" />
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>
          Current plan: <Text style={styles.currentPlan}>{currentTier}</Text>
        </Text>
      </View>

      <View style={styles.plansContainer}>
        {plans.map((plan) => (
          <View key={plan.id} style={styles.planCard}>
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>MOST POPULAR</Text>
              </View>
            )}
            
            <LinearGradient
              colors={plan.colors}
              style={styles.planGradient}
            >
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.planPrice}>{plan.price}</Text>
                  <Text style={styles.planPeriod}>{plan.period}</Text>
                </View>
                <Text style={styles.planDescription}>{plan.description}</Text>
              </View>
              
              <View style={styles.featuresContainer}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={16} color="white" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
              
              <TouchableOpacity 
                style={[
                  styles.upgradeButton,
                  isCurrentPlan(plan.id) && styles.currentPlanButton
                ]} 
                onPress={isCurrentPlan(plan.id) ? undefined : handleUpgrade}
                disabled={isCurrentPlan(plan.id)}
              >
                <Text style={[
                  styles.upgradeButtonText,
                  isCurrentPlan(plan.id) && styles.currentPlanButtonText
                ]}>
                  {isCurrentPlan(plan.id) ? '✓ Current Plan' : `Upgrade to ${plan.name}`}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <View style={styles.securityInfo}>
          <Ionicons name="shield-checkmark" size={20} color="#34C759" />
          <Text style={styles.securityText}>Secure billing powered by Clerk + Stripe</Text>
        </View>
        
        <View style={styles.guarantees}>
          <View style={styles.guaranteeItem}>
            <Ionicons name="refresh" size={16} color="#666" />
            <Text style={styles.guaranteeText}>Cancel anytime</Text>
          </View>
          <View style={styles.guaranteeItem}>
            <Ionicons name="shield" size={16} color="#666" />
            <Text style={styles.guaranteeText}>30-day money-back guarantee</Text>
          </View>
          <View style={styles.guaranteeItem}>
            <Ionicons name="flash" size={16} color="#666" />
            <Text style={styles.guaranteeText}>Instant activation</Text>
          </View>
        </View>

        <Text style={styles.footerNote}>
          Note: Payment processing happens on our secure web portal using Clerk's billing system.
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
    alignItems: 'center',
    padding: 32,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D1B69',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  currentPlan: {
    fontWeight: '600',
    color: '#667eea',
    textTransform: 'capitalize',
  },
  plansContainer: {
    padding: 20,
    gap: 20,
  },
  planCard: {
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    backgroundColor: '#FF9500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 1,
  },
  popularText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  planGradient: {
    padding: 24,
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  planPeriod: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 4,
  },
  planDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: 24,
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: 'white',
    flex: 1,
  },
  upgradeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  currentPlanButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.7,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  currentPlanButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  footer: {
    padding: 24,
    backgroundColor: 'white',
    marginTop: 20,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  securityText: {
    fontSize: 16,
    color: '#34C759',
    fontWeight: '600',
  },
  guarantees: {
    gap: 12,
    marginBottom: 20,
  },
  guaranteeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  guaranteeText: {
    fontSize: 14,
    color: '#666',
  },
  footerNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
  },
});