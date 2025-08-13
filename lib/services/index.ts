/**
 * Services Index
 * Export all services from a single location
 */

export { BaseService } from './base.service';
export { DealsService, dealsService } from './deals.service';
export { InvestorsService, investorsService } from './investors.service';

// Re-export types for convenience
export type {
  DealWithCompany,
  DealDetails,
  DealListOptions
} from './deals.service';

export type {
  InvestorProfile,
  InvestorListOptions
} from './investors.service';

// Service factory for creating new instances if needed
export class ServiceFactory {
  static createDealsService() {
    return new DealsService();
  }

  static createInvestorsService() {
    return new InvestorsService();
  }
}

// Export default services object for easy access
export const services = {
  deals: dealsService,
  investors: investorsService
} as const;

export default services;