import { BaseService } from './base.service';

export type BusinessDomain = 'Equitie' | 'Partnership' | 'FacilitatedDirect' | 'Advisory';
export type TransactionDomainType = 'Primary' | 'Secondary' | 'Advisory';

export class RouterService extends BaseService {
  routeDealToDomain(input: { deal_type?: string | null; deal_category?: string | null }): BusinessDomain {
    const t = (input.deal_type || '').toUpperCase();
    const c = (input.deal_category || '').toUpperCase();

    if (c === 'ADVISORY' || t === 'ADVISORY') return 'Advisory';
    if (t === 'PARTNERSHIP') return 'Partnership';
    if (t === 'FACILITATED_DIRECT') return 'FacilitatedDirect';
    return 'Equitie';
  }

  routeInputToStore(inputId: 'I1'|'I2'|'I3'|'I4'|'I5'|'I6'|'I7'): 'documents' | 'deals' | 'companies' {
    switch (inputId) {
      case 'I6':
        return 'deals';
      case 'I7':
        return 'companies';
      default:
        return 'documents';
    }
  }

  routeTxType(domain: BusinessDomain, opts?: { isSecondary?: boolean }): TransactionDomainType {
    if (domain === 'Advisory') return 'Advisory';
    if (opts?.isSecondary) return 'Secondary';
    return 'Primary';
  }
}

export const routerService = new RouterService();


