import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase-client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    let event: Stripe.Event

    // Verify webhook signature when secret is available
    if (signature && webhookSecret && webhookSecret !== 'whsec_from_stripe_cli') {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      } catch (err) {
        console.error('Webhook signature verification failed:', err)
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 400 }
        )
      }
    } else {
      // For development without webhook secret, parse JSON directly
      try {
        event = JSON.parse(body)
      } catch (err) {
        console.error('Invalid JSON in webhook body:', err)
        return NextResponse.json(
          { error: 'Invalid JSON' },
          { status: 400 }
        )
      }
    }

    console.log('Stripe webhook received:', event.type, event.id)

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event)
        break
        
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event)
        break
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event)
        break
        
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event)
        break
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event)
        break
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event)
        break
        
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event)
        break
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event)
        break
        
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true }, { status: 200 })

  } catch (error) {
    console.error('Stripe webhook error:', error)
    
    // TODO: Log error to monitoring service
    // TODO: Send alert for critical webhook failures
    
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(event: any) {
  try {
    const session = event.data.object
    const { customer, customer_email, metadata, amount_total, currency } = session

    console.log('Checkout completed:', {
      sessionId: session.id,
      customer,
      amount: amount_total,
      currency
    })

    // Extract user ID and plan from metadata
    const userId = metadata?.userId
    const planType = metadata?.planType
    const credits = metadata?.credits

    if (!userId) {
      console.error('No user ID in checkout session metadata')
      return
    }

    if (!credits) {
      console.error('No credits in checkout session metadata')
      return
    }

    const creditsToAdd = parseInt(credits)

    // Update user's credit balance in database
    const { error: creditError } = await supabase
      .from('users')
      .update({ 
        credit_balance: supabase.raw(`credit_balance + ${creditsToAdd}`),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (creditError) {
      console.error('Error updating user credits:', creditError)
      throw new Error('Failed to update user credits')
    }

    // Create purchase record (we'll need to create this table)
    const { error: purchaseError } = await supabase
      .from('purchases')
      .insert([{
        user_id: userId,
        plan_type: planType,
        credits_purchased: creditsToAdd,
        amount_paid: amount_total,
        currency: currency,
        stripe_session_id: session.id,
        customer_email: customer_email,
        purchase_date: new Date().toISOString()
      }])

    if (purchaseError) {
      console.error('Error creating purchase record:', purchaseError)
      // Don't throw here - credits were already added, just log the error
    }

    console.log(`Successfully processed credit purchase for user ${userId}: ${creditsToAdd} credits`)

  } catch (error) {
    console.error('Error handling checkout completion:', error)
    throw error
  }
}

async function handlePaymentSucceeded(event: any) {
  try {
    const paymentIntent = event.data.object
    
    console.log('Payment succeeded:', {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    })

    // TODO: Update payment status in database
    // TODO: Trigger any post-payment actions
    
  } catch (error) {
    console.error('Error handling payment success:', error)
    throw error
  }
}

async function handlePaymentFailed(event: any) {
  try {
    const paymentIntent = event.data.object
    
    console.log('Payment failed:', {
      paymentIntentId: paymentIntent.id,
      lastPaymentError: paymentIntent.last_payment_error
    })

    // TODO: Update payment status in database
    // TODO: Send payment failure notification to user
    // TODO: Log for investigation if needed
    
  } catch (error) {
    console.error('Error handling payment failure:', error)
    throw error
  }
}

async function handleSubscriptionCreated(event: any) {
  try {
    const subscription = event.data.object
    
    console.log('Subscription created:', {
      subscriptionId: subscription.id,
      customer: subscription.customer,
      status: subscription.status
    })

    // TODO: Update user's subscription status in database
    // TODO: Grant subscription benefits
    
  } catch (error) {
    console.error('Error handling subscription creation:', error)
    throw error
  }
}

async function handleSubscriptionUpdated(event: any) {
  try {
    const subscription = event.data.object
    
    console.log('Subscription updated:', {
      subscriptionId: subscription.id,
      status: subscription.status
    })

    // TODO: Update subscription status in database
    // TODO: Handle plan changes, cancellations, etc.
    
  } catch (error) {
    console.error('Error handling subscription update:', error)
    throw error
  }
}

async function handleSubscriptionDeleted(event: any) {
  try {
    const subscription = event.data.object
    
    console.log('Subscription deleted:', {
      subscriptionId: subscription.id,
      customer: subscription.customer
    })

    // TODO: Update user's subscription status to cancelled
    // TODO: Revoke subscription benefits
    // TODO: Send cancellation confirmation email
    
  } catch (error) {
    console.error('Error handling subscription deletion:', error)
    throw error
  }
}

async function handleInvoicePaymentSucceeded(event: any) {
  try {
    const invoice = event.data.object
    
    console.log('Invoice payment succeeded:', {
      invoiceId: invoice.id,
      subscriptionId: invoice.subscription,
      amount: invoice.amount_paid
    })

    // TODO: Update subscription billing status
    // TODO: Add credits if applicable
    
  } catch (error) {
    console.error('Error handling invoice payment success:', error)
    throw error
  }
}

async function handleInvoicePaymentFailed(event: any) {
  try {
    const invoice = event.data.object
    
    console.log('Invoice payment failed:', {
      invoiceId: invoice.id,
      subscriptionId: invoice.subscription,
      attemptCount: invoice.attempt_count
    })

    // TODO: Handle failed recurring payments
    // TODO: Send payment failure notification
    // TODO: Suspend service if needed
    
  } catch (error) {
    console.error('Error handling invoice payment failure:', error)
    throw error
  }
}