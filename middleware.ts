/**
 * Next.js Middleware
 * 
 * Handles authentication and route protection for the application.
 * 
 * Authentication Bypass:
 * - Test environment: SKIP_AUTH=true environment variable
 * - Port 3001: Automatically detected as test port
 * - Playwright tests: Detected via headers
 * 
 * Route Protection:
 * - Development-only routes blocked in production
 * - Admin routes require admin role
 * - Investor portal requires authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { portalAuthMiddleware } from '@/lib/middleware/portal-auth';

// Development-only routes that should be blocked in production
const DEV_ONLY_ROUTES = [
  '/test',
  '/test-deals',
  '/test-transactions',
  '/test-summary',
  '/test-real-data',
  '/test-aggregated-portfolio',
  '/test-hub',
  '/admin/formula-manager',
  '/admin/formulas',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // PRIMARY AUTH BYPASS: Environment variable for tests
  // When SKIP_AUTH=true, bypass all authentication checks
  if (process.env.SKIP_AUTH === 'true') {
    console.log('[Middleware] SKIP_AUTH=true - bypassing ALL authentication');
    const response = NextResponse.next();
    response.headers.set('x-user-role', 'admin');
    response.headers.set('x-user-id', 'test-user');
    response.headers.set('x-investor-id', '1');
    return response;
  }
  
  // SECONDARY AUTH BYPASS: Detect test environment via multiple methods
  // Port 3001 is the default test port
  const hostHeader = request.headers.get('host') || '';
  const isPort3001 = hostHeader.includes(':3001');
  
  // Playwright sends these headers for test detection
  const isPlaywrightHeader = request.headers.get('x-playwright-test') === 'true';
  const isSkipAuthHeader = request.headers.get('x-skip-auth') === 'true';
  
  // Log for debugging
  console.log('[Middleware]', { 
    pathname, 
    host: hostHeader, 
    isPort3001,
    isPlaywrightHeader,
    isSkipAuthHeader,
    skipAuthEnv: process.env.SKIP_AUTH 
  });
  
  // Multiple detection methods for test environment
  const isTestEnvironment = 
    isPort3001 || 
    isPlaywrightHeader ||
    isSkipAuthHeader ||
    process.env.PLAYWRIGHT_TEST === 'true';
    
  if (isTestEnvironment) {
    console.log('[Middleware] Test environment detected - bypassing auth');
    const response = NextResponse.next();
    response.headers.set('x-user-role', 'admin');
    response.headers.set('x-user-id', 'test-user');
    response.headers.set('x-investor-id', '1');
    
    // Add security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    return response;
  }
  
  // REMOVED: Duplicate Playwright detection (already handled above)
  
  // PRODUCTION SAFETY: Block test/development routes in production
  if (process.env.NODE_ENV === 'production') {
    const isDevRoute = DEV_ONLY_ROUTES.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );
    
    if (isDevRoute) {
      // Redirect to home page for blocked routes
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  // DEVELOPMENT MODE: Bypass auth for easier development
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  if (isDevelopment) {
    // Skip auth in development but keep headers for testing
    const response = NextResponse.next();
    response.headers.set('x-user-role', 'admin');
    response.headers.set('x-user-id', 'dev-user');
    response.headers.set('x-investor-id', '1');
    
    // Add security headers even in development
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    return response;
  }
  
  // PRODUCTION MODE: Full authentication with Supabase
  const authResponse = await portalAuthMiddleware(request);
  
  // Add institutional-grade security headers
  authResponse.headers.set('X-Frame-Options', 'DENY');
  authResponse.headers.set('X-Content-Type-Options', 'nosniff');
  authResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  authResponse.headers.set('X-XSS-Protection', '1; mode=block');
  authResponse.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  );
  
  return authResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon files (favicon.ico, favicon.svg, etc.)
     * - manifest files
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon\\.ico|favicon\\.svg|icon-.*\\.png|apple-touch-icon\\.png|site\\.webmanifest|public).*)',
  ],
};