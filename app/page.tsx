import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Sparkles, 
  Home as HomeIcon, 
  Paintbrush, 
  Wand2, 
  Clock, 
  Star, 
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export default function Home() {
  const features = [
    {
      icon: HomeIcon,
      title: 'Smart Decluttering',
      description: 'Automatically remove unwanted objects and clutter from your property photos with AI precision.',
    },
    {
      icon: Paintbrush,
      title: 'Virtual Staging',
      description: 'Add beautiful furniture and decor to empty spaces, making properties more appealing to buyers.',
    },
    {
      icon: Sparkles,
      title: 'Photo Enhancement',
      description: 'Improve lighting, colors, and overall quality to make your listings stand out.',
    },
    {
      icon: Wand2,
      title: 'Damage Repair',
      description: 'Fix wall damage, stains, and imperfections to showcase properties at their best.',
    },
    {
      icon: Clock,
      title: 'Lightning Fast',
      description: 'Process your images in under 60 seconds. No more waiting hours for professional editing.',
    },
    {
      icon: Star,
      title: 'Professional Quality',
      description: 'Get results that match professional photo editing at a fraction of the cost.',
    },
  ]

  const pricingTiers = [
    {
      name: 'Starter',
      price: 19,
      credits: 25,
      description: 'Perfect for individual agents',
      features: [
        '25 photo enhancements',
        'All enhancement tools',
        'High-resolution outputs',
        'Email support',
      ],
      buttonText: 'Get Started',
      popular: false,
    },
    {
      name: 'Professional',
      price: 49,
      credits: 75,
      description: 'Ideal for active agents',
      features: [
        '75 photo enhancements',
        'All enhancement tools',
        'High-resolution outputs',
        'Priority support',
        'Batch processing',
      ],
      buttonText: 'Most Popular',
      popular: true,
    },
    {
      name: 'Agency',
      price: 149,
      credits: 300,
      description: 'For real estate teams',
      features: [
        '300 photo enhancements',
        'All enhancement tools',
        'High-resolution outputs',
        'Dedicated support',
        'Batch processing',
        'Team management',
      ],
      buttonText: 'Contact Sales',
      popular: false,
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Transform Your Property Photos with{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AI Magic
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Remove clutter, add virtual staging, and enhance your real estate photos in seconds. 
              Professional results without the professional price tag.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="text-lg px-8 py-4">
                  Start Enhancing Photos
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                  View Pricing
                </Button>
              </Link>
            </div>
            <div className="mt-12">
              <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Before</h3>
                    <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">Original Property Photo</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">After</h3>
                    <div className="w-full h-48 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-700 font-medium">✨ AI-Enhanced Photo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Enhance Property Photos
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered tools give you professional-quality photo editing capabilities 
              in an easy-to-use interface.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <IconComponent className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that fits your needs. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <Card 
                key={index} 
                className={`relative ${
                  tier.popular 
                    ? 'border-2 border-blue-500 shadow-2xl scale-105' 
                    : 'border shadow-lg'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${tier.price}</span>
                    <span className="text-gray-600 ml-2">one-time</span>
                  </div>
                  <CardDescription className="text-lg mt-2">
                    {tier.credits} photo credits • {tier.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link href="/pricing">
                    <Button 
                      className={`w-full ${
                        tier.popular 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : ''
                      }`}
                      variant={tier.popular ? 'default' : 'outline'}
                    >
                      {tier.buttonText}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Property Photos?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of real estate professionals who trust PropertyPerfect 
            to enhance their listings.
          </p>
          <Link href="/dashboard">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
