import { NextRequest, NextResponse } from 'next/server';
import { investorsService } from '@/lib/services';
import { apiSuccess, apiError, withCache, withHeaders } from '@/lib/utils/api-response';
import { CommitmentsResponseSchema } from '@/lib/contracts/api/commitments';
import * as crypto from 'crypto';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  const correlationId = crypto.randomUUID();
  
  try {
    // Log request for debugging
    console.log(`[Commitments API] Request for investor ${params.id}`, { correlationId });
    
    const investorId = parseInt(params.id);
    if (isNaN(investorId)) {
      return apiError(new Error("Invalid investor ID"), 400, "Invalid investor ID format");
    }
    
    // Get commitments from investor service (which uses investor_units)
    const result = await investorsService.getInvestorCommitments(investorId) as any;
    
    // Handle null result with default data
    const commitmentsData = (result && result.commitments) ? result : {
      commitments: [],
      summary: {
        totalCommitments: 0,
        activeCommitments: 0,
        totalCommitted: 0,
        totalCalled: 0,
        totalDistributed: 0,
        totalRemaining: 0,
        averageCallPercentage: 0,
        weightedMOIC: 1.0,
        weightedIRR: 0,
      },
      upcomingCalls: []
    };
    
    // Ensure summary has required fields for schema validation
    if (commitmentsData.summary) {
      commitmentsData.summary.weightedMOIC = commitmentsData.summary.weightedMOIC ?? 1.0;
      commitmentsData.summary.weightedIRR = commitmentsData.summary.weightedIRR ?? 0;
    }
    
    // Transform commitments to match our schema
    const transformedCommitments = (commitmentsData.commitments || []).map((c: any) => ({
      dealId: c.dealId || 0,
      dealName: c.dealName || '',
      companyName: c.companyName || null,
      companyLogoUrl: c.companyLogoUrl || null,
      sector: c.companySector || c.sector || null,
      dealType: c.dealType || 'equity',
      dealStatus: c.dealStatus || 'active',
      commitment: c.committedAmount || c.commitment || 0,
      capitalCalled: c.capitalCalled || 0,
      percentageCalled: c.percentageCalled || 0,
      capitalDistributed: c.capitalDistributed || 0,
      capitalRemaining: c.capitalRemaining || 0,
      currentValue: c.currentValue || c.capitalCalled || 0,
      moic: c.moic || 1.0,
      irr: c.irr || 0,
      currency: c.currency || 'USD',
      lastCallDate: c.lastCallDate || null,
      nextCallDate: c.nextCallDate || null,
      documentsCount: c.documentsCount || 0,
    }));
    
    const transformedData = {
      commitments: transformedCommitments,
      summary: commitmentsData.summary,
      upcomingCalls: commitmentsData.upcomingCalls || [],
    };
    
    // Validate response data with Zod
    const validatedData = CommitmentsResponseSchema.parse(transformedData);
    
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Create successful response with metadata
    let response = apiSuccess(validatedData, {
      correlationId,
      responseTime,
      commitmentsCount: validatedData.commitments.length,
      hasUpcomingCalls: validatedData.upcomingCalls.length > 0,
    });
    
    response = withCache(response, { sMaxage: 60, staleWhileRevalidate: 300 });
    response = withHeaders(response, { 'X-Correlation-Id': correlationId });
    
    return response;
  } catch (error) {
    console.error(`[Commitments API] Error for investor ${params.id}`, {
      error,
      correlationId,
      duration: Date.now() - startTime,
    });
    
    // Handle Zod validation errors specifically
    if (error instanceof Error && error.name === 'ZodError') {
      return apiError(error, 500, "Commitments data validation failed");
    }
    
    return apiError(error, 500, "Failed to fetch commitments");
  }
}