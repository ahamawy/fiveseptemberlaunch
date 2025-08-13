/**
 * Schema Registry
 * Central registry of all 40+ tables and their relationships
 * Based on the complete Equitie database schema
 */

import { 
  CoreTables, 
  TransactionTables, 
  AnalyticsTables, 
  DocumentTables,
  AuditTables,
  EnrichmentTables,
  SupportTables 
} from '../schema/tables';
import { TableRelationships } from '../schema/relationships';
import { DatabaseEnums } from '../schema/enums';

export interface TableDefinition {
  name: string;
  schema: string;
  columns: Record<string, string>;
  primaryKey: string;
  foreignKeys?: Array<{
    column: string;
    references: string;
    onDelete?: string;
    onUpdate?: string;
  }>;
  indexes?: Array<{
    name: string;
    columns: string[];
    unique?: boolean;
  }>;
  constraints?: Array<{
    name: string;
    check: string;
  }>;
}

export class SchemaRegistry {
  private tables: Map<string, TableDefinition>;
  private relationships: Map<string, any[]>;
  private enums: Map<string, string[]>;

  constructor() {
    this.tables = new Map();
    this.relationships = new Map();
    this.enums = new Map();
    this.registerAllTables();
    this.registerRelationships();
    this.registerEnums();
  }

  /**
   * Register all tables from the schema
   */
  private registerAllTables(): void {
    // Register core tables
    Object.entries(CoreTables).forEach(([name, definition]) => {
      this.tables.set(name, definition as TableDefinition);
    });

    // Register transaction tables
    Object.entries(TransactionTables).forEach(([name, definition]) => {
      this.tables.set(name, definition as TableDefinition);
    });

    // Register analytics tables
    Object.entries(AnalyticsTables).forEach(([name, definition]) => {
      this.tables.set(name, definition as TableDefinition);
    });

    // Register document tables
    Object.entries(DocumentTables).forEach(([name, definition]) => {
      this.tables.set(name, definition as TableDefinition);
    });

    // Register audit tables
    Object.entries(AuditTables).forEach(([name, definition]) => {
      this.tables.set(name, definition as TableDefinition);
    });

    // Register enrichment tables
    Object.entries(EnrichmentTables).forEach(([name, definition]) => {
      this.tables.set(name, definition as TableDefinition);
    });

    // Register support tables
    Object.entries(SupportTables).forEach(([name, definition]) => {
      this.tables.set(name, definition as TableDefinition);
    });
  }

  /**
   * Register all table relationships
   */
  private registerRelationships(): void {
    Object.entries(TableRelationships).forEach(([table, relations]) => {
      this.relationships.set(table, relations);
    });
  }

  /**
   * Register all database enums
   */
  private registerEnums(): void {
    Object.entries(DatabaseEnums).forEach(([name, values]) => {
      this.enums.set(name, values);
    });
  }

  /**
   * Get a table definition
   */
  getTable(tableName: string): TableDefinition | undefined {
    return this.tables.get(tableName);
  }

  /**
   * Get all table names
   */
  getTableNames(): string[] {
    return Array.from(this.tables.keys());
  }

  /**
   * Get tables by schema
   */
  getTablesBySchema(schemaName: string): TableDefinition[] {
    return Array.from(this.tables.values()).filter(
      table => table.schema === schemaName
    );
  }

  /**
   * Get relationships for a table
   */
  getRelationships(tableName: string): any[] {
    return this.relationships.get(tableName) || [];
  }

  /**
   * Get enum values
   */
  getEnum(enumName: string): string[] | undefined {
    return this.enums.get(enumName);
  }

  /**
   * Get all enums
   */
  getAllEnums(): Map<string, string[]> {
    return this.enums;
  }

  /**
   * Validate if a table exists
   */
  hasTable(tableName: string): boolean {
    return this.tables.has(tableName);
  }

  /**
   * Get foreign key relationships
   */
  getForeignKeys(tableName: string): any[] {
    const table = this.getTable(tableName);
    return table?.foreignKeys || [];
  }

  /**
   * Get tables that reference a given table
   */
  getReferencingTables(tableName: string): string[] {
    const referencingTables: string[] = [];
    
    this.tables.forEach((table, name) => {
      if (table.foreignKeys) {
        const references = table.foreignKeys.some(
          fk => fk.references.startsWith(tableName)
        );
        if (references) {
          referencingTables.push(name);
        }
      }
    });
    
    return referencingTables;
  }

  /**
   * Generate TypeScript types from schema
   */
  generateTypeScript(): string {
    let output = `/**
 * Auto-generated TypeScript types from schema registry
 * Generated at: ${new Date().toISOString()}
 */

`;

    // Generate enum types
    this.enums.forEach((values, name) => {
      const typeName = this.toPascalCase(name);
      output += `export type ${typeName} = ${values.map(v => `'${v}'`).join(' | ')};\n\n`;
    });

    // Generate table interfaces
    this.tables.forEach((table, tableName) => {
      const interfaceName = this.toInterfaceName(tableName);
      output += `export interface ${interfaceName} {\n`;
      
      Object.entries(table.columns).forEach(([column, type]) => {
        const tsType = this.sqlToTypeScript(type);
        const isOptional = type.includes('DEFAULT') || !type.includes('NOT NULL');
        output += `  ${column}${isOptional ? '?' : ''}: ${tsType};\n`;
      });
      
      output += `}\n\n`;
    });

    // Generate database type
    output += `export interface Database {\n`;
    output += `  public: {\n`;
    output += `    Tables: {\n`;
    
    this.tables.forEach((_, tableName) => {
      const interfaceName = this.toInterfaceName(tableName);
      const simpleTableName = tableName.split('.').pop() || tableName;
      output += `      '${simpleTableName}': { Row: ${interfaceName} };\n`;
    });
    
    output += `    };\n`;
    output += `    Enums: {\n`;
    
    this.enums.forEach((_, name) => {
      const typeName = this.toPascalCase(name);
      output += `      '${name}': ${typeName};\n`;
    });
    
    output += `    };\n`;
    output += `  };\n`;
    output += `}\n`;

    return output;
  }

  /**
   * Convert SQL type to TypeScript type
   */
  private sqlToTypeScript(sqlType: string): string {
    const type = sqlType.toLowerCase();
    
    if (type.includes('varchar') || type.includes('text') || type.includes('character')) {
      return 'string';
    }
    if (type.includes('int') || type.includes('serial')) {
      return 'number';
    }
    if (type.includes('numeric') || type.includes('decimal') || type.includes('float')) {
      return 'number';
    }
    if (type.includes('boolean') || type.includes('bool')) {
      return 'boolean';
    }
    if (type.includes('timestamp') || type.includes('date')) {
      return 'string'; // or Date
    }
    if (type.includes('uuid')) {
      return 'string';
    }
    if (type.includes('json')) {
      return 'any'; // or specific type
    }
    if (type.includes('array')) {
      return 'string[]'; // simplified
    }
    if (type.includes('inet')) {
      return 'string';
    }
    if (type.includes('interval')) {
      return 'string';
    }
    
    // Check for enum references
    const enumMatch = type.match(/references\s+(\w+)/);
    if (enumMatch) {
      return this.toPascalCase(enumMatch[1]);
    }
    
    return 'any';
  }

  /**
   * Convert to PascalCase
   */
  private toPascalCase(str: string): string {
    return str
      .split(/[_\-\.]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  /**
   * Convert table name to interface name
   */
  private toInterfaceName(tableName: string): string {
    // Handle schema.table format
    const parts = tableName.split('.');
    const cleanName = parts[parts.length - 1];
    return this.toPascalCase(cleanName);
  }

  /**
   * Get schema statistics
   */
  getStatistics() {
    return {
      totalTables: this.tables.size,
      totalRelationships: Array.from(this.relationships.values()).flat().length,
      totalEnums: this.enums.size,
      schemas: [...new Set(Array.from(this.tables.values()).map(t => t.schema))],
      tablesPerSchema: this.getTablesPerSchema()
    };
  }

  /**
   * Get table count per schema
   */
  private getTablesPerSchema(): Record<string, number> {
    const counts: Record<string, number> = {};
    
    this.tables.forEach(table => {
      counts[table.schema] = (counts[table.schema] || 0) + 1;
    });
    
    return counts;
  }
}