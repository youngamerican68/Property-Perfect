import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // TODO: Implement actual authentication logic
  // For now, this middleware allows all requests but logs them
  
  console.log(`Middleware: ${request.method} ${pathname}`)

  // Define protected routes
  const protectedRoutes = ['/dashboard']
  const authRoutes = ['/login', '/signup']

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  )

  // TODO: Extract and validate JWT token from cookies or headers
  // const token = request.cookies.get('auth_token')?.value || 
  //               request.headers.get('authorization')?.replace('Bearer ', '')
  
  // TODO: Verify token and get user data
  // let isAuthenticated = false
  // let user = null
  
  // if (token) {
  //   try {
  //     user = await verifyJwtToken(token)
  //     isAuthenticated = !!user
  //   } catch (error) {
  //     console.error('Token verification failed:', error)
  //     isAuthenticated = false
  //   }
  // }

  // For demo purposes, simulate authentication check
  const mockIsAuthenticated = false // Set to true to test authenticated flow

  if (isProtectedRoute && !mockIsAuthenticated) {
    // TODO: Add auth logic to protect /dashboard routes
    console.log(`Access denied to protected route: ${pathname}`)
    
    // Redirect to login page with return URL
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('returnTo', pathname)
    
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthRoute && mockIsAuthenticated) {
    // If user is already authenticated, redirect away from auth pages
    console.log(`Authenticated user accessing auth route: ${pathname}`)
    
    // Get return URL from query params or default to dashboard
    const returnTo = request.nextUrl.searchParams.get('returnTo') || '/dashboard'
    const redirectUrl = new URL(returnTo, request.url)
    
    return NextResponse.redirect(redirectUrl)
  }

  // TODO: Add rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    // TODO: Implement rate limiting based on IP or user ID
    // const rateLimitResult = await checkRateLimit(request)
    // if (rateLimitResult.exceeded) {
    //   return NextResponse.json(
    //     { error: 'Too many requests' },
    //     { status: 429 }
    //   )
    // }
  }

  // TODO: Add CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next()
    
    // Set CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    return response
  }

  // TODO: Add security headers for all requests
  const response = NextResponse.next()
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // TODO: Add Content Security Policy
  // response.headers.set('Content-Security-Policy', 
  //   "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  // )

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