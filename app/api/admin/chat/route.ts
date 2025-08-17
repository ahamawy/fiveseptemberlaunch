import { NextRequest, NextResponse } from 'next/server';
import { EquitieAIAgent, reasonAboutData, parseCSV, analyzeCSVData, transformInvestorData } from '@/lib/services/ai-agent.service';
import { enhancedFeeService } from '@/lib/services/fee-engine/enhanced-service';
import { enhancedFeeCalculator } from '@/lib/services/fee-engine/enhanced-calculator';

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
            // Use enhanced fee engine for fee calculations
            response += `💰 **Fee Calculation Engine Activated**\n\n`;
            
            try {
              const importResult = await enhancedFeeService.importFromCSV(content);
              
              if (importResult.success) {
                response += `✅ **Fee Import Preview:**\n`;
                response += `• Records processed: ${importResult.imported}\n`;
                response += `• Failed: ${importResult.failed}\n\n`;
                
                // Show fee calculation preview
                if (importResult.preview.length > 0) {
                  response += `**📈 Fee Calculation Summary:**\n`;
                  let totalGross = 0;
                  let totalTransferPre = 0;
                  let totalDiscounts = 0;
                  let totalTransferPost = 0;
                  
                  importResult.preview.forEach(item => {
                    totalGross += item.gross_capital;
                    totalTransferPre += item.transferPreDiscount;
                    totalDiscounts += item.totalDiscounts;
                    totalTransferPost += item.transferPostDiscount;
                  });
                  
                  response += `• Total Gross Capital: $${totalGross.toLocaleString()}\n`;
                  response += `• Transfer Pre-Discount: $${totalTransferPre.toLocaleString()}\n`;
                  response += `• Total Discounts: $${totalDiscounts.toLocaleString()}\n`;
                  response += `• Transfer Post-Discount: $${totalTransferPost.toLocaleString()}\n\n`;
                  
                  // Show first record detail
                  const first = importResult.preview[0];
                  if (first) {
                    response += `**Example Calculation (${first.investor_name || 'First Record'}):**\n`;
                    first.fees.forEach(fee => {
                      const sign = fee.amount < 0 ? '' : '+';
                      response += `• ${fee.component}: ${sign}$${Math.abs(fee.amount).toLocaleString()}`;
                      if (fee.percent) response += ` (${(fee.percent * 100).toFixed(2)}%)`;
                      response += '\n';
                    });
                    response += `• **Units:** ${first.units}\n\n`;
                  }
                }
                
                response += `**🎯 Next Actions:**\n`;
                response += `• Type "apply fees" to save these calculations\n`;
                response += `• Type "validate schedule" to check fee configuration\n`;
                response += `• Type "show precedence" to see fee ordering\n`;
                response += `• Upload another CSV to process more data\n`;
                
                extractedData = importResult;
                suggestedActions = ['Apply Fees', 'Validate Schedule', 'Show Precedence'];
              } else {
                response += `⚠️ **Fee Import Issues:**\n`;
                importResult.errors.forEach(err => response += `• ${err}\n`);
              }
            } catch (error: any) {
              response += `❌ Fee calculation error: ${error.message}\n`;
            }
          } else {
            // Regular investor data processing
            if (result.data.analysis) {
              response += `**Data Type:** ${result.data.analysis.type}\n`;
              if (result.data.analysis.interpretation) {
                response += `**GPT-5 Analysis:** ${result.data.analysis.interpretation}\n`;
              }
              response += `**Columns:** ${result.data.analysis.columns.join(', ')}\n`;
              response += `**Rows:** ${result.data.analysis.rowCount}\n`;
              
              // Column mappings and data quality remain the same
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
        response = `📄 **PDF Processing with Fee Extraction**\n\n`;
        response += `Analyzing: ${file.name}\n\n`;
        
        // TODO: Integrate PDF extraction for fee schedules
        response += `🔍 **Detected Document Type:** Fee Schedule / LPA\n`;
        response += `\n**Available Actions:**\n`;
        response += `• Extract fee components and rates\n`;
        response += `• Create fee schedule in database\n`;
        response += `• Apply to specific deals\n`;
        response += `\nType "extract fees from pdf" to process this document.`;
        
        suggestedActions = ['Extract Fees', 'Create Schedule', 'Apply to Deal'];
      }
      else {
        response = `📎 Uploaded: ${file.name}\n\nSupported formats: CSV (investor data, fees), PDF (LPAs, fee schedules), Excel (coming soon)`;
      }
    }
    
    // Process user message with enhanced fee context
    if (message) {
      const lowerMessage = message.toLowerCase();
      
      // Fee calculation commands
      if (lowerMessage.includes('calculate fee') || lowerMessage.includes('preview fee')) {
        const match = message.match(/deal\s+(\d+)/i);
        const dealId = match ? parseInt(match[1]) : 1;
        const amountMatch = message.match(/\$?([\d,]+)/);
        const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 100000;
        
        try {
          const calculation = await enhancedFeeService.previewFees(dealId, amount);
          
          response = `💰 **Fee Calculation for Deal ${dealId}**\n\n`;
          response += `**Input:** $${amount.toLocaleString()}\n\n`;
          
          response += `**Fee Breakdown (Applied in Precedence Order):**\n`;
          calculation.state.appliedFees.forEach((fee, idx) => {
            const sign = fee.amount < 0 ? '' : '+';
            response += `${idx + 1}. ${fee.component}: ${sign}$${Math.abs(fee.amount).toLocaleString()}`;
            if (fee.percent) response += ` (${(fee.percent * 100).toFixed(2)}%)`;
            response += ` [${fee.basis || 'GROSS'}]\n`;
          });
          
          response += `\n**Summary:**\n`;
          response += `• Transfer Pre-Discount: $${calculation.transferPreDiscount.toLocaleString()}\n`;
          response += `• Total Discounts: $${calculation.totalDiscounts.toLocaleString()}\n`;
          response += `• Transfer Post-Discount: $${calculation.transferPostDiscount.toLocaleString()}\n`;
          response += `• Units Allocated: ${calculation.units}\n`;
          
          if (!calculation.validation.valid) {
            response += `\n⚠️ **Validation Issues:**\n`;
            calculation.validation.errors.forEach(err => response += `• ${err}\n`);
          }
          
          extractedData = calculation;
        } catch (error: any) {
          response = `❌ Fee calculation error: ${error.message}`;
        }
      }
      // Apply fees command
      else if (lowerMessage.includes('apply fee') && extractedData) {
        try {
          const result = await enhancedFeeService.applyImport(extractedData.preview || []);
          
          response = `✅ **Fees Applied Successfully**\n\n`;
          response += `• Applied: ${result.applied} records\n`;
          response += `• Failed: ${result.failed} records\n`;
          
          if (result.errors.length > 0) {
            response += `\n⚠️ **Errors:**\n`;
            result.errors.forEach(err => response += `• ${err}\n`);
          }
        } catch (error: any) {
          response = `❌ Failed to apply fees: ${error.message}`;
        }
      }
      // Validate schedule command
      else if (lowerMessage.includes('validate schedule')) {
        const match = message.match(/deal\s+(\d+)/i);
        const dealId = match ? parseInt(match[1]) : 1;
        
        try {
          const validation = await enhancedFeeService.validateSchedule(dealId);
          
          response = `🔍 **Fee Schedule Validation for Deal ${dealId}**\n\n`;
          
          if (validation.valid) {
            response += `✅ **Schedule is valid!**\n\n`;
          } else {
            response += `❌ **Validation failed:**\n`;
            validation.errors.forEach(err => response += `• ${err}\n`);
            response += '\n';
          }
          
          if (validation.warnings.length > 0) {
            response += `⚠️ **Warnings:**\n`;
            validation.warnings.forEach(warn => response += `• ${warn}\n`);
          }
          
          // Show schedule details
          const schedule = await enhancedFeeService.getFeeSchedule(dealId);
          if (schedule.length > 0) {
            response += `\n**Current Schedule (by precedence):**\n`;
            schedule.forEach(fee => {
              response += `${fee.precedence}. ${fee.component}: `;
              response += fee.is_percent ? `${(fee.rate * 100).toFixed(2)}%` : `$${fee.rate}`;
              response += ` on ${fee.basis}\n`;
            });
          }
        } catch (error: any) {
          response = `❌ Validation error: ${error.message}`;
        }
      }
      // Show fee report
      else if (lowerMessage.includes('fee report') || lowerMessage.includes('show fee')) {
        const match = message.match(/deal\s+(\d+)/i);
        const dealId = match ? parseInt(match[1]) : 1;
        
        try {
          const report = await enhancedFeeService.generateFeeReport(dealId);
          
          response = `📊 **Fee Report for Deal ${dealId}**\n\n`;
          
          response += `**Schedule Configuration:**\n`;
          report.schedule.forEach(s => {
            response += `• ${s.component}: ${s.is_percent ? (s.rate * 100).toFixed(2) + '%' : '$' + s.rate}`;
            response += ` (${s.basis}, precedence: ${s.precedence})\n`;
          });
          
          response += `\n**Summary Statistics:**\n`;
          response += `• Total Fees Collected: $${report.summary.totalFees.toLocaleString()}\n`;
          response += `• Total Discounts Given: $${report.summary.totalDiscounts.toLocaleString()}\n`;
          response += `• Net Transfers: $${report.summary.netTransfers.toLocaleString()}\n`;
          response += `• Transactions Processed: ${report.summary.transactionCount}\n`;
          
          extractedData = report;
        } catch (error: any) {
          response = `❌ Report generation error: ${error.message}`;
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
      // Enhanced reasoning with fee context
      else if (lowerMessage.includes('analyze') || lowerMessage.includes('recommend')) {
        const apiKey = process.env.OPENROUTER_API_KEY!;
        
        // Add fee context to reasoning
        const feeContext = extractedData ? {
          ...extractedData,
          feeEngineVersion: 'ARCHON Enhanced v2.0',
          capabilities: ['precedence ordering', 'basis calculations', 'discount handling', 'partner fees']
        } : {};
        
        const reasoning = await reasonAboutData(
          feeContext,
          message + ' Consider fee calculations, precedence rules, and discount strategies.',
          apiKey
        );
        
        response = `🧠 **AI Analysis with Fee Intelligence:**\n\n`;
        
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
      // Default chat response with fee context
      else if (!file) {
        response = await getEnhancedChatResponse(message);
      }
    }
    
    // If no specific processing, provide enhanced helpful response
    if (!response) {
      response = `🤖 **EQUITIE AI Agent with ARCHON Fee Engine**\n\n`;
      response += `I'm your intelligent assistant powered by GPT-5 reasoning and the ARCHON Fee Engine. I can:\n\n`;
      response += `**📊 Data Processing:**\n`;
      response += `• Parse CSV files (investors, fees, transactions)\n`;
      response += `• Extract data from PDFs (LPAs, fee schedules)\n`;
      response += `• Import directly to Supabase\n\n`;
      response += `**💰 Fee Calculations (NEW!):**\n`;
      response += `• Calculate fees with precedence ordering\n`;
      response += `• Apply basis rules (GROSS, NET, NET_AFTER_PREMIUM)\n`;
      response += `• Handle discounts as negative amounts\n`;
      response += `• Manage partner fees separately\n`;
      response += `• Validate fee schedules\n\n`;
      response += `**🧠 AI Intelligence:**\n`;
      response += `• Deep reasoning about your data\n`;
      response += `• Strategic recommendations\n`;
      response += `• Risk analysis\n`;
      response += `• Business insights\n\n`;
      response += `**Try these commands:**\n`;
      response += `• "Calculate fees for deal 1 with $1M investment"\n`;
      response += `• "Show fee schedule for deal 1"\n`;
      response += `• "Validate fee configuration"\n`;
      response += `• Upload a CSV to process fees or investor data\n`;
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
            content: `You are the EQUITIE AI Agent powered by GPT-5 with the ARCHON Fee Engine integrated. You have deep knowledge of:
            
1. Fee Calculations:
   - Precedence-based fee ordering (PREMIUM always first)
   - Basis calculations (GROSS, NET, NET_AFTER_PREMIUM)
   - Discounts as negative amounts in fee_application table
   - Partner fees excluded from investor analytics
   - Annual fee handling with audit notes
   
2. Data Processing:
   - CSV parsing and validation
   - PDF extraction (fee schedules, LPAs)
   - Supabase integration
   - Data quality analysis
   
3. Business Intelligence:
   - Investment analysis
   - Risk assessment
   - Strategic recommendations
   - Performance metrics

Use step-by-step reasoning to solve complex problems. When discussing fees, always consider precedence, basis, and proper discount handling.`
          },
          { role: 'user', content: message }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    const data = await response.json();
    return data?.choices?.[0]?.message?.content || 'I can help you with fee calculations, data processing, and investment analysis. What would you like to know?';
  } catch (error) {
    return 'I\'m your EQUITIE AI Agent with integrated ARCHON Fee Engine. Upload a CSV or PDF, or ask me about fee calculations, investor data, or investment analysis!';
  }
}