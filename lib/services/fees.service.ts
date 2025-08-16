import { BaseService } from './base.service';
import { SupabaseDirectClient } from '@/lib/db/supabase/client';
import { SchemaConfig } from '@/lib/db/schema-manager/config';

export type FeeComponent = 'STRUCTURING'|'MANAGEMENT'|'PERFORMANCE'|'ADMIN'|'PREMIUM'|'OTHER';

export class FeesService extends BaseService {
  private direct: SupabaseDirectClient;

  constructor(){
    super();
    this.direct = new SupabaseDirectClient(new SchemaConfig());
  }

  async applyFeeLine(params: {
    transaction_id: number;
    deal_id?: number;
    component: FeeComponent;
    amount?: number;
    percent?: number;
    applied?: boolean;
    notes?: string;
  }){
    this.validateRequired(params, ['transaction_id', 'component'], 'applyFeeLine');
    const client = this.direct.getClient();
    const { data, error } = await client
      .from('fee_application_record')
      .insert({
        transaction_id: params.transaction_id,
        deal_id: params.deal_id ?? null,
        component: params.component,
        amount: params.amount ?? null,
        percent: params.percent ?? null,
        applied: params.applied ?? true,
        notes: params.notes ?? null
      })
      .select('*')
      .single();
    if (error) this.handleError(error, 'applyFeeLine');
    this.clearCache();
    return data;
  }

  async listByTx(transaction_id: number){
    const client = this.direct.getClient();
    const { data, error } = await client
      .from('fee_application_record')
      .select('*')
      .eq('transaction_id', transaction_id)
      .order('id', { ascending: true });
    if (error) this.handleError(error, 'listByTx');
    return data || [];
  }

  async lock(transaction_id: number, locked: boolean){
    const client = this.direct.getClient();
    const { data, error } = await client
      .from('transactions.transaction.primary')
      .update({ fee_calc_is_locked: locked, fee_calc_locked_at: locked ? new Date().toISOString() : null })
      .eq('transaction_id', transaction_id)
      .select('*')
      .single();
    if (error) this.handleError(error, 'lock');
    this.clearCache();
    return data;
  }
}

export const feesService = new FeesService();


