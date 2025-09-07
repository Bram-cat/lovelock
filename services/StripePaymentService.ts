import { initPaymentSheet, presentPaymentSheet, createPaymentMethod, confirmPayment } from '@stripe/stripe-react-native';
import { useUser } from '@clerk/clerk-expo';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_...';
const PREMIUM_PRICE_ID = process.env.PREMIUM_PRICE_ID || 'price_1QTlHjHWBv8ZV13N...';

interface PaymentResult {
  success: boolean;
  error?: string;
  paymentIntent?: any;
}

interface SubscriptionResult {
  success: boolean;
  error?: string;
  subscriptionId?: string;
  customerId?: string;
}

export class StripePaymentService {
  
  /**
   * Create a Stripe customer for the user
   */
  static async createCustomer(userId: string, email: string, name?: string): Promise<{customerId?: string, error?: string}> {
    try {
      const response = await fetch('https://api.stripe.com/v1/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email: email,
          name: name || 'Lovelock User',
          metadata: JSON.stringify({
            clerk_user_id: userId,
            app: 'lovelock'
          })
        }).toString(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create customer');
      }

      const customer = await response.json();
      return { customerId: customer.id };
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Create a subscription for the customer
   */
  static async createSubscription(customerId: string, priceId: string = PREMIUM_PRICE_ID): Promise<SubscriptionResult> {
    try {
      const response = await fetch('https://api.stripe.com/v1/subscriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          customer: customerId,
          'items[0][price]': priceId,
          'payment_behavior': 'default_incomplete',
          'payment_settings[save_default_payment_method]': 'on_subscription',
          'expand[0]': 'latest_invoice.payment_intent',
        }).toString(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create subscription');
      }

      const subscription = await response.json();
      return {
        success: true,
        subscriptionId: subscription.id,
        customerId: customerId
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Initialize payment sheet for subscription
   */
  static async initializePaymentSheet(
    customerId: string,
    customerEphemeralKeySecret: string,
    paymentIntentClientSecret: string
  ): Promise<PaymentResult> {
    try {
      const { error } = await initPaymentSheet({
        merchantDisplayName: 'Lovelock',
        customerId: customerId,
        customerEphemeralKeySecret: customerEphemeralKeySecret,
        paymentIntentClientSecret: paymentIntentClientSecret,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: 'Lovelock User',
        },
        returnURL: 'lovelock://stripe-redirect',
        style: 'alwaysDark',
      });

      if (error) {
        console.error('Error initializing payment sheet:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in initializePaymentSheet:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initialize payment'
      };
    }
  }

  /**
   * Present the payment sheet to user
   */
  static async presentPaymentSheet(): Promise<PaymentResult> {
    try {
      const { error } = await presentPaymentSheet();

      if (error) {
        console.error('Error presenting payment sheet:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in presentPaymentSheet:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed'
      };
    }
  }

  /**
   * Create ephemeral key for customer
   */
  static async createEphemeralKey(customerId: string): Promise<{key?: string, error?: string}> {
    try {
      const response = await fetch('https://api.stripe.com/v1/ephemeral_keys', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Stripe-Version': '2023-10-16',
        },
        body: new URLSearchParams({
          customer: customerId,
        }).toString(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create ephemeral key');
      }

      const key = await response.json();
      return { key: key.secret };
    } catch (error) {
      console.error('Error creating ephemeral key:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Complete subscription purchase flow
   */
  static async purchasePremiumSubscription(
    userId: string,
    email: string,
    name?: string
  ): Promise<SubscriptionResult> {
    try {
      console.log('🚀 Starting premium subscription purchase for user:', userId);

      // Step 1: Create or get customer
      const customerResult = await this.createCustomer(userId, email, name);
      if (customerResult.error || !customerResult.customerId) {
        return { success: false, error: customerResult.error || 'Failed to create customer' };
      }

      console.log('✅ Customer created:', customerResult.customerId);

      // Step 2: Create ephemeral key
      const keyResult = await this.createEphemeralKey(customerResult.customerId);
      if (keyResult.error || !keyResult.key) {
        return { success: false, error: keyResult.error || 'Failed to create ephemeral key' };
      }

      console.log('✅ Ephemeral key created');

      // Step 3: Create subscription
      const subscriptionResult = await this.createSubscription(customerResult.customerId);
      if (!subscriptionResult.success || !subscriptionResult.subscriptionId) {
        return { success: false, error: subscriptionResult.error || 'Failed to create subscription' };
      }

      console.log('✅ Subscription created:', subscriptionResult.subscriptionId);

      // Step 4: Get payment intent from subscription
      const subscription = await this.getSubscription(subscriptionResult.subscriptionId);
      if (!subscription || !subscription.latest_invoice?.payment_intent?.client_secret) {
        return { success: false, error: 'Failed to get payment intent' };
      }

      console.log('✅ Payment intent retrieved');

      // Step 5: Initialize payment sheet
      const initResult = await this.initializePaymentSheet(
        customerResult.customerId,
        keyResult.key,
        subscription.latest_invoice.payment_intent.client_secret
      );

      if (!initResult.success) {
        return { success: false, error: initResult.error };
      }

      console.log('✅ Payment sheet initialized');

      // Step 6: Present payment sheet
      const paymentResult = await this.presentPaymentSheet();
      if (!paymentResult.success) {
        return { success: false, error: paymentResult.error };
      }

      console.log('✅ Payment completed successfully');

      return {
        success: true,
        subscriptionId: subscriptionResult.subscriptionId,
        customerId: customerResult.customerId
      };

    } catch (error) {
      console.error('Error in purchasePremiumSubscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Purchase failed'
      };
    }
  }

  /**
   * Get subscription details
   */
  static async getSubscription(subscriptionId: string): Promise<any> {
    try {
      const response = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}?expand[]=latest_invoice.payment_intent`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting subscription:', error);
      return null;
    }
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(subscriptionId: string): Promise<{success: boolean, error?: string}> {
    try {
      const response = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to cancel subscription');
      }

      return { success: true };
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Cancellation failed'
      };
    }
  }

  /**
   * Get customer's active subscriptions
   */
  static async getCustomerSubscriptions(customerId: string): Promise<any[]> {
    try {
      const response = await fetch(`https://api.stripe.com/v1/subscriptions?customer=${customerId}&status=active`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get subscriptions');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error getting customer subscriptions:', error);
      return [];
    }
  }
}

export default StripePaymentService;