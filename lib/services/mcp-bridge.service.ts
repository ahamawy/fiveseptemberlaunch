/**
 * MCP Bridge Service
 * 
 * Exposes MCP tools as TypeScript-typed service methods
 * Enables programmatic access to MCP capabilities from the application
 */

import { createClient } from '@supabase/supabase-js';

export interface MCPQueryResult<T = any> {
  data: T[] | null;
  error: Error | null;
  rowCount?: number;
}

export interface MCPMigration {
  version: string;
  name: string;
  applied_at?: Date;
  query: string;
}

export interface MCPTableInfo {
  table_name: string;
  row_count: number;
  foreign_keys: Array<{
    column: string;
    references_table: string;
    references_column: string;
  }>;
}

class MCPBridgeService {
  private supabase: ReturnType<typeof createClient> | null = null;

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

    if (!url || !key) {
      console.warn('MCP Bridge: Missing Supabase credentials');
      return;
    }

    this.supabase = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  /**
   * Execute raw SQL query (equivalent to mcp__supabase__execute_sql)
   */
  async executeSQL<T = any>(query: string): Promise<MCPQueryResult<T>> {
    if (!this.supabase) {
      return {
        data: null,
        error: new Error('MCP Bridge not initialized'),
      };
    }

    try {
      const { data, error } = await this.supabase.rpc('exec_sql', {
        query_text: query,
      });

      if (error) throw error;

      return {
        data: data as T[],
        error: null,
        rowCount: Array.isArray(data) ? data.length : 0,
      };
    } catch (error) {
      // Fallback to direct query if RPC doesn't exist
      try {
        const { data, error: queryError } = await this.supabase
          .from('_sql_runner')
          .select('*')
          .limit(0); // Test connection

        if (queryError) {
          // If special table doesn't exist, we need to use the service client differently
          console.warn('Direct SQL execution not available, using service client');
        }

        // For now, return error - in production, you'd implement proper SQL execution
        return {
          data: null,
          error: error as Error,
        };
      } catch (fallbackError) {
        return {
          data: null,
          error: error as Error,
        };
      }
    }
  }

  /**
   * List all tables (equivalent to mcp__supabase__list_tables)
   */
  async listTables(schemas: string[] = ['public']): Promise<MCPTableInfo[]> {
    const schemaList = schemas.map(s => `'${s}'`).join(',');
    const query = `
      SELECT 
        t.table_name,
        COALESCE(
          (SELECT COUNT(*) 
           FROM information_schema.tables it 
           WHERE it.table_name = t.table_name 
           AND it.table_schema = t.table_schema), 
          0
        ) as estimated_rows
      FROM information_schema.tables t
      WHERE t.table_schema IN (${schemaList})
        AND t.table_type = 'BASE TABLE'
      ORDER BY t.table_name
    `;

    const result = await this.executeSQL<{ table_name: string; estimated_rows: number }>(query);
    
    if (result.error || !result.data) {
      console.error('Failed to list tables:', result.error);
      return [];
    }

    // For each table, get foreign key information
    const tablesWithInfo: MCPTableInfo[] = [];
    
    for (const table of result.data) {
      const fkQuery = `
        SELECT 
          kcu.column_name as column,
          ccu.table_name as references_table,
          ccu.column_name as references_column
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu
          ON tc.constraint_name = ccu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = '${table.table_name}'
          AND tc.table_schema IN (${schemaList})
      `;

      const fkResult = await this.executeSQL(fkQuery);
      
      tablesWithInfo.push({
        table_name: table.table_name,
        row_count: table.estimated_rows,
        foreign_keys: fkResult.data || [],
      });
    }

    return tablesWithInfo;
  }

  /**
   * Apply a migration (equivalent to mcp__supabase__apply_migration)
   */
  async applyMigration(migration: MCPMigration): Promise<{ success: boolean; error?: string }> {
    try {
      // First, check if migration tracking table exists
      const checkTableQuery = `
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          applied_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;
      
      await this.executeSQL(checkTableQuery);

      // Check if migration already applied
      const checkQuery = `
        SELECT version FROM schema_migrations WHERE version = '${migration.version}'
      `;
      
      const checkResult = await this.executeSQL(checkQuery);
      
      if (checkResult.data && checkResult.data.length > 0) {
        return {
          success: false,
          error: `Migration ${migration.version} already applied`,
        };
      }

      // Apply the migration
      const result = await this.executeSQL(migration.query);
      
      if (result.error) {
        return {
          success: false,
          error: result.error.message,
        };
      }

      // Record the migration
      const recordQuery = `
        INSERT INTO schema_migrations (version, name)
        VALUES ('${migration.version}', '${migration.name}')
      `;
      
      await this.executeSQL(recordQuery);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get migration status
   */
  async getMigrationStatus(): Promise<MCPMigration[]> {
    const query = `
      SELECT version, name, applied_at
      FROM schema_migrations
      ORDER BY version DESC
    `;

    const result = await this.executeSQL<MCPMigration>(query);
    return result.data || [];
  }

  /**
   * Get table row count
   */
  async getTableCount(tableName: string): Promise<number> {
    // Handle dot-named tables properly
    const escapedTable = tableName.includes('.') ? `"${tableName}"` : tableName;
    const query = `SELECT COUNT(*) as count FROM ${escapedTable}`;
    
    const result = await this.executeSQL<{ count: number }>(query);
    
    if (result.data && result.data.length > 0) {
      return result.data[0].count;
    }
    
    return 0;
  }

  /**
   * Verify database connection
   */
  async verifyConnection(): Promise<{
    connected: boolean;
    database?: string;
    user?: string;
    version?: string;
  }> {
    const query = `
      SELECT 
        current_database() as database,
        current_user as user,
        version() as version
    `;

    const result = await this.executeSQL(query);
    
    if (result.error || !result.data) {
      return { connected: false };
    }

    return {
      connected: true,
      ...result.data[0],
    };
  }

  /**
   * Get foreign key relationships for a table
   */
  async getTableRelationships(tableName: string): Promise<{
    incoming: Array<{ table: string; column: string }>;
    outgoing: Array<{ table: string; column: string }>;
  }> {
    // Handle dot-named tables
    const escapedTable = tableName.includes('.') ? tableName : tableName;

    // Get incoming foreign keys (tables that reference this table)
    const incomingQuery = `
      SELECT DISTINCT
        tc.table_name as table,
        kcu.column_name as column
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND ccu.table_name = '${escapedTable}'
        AND tc.table_schema = 'public'
    `;

    // Get outgoing foreign keys (tables this table references)
    const outgoingQuery = `
      SELECT DISTINCT
        ccu.table_name as table,
        kcu.column_name as column
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = '${escapedTable}'
        AND tc.table_schema = 'public'
    `;

    const [incoming, outgoing] = await Promise.all([
      this.executeSQL(incomingQuery),
      this.executeSQL(outgoingQuery),
    ]);

    return {
      incoming: incoming.data || [],
      outgoing: outgoing.data || [],
    };
  }

  /**
   * Test dot-named table access
   */
  async testDotNamedTables(): Promise<{
    'investors.investor': number;
    'deals.deal': number;
    'companies.company': number;
    'transactions.transaction.primary': number;
    'transactions.transaction.secondary': number;
  }> {
    const tables = [
      'investors.investor',
      'deals.deal',
      'companies.company',
      'transactions.transaction.primary',
      'transactions.transaction.secondary',
    ];

    const counts: any = {};

    for (const table of tables) {
      counts[table] = await this.getTableCount(table);
    }

    return counts;
  }
}

// Export singleton instance
export const mcpBridge = new MCPBridgeService();

// Export types
export type { MCPBridgeService };