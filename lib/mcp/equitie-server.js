#!/usr/bin/env node

/**
 * EquiTie Custom MCP Server
 * Provides specialized tools for interacting with Supabase in the context of the EquiTie platform
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createClient } from '@supabase/supabase-js';
import { mcpConfig, isToolEnabled } from './config.mjs';

// Initialize Supabase client
const supabaseUrl = mcpConfig.supabase.url;
const supabaseKey = mcpConfig.supabase.serviceRoleKey;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Create MCP server
const server = new Server(
  {
    name: mcpConfig.server.name,
    version: mcpConfig.server.version,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool: Analyze Portfolio
server.setRequestHandler('tools/call', async (request) => {
  const { tool, arguments: args } = request.params;

  try {
    if (!isToolEnabled(tool)) {
      throw new Error(`Tool disabled by configuration: ${tool}`);
    }
    switch (tool) {
      case 'analyze_portfolio': {
        const { investorId } = args;
        
        // Fetch investor data
        const { data: investor } = await supabase
          .from('investors.investor')
          .select('*')
          .eq('id', investorId)
          .single();

        // Fetch transactions
        const { data: transactions } = await supabase
          .from('transactions')
          .select('*')
          .eq('investor_id', investorId)
          .order('created_at', { ascending: false });

        // Fetch portfolio positions
        const { data: positions } = await supabase
          .from('investor_positions')
          .select('*, deals.deal(*)')
          .eq('investor_id', investorId);

        // Calculate metrics
        const totalInvested = transactions
          ?.filter(t => t.type === 'investment')
          .reduce((sum, t) => sum + t.amount, 0) || 0;

        const totalDistributed = transactions
          ?.filter(t => t.type === 'distribution')
          .reduce((sum, t) => sum + t.amount, 0) || 0;

        const currentValue = positions
          ?.reduce((sum, p) => sum + (p.current_value || 0), 0) || 0;

        const analysis = {
          investor,
          metrics: {
            totalInvested,
            totalDistributed,
            currentValue,
            unrealizedGain: currentValue - totalInvested,
            moic: totalInvested > 0 ? currentValue / totalInvested : 0,
            activeDeals: positions?.length || 0,
          },
          recentTransactions: transactions?.slice(0, 5),
          positions: positions?.map(p => ({
            dealName: p.deals?.deal?.name,
            invested: p.invested_amount,
            currentValue: p.current_value,
            performance: p.current_value / p.invested_amount - 1,
          })),
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(analysis, null, 2),
            },
          ],
        };
      }

      case 'debug_transaction': {
        const { transactionId } = args;

        // Fetch transaction
        const { data: transaction } = await supabase
          .from('transactions')
          .select('*')
          .eq('id', transactionId)
          .single();

        // Fetch related logs
        const { data: logs } = await supabase
          .from('transaction_logs')
          .select('*')
          .eq('transaction_id', transactionId)
          .order('created_at', { ascending: false });

        // Fetch related fees
        const { data: fees } = await supabase
          .from('fees.fee_application')
          .select('*, fees.fee_schedule(*)')
          .eq('transaction_id', transactionId);

        // Check for anomalies
        const anomalies = [];
        if (transaction) {
          if (transaction.status === 'failed') {
            anomalies.push('Transaction failed - check error logs');
          }
          if (transaction.amount <= 0) {
            anomalies.push('Invalid amount detected');
          }
          if (!transaction.investor_id) {
            anomalies.push('Missing investor ID');
          }
        }

        const debugInfo = {
          transaction,
          logs,
          fees,
          anomalies,
          recommendations: anomalies.length > 0 
            ? 'Review anomalies and check related systems'
            : 'Transaction appears healthy',
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(debugInfo, null, 2),
            },
          ],
        };
      }

      case 'validate_fees': {
        const { dealId, amount } = args;

        // Fetch fee schedules
        const { data: schedules } = await supabase
          .from('fees.fee_schedule')
          .select('*')
          .eq('deal_id', dealId)
          .eq('is_active', true);

        // Calculate expected fees
        const calculations = schedules?.map(schedule => {
          let feeAmount = 0;
          
          if (schedule.fee_type === 'PERCENTAGE') {
            feeAmount = amount * (schedule.percentage / 100);
          } else if (schedule.fee_type === 'FIXED') {
            feeAmount = schedule.fixed_amount;
          }

          return {
            component: schedule.fee_component,
            type: schedule.fee_type,
            rate: schedule.percentage || schedule.fixed_amount,
            calculatedAmount: feeAmount,
            basis: schedule.fee_basis,
          };
        });

        const totalFees = calculations?.reduce((sum, calc) => sum + calc.calculatedAmount, 0) || 0;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                dealId,
                grossAmount: amount,
                feeCalculations: calculations,
                totalFees,
                netAmount: amount - totalFees,
              }, null, 2),
            },
          ],
        };
      }

      case 'generate_report': {
        const { reportType, filters } = args;

        let query = supabase.from('investor_analytics').select('*');

        // Apply filters
        if (filters?.startDate) {
          query = query.gte('created_at', filters.startDate);
        }
        if (filters?.endDate) {
          query = query.lte('created_at', filters.endDate);
        }
        if (filters?.investorId) {
          query = query.eq('investor_id', filters.investorId);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        // Generate summary based on report type
        const summary = {
          reportType,
          filters,
          dataPoints: data?.length || 0,
          aggregates: {
            totalValue: data?.reduce((sum, d) => sum + (d.portfolio_value || 0), 0) || 0,
            avgIRR: data?.reduce((sum, d) => sum + (d.irr || 0), 0) / (data?.length || 1) || 0,
            avgMOIC: data?.reduce((sum, d) => sum + (d.moic || 0), 0) / (data?.length || 1) || 0,
          },
          data: data?.slice(0, 10), // First 10 records
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(summary, null, 2),
            },
          ],
        };
      }

      case 'sync_data': {
        const { source, target, table } = args;

        // This would typically involve more complex logic
        // For now, just return the configuration
        const syncConfig = {
          source,
          target,
          table,
          status: 'ready',
          estimatedRecords: 'unknown',
          warning: 'Manual verification required before sync',
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(syncConfig, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${tool}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Tool listing
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'analyze_portfolio',
        description: 'Analyze investor portfolio performance with detailed metrics',
        inputSchema: {
          type: 'object',
          properties: {
            investorId: {
              type: 'number',
              description: 'The investor ID to analyze',
            },
          },
          required: ['investorId'],
        },
      },
      {
        name: 'debug_transaction',
        description: 'Debug transaction issues with detailed logs and anomaly detection',
        inputSchema: {
          type: 'object',
          properties: {
            transactionId: {
              type: 'string',
              description: 'The transaction ID to debug',
            },
          },
          required: ['transactionId'],
        },
      },
      {
        name: 'validate_fees',
        description: 'Validate fee calculations against configured rules',
        inputSchema: {
          type: 'object',
          properties: {
            dealId: {
              type: 'number',
              description: 'The deal ID',
            },
            amount: {
              type: 'number',
              description: 'The amount to calculate fees for',
            },
          },
          required: ['dealId', 'amount'],
        },
      },
      {
        name: 'generate_report',
        description: 'Generate custom reports from database with filters',
        inputSchema: {
          type: 'object',
          properties: {
            reportType: {
              type: 'string',
              enum: ['portfolio', 'performance', 'transactions', 'fees'],
              description: 'Type of report to generate',
            },
            filters: {
              type: 'object',
              properties: {
                startDate: { type: 'string' },
                endDate: { type: 'string' },
                investorId: { type: 'number' },
              },
            },
          },
          required: ['reportType'],
        },
      },
      {
        name: 'sync_data',
        description: 'Sync data between mock and production environments',
        inputSchema: {
          type: 'object',
          properties: {
            source: {
              type: 'string',
              enum: ['mock', 'production'],
            },
            target: {
              type: 'string',
              enum: ['mock', 'production'],
            },
            table: {
              type: 'string',
              description: 'Table name to sync',
            },
          },
          required: ['source', 'target', 'table'],
        },
      },
    ].filter(t => isToolEnabled(t.name)),
  };
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('EquiTie MCP Server started');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});