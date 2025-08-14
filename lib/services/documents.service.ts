/**
 * Documents Service
 * Handles all document-related operations
 */

import { BaseService } from './base.service';
import type { Document, DocumentType } from '../db/types';

export interface DocumentListOptions {
  deal_id?: number;
  investor_id?: number;
  type?: DocumentType;
  is_signed?: boolean;
  limit?: number;
  offset?: number;
}

export class DocumentsService extends BaseService {
  /**
   * Get documents with filters
   */
  async getDocuments(options: DocumentListOptions = {}) {
    const cacheKey = `documents:${JSON.stringify(options)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      this.log('getDocuments', options);
      await this.delay();

      const documents = await this.dataClient.getDocuments(options);

      const result = this.formatResponse(documents, {
        count: documents.length
      });

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      this.handleError(error, 'getDocuments');
    }
  }

  /**
   * Get documents for a specific deal
   */
  async getDealDocuments(dealId: number, options: Omit<DocumentListOptions, 'deal_id'> = {}) {
    return this.getDocuments({ ...options, deal_id: dealId });
  }

  /**
   * Get documents for a specific investor
   */
  async getInvestorDocuments(investorId: number, options: Omit<DocumentListOptions, 'investor_id'> = {}) {
    return this.getDocuments({ ...options, investor_id: investorId });
  }

  /**
   * Get signed documents
   */
  async getSignedDocuments(options: Omit<DocumentListOptions, 'is_signed'> = {}) {
    return this.getDocuments({ ...options, is_signed: true });
  }

  /**
   * Get unsigned documents
   */
  async getUnsignedDocuments(options: Omit<DocumentListOptions, 'is_signed'> = {}) {
    return this.getDocuments({ ...options, is_signed: false });
  }
}

// Export singleton instance
export const documentsService = new DocumentsService();