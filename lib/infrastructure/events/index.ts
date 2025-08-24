/**
 * Event Infrastructure
 * Provides event sourcing, CQRS, and event-driven architecture
 */

import { DomainEvent, EventMetadata } from '@/lib/services/institutional.service';

// Event Store for persistence
export interface EventStoreEntry {
  id: string;
  streamId: string;
  eventType: string;
  eventData: any;
  metadata: EventMetadata;
  timestamp: Date;
  version: number;
}

// Event Handler interface
export interface IEventHandler<T extends DomainEvent = DomainEvent> {
  eventType: string;
  handle(event: T): Promise<void>;
}

// Command interface for CQRS
export interface Command {
  id: string;
  type: string;
  aggregateId?: string;
  payload: any;
  metadata?: CommandMetadata;
}

export interface CommandMetadata {
  userId?: string;
  tenantId?: string;
  correlationId?: string;
  timestamp?: Date;
}

// Query interface for CQRS
export interface Query {
  id: string;
  type: string;
  parameters: any;
  metadata?: QueryMetadata;
}

export interface QueryMetadata {
  userId?: string;
  tenantId?: string;
  correlationId?: string;
  timestamp?: Date;
}

// Saga interface for long-running processes
export interface Saga {
  id: string;
  name: string;
  state: 'pending' | 'running' | 'completed' | 'failed' | 'compensating';
  steps: SagaStep[];
  currentStep: number;
  context: any;
  startedAt: Date;
  completedAt?: Date;
}

export interface SagaStep {
  name: string;
  handler: (context: any) => Promise<any>;
  compensator?: (context: any) => Promise<void>;
  retryPolicy?: RetryPolicy;
}

export interface RetryPolicy {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier?: number;
}

// Event Store Implementation
export class EventStore {
  private events: Map<string, EventStoreEntry[]> = new Map();
  private globalEvents: EventStoreEntry[] = [];
  private subscribers: Map<string, ((event: EventStoreEntry) => void)[]> = new Map();

  async append(streamId: string, event: DomainEvent): Promise<void> {
    const stream = this.events.get(streamId) || [];
    const version = stream.length + 1;

    const entry: EventStoreEntry = {
      id: event.id,
      streamId,
      eventType: event.type,
      eventData: event.payload,
      metadata: event.metadata || {},
      timestamp: event.timestamp,
      version
    };

    stream.push(entry);
    this.events.set(streamId, stream);
    this.globalEvents.push(entry);

    // Notify subscribers
    await this.notifySubscribers(streamId, entry);
  }

  async getStream(streamId: string, fromVersion?: number): Promise<EventStoreEntry[]> {
    const stream = this.events.get(streamId) || [];
    
    if (fromVersion) {
      return stream.filter(e => e.version >= fromVersion);
    }
    
    return stream;
  }

  async getGlobalEvents(from?: Date, to?: Date): Promise<EventStoreEntry[]> {
    let events = [...this.globalEvents];
    
    if (from) {
      events = events.filter(e => e.timestamp >= from);
    }
    
    if (to) {
      events = events.filter(e => e.timestamp <= to);
    }
    
    return events;
  }

  subscribe(streamId: string, handler: (event: EventStoreEntry) => void): void {
    const handlers = this.subscribers.get(streamId) || [];
    handlers.push(handler);
    this.subscribers.set(streamId, handlers);
  }

  private async notifySubscribers(streamId: string, event: EventStoreEntry): Promise<void> {
    const handlers = this.subscribers.get(streamId) || [];
    const globalHandlers = this.subscribers.get('*') || [];
    
    const allHandlers = [...handlers, ...globalHandlers];
    
    await Promise.all(
      allHandlers.map(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error('Error in event subscriber:', error);
        }
      })
    );
  }
}

// Command Bus for CQRS
export class CommandBus {
  private handlers: Map<string, (command: Command) => Promise<any>> = new Map();

  register(commandType: string, handler: (command: Command) => Promise<any>): void {
    this.handlers.set(commandType, handler);
  }

  async execute<T = any>(command: Command): Promise<T> {
    const handler = this.handlers.get(command.type);
    
    if (!handler) {
      throw new Error(`No handler registered for command: ${command.type}`);
    }
    
    // Add metadata
    command.metadata = {
      ...command.metadata,
      timestamp: new Date()
    };
    
    return handler(command);
  }
}

// Query Bus for CQRS
export class QueryBus {
  private handlers: Map<string, (query: Query) => Promise<any>> = new Map();

  register(queryType: string, handler: (query: Query) => Promise<any>): void {
    this.handlers.set(queryType, handler);
  }

  async execute<T = any>(query: Query): Promise<T> {
    const handler = this.handlers.get(query.type);
    
    if (!handler) {
      throw new Error(`No handler registered for query: ${query.type}`);
    }
    
    // Add metadata
    query.metadata = {
      ...query.metadata,
      timestamp: new Date()
    };
    
    return handler(query);
  }
}

// Saga Orchestrator for long-running processes
export class SagaOrchestrator {
  private sagas: Map<string, Saga> = new Map();

  async startSaga(name: string, steps: SagaStep[], context: any = {}): Promise<string> {
    const sagaId = crypto.randomUUID();
    
    const saga: Saga = {
      id: sagaId,
      name,
      state: 'pending',
      steps,
      currentStep: 0,
      context,
      startedAt: new Date()
    };
    
    this.sagas.set(sagaId, saga);
    
    // Start execution
    this.executeSaga(sagaId);
    
    return sagaId;
  }

  private async executeSaga(sagaId: string): Promise<void> {
    const saga = this.sagas.get(sagaId);
    if (!saga) return;
    
    saga.state = 'running';
    
    try {
      while (saga.currentStep < saga.steps.length) {
        const step = saga.steps[saga.currentStep];
        
        try {
          // Execute step with retry policy
          const result = await this.executeWithRetry(
            () => step.handler(saga.context),
            step.retryPolicy
          );
          
          // Update context with result
          saga.context = { ...saga.context, [`step${saga.currentStep}Result`]: result };
          
          saga.currentStep++;
        } catch (error) {
          // Step failed, start compensation
          await this.compensateSaga(saga);
          throw error;
        }
      }
      
      // All steps completed
      saga.state = 'completed';
      saga.completedAt = new Date();
    } catch (error) {
      saga.state = 'failed';
      console.error(`Saga ${sagaId} failed:`, error);
    }
    
    this.sagas.set(sagaId, saga);
  }

  private async compensateSaga(saga: Saga): Promise<void> {
    saga.state = 'compensating';
    
    // Compensate in reverse order
    for (let i = saga.currentStep - 1; i >= 0; i--) {
      const step = saga.steps[i];
      
      if (step.compensator) {
        try {
          await step.compensator(saga.context);
        } catch (error) {
          console.error(`Compensation failed for step ${i}:`, error);
        }
      }
    }
  }

  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    policy?: RetryPolicy
  ): Promise<T> {
    const maxAttempts = policy?.maxAttempts || 1;
    const delayMs = policy?.delayMs || 1000;
    const backoff = policy?.backoffMultiplier || 2;
    
    let lastError: any;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt < maxAttempts - 1) {
          const delay = delayMs * Math.pow(backoff, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }

  getSaga(sagaId: string): Saga | undefined {
    return this.sagas.get(sagaId);
  }
}

// Event Projector for read models
export class EventProjector {
  private projections: Map<string, any> = new Map();
  private projectors: Map<string, (event: EventStoreEntry, state: any) => any> = new Map();

  register(eventType: string, projector: (event: EventStoreEntry, state: any) => any): void {
    this.projectors.set(eventType, projector);
  }

  async project(event: EventStoreEntry, projectionId: string): Promise<void> {
    const projector = this.projectors.get(event.eventType);
    if (!projector) return;
    
    const currentState = this.projections.get(projectionId) || {};
    const newState = projector(event, currentState);
    
    this.projections.set(projectionId, newState);
  }

  getProjection(projectionId: string): any {
    return this.projections.get(projectionId);
  }

  async rebuild(events: EventStoreEntry[], projectionId: string): Promise<void> {
    // Clear current projection
    this.projections.delete(projectionId);
    
    // Replay events
    for (const event of events) {
      await this.project(event, projectionId);
    }
  }
}

// Message Queue for async processing
export class MessageQueue {
  private queues: Map<string, any[]> = new Map();
  private handlers: Map<string, (message: any) => Promise<void>> = new Map();
  private processing: Map<string, boolean> = new Map();

  async publish(queueName: string, message: any): Promise<void> {
    const queue = this.queues.get(queueName) || [];
    queue.push(message);
    this.queues.set(queueName, queue);
    
    // Start processing if not already
    if (!this.processing.get(queueName)) {
      this.processQueue(queueName);
    }
  }

  subscribe(queueName: string, handler: (message: any) => Promise<void>): void {
    this.handlers.set(queueName, handler);
  }

  private async processQueue(queueName: string): Promise<void> {
    this.processing.set(queueName, true);
    
    const queue = this.queues.get(queueName) || [];
    const handler = this.handlers.get(queueName);
    
    if (!handler) {
      this.processing.set(queueName, false);
      return;
    }
    
    while (queue.length > 0) {
      const message = queue.shift();
      
      try {
        await handler(message);
      } catch (error) {
        console.error(`Error processing message in queue ${queueName}:`, error);
        // Could implement dead letter queue here
      }
    }
    
    this.processing.set(queueName, false);
  }
}

// Export singleton instances
export const eventStore = new EventStore();
export const commandBus = new CommandBus();
export const queryBus = new QueryBus();
export const sagaOrchestrator = new SagaOrchestrator();
export const eventProjector = new EventProjector();
export const messageQueue = new MessageQueue();

// Common event types
export enum SystemEventType {
  // System events
  SYSTEM_STARTED = 'system.started',
  SYSTEM_STOPPED = 'system.stopped',
  HEALTH_CHECK = 'system.health_check',
  
  // User events
  USER_LOGGED_IN = 'user.logged_in',
  USER_LOGGED_OUT = 'user.logged_out',
  USER_REGISTERED = 'user.registered',
  
  // Data events
  ENTITY_CREATED = 'entity.created',
  ENTITY_UPDATED = 'entity.updated',
  ENTITY_DELETED = 'entity.deleted',
  
  // Business events
  TRANSACTION_CREATED = 'transaction.created',
  PAYMENT_PROCESSED = 'payment.processed',
  REPORT_GENERATED = 'report.generated'
}

// Helper to create domain events
export class EventFactory {
  static create(
    type: string,
    aggregateId: string,
    payload: any,
    metadata?: Partial<EventMetadata>
  ): DomainEvent {
    return {
      id: crypto.randomUUID(),
      type,
      aggregateId,
      timestamp: new Date(),
      payload,
      metadata: {
        version: 1,
        ...metadata
      }
    };
  }
}