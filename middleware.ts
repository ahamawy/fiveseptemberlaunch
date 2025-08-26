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
  
  // Block development routes in production
  if (process.env.NODE_ENV === 'production') {
    const isDevRoute = DEV_ONLY_ROUTES.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );
    
    if (isDevRoute) {
      // Redirect to home page for blocked routes
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  // Development mode: bypass auth for all routes
  if (process.env.NODE_ENV === 'development') {
    // Skip auth in development but keep headers for testing
    const response = NextResponse.next();
    response.headers.set('x-user-role', 'admin');
    response.headers.set('x-user-id', 'dev-user');
    
    // Add security headers even in development
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    return response;
  }
  
  // Production: use full auth with security headers
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