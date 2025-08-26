import { NextResponse } from 'next/server';
import { mcpBridge } from '@/lib/services/mcp-bridge.service';

/**
 * GET /api/mcp/status
 * Check MCP bridge and database connection status
 */
export async function GET() {
  try {
    const [connection, dotTables] = await Promise.all([
      mcpBridge.verifyConnection(),
      mcpBridge.testDotNamedTables(),
    ]);

    // Get relationships for investors_clean
    const relationships = await mcpBridge.getTableRelationships('investors_clean');

    return NextResponse.json({
      success: true,
      status: 'operational',
      connection,
      tables: {
        dotNamed: dotTables,
        relationships: {
          'investors_clean': relationships,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('MCP status error:', error);
    return NextResponse.json(
      {
        success: false,
        status: 'error',
        error: error instanceof Error ? error.message : 'Status check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}