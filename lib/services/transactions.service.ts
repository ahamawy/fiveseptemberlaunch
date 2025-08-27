import { BaseService } from './base.service';
import { SupabaseDirectClient } from '@/lib/db/supabase/client';
import { SchemaConfig } from '@/lib/db/schema-manager/config';

// Transaction context type for fee calculations
export interface TransactionContext {
  deal_id: number;
  investor_id: number;
  transaction_date?: string;
  units: number;
  unit_price: number;
  gross_capital: number;
  years?: number;
}

export interface CreatePrimaryTxInput {
  deal_id: number;
  investor_id: number;
  transaction_date?: string; // ISO
  units: number;
  unit_price: number;
  status?: string;
  years?: number; // For annual fee calculations
}

export class TransactionsService extends BaseService {
  private direct: SupabaseDirectClient;

  constructor() {
    super();
    this.direct = new SupabaseDirectClient(new SchemaConfig());
  }

  async createPrimaryTx(input: CreatePrimaryTxInput) {
    this.validateRequired(input, ['deal_id', 'investor_id', 'units', 'unit_price'], 'createPrimaryTx');

    const gross_capital = Number(input.units) * Number(input.unit_price);
    
    // NEW: Calculate fees using deal equation
    const context: TransactionContext = {
      gross_capital,
      units: input.units,
      unit_price: input.unit_price,
      years: input.years || 1,
      deal_id: input.deal_id,
      investor_id: input.investor_id,
      transaction_date: input.transaction_date ? new Date(input.transaction_date) : new Date()
    };
    
    let feeCalculation;
    let netCapital = gross_capital;
    
    // Fee calculations are now handled via formula engine if needed
    // For now, use gross capital as net capital
    // To calculate fees, use formulaEngine.calculateForDeal() separately
    
    const payload = {
      deal_id: input.deal_id,
      investor_id: input.investor_id,
      transaction_date: input.transaction_date || new Date().toISOString().slice(0, 10),
      units: input.units,
      unit_price: input.unit_price,
      gross_capital,
      net_capital: netCapital,
      initial_net_capital: netCapital,
      status: input.status || 'PENDING',
      fee_calc_method: null,
      fee_calc_notes: 'Use formula engine for fee calculations'
    } as const;

    const client = this.direct.getClient();
    const { data: transaction, error } = await client
      .from('transactions_clean')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      this.handleError(error, 'createPrimaryTx');
    }
    
    // Fee applications are now handled separately via formula engine

    // Clear caches that may depend on tx state
    this.clearCache();
    return transaction;
  }

  async getByDeal(dealId: number) {
    const cacheKey = `tx:deal:${dealId}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const list = await this.dataClient.getTransactions({ deal_id: dealId });
    this.setCache(cacheKey, list);
    return list;
  }

  async getByInvestor(investorId: number) {
    const cacheKey = `tx:inv:${investorId}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const list = await this.dataClient.getTransactions({ investor_id: investorId });
    this.setCache(cacheKey, list);
    return list;
  }
}

export const transactionsService = new TransactionsService();


