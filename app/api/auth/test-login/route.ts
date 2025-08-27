import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Only allow in test environments
  if (process.env.NODE_ENV === 'production' && !process.env.SKIP_AUTH) {
    return NextResponse.json(
      { error: 'Test login not available in production' },
      { status: 403 }
    );
  }

  // Create a test session
  const response = NextResponse.json({
    success: true,
    user: {
      id: 'test-user-1',
      email: 'test@example.com',
      role: 'admin',
      investor_id: '1',
    },
  });

  // Set auth cookies that middleware will recognize
  response.cookies.set('sb-access-token', 'test-token', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
  });

  response.cookies.set('supabase-auth-token', 'test-token', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
  });

  return response;
}