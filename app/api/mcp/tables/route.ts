import { NextRequest, NextResponse } from 'next/server';
import { mcpBridge } from '@/lib/services/mcp-bridge.service';

/**
 * GET /api/mcp/tables
 * List all database tables with metadata
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schemas = searchParams.get('schemas')?.split(',') || ['public'];

    const tables = await mcpBridge.listTables(schemas);

    return NextResponse.json({
      success: true,
      data: tables,
      count: tables.length,
    });
  } catch (error) {
    console.error('MCP tables error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list tables',
      },
      { status: 500 }
    );
  }
}