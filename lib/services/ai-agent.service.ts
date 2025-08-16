import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseKey);
}

// Parse CSV content into structured data
export function parseCSV(content: string): any[] {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  // Parse headers
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  // Parse data rows
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    data.push(row);
  }
  
  return data;
}

// Analyze CSV data and determine what it contains
export function analyzeCSVData(data: any[]): {
  type: 'investors' | 'fees' | 'transactions' | 'unknown';
  columns: string[];
  rowCount: number;
  summary: string;
  suggestions: string[];
} {
  if (!data || data.length === 0) {
    return {
      type: 'unknown',
      columns: [],
      rowCount: 0,
      summary: 'No data found',
      suggestions: []
    };
  }

  const columns = Object.keys(data[0]);
  const columnLower = columns.map(c => c.toLowerCase());
  
  let type: 'investors' | 'fees' | 'transactions' | 'unknown' = 'unknown';
  let summary = '';
  const suggestions = [];

  // Detect investor data
  if (columnLower.some(c => c.includes('investor') || c.includes('name')) &&
      columnLower.some(c => c.includes('commit') || c.includes('amount'))) {
    type = 'investors';
    summary = `Investor data with ${data.length} records`;
    suggestions.push('Import investors to Supabase investors table');
    suggestions.push('Calculate total commitments');
    suggestions.push('Generate fee calculations');
  }
  // Detect fee data
  else if (columnLower.some(c => c.includes('fee') || c.includes('carry') || c.includes('management'))) {
    type = 'fees';
    summary = `Fee data with ${data.length} records`;
    suggestions.push('Apply fee profile to deals');
    suggestions.push('Calculate fee distributions');
  }
  // Detect transaction data
  else if (columnLower.some(c => c.includes('transaction') || c.includes('payment') || c.includes('distribution'))) {
    type = 'transactions';
    summary = `Transaction data with ${data.length} records`;
    suggestions.push('Import transactions to Supabase');
    suggestions.push('Update investor balances');
  }

  return {
    type,
    columns,
    rowCount: data.length,
    summary,
    suggestions
  };
}

// Transform and validate investor data for Supabase
export function transformInvestorData(data: any[]): any[] {
  return data.map(row => {
    // Map common CSV column names to Supabase schema
    const transformed: any = {
      full_name: row['Investor Name'] || row['Name'] || row['investor_name'] || '',
      primary_email: row['Email'] || row['email'] || `${(row['Name'] || '').toLowerCase().replace(/\s+/g, '.')}@example.com`,
      investor_type: row['Type'] || row['Investor Type'] || 'individual',
      commitment_amount: parseFloat(row['Commitment'] || row['Committed Amount'] || row['Amount'] || '0'),
      paid_amount: parseFloat(row['Paid'] || row['Paid Amount'] || '0'),
      ownership_percentage: parseFloat(row['Ownership %'] || row['Percentage'] || '0'),
      status: 'active',
      kyc_status: 'pending',
      created_at: new Date().toISOString()
    };
    
    // Clean up the data
    if (!transformed.full_name) {
      transformed.full_name = 'Unknown Investor';
    }
    
    return transformed;
  });
}

// Main AI Agent that processes files and updates Supabase
export class EquitieAIAgent {
  private supabase = getSupabaseClient();

  async processCSVFile(content: string, filename: string): Promise<{
    success: boolean;
    data: any;
    message: string;
    actions?: string[];
  }> {
    try {
      // Parse CSV
      const parsedData = parseCSV(content);
      const analysis = analyzeCSVData(parsedData);
      
      if (analysis.type === 'unknown') {
        return {
          success: false,
          data: analysis,
          message: 'Could not determine the type of data in this CSV file.',
          actions: ['Please specify what this data represents']
        };
      }

      // Handle investor data
      if (analysis.type === 'investors') {
        const transformedData = transformInvestorData(parsedData);
        
        return {
          success: true,
          data: {
            analysis,
            preview: transformedData.slice(0, 5),
            totalCommitment: transformedData.reduce((sum, inv) => sum + inv.commitment_amount, 0),
            investorCount: transformedData.length
          },
          message: `Found ${transformedData.length} investors with total commitments of $${transformedData.reduce((sum, inv) => sum + inv.commitment_amount, 0).toLocaleString()}`,
          actions: [
            'Import all investors to Supabase',
            'Update existing investor records',
            'Calculate fee distributions',
            'Generate investor reports'
          ]
        };
      }

      return {
        success: true,
        data: {
          analysis,
          preview: parsedData.slice(0, 5)
        },
        message: `Analyzed ${analysis.type} data with ${analysis.rowCount} records`,
        actions: analysis.suggestions
      };
      
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: `Error processing file: ${error.message}`
      };
    }
  }

  async importInvestorsToSupabase(investors: any[]): Promise<{
    success: boolean;
    message: string;
    imported: number;
    errors: any[];
  }> {
    const errors: any[] = [];
    let imported = 0;

    for (const investor of investors) {
      try {
        const { data, error } = await this.supabase
          .from('investors')
          .upsert({
            ...investor,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'primary_email'
          });

        if (error) {
          errors.push({ investor: investor.full_name, error: error.message });
        } else {
          imported++;
        }
      } catch (err: any) {
        errors.push({ investor: investor.full_name, error: err.message });
      }
    }

    return {
      success: errors.length === 0,
      message: `Imported ${imported} investors${errors.length > 0 ? ` with ${errors.length} errors` : ' successfully'}`,
      imported,
      errors
    };
  }

  async querySupabase(query: string): Promise<any> {
    // Parse the natural language query and execute Supabase operations
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('count') && lowerQuery.includes('investor')) {
      const { count } = await this.supabase
        .from('investors')
        .select('*', { count: 'exact', head: true });
      return { count, message: `There are ${count} investors in the database` };
    }
    
    if (lowerQuery.includes('total') && lowerQuery.includes('commitment')) {
      const { data } = await this.supabase
        .from('investors')
        .select('commitment_amount');
      const total = data?.reduce((sum, inv) => sum + (inv.commitment_amount || 0), 0) || 0;
      return { total, message: `Total commitments: $${total.toLocaleString()}` };
    }
    
    if (lowerQuery.includes('list') && lowerQuery.includes('investor')) {
      const { data } = await this.supabase
        .from('investors')
        .select('full_name, primary_email, commitment_amount')
        .limit(10);
      return { data, message: `Showing ${data?.length || 0} investors` };
    }
    
    return { message: 'Query not understood. Try asking about investor counts, total commitments, or listing investors.' };
  }
}

// GPT-5 style reasoning for complex operations
export async function reasonAboutData(
  data: any[], 
  context: string,
  apiKey: string
): Promise<{
  insights: string[];
  recommendations: string[];
  risks: string[];
  nextSteps: string[];
}> {
  
  // Call OpenRouter with advanced reasoning prompt
  const model = process.env.OPENROUTER_MODEL || 'openrouter/auto';
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [{
        role: 'system',
        content: `You are an advanced GPT-5 reasoning agent for the EQUITIE private equity platform. Use chain-of-thought reasoning to analyze data and provide deep insights. Consider multiple perspectives, identify patterns, and provide actionable intelligence.`
      }, {
        role: 'user',
        content: `Context: ${context}\n\nData Summary: ${JSON.stringify(data.slice(0, 5))}\n\nProvide deep analysis with insights, recommendations, risks, and next steps. Use step-by-step reasoning.`
      }],
      temperature: 0.2,
      max_tokens: 3000
    })
  });

  const result = await response.json();
  const content = result?.choices?.[0]?.message?.content || '';
  
  // Parse the AI response into structured format
  return {
    insights: extractSection(content, 'insights') || ['Data analyzed successfully'],
    recommendations: extractSection(content, 'recommendations') || ['Import data to Supabase', 'Validate all records'],
    risks: extractSection(content, 'risks') || ['Ensure data accuracy before import'],
    nextSteps: extractSection(content, 'next steps') || ['Review the data', 'Confirm import action']
  };
}

function extractSection(content: string, section: string): string[] {
  const regex = new RegExp(`${section}:?([^\\n]*(?:\\n(?!\\w+:)[^\\n]*)*)`, 'i');
  const match = content.match(regex);
  if (match && match[1]) {
    return match[1]
      .split('\n')
      .map(line => line.replace(/^[-•*]\s*/, '').trim())
      .filter(line => line.length > 0);
  }
  return [];
}