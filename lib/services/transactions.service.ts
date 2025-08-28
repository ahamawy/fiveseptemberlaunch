import { BaseService } from './base.service';
import { SupabaseDirectClient } from '@/lib/db/supabase/client';
import { SchemaConfig } from '@/lib/db/schema-manager/config';
import { FormulaValidationService } from './formula-validation.service';

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
  private formulaService: FormulaValidationService;

  constructor() {
    super();
    this.direct = new SupabaseDirectClient(new SchemaConfig());
    this.formulaService = new FormulaValidationService();
  }

  async createPrimaryTx(input: CreatePrimaryTxInput) {
    this.validateRequired(input, ['deal_id', 'investor_id', 'units', 'unit_price'], 'createPrimaryTx');

    const gross_capital = Number(input.units) * Number(input.unit_price);
    const client = this.direct.getClient();
    
    // Get deal configuration for formula calculation
    const { data: deal } = await client
      .from('deals_clean')
      .select('*')
      .eq('deal_id', input.deal_id)
      .single();
    
    // Calculate fees using formula engine
    let netCapital = gross_capital;
    let structuringFee = 0;
    let managementFee = 0;
    let adminFee = 0;
    
    if (deal) {
      // Apply structuring fee if configured
      if (deal.eq_deal_structuring_fee_percent) {
        structuringFee = gross_capital * (Number(deal.eq_deal_structuring_fee_percent) / 100);
      }
      
      // Apply management fee (tier 1 if available, otherwise standard)
      const mgmtRate = deal.management_fee_tier_1_percent || deal.eq_deal_annual_management_fee_percent || 0;
      if (mgmtRate && input.years) {
        managementFee = gross_capital * (Number(mgmtRate) / 100) * input.years;
      }
      
      // Apply admin fee if configured (usually flat amount)
      if (deal.eq_admin_fee) {
        adminFee = Number(deal.eq_admin_fee);
      }
      
      // Calculate net capital based on deal's formula template
      netCapital = gross_capital - structuringFee - managementFee - adminFee;
    }
    
    const payload = {
      deal_id: input.deal_id,
      investor_id: input.investor_id,
      transaction_date: input.transaction_date || new Date().toISOString().slice(0, 10),
      units: input.units,
      unit_price: input.unit_price,
      gross_capital,
      initial_net_capital: netCapital,
      structuring_fee_amount: structuringFee,
      management_fee_amount: managementFee,
      admin_fee: adminFee,
      status: input.status || 'PENDING',
      fee_calc_method: deal?.formula_template || 'standard',
      formula_version: '2.0.0'
    } as const;

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


