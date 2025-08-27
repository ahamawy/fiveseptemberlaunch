import { NextRequest, NextResponse } from 'next/server';

// This endpoint has been deprecated as fee matching is now handled by the formula engine
export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'This endpoint has been deprecated. Fee calculations are now handled by the formula engine at /api/admin/equations/calculate'
  }, { status: 410 });
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'This endpoint has been deprecated. Use /api/admin/equations/calculate to calculate fees'
  }, { status: 410 });
}

export async function PATCH(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'This endpoint has been deprecated. Fee calculations are now handled automatically by the formula engine'
  }, { status: 410 });
}