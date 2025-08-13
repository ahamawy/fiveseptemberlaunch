import { NextRequest, NextResponse } from 'next/server';
import { dataClient } from '@/lib/db/client';
import type { DocumentType } from '@/lib/db/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const dealId = searchParams.get('deal_id');
    const investorId = searchParams.get('investor_id');
    const type = searchParams.get('type') as DocumentType | undefined;
    const isSigned = searchParams.get('is_signed');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const documents = await dataClient.getDocuments({
      deal_id: dealId ? parseInt(dealId) : undefined,
      investor_id: investorId ? parseInt(investorId) : undefined,
      type,
      is_signed: isSigned === 'true' ? true : isSigned === 'false' ? false : undefined,
      limit,
      offset
    });

    return NextResponse.json({
      success: true,
      data: documents,
      count: documents.length
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}