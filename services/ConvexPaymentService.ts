import { ConvexReactClient } from "convex/react";
import { api } from "../../convex/_generated/api";

// Initialize Convex client
const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
}

export interface UserSubscription {
  _id: string;
  userId: string;
  planId: string;
  planName: string;
  price: number;
  period: string;
  status: string;
  paymentMethod: string;
  createdAt: number;
  expiresAt?: number;
  cancelledAt?: number;
}

export interface PaymentResult {
  success: boolean;
  error?: string;
  subscriptionId?: string;
}

export class ConvexPaymentService {
  private static instance: ConvexPaymentService;

  static getInstance(): ConvexPaymentService {
    if (!ConvexPaymentService.instance) {
      ConvexPaymentService.instance = new ConvexPaymentService();
    }
    return ConvexPaymentService.instance;
  }

  // Get available subscription plans
  getSubscriptionPlans(): SubscriptionPlan[] {
    return [
      {
        id: 'basic',
        name: 'Basic Plan',
        price: 4.99,
        period: 'month',
        features: ['10 Numerology questions/month', 'Basic compatibility', 'Email support']
      },
      {
        id: 'premium',
        name: 'Premium Plan', 
        price: 9.99,
        period: 'month',
        features: ['Unlimited questions', 'Advanced analysis', 'Priority support']
      },
      {
        id: 'lifetime',
        name: 'Lifetime Access',
        price: 49.99, 
        period: 'lifetime',
        features: ['Everything in Premium', 'Lifetime access', 'No recurring payments']
      }
    ];
  }

  // Create a subscription
  async createSubscription(planId: string, paymentMethod: string = 'card'): Promise<PaymentResult> {
    try {
      console.log('🔄 ConvexPaymentService: Creating subscription...', { planId, paymentMethod });
      
      const result = await convex.mutation(api.payments.createSubscription, {
        planId,
        paymentMethod,
      });

      console.log('✅ ConvexPaymentService: Subscription created successfully', result);
      return {
        success: true,
        subscriptionId: result.subscriptionId,
      };
    } catch (error) {
      console.error('❌ ConvexPaymentService: Failed to create subscription', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create subscription',
      };
    }
  }

  // Get user's current subscription
  async getUserSubscription(): Promise<UserSubscription | null> {
    try {
      console.log('🔄 ConvexPaymentService: Getting user subscription...');
      
      const subscription = await convex.query(api.payments.getUserSubscription);
      
      console.log('✅ ConvexPaymentService: Retrieved user subscription', subscription);
      return subscription;
    } catch (error) {
      console.error('❌ ConvexPaymentService: Failed to get user subscription', error);
      return null;
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string): Promise<PaymentResult> {
    try {
      console.log('🔄 ConvexPaymentService: Cancelling subscription...', { subscriptionId });
      
      await convex.mutation(api.payments.cancelSubscription, {
        subscriptionId: subscriptionId as any, // Type assertion for Convex ID
      });

      console.log('✅ ConvexPaymentService: Subscription cancelled successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ ConvexPaymentService: Failed to cancel subscription', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel subscription',
      };
    }
  }

  // Check if user has active subscription
  async hasActiveSubscription(): Promise<boolean> {
    try {
      console.log('🔄 ConvexPaymentService: Checking active subscription...');
      
      const hasActive = await convex.query(api.payments.hasActiveSubscription);
      
      console.log('✅ ConvexPaymentService: Active subscription check result:', hasActive);
      return hasActive;
    } catch (error) {
      console.error('❌ ConvexPaymentService: Failed to check active subscription', error);
      return false;
    }
  }

  // Simulate payment processing (replace with actual payment provider integration)
  async processPayment(planId: string, paymentDetails: any): Promise<PaymentResult> {
    try {
      console.log('🔄 ConvexPaymentService: Processing payment...', { planId });
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, integrate with Stripe, PayPal, or other payment providers
      const paymentSuccess = Math.random() > 0.1; // 90% success rate for demo
      
      if (!paymentSuccess) {
        return {
          success: false,
          error: 'Payment processing failed. Please try again.',
        };
      }

      // Create subscription after successful payment
      return await this.createSubscription(planId, 'card');
    } catch (error) {
      console.error('❌ ConvexPaymentService: Payment processing failed', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed',
      };
    }
  }

  // Get subscription analytics (for admin/debugging)
  async getSubscriptionAnalytics() {
    try {
      console.log('🔄 ConvexPaymentService: Getting subscription analytics...');
      
      const analytics = await convex.query(api.payments.getSubscriptionAnalytics);
      
      console.log('✅ ConvexPaymentService: Retrieved analytics', analytics);
      return analytics;
    } catch (error) {
      console.error('❌ ConvexPaymentService: Failed to get analytics', error);
      return null;
    }
  }
}

// Export singleton instance
export const convexPaymentService = ConvexPaymentService.getInstance();
export default ConvexPaymentService;
