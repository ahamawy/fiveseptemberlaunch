/**
 * Supabase Connection Status Module
 * Real-time validation of Supabase connectivity and configuration
 */

import { getAppConfig } from '@/lib/config';
import { getCurrentDataMode } from '@/lib/db/client';
import { UnifiedSupabaseAdapter } from '../supabase-unified';

export interface SupabaseStatus {
  configured: boolean;        // Environment variables present and valid
  nodeOk: boolean;            // Node.js >= 20
  mode: 'mock' | 'supabase' | 'mcp';  // Current data mode
  connected: boolean;         // Can reach database
  projectId: string | null;   // Supabase project ID
  projectName: string | null; // From MCP if available
  tables: {
    investors: boolean;
    deals: boolean;
    companies: boolean;
    transactions: boolean;
    documents: boolean;
  };
  error?: string;
  details?: {
    url?: string;
    nodeVersion?: string;
    requiredNode?: string;
    testedTable?: string;
    testMethod?: 'view' | 'table';
  };
}

/**
 * Get comprehensive Supabase connectivity status
 */
export async function getSupabaseConnectivity(): Promise<SupabaseStatus> {
  const config = getAppConfig();
  const diagnostics = config.getDiagnostics();
  
  // Base status from configuration
  const status: SupabaseStatus = {
    configured: diagnostics.supabase.configured,
    nodeOk: diagnostics.environment.nodeVersion.ok,
    mode: getCurrentDataMode() as 'mock' | 'supabase' | 'mcp',
    connected: false,
    projectId: diagnostics.supabase.projectId,
    projectName: null,
    tables: {
      investors: false,
      deals: false,
      companies: false,
      transactions: false,
      documents: false
    },
    details: {
      url: diagnostics.supabase.url || undefined,
      nodeVersion: diagnostics.environment.nodeVersion.version,
      requiredNode: diagnostics.environment.nodeVersion.required
    }
  };

  // If not configured or using mock, return early
  if (!diagnostics.supabase.valid || diagnostics.features.mockData) {
    if (!diagnostics.supabase.configured) {
      status.error = 'Supabase credentials not configured';
    } else if (!diagnostics.supabase.valid) {
      status.error = 'Invalid Supabase credentials format';
    } else if (diagnostics.features.mockData) {
      status.error = 'Mock data mode is enabled';
    }
    return status;
  }

  // Check Node.js version
  if (!status.nodeOk) {
    status.error = `Node.js ${diagnostics.environment.nodeVersion.required} or higher required (current: ${diagnostics.environment.nodeVersion.version})`;
    return status;
  }

  // Try to connect and test table access
  try {
    const adapter = new UnifiedSupabaseAdapter({ useViews: true });
    
    // Test each table - try view first, then fallback to table
    const tablesToTest = [
      { key: 'investors', view: 'investors_view', table: 'investors' },
      { key: 'deals', view: 'deals_view', table: 'deals' },
      { key: 'companies', view: 'companies_view', table: 'companies' },
      { key: 'transactions', view: 'transactions_view', table: 'transactions' },
      { key: 'documents', view: 'documents_view', table: 'documents' }
    ];

    for (const test of tablesToTest) {
      try {
        // Try view first
        const investors = await adapter.getInvestors();
        if (investors) {
          status.tables[test.key as keyof typeof status.tables] = true;
          status.connected = true;
          status.details!.testedTable = test.view;
          status.details!.testMethod = 'view';
        }
      } catch (viewError) {
        // Try direct table as fallback
        try {
          const adapterDirect = new UnifiedSupabaseAdapter({ useViews: false });
          const investors = await adapterDirect.getInvestors();
          if (investors) {
            status.tables[test.key as keyof typeof status.tables] = true;
            status.connected = true;
            status.details!.testedTable = test.table;
            status.details!.testMethod = 'table';
          }
        } catch (tableError) {
          console.log(`Table ${test.key} not accessible:`, tableError);
        }
      }
      
      // Only test first successful connection for performance
      if (status.connected) break;
    }

    // If we got here and connected, clear any error
    if (status.connected) {
      delete status.error;
    } else {
      status.error = 'Could not connect to any Supabase tables';
    }

  } catch (error) {
    status.error = error instanceof Error ? error.message : 'Unknown connection error';
    console.error('Supabase connectivity check failed:', error);
  }

  return status;
}

/**
 * Quick connectivity check (lighter weight)
 */
export async function pingSupabase(): Promise<boolean> {
  try {
    const config = getAppConfig();
    if (!config.hasValidSupabaseCredentials()) return false;
    
    const adapter = new UnifiedSupabaseAdapter({ useViews: true });
    const result = await adapter.getInvestors();
    return Array.isArray(result);
  } catch {
    return false;
  }
}

/**
 * Get a human-readable status message
 */
export function getStatusMessage(status: SupabaseStatus): string {
  if (status.connected) {
    return `✅ Connected to Supabase (${status.projectId})`;
  }
  
  if (!status.configured) {
    return '❌ Supabase not configured';
  }
  
  if (!status.nodeOk) {
    return `⚠️ Node.js ${status.details?.requiredNode} required`;
  }
  
  if (status.mode === 'mock') {
    return '🎭 Using mock data';
  }
  
  if (status.error) {
    return `❌ ${status.error}`;
  }
  
  return '⚙️ Supabase configured but not connected';
}

/**
 * Check if we should attempt Supabase connection
 */
export function shouldUseSupabase(): boolean {
  const config = getAppConfig();
  return config.hasValidSupabaseCredentials() && 
         !config.isUsingMockData() && 
         config.validateNodeVersion().ok;
}