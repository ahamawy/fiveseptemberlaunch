/**
 * Feature Flags Management System
 * Provides dynamic feature toggling, A/B testing, and gradual rollouts
 */

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  type: 'boolean' | 'percentage' | 'variant' | 'user_list';
  rolloutPercentage?: number;
  variants?: FeatureVariant[];
  userList?: string[];
  conditions?: FeatureCondition[];
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface FeatureVariant {
  key: string;
  name: string;
  weight: number; // Percentage weight for this variant
  config?: any;
}

export interface FeatureCondition {
  type: 'user_attribute' | 'environment' | 'date_range' | 'custom';
  attribute?: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

export interface FeatureFlagContext {
  userId?: string;
  tenantId?: string;
  environment?: string;
  attributes?: Record<string, any>;
  timestamp?: Date;
}

// Feature Flags Store
class FeatureFlagStore {
  private flags: Map<string, FeatureFlag> = new Map();
  private overrides: Map<string, boolean> = new Map();

  loadFlags(flags: FeatureFlag[]): void {
    flags.forEach(flag => {
      this.flags.set(flag.key, flag);
    });
  }

  getFlag(key: string): FeatureFlag | undefined {
    return this.flags.get(key);
  }

  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  updateFlag(key: string, updates: Partial<FeatureFlag>): void {
    const flag = this.flags.get(key);
    if (flag) {
      this.flags.set(key, {
        ...flag,
        ...updates,
        updatedAt: new Date()
      });
    }
  }

  setOverride(key: string, enabled: boolean): void {
    this.overrides.set(key, enabled);
  }

  getOverride(key: string): boolean | undefined {
    return this.overrides.get(key);
  }

  clearOverrides(): void {
    this.overrides.clear();
  }
}

// Feature Flag Evaluator
export class FeatureFlagEvaluator {
  private store: FeatureFlagStore;

  constructor(store: FeatureFlagStore) {
    this.store = store;
  }

  isEnabled(key: string, context?: FeatureFlagContext): boolean {
    // Check for override first
    const override = this.store.getOverride(key);
    if (override !== undefined) {
      return override;
    }

    const flag = this.store.getFlag(key);
    if (!flag) {
      return false;
    }

    if (!flag.enabled) {
      return false;
    }

    // Evaluate based on flag type
    switch (flag.type) {
      case 'boolean':
        return true;
      
      case 'percentage':
        return this.evaluatePercentage(flag, context);
      
      case 'variant':
        return true; // Variants are always "enabled", use getVariant to get specific variant
      
      case 'user_list':
        return this.evaluateUserList(flag, context);
      
      default:
        return false;
    }
  }

  getVariant(key: string, context?: FeatureFlagContext): string | null {
    const flag = this.store.getFlag(key);
    if (!flag || !flag.enabled || flag.type !== 'variant') {
      return null;
    }

    if (!flag.variants || flag.variants.length === 0) {
      return null;
    }

    // Calculate which variant based on user hash
    const hash = this.hashContext(context || { key });
    let accumulator = 0;

    for (const variant of flag.variants) {
      accumulator += variant.weight;
      if ((hash % 100) < accumulator) {
        return variant.key;
      }
    }

    return flag.variants[0].key; // Fallback to first variant
  }

  private evaluatePercentage(flag: FeatureFlag, context?: FeatureFlagContext): boolean {
    if (flag.rolloutPercentage === undefined) {
      return true;
    }

    if (flag.rolloutPercentage >= 100) {
      return true;
    }

    if (flag.rolloutPercentage <= 0) {
      return false;
    }

    // Check conditions first
    if (flag.conditions && !this.evaluateConditions(flag.conditions, context)) {
      return false;
    }

    // Use consistent hashing for gradual rollout
    const hash = this.hashContext(context || { key: flag.key });
    return (hash % 100) < flag.rolloutPercentage;
  }

  private evaluateUserList(flag: FeatureFlag, context?: FeatureFlagContext): boolean {
    if (!flag.userList || flag.userList.length === 0) {
      return false;
    }

    if (!context?.userId) {
      return false;
    }

    return flag.userList.includes(context.userId);
  }

  private evaluateConditions(conditions: FeatureCondition[], context?: FeatureFlagContext): boolean {
    if (!context) {
      return false;
    }

    return conditions.every(condition => this.evaluateCondition(condition, context));
  }

  private evaluateCondition(condition: FeatureCondition, context: FeatureFlagContext): boolean {
    let value: any;

    switch (condition.type) {
      case 'user_attribute':
        value = context.attributes?.[condition.attribute || ''];
        break;
      case 'environment':
        value = context.environment;
        break;
      case 'date_range':
        value = context.timestamp || new Date();
        break;
      default:
        return false;
    }

    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'contains':
        return String(value).includes(String(condition.value));
      case 'greater_than':
        return value > condition.value;
      case 'less_than':
        return value < condition.value;
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(value);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(value);
      default:
        return false;
    }
  }

  private hashContext(context: any): number {
    const str = JSON.stringify(context);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}

// Feature Flag Service (Main API)
export class FeatureFlagService {
  private static instance: FeatureFlagService;
  private store: FeatureFlagStore;
  private evaluator: FeatureFlagEvaluator;
  private defaultContext?: FeatureFlagContext;

  private constructor() {
    this.store = new FeatureFlagStore();
    this.evaluator = new FeatureFlagEvaluator(this.store);
    this.loadDefaultFlags();
  }

  static getInstance(): FeatureFlagService {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService();
    }
    return FeatureFlagService.instance;
  }

  setDefaultContext(context: FeatureFlagContext): void {
    this.defaultContext = context;
  }

  loadFlags(flags: FeatureFlag[]): void {
    this.store.loadFlags(flags);
  }

  isEnabled(key: string, context?: FeatureFlagContext): boolean {
    const mergedContext = { ...this.defaultContext, ...context };
    return this.evaluator.isEnabled(key, mergedContext);
  }

  getVariant(key: string, context?: FeatureFlagContext): string | null {
    const mergedContext = { ...this.defaultContext, ...context };
    return this.evaluator.getVariant(key, mergedContext);
  }

  getAllFlags(): FeatureFlag[] {
    return this.store.getAllFlags();
  }

  getEnabledFlags(context?: FeatureFlagContext): string[] {
    const mergedContext = { ...this.defaultContext, ...context };
    return this.store.getAllFlags()
      .filter(flag => this.evaluator.isEnabled(flag.key, mergedContext))
      .map(flag => flag.key);
  }

  updateFlag(key: string, updates: Partial<FeatureFlag>): void {
    this.store.updateFlag(key, updates);
  }

  setOverride(key: string, enabled: boolean): void {
    this.store.setOverride(key, enabled);
  }

  clearOverrides(): void {
    this.store.clearOverrides();
  }

  private loadDefaultFlags(): void {
    const defaultFlags: FeatureFlag[] = [
      {
        key: 'new_dashboard',
        name: 'New Dashboard',
        description: 'Enable the new investor dashboard design',
        enabled: true,
        type: 'percentage',
        rolloutPercentage: 100,
        tags: ['frontend', 'investor-portal'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'enhanced_analytics',
        name: 'Enhanced Analytics',
        description: 'Show enhanced analytics features',
        enabled: true,
        type: 'user_list',
        userList: ['admin', 'premium_users'],
        tags: ['analytics', 'premium'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'ab_test_homepage',
        name: 'Homepage A/B Test',
        description: 'A/B test for homepage variants',
        enabled: true,
        type: 'variant',
        variants: [
          { key: 'control', name: 'Original Homepage', weight: 50 },
          { key: 'variant_a', name: 'New Layout', weight: 30 },
          { key: 'variant_b', name: 'Minimal Design', weight: 20 }
        ],
        tags: ['ab-test', 'homepage'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'enable_caching',
        name: 'Enable Caching',
        description: 'Enable Redis caching for improved performance',
        enabled: true,
        type: 'boolean',
        tags: ['performance', 'backend'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'dark_mode',
        name: 'Dark Mode',
        description: 'Enable dark mode theme',
        enabled: true,
        type: 'boolean',
        tags: ['ui', 'theme'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'beta_features',
        name: 'Beta Features',
        description: 'Enable beta features for testing',
        enabled: true,
        type: 'percentage',
        rolloutPercentage: 10,
        conditions: [
          {
            type: 'environment',
            operator: 'in',
            value: ['development', 'staging']
          }
        ],
        tags: ['beta', 'testing'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'maintenance_mode',
        name: 'Maintenance Mode',
        description: 'Put the application in maintenance mode',
        enabled: false,
        type: 'boolean',
        tags: ['system', 'maintenance'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'rate_limiting',
        name: 'Rate Limiting',
        description: 'Enable API rate limiting',
        enabled: true,
        type: 'boolean',
        metadata: {
          maxRequests: 100,
          windowMs: 60000
        },
        tags: ['api', 'security'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'audit_logging',
        name: 'Audit Logging',
        description: 'Enable comprehensive audit logging',
        enabled: true,
        type: 'boolean',
        tags: ['security', 'compliance'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'websocket_support',
        name: 'WebSocket Support',
        description: 'Enable real-time WebSocket connections',
        enabled: false,
        type: 'percentage',
        rolloutPercentage: 0,
        tags: ['realtime', 'experimental'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.store.loadFlags(defaultFlags);
  }
}

// React Hook for Feature Flags (if using React)
export function useFeatureFlag(key: string, context?: FeatureFlagContext): boolean {
  const service = FeatureFlagService.getInstance();
  return service.isEnabled(key, context);
}

export function useFeatureVariant(key: string, context?: FeatureFlagContext): string | null {
  const service = FeatureFlagService.getInstance();
  return service.getVariant(key, context);
}

// Export singleton
export const featureFlagService = FeatureFlagService.getInstance();

// Helper to check multiple flags at once
export function checkFlags(
  flags: string[],
  context?: FeatureFlagContext
): Record<string, boolean> {
  const service = FeatureFlagService.getInstance();
  const result: Record<string, boolean> = {};
  
  flags.forEach(flag => {
    result[flag] = service.isEnabled(flag, context);
  });
  
  return result;
}

// Feature flag configuration loader (from API or file)
export async function loadFeatureFlagsFromAPI(apiUrl: string): Promise<void> {
  try {
    const response = await fetch(apiUrl);
    const flags = await response.json();
    
    const service = FeatureFlagService.getInstance();
    service.loadFlags(flags);
  } catch (error) {
    console.error('Failed to load feature flags from API:', error);
  }
}

// Feature flag configuration for specific features
export const FEATURE_FLAGS = {
  // Dashboard features
  NEW_DASHBOARD: 'new_dashboard',
  ENHANCED_ANALYTICS: 'enhanced_analytics',
  REAL_TIME_UPDATES: 'real_time_updates',
  
  // API features
  RATE_LIMITING: 'rate_limiting',
  CACHING: 'enable_caching',
  AUDIT_LOGGING: 'audit_logging',
  
  // UI features
  DARK_MODE: 'dark_mode',
  BETA_FEATURES: 'beta_features',
  
  // System features
  MAINTENANCE_MODE: 'maintenance_mode',
  WEBSOCKET_SUPPORT: 'websocket_support',
  
  // A/B Tests
  AB_TEST_HOMEPAGE: 'ab_test_homepage',
  AB_TEST_ONBOARDING: 'ab_test_onboarding'
} as const;