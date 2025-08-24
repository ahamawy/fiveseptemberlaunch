/**
 * Portfolio Aggregator Service
 * Aggregates portfolio data across multiple investors for consolidated views
 */

import { BaseService } from "./base.service";
import { investorsService } from "./investors.service";

export interface AggregatedPortfolio {
  investors: number[];
  investorNames: string[];
  deals: any[];
  summary: {
    totalInvested: number;
    currentValue: number;
    totalDeals: number;
    avgMOIC: number;
    avgIRR: number;
    unrealizedGain: number;
  };
}

export class PortfolioAggregatorService extends BaseService {
  /**
   * Get aggregated portfolio across multiple investors
   * Useful for family offices or related investor groups
   */
  async getAggregatedPortfolio(
    investorIds: number[]
  ): Promise<AggregatedPortfolio> {
    const cacheKey = `aggregated-portfolio:${investorIds.join("-")}`;
    const cached = this.getCached<AggregatedPortfolio>(cacheKey);
    if (cached) return cached;

    try {
      this.log("getAggregatedPortfolio", { investorIds });

      // Get all investor names
      const investorNames: string[] = [];
      for (const id of investorIds) {
        const investor = await this.dataClient.getInvestorById(id);
        if (investor) {
          investorNames.push(investor.name);
        }
      }

      // Get portfolio holdings for each investor
      const allHoldings: any[] = [];
      const dealMap = new Map<number, any>();

      for (const investorId of investorIds) {
        const holdings = (await investorsService.getPortfolioHoldings(
          investorId
        )) as any;
        if (holdings?.data) {
          for (const holding of holdings.data) {
            // Aggregate by deal
            const existing = dealMap.get(holding.dealId);
            if (existing) {
              // Combine holdings in the same deal
              existing.committed += holding.committed;
              existing.called += holding.called;
              existing.distributed += holding.distributed;
              existing.currentValue += holding.currentValue;
              existing.unrealizedGain += holding.unrealizedGain;
              existing.units += holding.units;
              existing.investors.push(investorId);
              // Recalculate weighted averages
              existing.moic = existing.currentValue / existing.called;
            } else {
              dealMap.set(holding.dealId, {
                ...holding,
                investors: [investorId],
              });
            }
          }
        }
      }

      // Convert map to array and sort by current value
      const aggregatedDeals = Array.from(dealMap.values()).sort(
        (a, b) => b.currentValue - a.currentValue
      );

      // Calculate summary
      const totalInvested = aggregatedDeals.reduce(
        (sum, d) => sum + d.called,
        0
      );
      const currentValue = aggregatedDeals.reduce(
        (sum, d) => sum + d.currentValue,
        0
      );
      const unrealizedGain = aggregatedDeals.reduce(
        (sum, d) => sum + d.unrealizedGain,
        0
      );
      const avgMOIC = totalInvested > 0 ? currentValue / totalInvested : 0;

      // Calculate weighted average IRR
      let totalWeightedIRR = 0;
      let totalWeight = 0;
      for (const deal of aggregatedDeals) {
        if (deal.called > 0) {
          totalWeightedIRR += deal.irr * deal.called;
          totalWeight += deal.called;
        }
      }
      const avgIRR = totalWeight > 0 ? totalWeightedIRR / totalWeight : 0;

      const result: AggregatedPortfolio = {
        investors: investorIds,
        investorNames,
        deals: aggregatedDeals,
        summary: {
          totalInvested,
          currentValue,
          totalDeals: aggregatedDeals.length,
          avgMOIC: Math.round(avgMOIC * 100) / 100,
          avgIRR: Math.round(avgIRR * 10) / 10,
          unrealizedGain,
        },
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      this.handleError(error, "getAggregatedPortfolio");
      return {
        investors: investorIds,
        investorNames: [],
        deals: [],
        summary: {
          totalInvested: 0,
          currentValue: 0,
          totalDeals: 0,
          avgMOIC: 0,
          avgIRR: 0,
          unrealizedGain: 0,
        },
      };
    }
  }

  /**
   * Get related investors (e.g., family members, same company)
   */
  async getRelatedInvestors(investorId: number): Promise<number[]> {
    // This would typically check relationships in the database
    // For now, return known related investors based on analysis

    if (investorId === 1) {
      // Ahmed Youseph Khidr Al Sharif's related investors
      return [1, 12, 34, 21]; // Including Nur Alsharif (family), EWT, and Ahmed Tarek
    }

    return [investorId];
  }

  /**
   * Get consolidated portfolio for an investor including related accounts
   */
  async getConsolidatedPortfolio(
    investorId: number
  ): Promise<AggregatedPortfolio> {
    const relatedInvestors = await this.getRelatedInvestors(investorId);
    return this.getAggregatedPortfolio(relatedInvestors);
  }
}

// Export singleton instance
export const portfolioAggregatorService = new PortfolioAggregatorService();
