import { NextRequest, NextResponse } from 'next/server';
import { portalAuthMiddleware } from '@/lib/middleware/portal-auth';

export async function middleware(request: NextRequest) {
  // Temporarily bypass auth for testing
  if (request.nextUrl.pathname.startsWith('/admin/deals-list') || 
      request.nextUrl.pathname.startsWith('/api/deals-list')) {
    return NextResponse.next();
  }
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