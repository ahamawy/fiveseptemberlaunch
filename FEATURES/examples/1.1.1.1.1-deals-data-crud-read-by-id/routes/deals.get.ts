/**
 * Deal GET Route Handler
 * Handles GET /deals/:dealId requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { dealsRepository } from '../repo/deals.read';
import { validateDealDTO } from '../dto/deal';

export interface DealRouteParams {
  dealId: string;
}

/**
 * Handle GET request for a single deal
 */
export async function handleGetDeal(
  request: NextRequest,
  params: DealRouteParams
): Promise<NextResponse> {
  try {
    // Parse and validate dealId
    const dealId = parseInt(params.dealId);
    
    if (isNaN(dealId) || dealId <= 0) {
      return NextResponse.json(
        { error: 'Invalid deal ID' },
        { status: 400 }
      );
    }
    
    // Check access (placeholder for tenant/RLS checks)
    const hasAccess = await dealsRepository.checkDealAccess(dealId);
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }
    
    // Fetch deal data
    const deal = await dealsRepository.getDealById(dealId);
    
    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }
    
    // Validate DTO schema
    try {
      const validatedDeal = validateDealDTO(deal);
      
      // Return successful response
      return NextResponse.json(validatedDeal, {
        status: 200,
        headers: {
          'Cache-Control': 'private, max-age=60', // Cache for 1 minute
        }
      });
    } catch (validationError) {
      console.error('DTO validation failed:', validationError);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error in handleGetDeal:', error);
    
    // Log error details in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error:', error);
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Performance monitoring wrapper (optional)
 */
export async function handleGetDealWithMetrics(
  request: NextRequest,
  params: DealRouteParams
): Promise<NextResponse> {
  const startTime = performance.now();
  
  try {
    const response = await handleGetDeal(request, params);
    
    const duration = performance.now() - startTime;
    
    // Log if exceeds p95 target (150ms)
    if (duration > 150) {
      console.warn(`Deal GET exceeded p95 target: ${duration.toFixed(2)}ms`);
    }
    
    // Add performance header
    const modifiedResponse = new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
    
    modifiedResponse.headers.set('X-Response-Time', `${duration.toFixed(2)}ms`);
    
    return modifiedResponse;
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`Deal GET failed after ${duration.toFixed(2)}ms:`, error);
    throw error;
  }
}