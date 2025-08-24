import { SupabaseClient } from "@supabase/supabase-js";
import { findCompanyAssetUrls } from "@/lib/utils/storage";

/**
 * Data Enrichment Service
 * Centralizes common data enrichment patterns used across API routes
 */

export interface EnrichedDeal {
  deal_id: number;
  deal_name: string;
  company_id?: number;
  company_name?: string;
  company_sector?: string;
  company_logo_url?: string | null;
  company_background_url?: string | null;
  moic?: number;
  irr?: number | null;
  investors_count?: number;
  documents_count?: number;
  transactions_count?: number;
  [key: string]: any;
}

export interface EnrichedCompany {
  company_id: number;
  company_name: string;
  company_sector?: string;
  logo_url?: string | null;
  background_url?: string | null;
  deals_count?: number;
  total_value?: number;
  [key: string]: any;
}

export class DataEnrichmentService {
  constructor(private db: SupabaseClient) {}

  /**
   * Enriches deals with company information and asset URLs
   */
  async enrichDealsWithCompanies(deals: any[]): Promise<EnrichedDeal[]> {
    if (!deals || deals.length === 0) return [];

    // Extract unique company IDs
    const companyIds = [...new Set(
      deals
        .map(d => d.underlying_company_id || d.company_id)
        .filter(Boolean)
    )];

    if (companyIds.length === 0) return deals;

    // Fetch company details
    const { data: companies } = await this.db
      .from("companies.company")
      .select("company_id, company_name, company_sector, company_description")
      .in("company_id", companyIds);

    // Create company lookup map
    const companyMap = new Map<number, any>();
    (companies || []).forEach(c => companyMap.set(c.company_id, c));

    // Fetch asset URLs for all companies
    const assetMap = await this.fetchCompanyAssets(companyIds, companyMap);

    // Enrich deals
    return deals.map(deal => {
      const companyId = deal.underlying_company_id || deal.company_id;
      const company = companyId ? companyMap.get(companyId) : null;
      const assets = companyId ? assetMap.get(companyId) : null;

      return {
        ...deal,
        company_name: company?.company_name,
        company_sector: company?.company_sector,
        company_description: company?.company_description,
        company_logo_url: assets?.logo_url,
        company_background_url: assets?.background_url,
      };
    });
  }

  /**
   * Fetches and caches company asset URLs
   */
  async fetchCompanyAssets(
    companyIds: number[],
    companyMap: Map<number, any>
  ): Promise<Map<number, { logo_url: string | null; background_url: string | null }>> {
    const assetMap = new Map();

    for (const companyId of companyIds) {
      try {
        const company = companyMap.get(companyId);
        const assets = await findCompanyAssetUrls(
          this.db,
          companyId,
          company?.company_name
        );
        assetMap.set(companyId, assets);
      } catch (error) {
        console.error(`Failed to fetch assets for company ${companyId}:`, error);
        assetMap.set(companyId, { logo_url: null, background_url: null });
      }
    }

    return assetMap;
  }

  /**
   * Enriches deals with latest valuations
   */
  async enrichDealsWithValuations(deals: any[]): Promise<EnrichedDeal[]> {
    if (!deals || deals.length === 0) return deals;

    const dealIds = deals.map(d => d.deal_id).filter(Boolean);
    if (dealIds.length === 0) return deals;

    // Fetch latest valuations
    const { data: valuations } = await this.db
      .from("deal_valuations")
      .select("deal_id, moic, irr, valuation_date")
      .in("deal_id", dealIds)
      .order("valuation_date", { ascending: false });

    // Keep only latest valuation per deal
    const valuationMap = new Map<number, { moic: number; irr: number | null }>();
    (valuations || []).forEach(v => {
      if (!valuationMap.has(v.deal_id)) {
        valuationMap.set(v.deal_id, {
          moic: parseFloat(v.moic) || 1.0,
          irr: v.irr ? parseFloat(v.irr) : null,
        });
      }
    });

    // Enrich deals
    return deals.map(deal => {
      const valuation = valuationMap.get(deal.deal_id);
      return {
        ...deal,
        moic: valuation?.moic || deal.moic || 1.0,
        irr: valuation?.irr || deal.irr || null,
      };
    });
  }

  /**
   * Counts investors per deal
   */
  async countInvestorsPerDeal(dealIds: number[]): Promise<Map<number, number>> {
    const investorMap = new Map<number, number>();
    
    if (!dealIds || dealIds.length === 0) return investorMap;

    try {
      const { data: transactions } = await this.db
        .from("transactions")
        .select("deal_id, investor_id")
        .in("deal_id", dealIds);

      // Count unique investors per deal
      const dealInvestorMap = new Map<number, Set<number>>();
      (transactions || []).forEach(t => {
        if (!t.deal_id) return;
        if (!dealInvestorMap.has(t.deal_id)) {
          dealInvestorMap.set(t.deal_id, new Set());
        }
        dealInvestorMap.get(t.deal_id)!.add(t.investor_id);
      });

      // Convert to count map
      dealInvestorMap.forEach((investorSet, dealId) => {
        investorMap.set(dealId, investorSet.size);
      });
    } catch (error) {
      console.error("Error counting investors:", error);
    }

    return investorMap;
  }

  /**
   * Counts documents per deal (optionally filtered by investor)
   */
  async countDocumentsPerDeal(
    dealIds: number[],
    investorId?: number
  ): Promise<Map<number, number>> {
    const documentMap = new Map<number, number>();
    
    if (!dealIds || dealIds.length === 0) return documentMap;

    try {
      let query = this.db
        .from("documents")
        .select("deal_id")
        .in("deal_id", dealIds);

      if (investorId) {
        query = query.eq("investor_id", investorId);
      }

      const { data: documents } = await query;

      // Count documents per deal
      (documents || []).forEach(d => {
        const dealId = d.deal_id as number;
        if (!dealId) return;
        documentMap.set(dealId, (documentMap.get(dealId) || 0) + 1);
      });
    } catch (error) {
      console.error("Error counting documents:", error);
    }

    return documentMap;
  }

  /**
   * Enriches deals with all metadata (companies, valuations, counts)
   */
  async fullyEnrichDeals(
    deals: any[],
    options: {
      includeCompanies?: boolean;
      includeValuations?: boolean;
      includeInvestorCount?: boolean;
      includeDocumentCount?: boolean;
      investorId?: number; // For investor-specific document counts
    } = {}
  ): Promise<EnrichedDeal[]> {
    const {
      includeCompanies = true,
      includeValuations = true,
      includeInvestorCount = false,
      includeDocumentCount = false,
      investorId,
    } = options;

    let enrichedDeals = deals;

    // Enrich with companies and assets
    if (includeCompanies) {
      enrichedDeals = await this.enrichDealsWithCompanies(enrichedDeals);
    }

    // Enrich with valuations
    if (includeValuations) {
      enrichedDeals = await this.enrichDealsWithValuations(enrichedDeals);
    }

    const dealIds = deals.map(d => d.deal_id).filter(Boolean);

    // Add investor counts
    if (includeInvestorCount && dealIds.length > 0) {
      const investorCounts = await this.countInvestorsPerDeal(dealIds);
      enrichedDeals = enrichedDeals.map(deal => ({
        ...deal,
        investors_count: investorCounts.get(deal.deal_id) || 0,
      }));
    }

    // Add document counts
    if (includeDocumentCount && dealIds.length > 0) {
      const documentCounts = await this.countDocumentsPerDeal(dealIds, investorId);
      enrichedDeals = enrichedDeals.map(deal => ({
        ...deal,
        documents_count: documentCounts.get(deal.deal_id) || 0,
      }));
    }

    return enrichedDeals;
  }

  /**
   * Aggregates transaction metrics for deals
   */
  async aggregateTransactionMetrics(
    dealIds: number[]
  ): Promise<Map<number, { total_capital: number; transaction_count: number }>> {
    const metricsMap = new Map();

    if (!dealIds || dealIds.length === 0) return metricsMap;

    try {
      const { data: transactions } = await this.db
        .from("transactions")
        .select("deal_id, initial_net_capital, gross_capital")
        .in("deal_id", dealIds);

      // Aggregate metrics per deal
      (transactions || []).forEach(t => {
        const dealId = t.deal_id;
        if (!dealId) return;

        const capital = (t.initial_net_capital || t.gross_capital || 0) as number;
        const current = metricsMap.get(dealId) || { total_capital: 0, transaction_count: 0 };

        metricsMap.set(dealId, {
          total_capital: current.total_capital + capital,
          transaction_count: current.transaction_count + 1,
        });
      });
    } catch (error) {
      console.error("Error aggregating transaction metrics:", error);
    }

    return metricsMap;
  }
}

// Export singleton instance
let enrichmentService: DataEnrichmentService | null = null;

export function getEnrichmentService(db: SupabaseClient): DataEnrichmentService {
  if (!enrichmentService) {
    enrichmentService = new DataEnrichmentService(db);
  }
  return enrichmentService;
}