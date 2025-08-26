/**
 * Institutional Service Base Class
 * Enhanced service layer for enterprise-grade scalability
 * Provides multi-tenancy, event publishing, distributed tracing, and more
 */

import { BaseService, ServiceOptions } from './base.service';
import type { IDataClient } from '../db/client';

// Domain Event interface
export interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  tenantId?: string;
  userId?: string;
  timestamp: Date;
  payload: any;
  metadata?: EventMetadata;
}

export interface EventMetadata {
  correlationId?: string;
  causationId?: string;
  version?: number;
  source?: string;
  retryCount?: number;
}

// Audit Action interface
export interface AuditAction {
  action: string;
  entityType: string;
  entityId: string;
  userId?: string;
  tenantId?: string;
  before?: any;
  after?: any;
  metadata?: Record<string, any>;
  timestamp?: Date;
}

// Circuit Breaker States
export enum CircuitBreakerState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

// Circuit Breaker Configuration
export interface CircuitBreakerConfig {
  failureThreshold: number;  // Number of failures before opening
  successThreshold: number;  // Number of successes to close from half-open
  timeout: number;           // Time in ms before trying half-open
  resetTimeout: number;      // Time in ms to reset failure count
}

// Rate Limiter Configuration
export interface RateLimiterConfig {
  maxRequests: number;       // Max requests allowed
  windowMs: number;          // Time window in milliseconds
  keyGenerator?: (context: any) => string;  // Generate rate limit key
}

// Feature Flag Configuration
export interface FeatureFlag {
  key: string;
  enabled: boolean;
  rolloutPercentage?: number;
  variants?: Record<string, any>;
  metadata?: Record<string, any>;
}

// Institutional Service Options
export interface InstitutionalServiceOptions extends ServiceOptions {
  tenantId?: string;
  enableEventPublishing?: boolean;
  enableTracing?: boolean;
  enableCircuitBreaker?: boolean;
  enableRateLimiting?: boolean;
  enableAuditLogging?: boolean;
  enableFeatureFlags?: boolean;
  circuitBreakerConfig?: CircuitBreakerConfig;
  rateLimiterConfig?: RateLimiterConfig;
}

// Simple Circuit Breaker implementation
class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime?: Date;
  private config: CircuitBreakerConfig;

  constructor(config: CircuitBreakerConfig) {
    this.config = config;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      // Check if we should transition to half-open
      if (this.lastFailureTime && 
          Date.now() - this.lastFailureTime.getTime() > this.config.timeout) {
        this.state = CircuitBreakerState.HALF_OPEN;
        this.successCount = 0;
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.config.successThreshold) {
        this.state = CircuitBreakerState.CLOSED;
      }
    }
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = new Date();
    
    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitBreakerState.OPEN;
    }
  }

  getState(): CircuitBreakerState {
    return this.state;
  }
}

// Simple Rate Limiter implementation
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private config: RateLimiterConfig;

  constructor(config: RateLimiterConfig) {
    this.config = config;
  }

  async checkLimit(key: string): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    // Get existing requests for this key
    const keyRequests = this.requests.get(key) || [];
    
    // Filter out old requests
    const validRequests = keyRequests.filter(time => time > windowStart);
    
    // Check if limit exceeded
    if (validRequests.length >= this.config.maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    // Clean up old entries periodically
    if (Math.random() < 0.01) {
      this.cleanup();
    }
    
    return true;
  }

  private cleanup() {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(time => time > windowStart);
      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    }
  }
}

// Event Bus for publishing domain events
class EventBus {
  private static instance: EventBus;
  private handlers: Map<string, ((event: DomainEvent) => void)[]> = new Map();
  private eventQueue: DomainEvent[] = [];
  private processing = false;

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  async publish(event: DomainEvent): Promise<void> {
    // Add to queue
    this.eventQueue.push(event);
    
    // Process queue if not already processing
    if (!this.processing) {
      await this.processQueue();
    }
  }

  subscribe(eventType: string, handler: (event: DomainEvent) => void): void {
    const handlers = this.handlers.get(eventType) || [];
    handlers.push(handler);
    this.handlers.set(eventType, handlers);
  }

  private async processQueue(): Promise<void> {
    this.processing = true;
    
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (event) {
        await this.processEvent(event);
      }
    }
    
    this.processing = false;
  }

  private async processEvent(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];
    
    // Also get wildcard handlers
    const wildcardHandlers = this.handlers.get('*') || [];
    
    const allHandlers = [...handlers, ...wildcardHandlers];
    
    // Execute handlers in parallel
    await Promise.all(
      allHandlers.map(async handler => {
        try {
          await handler(event);
        } catch (error) {
          console.error(`Error processing event ${event.type}:`, error);
        }
      })
    );
  }
}

// Feature Flags Service
class FeatureFlagsService {
  private static instance: FeatureFlagsService;
  private flags: Map<string, FeatureFlag> = new Map();

  static getInstance(): FeatureFlagsService {
    if (!FeatureFlagsService.instance) {
      FeatureFlagsService.instance = new FeatureFlagsService();
    }
    return FeatureFlagsService.instance;
  }

  loadFlags(flags: FeatureFlag[]): void {
    flags.forEach(flag => {
      this.flags.set(flag.key, flag);
    });
  }

  isEnabled(key: string, context?: any): boolean {
    const flag = this.flags.get(key);
    
    if (!flag) {
      return false;
    }
    
    if (!flag.enabled) {
      return false;
    }
    
    // Check rollout percentage
    if (flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100) {
      // Simple hash-based rollout
      const hash = this.hashContext(context || key);
      const percentage = (hash % 100) + 1;
      return percentage <= flag.rolloutPercentage;
    }
    
    return true;
  }

  getVariant(key: string, context?: any): any {
    const flag = this.flags.get(key);
    
    if (!flag || !flag.variants) {
      return null;
    }
    
    // Simple variant selection based on hash
    const variantKeys = Object.keys(flag.variants);
    if (variantKeys.length === 0) {
      return null;
    }
    
    const hash = this.hashContext(context || key);
    const index = hash % variantKeys.length;
    const variantKey = variantKeys[index];
    
    return flag.variants[variantKey];
  }

  private hashContext(context: any): number {
    const str = JSON.stringify(context);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

// Main Institutional Service Class
export abstract class InstitutionalService extends BaseService {
  protected tenantId?: string;
  protected eventBus: EventBus;
  protected circuitBreaker?: CircuitBreaker;
  protected rateLimiter?: RateLimiter;
  protected featureFlags: FeatureFlagsService;
  protected institutionalOptions: InstitutionalServiceOptions;

  constructor(options: InstitutionalServiceOptions = {}) {
    super(options);
    
    this.institutionalOptions = {
      enableEventPublishing: true,
      enableTracing: true,
      enableCircuitBreaker: false,
      enableRateLimiting: false,
      enableAuditLogging: true,
      enableFeatureFlags: true,
      ...options
    };

    this.tenantId = options.tenantId;
    this.eventBus = EventBus.getInstance();
    this.featureFlags = FeatureFlagsService.getInstance();

    // Initialize circuit breaker if enabled
    if (this.institutionalOptions.enableCircuitBreaker) {
      this.circuitBreaker = new CircuitBreaker(
        options.circuitBreakerConfig || {
          failureThreshold: 5,
          successThreshold: 2,
          timeout: 60000,
          resetTimeout: 120000
        }
      );
    }

    // Initialize rate limiter if enabled
    if (this.institutionalOptions.enableRateLimiting) {
      this.rateLimiter = new RateLimiter(
        options.rateLimiterConfig || {
          maxRequests: 100,
          windowMs: 60000
        }
      );
    }
  }

  /**
   * Publish a domain event
   */
  protected async publishEvent(event: DomainEvent): Promise<void> {
    if (!this.institutionalOptions.enableEventPublishing) {
      return;
    }

    // Add tenant context
    if (this.tenantId && !event.tenantId) {
      event.tenantId = this.tenantId;
    }

    // Add metadata
    event.metadata = {
      ...event.metadata,
      source: this.constructor.name
    };

    await this.eventBus.publish(event);
    
    this.log('Event published', { type: event.type, id: event.id });
  }

  /**
   * Subscribe to domain events
   */
  protected subscribeToEvent(eventType: string, handler: (event: DomainEvent) => void): void {
    this.eventBus.subscribe(eventType, handler);
  }

  /**
   * Execute with circuit breaker protection
   */
  protected async executeWithCircuitBreaker<T>(
    fn: () => Promise<T>,
    fallback?: () => T
  ): Promise<T> {
    if (!this.circuitBreaker) {
      return fn();
    }

    try {
      return await this.circuitBreaker.execute(fn);
    } catch (error) {
      if (fallback && this.circuitBreaker.getState() === CircuitBreakerState.OPEN) {
        this.log('Circuit breaker open, using fallback');
        return fallback();
      }
      throw error;
    }
  }

  /**
   * Check rate limit
   */
  protected async checkRateLimit(key?: string): Promise<boolean> {
    if (!this.rateLimiter) {
      return true;
    }

    const limitKey = key || `${this.tenantId || 'global'}:${this.constructor.name}`;
    const allowed = await this.rateLimiter.checkLimit(limitKey);
    
    if (!allowed) {
      this.log('Rate limit exceeded', { key: limitKey });
    }
    
    return allowed;
  }

  /**
   * Audit log an action
   */
  protected async auditLog(action: AuditAction): Promise<void> {
    if (!this.institutionalOptions.enableAuditLogging) {
      return;
    }

    // Add tenant context
    if (this.tenantId && !action.tenantId) {
      action.tenantId = this.tenantId;
    }

    // Add timestamp
    action.timestamp = action.timestamp || new Date();

    // In production, send to audit service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to audit logging service
      console.log('AUDIT:', action);
    } else {
      this.log('Audit log', action);
    }

    // Publish audit event
    await this.publishEvent({
      id: crypto.randomUUID(),
      type: 'audit.logged',
      aggregateId: action.entityId,
      tenantId: action.tenantId,
      userId: action.userId,
      timestamp: action.timestamp,
      payload: action
    });
  }

  /**
   * Check if a feature flag is enabled
   */
  protected isFeatureEnabled(key: string, context?: any): boolean {
    if (!this.institutionalOptions.enableFeatureFlags) {
      return true;
    }

    return this.featureFlags.isEnabled(key, context || { tenantId: this.tenantId });
  }

  /**
   * Get feature flag variant
   */
  protected getFeatureVariant(key: string, context?: any): any {
    if (!this.institutionalOptions.enableFeatureFlags) {
      return null;
    }

    return this.featureFlags.getVariant(key, context || { tenantId: this.tenantId });
  }

  /**
   * Start a distributed trace
   */
  protected startTrace(operation: string): TraceContext {
    const traceId = crypto.randomUUID();
    const spanId = crypto.randomUUID();
    
    return {
      traceId,
      spanId,
      operation,
      startTime: Date.now(),
      tags: {
        service: this.constructor.name,
        tenantId: this.tenantId
      },
      finish: () => {
        const duration = Date.now() - Date.now();
        this.log('Trace completed', { traceId, operation, duration });
      }
    };
  }

  /**
   * Execute with retry logic
   */
  protected async executeWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (i < maxRetries - 1) {
          const delay = delayMs * Math.pow(2, i); // Exponential backoff
          this.log(`Retry attempt ${i + 1} after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Validate tenant access
   */
  protected validateTenantAccess(resourceTenantId?: string): void {
    if (!this.tenantId) {
      return; // No tenant context, allow access
    }

    if (resourceTenantId && resourceTenantId !== this.tenantId) {
      throw new Error(`Access denied: Resource belongs to different tenant`);
    }
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<ServiceHealth> {
    const health: ServiceHealth = {
      service: this.constructor.name,
      status: 'healthy',
      timestamp: new Date(),
      checks: {}
    };

    // Check circuit breaker
    if (this.circuitBreaker) {
      health.checks.circuitBreaker = {
        state: this.circuitBreaker.getState(),
        healthy: this.circuitBreaker.getState() !== CircuitBreakerState.OPEN
      };
    }

    // Check cache
    health.checks.cache = {
      size: (this as any).cache?.size ?? 0,
      healthy: true
    };

    // Check data connection
    try {
      await (this.dataClient as any).health?.check?.();
      health.checks.database = {
        connected: true,
        healthy: true
      };
    } catch (e: unknown) {
      health.checks.database = {
        connected: false,
        healthy: false,
        error: e instanceof Error ? e.message : String(e)
      };
      health.status = 'degraded';
    }

    return health;
  }
}

// Supporting interfaces
export interface TraceContext {
  traceId: string;
  spanId: string;
  operation: string;
  startTime: number;
  tags: Record<string, any>;
  finish: () => void;
}

export interface ServiceHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  checks: Record<string, any>;
}

// Export singletons
export const eventBus = EventBus.getInstance();
export const featureFlags = FeatureFlagsService.getInstance();