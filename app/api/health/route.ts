import { NextResponse } from 'next/server';
import { getCurrentDataMode, getDataClient } from '@/lib/db/client';

export async function GET() {
  try {
    const mode = getCurrentDataMode();
    const client = getDataClient();
    
    // Test basic data access
    let dataAccessOk = false;
    let testData = null;
    
    try {
      // Try to fetch investor 1 as a basic test
      const investor = await client.getInvestorById(1);
      dataAccessOk = !!investor;
      testData = investor ? {
        id: investor.id,
        name: investor.full_name || investor.name
      } : null;
    } catch (e) {
      console.error('Health check data access failed:', e);
    }
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      dataSource: {
        mode,
        configured: {
          mock: true, // Always available
          supabase: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
        },
        activeUser: testData,
        dataAccessOk
      },
      api: {
        endpoints: [
          '/api/investors/[id]/dashboard',
          '/api/investors/[id]/portfolio',
          '/api/investors/[id]/transactions',
          '/api/investors/[id]/commitments',
          '/api/deals',
          '/api/documents',
          '/api/cache/clear',
          '/api/health'
        ]
      },
      features: {
        devTools: process.env.NEXT_PUBLIC_ENABLE_DEVTOOLS === 'true',
        performanceMonitoring: process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING === 'true',
        errorTracking: process.env.NEXT_PUBLIC_ENABLE_ERROR_TRACKING === 'true'
      }
    };
    
    return NextResponse.json(health);
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}