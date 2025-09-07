// This would be your webhook endpoint handler
// Deploy this to Vercel, Netlify, or your backend service

import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { supabase } from '../lib/supabase-client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature']!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancellation(deletedSubscription);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSuccess(invoice);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailure(failedInvoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  try {
    // Get customer to find user_id
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    if (!customer || customer.deleted) {
      throw new Error('Customer not found');
    }

    const userId = (customer as Stripe.Customer).metadata?.clerk_user_id;
    if (!userId) {
      throw new Error('User ID not found in customer metadata');
    }

    const isActive = subscription.status === 'active';
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

    // Update subscription in Supabase
    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        subscription_type: 'premium',
        status: isActive ? 'active' : 'inactive',
        starts_at: new Date(subscription.current_period_start * 1000).toISOString(),
        ends_at: currentPeriodEnd.toISOString(),
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer as string,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,stripe_subscription_id'
      });

    if (error) {
      throw error;
    }

    console.log(`✅ Subscription updated for user ${userId}: ${subscription.status}`);
  } catch (error) {
    console.error('Error handling subscription change:', error);
    throw error;
  }
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  try {
    // Mark subscription as cancelled in Supabase
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      throw error;
    }

    console.log(`✅ Subscription cancelled: ${subscription.id}`);
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
    throw error;
  }
}

async function handlePaymentSuccess(invoice: Stripe.Invoice) {
  try {
    console.log(`✅ Payment succeeded for invoice: ${invoice.id}`);
    // Add any additional logic for successful payments
  } catch (error) {
    console.error('Error handling payment success:', error);
    throw error;
  }
}

async function handlePaymentFailure(invoice: Stripe.Invoice) {
  try {
    console.log(`❌ Payment failed for invoice: ${invoice.id}`);
    // Add logic to handle payment failures (e.g., send notification, suspend access)
  } catch (error) {
    console.error('Error handling payment failure:', error);
    throw error;
  }
}

// Disable body parsing for webhook
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};