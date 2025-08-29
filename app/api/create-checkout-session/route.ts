import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase-client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function POST(request: NextRequest) {
  try {
    // Get user from auth header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 })
    }

    const body = await request.json()
    const { planType, credits, price } = body

    // Validate required fields
    if (!planType || !credits || !price) {
      return NextResponse.json({ 
        error: 'Missing required fields: planType, credits, price' 
      }, { status: 400 })
    }

    // Define plan configurations
    const planConfigs = {
      'Starter': { credits: 25, price: 19 },
      'Professional': { credits: 75, price: 49 },
      'Agency': { credits: 300, price: 149 }
    }

    // Validate plan
    if (!planConfigs[planType as keyof typeof planConfigs]) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 })
    }

    const config = planConfigs[planType as keyof typeof planConfigs]
    if (credits !== config.credits || price !== config.price) {
      return NextResponse.json({ error: 'Invalid plan configuration' }, { status: 400 })
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `PropertyPerfect ${planType} Pack`,
              description: `${credits} photo enhancement credits with LightLab relighting`,
            },
            unit_amount: price * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        userEmail: user.email || '',
        planType,
        credits: credits.toString(),
        price: price.toString(),
      },
      customer_email: user.email || undefined,
    })

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    }, { status: 200 })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ 
        error: 'Payment service error',
        message: error.message 
      }, { status: 400 })
    }
    
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Failed to create checkout session'
    }, { status: 500 })
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { 
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  })
}