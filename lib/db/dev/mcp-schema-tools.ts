/**
 * MCP Schema Tools
 * Development-only tools using MCP for schema management
 * Only used when MCP tools are available in development
 */

import { SchemaConfig } from '../schema-manager/config';

export class MCPSchemaTools {
  private config: SchemaConfig;
  private projectId: string | undefined;

  constructor(config: SchemaConfig) {
    this.config = config;
    this.projectId = config.getSupabaseProjectId();
  }

  /**
   * Check if MCP tools are available
   */
  isAvailable(): boolean {
    // Check for MCP function availability
    return typeof (global as any).mcp__supabase__list_tables === 'function';
  }

  /**
   * Execute a query using MCP
   */
  async executeQuery<T = any>(query: string, params?: any): Promise<T> {
    if (!this.isAvailable()) {
      throw new Error('MCP tools not available');
    }

    if (!this.projectId) {
      throw new Error('Supabase project ID not configured');
    }

    try {
      const result = await (global as any).mcp__supabase__execute_sql({
        project_id: this.projectId,
        query,
        params
      });
      
      return result as T;
    } catch (error) {
      console.error('MCP query execution failed:', error);
      throw error;
    }
  }

  /**
   * Apply a migration using MCP
   */
  async applyMigration(name: string, sql: string): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('MCP tools not available');
    }

    if (!this.projectId) {
      throw new Error('Supabase project ID not configured');
    }

    try {
      console.log(`Applying migration: ${name}`);
      
      await (global as any).mcp__supabase__apply_migration({
        project_id: this.projectId,
        name,
        query: sql
      });
      
      console.log(`Migration ${name} applied successfully`);
    } catch (error) {
      console.error(`Failed to apply migration ${name}:`, error);
      throw error;
    }
  }

  /**
   * List all tables using MCP
   */
  async listTables(schemas: string[] = ['public']): Promise<any[]> {
    if (!this.isAvailable()) {
      throw new Error('MCP tools not available');
    }

    if (!this.projectId) {
      throw new Error('Supabase project ID not configured');
    }

    try {
      const result = await (global as any).mcp__supabase__list_tables({
        project_id: this.projectId,
        schemas
      });
      
      return result;
    } catch (error) {
      console.error('Failed to list tables:', error);
      throw error;
    }
  }

  /**
   * Generate TypeScript types using MCP
   */
  async generateTypes(): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('MCP tools not available');
    }

    if (!this.projectId) {
      throw new Error('Supabase project ID not configured');
    }

    try {
      console.log('Generating TypeScript types from database...');
      
      const types = await (global as any).mcp__supabase__generate_typescript_types({
        project_id: this.projectId
      });
      
      console.log('Types generated successfully');
      return types;
    } catch (error) {
      console.error('Failed to generate types:', error);
      throw error;
    }
  }

  /**
   * Get migrations list using MCP
   */
  async listMigrations(): Promise<any[]> {
    if (!this.isAvailable()) {
      throw new Error('MCP tools not available');
    }

    if (!this.projectId) {
      throw new Error('Supabase project ID not configured');
    }

    try {
      const result = await (global as any).mcp__supabase__list_migrations({
        project_id: this.projectId
      });
      
      return result;
    } catch (error) {
      console.error('Failed to list migrations:', error);
      throw error;
    }
  }

  /**
   * Get database extensions using MCP
   */
  async listExtensions(): Promise<any[]> {
    if (!this.isAvailable()) {
      throw new Error('MCP tools not available');
    }

    if (!this.projectId) {
      throw new Error('Supabase project ID not configured');
    }

    try {
      const result = await (global as any).mcp__supabase__list_extensions({
        project_id: this.projectId
      });
      
      return result;
    } catch (error) {
      console.error('Failed to list extensions:', error);
      throw error;
    }
  }

  /**
   * Create a development branch using MCP
   */
  async createBranch(name: string = 'develop'): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error('MCP tools not available');
    }

    if (!this.projectId) {
      throw new Error('Supabase project ID not configured');
    }

    try {
      console.log(`Creating development branch: ${name}`);
      
      // First get cost confirmation (required by MCP)
      const cost = await (global as any).mcp__supabase__get_cost({
        organization_id: process.env.SUPABASE_ORG_ID,
        type: 'branch'
      });
      
      const confirmId = await (global as any).mcp__supabase__confirm_cost({
        type: 'branch',
        recurrence: cost.recurrence,
        amount: cost.amount
      });
      
      const result = await (global as any).mcp__supabase__create_branch({
        project_id: this.projectId,
        name,
        confirm_cost_id: confirmId
      });
      
      console.log(`Branch ${name} created successfully`);
      return result;
    } catch (error) {
      console.error(`Failed to create branch ${name}:`, error);
      throw error;
    }
  }

  /**
   * Get project details using MCP
   */
  async getProjectDetails(): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error('MCP tools not available');
    }

    if (!this.projectId) {
      throw new Error('Supabase project ID not configured');
    }

    try {
      const result = await (global as any).mcp__supabase__get_project({
        id: this.projectId
      });
      
      return result;
    } catch (error) {
      console.error('Failed to get project details:', error);
      throw error;
    }
  }

  /**
   * Get logs for debugging using MCP
   */
  async getLogs(service: 'api' | 'postgres' | 'auth' | 'storage' | 'realtime'): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error('MCP tools not available');
    }

    if (!this.projectId) {
      throw new Error('Supabase project ID not configured');
    }

    try {
      const result = await (global as any).mcp__supabase__get_logs({
        project_id: this.projectId,
        service
      });
      
      return result;
    } catch (error) {
      console.error(`Failed to get ${service} logs:`, error);
      throw error;
    }
  }

  /**
   * Get security advisors using MCP
   */
  async getSecurityAdvisors(): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error('MCP tools not available');
    }

    if (!this.projectId) {
      throw new Error('Supabase project ID not configured');
    }

    try {
      const result = await (global as any).mcp__supabase__get_advisors({
        project_id: this.projectId,
        type: 'security'
      });
      
      return result;
    } catch (error) {
      console.error('Failed to get security advisors:', error);
      throw error;
    }
  }

  /**
   * Search documentation using MCP
   */
  async searchDocs(query: string): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error('MCP tools not available');
    }

    try {
      const graphqlQuery = `
        query SearchDocs {
          searchDocs(query: "${query}", limit: 5) {
            nodes {
              title
              href
              content
            }
            totalCount
          }
        }
      `;
      
      const result = await (global as any).mcp__supabase__search_docs({
        graphql_query: graphqlQuery
      });
      
      return result;
    } catch (error) {
      console.error('Failed to search docs:', error);
      throw error;
    }
  }
}