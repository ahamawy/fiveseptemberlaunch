import { NextRequest, NextResponse } from "next/server";

/**
 * Admin authentication middleware for API routes
 * Centralizes admin auth logic to prevent duplication and ensure consistency
 */

export interface AdminAuthOptions {
  allowDevelopment?: boolean; // Allow access in development mode (default: true)
  requireStrictAuth?: boolean; // Require auth even in development (default: false)
}

/**
 * Validates admin authentication for API routes
 * @param request - The incoming Next.js request
 * @param options - Configuration options for auth behavior
 * @returns true if authenticated, false otherwise
 */
export function isAdminAuthenticated(
  request: NextRequest,
  options: AdminAuthOptions = {}
): boolean {
  const { allowDevelopment = true, requireStrictAuth = false } = options;

  // In development, allow access unless strict auth is required
  const isDev = process.env.NODE_ENV === "development";
  if (isDev && allowDevelopment && !requireStrictAuth) {
    return true;
  }

  // Check for admin API key
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) {
    // If no admin key is configured, allow in dev only
    return isDev && allowDevelopment;
  }

  // Validate the provided key
  const providedKey = request.headers.get("x-admin-key");
  return providedKey === adminKey;
}

/**
 * Higher-order function to wrap API route handlers with admin authentication
 * @param handler - The API route handler function
 * @param options - Configuration options for auth behavior
 * @returns Wrapped handler with auth check
 */
export function withAdminAuth<T extends any[], R>(
  handler: (request: NextRequest, ...args: T) => Promise<R>,
  options: AdminAuthOptions = {}
) {
  return async (request: NextRequest, ...args: T): Promise<R | NextResponse> => {
    if (!isAdminAuthenticated(request, options)) {
      return NextResponse.json(
        { 
          error: "Unauthorized", 
          message: "Admin authentication required" 
        },
        { status: 401 }
      );
    }

    return handler(request, ...args);
  };
}

/**
 * Middleware for admin routes that require service role access
 * Used for operations that need Supabase service role key
 */
export function requireServiceRole(): boolean {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    console.error("SUPABASE_SERVICE_ROLE_KEY not configured");
    return false;
  }
  return true;
}

/**
 * Combined admin + service role check
 * For operations that need both admin auth and service role access
 */
export function withAdminServiceRole<T extends any[], R>(
  handler: (request: NextRequest, ...args: T) => Promise<R>,
  options: AdminAuthOptions = {}
) {
  return async (request: NextRequest, ...args: T): Promise<R | NextResponse> => {
    // Check admin auth first
    if (!isAdminAuthenticated(request, options)) {
      return NextResponse.json(
        { 
          error: "Unauthorized", 
          message: "Admin authentication required" 
        },
        { status: 401 }
      );
    }

    // Check service role availability
    if (!requireServiceRole()) {
      return NextResponse.json(
        { 
          error: "Configuration Error", 
          message: "Service role not configured" 
        },
        { status: 503 }
      );
    }

    return handler(request, ...args);
  };
}