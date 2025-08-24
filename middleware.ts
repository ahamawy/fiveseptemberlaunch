import { NextRequest } from 'next/server';
import { portalAuthMiddleware } from '@/lib/middleware/portal-auth';

export async function middleware(request: NextRequest) {
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