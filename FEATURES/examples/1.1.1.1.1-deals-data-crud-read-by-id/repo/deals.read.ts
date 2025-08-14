/**
 * Deals Repository
 * Handles data fetching with automatic mock/Supabase switching
 */

import { dealsService } from '@/lib/services';
import { schemaManager } from '@/lib/db/schema-manager';
import type { DealDTOType } from '../dto/deal';
import { transformToDealDTO } from '../dto/deal';

export class DealsRepository {
  /**
   * Get a single deal by ID
   * Automatically uses mock data or Supabase based on configuration
   */
  async getDealById(dealId: number): Promise<DealDTOType | null> {
    try {
      const mode = schemaManager.getMode();
      
      if (mode === 'mock') {
        // Use existing service layer for mock data
        const dealDetails = await dealsService.getDealById(dealId);
        
        if (!dealDetails) {
          return null;
        }
        
        // Transform to DTO format
        return transformToDealDTO({
          id: dealDetails.id,
          name: dealDetails.name,
          stage: dealDetails.stage,
          deal_stage: dealDetails.stage,
          company: dealDetails.company ? {
            id: dealDetails.company.id,
            name: dealDetails.company.name
          } : undefined,
          slug: dealDetails.slug,
          code: dealDetails.deal_code,
          aliases: []
        });
      }
      
      // Direct Supabase query
      const client = schemaManager.getClient();
      
      if (!client) {
        throw new Error('No database client available');
      }
      
      // For Supabase mode, execute direct query
      const query = `
        SELECT 
          d.deal_id as id,
          d.deal_name as name,
          d.deal_stage as stage,
          d.deal_code as code,
          d.deal_slug as slug,
          c.company_id as company_id,
          c.company_name as company_name
        FROM deals.deal d
        LEFT JOIN companies.company c ON d.underlying_company_id = c.company_id
        WHERE d.deal_id = $1
        LIMIT 1
      `;
      
      const result = await schemaManager.executeQuery(query, [dealId]);
      
      if (!result || result.length === 0) {
        return null;
      }
      
      const deal = result[0];
      
      // Get identifiers/aliases if they exist
      const identifierQuery = `
        SELECT kind, value 
        FROM deals.identifier 
        WHERE deal_id = $1
      `;
      
      const identifiers = await schemaManager.executeQuery(identifierQuery, [dealId]);
      
      const aliases = identifiers
        ?.filter((i: any) => i.kind === 'alias')
        ?.map((i: any) => i.value) || [];
      
      // Transform to DTO
      return transformToDealDTO({
        id: deal.id,
        name: deal.name,
        stage: deal.stage,
        company: deal.company_id ? {
          id: deal.company_id,
          name: deal.company_name
        } : undefined,
        code: deal.code,
        slug: deal.slug,
        aliases
      });
      
    } catch (error) {
      console.error('Error fetching deal by ID:', error);
      throw error;
    }
  }
  
  /**
   * Check if user has access to deal (tenant/RLS check)
   * For now, returns true in mock mode
   */
  async checkDealAccess(dealId: number, userId?: number): Promise<boolean> {
    const mode = schemaManager.getMode();
    
    if (mode === 'mock') {
      // In mock mode, all deals are accessible
      return true;
    }
    
    // In Supabase mode, RLS policies will handle access
    // This is a placeholder for explicit access checks if needed
    return true;
  }
}

// Export singleton instance
export const dealsRepository = new DealsRepository();