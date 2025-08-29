'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Star, ArrowRight } from 'lucide-react'

export default function PricingPage() {
  const pricingTiers = [
    {
      name: 'Starter',
      price: 19,
      credits: 25,
      pricePerCredit: 0.76,
      description: 'Perfect for individual agents getting started',
      features: [
        '25 photo enhancements',
        'All enhancement tools (Declutter, Stage, Enhance, Repair)',
        'LightLab relighting (Golden Hour, Soft Overcast, Bright Daylight)',
        'High-resolution outputs (up to 4K)',
        'Email support',
        'Standard processing speed',
        '30-day credit validity',
      ],
      buttonText: 'Buy Starter Pack',
      popular: false,
      savings: null,
    },
    {
      name: 'Professional',
      price: 49,
      credits: 75,
      pricePerCredit: 0.65,
      description: 'Ideal for active real estate agents',
      features: [
        '75 photo enhancements',
        'All enhancement tools (Declutter, Stage, Enhance, Repair)',
        'LightLab relighting (Golden Hour, Soft Overcast, Bright Daylight, Cozy Evening)',
        'High-resolution outputs (up to 4K)',
        'Priority support',
        'Faster processing speed',
        'Batch processing (up to 10 images)',
        '60-day credit validity',
        'Usage analytics dashboard',
      ],
      buttonText: 'Buy Professional Pack',
      popular: true,
      savings: '15% savings',
    },
    {
      name: 'Agency',
      price: 149,
      credits: 300,
      pricePerCredit: 0.50,
      description: 'For real estate teams and agencies',
      features: [
        '300 photo enhancements',
        'All enhancement tools (Declutter, Stage, Enhance, Repair)',
        'Full LightLab suite (All lighting presets + time-of-day transformations)',
        'High-resolution outputs (up to 4K)',
        'Dedicated account manager',
        'Fastest processing speed',
        'Batch processing (up to 50 images)',
        '90-day credit validity',
        'Advanced analytics and reporting',
        'Team management tools',
        'Custom branding options',
        'API access (coming soon)',
      ],
      buttonText: 'Buy Agency Pack',
      popular: false,
      savings: '35% savings',
    },
  ]

  const handlePurchase = async (tierName: string, price: number) => {
    try {
      // Get the tier configuration
      const tier = pricingTiers.find(t => t.name === tierName)
      if (!tier) {
        alert('Invalid plan selected')
        return
      }

      // Get auth token
      const { supabase } = await import('@/lib/supabase-client')
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        // Redirect to login with return URL
        window.location.href = `/login?returnTo=${encodeURIComponent('/pricing')}`
        return
      }

      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          planType: tierName,
          credits: tier.credits,
          price: tier.price
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const { url } = await response.json()
      
      // Redirect to Stripe Checkout
      window.location.href = url

    } catch (error) {
      console.error('Purchase error:', error)
      alert(`Purchase failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleContactSales = () => {
    // TODO: Implement contact sales functionality
    console.log('Contact sales clicked')
    alert('Redirecting to contact form...')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your property photos with AI and professional relighting. 
            Never shoot at the wrong time of day again. Pay once, use anytime.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {pricingTiers.map((tier, index) => (
            <Card 
              key={index} 
              className={`relative ${
                tier.popular 
                  ? 'border-2 border-blue-500 shadow-2xl scale-105 z-10' 
                  : 'border shadow-lg'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                  {tier.savings && (
                    <div className="text-green-600 text-sm font-medium">
                      {tier.savings}
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  <span className="text-5xl font-bold">${tier.price}</span>
                  <span className="text-gray-600 ml-2">one-time</span>
                </div>
                
                <div className="mt-2 space-y-1">
                  <CardDescription className="text-lg">
                    {tier.credits} photo credits
                  </CardDescription>
                  <CardDescription className="text-sm text-gray-500">
                    ${tier.pricePerCredit.toFixed(2)} per credit • {tier.description}
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-4">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="pt-4">
                  {tier.name === 'Agency' ? (
                    <div className="space-y-2">
                      <Button 
                        onClick={() => handlePurchase(tier.name, tier.price)}
                        className={`w-full ${
                          tier.popular 
                            ? 'bg-blue-600 hover:bg-blue-700' 
                            : ''
                        }`}
                        variant={tier.popular ? 'default' : 'outline'}
                      >
                        {tier.buttonText}
                      </Button>
                      <Button 
                        onClick={handleContactSales}
                        variant="ghost"
                        className="w-full text-sm"
                      >
                        Or contact sales for custom plans
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => handlePurchase(tier.name, tier.price)}
                      className={`w-full ${
                        tier.popular 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : ''
                      }`}
                      variant={tier.popular ? 'default' : 'outline'}
                    >
                      {tier.buttonText}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Do credits expire?
                </h3>
                <p className="text-gray-600">
                  Credits have different validity periods: Starter (30 days), Professional (60 days), 
                  Agency (90 days). This gives you plenty of time to use them.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What enhancement tools are included?
                </h3>
                <p className="text-gray-600">
                  All plans include our complete suite: Smart Decluttering, Virtual Staging, 
                  Photo Enhancement, and Damage Repair tools.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I upgrade later?
                </h3>
                <p className="text-gray-600">
                  Yes! You can purchase additional credits at any time. Your unused credits 
                  will carry over with their original expiration dates.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What file formats are supported?
                </h3>
                <p className="text-gray-600">
                  We support JPG, PNG, and WEBP formats up to 10MB and 4096x4096 resolution 
                  for the best quality results.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How fast is the processing?
                </h3>
                <p className="text-gray-600">
                  Most images are processed in under 60 seconds. Professional and Agency 
                  plans get priority processing for even faster results.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Is there a refund policy?
                </h3>
                <p className="text-gray-600">
                  We offer a 30-day satisfaction guarantee. If you're not happy with the results, 
                  we'll refund your unused credits.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-blue-600 rounded-lg p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Property Photos?
          </h2>
          <p className="text-xl text-blue-100 mb-6">
            Join thousands of real estate professionals who trust PropertyPerfect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button 
              onClick={handleContactSales}
              size="lg" 
              variant="outline" 
              className="text-lg px-8 border-white text-white hover:bg-white hover:text-blue-600"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}