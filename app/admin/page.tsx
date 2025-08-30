'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Activity, Users, CreditCard, AlertTriangle, TrendingUp } from 'lucide-react'

interface UsageStats {
  totalUsers: number
  dailyEnhancements: number
  totalEnhancements: number
  dailyCost: number
  totalRevenue: number
  activeUsers: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [emergencyDisabled, setEmergencyDisabled] = useState(false)

  useEffect(() => {
    fetchUsageStats()
    const interval = setInterval(fetchUsageStats, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchUsageStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleEmergencyDisable = async () => {
    try {
      const response = await fetch('/api/admin/emergency-toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disable: !emergencyDisabled })
      })
      
      if (response.ok) {
        setEmergencyDisabled(!emergencyDisabled)
      }
    } catch (error) {
      console.error('Failed to toggle emergency mode:', error)
    }
  }

  const today = new Date().toLocaleDateString()
  const dailyCostLimit = 50 // $50 daily limit
  const costPercentage = stats ? (stats.dailyCost / dailyCostLimit) * 100 : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
          <div className="text-center">Loading usage statistics...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <Badge variant="secondary">{today}</Badge>
        </div>

        {/* Emergency Controls */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Emergency Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">API Emergency Disable</p>
                <p className="text-sm text-gray-600">
                  Instantly disable all image processing to stop costs
                </p>
              </div>
              <Button
                onClick={toggleEmergencyDisable}
                variant={emergencyDisabled ? "default" : "destructive"}
                size="sm"
              >
                {emergencyDisabled ? 'Enable API' : 'Disable API'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Usage Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Daily Cost */}
          <Card className={costPercentage > 80 ? "border-red-300" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Daily AI Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats?.dailyCost.toFixed(2) || '0.00'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {costPercentage.toFixed(1)}% of $50 limit
              </div>
              {costPercentage > 80 && (
                <Badge variant="destructive" className="mt-2 text-xs">
                  Approaching Limit
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Daily Enhancements */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Today's Enhancements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.dailyEnhancements || 0}</div>
              <div className="text-xs text-gray-500 mt-1">
                {50 - (stats?.dailyEnhancements || 0)} remaining today
              </div>
            </CardContent>
          </Card>

          {/* Total Users */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats?.activeUsers || 0} active today
              </div>
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats?.totalRevenue.toFixed(2) || '0.00'}</div>
              <div className="text-xs text-gray-500 mt-1">
                All-time earnings
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cost Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Cost Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <p className="font-medium text-gray-600">Cost Per Enhancement</p>
                <p className="text-lg font-bold">$0.039</p>
                <p className="text-xs text-gray-500">Gemini 2.5 Flash Image</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Average Revenue Per Enhancement</p>
                <p className="text-lg font-bold">$0.65</p>
                <p className="text-xs text-gray-500">~94% gross margin</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Daily Profit</p>
                <p className="text-lg font-bold text-green-600">
                  ${((stats?.dailyEnhancements || 0) * 0.65 - (stats?.dailyCost || 0)).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">Revenue - AI costs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="font-medium">1. Set up Google Cloud Billing Alerts:</p>
              <p className="text-gray-600 ml-4">
                • Go to Google Cloud Console → Billing → Budgets & alerts<br/>
                • Create budget: $100 monthly limit<br/>
                • Set alerts at 50%, 75%, 90%, 100%<br/>
                • Enable automatic service disable at 100%
              </p>
            </div>
            <div>
              <p className="font-medium">2. Monitor this dashboard regularly:</p>
              <p className="text-gray-600 ml-4">
                • Daily cost should stay under $50<br/>
                • Daily enhancements capped at 50<br/>
                • Individual users limited to 10/day
              </p>
            </div>
            <div>
              <p className="font-medium">3. Emergency controls:</p>
              <p className="text-gray-600 ml-4">
                • Use "Disable API" button above for instant stop<br/>
                • Or set DISABLE_AI_API=true in environment variables
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}