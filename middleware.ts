import { NextRequest, NextResponse } from 'next/server';
import { portalAuthMiddleware } from '@/lib/middleware/portal-auth';

export async function middleware(request: NextRequest) {
  // Development mode: bypass auth for all routes
  if (process.env.NODE_ENV === 'development') {
    // Skip auth in development but keep headers for testing
    const response = NextResponse.next();
    response.headers.set('x-user-role', 'admin');
    response.headers.set('x-user-id', 'dev-user');
    return response;
  }
  
  // Production: use full auth
  return portalAuthMiddleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};