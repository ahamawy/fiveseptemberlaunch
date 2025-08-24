import { NextRequest, NextResponse } from 'next/server';
import { mcpBridge } from '@/lib/services/mcp-bridge.service';

/**
 * POST /api/mcp/query
 * Execute raw SQL query through MCP bridge
 * 
 * Body: { query: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Check for admin authorization
    const authHeader = request.headers.get('authorization');
    const adminKey = process.env.ADMIN_API_KEY;

    if (adminKey && authHeader !== `Bearer ${adminKey}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }

    // Prevent destructive operations without explicit admin permission
    const lowerQuery = query.toLowerCase().trim();
    const isDangerous = 
      lowerQuery.startsWith('drop') ||
      lowerQuery.startsWith('truncate') ||
      lowerQuery.startsWith('delete') && !lowerQuery.includes('where');

    if (isDangerous && !authHeader?.includes('confirm-dangerous')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dangerous operation detected. Add "confirm-dangerous" to authorization header to proceed.',
        },
        { status: 403 }
      );
    }

    const result = await mcpBridge.executeSQL(query);

    if (result.error) {
      return NextResponse.json(
        {
          success: false,
          error: result.error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      rowCount: result.rowCount,
    });
  } catch (error) {
    console.error('MCP query error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Query execution failed',
      },
      { status: 500 }
    );
  }
}