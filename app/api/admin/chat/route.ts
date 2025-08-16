import { NextRequest, NextResponse } from 'next/server';
import { DocumentProcessor } from '@/lib/services/document-processor.service';
import { parseFileWithAI, parseDocumentWithAI, buildLegacyProfileFromMapping, stageLegacyImport } from '@/lib/services/ingest.service';
import { SupabaseDirectClient } from '@/lib/db/supabase/client';
import { SchemaConfig } from '@/lib/db/schema-manager/config';
import fs from 'fs/promises';
import path from 'path';

// Read the bot context for better AI responses
async function getBotContext(): Promise<string> {
  try {
    const contextPath = path.resolve(process.cwd(), 'DOCS', 'EQUITIE_BOT_CONTEXT.md');
    return await fs.readFile(contextPath, 'utf8');
  } catch {
    return '';
  }
}

// Main chat handler using OpenRouter
async function chatWithOpenRouter(params: {
  message: string;
  fileContext?: string;
  extractedData?: any;
  botContext: string;
}): Promise<{ response: string; suggestions?: any }> {
  const { message, fileContext, extractedData, botContext } = params;
  
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return { 
      response: 'OpenRouter API key not configured. Please add OPENROUTER_API_KEY to your .env.local file.' 
    };
  }

  // Build context-aware prompt
  let fullContext = '';
  if (fileContext) {
    fullContext += `\nDocument Content:\n${fileContext}\n`;
  }
  if (extractedData) {
    fullContext += `\nExtracted Data:\n${JSON.stringify(extractedData, null, 2)}\n`;
  }

  const systemPrompt = `You are the EQUITIE bot, an AI assistant specializing in fee calculations, investor management, and deal analysis for the Equitie platform.

${botContext}

You have access to:
1. The document processing system that can handle PDFs, Excel, Images, and Text files
2. The Supabase database with deals, investors, and fee configurations
3. The ability to extract structured data from documents
4. Fee calculation engines and profile management

When users upload documents, analyze them and provide actionable insights. You can:
- Extract fee profiles and suggest configurations
- Parse investor data and prepare it for import
- Calculate fees based on deal parameters
- Query the database for existing data
- Provide guidance on using the admin interfaces

Always be helpful, precise, and provide specific actionable steps when possible.`;

  const body = {
    model: 'openrouter/auto',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: fullContext + '\n\nUser: ' + message }
    ],
    temperature: 0.7,
    max_tokens: 2000
  };

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://equitie.local',
        'X-Title': 'EQUITIE Bot Chat'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter error: ${error}`);
    }

    const data = await response.json();
    const aiResponse = data?.choices?.[0]?.message?.content || 'I couldn\'t process your request.';

    // Parse any structured suggestions from the response
    let suggestions = null;
    if (aiResponse.includes('```json') && aiResponse.includes('```')) {
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        try {
          suggestions = JSON.parse(jsonMatch[1]);
        } catch {}
      }
    }

    return { response: aiResponse, suggestions };
  } catch (error: any) {
    console.error('OpenRouter error:', error);
    return { 
      response: `Error: ${error.message}. Make sure your OpenRouter API key is configured.` 
    };
  }
}

// Handle specific commands
async function handleCommand(message: string, extractedData?: any): Promise<any> {
  const lowerMessage = message.toLowerCase();
  
  // Database queries
  if (lowerMessage.includes('show') && lowerMessage.includes('schema')) {
    const client = new SupabaseDirectClient(new SchemaConfig()).getClient();
    const { data: tables } = await client
      .from('information_schema.tables')
      .select('table_schema, table_name')
      .in('table_schema', ['public', 'fees', 'analytics', 'eng'])
      .order('table_schema');
    
    return {
      response: 'Here are the main database schemas and tables:',
      extractedData: { schemas: tables }
    };
  }

  // Fee calculations
  if (lowerMessage.includes('calculate fee') && lowerMessage.includes('deal')) {
    const dealIdMatch = message.match(/deal\s*(?:id)?\s*(\d+)/i);
    if (dealIdMatch) {
      const dealId = parseInt(dealIdMatch[1]);
      // Query deal and calculate fees
      const client = new SupabaseDirectClient(new SchemaConfig()).getClient();
      const { data: deal } = await client
        .from('deals')
        .select('*')
        .eq('id', dealId)
        .single();
      
      if (deal) {
        return {
          response: `Found Deal #${dealId}: ${deal.name || 'Unnamed'}. You can now upload investor data to calculate fees.`,
          extractedData: { deal }
        };
      }
    }
  }

  // Create profile from extracted data
  if (lowerMessage.includes('create profile') && extractedData) {
    const profile = buildLegacyProfileFromMapping(extractedData);
    return {
      response: 'I\'ve prepared a fee profile configuration based on the extracted data. You can use this in the Fee Profiles admin page.',
      extractedData: { profile, original: extractedData }
    };
  }

  // Stage import
  if (lowerMessage.includes('stage') && lowerMessage.includes('import') && extractedData?.investor_fee_lines) {
    const dealIdMatch = message.match(/deal\s*(?:id)?\s*(\d+)/i);
    if (dealIdMatch) {
      const dealId = parseInt(dealIdMatch[1]);
      const staged = await stageLegacyImport(dealId, extractedData);
      return {
        response: `Successfully staged ${staged} investor records for Deal #${dealId}. Navigate to the Legacy Import page to review and apply.`,
        extractedData: { staged, dealId }
      };
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const message = formData.get('message') as string || '';
    const file = formData.get('file') as File | null;
    
    // Get bot context
    const botContext = await getBotContext();
    
    let fileContext = '';
    let extractedData = null;
    
    // Process uploaded file if present
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Use our existing document processor
      const processedDoc = await DocumentProcessor.processDocument(
        buffer,
        file.name,
        file.type
      );
      
      // Prepare text for AI
      fileContext = DocumentProcessor.prepareForAI(processedDoc);
      
      // Extract structured data using our existing service
      extractedData = await parseFileWithAI(
        buffer,
        file.name,
        file.type
      );
    }
    
    // Check for specific commands first
    const commandResult = await handleCommand(message, extractedData);
    if (commandResult) {
      return NextResponse.json(commandResult);
    }
    
    // General chat with OpenRouter
    const { response, suggestions } = await chatWithOpenRouter({
      message,
      fileContext,
      extractedData,
      botContext
    });
    
    // Build response with helpful links
    let enhancedResponse = response;
    
    // Add contextual links based on conversation
    if (extractedData?.deal || response.toLowerCase().includes('profile')) {
      enhancedResponse += '\n\n📝 **Next Steps:**\n';
      enhancedResponse += '• [Open Fee Profiles](/admin/fees/profiles) to create or edit profiles\n';
    }
    
    if (extractedData?.investor_fee_lines || response.toLowerCase().includes('import')) {
      if (!enhancedResponse.includes('Next Steps')) {
        enhancedResponse += '\n\n📝 **Next Steps:**\n';
      }
      enhancedResponse += '• [Open Legacy Import](/admin/fees/import) to stage and apply investor data\n';
    }
    
    return NextResponse.json({
      response: enhancedResponse,
      extractedData: extractedData || suggestions,
      fileInfo: file ? {
        name: file.name,
        type: file.type,
        size: file.size
      } : undefined
    });
    
  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { 
        response: `Error: ${error.message}. Please check your configuration and try again.`,
        error: error.message 
      },
      { status: 500 }
    );
  }
}