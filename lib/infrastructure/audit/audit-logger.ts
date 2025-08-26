/**
 * Audit Logging System
 * Tracks all data changes for compliance and security
 */

import { getServiceClient } from "@/lib/db/supabase/server-client";

export interface AuditLog {
  id?: string;
  timestamp: Date;
  user_id?: string;
  tenant_id?: string;
  action: AuditAction;
  entity_type: string;
  entity_id: string;
  changes?: Record<string, any>;
  metadata?: AuditMetadata;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
}

export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  ARCHIVE = 'ARCHIVE',
  RESTORE = 'RESTORE'
}

export interface AuditMetadata {
  correlation_id?: string;
  request_id?: string;
  api_version?: string;
  client_version?: string;
  [key: string]: any;
}

export interface AuditContext {
  user_id?: string;
  tenant_id?: string;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
}

export class AuditLogger {
  private static instance: AuditLogger;
  private context: AuditContext = {};
  private batchQueue: AuditLog[] = [];
  private batchSize = 100;
  private flushInterval = 5000; // 5 seconds
  private flushTimer?: NodeJS.Timeout;

  private constructor() {
    this.startBatchProcessor();
  }

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  /**
   * Set global audit context
   */
  setContext(context: Partial<AuditContext>): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Log an audit event
   */
  async log(
    action: AuditAction,
    entityType: string,
    entityId: string,
    changes?: Record<string, any>,
    metadata?: AuditMetadata
  ): Promise<void> {
    const auditLog: AuditLog = {
      timestamp: new Date(),
      action,
      entity_type: entityType,
      entity_id: entityId,
      changes,
      metadata,
      ...this.context
    };

    // Add to batch queue
    this.batchQueue.push(auditLog);

    // Flush if batch size reached
    if (this.batchQueue.length >= this.batchSize) {
      await this.flush();
    }
  }

  /**
   * Log a data change with before/after comparison
   */
  async logChange(
    entityType: string,
    entityId: string,
    before: Record<string, any>,
    after: Record<string, any>,
    metadata?: AuditMetadata
  ): Promise<void> {
    const changes = this.calculateChanges(before, after);
    
    if (Object.keys(changes).length > 0) {
      await this.log(
        AuditAction.UPDATE,
        entityType,
        entityId,
        changes,
        metadata
      );
    }
  }

  /**
   * Calculate changes between two objects
   */
  private calculateChanges(
    before: Record<string, any>,
    after: Record<string, any>
  ): Record<string, any> {
    const changes: Record<string, any> = {};

    // Find changed and new fields
    for (const key in after) {
      if (after[key] !== before[key]) {
        changes[key] = {
          before: before[key],
          after: after[key]
        };
      }
    }

    // Find deleted fields
    for (const key in before) {
      if (!(key in after)) {
        changes[key] = {
          before: before[key],
          after: undefined
        };
      }
    }

    return changes;
  }

  /**
   * Start batch processor
   */
  private startBatchProcessor(): void {
    this.flushTimer = setInterval(async () => {
      if (this.batchQueue.length > 0) {
        await this.flush();
      }
    }, this.flushInterval);
  }

  /**
   * Flush batch queue to database
   */
  private async flush(): Promise<void> {
    if (this.batchQueue.length === 0) return;

    const batch = [...this.batchQueue];
    this.batchQueue = [];

    try {
      const sb = getServiceClient();
      const { error } = await sb
        .from('audit_logs')
        .insert(batch.map(log => ({
          ...log,
          timestamp: log.timestamp.toISOString(),
          changes: log.changes ? JSON.stringify(log.changes) : null,
          metadata: log.metadata ? JSON.stringify(log.metadata) : null
        })));

      if (error) {
        console.error('Failed to write audit logs:', error);
        // Re-queue failed logs
        this.batchQueue.unshift(...batch);
      }
    } catch (error) {
      console.error('Audit log flush error:', error);
      // Re-queue failed logs
      this.batchQueue.unshift(...batch);
    }
  }

  /**
   * Query audit logs
   */
  async query(filters: {
    entity_type?: string;
    entity_id?: string;
    user_id?: string;
    action?: AuditAction;
    from_date?: Date;
    to_date?: Date;
    limit?: number;
  }): Promise<AuditLog[]> {
    try {
      const sb = getServiceClient();
      let query = sb.from('audit_logs').select('*');

      if (filters.entity_type) {
        query = query.eq('entity_type', filters.entity_type);
      }
      if (filters.entity_id) {
        query = query.eq('entity_id', filters.entity_id);
      }
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      if (filters.from_date) {
        query = query.gte('timestamp', filters.from_date.toISOString());
      }
      if (filters.to_date) {
        query = query.lte('timestamp', filters.to_date.toISOString());
      }

      query = query
        .order('timestamp', { ascending: false })
        .limit(filters.limit || 100);

      const { data, error } = await query;

      if (error) {
        console.error('Failed to query audit logs:', error);
        return [];
      }

      return (data || []).map(row => ({
        ...row,
        timestamp: new Date(row.timestamp),
        changes: row.changes ? JSON.parse(row.changes) : undefined,
        metadata: row.metadata ? JSON.parse(row.metadata) : undefined
      }));
    } catch (error) {
      console.error('Audit query error:', error);
      return [];
    }
  }

  /**
   * Shutdown audit logger
   */
  async shutdown(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    await this.flush();
  }
}

// Audit middleware for API routes
export function withAudit<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  entityType: string
) {
  return async (...args: T): Promise<R> => {
    const auditLogger = AuditLogger.getInstance();
    const startTime = Date.now();

    try {
      const result = await handler(...args);
      
      // Log successful operation
      await auditLogger.log(
        AuditAction.READ,
        entityType,
        'api-call',
        undefined,
        {
          duration: Date.now() - startTime,
          success: true
        }
      );

      return result;
    } catch (error) {
      // Log failed operation
      await auditLogger.log(
        AuditAction.READ,
        entityType,
        'api-call',
        undefined,
        {
          duration: Date.now() - startTime,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      );

      throw error;
    }
  };
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance();