import { NextRequest, NextResponse } from 'next/server';
import { EquitieAIAgent, reasonAboutData, parseCSV, analyzeCSVData, transformInvestorData } from '@/lib/services/ai-agent.service';
import { formulaEngine } from '@/lib/services/formula-engine.service';

const agent = new EquitieAIAgent();

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let message = '';
    let file: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      message = (formData.get('message') as string) || '';
      file = (formData.get('file') as File) || null;
    } else {
      const body = await req.json().catch(() => null);
      message = body?.message || body?.text || '';
      file = null;
    }

    let response = '';
    let extractedData = null;
    let suggestedActions: string[] = [];

    // Process uploaded file with intelligent parsing
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const content = new TextDecoder().decode(arrayBuffer);

      // Handle CSV files (investor data, fee schedules, etc.)
      if (file.name.endsWith('.csv')) {
        const result = await agent.processCSVFile(content, file.name);

        if (result.success) {
          response = `📊 **${result.message}**\n\n`;

          // Check if this is a fee-related CSV
          const lowerContent = content.toLowerCase();
          const isFeeData = lowerContent.includes('fee') || lowerContent.includes('discount') ||
                           lowerContent.includes('premium') || lowerContent.includes('structuring');

          if (isFeeData) {
            // Use formula engine for fee calculations
            response += `💰 **Formula Engine Activated**\n\n`;
            response += `The formula engine calculates Net Capital and fees based on deal templates.\n`;
            response += `Upload transaction data or use API endpoints to calculate fees.\n`;
            
            suggestedActions = ['Calculate Fees', 'Validate Transactions'];
          } else {
            // Regular investor data processing
            if (result.data.analysis) {
              response += `**Data Type:** ${result.data.analysis.type}\n`;
              if (result.data.analysis.interpretation) {
                response += `**GPT-5 Analysis:** ${result.data.analysis.interpretation}\n`;
              }
              response += `**Columns:** ${result.data.analysis.columns.join(', ')}\n`;
              response += `**Rows:** ${result.data.analysis.rowCount}\n`;

              // Column mappings and data quality
              if (result.data.analysis.columnMappings) {
                response += `\n**Column Mappings to Supabase:**\n`;
                Object.entries(result.data.analysis.columnMappings).forEach(([csv, db]) => {
                  response += `• ${csv} → ${db}\n`;
                });
              }
            }

            extractedData = result.data;
            suggestedActions = result.actions || [];
          }
        } else {
          response = `❌ ${result.message}`;
        }
      }
      // Handle PDF files (fee schedules, LPAs, etc.)
      else if (file.type === 'application/pdf') {
        response = `📄 **PDF Processing**\n\n`;
        response += `Analyzing: ${file.name}\n\n`;
        response += `PDF processing is currently being migrated to the new system.\n`;
        response += `Please use CSV format for data import.\n`;
        
        suggestedActions = ['Convert to CSV', 'Manual Entry'];
      }
      else {
        response = `📎 Uploaded: ${file.name}\n\nSupported formats: CSV (investor data, transactions), PDF (coming soon)`;
      }
    }

    // Process user message
    if (message) {
      const lowerMessage = message.toLowerCase();

      // Fee calculation commands
      if (lowerMessage.includes('calculate fee') || lowerMessage.includes('preview fee')) {
        const match = message.match(/deal\s+(\d+)/i);
        const dealId = match ? parseInt(match[1]) : 1;
        const amountMatch = message.match(/\$?([\d,]+)/);
        const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 100000;

        try {
          const calculation = await formulaEngine.calculateForDeal({
            dealId,
            grossCapital: amount
          });

          response = `💰 **Fee Calculation for Deal ${dealId}**\n\n`;
          response += `**Input:** $${amount.toLocaleString()}\n`;
          response += `**Net Capital:** $${calculation.netCapital.toLocaleString()}\n\n`;

          response += `**Fee Breakdown:**\n`;
          response += `• Structuring Fee: $${calculation.structuringFee.toLocaleString()}\n`;
          response += `• Management Fee: $${calculation.managementFee.toLocaleString()}\n`;
          response += `• Performance Fee: $${calculation.performanceFee.toLocaleString()}\n`;
          response += `• Premium Fee: $${calculation.premiumFee.toLocaleString()}\n`;
          response += `• Admin Fee: $${calculation.adminFee.toLocaleString()}\n`;
          response += `• Other Fees: $${calculation.otherFees.toLocaleString()}\n`;
          response += `• **Total Fees:** $${calculation.totalFees.toLocaleString()}\n\n`;
          
          response += `**Formula Used:** ${calculation.formulaUsed}\n`;
          response += `**Calculation Method:** ${calculation.calculationMethod}\n`;

          extractedData = calculation;
        } catch (error: any) {
          response = `❌ Fee calculation error: ${error.message}`;
        }
      }
      // Validate transactions command
      else if (lowerMessage.includes('validate')) {
        const match = message.match(/deal\s+(\d+)/i);
        const dealId = match ? parseInt(match[1]) : 1;

        try {
          const validation = await formulaEngine.validateDealTransactions(dealId);
          
          response = `🔍 **Validation Results for Deal ${dealId}**\n\n`;
          
          const passed = validation.filter(v => v.status === 'PASS').length;
          const warned = validation.filter(v => v.status === 'WARN').length;
          const failed = validation.filter(v => v.status === 'FAIL').length;
          
          response += `✅ Passed: ${passed}\n`;
          response += `⚠️ Warnings: ${warned}\n`;
          response += `❌ Failed: ${failed}\n\n`;
          
          if (failed > 0 || warned > 0) {
            response += `**Issues Found:**\n`;
            validation.filter(v => v.status !== 'PASS').forEach(v => {
              response += `• Transaction ${v.transactionId}: ${v.status} (${v.percentDiff.toFixed(2)}% difference)\n`;
            });
          }
          
          extractedData = validation;
        } catch (error: any) {
          response = `❌ Validation error: ${error.message}`;
        }
      }
      // Import command (original functionality)
      else if (lowerMessage.includes('import') && extractedData?.preview) {
        const investors = transformInvestorData(extractedData.preview);
        const importResult = await agent.importInvestorsToSupabase(investors);

        response = `✅ **${importResult.message}**\n\n`;
        if (importResult.errors.length > 0) {
          response += `⚠️ **Errors encountered:**\n`;
          importResult.errors.forEach(err => {
            response += `• ${err.investor}: ${err.error}\n`;
          });
        } else {
          response += `🎉 All data imported successfully to Supabase!\n`;
        }
      }
      // Enhanced reasoning
      else if (lowerMessage.includes('analyze') || lowerMessage.includes('recommend')) {
        const apiKey = process.env.OPENROUTER_API_KEY!;

        const reasoning = await reasonAboutData(
          extractedData || {},
          message,
          apiKey
        );

        response = `🧠 **AI Analysis:**\n\n`;

        if (reasoning.insights.length > 0) {
          response += `**Insights:**\n`;
          reasoning.insights.forEach(insight => {
            response += `• ${insight}\n`;
          });
          response += '\n';
        }

        if (reasoning.recommendations.length > 0) {
          response += `**Recommendations:**\n`;
          reasoning.recommendations.forEach(rec => {
            response += `• ${rec}\n`;
          });
          response += '\n';
        }

        if (reasoning.nextSteps.length > 0) {
          response += `**Next Steps:**\n`;
          reasoning.nextSteps.forEach(step => {
            response += `• ${step}\n`;
          });
        }
      }
      // Supabase queries (original)
      else if (lowerMessage.includes('how many') || lowerMessage.includes('count') ||
               lowerMessage.includes('total') || lowerMessage.includes('list')) {
        const queryResult = await agent.querySupabase(message);
        response = queryResult.message;
        if (queryResult.data) {
          extractedData = queryResult;
        }
      }
      // Default chat response
      else if (!file) {
        response = await getEnhancedChatResponse(message);
      }
    }

    // If no specific processing, provide helpful response
    if (!response) {
      response = `🤖 **EQUITIE AI Agent**\n\n`;
      response += `I'm your intelligent assistant powered by GPT-5 reasoning and the Formula Engine. I can:\n\n`;
      response += `**📊 Data Processing:**\n`;
      response += `• Parse CSV files (investors, transactions)\n`;
      response += `• Import directly to Supabase\n`;
      response += `• Analyze data quality\n\n`;
      response += `**💰 Formula Calculations:**\n`;
      response += `• Calculate Net Capital based on deal templates\n`;
      response += `• Validate transaction calculations\n`;
      response += `• Generate fee breakdowns\n\n`;
      response += `**🧠 AI Intelligence:**\n`;
      response += `• Deep reasoning about your data\n`;
      response += `• Strategic recommendations\n`;
      response += `• Business insights\n\n`;
      response += `**Try these commands:**\n`;
      response += `• "Calculate fees for deal 1 with $1M"\n`;
      response += `• "Validate deal 1"\n`;
      response += `• Upload a CSV to process data\n`;
    }

    return NextResponse.json({
      response,
      extractedData,
      suggestedActions,
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

async function getEnhancedChatResponse(message: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'openrouter/auto';

  if (!apiKey) {
    return 'OpenRouter API key not configured.';
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: `You are the EQUITIE AI Agent powered by GPT-5 with the Formula Engine integrated. You have deep knowledge of:

1. Formula Calculations:
   - Net Capital calculations based on templates
   - Fee breakdowns (structuring, management, performance, etc.)
   - Validation of transaction calculations
   - Deal-specific formula templates

2. Data Processing:
   - CSV parsing and validation
   - Supabase integration
   - Data quality analysis

3. Business Intelligence:
   - Investment analysis
   - Risk assessment
   - Strategic recommendations
   - Performance metrics

Use step-by-step reasoning to solve complex problems.`
          },
          { role: 'user', content: message }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    const data = await response.json();
    return data?.choices?.[0]?.message?.content || 'I can help you with formula calculations, data processing, and investment analysis. What would you like to know?';
  } catch (error) {
    return 'I\'m your EQUITIE AI Agent with the integrated Formula Engine. Upload a CSV or ask me about calculations, investor data, or investment analysis!';
  }
}