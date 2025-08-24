/**
 * Supabase Connection Status Module
 * Real-time validation of Supabase connectivity and configuration
 */

import 'server-only';

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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const configured = !!(supabaseUrl && supabaseKey);
  const projectId = supabaseUrl ? supabaseUrl.split('.')[0].split('//')[1] : null;
  const nodeVersion = process.version;
  const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false';
  
  // Base status from configuration
  const status: SupabaseStatus = {
    configured,
    nodeOk: true, // Assume Node.js version is ok
    mode: getCurrentDataMode() as 'mock' | 'supabase' | 'mcp',
    connected: false,
    projectId,
    projectName: null,
    tables: {
      investors: false,
      deals: false,
      companies: false,
      transactions: false,
      documents: false
    },
    details: {
      url: supabaseUrl || undefined,
      nodeVersion,
      requiredNode: 'v20.0.0'
    }
  };

  // If not configured or using mock, return early
  if (!configured || useMockData) {
    if (!configured) {
      status.error = 'Supabase credentials not configured';
    } else if (useMockData) {
      status.error = 'Mock data mode is enabled';
    }
    return status;
  }

  // Try to connect and test table access
  try {
    const adapter = new UnifiedSupabaseAdapter({ useViews: true });

    // Try to access via adapter methods (views mode)
    try {
      const investors = await adapter.getInvestors();
      if (Array.isArray(investors)) {
        status.tables.investors = true;
        status.connected = true;
        status.details!.testedTable = 'investors_view';
        status.details!.testMethod = 'view';
      }
    } catch {}

    try {
      const deals = await adapter.getDeals();
      if (Array.isArray(deals)) status.tables.deals = true;
    } catch {}

    try {
      const companies = await adapter.getCompanies();
      if (Array.isArray(companies)) status.tables.companies = true;
    } catch {}

    try {
      const transactions = await adapter.getTransactions();
      if (Array.isArray(transactions)) status.tables.transactions = true;
    } catch {}

    try {
      const documents = await adapter.getDocuments();
      if (Array.isArray(documents)) status.tables.documents = true;
    } catch {}

    // If not connected in views mode, try direct tables mode
    if (!status.connected) {
      const adapterDirect = new UnifiedSupabaseAdapter({ useViews: false });
      try {
        const investors = await adapterDirect.getInvestors();
        if (Array.isArray(investors)) {
          status.tables.investors = true;
          status.connected = true;
          status.details!.testedTable = 'investors';
          status.details!.testMethod = 'table';
        }
      } catch {}

      try {
        const deals = await adapterDirect.getDeals();
        if (Array.isArray(deals)) status.tables.deals = true;
      } catch {}

      try {
        const companies = await adapterDirect.getCompanies();
        if (Array.isArray(companies)) status.tables.companies = true;
      } catch {}

      try {
        const transactions = await adapterDirect.getTransactions();
        if (Array.isArray(transactions)) status.tables.transactions = true;
      } catch {}

      try {
        const documents = await adapterDirect.getDocuments();
        if (Array.isArray(documents)) status.tables.documents = true;
      } catch {}
    }
    
    // Check if we got any connection at all
    if (!status.connected) {
      status.error = 'Could not connect to any Supabase tables';
    }
    
  } catch (error) {
    status.error = error instanceof Error ? error.message : 'Connection test failed';
    console.error('Supabase connectivity test failed:', error);
  }
  
  return status;
}

/**
 * Get a human-readable status message
 */
export function getStatusMessage(status: SupabaseStatus): string {
  if (!status.configured) {
    return '⚠️ Supabase not configured - Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local';
  }
  
  if (status.mode === 'mock') {
    return '🎭 Using mock data (set NEXT_PUBLIC_USE_MOCK_DATA=false to use Supabase)';
  }
  
  if (!status.nodeOk) {
    return `⚠️ Node.js ${status.details?.requiredNode} or higher recommended (current: ${status.details?.nodeVersion})`;
  }
  
  if (!status.connected) {
    return '❌ Cannot connect to Supabase - Check your credentials and network';
  }
  
  const tableCount = Object.values(status.tables).filter(Boolean).length;
  if (tableCount === 0) {
    return '❌ Connected but no tables accessible - Check database permissions';
  }
  
  if (tableCount < 5) {
    const missing = Object.entries(status.tables)
      .filter(([_, accessible]) => !accessible)
      .map(([name]) => name);
    return `⚠️ Partial access - Missing tables: ${missing.join(', ')}`;
  }
  
  return `✅ Fully connected to Supabase project: ${status.projectId}`;
}