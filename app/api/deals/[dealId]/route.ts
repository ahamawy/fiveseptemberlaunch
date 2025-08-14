/**
 * Deal Detail API Route
 * Bridges to the modular feature implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleGetDealWithMetrics } from '@/FEATURES/examples/1.1.1.1.1-deals-data-crud-read-by-id/routes/deals.get';

// Force recompile with updated schema manager

interface RouteParams {
  params: {
    dealId: string;
  };
}

/**
 * GET /api/deals/[dealId]
 * Fetches a single deal by ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  // Delegate to feature module handler
  return handleGetDealWithMetrics(request, params);
}