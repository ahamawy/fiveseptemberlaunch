import { NextRequest, NextResponse } from 'next/server';
import { EquitieAIAgent, reasonAboutData, parseCSV, analyzeCSVData, transformInvestorData } from '@/lib/services/ai-agent.service';

const agent = new EquitieAIAgent();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const message = formData.get('message') as string || '';
    const file = formData.get('file') as File | null;
    
    let response = '';
    let extractedData = null;
    let suggestedActions: string[] = [];
    
    // Process uploaded file with intelligent parsing
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const content = new TextDecoder().decode(arrayBuffer);
      
      if (file.name.endsWith('.csv')) {
        // Use the AI agent to process CSV
        const result = await agent.processCSVFile(content, file.name);
        
        if (result.success) {
          response = `📊 **${result.message}**\n\n`;
          
          // Add analysis details
          if (result.data.analysis) {
            response += `**Data Type:** ${result.data.analysis.type}\n`;
            response += `**Columns:** ${result.data.analysis.columns.join(', ')}\n`;
            response += `**Rows:** ${result.data.analysis.rowCount}\n\n`;
          }
          
          // Add preview
          if (result.data.preview && result.data.preview.length > 0) {
            response += `**Preview of first record:**\n`;
            const firstRecord = result.data.preview[0];
            Object.entries(firstRecord).forEach(([key, value]) => {
              if (key !== 'created_at' && value) {
                response += `• ${key}: ${value}\n`;
              }
            });
            response += '\n';
          }
          
          // Add totals for investor data
          if (result.data.totalCommitment) {
            response += `**📈 Summary:**\n`;
            response += `• Total Investors: ${result.data.investorCount}\n`;
            response += `• Total Commitments: $${result.data.totalCommitment.toLocaleString()}\n`;
            response += `• Average Commitment: $${Math.round(result.data.totalCommitment / result.data.investorCount).toLocaleString()}\n\n`;
          }
          
          // Add actionable next steps
          if (result.actions && result.actions.length > 0) {
            response += `**🎯 What would you like to do?**\n`;
            result.actions.forEach(action => {
              response += `• ${action}\n`;
            });
            response += `\n💡 **Try these commands:**\n`;
            response += `• "Import these investors to Supabase"\n`;
            response += `• "Show me investors with commitments over $1M"\n`;
            response += `• "Calculate 2% management fee for all investors"\n`;
          }
          
          extractedData = result.data;
          suggestedActions = result.actions || [];
        } else {
          response = `❌ ${result.message}`;
        }
      } else {
        response = `📎 Uploaded: ${file.name}\n\nFor full CSV processing, please upload a .csv file. Other file types will be supported soon.`;
      }
    }
    
    // Process user message with context
    if (message) {
      const lowerMessage = message.toLowerCase();
      
      // Handle import command
      if (lowerMessage.includes('import') && extractedData?.preview) {
        const investors = transformInvestorData(extractedData.preview);
        const importResult = await agent.importInvestorsToSupabase(investors);
        
        response = `✅ **${importResult.message}**\n\n`;
        if (importResult.errors.length > 0) {
          response += `⚠️ **Errors encountered:**\n`;
          importResult.errors.forEach(err => {
            response += `• ${err.investor}: ${err.error}\n`;
          });
        } else {
          response += `🎉 All investors imported successfully to Supabase!\n\n`;
          response += `**Next steps:**\n`;
          response += `• View investors in the dashboard\n`;
          response += `• Calculate fee distributions\n`;
          response += `• Generate investor reports\n`;
        }
      }
      // Handle Supabase queries
      else if (lowerMessage.includes('how many') || lowerMessage.includes('count') || 
               lowerMessage.includes('total') || lowerMessage.includes('list')) {
        const queryResult = await agent.querySupabase(message);
        response = queryResult.message;
        if (queryResult.data) {
          extractedData = queryResult;
        }
      }
      // Handle reasoning requests
      else if (lowerMessage.includes('analyze') || lowerMessage.includes('recommend')) {
        const apiKey = process.env.OPENROUTER_API_KEY!;
        const reasoning = await reasonAboutData(
          extractedData?.preview || [],
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
        
        if (reasoning.risks.length > 0) {
          response += `**Risks to Consider:**\n`;
          reasoning.risks.forEach(risk => {
            response += `• ${risk}\n`;
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
      // Default chat response
      else if (!file) {
        response = await getBasicChatResponse(message);
      }
    }
    
    // If no specific processing, provide helpful response
    if (!response) {
      response = `I'm ready to help! I can:\n\n`;
      response += `• 📊 Parse and analyze CSV files\n`;
      response += `• 💾 Import data directly to Supabase\n`;
      response += `• 🧮 Calculate fees and distributions\n`;
      response += `• 🔍 Query your database\n`;
      response += `• 🧠 Provide AI-powered insights\n\n`;
      response += `Upload a CSV file or ask me a question to get started!`;
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

async function getBasicChatResponse(message: string): Promise<string> {
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
            content: `You are the EQUITIE AI Agent powered by GPT-5 - an advanced reasoning assistant for private equity data management. You can parse CSV files, import data to Supabase, calculate fees, and provide deep insights. Use step-by-step reasoning to solve complex problems.`
          },
          { role: 'user', content: message }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    const data = await response.json();
    return data?.choices?.[0]?.message?.content || 'I can help you with that. Please provide more details or upload a file.';
  } catch (error) {
    return 'I can help you process investor data, calculate fees, and manage your Supabase database. Upload a CSV file to get started!';
  }
}