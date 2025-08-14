import { NextResponse } from 'next/server';
import { resetDataClient } from '@/lib/db/client';
import { investorsService } from '@/lib/services';

export async function POST() {
  try {
    // Clear data client caches
    resetDataClient();
    
    // Clear service layer caches
    investorsService.clearCache();
    
    return NextResponse.json({ 
      success: true, 
      message: 'All caches cleared successfully' 
    });
  } catch (error) {
    console.error('Error clearing caches:', error);
    return NextResponse.json(
      { error: 'Failed to clear caches' },
      { status: 500 }
    );
  }
}