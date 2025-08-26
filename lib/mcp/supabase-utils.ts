/**
 * Supabase MCP Utilities
 * Helper functions for interacting with Supabase through MCP
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface MCPQuery {
  table: string;
  operation: 'select' | 'insert' | 'update' | 'delete';
  filters?: Record<string, any>;
  data?: Record<string, any>;
  limit?: number;
  orderBy?: { column: string; ascending: boolean };
}

interface MCPResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    rowCount?: number;
    executionTime?: number;
  };
}

export class SupabaseMCPClient {
  private client: SupabaseClient;
  private projectId: string;

  constructor(url: string, key: string, projectId: string) {
    this.client = createClient(url, key);
    this.projectId = projectId;
  }

  /**
   * Execute a query through MCP with enhanced logging
   */
  async executeQuery<T = any>(query: MCPQuery): Promise<MCPResponse<T>> {
    const startTime = Date.now();
    
    try {
      let queryBuilder: any = this.client.from(query.table);

      // Build query based on operation
      switch (query.operation) {
        case 'select':
          queryBuilder = queryBuilder.select('*');
          break;
        case 'insert':
          if (!query.data) throw new Error('Data required for insert');
          queryBuilder = queryBuilder.insert(query.data);
          break;
        case 'update':
          if (!query.data) throw new Error('Data required for update');
          queryBuilder = queryBuilder.update(query.data);
          break;
        case 'delete':
          queryBuilder = queryBuilder.delete();
          break;
      }

      // Apply filters
      if (query.filters) {
        Object.entries(query.filters).forEach(([key, value]) => {
          queryBuilder = queryBuilder.eq(key, value);
        });
      }

      // Apply ordering
      if (query.orderBy) {
        queryBuilder = queryBuilder.order(query.orderBy.column, {
          ascending: query.orderBy.ascending,
        });
      }

      // Apply limit
      if (query.limit) {
        queryBuilder = queryBuilder.limit(query.limit);
      }

      const { data, error }: any = await queryBuilder;

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data as T,
        metadata: {
          rowCount: Array.isArray(data) ? data.length : 1,
          executionTime: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          executionTime: Date.now() - startTime,
        },
      };
    }
  }

  /**
   * Analyze portfolio performance
   */
  async analyzePortfolio(investorId: number) {
    const queries = [
      {
        table: 'investors_clean',
        operation: 'select' as const,
        filters: { id: investorId },
      },
      {
        table: 'transactions',
        operation: 'select' as const,
        filters: { investor_id: investorId },
        orderBy: { column: 'created_at', ascending: false },
      },
      {
        table: 'investor_positions',
        operation: 'select' as const,
        filters: { investor_id: investorId },
      },
    ];

    const results = await Promise.all(queries.map(q => this.executeQuery(q)));

    const [investorResult, transactionsResult, positionsResult] = results;

    if (!investorResult.success || !transactionsResult.success || !positionsResult.success) {
      return {
        success: false,
        error: 'Failed to fetch portfolio data',
      };
    }

    const transactions = transactionsResult.data as any[];
    const positions = positionsResult.data as any[];

    const analysis = {
      investor: investorResult.data,
      metrics: {
        totalInvested: transactions
          .filter(t => t.type === 'investment')
          .reduce((sum, t) => sum + t.amount, 0),
        totalDistributed: transactions
          .filter(t => t.type === 'distribution')
          .reduce((sum, t) => sum + t.amount, 0),
        activePositions: positions.length,
        totalValue: positions.reduce((sum, p) => sum + (p.current_value || 0), 0),
      },
      recentActivity: transactions.slice(0, 5),
    };

    return {
      success: true,
      data: analysis,
    };
  }

  /**
   * Debug transaction with detailed information
   */
  async debugTransaction(transactionId: string) {
    const queries = [
      {
        table: 'transactions',
        operation: 'select' as const,
        filters: { id: transactionId },
      },
      {
        table: 'transaction_logs',
        operation: 'select' as const,
        filters: { transaction_id: transactionId },
        orderBy: { column: 'created_at', ascending: false },
      },
      {
        table: 'fees.fee_application',
        operation: 'select' as const,
        filters: { transaction_id: transactionId },
      },
    ];

    const results = await Promise.all(queries.map(q => this.executeQuery(q)));
    const [transactionResult, logsResult, feesResult] = results;

    const anomalies = [];
    const transaction = transactionResult.data?.[0];

    if (transaction) {
      if (transaction.status === 'failed') {
        anomalies.push({
          type: 'error',
          message: 'Transaction failed',
          suggestion: 'Check error logs for details',
        });
      }
      if (transaction.amount <= 0) {
        anomalies.push({
          type: 'warning',
          message: 'Invalid amount detected',
          suggestion: 'Verify amount calculation',
        });
      }
      if (!transaction.investor_id) {
        anomalies.push({
          type: 'error',
          message: 'Missing investor ID',
          suggestion: 'Transaction must be linked to an investor',
        });
      }
    }

    return {
      success: true,
      data: {
        transaction: transactionResult.data?.[0],
        logs: logsResult.data || [],
        fees: feesResult.data || [],
        anomalies,
        health: anomalies.length === 0 ? 'healthy' : 'needs_attention',
      },
    };
  }

  /**
   * Validate fee calculations
   */
  async validateFees(dealId: number, amount: number) {
    const { data: schedules, error } = await this.client
      .from('fees.fee_schedule')
      .select('*')
      .eq('deal_id', dealId)
      .eq('is_active', true);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

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
    }) || [];

    const totalFees = calculations.reduce((sum, calc) => sum + calc.calculatedAmount, 0);

    return {
      success: true,
      data: {
        dealId,
        grossAmount: amount,
        calculations,
        totalFees,
        netAmount: amount - totalFees,
        validation: {
          passed: totalFees < amount * 0.5, // Fees shouldn't exceed 50%
          warnings: totalFees > amount * 0.2 ? ['High fee percentage detected'] : [],
        },
      },
    };
  }

  /**
   * Generate custom report
   */
  async generateReport(
    reportType: 'portfolio' | 'performance' | 'transactions' | 'fees',
    filters?: {
      startDate?: string;
      endDate?: string;
      investorId?: number;
      dealId?: number;
    }
  ) {
    let query = this.client.from('investor_analytics').select('*');

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

    const { data, error } = await query.limit(100);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Calculate aggregates based on report type
    const aggregates = this.calculateAggregates(data || [], reportType);

    return {
      success: true,
      data: {
        reportType,
        filters,
        dataPoints: data?.length || 0,
        aggregates,
        sampleData: data?.slice(0, 10),
        generatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Calculate aggregates for reports
   */
  private calculateAggregates(data: any[], reportType: string) {
    switch (reportType) {
      case 'portfolio':
        return {
          totalValue: data.reduce((sum, d) => sum + (d.portfolio_value || 0), 0),
          avgValue: data.reduce((sum, d) => sum + (d.portfolio_value || 0), 0) / (data.length || 1),
          maxValue: Math.max(...data.map(d => d.portfolio_value || 0)),
          minValue: Math.min(...data.map(d => d.portfolio_value || 0)),
        };
      
      case 'performance':
        return {
          avgIRR: data.reduce((sum, d) => sum + (d.irr || 0), 0) / (data.length || 1),
          avgMOIC: data.reduce((sum, d) => sum + (d.moic || 0), 0) / (data.length || 1),
          avgDPI: data.reduce((sum, d) => sum + (d.dpi || 0), 0) / (data.length || 1),
          avgTVPI: data.reduce((sum, d) => sum + (d.tvpi || 0), 0) / (data.length || 1),
        };
      
      case 'transactions':
        return {
          totalCount: data.length,
          totalVolume: data.reduce((sum, d) => sum + (d.amount || 0), 0),
          avgSize: data.reduce((sum, d) => sum + (d.amount || 0), 0) / (data.length || 1),
          typeCounts: this.countByType(data, 'type'),
        };
      
      case 'fees':
        return {
          totalFees: data.reduce((sum, d) => sum + (d.fee_amount || 0), 0),
          avgFeeRate: data.reduce((sum, d) => sum + (d.fee_rate || 0), 0) / (data.length || 1),
          feesByComponent: this.countByType(data, 'fee_component'),
        };
      
      default:
        return {};
    }
  }

  /**
   * Count occurrences by type
   */
  private countByType(data: any[], field: string) {
    return data.reduce((acc, item) => {
      const key = item[field] || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Health check for Supabase connection
   */
  async healthCheck() {
    try {
      const { count, error } = await this.client
        .from('investors_clean')
        .select('*', { count: 'exact', head: true });

      return {
        success: !error,
        projectId: this.projectId,
        status: error ? 'unhealthy' : 'healthy',
        error: error?.message,
        metadata: {
          investorCount: count || 0,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        projectId: this.projectId,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Export singleton instance
let mcpClient: SupabaseMCPClient | null = null;

export function getSupabaseMCP(): SupabaseMCPClient {
  if (!mcpClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const projectId = url?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'unknown';

    if (!url || !key) {
      throw new Error('Supabase configuration missing');
    }

    mcpClient = new SupabaseMCPClient(url, key, projectId);
  }
  
  return mcpClient;
}