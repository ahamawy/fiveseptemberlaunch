import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/db/supabase/server-client';

// Test endpoints for Playwright tests
// These should only be available in test/development environments

export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;

  // Only allow in test environment
  if (process.env.NODE_ENV === 'production' && !process.env.ENABLE_TEST_ENDPOINTS) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const sb = getServiceClient();

    // Table counts endpoint
    if (pathname.includes('table-counts')) {
      const tables = searchParams.get('tables')?.split(',') || [];
      const counts: Record<string, number> = {};

      for (const table of tables) {
        const { count } = await sb.from(table).select('*', { count: 'exact', head: true });
        counts[table] = count || 0;
      }

      return NextResponse.json(counts);
    }

    // Transaction types distribution
    if (pathname.includes('transaction-types')) {
      const { data } = await sb
        .from('transactions_clean')
        .select('transaction_type');

      const types: Record<string, number> = {
        primary: 0,
        secondary: 0,
        advisory: 0,
        subnominee: 0
      };

      data?.forEach((row: any) => {
        if (types[row.transaction_type] !== undefined) {
          types[row.transaction_type]++;
        }
      });

      return NextResponse.json(types);
    }

    // Check duplicates
    if (pathname.includes('check-duplicates')) {
      const table = searchParams.get('table');
      const column = searchParams.get('column');

      if (!table || !column) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
      }

      const { data } = await sb.from(table).select(column);
      const values = data?.map((row: any) => row[column]) || [];
      const uniqueValues = new Set(values);

      return NextResponse.json({
        hasDuplicates: values.length !== uniqueValues.size,
        duplicateCount: values.length - uniqueValues.size
      });
    }

    // Check orphaned records
    if (pathname.includes('orphaned-records')) {
      const table = searchParams.get('table');
      const column = searchParams.get('column');
      const reference = searchParams.get('reference');

      if (!table || !column || !reference) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
      }

      // This would check for orphaned foreign keys
      const { data: orphaned } = await sb.rpc('check_orphaned_records', {
        source_table: table,
        source_column: column,
        reference_table: reference
      });

      return NextResponse.json({
        orphanedCount: orphaned?.length || 0,
        orphanedIds: orphaned || []
      });
    }

    // Database statistics
    if (pathname.includes('db-stats')) {
      const { data: stats } = await sb.rpc('get_database_stats');

      return NextResponse.json({
        tableCount: stats?.table_count || 0,
        indexCount: stats?.index_count || 0,
        connectionCount: stats?.connection_count || 0,
        cacheHitRate: stats?.cache_hit_rate || 0
      });
    }

    // Query metrics
    if (pathname.includes('query-metrics')) {
      const minExecutionTime = parseInt(searchParams.get('minExecutionTime') || '0');

      const { data, count } = await sb
        .from('query_metrics')
        .select('*', { count: 'exact' })
        .gte('execution_time', minExecutionTime)
        .order('execution_time', { ascending: false })
        .limit(100);

      return NextResponse.json({
        slowQueries: count || 0,
        queries: data || []
      });
    }

    // Performance alerts
    if (pathname.includes('performance-alerts')) {
      const severity = searchParams.get('severity');
      const limit = parseInt(searchParams.get('limit') || '10');

      let query = sb.from('performance_alerts').select('*');
      
      if (severity) {
        query = query.eq('severity', severity);
      }

      const { data } = await query
        .order('timestamp', { ascending: false })
        .limit(limit);

      return NextResponse.json({
        alerts: data || []
      });
    }

    // Audit logs
    if (pathname.includes('audit-logs')) {
      // Check user permission
      const userRole = request.headers.get('X-Test-Role');
      
      if (userRole !== 'admin' && userRole !== 'auditor') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const action = searchParams.get('action');
      const entityType = searchParams.get('entityType');
      const entityId = searchParams.get('entityId');
      const limit = parseInt(searchParams.get('limit') || '10');

      let query = sb.from('audit_logs').select('*');

      if (action) query = query.eq('action', action);
      if (entityType) query = query.eq('entity_type', entityType);
      if (entityId) query = query.eq('entity_id', entityId);

      const { data } = await query
        .order('timestamp', { ascending: false })
        .limit(limit);

      return NextResponse.json({
        logs: data || []
      });
    }

    // Default response
    return NextResponse.json({ 
      message: 'Test API endpoint',
      available: [
        '/api/test/table-counts',
        '/api/test/transaction-types',
        '/api/test/check-duplicates',
        '/api/test/orphaned-records',
        '/api/test/db-stats',
        '/api/test/query-metrics',
        '/api/test/performance-alerts',
        '/api/test/audit-logs'
      ]
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Only allow in test environment
  if (process.env.NODE_ENV === 'production' && !process.env.ENABLE_TEST_ENDPOINTS) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const sb = getServiceClient();
    const body = await request.json();

    // Query execution
    if (pathname.includes('query')) {
      const { table, select = '*', where, orderBy, limit } = body;

      let query = sb.from(table).select(select);

      if (where) {
        // Parse where clause (simplified for testing)
        query = query.match(where);
      }

      if (orderBy) {
        const [column, direction] = orderBy.split(' ');
        query = query.order(column, { ascending: direction !== 'DESC' });
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ rows: data });
    }

    // Explain query plan
    if (pathname.includes('explain')) {
      const { query: sql } = body;

      const { data, error } = await sb.rpc('explain_query', { query_text: sql });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ plan: data });
    }

    // Check constraints
    if (pathname.includes('constraints')) {
      const { table, column, type } = body;

      const { data } = await sb.rpc('get_constraints', {
        table_name: table,
        column_name: column,
        constraint_type: type
      });

      return NextResponse.json({ constraints: data || [] });
    }

    // Simulate issue
    if (pathname.includes('simulate-issue')) {
      const { type, severity, executionTime } = body;

      // Log to performance_alerts table
      await sb.from('performance_alerts').insert({
        alert_type: type,
        severity,
        message: `Simulated ${type} issue`,
        details: { execution_time: executionTime },
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown endpoint' }, { status: 404 });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}