import { NextRequest, NextResponse } from 'next/server';
import { mcpBridge } from '@/lib/services/mcp-bridge.service';

/**
 * GET /api/mcp/migrations
 * Get migration status
 */
export async function GET() {
  try {
    const migrations = await mcpBridge.getMigrationStatus();

    return NextResponse.json({
      success: true,
      data: migrations,
      count: migrations.length,
    });
  } catch (error) {
    console.error('MCP migrations error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get migrations',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/mcp/migrations
 * Apply a new migration
 * 
 * Body: { version: string, name: string, query: string }
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

    const migration = await request.json();

    if (!migration.version || !migration.name || !migration.query) {
      return NextResponse.json(
        { success: false, error: 'Version, name, and query are required' },
        { status: 400 }
      );
    }

    const result = await mcpBridge.applyMigration(migration);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Migration ${migration.version} applied successfully`,
    });
  } catch (error) {
    console.error('MCP migration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Migration failed',
      },
      { status: 500 }
    );
  }
}