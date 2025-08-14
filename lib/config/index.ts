/**
 * Central Configuration Module
 * Single source of truth for all application configuration
 * Re-exports enhanced SchemaConfig as the main AppConfig
 */

// Re-export the enhanced SchemaConfig as the main application config
export { SchemaConfig as AppConfig } from '@/lib/db/schema-manager/config';
export { SchemaConfig } from '@/lib/db/schema-manager/config';

// Create singleton instance for easy access
import { SchemaConfig } from '@/lib/db/schema-manager/config';

let _appConfig: SchemaConfig | null = null;

/**
 * Get the singleton application configuration instance
 */
export function getAppConfig(): SchemaConfig {
  if (!_appConfig) {
    _appConfig = new SchemaConfig();
  }
  return _appConfig;
}

/**
 * Quick access to common configuration checks
 */
export const config = {
  isDevelopment: () => getAppConfig().isDevelopment(),
  isProduction: () => getAppConfig().isProduction(),
  isUsingMockData: () => getAppConfig().isUsingMockData(),
  hasSupabase: () => getAppConfig().hasValidSupabaseCredentials(),
  getDataMode: () => getAppConfig().getDataSourceMode(),
  getDiagnostics: () => getAppConfig().getDiagnostics(),
  validateNode: () => getAppConfig().validateNodeVersion(),
  getProjectInfo: () => getAppConfig().getSupabaseProjectInfo()
};

// Export types for convenience
export type DataSourceMode = 'mock' | 'supabase' | 'mcp';

export interface ConfigDiagnostics {
  environment: {
    mode: string;
    nodeVersion: {
      ok: boolean;
      version: string;
      required: string;
    };
    dataSource: DataSourceMode;
  };
  supabase: {
    configured: boolean;
    valid: boolean;
    enabled: boolean;
    projectId: string | null;
    url: string | null;
  };
  features: {
    mockData: boolean;
    mcp: boolean;
    devTools: boolean;
    logging: boolean;
  };
}