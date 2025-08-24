/**
 * Portal Authentication Middleware
 * 
 * Handles role-based access control for admin and investor portals
 * Integrates with Supabase Auth for user verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export interface UserRole {
  id: string;
  email: string;
  role: 'admin' | 'investor' | 'super_admin';
  investor_id?: string;
  permissions?: string[];
}

export interface AuthContext {
  user: UserRole | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isInvestor: boolean;
  canAccessAdmin: boolean;
  canAccessInvestor: boolean;
}

/**
 * Get Supabase client for middleware
 */
function getSupabaseClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Get access token from cookie or header
  const cookieHeader = request.headers.get('cookie') || '';
  const authHeader = request.headers.get('authorization') || '';

  // Try to extract token from cookie
  let accessToken: string | null = null;
  
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => c.split('='))
    );
    accessToken = cookies['sb-access-token'] || cookies['supabase-auth-token'] || null;
  }

  // Fallback to authorization header
  if (!accessToken && authHeader) {
    accessToken = authHeader.replace('Bearer ', '');
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    },
  });

  return { supabase, accessToken };
}

/**
 * Get user role and permissions from database
 */
async function getUserRole(supabase: any, userId: string): Promise<UserRole | null> {
  try {
    // First check user_profiles table
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*, investor_id')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return null;
    }

    // Determine role based on profile data
    let role: UserRole['role'] = 'investor';
    
    if (profile?.is_admin || profile?.role === 'admin') {
      role = 'admin';
    } else if (profile?.role === 'super_admin') {
      role = 'super_admin';
    }

    // Get investor details if investor_id exists
    let investorData = null;
    if (profile?.investor_id) {
      const { data: investor } = await supabase
        .from('investors.investor')
        .select('id, public_id, email')
        .eq('id', profile.investor_id)
        .single();
      
      investorData = investor;
    }

    return {
      id: userId,
      email: profile?.email || investorData?.email || '',
      role,
      investor_id: profile?.investor_id,
      permissions: profile?.permissions || [],
    };
  } catch (error) {
    console.error('Error in getUserRole:', error);
    return null;
  }
}

/**
 * Main authentication middleware
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthContext> {
  const { supabase, accessToken } = getSupabaseClient(request);

  // Default context for unauthenticated users
  const defaultContext: AuthContext = {
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    isInvestor: false,
    canAccessAdmin: false,
    canAccessInvestor: false,
  };

  if (!accessToken) {
    return defaultContext;
  }

  try {
    // Get user from token
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return defaultContext;
    }

    // Get user role and permissions
    const userRole = await getUserRole(supabase, user.id);

    if (!userRole) {
      return defaultContext;
    }

    // Build auth context
    const context: AuthContext = {
      user: userRole,
      isAuthenticated: true,
      isAdmin: userRole.role === 'admin' || userRole.role === 'super_admin',
      isInvestor: userRole.role === 'investor' || !!userRole.investor_id,
      canAccessAdmin: userRole.role === 'admin' || userRole.role === 'super_admin',
      canAccessInvestor: true, // All authenticated users can access investor portal
    };

    return context;
  } catch (error) {
    console.error('Authentication error:', error);
    return defaultContext;
  }
}

/**
 * Middleware function for Next.js
 */
export async function portalAuthMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip auth for public routes
  const publicRoutes = ['/login', '/signup', '/api/auth', '/api/health'];
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get auth context
  const authContext = await authenticateRequest(request);

  // Check admin routes
  if (pathname.startsWith('/admin')) {
    if (!authContext.canAccessAdmin) {
      // Redirect to login or investor portal
      const redirectUrl = authContext.isAuthenticated 
        ? '/investor-portal/dashboard'
        : '/login';
      
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  // Check investor routes
  if (pathname.startsWith('/investor-portal')) {
    if (!authContext.isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (!authContext.canAccessInvestor) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Check API routes
  if (pathname.startsWith('/api')) {
    // Admin API routes
    if (pathname.startsWith('/api/admin')) {
      if (!authContext.canAccessAdmin) {
        return NextResponse.json(
          { error: 'Unauthorized - Admin access required' },
          { status: 403 }
        );
      }
    }

    // MCP API routes (admin only for write operations)
    if (pathname.startsWith('/api/mcp')) {
      const method = request.method;
      const requiresAdmin = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
      
      if (requiresAdmin && !authContext.canAccessAdmin) {
        return NextResponse.json(
          { error: 'Unauthorized - Admin access required for write operations' },
          { status: 403 }
        );
      }
    }
  }

  // Add auth context to headers for downstream use
  const response = NextResponse.next();
  
  if (authContext.user) {
    response.headers.set('x-user-id', authContext.user.id);
    response.headers.set('x-user-role', authContext.user.role);
    if (authContext.user.investor_id) {
      response.headers.set('x-investor-id', authContext.user.investor_id);
    }
  }

  return response;
}

/**
 * Helper to get auth context in API routes
 */
export async function getAuthContext(request: NextRequest): Promise<AuthContext> {
  return authenticateRequest(request);
}

/**
 * Helper to require specific role
 */
export function requireRole(
  context: AuthContext,
  allowedRoles: Array<'admin' | 'investor' | 'super_admin'>
): boolean {
  if (!context.isAuthenticated || !context.user) {
    return false;
  }

  return allowedRoles.includes(context.user.role);
}

/**
 * Helper to require admin access
 */
export function requireAdmin(context: AuthContext): boolean {
  return context.canAccessAdmin;
}

/**
 * Helper to require investor access
 */
export function requireInvestor(context: AuthContext): boolean {
  return context.canAccessInvestor && !!context.user?.investor_id;
}