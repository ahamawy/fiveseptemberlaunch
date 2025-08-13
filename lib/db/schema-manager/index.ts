/**
 * Schema Manager
 * Intelligent mode detection for development (MCP) vs production (Direct SQL)
 * Manages the complete 40+ table schema for Equitie platform
 */

import { SchemaRegistry } from './registry';
import { SchemaConfig } from './config';
import { MCPSchemaTools } from '../dev/mcp-schema-tools';
import { SupabaseDirectClient } from '../supabase/client';
import { MockAdapter } from '../mock-adapter';

export type SchemaMode = 'mcp' | 'direct' | 'mock';

export class SchemaManager {
  private mode: SchemaMode;
  private registry: SchemaRegistry;
  private config: SchemaConfig;
  private mcpTools?: MCPSchemaTools;
  private supabaseClient?: SupabaseDirectClient;
  private mockAdapter?: MockAdapter;

  constructor() {
    this.config = new SchemaConfig();
    this.registry = new SchemaRegistry();
    this.mode = this.detectMode();
    this.initializeAdapter();
  }

  /**
   * Detect the appropriate mode based on environment and available tools
   */
  private detectMode(): SchemaMode {
    // Development: Prefer MCP if available
    if (this.config.isDevelopment() && this.hasMCPTools()) {
      console.log('🔧 Schema Manager: Using MCP mode for development');
      return 'mcp';
    }

    // Production: Use direct SQL if credentials available
    if (this.config.hasSupabaseCredentials()) {
      console.log('⚡ Schema Manager: Using direct SQL mode for production');
      return 'direct';
    }

    // Fallback: Mock data
    console.log('🎭 Schema Manager: Using mock data mode');
    return 'mock';
  }

  /**
   * Check if MCP tools are available
   */
  private hasMCPTools(): boolean {
    // Check for MCP tools availability
    // This would be set by the MCP extension when available
    return typeof (global as any).mcp__supabase__list_tables === 'function';
  }

  /**
   * Initialize the appropriate adapter based on mode
   */
  private initializeAdapter(): void {
    switch (this.mode) {
      case 'mcp':
        this.mcpTools = new MCPSchemaTools(this.config);
        break;
      case 'direct':
        this.supabaseClient = new SupabaseDirectClient(this.config);
        break;
      case 'mock':
        this.mockAdapter = new MockAdapter();
        break;
    }
  }

  /**
   * Get the current mode
   */
  getMode(): SchemaMode {
    return this.mode;
  }

  /**
   * Get the schema registry
   */
  getRegistry(): SchemaRegistry {
    return this.registry;
  }

  /**
   * Execute a query based on current mode
   */
  async executeQuery<T = any>(query: string, params?: any): Promise<T> {
    switch (this.mode) {
      case 'mcp':
        if (!this.mcpTools) throw new Error('MCP tools not initialized');
        return await this.mcpTools.executeQuery<T>(query, params);
      
      case 'direct':
        if (!this.supabaseClient) throw new Error('Supabase client not initialized');
        return await this.supabaseClient.executeSQL<T>(query, params);
      
      case 'mock':
        if (!this.mockAdapter) throw new Error('Mock adapter not initialized');
        // Mock adapter doesn't execute SQL, return mock data
        console.warn('Mock mode: SQL query not executed', query);
        return {} as T;
      
      default:
        throw new Error(`Unknown mode: ${this.mode}`);
    }
  }

  /**
   * Get table schema definition
   */
  getTableSchema(tableName: string) {
    return this.registry.getTable(tableName);
  }

  /**
   * Get all table names
   */
  getTableNames(): string[] {
    return this.registry.getTableNames();
  }

  /**
   * Get relationships for a table
   */
  getTableRelationships(tableName: string) {
    return this.registry.getRelationships(tableName);
  }

  /**
   * Apply a migration (development only)
   */
  async applyMigration(name: string, sql: string): Promise<void> {
    if (this.mode === 'mcp' && this.mcpTools) {
      await this.mcpTools.applyMigration(name, sql);
    } else if (this.mode === 'direct' && this.supabaseClient) {
      // In production, migrations should be applied through proper CI/CD
      console.warn('Direct migration application should be done through CI/CD pipeline');
      // Optionally, could still allow it with proper safeguards
      await this.supabaseClient.executeSQL(sql);
    } else {
      console.log('Mock mode: Migration not applied', name);
    }
  }

  /**
   * Generate TypeScript types from schema
   */
  async generateTypes(): Promise<string> {
    if (this.mode === 'mcp' && this.mcpTools) {
      return await this.mcpTools.generateTypes();
    } else {
      // Generate from registry definitions
      return this.registry.generateTypeScript();
    }
  }

  /**
   * Validate data against schema
   */
  validateData(tableName: string, data: any): boolean {
    const schema = this.getTableSchema(tableName);
    if (!schema) {
      throw new Error(`Table ${tableName} not found in schema`);
    }
    
    // Basic validation - can be extended
    const requiredFields = Object.entries(schema.columns)
      .filter(([_, def]) => def.includes('NOT NULL') && !def.includes('DEFAULT'))
      .map(([name]) => name);
    
    for (const field of requiredFields) {
      if (!(field in data) || data[field] === null || data[field] === undefined) {
        console.error(`Missing required field: ${field} in table ${tableName}`);
        return false;
      }
    }
    
    return true;
  }

  /**
   * Get a client for the current mode
   */
  getClient() {
    switch (this.mode) {
      case 'mcp':
        return this.mcpTools;
      case 'direct':
        return this.supabaseClient;
      case 'mock':
        return this.mockAdapter;
      default:
        throw new Error(`No client available for mode: ${this.mode}`);
    }
  }

  /**
   * Reset the schema manager (useful for testing)
   */
  reset(): void {
    this.mode = this.detectMode();
    this.initializeAdapter();
  }
}

// Export singleton instance
export const schemaManager = new SchemaManager();

// Export types
export type { SchemaRegistry, SchemaConfig };