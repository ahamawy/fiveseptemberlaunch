import { NextRequest, NextResponse } from 'next/server';
import { parseFileWithAI, buildLegacyProfileFromMapping } from '@/lib/services/ingest.service';

export async function POST(req: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const purpose = formData.get('purpose') as string; // 'profile' or 'import'
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB' }, { status: 400 });
    }
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Process the file and extract data
    const mapping = await parseFileWithAI(
      buffer,
      file.name,
      file.type
    );
    
    // Build profile suggestion if requested
    let profile_suggestion = null;
    if (purpose === 'profile') {
      profile_suggestion = buildLegacyProfileFromMapping(mapping);
    }
    
    return NextResponse.json({
      success: true,
      mapping,
      profile_suggestion,
      file_info: {
        name: file.name,
        type: file.type,
        size: file.size
      }
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process file' },
      { status: 500 }
    );
  }
}

// Configure the route to handle file uploads
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds timeout for OCR processing