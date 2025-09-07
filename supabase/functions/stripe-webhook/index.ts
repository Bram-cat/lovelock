import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@18.5.0?target=deno'
import { corsHeaders } from '../_shared/cors.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-12-18.acacia',
  httpClient: Stripe.createFetchHttpClient(),
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')

  try {
    const body = await req.text()
    const receivedEvent = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
      undefined,
      cryptoProvider
    )

    console.log(`🔔 Event received: ${receivedEvent.type}`)

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    switch (receivedEvent.type) {
      case 'checkout.session.completed':
        const session = receivedEvent.data.object
        console.log(`💰 Payment success for session: ${session.id}`)
        
        if (session.mode === 'subscription') {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          
          // Calculate expiry date (30 days from now)
          const expiryDate = new Date()
          expiryDate.setMonth(expiryDate.getMonth() + 1)
          
          // First deactivate existing subscriptions
          await supabaseClient
            .from('subscriptions')
            .update({ status: 'cancelled' })
            .eq('user_id', session.client_reference_id)
            .eq('status', 'active')

          // Create new subscription record
          const { error } = await supabaseClient
            .from('subscriptions')
            .insert({
              user_id: session.client_reference_id,
              subscription_type: 'premium',
              status: 'active',
              starts_at: new Date().toISOString(),
              ends_at: expiryDate.toISOString(),
              stripe_subscription_id: subscription.id,
              stripe_session_id: session.id
            })

          if (error) {
            console.error('❌ Error creating subscription:', error)
            throw error
          }

          console.log('✅ Premium subscription activated for user:', session.client_reference_id)
        }
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = receivedEvent.data.object
        console.log(`🗑️ Subscription cancelled: ${deletedSubscription.id}`)
        
        // Update subscription status to cancelled
        await supabaseClient
          .from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('stripe_subscription_id', deletedSubscription.id)
        
        console.log('✅ Subscription cancelled in database')
        break

      case 'invoice.payment_succeeded':
        const invoice = receivedEvent.data.object
        if (invoice.subscription) {
          console.log(`💳 Payment succeeded for subscription: ${invoice.subscription}`)
          
          // Extend subscription if it's a renewal
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
          const nextBillingDate = new Date(subscription.current_period_end * 1000)
          
          await supabaseClient
            .from('subscriptions')
            .update({ ends_at: nextBillingDate.toISOString() })
            .eq('stripe_subscription_id', subscription.id)
            .eq('status', 'active')
          
          console.log('✅ Subscription renewed until:', nextBillingDate)
        }
        break

      case 'invoice.payment_failed':
        const failedInvoice = receivedEvent.data.object
        console.log(`❌ Payment failed for subscription: ${failedInvoice.subscription}`)
        
        // Could implement grace period or immediate cancellation here
        // For now, let's just log it
        break

      default:
        console.log(`🤷‍♀️ Unhandled event type: ${receivedEvent.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('❌ Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})