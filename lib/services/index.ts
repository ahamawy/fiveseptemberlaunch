/**
 * Services Index
 * Export all services from a single location
 */

export { BaseService } from './base.service';

// Direct exports without confusing aliases
export { DealsService, dealsService } from './deals.service';
export { InvestorsService, investorsService } from './investors.service';
export { DocumentsService, documentsService } from './documents.service';
export { TransactionsService, transactionsService } from './transactions.service';
export { FeesService, feesService } from './fees.service';

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

// Import services for factory
import { DealsService } from './deals.service';
import { InvestorsService } from './investors.service';
import { DocumentsService } from './documents.service';
import { TransactionsService } from './transactions.service';
import { FeesService } from './fees.service';

// Service factory for creating new instances if needed
export class ServiceFactory {
  static createDealsService() {
    return new DealsService();
  }

  static createInvestorsService() {
    return new InvestorsService();
  }

  static createDocumentsService() {
    return new DocumentsService();
  }

  static createTransactionsService() {
    return new TransactionsService();
  }

  static createFeesService() {
    return new FeesService();
  }
}

// Import singleton instances for services object
import { dealsService } from './deals.service';
import { investorsService } from './investors.service';
import { documentsService } from './documents.service';
import { transactionsService } from './transactions.service';
import { feesService } from './fees.service';

// Export default services object for easy access
export const services = {
  deals: dealsService,
  investors: investorsService,
  documents: documentsService,
  transactions: transactionsService,
  fees: feesService
} as const;

export default services;