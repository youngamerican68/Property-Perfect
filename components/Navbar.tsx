'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Menu, X, User, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase-client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setIsLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getUserInitials = (user: SupabaseUser) => {
    const firstName = user.user_metadata?.first_name || ''
    const lastName = user.user_metadata?.last_name || ''
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase()
    }
    return user.email?.[0]?.toUpperCase() || 'U'
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              PropertyPerfect
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/pricing" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Pricing
              </Link>
              {!isLoading && (user ? (
                <>
                  <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                    Dashboard
                  </Link>
                  <div className="ml-4 flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {getUserInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleLogout}
                      className="text-gray-700 hover:text-red-600"
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      Logout
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link 
                href="/pricing" 
                className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              {!isLoading && (user ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {getUserInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="ml-3 text-gray-700">{user.user_metadata?.full_name || user.email}</span>
                    </div>
                  </div>
                  <div className="px-3 py-2">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-gray-700 hover:text-red-600"
                      onClick={() => {
                        setIsMenuOpen(false)
                        handleLogout()
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-2 px-3 py-2">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}