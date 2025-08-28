import { getServiceClient } from '@/lib/db/supabase/server-client';
import { getPortfolioClient } from '@/lib/db/supabase/schema';
import {
  getActivePositionsByDeal,
  getDealTokens,
  getLatestValuationsForCompanies,
  insertDealPosition,
  insertNavHistory,
  updateDealTokensNav,
  upsertCompanyValuation,
  getPositionsByCompany
} from '@/lib/db/repositories/portfolio.repo';
import { getCompaniesByIds, getDealsByIds } from '@/lib/db/repositories/public.repo';

export interface CompanyValuationInput {
  companyId: number;
  sharePrice: number;
  valuationDate?: Date;
  valuationMethod?: 'market' | 'dcf' | 'comparable' | 'cost' | '409a';
  valuationSource?: 'funding_round' | 'quarterly_mark' | 'exit' | 'ipo' | 'manual';
  totalSharesOutstanding?: number;
  preMoneyValuation?: number;
  postMoneyValuation?: number;
  confidenceLevel?: number; // 0-100
  notes?: string;
}

export interface DealCompanyPosition {
  dealId: number;
  companyId: number;
  companyName: string;
  sharesOwned: number;
  shareClass?: string;
  purchasePricePerShare: number;
  purchaseDate: Date;
  costBasis: number;
  ownershipPercentage?: number;
  currentSharePrice?: number;
  currentValue?: number;
  unrealizedGain?: number;
  positionMoic?: number;
}

export interface DealPortfolioSummary {
  dealId: number;
  dealName: string;
  totalTokens: number;
  portfolioCompanies: number;
  totalInvested: number;
  currentPortfolioValue: number;
  navPerToken: number;
  portfolioMoic: number;
  lastValuationUpdate?: Date;
  positions: DealCompanyPosition[];
}

export interface CompanyValuationHistory {
  companyId: number;
  companyName: string;
  valuations: {
    valuationDate: Date;
    sharePrice: number;
    valuationMethod: string;
    valuationSource: string;
    confidenceLevel?: number;
  }[];
}

// Internal row shapes for typed mapping
interface PositionRow {
  position_id: number;
  company_id: number;
  shares_owned: number;
  purchase_price_per_share: number;
  cost_basis: number;
}

interface PortfolioPosRow {
  deal_id: number;
  company_id: number;
  shares_owned: number;
  share_class?: string;
  purchase_price_per_share: number;
  purchase_date: string;
  cost_basis: number;
  ownership_percentage?: number;
}

interface CompanyDealRow {
  deal_id: number;
  shares_owned: number;
  cost_basis: number;
  current_value?: number;
  position_status: string;
}

interface PortfolioValRow {
  company_id: number;
  share_price: number;
  valuation_date: string;
}

interface CompanyValuationRow {
  valuation_date: string;
  share_price: number;
  valuation_method: string;
  valuation_source: string;
  confidence_level?: number;
}

export class ValuationService {
  private supabase = getServiceClient();
  private p = getPortfolioClient(this.supabase);

  /**
   * Update a company's valuation and cascade to all affected deals
   */
  async updateCompanyValuation(input: CompanyValuationInput) {
    const {
      companyId,
      sharePrice,
      valuationDate = new Date(),
      valuationMethod = 'market',
      valuationSource = 'manual',
      ...additionalFields
    } = input;

    try {
      // Insert or update company valuation via repository
      const valuation = await upsertCompanyValuation(this.p, {
        company_id: companyId,
        valuation_date: valuationDate.toISOString().split('T')[0],
        share_price: sharePrice,
        valuation_method: valuationMethod,
        valuation_source: valuationSource,
        ...additionalFields
      });

      // Get all deals affected by this company valuation
      const { data: positions, error: posError } = await this.p
        .from('deal_company_positions')
        .select('deal_id')
        .eq('company_id', companyId)
        .eq('position_status', 'active');

      if (posError) {
        throw new Error(`Failed to fetch positions: ${posError.message}`);
      }

      // Update NAV for all affected deals
      const affectedDealIds: number[] = ((positions || []) as Array<{ deal_id: number }>).map((pos) => pos.deal_id);
      const navUpdates = affectedDealIds.map((id) => this.calculateDealNAV(id));

      await Promise.all(navUpdates);

      return {
        valuation,
        affectedDeals: positions?.length || 0
      };
    } catch (error: any) {
      throw new Error(`Valuation update failed: ${error.message}`);
    }
  }

  /**
   * Calculate and update NAV for a deal based on its portfolio companies
   */
  async calculateDealNAV(dealId: number) {
    try {
      // Get all active positions for this deal
      const positions = await getActivePositionsByDeal(this.p, dealId);

      // Batch fetch latest valuations per company
      const posRows: PositionRow[] = (positions || []) as PositionRow[];
      const companyIds = [...new Set(posRows.map((pr) => pr.company_id))];
      const latestByCompany = await getLatestValuationsForCompanies(this.p, companyIds);

      // Calculate total portfolio value and update positions
      let totalValue = 0;
      for (const position of posRows) {
        const currentSharePrice =
          latestByCompany.get(position.company_id) ?? Number(position.purchase_price_per_share);
        const positionValue = Number(position.shares_owned) * Number(currentSharePrice);
        totalValue += positionValue;

        await this.p
          .from('deal_company_positions')
          .update({
            current_share_price: currentSharePrice,
            current_value: positionValue,
            unrealized_gain: positionValue - Number(position.cost_basis),
            updated_at: new Date().toISOString()
          })
          .eq('position_id', position.position_id);
      }

      // Get total token supply
      const dealTokens = await getDealTokens(this.p, dealId);

      // Calculate NAV per token
      const totalSupply = Number(dealTokens?.total_supply || 0);
      const navPerToken = totalSupply > 0 ? totalValue / totalSupply : 0;

      // Update deal tokens with new NAV
      await updateDealTokensNav(this.p, dealId, navPerToken, 'weighted_portfolio');

      // Record NAV history
      await insertNavHistory(this.p, {
        deal_id: dealId,
        nav_per_token: navPerToken,
        total_portfolio_value: totalValue,
        total_token_supply: totalSupply,
        calculation_method: 'weighted_portfolio'
      });

      return {
        dealId,
        navPerToken,
        totalPortfolioValue: totalValue,
        totalSupply
      };
    } catch (error: any) {
      throw new Error(`NAV calculation failed: ${error.message}`);
    }
  }

  /**
   * Get portfolio composition and valuation for a deal
   */
  async getDealPortfolio(dealId: number): Promise<DealPortfolioSummary> {
    try {
      // Get deal info
      const { data: deal } = await this.supabase
        .from('deals_clean')
        .select('deal_name')
        .eq('deal_id', dealId)
        .single();

      // Get token info
      const { data: tokens } = await this.p
        .from('deal_tokens')
        .select('total_supply, nav_per_token')
        .eq('deal_id', dealId)
        .single();

      // Get all positions (via public view)
      const positions = await this.p
        .from('deal_company_positions')
        .select('deal_id, company_id, shares_owned, share_class, purchase_price_per_share, purchase_date, cost_basis, ownership_percentage')
        .eq('deal_id', dealId)
        .eq('position_status', 'active');
      if (positions.error) throw new Error(`Failed to fetch portfolio: ${positions.error.message}`);
      const posData = positions.data || [];

      // Calculate portfolio metrics
      let totalInvested = 0;
      let currentPortfolioValue = 0;
      const formattedPositions: DealCompanyPosition[] = [];

      // Batch company names
      const portRows: PortfolioPosRow[] = (posData || []) as PortfolioPosRow[];
      const companyIds = [...new Set(portRows.map((r) => r.company_id))];
      const companyMapRaw = await getCompaniesByIds(this.supabase, companyIds);
      const companyMap = new Map<number, string>();
      for (const [id, c] of companyMapRaw.entries()) companyMap.set(id, c.company_name);

      // Batch latest valuations
      const latestByCompany = new Map<number, { price: number; date?: string }>();
      if (companyIds.length) {
        const latest = await getLatestValuationsForCompanies(this.p, companyIds);
        for (const [k, v] of latest.entries()) {
          if (!latestByCompany.has(k)) latestByCompany.set(k, v);
        }
      }

      for (const pos of portRows) {
        const currentSharePrice =
          latestByCompany.get(pos.company_id)?.price ?? Number(pos.purchase_price_per_share);
        const currentValue = Number(pos.shares_owned) * Number(currentSharePrice);
        const unrealizedGain = currentValue - Number(pos.cost_basis);
        const positionMoic = Number(pos.cost_basis) > 0 ? currentValue / Number(pos.cost_basis) : 0;

        totalInvested += Number(pos.cost_basis);
        currentPortfolioValue += currentValue;

        formattedPositions.push({
          dealId: pos.deal_id,
          companyId: pos.company_id,
          companyName: companyMap.get(pos.company_id) || 'Unknown',
          sharesOwned: Number(pos.shares_owned),
          shareClass: pos.share_class,
          purchasePricePerShare: Number(pos.purchase_price_per_share),
          purchaseDate: new Date(pos.purchase_date),
          costBasis: Number(pos.cost_basis),
          ownershipPercentage: pos.ownership_percentage ? Number(pos.ownership_percentage) : undefined,
          currentSharePrice: Number(currentSharePrice),
          currentValue,
          unrealizedGain,
          positionMoic
        });
      }

      const portfolioMoic = totalInvested > 0 ? currentPortfolioValue / totalInvested : 0;

      return {
        dealId,
        dealName: deal?.deal_name || 'Unknown Deal',
        totalTokens: Number(tokens?.total_supply || 0),
        portfolioCompanies: portRows.length || 0,
        totalInvested,
        currentPortfolioValue,
        navPerToken: Number(tokens?.nav_per_token || 0),
        portfolioMoic,
        positions: formattedPositions
      };
    } catch (error: any) {
      throw new Error(`Failed to get deal portfolio: ${error.message}`);
    }
  }

  /**
   * Get valuation history for a company
   */
  async getCompanyValuationHistory(companyId: number): Promise<CompanyValuationHistory> {
    try {
      // Get company info
      const { data: company } = await this.supabase
        .from('companies_clean')
        .select('company_name')
        .eq('company_id', companyId)
        .single();

      // Get valuation history
      const { data: valuations, error } = await this.p
        .from('company_valuations')
        .select('*')
        .eq('company_id', companyId)
        .order('valuation_date', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch valuations: ${error.message}`);
      }

      const valRowsHist: CompanyValuationRow[] = (valuations || []) as CompanyValuationRow[];
      return {
        companyId,
        companyName: company?.company_name || 'Unknown',
        valuations: valRowsHist.map((v) => ({
          valuationDate: new Date(v.valuation_date),
          sharePrice: Number(v.share_price),
          valuationMethod: v.valuation_method,
          valuationSource: v.valuation_source,
          confidenceLevel: v.confidence_level ? Number(v.confidence_level) : undefined
        }))
      };
    } catch (error: any) {
      throw new Error(`Failed to get valuation history: ${error.message}`);
    }
  }

  /**
   * Add a new company position to a deal
   */
  async addDealPosition(
    dealId: number,
    companyId: number,
    shares: number,
    pricePerShare: number,
    purchaseDate?: Date,
    shareClass?: string
  ) {
    try {
      const position = await insertDealPosition(this.p, {
        deal_id: dealId,
        company_id: companyId,
        shares_owned: shares,
        purchase_price_per_share: pricePerShare,
        purchase_date: (purchaseDate || new Date()).toISOString().split('T')[0],
        cost_basis: shares * pricePerShare,
        share_class: shareClass
      });

      // Recalculate NAV for the deal
      await this.calculateDealNAV(dealId);

      return position;
    } catch (error: any) {
      throw new Error(`Failed to add deal position: ${error.message}`);
    }
  }

  /**
   * Get all deals affected by a company
   */
  async getDealsForCompany(companyId: number) {
    try {
      const compDealRows: CompanyDealRow[] = await getPositionsByCompany(this.p, companyId);
      const dealIds = [...new Set(compDealRows.map((r) => r.deal_id))];
      const dealMapRaw = await getDealsByIds(this.supabase, dealIds);
      const dealMap = new Map<number, any>(dealIds.map((id) => [id, dealMapRaw.get(id)]));

      return compDealRows.map((pos) => ({
        dealId: pos.deal_id,
        dealName: dealMap.get(pos.deal_id)?.deal_name || 'Unknown',
        dealStatus: dealMap.get(pos.deal_id)?.deal_status,
        sharesOwned: Number(pos.shares_owned),
        costBasis: Number(pos.cost_basis),
        currentValue: pos.current_value ? Number(pos.current_value) : undefined,
        positionStatus: pos.position_status
      }));
    } catch (error: any) {
      throw new Error(`Failed to get deals for company: ${error.message}`);
    }
  }

  /**
   * Batch update company valuations
   */
  async batchUpdateValuations(valuations: CompanyValuationInput[]) {
    const results = [];
    const errors = [];

    for (const val of valuations) {
      try {
        const result = await this.updateCompanyValuation(val);
        results.push(result);
      } catch (error: any) {
        errors.push({
          companyId: val.companyId,
          error: error.message
        });
      }
    }

    return {
      successful: results.length,
      failed: errors.length,
      results,
      errors
    };
  }
}

export const valuationService = new ValuationService();