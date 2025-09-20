# 🚀 Updated Clerk Expo Billing Integration Guide

Based on the official Clerk Expo billing documentation (https://clerk.com/docs/expo/billing/b2c-saas), here's the **correct** implementation approach.

## 📋 Important Notes from Official Documentation:

- **Clerk Expo Billing is in Beta**
- **Currently only supports web components** (`@clerk/clerk-expo/web`)
- **Uses `<PricingTable />` component for web only**
- **Access control via `has()` method works on all platforms**

## 🏗️ Step 1: Setup Clerk Billing Dashboard

### 1.1 Enable Billing in Clerk Dashboard
```
1. Go to: https://dashboard.clerk.com
2. Select your Lovelock project
3. Navigate to: Settings → Billing
4. Click: "Enable Billing"
5. Connect your existing Stripe account
```

### 1.2 Create Plans and Features

**Plans to Create:**
- **Free Plan**: `plan_free` (default)
- **Premium Plan**: `plan_premium` with Stripe price: `price_1Rz0lyCWEq8iX3p21iVzCQTK`
- **Unlimited Plan**: `plan_unlimited` with new Stripe price

**Features to Create:**
- `feature_numerology_access`
- `feature_love_match_access`
- `feature_trust_assessment_access`
- `feature_premium_support`

## 🔧 Step 2: Updated Code Implementation

### 2.1 Create Web-Only Pricing Page

Since Clerk's `<PricingTable />` only works on web, create a dedicated pricing page:

```typescript
// Create: app/pricing.tsx (Web-only pricing page)
import { PricingTable } from '@clerk/clerk-expo/web';
import { View, Platform } from 'react-native';

export default function PricingPage() {
  if (Platform.OS !== 'web') {
    // Redirect to native pricing component
    return <NativePricingComponent />;
  }

  return (
    <View style={{ flex: 1 }}>
      <PricingTable />
    </View>
  );
}
```

### 2.2 Updated Subscription Hook (Native Compatible)

```typescript
// hooks/useClerkSubscription.ts
import { useUser } from '@clerk/clerk-expo';
import { useMemo, useCallback } from 'react';
import { Platform, Linking } from 'react-native';

export function useClerkSubscription() {
  const { user, isLoaded } = useUser();

  // Use Clerk's has() method for subscription checking
  const subscription = useMemo(() => {
    if (!isLoaded || !user) return null;

    return {
      hasFreePlan: user.has?.({ plan: 'plan_free' }) ?? true,
      hasPremiumPlan: user.has?.({ plan: 'plan_premium' }) ?? false,
      hasUnlimitedPlan: user.has?.({ plan: 'plan_unlimited' }) ?? false,
      hasNumerologyAccess: user.has?.({ feature: 'feature_numerology_access' }) ?? false,
      hasLoveMatchAccess: user.has?.({ feature: 'feature_love_match_access' }) ?? false,
      hasTrustAssessmentAccess: user.has?.({ feature: 'feature_trust_assessment_access' }) ?? false,
    };
  }, [user, isLoaded]);

  const getCurrentTier = useCallback(() => {
    if (!subscription) return 'free';
    if (subscription.hasUnlimitedPlan) return 'unlimited';
    if (subscription.hasPremiumPlan) return 'premium';
    return 'free';
  }, [subscription]);

  const canAccessFeature = useCallback((feature: 'numerology' | 'loveMatch' | 'trustAssessment') => {
    if (!subscription) return false;
    
    switch (feature) {
      case 'numerology':
        return subscription.hasNumerologyAccess;
      case 'loveMatch':
        return subscription.hasLoveMatchAccess;
      case 'trustAssessment':
        return subscription.hasTrustAssessmentAccess;
      default:
        return false;
    }
  }, [subscription]);

  const openPricingPage = useCallback(async () => {
    if (Platform.OS === 'web') {
      // On web, navigate to pricing page with PricingTable
      window.location.href = '/pricing';
    } else {
      // On native, open web pricing page in browser
      const pricingUrl = 'https://your-app-domain.com/pricing';
      await Linking.openURL(pricingUrl);
    }
  }, []);

  return {
    subscription,
    getCurrentTier,
    canAccessFeature,
    openPricingPage,
    isLoaded,
    user
  };
}
```

### 2.3 Updated Protect Component for Native

```typescript
// components/ClerkProtect.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useClerkSubscription } from '../hooks/useClerkSubscription';

interface ClerkProtectProps {
  feature?: 'numerology' | 'loveMatch' | 'trustAssessment';
  plan?: 'premium' | 'unlimited';
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onUpgradePress?: () => void;
}

/**
 * ClerkProtect component - Similar to Clerk's <Protect> but for React Native
 */
export function ClerkProtect({ 
  feature, 
  plan, 
  children, 
  fallback, 
  onUpgradePress 
}: ClerkProtectProps) {
  const { subscription, canAccessFeature, getCurrentTier, openPricingPage } = useClerkSubscription();

  let hasAccess = false;

  if (feature) {
    hasAccess = canAccessFeature(feature);
  } else if (plan) {
    hasAccess = plan === 'premium' ? subscription?.hasPremiumPlan : subscription?.hasUnlimitedPlan;
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Default fallback UI
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.upgradeCard}
      >
        <Ionicons name="diamond" size={32} color="white" />
        <Text style={styles.title}>Premium Feature</Text>
        <Text style={styles.message}>
          {feature ? `${feature} access` : `${plan} plan`} required
        </Text>
        
        <TouchableOpacity 
          style={styles.upgradeButton} 
          onPress={onUpgradePress || openPricingPage}
        >
          <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
        </TouchableOpacity>
        
        <Text style={styles.currentPlan}>Current: {getCurrentTier()} plan</Text>
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
```

### 2.4 Native Pricing Component Fallback

```typescript
// components/NativePricingComponent.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useClerkSubscription } from '../hooks/useClerkSubscription';

export function NativePricingComponent() {
  const { subscription, getCurrentTier, openPricingPage } = useClerkSubscription();
  
  const currentTier = getCurrentTier();

  const plans = [
    {
      id: 'premium',
      name: 'Premium',
      price: '$4.99/month',
      features: ['50 numerology readings', '50 love matches', '50 trust assessments']
    },
    {
      id: 'unlimited',
      name: 'Unlimited',
      price: '$12.99/month',
      features: ['Unlimited everything', 'Priority support', 'Advanced features']
    }
  ];

  const handleUpgrade = async () => {
    Alert.alert(
      'Upgrade Subscription',
      'You will be redirected to our secure payment page to complete your subscription.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue', 
          onPress: openPricingPage
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Plan</Text>
      <Text style={styles.subtitle}>Current: {currentTier} plan</Text>

      {plans.map((plan) => (
        <View key={plan.id} style={styles.planCard}>
          <LinearGradient
            colors={plan.id === 'premium' ? ['#34C759', '#30A14E'] : ['#667eea', '#764ba2']}
            style={styles.planGradient}
          >
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planPrice}>{plan.price}</Text>
            
            {plan.features.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <Ionicons name="checkmark" size={16} color="white" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
            
            <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
              <Text style={styles.upgradeButtonText}>Upgrade to {plan.name}</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      ))}

      <Text style={styles.footerText}>
        Secure billing powered by Clerk + Stripe
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
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
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 20,
    color: 'white',
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    color: 'white',
    marginLeft: 8,
  },
  upgradeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  upgradeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  footerText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    marginTop: 20,
  },
});
```

## 🎯 Step 3: Usage Examples

### 3.1 Protect Content Based on Plans:

```typescript
import { ClerkProtect } from '../components/ClerkProtect';

function NumerologyScreen() {
  return (
    <ClerkProtect feature="numerology">
      <NumerologyReadingComponent />
    </ClerkProtect>
  );
}
```

### 3.2 Check Subscription Programmatically:

```typescript
import { useClerkSubscription } from '../hooks/useClerkSubscription';

function MyComponent() {
  const { subscription, canAccessFeature, getCurrentTier } = useClerkSubscription();
  
  const isPremium = subscription?.hasPremiumPlan;
  const canUseNumerology = canAccessFeature('numerology');
  const currentTier = getCurrentTier();
  
  return (
    <View>
      <Text>Plan: {currentTier}</Text>
      <Text>Premium: {isPremium ? 'Yes' : 'No'}</Text>
      <Text>Can use numerology: {canUseNumerology ? 'Yes' : 'No'}</Text>
    </View>
  );
}
```

### 3.3 Open Pricing Page:

```typescript
import { useClerkSubscription } from '../hooks/useClerkSubscription';

function UpgradeButton() {
  const { openPricingPage } = useClerkSubscription();
  
  return (
    <TouchableOpacity onPress={openPricingPage}>
      <Text>Upgrade to Premium</Text>
    </TouchableOpacity>
  );
}
```

## 🚀 Benefits of This Approach:

- ✅ **Official Clerk Method**: Uses `has()` for access control
- ✅ **Cross-Platform**: Works on both native and web
- ✅ **Real-time Sync**: Subscription status updates instantly
- ✅ **No Webhooks**: Clerk handles all Stripe events
- ✅ **Beta-Ready**: Follows official Clerk Expo billing patterns

## ⚠️ Important Limitations:

- **Web-Only Pricing**: `<PricingTable />` only works on web
- **Beta Status**: APIs may change
- **Native Fallback**: Need custom pricing UI for native platforms

## 🔧 Next Steps:

1. **Enable Clerk Billing** in dashboard
2. **Create plans and features** in Clerk
3. **Update your components** to use the new hooks
4. **Test on both web and native** platforms
5. **Deploy web pricing page** for complete functionality

This hybrid approach gives you the best of both worlds: official Clerk billing with cross-platform compatibility! 🎉