import { BaseService } from './base.service';
import { SupabaseDirectClient } from '@/lib/db/supabase/client';
import { SchemaConfig } from '@/lib/db/schema-manager/config';
import { dealEquationExecutor, TransactionContext } from './fee-engine/deal-equation-executor';

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
    
    try {
      // Execute deal's unique equation
      feeCalculation = await dealEquationExecutor.execute(input.deal_id, context);
      netCapital = feeCalculation.state.netAmount || gross_capital;
      
      this.log('Fee calculation completed', {
        deal_id: input.deal_id,
        equation: feeCalculation.equation_name,
        gross: gross_capital,
        net: netCapital,
        total_fees: feeCalculation.transferPreDiscount
      });
    } catch (error) {
      // Log error but don't fail transaction creation
      this.log('Fee calculation failed, using gross capital', { error, deal_id: input.deal_id });
    }
    
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
      fee_calc_method: feeCalculation?.equation_name,
      fee_calc_notes: feeCalculation ? 
        `Calculated using ${feeCalculation.equation_name} at ${new Date().toISOString()}` : 
        'No fee calculation performed'
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
    
    // Store fee applications if calculation succeeded
    if (transaction && feeCalculation) {
      try {
        for (const fee of feeCalculation.state.appliedFees) {
          await client
            .from('fees.fee_application')
            .insert({
              tx_id: transaction.transaction_id,
              investor_id: input.investor_id,
              deal_id: input.deal_id,
              component: fee.component,
              basis: fee.basis || 'GROSS',
              amount: fee.amount,
              percent: fee.percent,
              notes: JSON.stringify({
                equation: feeCalculation.equation_name,
                transaction_id: transaction.transaction_id,
                precedence: feeCalculation.metadata.precedenceOrder,
                calculation_date: feeCalculation.metadata.calculationDate,
                audit_id: feeCalculation.metadata.auditId
              })
            });
        }
        
        this.log('Fee applications stored', {
          transaction_id: transaction.transaction_id,
          fee_count: feeCalculation.state.appliedFees.length
        });
      } catch (error) {
        this.log('Failed to store fee applications', { error, transaction_id: transaction.transaction_id });
      }
    }

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


