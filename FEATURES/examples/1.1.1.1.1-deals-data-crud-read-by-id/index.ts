/**
 * Feature Module: 1.1.1.1.1 deals-data-crud-read-by-id
 * Export main functionality for the feature
 */

// Export DTO
export { DealDTO, type DealDTOType, transformToDealDTO, validateDealDTO } from './dto/deal';

// Export Repository
export { DealsRepository, dealsRepository } from './repo/deals.read';

// Export Route Handlers
export { handleGetDeal, handleGetDealWithMetrics } from './routes/deals.get';

// Feature metadata
export const FEATURE_METADATA = {
  id: '1.1.1.1.1',
  name: 'deals-data-crud-read-by-id',
  version: '1.0.0',
  description: 'Fetch a single deal by deal_id with strict tenant/RLS checks',
  endpoints: [
    {
      method: 'GET',
      path: '/api/deals/:dealId',
      description: 'Get a single deal by ID'
    }
  ],
  dependencies: [
    'deals.deal',
    'deals.identifier',
    'companies.company'
  ],
  performanceTargets: {
    p95: 150, // milliseconds
    p99: 300
  }
};