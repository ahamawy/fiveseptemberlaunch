import { NextRequest, NextResponse } from 'next/server';
import { FeeMatchingEngine } from '@/lib/services/fee-engine/matching-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      fee_records, 
      auto_apply = false, 
      confidence_threshold = 0.8 
    } = body;
    
    const engine = new FeeMatchingEngine();
    
    if (auto_apply) {
      // Auto-match all unprocessed fees
      const result = await engine.autoMatch(confidence_threshold);
      return NextResponse.json({
        success: true,
        ...result
      });
    } else if (fee_records) {
      // Match specific fee records
      const matches = await engine.batchMatch(fee_records);
      
      // Convert Map to object for JSON response
      const results: any = {};
      for (const [index, candidates] of matches.entries()) {
        results[index] = candidates;
      }
      
      return NextResponse.json({
        success: true,
        matches: results,
        total_records: fee_records.length
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'No fee records provided'
      }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Matching failed'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const engine = new FeeMatchingEngine();
    const unmatched = await engine.getUnmatchedFees();
    
    return NextResponse.json({
      success: true,
      unmatched_count: unmatched.length,
      records: unmatched.slice(0, 100) // Limit response size
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch unmatched fees'
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { matches } = body;
    
    if (!matches || !Array.isArray(matches)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid matches array'
      }, { status: 400 });
    }
    
    const engine = new FeeMatchingEngine();
    const result = await engine.applyMatches(matches);
    
    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to apply matches'
    }, { status: 500 });
  }
}