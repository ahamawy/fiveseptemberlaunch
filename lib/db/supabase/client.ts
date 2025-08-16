/**
 * Supabase Direct Client
 * Production-optimized direct SQL connection to Supabase
 * No MCP overhead - maximum performance for feature shipping
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SchemaConfig } from '../schema-manager/config';

export class SupabaseDirectClient {
  private client: SupabaseClient;
  private config: SchemaConfig;
  private queryCache: Map<string, { data: any; timestamp: number }>;
  private cacheTimeout: number = 60000; // 1 minute default cache

  constructor(config: SchemaConfig) {
    this.config = config;
    
    // Initialize Supabase client
    this.client = createClient(
      config.getSupabaseUrl(),
      config.getSupabaseAnonKey(),
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        },
        db: {
          schema: 'public'
        }
      }
    );

    // Initialize query cache
    this.queryCache = new Map();
  }

  /**
   * Get the raw Supabase client
   */
  getClient(): SupabaseClient { return this.client; }

  /**
   * Execute raw SQL query
   */
  async executeSQL<T = any>(query: string, params?: any): Promise<T> {
    // Note: Direct SQL execution requires a custom RPC function
    // For now, this is a placeholder that should use views or query builder
    console.warn('executeSQL is deprecated. Use query builder or views instead.');
    throw new Error('Direct SQL execution not available. Use query builder or views.');
  }

  /**
   * Execute a prepared statement (stored procedure)
   */
  async executePrepared<T = any>(functionName: string, params?: any): Promise<T> {
    try {
      if (this.config.shouldLogQueries()) {
        console.log('Executing function:', functionName, params);
      }

      const { data, error } = await this.client.rpc(functionName, params);

      if (error) {
        console.error('Function execution error:', error);
        throw error;
      }

      return data as T;
    } catch (error) {
      console.error('Prepared statement failed:', error);
      throw error;
    }
  }

  /**
   * Query builder for common operations
   */
  from(table: string) {
    return this.client.from(table);
  }

  /**
   * Transaction support
   */
  async transaction<T = any>(callback: (client: SupabaseClient) => Promise<T>): Promise<T> {
    // Supabase doesn't have built-in transaction support in JS client
    // This would need to be implemented as a stored procedure
    try {
      return await callback(this.client);
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }

  /**
   * Cached query execution
   */
  async queryCached<T = any>(
    key: string,
    queryFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.queryCache.get(key);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < (ttl || this.cacheTimeout)) {
      if (this.config.shouldLogQueries()) {
        console.log('Cache hit:', key);
      }
      return cached.data;
    }

    const data = await queryFn();
    this.queryCache.set(key, { data, timestamp: now });
    
    return data;
  }

  /**
   * Clear cache
   */
  clearCache(key?: string): void {
    if (key) {
      this.queryCache.delete(key);
    } else {
      this.queryCache.clear();
    }
  }

  /**
   * Batch operations
   */
  async batchInsert(table: string, records: any[]): Promise<any> {
    const { data, error } = await this.client
      .from(table)
      .insert(records);
    
    if (error) throw error;
    return data;
  }

  async batchUpdate(table: string, updates: Array<{ id: any; data: any }>): Promise<any> {
    // Supabase doesn't have native batch update, use Promise.all
    const promises = updates.map(({ id, data }) =>
      this.client
        .from(table)
        .update(data)
        .eq('id', id)
    );
    
    const results = await Promise.all(promises);
    return results.map(r => r.data);
  }

  /**
   * Complex queries for specific entities
   */
  async getDealsWithDetails() {
    return this.queryCached('deals_with_details', async () => {
      const { data, error } = await (this.client as any)
        .schema('deals')
        .from('deal')
        .select(`
          *,
          company:underlying_company_id (
            company_name,
            company_sector,
            latest_valuation_mil
          ),
          valuations:deal_valuations (
            valuation_date,
            moic,
            irr
          )
        `)
        .eq('deal_status', 'ACTIVE')
        .order('deal_date', { ascending: false });
      
      if (error) throw error;
      return data;
    });
  }

  async getInvestorPortfolio(investorId: number) {
    return this.queryCached(`investor_portfolio_${investorId}`, async () => {
      const { data, error } = await this.client
        .from('investment_snapshots')
        .select(`
          *,
          deal:deal_id (
            deal_name,
            deal_status,
            deal_currency
          ),
          company:company_id (
            company_name,
            sector
          )
        `)
        .eq('investor_id', investorId)
        .order('snapshot_date', { ascending: false });
      
      if (error) throw error;
      return data;
    });
  }

  async getTransactionHistory(filters: any = {}) {
    const query = (this.client as any)
      .schema('transactions')
      .from('transaction')
      .select(`
        *,
        deal:deal_id (deal_name),
        investor:investor_id (full_name, primary_email)
      `);
    
    // Apply filters
    if (filters.investor_id) {
      query.eq('investor_id', filters.investor_id);
    }
    if (filters.deal_id) {
      query.eq('deal_id', filters.deal_id);
    }
    if (filters.status) {
      query.eq('status', filters.status);
    }
    if (filters.from_date) {
      query.gte('transaction_date', filters.from_date);
    }
    if (filters.to_date) {
      query.lte('transaction_date', filters.to_date);
    }
    
    const { data, error } = await query.order('transaction_date', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  /**
   * Real-time subscriptions
   */
  subscribeToTable(
    table: string,
    callback: (payload: any) => void,
    filter?: any
  ) {
    const channel = this.client
      .channel(`public:${table}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter
        },
        callback
      )
      .subscribe();
    
    return channel;
  }

  /**
   * Storage operations (for documents)
   */
  async uploadDocument(bucket: string, path: string, file: File) {
    const { data, error } = await this.client.storage
      .from(bucket)
      .upload(path, file);
    
    if (error) throw error;
    return data;
  }

  async getDocumentUrl(bucket: string, path: string) {
    const { data } = this.client.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }

  /**
   * Auth operations
   */
  async signIn(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser() {
    const { data: { user } } = await this.client.auth.getUser();
    return user;
  }

  /**
   * Helper for checking connection
   */
  async checkConnection(): Promise<boolean> {
    try {
      const { data, error } = await this.client
        .from('companies')
        .select('count')
        .limit(1);
      
      return !error;
    } catch {
      return false;
    }
  }
}