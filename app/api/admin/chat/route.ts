import { NextRequest, NextResponse } from 'next/server';

// Simple OpenRouter chat handler
async function chatWithOpenRouter(message: string, fileContext?: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    return 'OpenRouter API key not configured. Please add OPENROUTER_API_KEY to your .env.local file.';
  }

  const systemPrompt = `You are the EQUITIE bot, an AI assistant specializing in fee calculations, investor management, and deal analysis for the Equitie platform.

You help users with:
- Extracting fee profiles from documents
- Parsing investor data from Excel/CSV files
- Calculating fees based on deal parameters
- Answering questions about investment data

Be helpful, precise, and provide specific actionable steps when possible.`;

  const fullMessage = fileContext 
    ? `Document content:\n${fileContext}\n\nUser question: ${message}`
    : message;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://equitie.local',
        'X-Title': 'EQUITIE Bot'
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: fullMessage }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter error:', error);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content || 'I couldn\'t process your request.';
    
  } catch (error: any) {
    console.error('Chat error:', error);
    return `Error: ${error.message}. Please check your API key and try again.`;
  }
}

// Process uploaded file
async function processFile(file: File): Promise<{ text: string; data: any }> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // For now, just extract basic info
    // In production, you'd use proper parsers for Excel, PDF, etc.
    const fileInfo = {
      name: file.name,
      type: file.type,
      size: file.size,
      preview: 'File uploaded successfully. Analysis features coming soon.'
    };

    // Convert to text for context (simplified)
    let text = `Uploaded file: ${file.name}\nType: ${file.type}\nSize: ${(file.size / 1024).toFixed(1)} KB\n`;
    
    // For Excel files, we'd normally parse with xlsx library
    if (file.type.includes('excel') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      text += '\nThis appears to be an Excel file with investor/fee data.';
      text += '\nTo fully process this file, please ensure the xlsx parsing library is installed.';
    }
    
    return { text, data: fileInfo };
  } catch (error: any) {
    console.error('File processing error:', error);
    return { 
      text: `Error processing file: ${error.message}`, 
      data: null 
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const message = formData.get('message') as string || '';
    const file = formData.get('file') as File | null;
    
    let fileContext = '';
    let extractedData = null;
    
    // Process file if uploaded
    if (file) {
      const { text, data } = await processFile(file);
      fileContext = text;
      extractedData = data;
    }
    
    // Get AI response
    const response = await chatWithOpenRouter(message, fileContext);
    
    // Build response
    return NextResponse.json({
      response,
      extractedData,
      fileInfo: file ? {
        name: file.name,
        type: file.type,
        size: file.size
      } : undefined
    });
    
  } catch (error: any) {
    console.error('API route error:', error);
    return NextResponse.json(
      { 
        response: `Error: ${error.message}. Please try again.`,
        error: error.message 
      },
      { status: 500 }
    );
  }
}