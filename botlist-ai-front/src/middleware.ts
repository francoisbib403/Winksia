import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that don't require authentication
const publicRoutes = ['/', '/login', '/register', '/auth/callback', '/api/auth/login', '/api/auth/register']

// Routes that are always public (API endpoints, static files)
const alwaysPublicPaths = ['/api/', '/_next/', '/_static/', '/favicon.ico', '/robots.txt', '/sitemap.xml']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow API routes and static files
  for (const path of alwaysPublicPaths) {
    if (pathname.startsWith(path)) {
      return NextResponse.next()
    }
  }

  // Check for authentication token
  const accessToken = request.cookies.get('access_token')?.value || 
    request.cookies.get('accessToken')?.value ||
    request.headers.get('authorization')

  const userData = request.cookies.get('user_data')?.value ||
    request.cookies.get('userData')?.value

  const isAuthenticated = !!(accessToken || userData)

  // If user is authenticated and trying to access home page, redirect to tools
  if (isAuthenticated && pathname === '/') {
    return NextResponse.redirect(new URL('/outils', request.url))
  }

  // If user is authenticated and trying to access login/register, redirect to tools
  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/outils', request.url))
  }

  // Allow public routes for non-authenticated users
  for (const path of publicRoutes) {
    if (pathname === path || pathname.startsWith(path + '/')) {
      return NextResponse.next()
    }
  }

  // If no token or user data, redirect to login
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
