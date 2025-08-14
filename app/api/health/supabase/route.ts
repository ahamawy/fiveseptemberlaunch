import { NextResponse } from 'next/server';
import { getSupabaseConnectivity, getStatusMessage } from '@/lib/db/supabase/status';
import { config } from '@/lib/config';

export async function GET() {
  try {
    // Get comprehensive status
    const status = await getSupabaseConnectivity();
    const diagnostics = config.getDiagnostics();
    
    // Build response with all details
    const response = {
      status: status.connected ? 'connected' : status.configured ? 'configured' : 'not_configured',
      message: getStatusMessage(status),
      timestamp: new Date().toISOString(),
      
      // Connection details
      connection: {
        configured: status.configured,
        connected: status.connected,
        mode: status.mode,
        nodeOk: status.nodeOk,
        error: status.error
      },
      
      // Project information
      project: {
        id: status.projectId,
        name: status.projectName,
        url: status.details?.url
      },
      
      // Table accessibility
      tables: status.tables,
      
      // Environment details
      environment: {
        nodeVersion: status.details?.nodeVersion,
        requiredNode: status.details?.requiredNode,
        dataMode: diagnostics.environment.dataSource,
        isDevelopment: diagnostics.environment.mode === 'development'
      },
      
      // Configuration flags
      flags: {
        mockDataEnabled: diagnostics.features.mockData,
        supabaseEnabled: diagnostics.supabase.enabled,
        mcpEnabled: diagnostics.features.mcp,
        devToolsEnabled: diagnostics.features.devTools
      },
      
      // Test details (if connected)
      testDetails: status.connected ? {
        testedTable: status.details?.testedTable,
        testMethod: status.details?.testMethod
      } : null
    };
    
    // Always return 200 with diagnostic info
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Supabase health check error:', error);
    
    // Even on error, return diagnostic info
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      connection: {
        configured: false,
        connected: false,
        mode: 'unknown',
        nodeOk: false
      }
    });
  }
}