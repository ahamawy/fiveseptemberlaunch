/**
 * Services Index
 * Export all services from a single location
 */

export { BaseService } from './base.service';

// Import first, then re-export
import { DealsService as DS, dealsService as ds } from './deals.service';
import { InvestorsService as IS, investorsService as is } from './investors.service';
import { DocumentsService as DocS, documentsService as docs } from './documents.service';

export { DS as DealsService, ds as dealsService };
export { IS as InvestorsService, is as investorsService };
export { DocS as DocumentsService, docs as documentsService };

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
    return new DS();
  }

  static createInvestorsService() {
    return new IS();
  }

  static createDocumentsService() {
    return new DocS();
  }
}

// Export default services object for easy access
export const services = {
  deals: ds,
  investors: is,
  documents: docs
} as const;

export default services;