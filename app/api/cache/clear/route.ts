import { NextResponse } from 'next/server';
import { resetDataClient } from '@/lib/db/client';
import { investorsService, dealsService, documentsService } from '@/lib/services';

export async function POST(request: Request) {
  try {
    // Parse optional query params for selective clearing
    const url = new URL(request.url);
    const selective = url.searchParams.get('selective');
    
    const cleared: string[] = [];
    
    // Clear data client caches
    resetDataClient();
    cleared.push('data-client');
    
    // Clear service layer caches
    if (!selective || selective === 'investors') {
      investorsService.clearCache();
      cleared.push('investors-service');
    }
    
    if (!selective || selective === 'deals') {
      dealsService.clearCache();
      cleared.push('deals-service');
    }
    
    if (!selective || selective === 'documents') {
      documentsService.clearCache();
      cleared.push('documents-service');
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Caches cleared successfully',
      cleared,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error clearing caches:', error);
    return NextResponse.json(
      { 
        error: 'Failed to clear caches',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}