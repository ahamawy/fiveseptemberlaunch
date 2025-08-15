import { NextRequest, NextResponse } from 'next/server';
import { documentsService } from '@/lib/services';
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

    // Use the service layer for consistency and caching
    const result = await documentsService.getDocuments({
      deal_id: dealId ? parseInt(dealId) : undefined,
      investor_id: investorId ? parseInt(investorId) : undefined,
      type,
      is_signed: isSigned === 'true' ? true : isSigned === 'false' ? false : undefined,
      limit,
      offset
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Minimal ingest shape; real implementation would write to public.documents
    // For now, return accepted payload for upstream wiring.
    const required = ['name', 'document_category'];
    const missing = required.filter((k) => !body?.[k]);
    if (missing.length) {
      return NextResponse.json({ error: `Missing: ${missing.join(', ')}` }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: body }, { status: 202 });
  } catch (error) {
    console.error('Error ingesting document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}