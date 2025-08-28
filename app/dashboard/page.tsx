'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ImageJobEditor from './ImageJobEditor'
import RecentJobs from './RecentJobs'
import { useCredits } from '@/app/context/CreditContext'
import { Coins, TrendingUp, Clock, Star } from 'lucide-react'

export default function DashboardPage() {
  const { creditBalance } = useCredits()

  const stats = [
    {
      name: 'Available Credits',
      value: creditBalance,
      icon: Coins,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Images Enhanced',
      value: '24',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'This Month',
      value: '8',
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Success Rate',
      value: '98%',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to PropertyPerfect Dashboard
          </h1>
          <p className="text-gray-600">
            Transform your property photos with AI-powered enhancement tools.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <IconComponent className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Image Job Editor */}
          <ImageJobEditor />

          {/* Recent Jobs */}
          <RecentJobs />
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500">
          <p>Need help? Contact our support team or visit our documentation.</p>
        </div>
      </div>
    </div>
  )
}