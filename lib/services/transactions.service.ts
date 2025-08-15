import { BaseService } from './base.service';
import { SupabaseDirectClient } from '@/lib/db/supabase/client';
import { SchemaConfig } from '@/lib/db/schema-manager/config';

export interface CreatePrimaryTxInput {
  deal_id: number;
  investor_id: number;
  transaction_date?: string; // ISO
  units: number;
  unit_price: number;
  status?: string;
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
    const payload = {
      deal_id: input.deal_id,
      investor_id: input.investor_id,
      transaction_date: input.transaction_date || new Date().toISOString().slice(0, 10),
      units: input.units,
      unit_price: input.unit_price,
      gross_capital,
      status: input.status || 'PENDING'
    } as const;

    const client = this.direct.getClient();
    const { data, error } = await client
      .from('transactions.transaction.primary')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      this.handleError(error, 'createPrimaryTx');
    }

    // Clear caches that may depend on tx state
    this.clearCache();
    return data;
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


