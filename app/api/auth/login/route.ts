import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // Development mode: simple role-based routing
    if (process.env.NODE_ENV === 'development') {
      const role = email?.includes('admin') ? 'admin' : 'investor';
      
      return NextResponse.json({
        success: true,
        role,
        user: {
          id: 'dev-user-001',
          email,
          name: role === 'admin' ? 'Admin User' : 'Investor User',
        },
        message: 'Development login successful',
      });
    }
    
    // Production: Implement Supabase auth here
    // TODO: Integrate with Supabase Auth
    
    return NextResponse.json({
      success: false,
      message: 'Production authentication not yet implemented',
    }, { status: 501 });
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Authentication failed',
    }, { status: 500 });
  }
}