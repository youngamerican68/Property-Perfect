import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'

export async function GET(request: NextRequest) {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    // Get total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    // Get daily enhancements
    const { data: dailyJobs, count: dailyEnhancements } = await supabase
      .from('enhancement_jobs')
      .select('*', { count: 'exact' })
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`)
    
    // Get total enhancements
    const { count: totalEnhancements } = await supabase
      .from('enhancement_jobs')
      .select('*', { count: 'exact', head: true })
    
    // Get active users today (users who made enhancements)
    const activeUserIds = new Set((dailyJobs || []).map(job => job.user_id))
    const activeUsers = activeUserIds.size
    
    // Calculate daily cost ($0.039 per enhancement)
    const dailyCost = (dailyEnhancements || 0) * 0.039
    
    // Get total revenue from purchases
    const { data: purchases } = await supabase
      .from('purchases')
      .select('amount_cents')
    
    const totalRevenue = (purchases || [])
      .reduce((sum, purchase) => sum + (purchase.amount_cents / 100), 0)

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      dailyEnhancements: dailyEnhancements || 0,
      totalEnhancements: totalEnhancements || 0,
      dailyCost: dailyCost,
      totalRevenue: totalRevenue,
      activeUsers: activeUsers
    })

  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json({
      error: 'Failed to fetch statistics',
      message: 'Internal server error'
    }, { status: 500 })
  }
}