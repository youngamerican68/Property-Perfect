import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Define protected routes
  const protectedRoutes = ['/dashboard', '/account']
  const authRoutes = ['/login', '/signup']

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Extract token from cookies
  const token = request.cookies.get('sb-access-token')?.value ||
                request.cookies.get('supabase-auth-token')?.value

  let isAuthenticated = false

  if (token) {
    try {
      // Create Supabase client for server-side auth
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // Verify the token
      const { data: { user }, error } = await supabase.auth.getUser(token)
      isAuthenticated = !!user && !error
    } catch (error) {
      console.error('Token verification failed:', error)
      isAuthenticated = false
    }
  }

  if (isProtectedRoute && !isAuthenticated) {
    console.log(`Access denied to protected route: ${pathname}`)
    
    // Redirect to login page with return URL
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('returnTo', pathname)
    
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthRoute && isAuthenticated) {
    console.log(`Authenticated user accessing auth route: ${pathname}`)
    
    // Get return URL from query params or default to dashboard
    const returnTo = request.nextUrl.searchParams.get('returnTo') || '/dashboard'
    const redirectUrl = new URL(returnTo, request.url)
    
    return NextResponse.redirect(redirectUrl)
  }

  // Handle API routes
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next()
    
    // Set CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    return response
  }

  // Add security headers for all requests
  const response = NextResponse.next()
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

// TODO: Implement helper functions
// async function verifyJwtToken(token: string) {
//   try {
//     // Verify JWT token using your preferred library (e.g., jsonwebtoken, jose)
//     // const payload = jwt.verify(token, process.env.JWT_SECRET!)
//     // return payload
//   } catch (error) {
//     throw new Error('Invalid token')
//   }
// }

// async function checkRateLimit(request: NextRequest) {
//   // Implement rate limiting logic (e.g., using Redis, Upstash, or in-memory store)
//   // Return { exceeded: boolean, remaining: number, resetTime: Date }
//   return { exceeded: false, remaining: 100, resetTime: new Date() }
// }