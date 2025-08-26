/**
 * Fee Matching Engine v0
 * Matches imported fee records with existing transactions
 */

import { SupabaseDirectClient } from '@/lib/db/supabase/client';
import { SchemaConfig } from '@/lib/db/schema-manager/config';

export interface MatchingRule {
  field: 'investor_name' | 'deal_name' | 'amount' | 'date';
  weight: number;
  threshold?: number;
}

export interface MatchCandidate {
  transaction_id: number;
  investor_id: number;
  deal_id: number;
  gross_capital: number;
  transaction_date: Date;
  investor_name?: string;
  deal_name?: string;
  confidence: number;
  match_reasons: string[];
}

export interface FeeRecord {
  id?: number;
  investor_name?: string;
  investor_id?: number;
  deal_name?: string;
  deal_id?: number;
  gross_amount?: number;
  date?: Date;
  management_fee?: number;
  admin_fee?: number;
  performance_fee?: number;
  structuring_fee?: number;
}

export class FeeMatchingEngine {
  private client: any;
  private rules: MatchingRule[];
  
  constructor(
    private config = new SchemaConfig(),
    rules?: MatchingRule[]
  ) {
    this.client = new SupabaseDirectClient(config).getClient();
    this.rules = rules || this.getDefaultRules();
  }
  
  private getDefaultRules(): MatchingRule[] {
    return [
      { field: 'investor_name', weight: 0.3 },
      { field: 'deal_name', weight: 0.3 },
      { field: 'amount', weight: 0.3, threshold: 0.01 }, // 1% tolerance
      { field: 'date', weight: 0.1, threshold: 30 } // 30 days tolerance
    ];
  }
  
  /**
   * Find matching transactions for a fee record
   */
  async findMatches(feeRecord: FeeRecord): Promise<MatchCandidate[]> {
    const candidates: MatchCandidate[] = [];
    
    // Build query based on available fields
    let query = this.client
      .from('transactions_clean')
      .select(`
        transaction_id,
        investor_id,
        deal_id,
        gross_capital,
        transaction_date,
        investors!inner(full_name),
        deals!inner(name)
      `);
    
    // Apply filters if we have IDs
    if (feeRecord.investor_id) {
      query = query.eq('investor_id', feeRecord.investor_id);
    }
    if (feeRecord.deal_id) {
      query = query.eq('deal_id', feeRecord.deal_id);
    }
    
    // Fetch potential matches
    const { data: transactions, error } = await query.limit(100);
    
    if (error || !transactions) {
      console.error('Error fetching transactions:', error);
      return [];
    }
    
    // Score each transaction
    for (const tx of transactions) {
      const candidate = this.scoreMatch(feeRecord, tx);
      if (candidate.confidence > 0.5) { // 50% confidence threshold
        candidates.push(candidate);
      }
    }
    
    // Sort by confidence
    return candidates.sort((a, b) => b.confidence - a.confidence);
  }
  
  /**
   * Score a potential match
   */
  private scoreMatch(feeRecord: FeeRecord, transaction: any): MatchCandidate {
    let totalScore = 0;
    let totalWeight = 0;
    const matchReasons: string[] = [];
    
    // Match investor name
    if (feeRecord.investor_name && transaction.investors?.full_name) {
      const similarity = this.stringSimilarity(
        feeRecord.investor_name.toLowerCase(),
        transaction.investors.full_name.toLowerCase()
      );
      if (similarity > 0.8) {
        totalScore += similarity * this.getWeight('investor_name');
        matchReasons.push(`Investor name match (${Math.round(similarity * 100)}%)`);
      }
      totalWeight += this.getWeight('investor_name');
    }
    
    // Match deal name
    if (feeRecord.deal_name && transaction.deals?.name) {
      const similarity = this.stringSimilarity(
        feeRecord.deal_name.toLowerCase(),
        transaction.deals.name.toLowerCase()
      );
      if (similarity > 0.8) {
        totalScore += similarity * this.getWeight('deal_name');
        matchReasons.push(`Deal name match (${Math.round(similarity * 100)}%)`);
      }
      totalWeight += this.getWeight('deal_name');
    }
    
    // Match amount
    if (feeRecord.gross_amount && transaction.gross_capital) {
      const threshold = this.getThreshold('amount') || 0.01;
      const diff = Math.abs(feeRecord.gross_amount - transaction.gross_capital);
      const percentDiff = diff / transaction.gross_capital;
      
      if (percentDiff <= threshold) {
        const score = 1 - (percentDiff / threshold);
        totalScore += score * this.getWeight('amount');
        matchReasons.push(`Amount match (${Math.round((1 - percentDiff) * 100)}% similar)`);
      }
      totalWeight += this.getWeight('amount');
    }
    
    // Match date
    if (feeRecord.date && transaction.transaction_date) {
      const threshold = this.getThreshold('date') || 30;
      const daysDiff = Math.abs(
        (new Date(feeRecord.date).getTime() - new Date(transaction.transaction_date).getTime()) 
        / (1000 * 60 * 60 * 24)
      );
      
      if (daysDiff <= threshold) {
        const score = 1 - (daysDiff / threshold);
        totalScore += score * this.getWeight('date');
        matchReasons.push(`Date match (${Math.round(daysDiff)} days apart)`);
      }
      totalWeight += this.getWeight('date');
    }
    
    const confidence = totalWeight > 0 ? totalScore / totalWeight : 0;
    
    return {
      transaction_id: transaction.transaction_id,
      investor_id: transaction.investor_id,
      deal_id: transaction.deal_id,
      gross_capital: transaction.gross_capital,
      transaction_date: transaction.transaction_date,
      investor_name: transaction.investors?.full_name,
      deal_name: transaction.deals?.name,
      confidence,
      match_reasons: matchReasons
    };
  }
  
  /**
   * Simple string similarity using Levenshtein distance
   */
  private stringSimilarity(s1: string, s2: string): number {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }
  
  private levenshteinDistance(s1: string, s2: string): number {
    const costs: number[] = [];
    for (let i = 0; i <= s2.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s1.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(j - 1) !== s2.charAt(i - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s1.length] = lastValue;
    }
    return costs[s1.length];
  }
  
  private getWeight(field: string): number {
    const rule = this.rules.find(r => r.field === field);
    return rule?.weight || 0;
  }
  
  private getThreshold(field: string): number | undefined {
    const rule = this.rules.find(r => r.field === field);
    return rule?.threshold;
  }
  
  /**
   * Batch match multiple fee records
   */
  async batchMatch(feeRecords: FeeRecord[]): Promise<Map<number, MatchCandidate[]>> {
    const results = new Map<number, MatchCandidate[]>();
    
    for (let i = 0; i < feeRecords.length; i++) {
      const matches = await this.findMatches(feeRecords[i]);
      results.set(i, matches);
    }
    
    return results;
  }
  
  /**
   * Apply matched fees to transactions
   */
  async applyMatches(
    matches: Array<{
      fee_record: FeeRecord;
      transaction_id: number;
    }>
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;
    
    for (const match of matches) {
      try {
        // Update transaction with fee data
        const updateData: any = {};
        
        if (match.fee_record.management_fee !== undefined) {
          updateData.management_fee = match.fee_record.management_fee;
        }
        if (match.fee_record.admin_fee !== undefined) {
          updateData.admin_fee = match.fee_record.admin_fee;
        }
        if (match.fee_record.performance_fee !== undefined) {
          updateData.performance_fee = match.fee_record.performance_fee;
        }
        if (match.fee_record.structuring_fee !== undefined) {
          updateData.structuring_fee = match.fee_record.structuring_fee;
        }
        
        // Calculate total fees
        updateData.total_fees = 
          (updateData.management_fee || 0) +
          (updateData.admin_fee || 0) +
          (updateData.performance_fee || 0) +
          (updateData.structuring_fee || 0);
        
        // Update net transfer
        const { data: tx } = await this.client
          .from('transactions_clean')
          .select('gross_capital')
          .eq('transaction_id', match.transaction_id)
          .single();
        
        if (tx) {
          updateData.net_transfer = tx.gross_capital - updateData.total_fees;
        }
        
        // Apply update
        const { error } = await this.client
          .from('transactions_clean')
          .update(updateData)
          .eq('transaction_id', match.transaction_id);
        
        if (error) {
          console.error(`Failed to update transaction ${match.transaction_id}:`, error);
          failed++;
        } else {
          success++;
          
          // Log the match
          await this.client
            .from('fee_matching_log')
            .insert({
              fee_record_id: match.fee_record.id,
              transaction_id: match.transaction_id,
              confidence: 1.0,
              applied: true,
              applied_at: new Date().toISOString()
            });
        }
      } catch (error) {
        console.error('Error applying match:', error);
        failed++;
      }
    }
    
    return { success, failed };
  }
  
  /**
   * Get unmatched fee records
   */
  async getUnmatchedFees(): Promise<FeeRecord[]> {
    const { data, error } = await this.client
      .from('fee_legacy_import')
      .select('*')
      .is('transaction_id', null)
      .eq('processed', false);
    
    if (error) {
      console.error('Error fetching unmatched fees:', error);
      return [];
    }
    
    return data || [];
  }
  
  /**
   * Auto-match unprocessed fees
   */
  async autoMatch(confidenceThreshold = 0.8): Promise<{
    matched: number;
    unmatched: number;
    errors: number;
  }> {
    const unmatched = await this.getUnmatchedFees();
    let matched = 0;
    let unmatchedCount = 0;
    let errors = 0;
    
    for (const feeRecord of unmatched) {
      try {
        const matches = await this.findMatches(feeRecord);
        
        // Only auto-apply if we have a high-confidence single match
        if (matches.length === 1 && matches[0].confidence >= confidenceThreshold) {
          const result = await this.applyMatches([{
            fee_record: feeRecord,
            transaction_id: matches[0].transaction_id
          }]);
          
          if (result.success > 0) {
            matched++;
          } else {
            unmatchedCount++;
          }
        } else {
          unmatchedCount++;
        }
      } catch (error) {
        console.error('Error in auto-match:', error);
        errors++;
      }
    }
    
    return { matched, unmatched: unmatchedCount, errors };
  }
}