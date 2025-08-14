/**
 * Feature Loader System
 * Enables modular feature development and integration
 */

import { schemaManager } from '@/lib/db/schema-manager';

export interface FeatureConfig {
  id: string;
  name: string;
  description: string;
  path: string;
  enabled: boolean;
  dependencies?: string[];
  routes?: FeatureRoute[];
}

export interface FeatureRoute {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  handler: string; // Path to handler function
}

export class FeatureLoader {
  private features: Map<string, FeatureConfig> = new Map();
  private isInitialized: boolean = false;

  /**
   * Initialize the feature loader
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    // Register available features
    this.registerFeature({
      id: '1.1.1.1.1',
      name: 'deals-data-crud-read-by-id',
      description: 'Fetch a single deal by deal_id with strict tenant/RLS checks',
      path: '/FEATURES/examples/1.1.1.1.1-deals-data-crud-read-by-id',
      enabled: this.isFeatureEnabled('deals-read'),
      routes: [
        {
          method: 'GET',
          path: '/api/deals/:dealId',
          handler: 'routes/deals.get.ts'
        }
      ]
    });
    
    // Add more features as they're developed
    // this.registerFeature({ ... });
    
    this.isInitialized = true;
    
    console.log(`🚀 Feature Loader initialized with ${this.features.size} features`);
  }
  
  /**
   * Register a feature
   */
  private registerFeature(config: FeatureConfig): void {
    this.features.set(config.id, config);
  }
  
  /**
   * Check if a feature is enabled
   */
  private isFeatureEnabled(featureName: string): boolean {
    // Check environment variable
    const enableFeatures = process.env.NEXT_PUBLIC_ENABLE_FEATURES === 'true';
    if (!enableFeatures) return false;
    
    // Check specific feature flag
    const featureFlag = process.env[`NEXT_PUBLIC_FEATURE_${featureName.toUpperCase()}`];
    if (featureFlag === 'false') return false;
    
    return true;
  }
  
  /**
   * Get all enabled features
   */
  getEnabledFeatures(): FeatureConfig[] {
    return Array.from(this.features.values()).filter(f => f.enabled);
  }
  
  /**
   * Get a specific feature
   */
  getFeature(id: string): FeatureConfig | undefined {
    return this.features.get(id);
  }
  
  /**
   * Load a feature module dynamically
   */
  async loadFeature(id: string): Promise<any> {
    const feature = this.getFeature(id);
    if (!feature) {
      throw new Error(`Feature ${id} not found`);
    }
    
    if (!feature.enabled) {
      throw new Error(`Feature ${id} is not enabled`);
    }
    
    // Dynamic import would go here
    // For now, features are imported directly in route files
    return feature;
  }
  
  /**
   * Get feature status for debugging
   */
  getFeatureStatus(): Record<string, any> {
    const mode = schemaManager.getMode();
    
    return {
      dataMode: mode,
      featuresEnabled: process.env.NEXT_PUBLIC_ENABLE_FEATURES === 'true',
      registeredFeatures: this.features.size,
      enabledFeatures: this.getEnabledFeatures().length,
      features: Array.from(this.features.values()).map(f => ({
        id: f.id,
        name: f.name,
        enabled: f.enabled,
        routes: f.routes?.length || 0
      }))
    };
  }
}

// Export singleton instance
export const featureLoader = new FeatureLoader();

/**
 * Feature development helpers
 */
export class FeatureDevTools {
  /**
   * Generate feature scaffold
   */
  static getFeatureTemplate(featureId: string, featureName: string): string {
    return `
# Feature: ${featureId} - ${featureName}

## Quick Start
1. Copy this template to FEATURES/examples/${featureId}-${featureName}/
2. Implement the DTO, repository, and route handler
3. Add tests in tests/ directory
4. Register in feature loader

## Files to Create:
- dto/${featureName}.ts - Data transfer object with Zod validation
- repo/${featureName}.repo.ts - Repository for data access
- routes/${featureName}.route.ts - Route handler
- tests/unit.spec.ts - Unit tests
- tests/e2e.spec.ts - End-to-end tests

## Integration:
1. Add route in app/api/
2. Register in lib/features/loader.ts
3. Test with npm run dev
`;
  }
  
  /**
   * Validate feature structure
   */
  static async validateFeature(featurePath: string): Promise<boolean> {
    // Check required files exist
    const requiredFiles = [
      'FEATURE.md',
      'dto/',
      'repo/',
      'routes/',
      'tests/unit.spec.ts',
      'tests/e2e.spec.ts'
    ];
    
    // Implementation would check file existence
    return true;
  }
}

/**
 * Initialize on module load
 */
if (typeof window === 'undefined') {
  // Server-side initialization
  featureLoader.initialize().catch(console.error);
}